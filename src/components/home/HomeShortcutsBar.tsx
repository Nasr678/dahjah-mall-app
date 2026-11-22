import React from 'react';
import { ShieldCheck, Truck, RefreshCw } from 'lucide-react';

interface HomeShortcutsBarProps {
  onOpenAI?: () => void;
  onExploreBrands?: () => void;
}

export const HomeShortcutsBar: React.FC<HomeShortcutsBarProps> = React.memo(() => {
  return (
    <section className="w-full py-0.5">
      {/* Ultra-compact Trust & Speed Strip */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-2 px-3 bg-white border border-neutral-200/85 rounded-xl text-[11px] sm:text-xs text-neutral-600 shadow-xs">
        <div className="flex items-center gap-1.5 px-1 whitespace-nowrap font-medium">
          <Truck className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>توصيل فوري لكافة المحافظات</span>
        </div>
        <span className="text-neutral-300">•</span>
        <div className="flex items-center gap-1.5 px-1 whitespace-nowrap font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>معاينة حرة قبل الدفع</span>
        </div>
        <span className="text-neutral-300">•</span>
        <div className="flex items-center gap-1.5 px-1 whitespace-nowrap font-medium">
          <RefreshCw className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>ضمان جودة واستبدال</span>
        </div>
      </div>
    </section>
  );
});

HomeShortcutsBar.displayName = 'HomeShortcutsBar';

