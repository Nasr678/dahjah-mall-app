import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  sendPasswordResetEmail,
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
  setLogLevel,
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, Order, Address, UserProfile, CartItem, ExchangeRates, Category, Store, Brand, AppSettings, FooterConfig, Review, ReviewItem } from '../types';
import { PRODUCTS, CATEGORIES, STORES, DEFAULT_FOOTER_CONFIG } from '../data/mockData';
import { DEFAULT_EXCHANGE_RATES, getRegionFromCity } from './currencyService';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Services (per Firebase skill specification)
export const auth = getAuth(app);

// Suppress transient backend unreachable warnings from logging in dev console
try {
  setLogLevel('error');
} catch {}

// Initialize Firestore with persistent offline caching for ultra-fast performance on Android and web
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  try {
    firestoreInstance = initializeFirestore(
      app,
      {
        localCache: memoryLocalCache(),
        experimentalForceLongPolling: true,
        experimentalAutoDetectLongPolling: true,
      },
      firebaseConfig.firestoreDatabaseId
    );
  } catch {
    firestoreInstance = getFirestore(app);
  }
}

export const db = firestoreInstance;
export const storage = getStorage(app);

/**
 * Timeout wrapper for Firestore promises to avoid hanging UI during offline or slow backend connection
 */
export async function withFirestoreTimeout<T>(promise: Promise<T>, timeoutMs = 2500, fallbackValue: T): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallbackValue), timeoutMs);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch {
    clearTimeout(timer);
    return fallbackValue;
  }
}

// Validate Connection to Firestore (Firebase Skill standard)
async function testFirestoreConnection() {
  try {
    const { getDocFromServer } = await import('firebase/firestore');
    await withFirestoreTimeout(getDocFromServer(doc(db, 'test', 'connection')), 1500, null);
  } catch {
    // Graceful offline fallback
  }
}
if (typeof window !== 'undefined') {
  testFirestoreConnection();
}

// Check if Firebase is active
export const isFirebaseConfigured = Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Utility to identify offline, network-related, or closing/hidden Firestore errors
 */
export function isOfflineError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  const code = (error as any)?.code || '';
  return (
    msg.includes('offline') ||
    msg.includes('network-request-failed') ||
    msg.includes('backend didn\'t respond') ||
    msg.includes('could not reach cloud firestore') ||
    msg.includes('unavailable') ||
    msg.includes('closing') ||
    msg.includes('hidden') ||
    msg.includes('database is closing') ||
    msg.includes('database is closing/hidden') ||
    msg.includes('indexeddb') ||
    msg.includes('abort') ||
    code === 'unavailable' ||
    code === 'auth/network-request-failed' ||
    code === 'failed-precondition' ||
    code === 'cancelled'
  );
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  if (isOfflineError(error)) {
    return;
  }
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Info:', JSON.stringify(errInfo));
}
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as unknown as T;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Date) {
    return data.toISOString() as unknown as T;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      result[key] = sanitizeForFirestore(value);
    }
  }
  return result as T;
}

/**
 * Translates Firebase Auth error codes to clear Arabic messages
 */
