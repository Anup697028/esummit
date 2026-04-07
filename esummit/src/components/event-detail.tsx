import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Layers3, Wallet, Sparkles } from 'lucide-react';
import { GlassCard, SectionTitle } from '@/components/ui';
import { eventBySlug } from '@/lib/events';
import { getRulesDownloadConfig } from '@/lib/rules';
import { getRegistrationCount } from '@/lib/registrations';
import type { EventSlug } from '@/lib/types';

const detailThemes = {
  hero: 'from-cyan-500/25 via-sky-500/10 to-blue-500/10 border-cyan-400/30',
  live: 'from-violet-500/25 via-indigo-500/10 to-purple-500/10 border-violet-400/30',
  rules: 'from-amber-500/25 via-orange-500/10 to-yellow-500/10 border-amber-400/30',
  contacts: 'from-emerald-500/25 via-teal-500/10 to-cyan-500/10 border-emerald-400/30',
  payment: 'from-rose-500/25 via-pink-500/10 to-fuchsia-500/10 border-rose-400/30',
  download: 'from-slate-500/20 via-cyan-500/10 to-emerald-500/10 border-slate-300/20'
} as const;

type CoordinatorInfo = {
  faculty?: {
    name: string;
    phone: string;
  };
  students: Array<{
    name: string;
    phone: string;
    email: string;
  }>;
};

const EVENT_COORDINATORS: Record<EventSlug, CoordinatorInfo> = {
  'case-study': {
    faculty: { name: 'Mr. Manjunath', phone: '8095218110' },
    students: [
      { name: 'Beerabbi Basavaraja', phone: '7204488641', email: 'bbeerabbi@gmail.com' },
      { name: 'Misbah Khanum', phone: '9762539924', email: 'khanammisba489@gmail.com' }
    ]
  },
  elocution: {
    faculty: { name: 'Dr. Shyam Boregowda', phone: '+91 9620228052' },
    students: [
      { name: 'Bibi Irrum', phone: '9741615544', email: 'bibiirrum39@gmail.com' },
      { name: 'Binziya K A', phone: '9845879205', email: 'binziyaka@gmail.com' }
    ]
  },
  'fusion-x': {
    faculty: { name: 'Dr. Sunil', phone: '+91 9739459309' },
    students: [
      { name: 'Ankith Hegde', phone: '9356235112', email: 'hegdeankith04@gmail.com' },
      { name: 'Shreema', phone: '8073182571', email: 'shreema.srinivasa1881@gmail.com' }
    ]
  },
  ideathon: {
    faculty: { name: 'Mr. Shivmanjesh', phone: '+91 9538397656' },
    students: [
      { name: 'Divya H', phone: '7019231891', email: 'divyahgowda0901@gmail.com' },
      { name: 'Simran Shariff', phone: '8073565448', email: 'simranshariff1103@gmail.com' }
    ]
  },
  quiz: {
    faculty: { name: 'Mr. Prabodh Sai Dutt', phone: '+91 9686600658' },
    students: [
      { name: 'Ameen Baig', phone: '7760392787', email: 'baig.ameen04@gmail.com' },
      { name: 'Manvanth M', phone: '9611849359', email: 'manvanth926@gmail.com' }
    ]
  },
  'speaker-session': {
    faculty: { name: 'Mr. Pramod Kumar', phone: '+91 9535778512' },
    students: [
      { name: 'Manasvi Yogesh Patel', phone: '8197911266', email: 'manasvi.patel17@gmail.com' },
      { name: 'Alina', phone: '+91 9035130105', email: 'saldanhaalina@gmail.com' }
    ]
  }
};

function ruleBlock(slug: EventSlug, maxTeams: number) {
  if (slug === 'case-study') return ['Team size: 3–4', `Max teams: ${maxTeams}`, 'Fee: ₹699 per team', 'Faculty Coordinator: Mr. Manjunath | 8095218110'];
  if (slug === 'quiz') return ['Team size: exactly 2', `Max participants: ${maxTeams}`, 'Fee: ₹399 per team'];
  if (slug === 'elocution') return ['Team size: exactly 2', `Max teams: ${maxTeams}`, 'Fee: ₹399 per team'];
  if (slug === 'speaker-session') return ['Individual or university registration (3 to 4 participants)', `Max participants: ${maxTeams}`, 'Fee: ₹100 per participant'];
  return ['Team size: 3–4', `Max teams: ${maxTeams}`, 'Fee: ₹699 per team'];
}

