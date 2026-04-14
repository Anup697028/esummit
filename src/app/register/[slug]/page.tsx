import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { eventBySlug } from '@/lib/events';
import { getRegistrationCount } from '@/lib/registrations';
import { RegistrationForm } from '@/components/registration-form';
import type { EventSlug } from '@/lib/types';

export default async function EventRegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = eventBySlug(slug as EventSlug);
  if (!event) return notFound();
  const registeredTeams = await getRegistrationCount(event.slug);
  const isFull = registeredTeams >= event.maxTeams;
  const countRevealThreshold = event.slug === 'speaker-session' ? 100 : 10;
  const shouldShowLiveCount = registeredTeams >= countRevealThreshold;
  const registrationLabel = event.slug === 'speaker-session' || event.slug === 'quiz' ? 'Registered Participants' : 'Registered Teams';

  return (
    <main className="relative mx-auto max-w-5xl overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.08),transparent_35%)]" />
      <div className="mb-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-slate-950/60 to-indigo-950/50 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-violet-200/80">Registration</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Register for {event.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">Complete the form below with accurate details to submit your registration.</p>
      </div>

      <Link href={`/events/${event.slug}`} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-violet-300 transition hover:text-violet-200">
        <ArrowLeft className="h-4 w-4" /> Back to event details
      </Link>
      {isFull ? (
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-rose-500/20 via-pink-500/10 to-fuchsia-500/10 p-6 text-center shadow-2xl shadow-black/25 backdrop-blur-xl">
          {shouldShowLiveCount ? <p className="text-sm text-white/80">{registrationLabel}: {registeredTeams} / {event.maxTeams}</p> : null}
          <p className="mt-2 text-lg font-semibold text-white">Registrations Closed - Slots Full</p>
        </div>
      ) : (
        <RegistrationForm event={event} />
      )}
    </main>
  );
}