export function translateAuthError(error: any): string {
  if (!error) return 'حدث خطأ غير متوقع أثناء عملية المصادقة. يرجى المحاولة مرة أخرى.';

  const code = (error?.code || '').toLowerCase();
  const rawMsg = error instanceof Error ? error.message : String(error?.message || error || '');
  const msg = rawMsg.toLowerCase();

  // Invalid Credentials / Password / User not found
  if (
    code === 'auth/user-not-found' || 
    code === 'auth/wrong-password' || 
    code === 'auth/invalid-credential' || 
    code === 'auth/invalid-login-credentials' ||
    msg.includes('invalid-credential') ||
    msg.includes('invalid-login-credentials') ||
    msg.includes('wrong-password') ||
    msg.includes('user-not-found')
  ) {
    return 'بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور أو إنشاء حساب جديد.';
  }

  // Email already in use
  if (code === 'auth/email-already-in-use' || msg.includes('email-already-in-use')) {
    return 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو النقر على "نسيت كلمة المرور".';
  }

  // Weak password
  if (code === 'auth/weak-password' || msg.includes('weak-password')) {
    return 'كلمة المرور ضعيفة. يجب أن تتكون من 6 خانات أو أكثر لحماية حسابك.';
  }

  // Invalid email format
  if (code === 'auth/invalid-email' || msg.includes('invalid-email')) {
    return 'صيغة البريد الإلكتروني غير صحيحة. يرجى كتابة بريد صالح مثل example@gmail.com.';
  }

  // Missing email or password
  if (code === 'auth/missing-email' || msg.includes('missing-email')) {
    return 'يرجى إدخال البريد الإلكتروني للمتابعة.';
  }
  if (code === 'auth/missing-password' || msg.includes('missing-password')) {
    return 'يرجى إدخال كلمة المرور.';
  }

  // Popup closed or cancelled
  if (
    code === 'auth/popup-closed-by-user' || 
    code === 'auth/cancelled-popup-request' ||
    msg.includes('popup-closed-by-user') ||
    msg.includes('cancelled-popup-request')
  ) {
    return 'تم إغلاق نافذة تسجيل الدخول قبل إكمال العملية.';
  }

  // Popup blocked
  if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
    return 'تم حظر النافذة المنبثقة من قبل المتصفح أو WebView. يرجى السماح بالنوافذ أو تسجيل الدخول بالبريد الإلكتروني مباشرة.';
  }

  // Disallowed User Agent (Android WebView Google OAuth restriction)
  if (code === 'auth/disallowed-useragent' || msg.includes('disallowed_useragent') || msg.includes('disallowed-useragent')) {
    return 'تسجيل الدخول عبر Google غير مدعوم في متصفح WebView الداخلي. يرجى تسجيل الدخول بالبريد الإلكتروني وكلمة المرور فوراً.';
  }

  // Account exists with different credential
  if (code === 'auth/account-exists-with-different-credential' || msg.includes('account-exists-with-different-credential')) {
    return 'يوجد حساب مسجل بالفعل بهذا البريد عبر مزود خدمة آخر. يرجى تسجيل الدخول بالبريد وكلمة المرور.';
  }

  // Network error
  if (code === 'auth/network-request-failed' || msg.includes('network-request-failed') || msg.includes('failed to fetch')) {
    return 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت ثم إعادة المحاولة.';
  }

  // Too many attempts / Rate limiting
  if (code === 'auth/too-many-requests' || msg.includes('too-many-requests')) {
    return 'تم حظر المحاولات مؤقتاً بسبب كثرة المحاولات. يرجى الانتظار دقيقة واحدة ثم المحاولة مجدداً.';
  }

  // User disabled
  if (code === 'auth/user-disabled' || msg.includes('user-disabled')) {
    return 'تم تعطيل هذا الحساب. يرجى التواصل مع خدمة عملاء ضَجّة مول.';
  }

  // Operation not allowed
  if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
    return 'طريقة تسجيل الدخول هذه غير مفعلة حالياً في خادم Firebase. يمكنك المتابعة بحساب Google أو البريد الإلكتروني فوراً.';
  }

  // Timeout
  if (code === 'auth/timeout' || msg.includes('timeout') || msg.includes('مهلة')) {
    return 'استغرقت عملية تسجيل الدخول وقتاً أطول من المتوقع. يرجى التأكد من اتصال الإنترنت ثم المحاولة مجدداً.';
  }

  // Unauthorized domain
  if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
    return 'نطاق التطبيق الحالي غير مضاف في قائمة النطاقات المصرح بها في إعدادات Firebase Auth.';
  }

  // Mask cryptic English Firebase SDK strings
  if (rawMsg.startsWith('Firebase:') || rawMsg.includes('auth/')) {
    return 'حدث خطأ أثناء عملية المصادقة. يرجى التحقق من صحة البيانات والمحاولة مرة أخرى.';
  }

  return rawMsg || 'حدث خطأ أثناء عملية المصادقة. يرجى التأكد من البيانات والمحاولة مرة أخرى.';
}

/**
 * ============================================================
 * 1. AUTHENTICATION SERVICES
 * ============================================================
 */

