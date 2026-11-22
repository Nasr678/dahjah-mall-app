import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DajjahLogo } from '../common/DajjahLogo';
import { YEMEN_CITIES } from '../../data/mockData';
import { useMarketplace } from '../../context/MarketplaceContext';
import { translateAuthError } from '../../services/firebase';
import { 
  X, 
  Phone, 
  Lock, 
  User, 
  MapPin, 
  Mail,
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowRight, 
  Shield
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: { name: string; phone: string; city: string }) => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, sendPasswordReset } = useMarketplace();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState(YEMEN_CITIES[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (mode === 'forgot') {
        if (!email || !email.includes('@')) {
          setError('يرجى إدخال بريد إلكتروني صالح لاستلام رابط إعادة تعيين كلمة المرور');
          setIsLoading(false);
          return;
        }
        await sendPasswordReset(email.trim());
        setSuccessMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح!');
        setIsLoading(false);
      } else if (mode === 'register') {
        const userEmail = email ? email.trim() : `${phone.replace(/\D/g, '')}@dajjahmall.ye`;
        if (password.length < 6) {
          setError('كلمة المرور ضعيفة. يجب أن تتكون من 6 خانات أو أحرف على الأقل.');
          setIsLoading(false);
          return;
        }
        const profile = await registerWithEmail(
          userEmail,
          password,
          name.trim() || 'عميل ضَجّة مول',
          phone ? `+967 ${phone}` : '',
          city
        );
        if (onSuccess) {
          onSuccess({
            name: profile.name,
            phone: profile.phone,
            city: profile.city,
          });
        }
        onClose();
      } else {
        // Login with Email
        const userEmail = email.includes('@') ? email.trim() : `${phone.replace(/\D/g, '')}@dajjahmall.ye`;
        if (!password) {
          setError('يرجى إدخال كلمة المرور للمتابعة.');
          setIsLoading(false);
          return;
        }
        const profile = await loginWithEmail(userEmail, password);
        if (onSuccess) {
          onSuccess({
            name: profile.name,
            phone: profile.phone,
            city: profile.city,
          });
        }
        onClose();
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setError('تم إغلاق نافذة تسجيل الدخول.');
        return;
      }
      setError(translateAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;
    setError('');
    setIsGoogleLoading(true);
    try {
      const profile = await loginWithGoogle();
      if (onSuccess) {
        onSuccess({
          name: profile.name,
          phone: profile.phone,
          city: profile.city,
        });
      }
      onClose();
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.includes('تم إغلاق نافذة تسجيل الدخول')
      ) {
        setError('تم إغلاق نافذة تسجيل الدخول.');
        return;
      }
      setError(translateAuthError(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-neutral-900 my-8 max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-[#F6F7F9] text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200 border border-neutral-200/80 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Top Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <DajjahLogo size="sm" withGlow />
          <h2 className="text-xl sm:text-2xl font-black text-neutral-950 mt-2">
            {mode === 'login' && 'تسجيل الدخول إلى ضَجّة مول'}
            {mode === 'register' && 'انضم إلى عائلة ضَجّة مول'}
            {mode === 'forgot' && 'استعادة كلمة المرور'}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            {mode === 'login' && 'مرحباً بعودتك! ادخل لحسابك لمتابعة طلباتك والاستفادة من العروض'}
            {mode === 'register' && 'أنشئ حسابك وتمتع بكوبون خصم فوري ومزامنة سحابية'}
            {mode === 'forgot' && 'أدخل بريدك الإلكتروني المسجل لاستلام رابط إعادة تعيين كلمة المرور'}
          </p>
        </div>

        {/* Tab Switcher */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex bg-[#F6F7F9] p-1 rounded-2xl mb-5 border border-neutral-200">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm font-black'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setSuccessMessage(''); }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm font-black'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              حساب جديد
            </button>
          </div>
        )}

        {/* Social Authentication Provider (Google Quick Sign-In) */}
        {mode !== 'forgot' && (
          <div className="space-y-2.5 mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#F6F7F9] hover:bg-neutral-100 border border-neutral-200 hover:border-amber-400 text-neutral-900 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer shadow-xs hover:shadow-sm active:scale-[0.99]"
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>الدخول السريع بحساب Google</span>
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-[1px] bg-neutral-200" />
              <span className="text-[11px] text-neutral-500 font-medium">أو عبر البريد وكلمة المرور</span>
              <div className="flex-1 h-[1px] bg-neutral-200" />
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                الاسم الكامل
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: نصر النظاري"
                  className="w-full bg-[#F6F7F9] border border-neutral-200 rounded-2xl py-3 pr-10 pl-4 text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-amber-500 transition-colors"
                />
                <User className="absolute right-3.5 top-3.5 w-4 h-4 text-neutral-400" />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full bg-[#F6F7F9] border border-neutral-200 rounded-2xl py-3 pr-10 pl-4 text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-amber-500 transition-colors"
                dir="ltr"
              />
              <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-neutral-400" />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                رقم الهاتف (اليمن)
              </label>
              <div className="relative flex items-center">
                <div className="absolute right-3.5 flex items-center gap-1.5 pointer-events-none">
                  <span className="text-xs font-bold text-neutral-500 font-mono">967+</span>
                  <div className="w-[1px] h-4 bg-neutral-300 mx-1" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="770 123 456"
                  className="w-full bg-[#F6F7F9] border border-neutral-200 rounded-2xl py-3 pr-20 pl-4 text-sm text-neutral-900 font-mono placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-amber-500 transition-colors text-right tabular-nums"
                  dir="ltr"
                />
                <Phone className="absolute left-3.5 w-4 h-4 text-neutral-400" />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                المدينة / المحافظة
              </label>
              <div className="relative">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#F6F7F9] border border-neutral-200 rounded-2xl py-3 pr-10 pl-4 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:border-amber-500 transition-colors appearance-none"
                >
                  {YEMEN_CITIES.map((c) => (
                    <option key={c} value={c} className="bg-white text-neutral-900">
                      {c}
                    </option>
                  ))}
                </select>
                <MapPin className="absolute right-3.5 top-3.5 w-4 h-4 text-neutral-400" />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-neutral-700">
                  كلمة المرور
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); setSuccessMessage(''); }}
                    className="text-xs font-bold text-amber-700 hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F6F7F9] border border-neutral-200 rounded-2xl py-3 pr-10 pl-10 text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-amber-500 transition-colors"
                  dir="ltr"
                />
                <Lock className="absolute right-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-3.5 text-neutral-400 hover:text-neutral-800"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-center font-semibold">
              {error}
            </p>
          )}

          {successMessage && (
            <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-center flex items-center justify-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </p>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-sm shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login' && 'تسجيل الدخول'}
                  {mode === 'register' && 'إنشاء الحساب والمتابعة'}
                  {mode === 'forgot' && 'إرسال رابط إعادة التعيين'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Bottom Actions */}
        <div className="mt-6 pt-5 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          {mode === 'forgot' ? (
            <button
              onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
              className="text-amber-700 font-bold hover:underline flex items-center gap-1"
            >
              العودة لتسجيل الدخول
            </button>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-neutral-500">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>مشفر ومحمي عبر Firebase Auth</span>
            </span>
          )}
          <button
            onClick={() => {
              onClose();
            }}
            className="text-neutral-700 hover:text-amber-700 font-bold text-xs"
          >
            المتابعة كزائر
          </button>
        </div>
      </motion.div>
    </div>
  );
};
