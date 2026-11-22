import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DajjahLogo } from '../common/DajjahLogo';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Truck, 
  Bot, 
  Flame 
} from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'ضَجّة في وجه الغلاء',
      subtitle: 'أرقى الماركات بأسعار استثنائية',
      description: 'اكتشف آلاف المنتجات المختارة بعناية من الأزياء، العطور، الإلكترونيات والمجوهرات مع خصومات يومية حقيقية تصل إلى 70%.',
      icon: Flame,
      badge: 'توفير حقيقي 100%',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
      accentColor: 'from-amber-500/20 via-purple-600/10 to-transparent',
    },
    {
      title: 'توصيل فوري وموثوق في اليمن',
      subtitle: 'يصلك أينما كنت بأمان وسرعة',
      description: 'شبكة لوجستية متطورة تغطي صنعاء، عدن، تعز، حضرموت، إب وجميع المحافظات مع إمكانية التتبع الحي المباشر لشحنتك.',
      icon: Truck,
      badge: 'توصيل VIP فوري',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop',
      accentColor: 'from-purple-600/20 via-amber-500/10 to-transparent',
    },
    {
      title: 'محافظك اليمنية ومستشار التسوق',
      subtitle: 'دفع آمن وتجربة تسوق متكاملة',
      description: 'ادفع عبر الكريمي، ون كاش، جيب، أو نقداً عند الاستلام بعد المعاينة، واستعن بمستشار ضَجّة لاختيار المقاسات والهدايا بسهولة.',
      icon: Bot,
      badge: 'دفع آمن ومرن',
      image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=800&auto=format&fit=crop',
      accentColor: 'from-amber-600/20 via-purple-700/20 to-transparent',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[9990] flex flex-col bg-[#F6F7F9] text-neutral-900 overflow-hidden select-none">
      {/* Top Header with Brand & Skip */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <DajjahLogo size="xs" />
          <span className="font-black text-base text-neutral-950">ضَجّة مول</span>
        </div>
        <button
          onClick={onComplete}
          className="px-3.5 py-1.5 rounded-full text-xs font-bold text-neutral-600 hover:text-neutral-950 bg-white border border-neutral-200 shadow-xs transition-colors"
        >
          تخطي
        </button>
      </div>

      {/* Main Slide Content */}
      <div className="relative flex-1 flex flex-col justify-between px-6 pb-8 overflow-hidden">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col items-center justify-center text-center my-auto"
        >
          {/* Visual Card with Image & Soft Editorial Overlay */}
          <div className="relative w-full max-w-sm aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-neutral-200/80 shadow-xl mb-8 group">
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-neutral-950/10 to-transparent" />
            
            {/* Badge overlay */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-amber-200 backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-amber-800">{slides[currentSlide].badge}</span>
            </div>

            {/* Floating icon */}
            <div className="absolute bottom-4 left-4 p-3.5 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-neutral-950 shadow-lg shadow-amber-500/25">
              {React.createElement(slides[currentSlide].icon, { className: 'w-6 h-6' })}
            </div>
          </div>

          {/* Typography */}
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-2">
            {slides[currentSlide].subtitle}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 mb-3">
            {slides[currentSlide].title}
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 max-w-md leading-relaxed">
            {slides[currentSlide].description}
          </p>
        </motion.div>

        {/* Bottom Controls & Navigation */}
        <div className="relative z-20 w-full max-w-md mx-auto pt-4">
          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? 'w-8 bg-gradient-to-r from-amber-500 to-amber-400'
                    : 'w-2 bg-neutral-300 hover:bg-neutral-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {currentSlide > 0 && (
              <button
                onClick={handlePrev}
                className="p-4 rounded-2xl bg-white border border-neutral-200 text-neutral-700 hover:text-neutral-950 shadow-sm transition-colors"
                aria-label="Previous slide"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-base shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all"
            >
              <span>{currentSlide === slides.length - 1 ? 'ابدأ التسوق الآن' : 'التالي'}</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
