import { useApp } from '../../context';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Wifi, Battery, Signal } from 'lucide-react';

export const MobileContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { phoneFrameEnabled } = useApp();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 flex items-center justify-center p-0 sm:p-4 md:p-6 lg:p-8 font-sans antialiased">
      {/* Phone Mockup Frame or Fluid Mobile View */}
      <div
        className={`w-full transition-all duration-300 ${
          phoneFrameEnabled
            ? 'max-w-[420px] bg-white sm:rounded-[44px] sm:shadow-[0_25px_70px_rgba(0,0,0,0.45)] sm:ring-[12px] sm:ring-slate-800 sm:border sm:border-slate-700/60 overflow-hidden relative min-h-[860px] h-[92vh] max-h-[920px] flex flex-col'
            : 'max-w-md bg-white shadow-xl min-h-screen relative flex flex-col'
        }`}
      >
        {/* iOS Status Bar (Simulated) */}
        <div className="bg-white/95 backdrop-blur-md pt-2.5 pb-1 px-6 flex items-center justify-between text-xs text-slate-800 font-semibold select-none z-40">
          <span>9:41</span>
          {/* Dynamic Island / Speaker Pill */}
          <div className="w-24 h-4.5 bg-black rounded-full mx-auto" />
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5 fill-current" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 fill-current" />
          </div>
        </div>

        {/* Header */}
        <Header />

        {/* Scrollable Screen Content */}
        <main className="flex-1 overflow-y-auto pb-24 overscroll-contain bg-slate-50/50">
          {children}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};
