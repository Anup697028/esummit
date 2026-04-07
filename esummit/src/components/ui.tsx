import clsx from 'clsx';

export function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">{description}</p> : null}
    </div>
  );
}

export function GlassCard({ className, children }: Readonly<{ className?: string; children: React.ReactNode }>) {
  return (
    <div className={clsx('rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl', className)}>
      {children}
    </div>
  );
}