export const firebaseAuthService = {
  // Register with Email & Password
  async registerWithEmail(email: string, pass: string, name: string, phone: string, city: string): Promise<UserProfile> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;

    try {
      await updateProfile(firebaseUser, { displayName: name });
    } catch {}

    const region = getRegionFromCity(city || 'صنعاء');
    const isEmailAdmin = (email?.toLowerCase().trim() === 'nsralnaty93@gmail.com');
    const userProfile: UserProfile = {
      id: firebaseUser.uid,
      name: name || 'مستخدم ضَجّة مول',
      phone: phone || '',
      email: email,
      city: city || 'صنعاء',
      preferredRegion: region,
      preferredCurrency: region === 'south' ? 'YER_SOUTH' : 'YER_NORTH',
      walletBalanceYER: 10000,
      points: 200,
      memberTier: isEmailAdmin ? 'مالك التطبيق — Admin' : 'عضو فضي',
      role: isEmailAdmin ? 'admin' : 'customer',
      savedAddresses: [
        {
          id: `addr-${Date.now()}`,
          userId: firebaseUser.uid,
          title: 'المنزل',
          recipientName: name || 'مستخدم ضَجّة مول',
          phone: phone || '',
          city: city || 'صنعاء',
          district: 'وسط المدينة',
          street: 'الشارع العام',
          region: region,
          isDefault: true,
        }
      ],
      favoriteProductIds: [],
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore with timeout protection
    try {
      await withFirestoreTimeout(
        setDoc(doc(db, 'users', firebaseUser.uid), sanitizeForFirestore(userProfile)),
        3000,
        null
      );
    } catch {}

    return userProfile;
  },

  // Login with Email & Password
  async loginWithEmail(email: string, pass: string): Promise<UserProfile> {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;

    // Fetch or create user profile in Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    let snap: any = null;
    try {
      snap = await withFirestoreTimeout(getDoc(userDocRef), 3000, null);
    } catch {}

    const isEmailAdmin = (firebaseUser.email?.toLowerCase().trim() === 'nsralnaty93@gmail.com');

    if (snap && snap.exists()) {
      const data = snap.data() as UserProfile;
      if (isEmailAdmin && data.role !== 'admin') {
        data.role = 'admin';
        data.memberTier = 'مالك التطبيق — Admin';
        try {
          await withFirestoreTimeout(
            updateDoc(userDocRef, { role: 'admin', memberTier: 'مالك التطبيق — Admin' }),
            2000,
            null
          );
        } catch {}
      }
      return data;
    } else {
      const region = getRegionFromCity('صنعاء');
      const newProfile: UserProfile = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || (isEmailAdmin ? 'ناصر العناتي (المالك)' : 'مستخدم ضَجّة مول'),
        phone: firebaseUser.phoneNumber || '',
        email: firebaseUser.email || email,
        city: 'صنعاء',
        preferredRegion: region,
        preferredCurrency: 'YER_NORTH',
        walletBalanceYER: 10000,
        points: 200,
        memberTier: isEmailAdmin ? 'مالك التطبيق — Admin' : 'عضو فضي',
        role: isEmailAdmin ? 'admin' : 'customer',
        savedAddresses: [],
        favoriteProductIds: [],
        createdAt: new Date().toISOString(),
      };
      try {
        await withFirestoreTimeout(
          setDoc(userDocRef, sanitizeForFirestore(newProfile)),
          3000,
          null
        );
      } catch {}
      return newProfile;
    }
  },

  // Google Sign-In with Android WebView & Timeout protection
  async loginWithGoogle(): Promise<UserProfile> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    // Race against 25s timeout to prevent infinite hanging in Android WebView or slow popups
    let result: any;
    try {
      const popupPromise = signInWithPopup(auth, provider);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          const timeoutErr: any = new Error('انتهت مهلة تسجيل الدخول. يمكنك تسجيل الدخول بالبريد الإلكتروني وكلمة المرور.');
          timeoutErr.code = 'auth/timeout';
          reject(timeoutErr);
        }, 25000);
      });
      result = await Promise.race([popupPromise, timeoutPromise]);
    } catch (popupError: any) {
      const code = popupError?.code || '';
      if (code === 'auth/popup-blocked') {
        popupError.message = 'تم حظر النافذة المنبثقة من قبل المتصفح أو WebView. يرجى تسجيل الدخول بالبريد الإلكتروني وكلمة المرور مباشرة.';
      } else if (code === 'auth/disallowed-useragent') {
        popupError.message = 'بيئة WebView الحالية تمنع نافذة Google المنبثقة. يرجى تسجيل الدخول بالبريد الإلكتروني وكلمة المرور.';
      }
      throw popupError;
    }

    const fbUser = result.user;
    const userDocRef = doc(db, 'users', fbUser.uid);
    let snap: any = null;
    try {
      snap = await withFirestoreTimeout(getDoc(userDocRef), 3000, null);
    } catch {}

    const isEmailAdmin = (fbUser.email?.toLowerCase().trim() === 'nsralnaty93@gmail.com');

    if (snap && snap.exists()) {
      const existingData = snap.data() as UserProfile;
      // Update avatar or email if changed
      const updated: Partial<UserProfile> = {
        avatarUrl: fbUser.photoURL || existingData.avatarUrl,
        email: fbUser.email || existingData.email,
        name: fbUser.displayName || existingData.name,
        role: isEmailAdmin ? 'admin' : existingData.role,
        memberTier: isEmailAdmin ? 'مالك التطبيق — Admin' : existingData.memberTier,
      };
      try {
        await withFirestoreTimeout(updateDoc(userDocRef, sanitizeForFirestore(updated)), 2000, null);
      } catch {}
      return { ...existingData, ...updated };
    } else {
      const region = getRegionFromCity('صنعاء');
      const newProfile: UserProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || (isEmailAdmin ? 'ناصر العناتي (المالك)' : 'مستخدم Google'),
        phone: fbUser.phoneNumber || '',
        email: fbUser.email || '',
        avatarUrl: fbUser.photoURL || undefined,
        city: 'صنعاء',
        preferredRegion: region,
        preferredCurrency: 'YER_NORTH',
        walletBalanceYER: 10000,
        points: 200,
        memberTier: isEmailAdmin ? 'مالك التطبيق — Admin' : 'عضو فضي',
        role: isEmailAdmin ? 'admin' : 'customer',
        savedAddresses: [],
        favoriteProductIds: [],
        createdAt: new Date().toISOString(),
      };
      try {
        await withFirestoreTimeout(setDoc(userDocRef, sanitizeForFirestore(newProfile)), 3000, null);
      } catch {}
      return newProfile;
    }
  },

  // Facebook Sign-In
  async loginWithFacebook(): Promise<UserProfile> {
    const provider = new FacebookAuthProvider();
    let result: any;
    try {
      const popupPromise = signInWithPopup(auth, provider);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          const timeoutErr: any = new Error('انتهت مهلة تسجيل الدخول.');
          timeoutErr.code = 'auth/timeout';
          reject(timeoutErr);
        }, 25000);
      });
      result = await Promise.race([popupPromise, timeoutPromise]);
    } catch (popupError: any) {
      if (popupError?.code === 'auth/popup-blocked') {
        popupError.message = 'تم حظر النافذة المنبثقة في المتصفح. يمكنك تسجيل الدخول بالبريد الإلكتروني.';
      }
      throw popupError;
    }
    const fbUser = result.user;

    const userDocRef = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const existingData = snap.data() as UserProfile;
      const updated: Partial<UserProfile> = {
        avatarUrl: fbUser.photoURL || existingData.avatarUrl,
        email: fbUser.email || existingData.email,
      };
      await updateDoc(userDocRef, sanitizeForFirestore(updated));
      return { ...existingData, ...updated };
    } else {
      const region = getRegionFromCity('صنعاء');
      const isEmailAdmin = (fbUser.email?.toLowerCase().trim() === 'nsralnaty93@gmail.com');
      const newProfile: UserProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || 'مستخدم Facebook',
        phone: fbUser.phoneNumber || '',
        email: fbUser.email || '',
        avatarUrl: fbUser.photoURL || undefined,
        city: 'صنعاء',
        preferredRegion: region,
        preferredCurrency: 'YER_NORTH',
        walletBalanceYER: 10000,
        points: 200,
        memberTier: 'عضو فضي',
        role: isEmailAdmin ? 'admin' : 'customer',
        savedAddresses: [],
        favoriteProductIds: [],
        createdAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, sanitizeForFirestore(newProfile));
      return newProfile;
    }
  },

  // Quick phone / guest login sync
  async quickPhoneAuth(phone: string, name?: string, city?: string): Promise<UserProfile> {
    let firebaseUser: FirebaseUser | null = auth.currentUser;
    const cleanPhone = phone.startsWith('+967') ? phone : `+967 ${phone}`;
    const region = getRegionFromCity(city || 'صنعاء');
    const uid = firebaseUser?.uid || `user-${Date.now()}`;
    
    const userProfile: UserProfile = {
      id: uid,
      name: name || 'عميل ضَجّة مول',
      phone: cleanPhone,
      email: `${phone.replace(/\D/g, '')}@dajjahmall.ye`,
      city: city || 'صنعاء',
      preferredRegion: region,
      preferredCurrency: region === 'south' ? 'YER_SOUTH' : 'YER_NORTH',
      walletBalanceYER: 10000,
      points: 200,
      memberTier: 'عضو فضي',
      role: 'customer',
      savedAddresses: [],
      favoriteProductIds: [],
    };

    if (firebaseUser) {
      await setDoc(doc(db, 'users', firebaseUser.uid), sanitizeForFirestore(userProfile), { merge: true });
    }

    return userProfile;
  },

  // Send Password Reset Email
  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  // Logout
  async logout(): Promise<void> {
    await signOut(auth);
  },

  // Subscribe to Auth State
  onAuth(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
};

