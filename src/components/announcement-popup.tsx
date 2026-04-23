'use client';

import { useEffect, useState } from 'react';
import { BellRing, Clock3, Sparkles } from 'lucide-react';

export function AnnouncementPopup() {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const closeTimer = window.setTimeout(() => setClosing(true), 10000);
    const unmountTimer = window.setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 10650);

    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(unmountTimer);
    };
  }, []);

  if (!visible && !closing) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]" />
      <div
        className={`relative w-full max-w-2xl transition-all duration-700 ease-out ${
          closing ? 'translate-y-6 opacity-0 scale-[0.97]' : 'translate-y-0 opacity-100 scale-100'
        }`}
      >
        <div className="absolute -inset-10 rounded-[2.5rem] bg-gradient-to-r from-orange-400/20 via-rose-400/15 to-pink-500/20 blur-3xl opacity-80 animate-pulse" />
        <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-gradient-to-b from-slate-950/92 via-slate-950/88 to-slate-900/82 p-[1px] shadow-[0_30px_80px_rgba(2,6,23,0.45)]">
          <div className="relative overflow-hidden rounded-[calc(2rem-1px)] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.16),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] px-5 py-5 backdrop-blur-2xl sm:px-7 sm:py-6 lg:px-8 lg:py-7">
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/80 to-transparent" />
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-400/10 blur-3xl" />
            <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" />

            <div className="relative flex items-start gap-4 sm:gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.15)]">
                <Clock3 className="h-6 w-6" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-100/85">
                  <Sparkles className="h-3.5 w-3.5 text-orange-300" />
                  Registration Update
                </div>

                <p className="max-w-xl text-[1.1rem] font-medium leading-7 text-slate-100 sm:text-[1.22rem] sm:leading-8 lg:text-[1.35rem] lg:leading-9">
                  Don’t miss out — registrations close on{' '}
                  <span className="inline-flex items-center rounded-full border border-amber-300/30 bg-amber-300/12 px-3 py-1 font-semibold text-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.18)]">
                    25th April
                  </span>
                  .
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-slate-300/80">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                    <BellRing className="h-3.5 w-3.5 text-orange-300" />
                    Limited window
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200/90">
                    Elegant reminder
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}