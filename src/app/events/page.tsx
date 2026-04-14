import Link from 'next/link';
import { ArrowRight, BadgeCheck, BrainCircuit, Lightbulb, MessageSquareText, Rocket, SearchCheck, Sparkles } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { GlassCard, SectionTitle } from '@/components/ui';
import { eventDefinitions } from '@/lib/events';

const eventThemes = [
  {
    Icon: Rocket,
    card: 'from-amber-500/25 via-orange-500/10 to-rose-500/10',
    border: 'border-amber-400/30',
    badge: 'bg-amber-400/15 text-amber-100',
    button: 'bg-amber-400 text-slate-950 hover:bg-amber-300',
    icon: 'text-amber-300'
  },
  {
    Icon: BrainCircuit,
    card: 'from-cyan-500/25 via-sky-500/10 to-blue-500/10',
    border: 'border-cyan-400/30',
    badge: 'bg-cyan-400/15 text-cyan-100',
    button: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300',
    icon: 'text-cyan-300'
  },
  {
    Icon: SearchCheck,
    card: 'from-emerald-500/25 via-teal-500/10 to-cyan-500/10',
    border: 'border-emerald-400/30',
    badge: 'bg-emerald-400/15 text-emerald-100',
    button: 'bg-emerald-400 text-slate-950 hover:bg-emerald-300',
    icon: 'text-emerald-300'
  },
  {
    Icon: MessageSquareText,
    card: 'from-fuchsia-500/25 via-pink-500/10 to-rose-500/10',
    border: 'border-fuchsia-400/30',
    badge: 'bg-fuchsia-400/15 text-fuchsia-100',
    button: 'bg-fuchsia-400 text-slate-950 hover:bg-fuchsia-300',
    icon: 'text-fuchsia-300'
  },
  {
    Icon: Lightbulb,
    card: 'from-violet-500/25 via-indigo-500/10 to-cyan-500/10',
    border: 'border-violet-400/30',
    badge: 'bg-violet-400/15 text-violet-100',
    button: 'bg-violet-400 text-slate-950 hover:bg-violet-300',
    icon: 'text-violet-300'
  },
  {
    Icon: BadgeCheck,
    card: 'from-rose-500/25 via-orange-500/10 to-amber-500/10',
    border: 'border-rose-400/30',
    badge: 'bg-rose-400/15 text-rose-100',
    button: 'bg-rose-400 text-slate-950 hover:bg-rose-300',
    icon: 'text-rose-300'
  }
];

export default function EventsPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Events" title="All Summit Events" description="Explore the events conducted by E-Cell in past editions and open each event for complete details." />
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {eventDefinitions.map((event, index) => {
            const theme = eventThemes[index % eventThemes.length];
            const Icon = theme.Icon;

            return (
              <GlassCard key={event.slug} className={`group relative overflow-hidden space-y-4 border ${theme.border} bg-gradient-to-br ${theme.card} transition-all duration-300 hover:-translate-y-1 hover:border-white/50 hover:shadow-2xl hover:shadow-black/40`}>
                <div className="flex items-start justify-between gap-4">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 ${theme.icon} transition duration-300 group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] ${theme.badge}`}>{event.category}</span>
                </div>
                <div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{event.name}</h2>
                  <p className="mt-2 text-sm leading-7 text-white/85">{event.description}</p>
                </div>
                <Link href={`/events/${event.slug}`} prefetch className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${theme.button}`}>
                  View Details <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 via-transparent to-white/0 opacity-0 transition group-hover:opacity-100" />
              </GlassCard>
            );
          })}
        </div>
      </main>
    </SiteShell>
  );
}