/**
 * ============================================================
 * 2. FIRESTORE PRODUCTS & CATALOG
 * ============================================================
 */

export const firestoreCatalogService = {
  // Fetch products from Firestore (with automatic initial seeding from mock catalog)
  async getProducts(): Promise<Product[]> {
    try {
      const querySnapshot = await withFirestoreTimeout(
        getDocs(collection(db, 'products')),
        2500,
        null
      );
      if (querySnapshot && !querySnapshot.empty) {
        const list: Product[] = [];
        querySnapshot.forEach((d) => {
          list.push(d.data() as Product);
        });
        return list;
      }

      // Seed mock products to Firestore if empty
      try {
        const batch = writeBatch(db);
        for (const prod of PRODUCTS) {
          const docRef = doc(db, 'products', prod.id);
          batch.set(docRef, {
            ...prod,
            createdAt: new Date().toISOString(),
          });
        }
        await batch.commit();
      } catch (seedErr) {
        if (!isOfflineError(seedErr)) {
          console.warn('Could not seed initial products to Firestore:', seedErr);
        }
      }
      return PRODUCTS;
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error fetching products from Firestore:', err);
      }
      return PRODUCTS;
    }
  },

  // Get categories
  async getCategories(): Promise<Category[]> {
    try {
      const querySnapshot = await withFirestoreTimeout(
        getDocs(collection(db, 'categories')),
        2500,
        null
      );
      if (querySnapshot && !querySnapshot.empty) {
        const list: Category[] = [];
        querySnapshot.forEach((d) => {
          list.push(d.data() as Category);
        });
        return list;
      }

      // Seed categories
      try {
        const batch = writeBatch(db);
        for (const cat of CATEGORIES) {
          const docRef = doc(db, 'categories', cat.id);
          batch.set(docRef, cat);
        }
        await batch.commit();
      } catch (seedErr) {
        if (!isOfflineError(seedErr)) {
          console.warn('Could not seed categories to Firestore:', seedErr);
        }
      }
      return CATEGORIES;
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error fetching categories from Firestore:', err);
      }
      return CATEGORIES;
    }
  },

  // Get Stores
  async getStores(): Promise<Store[]> {
    try {
      const querySnapshot = await withFirestoreTimeout(
        getDocs(collection(db, 'stores')),
        2500,
        null
      );
      if (querySnapshot && !querySnapshot.empty) {
        const list: Store[] = [];
        querySnapshot.forEach((d) => {
          list.push(d.data() as Store);
        });
        return list;
      }

      try {
        const batch = writeBatch(db);
        for (const s of STORES) {
          const docRef = doc(db, 'stores', s.id);
          batch.set(docRef, s);
        }
        await batch.commit();
      } catch (seedErr) {
        if (!isOfflineError(seedErr)) {
          console.warn('Could not seed stores to Firestore:', seedErr);
        }
      }
      return STORES;
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error fetching stores from Firestore:', err);
      }
      return STORES;
    }
  },

  // Add Product to Firestore
  async addProduct(product: Product): Promise<Product> {
    try {
      const docRef = doc(db, 'products', product.id);
      await setDoc(docRef, sanitizeForFirestore({
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error adding product to Firestore:', err);
      }
    }
    return product;
  },

  // Update Product in Firestore
  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, sanitizeForFirestore({
        ...updates,
        updatedAt: new Date().toISOString(),
      }));
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error updating product in Firestore:', err);
      }
    }
  },

  // Delete Product from Firestore
  async deleteProduct(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error deleting product from Firestore:', err);
      }
    }
  },

  // Update Stock in Firestore
  async updateProductStock(id: string, stock: number): Promise<void> {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        stock,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error updating stock in Firestore:', err);
      }
    }
  },

  // Real-time products listener
  subscribeToProducts(callback: (products: Product[]) => void): Unsubscribe {
    try {
      const q = collection(db, 'products');
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: Product[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as Product);
          });
          callback(list);
        }
      }, (error) => {
        if (!isOfflineError(error)) {
          console.warn('Products onSnapshot notification:', error);
        }
      });
    } catch (e) {
      if (!isOfflineError(e)) {
        console.warn('Could not attach products snapshot listener:', e);
      }
      return () => {};
    }
  },

  // Save / Update Category
  async saveCategory(category: Category): Promise<void> {
    try {
      const docRef = doc(db, 'categories', category.id);
      await setDoc(docRef, sanitizeForFirestore(category), { merge: true });
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error saving category to Firestore:', err);
      }
    }
  },

  // Delete Category
  async deleteCategory(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'categories', id);
      await deleteDoc(docRef);
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error deleting category from Firestore:', err);
      }
    }
  },

  // Real-time categories listener
  subscribeToCategories(callback: (categories: Category[]) => void): Unsubscribe {
    try {
      const q = collection(db, 'categories');
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: Category[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as Category);
          });
          callback(list);
        }
      }, (error) => {
        if (!isOfflineError(error)) {
          console.warn('Categories onSnapshot notification:', error);
        }
      });
    } catch (e) {
      if (!isOfflineError(e)) {
        console.warn('Could not attach categories snapshot listener:', e);
      }
      return () => {};
    }
  },

  // ============================================================
  // BRANDS MANAGEMENT (Independent Firestore Collection brands/{brandId})
  // ============================================================

  // Get Brands (Never auto-creates mock brands if empty)
  async getBrands(): Promise<Brand[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'brands'));
      if (!querySnapshot.empty) {
        const list: Brand[] = [];
        querySnapshot.forEach((d) => {
          list.push(d.data() as Brand);
        });
        return list;
      }
      return [];
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error fetching brands from Firestore:', err);
      }
      return [];
    }
  },

  // Save / Update Brand
  async saveBrand(brand: Brand): Promise<void> {
    try {
      const docRef = doc(db, 'brands', brand.id);
      await setDoc(docRef, sanitizeForFirestore({
        ...brand,
        updatedAt: new Date().toISOString(),
      }), { merge: true });
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error saving brand to Firestore:', err);
      }
      throw err;
    }
  },

  // Delete Brand
  async deleteBrand(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'brands', id);
      await deleteDoc(docRef);
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error deleting brand from Firestore:', err);
      }
      throw err;
    }
  },

  // Real-time brands listener
  subscribeToBrands(callback: (brands: Brand[]) => void): Unsubscribe {
    try {
      const q = collection(db, 'brands');
      return onSnapshot(q, (snapshot) => {
        const list: Brand[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Brand);
        });
        callback(list);
      }, (error) => {
        if (!isOfflineError(error)) {
          console.warn('Brands onSnapshot notification:', error);
        }
      });
    } catch (e) {
      if (!isOfflineError(e)) {
        console.warn('Could not attach brands snapshot listener:', e);
      }
      return () => {};
    }
  }
};