export async function EventDetailPage({ slug }: { slug: EventSlug }) {
  const event = eventBySlug(slug);
  if (!event) notFound();
  const coordinators = EVENT_COORDINATORS[event.slug];

  const registered = await getRegistrationCount(event.slug);
  const isFull = registered >= event.maxTeams;
  const rulesDownload = getRulesDownloadConfig(event.slug);
  const isSpeakerSession = event.slug === 'speaker-session';
  const registrationLabel = isSpeakerSession || event.slug === 'quiz' ? 'Registered Participants' : 'Registered Teams';

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/events" className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Link>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className={`group relative overflow-hidden border ${detailThemes.hero} bg-gradient-to-br ${detailThemes.hero} transition-all duration-300 hover:-translate-y-1 hover:border-white/50 hover:shadow-2xl hover:shadow-black/40`}>
          <div className="flex items-center gap-3">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-cyan-300 transition duration-300 group-hover:scale-110">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">{event.category}</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">{event.name}</h1>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/85">{event.description}</p>
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 via-transparent to-white/0 opacity-0 transition group-hover:opacity-100" />
        </GlassCard>

        <GlassCard className={`group relative overflow-hidden border ${detailThemes.live} bg-gradient-to-br ${detailThemes.live} transition-all duration-300 hover:-translate-y-1 hover:border-white/50 hover:shadow-2xl hover:shadow-black/40`}>
          <SectionTitle eyebrow="Live" title={`${registrationLabel}: ${registered} / ${event.maxTeams}`} description="Real-time count from Firestore registrations." />
          {isFull ? (
            <>
              <button type="button" disabled className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-violet-400 px-6 py-3 text-sm font-semibold text-slate-950 opacity-70 transition">
                Register
              </button>
              <p className="mt-3 text-center text-sm font-medium text-violet-100">Registrations Closed - Slots Full</p>
            </>
          ) : (
            <Link href={`/register/${event.slug}`} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-violet-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-300">
              Register
            </Link>
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 via-transparent to-white/0 opacity-0 transition group-hover:opacity-100" />
        </GlassCard>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <GlassCard className={`group relative overflow-hidden border ${detailThemes.rules} bg-gradient-to-br ${detailThemes.rules} transition-all duration-300 hover:-translate-y-1 hover:border-white/50 hover:shadow-2xl hover:shadow-black/40`}>
          <div className="flex items-center gap-2 text-amber-100"><Layers3 className="h-5 w-5" /> Rules</div>
          <div className="mt-4 space-y-4 text-base text-white/95">
            {ruleBlock(event.slug, event.maxTeams).map((rule: string) => (
              <p key={rule} className="text-lg font-semibold leading-8">{rule}</p>
            ))}
            <p className="pt-2 text-lg font-semibold leading-8 text-amber-50">A team may compete in only one event.</p>
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 via-transparent to-white/0 opacity-0 transition group-hover:opacity-100" />
        </GlassCard>

        <GlassCard className={`group relative overflow-hidden border ${detailThemes.contacts} bg-gradient-to-br ${detailThemes.contacts} transition-all duration-300 hover:-translate-y-1 hover:border-white/50 hover:shadow-2xl hover:shadow-black/40`}>
          <SectionTitle eyebrow="Coordinators" title="Event Contacts" />
          <div className="mt-3 space-y-5 text-base text-white/90">
            {coordinators.faculty ? (
              <div className="rounded-lg border border-white/15 bg-white/5 p-4">
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-100/90">Faculty Coordinator</p>
                <p className="mt-2 leading-7">{coordinators.faculty.name} | {coordinators.faculty.phone}</p>
              </div>
            ) : null}
            <div className="rounded-lg border border-white/15 bg-white/5 p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-100/90">Student Coordinators</p>
              <div className="mt-3 space-y-3">
                {coordinators.students.map((student, index) => (
                  <p key={student.email} className="leading-7">
                    {index + 1}. {student.name} | {student.phone} |{' '}
                    <a href={`mailto:${student.email}`} className="text-cyan-200 underline decoration-cyan-300/70 underline-offset-2 hover:text-cyan-100">
                      {student.email}
                    </a>
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 via-transparent to-white/0 opacity-0 transition group-hover:opacity-100" />
        </GlassCard>

        <GlassCard className={`group relative overflow-hidden border ${detailThemes.payment} bg-gradient-to-br ${detailThemes.payment} transition-all duration-300 hover:-translate-y-1 hover:border-white/50 hover:shadow-2xl hover:shadow-black/40`}>
          <div className="flex items-center gap-2 text-rose-100"><Wallet className="h-5 w-5" /> Payment Details</div>
          <div className="mt-4 space-y-4 text-sm text-white/90">
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="mb-3 text-center text-xs uppercase tracking-[0.2em] text-rose-100/95">Scan to Pay</p>
              <img
                src="/logo/qrpayment.png"
                alt="Scan to Pay"
                width={208}
                height={208}
                className="mx-auto h-[208px] w-[208px] max-w-full rounded-lg bg-white p-2 object-contain"
              />
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="leading-6">Account Name: MIT Thandavapura</p>
              <p className="leading-6">Account Number: 50100482039482</p>
              <p className="leading-6">IFSC Code: HDFC0002132</p>
              <p className="leading-6">Bank: HDFC Bank</p>
              <p className="leading-6">Branch: Nanjangud Branch, Mysuru</p>
            </div>
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 via-transparent to-white/0 opacity-0 transition group-hover:opacity-100" />
        </GlassCard>
      </section>

      {!isSpeakerSession ? <section className="mt-6">
        <GlassCard className={`group relative flex flex-col gap-4 overflow-hidden border ${detailThemes.download} bg-gradient-to-br ${detailThemes.download} transition-all duration-300 hover:-translate-y-1 hover:border-white/50 hover:shadow-2xl hover:shadow-black/40 sm:flex-row sm:items-center sm:justify-between`}>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Download Rules</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Download Rules PDF</h2>
            <p className="mt-2 text-sm text-white/85">{rulesDownload.available ? 'Get the official event rules document.' : 'Rules download is disabled for now.'}</p>
          </div>
          {rulesDownload.available ? (
            <a href={`/api/rules/${event.slug}`} className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
              {rulesDownload.label}
            </a>
          ) : (
            <button type="button" disabled className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 opacity-60">
              {rulesDownload.label}
            </button>
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 via-transparent to-white/0 opacity-0 transition group-hover:opacity-100" />
        </GlassCard>
      </section> : null}
    </main>
  );
}
