'use client';

import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';

export function AnnouncementPopup() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const openTimer = window.setTimeout(() => setVisible(true), 50);
    const closeTimer = window.setTimeout(() => setClosing(true), 5050);
    const unmountTimer = window.setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 5450);

    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
      window.clearTimeout(unmountTimer);
    };
  }, []);

  if (!visible && !closing) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div
        className={`relative w-full max-w-sm transition-all duration-500 ease-out ${
          closing ? 'translate-y-3 opacity-0 scale-[0.98]' : 'translate-y-0 opacity-100 scale-100'
        }`}
      >
        <div className="absolute -inset-8 rounded-[2rem] bg-gradient-to-r from-orange-400/15 via-rose-400/10 to-pink-500/15 blur-3xl opacity-70 animate-pulse" />
        <div className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-r from-orange-400 via-rose-400 to-pink-500 p-[1px] shadow-[0_0_32px_rgba(251,146,60,0.18)]">
          <div className="h-full w-full rounded-[1.72rem] bg-slate-950/75 px-4 py-4 backdrop-blur-2xl sm:px-5 sm:py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-orange-200 shadow-[0_0_20px_rgba(251,146,60,0.16)]">
                <Clock3 className="h-5 w-5" />
              </div>
              <p className="pt-0.5 text-sm leading-6 text-slate-200 sm:text-[0.95rem] sm:leading-7">
                Don’t miss out — registrations close on{' '}
                <span className="font-semibold text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.2)]">25th April</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}