/**
 * Uploads a Brand image (logo or cover) to Firebase Storage with fallback
 */
export async function uploadBrandImage(file: File, type: 'logo' | 'cover' = 'logo'): Promise<string> {
  try {
    const maxWidth = type === 'cover' ? 1400 : 600;
    const compressedBlob = await compressImage(file, maxWidth, 0.85);
    const filename = `brands/${type}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
    const storageRef = ref(storage, filename);
    
    const snapshot = await uploadBytes(storageRef, compressedBlob, {
      contentType: 'image/jpeg',
    });
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (storageError) {
    console.warn(`Firebase Storage brand ${type} upload note (falling back to Data URL):`, storageError);
    const compressedBlob = await compressImage(file, type === 'cover' ? 900 : 400, 0.80);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(compressedBlob);
    });
  }
}

/**
 * Client-side lightweight image compression
 * Scales down large images and outputs optimized JPEG
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Uploads a product image to Firebase Storage with automatic fallback
 */
export async function uploadProductImage(file: File): Promise<string> {
  try {
    const compressedBlob = await compressImage(file, 1200, 0.82);
    const filename = `products/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
    const storageRef = ref(storage, filename);
    
    const snapshot = await uploadBytes(storageRef, compressedBlob, {
      contentType: 'image/jpeg',
    });
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (storageError) {
    console.warn('Firebase Storage direct upload note (falling back to optimized Data URL):', storageError);
    const compressedBlob = await compressImage(file, 900, 0.78);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(compressedBlob);
    });
  }
}

