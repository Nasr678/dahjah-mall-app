import React, { useState } from 'react';
import { X, Eye, Type, Volume2 } from 'lucide-react';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ isOpen, onClose }) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  const handleSpeakSample = () => {
    if (!('speechSynthesis' in window)) {
      alert('خاصية قراءة النص غير مدعومة في هذا المتصفح');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance('مرحباً بك في تطبيق ضَجّة مول. تسوق سعيد وأسعار في متناول الجميع.');
    utterance.lang = 'ar-SA';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/50 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-5 space-y-4 shadow-2xl text-right text-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-black text-neutral-950">إمكانية الوصول والراحة البصرية</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#F6F7F9] hover:bg-neutral-200/70 border border-neutral-200 text-neutral-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Size Settings */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-neutral-950 font-bold text-xs">
            <Type className="w-4 h-4 text-amber-600" />
            <span>حجم الخط والنص في التطبيق</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'normal', label: 'افتراضي', sizeClass: 'text-xs' },
              { id: 'large', label: 'كبير', sizeClass: 'text-sm' },
              { id: 'xlarge', label: 'كبير جداً', sizeClass: 'text-base' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFontSize(item.id as any)}
                className={`py-2 px-1 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  fontSize === item.id
                    ? 'bg-amber-50 border-amber-400 text-amber-950'
                    : 'bg-[#F6F7F9] border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                } ${item.sizeClass}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reduce Motion */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F6F7F9] border border-neutral-200">
          <div>
            <div className="font-bold text-neutral-950 text-xs">تقليل الحركة والانتقالات</div>
            <div className="text-[10px] text-neutral-500">تقليل التأثيرات البصرية لتجربة تصفح هادئة</div>
          </div>
          <button
            type="button"
            onClick={() => setReduceMotion(!reduceMotion)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              reduceMotion ? 'bg-amber-500' : 'bg-neutral-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${reduceMotion ? '-translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F6F7F9] border border-neutral-200">
          <div>
            <div className="font-bold text-neutral-950 text-xs">التباين العالي (High Contrast)</div>
            <div className="text-[10px] text-neutral-500">زيادة وضوح النصوص والحدود لقراءة أسهل</div>
          </div>
          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              highContrast ? 'bg-amber-500' : 'bg-neutral-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${highContrast ? '-translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Screen Reader Sample */}
        <div className="p-3 rounded-2xl bg-[#F6F7F9] border border-neutral-200 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-neutral-950 text-xs">قارئ النصوص الصوتي</div>
              <div className="text-[10px] text-neutral-500">قراءة صوتية باللغة العربية لعناصر التطبيق</div>
            </div>
            <button
              type="button"
              onClick={handleSpeakSample}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isSpeaking 
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                  : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-400 hover:text-neutral-950'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeaking ? 'إيقاف الصوت' : 'تجربة الصوت'}</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black text-xs transition-colors cursor-pointer shadow-sm"
        >
          حفظ وتطبيق
        </button>
      </div>
    </div>
  );
};
