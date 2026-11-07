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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-2xl text-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black text-white">إمكانية الوصول والراحة البصرية</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Size Settings */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white font-bold text-xs">
            <Type className="w-4 h-4 text-amber-400" />
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
                className={`py-2 px-1 rounded-xl border text-center font-bold transition-all ${
                  fontSize === item.id
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-850'
                } ${item.sizeClass}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reduce Motion */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900 border border-neutral-850">
          <div>
            <div className="font-bold text-white text-xs">تقليل الحركة والانتقالات</div>
            <div className="text-[10px] text-neutral-400">تقليل التأثيرات البصرية لتجربة تصفح هادئة</div>
          </div>
          <button
            type="button"
            onClick={() => setReduceMotion(!reduceMotion)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              reduceMotion ? 'bg-amber-500' : 'bg-neutral-700'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${reduceMotion ? '-translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900 border border-neutral-850">
          <div>
            <div className="font-bold text-white text-xs">التباين العالي (High Contrast)</div>
            <div className="text-[10px] text-neutral-400">زيادة وضوح النصوص والحدود لقراءة أسهل</div>
          </div>
          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              highContrast ? 'bg-amber-500' : 'bg-neutral-700'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${highContrast ? '-translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Screen Reader Sample */}
        <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-850 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-xs">قارئ النصوص الصوتي</div>
              <div className="text-[10px] text-neutral-400">قراءة صوتية باللغة العربية لعناصر التطبيق</div>
            </div>
            <button
              type="button"
              onClick={handleSpeakSample}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isSpeaking 
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-amber-500/20 border-amber-400/40 text-amber-300 hover:bg-amber-500 hover:text-neutral-950'
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
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition-colors"
        >
          حفظ وتطبيق
        </button>
      </div>
    </div>
  );
};