/**
 * ============================================================
 * 3. FIRESTORE USER DATA (Cart, Favorites, Addresses)
 * ============================================================
 */

export const firestoreUserService = {
  // Sync Cart
  async getCart(userId: string): Promise<CartItem[]> {
    try {
      const docRef = doc(db, 'carts', userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return data.items || [];
      }
      return [];
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error fetching cart from Firestore:', err);
      }
      return [];
    }
  },

  async saveCart(userId: string, items: CartItem[]): Promise<void> {
    try {
      const docRef = doc(db, 'carts', userId);
      await setDoc(docRef, sanitizeForFirestore({
        userId,
        items,
        updatedAt: new Date().toISOString(),
      }));
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error saving cart to Firestore:', err);
      }
    }
  },

  // Sync Favorites (Wishlist)
  async getFavorites(userId: string): Promise<string[]> {
    try {
      const docRef = doc(db, 'favorites', userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return data.productIds || [];
      }
      return [];
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error fetching favorites from Firestore:', err);
      }
      return [];
    }
  },

  async saveFavorites(userId: string, productIds: string[]): Promise<void> {
    try {
      const docRef = doc(db, 'favorites', userId);
      await setDoc(docRef, sanitizeForFirestore({
        userId,
        productIds,
        updatedAt: new Date().toISOString(),
      }));
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error saving favorites to Firestore:', err);
      }
    }
  },

  // Sync Addresses
  async getAddresses(userId: string): Promise<Address[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'users', userId, 'addresses'));
      const list: Address[] = [];
      querySnapshot.forEach((d) => {
        list.push(d.data() as Address);
      });
      return list;
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error fetching addresses from Firestore:', err);
      }
      return [];
    }
  },

  async saveAddress(userId: string, address: Address): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId, 'addresses', address.id);
      await setDoc(docRef, sanitizeForFirestore(address));
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error saving address to Firestore:', err);
      }
    }
  },

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId, 'addresses', addressId);
      await deleteDoc(docRef);
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error deleting address from Firestore:', err);
      }
    }
  }
};

/**
 * ============================================================
 * 4. FIRESTORE ORDERS
 * ============================================================
 */

