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
      <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1 px-2 bg-neutral-950/70 border border-neutral-850/60 rounded-xl text-[10px] sm:text-xs text-neutral-400">
        <div className="flex items-center gap-1 px-1 whitespace-nowrap">
          <Truck className="w-3 h-3 text-amber-400 flex-shrink-0" />
          <span>توصيل فوري لكافة المحافظات</span>
        </div>
        <span className="text-neutral-700">•</span>
        <div className="flex items-center gap-1 px-1 whitespace-nowrap">
          <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
          <span>معاينة حرة قبل الدفع</span>
        </div>
        <span className="text-neutral-700">•</span>
        <div className="flex items-center gap-1 px-1 whitespace-nowrap">
          <RefreshCw className="w-3 h-3 text-amber-400 flex-shrink-0" />
          <span>ضمان جودة واستبدال</span>
        </div>
      </div>
    </section>
  );
});

HomeShortcutsBar.displayName = 'HomeShortcutsBar';

