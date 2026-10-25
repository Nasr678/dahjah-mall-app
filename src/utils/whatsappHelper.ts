/**
 * WhatsApp Phone Number Normalizer and URL Generator
 * Formats Yemeni and international phone numbers into standard wa.me links
 */

export function normalizePhoneNumber(rawPhone: string | undefined | null): string {
  if (!rawPhone) return '967777123456';
  
  // Remove all spaces, dashes, parentheses, non-digits except plus
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, '');
  
  // Remove leading plus
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // Remove leading 00
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  
  // If Yemeni local number (9 digits starting with 7, e.g. 777123456)
  if (cleaned.length === 9 && cleaned.startsWith('7')) {
    cleaned = '967' + cleaned;
  }
  // If Yemeni local number with leading zero (10 digits starting with 07, e.g. 0777123456)
  else if (cleaned.length === 10 && cleaned.startsWith('07')) {
    cleaned = '967' + cleaned.substring(1);
  }
  // If Yemeni number without international code but 9 digits
  else if (!cleaned.startsWith('967') && cleaned.length === 9) {
    cleaned = '967' + cleaned;
  }

  // Fallback default if empty
  if (!cleaned || cleaned.length < 8) {
    cleaned = '967777123456';
  }
  
  return cleaned;
}

export function createWhatsAppLink(phone: string | undefined | null, message?: string): string {
  const cleanPhone = normalizePhoneNumber(phone);
  if (!message || !message.trim()) {
    return `https://wa.me/${cleanPhone}`;
  }
  const encodedMsg = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}

export function createProductInquiryWhatsAppMessage(productName: string, priceText: string, sku?: string): string {
  return `السلام عليكم ورحمة الله وبركاته 🌷
أريد الاستفسار والطلب من متجر ضَجّة مول:
• المنتج: ${productName}
• السعر: ${priceText}
${sku ? `• رمز المنتج (SKU): ${sku}\n` : ''}
هل المنتج متوفر بالمقاسات والألوان لديكم؟ شكراً لكم.`;
}

export function createOrderInquiryWhatsAppMessage(orderId: string, totalText: string, city: string): string {
  return `السلام عليكم ورحمة الله وبركاته 🌷
أريد الاستفسار عن حالة طلبي في ضَجّة مول:
• رقم الطلب: ${orderId}
• الإجمالي: ${totalText}
• مدينة التوصيل: ${city}
يرجى إفادتي بموعد وصول المندوب. شكراً لكم.`;
}

export function createOrderWhatsAppMessage(
  orderId: string,
  customerName: string,
  totalYER: number,
  items: { name: string; quantity: number }[],
  addressStr: string
): string {
  const itemsList = items.map((it, idx) => `${idx + 1}. ${it.name} (عدد: ${it.quantity})`).join('\n');
  return `السلام عليكم ورحمة الله وبركاته 🛍️
فاتورة وتأكيد طلب جديد من منصة "ضَجّة مول":
━━━━━━━━━━━━━━
• رقم الطلب: ${orderId}
• اسم العميل: ${customerName}
• عنوان التوصيل: ${addressStr}
• إجمالي الطلب: ${totalYER.toLocaleString('ar-YE')} ريال يمني
━━━━━━━━━━━━━━
المنتجات المطلوبة:
${itemsList}
━━━━━━━━━━━━━━
شعارنا: "ضَجّة في وجه الغلاء" ✨`;
}
