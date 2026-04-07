import Link from 'next/link';
import { ArrowRight, Award, Cpu, GraduationCap, Sparkles, Zap, Users, Share2, Lightbulb, Rocket } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { GlassCard, SectionTitle } from '@/components/ui';
import { summitHighlights } from '@/lib/events';
import { LegacyFramesGallery } from '@/components/legacy-frames-gallery'; // Gallery component with modal lightbox

export default function HomePage() {
  return (
    <SiteShell>
      <main className="pb-10">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_24%),linear-gradient(135deg,rgba(2,6,23,0.92),rgba(15,23,42,0.82))]" />
          <div
            className="absolute left-[-8%] top-[50%] h-[32rem] w-[32rem] -translate-y-1/2 bg-[url('/logo/logo.png')] bg-contain bg-left bg-no-repeat opacity-[0.12] mix-blend-overlay pointer-events-none sm:h-[40rem] sm:w-[40rem] lg:h-[48rem] lg:w-[48rem]"
            aria-hidden="true"
          />
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-18">
            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.42em] text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.08)] backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-cyan-300" /> EntreMITT 2026
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.5em] font-bold text-cyan-300/80">E-Summit 2026</p>
                  <h1 data-text="EntreMITT" className="hero-wordmark max-w-3xl text-[4.2rem] font-extrabold leading-[0.92] tracking-[-0.035em] sm:text-[5.4rem] lg:text-[6.5rem]">EntreMITT</h1>
                </div>
                <p className="max-w-2xl text-base leading-8 text-slate-300/95 font-medium sm:text-lg">A premium platform for innovation, leadership, and startup thinking.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-300/30 bg-gradient-to-r from-cyan-500/15 via-white/10 to-cyan-300/15 px-6 py-3 text-sm font-bold text-cyan-50 shadow-[0_12px_36px_rgba(34,211,238,0.2)] backdrop-blur-lg hover:shadow-[0_16px_40px_rgba(34,211,238,0.28)] transition-shadow">
                  <Award className="h-5 w-5 text-cyan-300" /> <span className="bg-gradient-to-r from-cyan-100 to-slate-100 bg-clip-text text-transparent">Prize Pool {summitHighlights.prizePool}</span>
                </div>
                <Link href="/events" className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,0.25)] transition hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-[0_14px_34px_rgba(34,211,238,0.32)]">
                  Explore Events <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="group relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/30 via-cyan-500/10 to-blue-500/20 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/50 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 via-cyan-500/10 to-blue-500/20 text-cyan-400 transition-all duration-300 group-hover:scale-125 group-hover:shadow-lg group-hover:shadow-black/30 border border-white/20">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-white transition duration-300 group-hover:text-white">About MIT Thandavapura</h3>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-cyan-300/80 font-semibold">Vision</p>
                  <p className="mt-2 text-sm leading-6 text-white font-medium transition duration-300 group-hover:text-white/95">To be recognized as a premier institute in creating competent graduates driven towards socio-technical needs.</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-cyan-300/80 font-semibold">Mission</p>
                  <p className="mt-2 text-sm leading-6 text-white font-medium transition duration-300 group-hover:text-white/95">To exhibit quality in the processes of teaching and learning evolved through continual feedback.</p>
                </div>
              </div>
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 via-transparent to-white/0 opacity-0 transition group-hover:opacity-100" />
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/30 via-purple-500/10 to-indigo-500/20 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/50 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/30 via-purple-500/10 to-indigo-500/20 text-purple-400 transition-all duration-300 group-hover:scale-125 group-hover:shadow-lg group-hover:shadow-black/30 border border-white/20">
                  <Cpu className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-white transition duration-300 group-hover:text-white">About E-Cell</h3>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-purple-300/80 font-semibold">Vision</p>
                  <p className="mt-2 text-sm leading-6 text-white font-medium transition duration-300 group-hover:text-white/95">To ignite entrepreneurial passion and shape a generation of innovators who drive change and build the future.</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-purple-300/80 font-semibold">Mission</p>
                  <p className="mt-2 text-sm leading-6 text-white font-medium transition duration-300 group-hover:text-white/95">Empower students to spark innovation, launch game-changing ventures, and shape India's startup future by fostering bold ideas, relentless skills, and inclusive collaboration for global impact.</p>
                </div>
              </div>
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 via-transparent to-white/0 opacity-0 transition group-hover:opacity-100" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="group relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/30 via-amber-500/10 to-orange-500/20 p-8 backdrop-blur-xl transition-all duration-300 hover:border-white/50 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1 sm:p-10">
              <div className="flex justify-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/30 via-amber-500/10 to-orange-500/20 text-amber-300 transition-all duration-300 group-hover:scale-125 group-hover:shadow-lg group-hover:shadow-black/30 border border-white/20">
                  <Award className="h-8 w-8" />
                </div>
              </div>
              <p className="mt-4 text-center text-sm uppercase tracking-wider text-amber-300/80 font-semibold">Achievement</p>
              <h3 className="mt-3 text-center text-2xl font-bold text-white sm:text-3xl transition duration-300 group-hover:text-white">Earned 11th place among 3,000+ competing teams at E-Summit, IIT Bombay.</h3>
              <div className="mt-6 flex justify-center">
                <div className="inline-flex rounded-full border border-amber-300/40 bg-amber-400/15 px-5 py-2 text-sm font-semibold text-amber-100 transition duration-300 group-hover:border-white/40 group-hover:bg-white/10 group-hover:text-white">🏆 A Recognition of Excellence</div>
              </div>
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 via-transparent to-white/0 opacity-0 transition group-hover:opacity-100" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <SectionTitle eyebrow="Highlights" title="Past Event Highlights" description="A curated showcase of E-Cell events from previous editions." />
              <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  { title: 'Pitch Fest', subtitle: 'EUREKA', Icon: Zap, color: 'from-amber-500/30 via-amber-500/10 to-orange-500/20', iconColor: 'text-amber-400', borderColor: 'border-amber-400/30' },
                  { title: 'Group Discussion', subtitle: 'Network & Learn', Icon: Users, color: 'from-blue-500/30 via-blue-500/10 to-cyan-500/20', iconColor: 'text-blue-400', borderColor: 'border-blue-400/30' },
                  { title: 'Pitch in a Meme', subtitle: 'Social Challenge', Icon: Share2, color: 'from-pink-500/30 via-pink-500/10 to-rose-500/20', iconColor: 'text-pink-400', borderColor: 'border-pink-400/30' },
                  { title: 'Illuminate Workshop', subtitle: 'Knowledge Hub', Icon: Lightbulb, color: 'from-yellow-500/30 via-yellow-500/10 to-amber-500/20', iconColor: 'text-yellow-400', borderColor: 'border-yellow-400/30' },
                  { title: 'Gen E', subtitle: 'Entrepreneurship', Icon: Rocket, color: 'from-purple-500/30 via-purple-500/10 to-indigo-500/20', iconColor: 'text-purple-400', borderColor: 'border-purple-400/30' }
                ].map((event) => (
                  <div key={event.title} className={`group relative overflow-hidden rounded-2xl border ${event.borderColor} bg-gradient-to-br ${event.color} p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/50 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1`}>
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${event.color} mb-4 transition-all duration-300 group-hover:scale-125 group-hover:shadow-lg group-hover:shadow-black/30 border border-white/20`}>
                      <event.Icon className={`h-7 w-7 ${event.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white transition duration-300 group-hover:text-white letter-spacing-1">{event.title}</h3>
                    {event.subtitle && <p className="mt-2 text-sm font-medium text-slate-300 transition duration-300 group-hover:text-white/90">{event.subtitle}</p>}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 via-transparent to-white/0 opacity-0 transition group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </div>
            <LegacyFramesGallery />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Speakers" title="Speakers" description="" />
          <GlassCard className="mt-5 text-sm text-slate-300">Stay tuned for an exciting lineup of visionary entrepreneurs and dynamic discussions that will inspire and energize you.</GlassCard>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <GlassCard className="border border-cyan-300/20 bg-gradient-to-r from-cyan-500/10 via-slate-900/60 to-amber-400/10 text-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Prize Pool</p>
              <h2 className="mt-3 bg-gradient-to-r from-amber-300 via-cyan-200 to-amber-200 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">₹2,00,000 Prize Pool</h2>
              <p className="mt-3 text-sm text-slate-300">Exciting rewards for winners across all events!</p>
              <p className="mt-3 text-base font-semibold text-cyan-100">🎓 All participants will receive certificates</p>
            </div>
          </GlassCard>
        </section>

        <footer className="px-4 pb-8 pt-2 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
          © All rights reserved by E-Cell MITT
        </footer>
      </main>
    </SiteShell>
  );
}