export const firestoreOrderService = {
  // Create an order in Cloud Firestore with Atomic Stock Deductions via Firestore Transactions
  async createOrder(order: Order): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        // 1. Read product docs to check and decrement stock atomically
        for (const item of order.items) {
          if (item.product?.id) {
            const productRef = doc(db, 'products', item.product.id);
            try {
              const productDoc = await transaction.get(productRef);
              if (productDoc.exists()) {
                const currentStock = productDoc.data().stock ?? 10;
                const newStock = Math.max(0, currentStock - item.quantity);
                transaction.update(productRef, { stock: newStock });
              }
            } catch (pErr) {
              // Non-blocking if product doc is mock or in cache
            }
          }
        }

        // 2. Set the Order document
        const orderRef = doc(db, 'orders', order.id);
        const cleanOrderData = sanitizeForFirestore({
          ...order,
          createdAt: order.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        transaction.set(orderRef, cleanOrderData);
      });
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Transaction order creation notice (falling back to direct setDoc):', err);
      }
      // Fallback to standard setDoc for offline or permission variance
      try {
        const docRef = doc(db, 'orders', order.id);
        const cleanOrderData = sanitizeForFirestore({
          ...order,
          createdAt: order.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await setDoc(docRef, cleanOrderData);
      } catch (fallbackErr) {
        if (!isOfflineError(fallbackErr)) {
          console.warn('Fallback setDoc error:', fallbackErr);
        }
      }
    }
  },

  // Get orders for a user
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];
      querySnapshot.forEach((d) => {
        orders.push(d.data() as Order);
      });
      return orders;
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error fetching orders from Firestore:', err);
      }
      return [];
    }
  },

  // Update order status (for admin / delivery tracking)
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, sanitizeForFirestore({
        status,
        updatedAt: new Date().toISOString(),
      }));
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error updating order status in Firestore:', err);
      }
    }
  }
};

/**
 * ============================================================
 * 5. FIRESTORE CURRENCY & CONFIG
 * ============================================================
 */

export const firestoreConfigService = {
  async getCurrencyRates(): Promise<ExchangeRates> {
    try {
      const docRef = doc(db, 'currencySettings', 'config');
      const snap = await withFirestoreTimeout(getDoc(docRef), 2500, null);
      if (snap && snap.exists()) {
        const data = snap.data();
        if (data.rates) {
          return data.rates as ExchangeRates;
        }
      }

      // Initialize default in Firestore if reachable
      try {
        await setDoc(docRef, {
          rates: DEFAULT_EXCHANGE_RATES,
          lastUpdated: new Date().toISOString(),
        });
      } catch (e) {
        // Ignore offline write error on init
      }
      return DEFAULT_EXCHANGE_RATES;
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error reading currency settings from Firestore:', err);
      }
      return DEFAULT_EXCHANGE_RATES;
    }
  },

  async saveCurrencyRates(rates: ExchangeRates): Promise<void> {
    try {
      const docRef = doc(db, 'currencySettings', 'config');
      await setDoc(docRef, {
        rates,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error saving currency settings to Firestore:', err);
      }
    }
  }
};

/**
 * ============================================================
 * 6. FIRESTORE APP SETTINGS (General, Promo Buttons, Contact)
 * ============================================================
 */

export const firestoreSettingsService = {
  async getSettings(): Promise<Partial<AppSettings> | null> {
    try {
      const docRef = doc(db, 'appSettings', 'general');
      const snap = await withFirestoreTimeout(getDoc(docRef), 2500, null);
      if (snap && snap.exists()) {
        return snap.data() as Partial<AppSettings>;
      }
      return null;
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error reading app settings from Firestore:', err);
      }
      return null;
    }
  },

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const docRef = doc(db, 'appSettings', 'general');
      await setDoc(docRef, sanitizeForFirestore({
        ...settings,
        updatedAt: new Date().toISOString(),
      }), { merge: true });
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error saving app settings to Firestore:', err);
      }
    }
  },

  subscribeToSettings(callback: (settings: Partial<AppSettings>) => void): Unsubscribe {
    try {
      const docRef = doc(db, 'appSettings', 'general');
      return onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as Partial<AppSettings>);
        }
      }, (error) => {
        if (!isOfflineError(error)) {
          console.warn('Settings onSnapshot notice:', error);
        }
      });
    } catch (e) {
      return () => {};
    }
  }
};

/**
 * ============================================================
 * 6.5. FIRESTORE FOOTER CONFIG (Dynamic Footer, Logos, Links)
 * Collection: footer_config
 * Document: main
 * ============================================================
 */
export const firestoreFooterService = {
  async getFooterConfig(): Promise<FooterConfig | null> {
    try {
      const docRef = doc(db, 'footer_config', 'main');
      const snap = await withFirestoreTimeout(getDoc(docRef), 2500, null);
      if (snap && snap.exists()) {
        const data = snap.data();
        return { ...DEFAULT_FOOTER_CONFIG, ...data } as FooterConfig;
      }
      return null;
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error reading footer config from Firestore:', err);
      }
      return null;
    }
  },

  async saveFooterConfig(footerConfig: Partial<FooterConfig>): Promise<void> {
    try {
      const docRef = doc(db, 'footer_config', 'main');
      await setDoc(docRef, sanitizeForFirestore({
        ...footerConfig,
        updatedAt: new Date().toISOString(),
      }), { merge: true });
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error saving footer config to Firestore:', err);
      }
      throw err;
    }
  },

  subscribeToFooterConfig(callback: (config: FooterConfig) => void): Unsubscribe {
    try {
      const docRef = doc(db, 'footer_config', 'main');
      return onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          callback({ ...DEFAULT_FOOTER_CONFIG, ...data } as FooterConfig);
        }
      }, (error) => {
        if (!isOfflineError(error)) {
          console.warn('FooterConfig onSnapshot notice:', error);
        }
      });
    } catch (e) {
      return () => {};
    }
  },

  async uploadFooterLogo(file: File): Promise<string> {
    try {
      const compressedBlob = await compressImage(file, 600, 0.88);
      const filename = `footer/logos/logo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.png`;
      const storageRef = ref(storage, filename);
      const snapshot = await uploadBytes(storageRef, compressedBlob, {
        contentType: 'image/png',
      });
      return await getDownloadURL(snapshot.ref);
    } catch (storageError) {
      console.warn('Firebase Storage footer logo upload note (falling back to Data URL):', storageError);
      const compressedBlob = await compressImage(file, 400, 0.85);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(compressedBlob);
      });
    }
  }
};

/**
 * ============================================================
 * 6.8. FIRESTORE REVIEWS & RATINGS SERVICE
 * Collection: reviews
 * ============================================================
 */
export const firestoreReviewService = {
  // Add a verified product review
  async addReview(reviewData: {
    productId: string;
    productName?: string;
    productImage?: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    verifiedPurchase: boolean;
    images?: string[];
  }): Promise<ReviewItem> {
    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const fullReview: ReviewItem = {
      id: reviewId,
      productId: reviewData.productId,
      productName: reviewData.productName || '',
      productImage: reviewData.productImage || '',
      userId: reviewData.userId,
      userName: reviewData.userName || 'مشتري موثق',
      userAvatar: reviewData.userAvatar || '',
      rating: Math.max(1, Math.min(5, Math.round(reviewData.rating))),
      comment: reviewData.comment.trim(),
      date: new Date().toLocaleDateString('ar-YE', { year: 'numeric', month: 'short', day: 'numeric' }),
      verifiedPurchase: reviewData.verifiedPurchase,
      images: reviewData.images || [],
      isHidden: false,
      isApproved: true,
    };

    try {
      const docRef = doc(db, 'reviews', reviewId);
      await setDoc(docRef, sanitizeForFirestore({
        ...fullReview,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error saving review to Firestore:', err);
      }
    }

    return fullReview;
  },

  // Get reviews for a specific product
  async getProductReviews(productId: string): Promise<ReviewItem[]> {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('productId', '==', productId)
      );
      const querySnapshot = await withFirestoreTimeout(getDocs(q), 2500, null);
      if (querySnapshot && !querySnapshot.empty) {
        const list: ReviewItem[] = [];
        querySnapshot.forEach((d) => {
          const item = d.data() as ReviewItem;
          if (!item.isHidden) {
            list.push(item);
          }
        });
        return list;
      }
      return [];
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error fetching product reviews from Firestore:', err);
      }
      return [];
    }
  },

  // Real-time reviews listener for a product
  subscribeToProductReviews(productId: string, callback: (reviews: ReviewItem[]) => void): Unsubscribe {
    try {
      const q = query(collection(db, 'reviews'), where('productId', '==', productId));
      return onSnapshot(q, (snapshot) => {
        const list: ReviewItem[] = [];
        snapshot.forEach((d) => {
          const item = d.data() as ReviewItem;
          if (!item.isHidden) {
            list.push(item);
          }
        });
        callback(list);
      }, (error) => {
        if (!isOfflineError(error)) {
          console.warn('Product reviews onSnapshot notice:', error);
        }
      });
    } catch (e) {
      return () => {};
    }
  },

  // Delete review (Admin or owner)
  async deleteReview(reviewId: string): Promise<void> {
    try {
      const docRef = doc(db, 'reviews', reviewId);
      await deleteDoc(docRef);
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error deleting review from Firestore:', err);
      }
    }
  },

  // Toggle hide review (Admin)
  async toggleHideReview(reviewId: string, isHidden: boolean): Promise<void> {
    try {
      const docRef = doc(db, 'reviews', reviewId);
      await updateDoc(docRef, sanitizeForFirestore({
        isHidden,
        updatedAt: new Date().toISOString(),
      }));
    } catch (err) {
      if (!isOfflineError(err)) {
        console.warn('Error updating review visibility in Firestore:', err);
      }
    }
  }
};

/**
 * ============================================================
 * 7. FIREBASE STORAGE HELPER (Image Uploads)
 * ============================================================
 */

export const firebaseStorageService = {
  async uploadFile(file: File | Blob, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (err) {
      console.error('Error uploading file to Firebase Storage:', err);
      throw err;
    }
  }
};

/**
 * ============================================================
 * 7. FIREBASE CLOUD MESSAGING (FCM) HELPER
 * ============================================================
 */

export const firebaseNotificationService = {
  async requestNotificationPermission(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          return 'granted';
        }
      }
      return null;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return null;
    }
  }
};
