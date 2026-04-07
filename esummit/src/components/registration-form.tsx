'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { BadgeCheck, FileText, Mail, PhoneCall, Sparkles, UserRound, Users2, Wallet } from 'lucide-react';
import type { EventDefinition } from '@/lib/types';

type Props = {
  event: EventDefinition;
};

type SpeakerRegistrationType = 'university' | 'individual';

const schema = z.object({
  teamName: z.string().min(2),
  teamLeaderName: z.string().min(2),
  participants: z.array(
    z.object({
      name: z.string().min(2, 'Required'),
      usn: z.string().min(1, 'Required')
    })
  ),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  college: z.string().min(2),
  semester: z.string().min(1),
  transactionId: z.string().min(2),
  screenshot: z.any(),
  participantCount: z.coerce.number().int().min(1)
});

const MAX_SCREENSHOT_SIZE = 1 * 1024 * 1024;

type FormValues = z.infer<typeof schema>;

export function RegistrationForm({ event }: Props) {
  const [message, setMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [generatedId, setGeneratedId] = useState<string>('');
  const [speakerRegistrationType, setSpeakerRegistrationType] = useState<SpeakerRegistrationType>('university');

  const isSpeakerSession = event.slug === 'speaker-session';
  const isIndividualSpeakerRegistration = isSpeakerSession && speakerRegistrationType === 'individual';

  const minParticipants = isIndividualSpeakerRegistration ? 1 : event.minParticipants;
  const maxParticipants = isIndividualSpeakerRegistration ? 1 : event.maxParticipants;

  const defaultParticipants = Array.from({ length: minParticipants }, () => ({ name: '', usn: '' }));

  const { register, handleSubmit, watch, getValues, setValue, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      semester: '',
      participantCount: minParticipants,
      participants: defaultParticipants
    }
  });

  const participantCount = watch('participantCount') ?? minParticipants;

  useEffect(() => {
    if (!isSpeakerSession) {
      return;
    }

    const forcedCount = isIndividualSpeakerRegistration ? 1 : event.minParticipants;
    setValue('participantCount', forcedCount, { shouldDirty: true, shouldTouch: false, shouldValidate: false });
  }, [isSpeakerSession, isIndividualSpeakerRegistration, event.minParticipants, setValue]);

  useEffect(() => {
    const count = Number.isNaN(participantCount) ? minParticipants : Math.max(minParticipants, Math.min(maxParticipants, participantCount));
    const current = getValues('participants');
    const existing = Array.isArray(current) ? current : [];
    const resized = Array.from({ length: count }, (_, index) => existing[index] ?? { name: '', usn: '' });
    setValue('participants', resized, { shouldDirty: true, shouldTouch: false, shouldValidate: false });
  }, [participantCount, minParticipants, maxParticipants, getValues, setValue]);

  const participantIndices = useMemo(() => {
    const count = Number.isNaN(participantCount) ? minParticipants : Math.max(minParticipants, Math.min(maxParticipants, participantCount));
    return Array.from({ length: count }, (_, index) => index);
  }, [participantCount, minParticipants, maxParticipants]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setMessage('');
    try {
      const screenshotFile = (values.screenshot as FileList | undefined)?.[0];
      if (!screenshotFile) {
        throw new Error('Payment screenshot is required');
      }

      if (!['image/jpeg', 'image/png'].includes(screenshotFile.type)) {
        throw new Error('Upload only JPG or PNG');
      }

      if (screenshotFile.size > MAX_SCREENSHOT_SIZE) {
        throw new Error('Screenshot must be 1 MB or smaller');
      }

      const uploadBody = new FormData();
      uploadBody.append('event', event.slug);
      uploadBody.append('file', screenshotFile);

      const uploadResponse = await fetch('/api/register/upload', {
        method: 'POST',
        body: uploadBody
      });
      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadData.error ?? 'Screenshot upload failed');
      }

      const screenshotUrl = String(uploadData.screenshotUrl ?? '');
      if (!screenshotUrl) {
        throw new Error('Screenshot upload failed');
      }

      const count = Math.max(minParticipants, Math.min(maxParticipants, values.participantCount));
      const participants = values.participants.slice(0, count);
      const participantNames = participants.map((item) => item.name.trim()).filter(Boolean);
      const participantUsns = participants.map((item) => (item.usn ?? '').trim());

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: event.slug,
          teamName: values.teamName,
          teamLeaderName: values.teamLeaderName,
          participantNames,
          participantUsns,
          registrationType: isSpeakerSession ? speakerRegistrationType : 'university',
          email: values.email,
          phone: values.phone,
          college: values.college,
          semester: values.semester,
          transactionId: values.transactionId,
          screenshotUrl
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Registration failed');
      }

      setGeneratedId(data.registration_id);
      setMessage('Registration submitted successfully. Status: Pending Verification');
      reset({
        teamName: '',
        teamLeaderName: '',
        participants: defaultParticipants,
        email: '',
        phone: '',
        college: '',
        semester: '',
        transactionId: '',
        screenshot: undefined,
        participantCount: minParticipants
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-950/80 via-slate-950/70 to-cyan-950/70 p-5 text-white shadow-[0_30px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-7">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.14),transparent_30%)]" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-cyan-400/20 via-violet-400/15 to-indigo-400/20 text-cyan-200 shadow-lg shadow-black/20">
            <FileText className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/80">Registration Form</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Register for {event.name}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">Fill in the team details carefully and submit the form to complete your event registration.</p>
          </div>
        </div>
      </div>

      {isSpeakerSession ? (
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm">
            <span className="flex items-center gap-2 font-medium text-slate-100"><Users2 className="h-4 w-4 text-cyan-200" /> Registration Type</span>
            <select
              className="w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3.5 text-white outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-400/20"
              value={speakerRegistrationType}
              onChange={(event) => setSpeakerRegistrationType(event.target.value as SpeakerRegistrationType)}
            >
              <option value="university">University Registration</option>
              <option value="individual">Individual Registration</option>
            </select>
          </label>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="group space-y-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm transition hover:border-cyan-300/30 hover:bg-white/7">
          <span className="flex items-center gap-2 font-medium text-slate-100"><UserRound className="h-4 w-4 text-cyan-200" /> Team Name</span>
          <input className="w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3.5 text-white outline-none ring-0 placeholder:text-slate-500 transition placeholder:font-normal focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-400/20" {...register('teamName')} placeholder="Enter your team name" />
          {errors.teamName ? <p className="text-xs text-rose-300">Required</p> : null}
        </label>
        <label className="group space-y-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm transition hover:border-cyan-300/30 hover:bg-white/7">
          <span className="flex items-center gap-2 font-medium text-slate-100"><UserRound className="h-4 w-4 text-cyan-200" /> Team Leader Name</span>
          <input className="w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3.5 text-white outline-none ring-0 placeholder:text-slate-500 transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-400/20" {...register('teamLeaderName')} placeholder="Enter team leader name" />
          {errors.teamLeaderName ? <p className="text-xs text-rose-300">Required</p> : null}
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="group space-y-2 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-white/5 to-blue-500/10 p-4 text-sm transition hover:border-cyan-300/30">
          <span className="flex items-center gap-2 font-medium text-slate-100"><Users2 className="h-4 w-4 text-cyan-200" /> Number of Participants</span>
          <input type="number" min={minParticipants} max={maxParticipants} className="w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3.5 text-white outline-none ring-0 placeholder:text-slate-500 transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60" {...register('participantCount', { valueAsNumber: true })} placeholder={`${minParticipants}-${maxParticipants}`} disabled={isIndividualSpeakerRegistration} />
          <p className="text-xs text-slate-300">Allowed: {minParticipants} to {maxParticipants}</p>
        </label>
      </div>

      <div className="space-y-4">
        {participantIndices.map((index) => (
          <div key={`participant-row-${index}`} className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="flex items-center gap-2 font-medium text-slate-100"><UserRound className="h-4 w-4 text-violet-200" /> Participant {index + 1} Name</span>
              <input className="w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-300/50 focus:ring-2 focus:ring-violet-400/20" {...register(`participants.${index}.name` as const)} placeholder={`Participant ${index + 1} name`} />
              {errors.participants?.[index]?.name ? <p className="text-xs text-rose-300">Required</p> : null}
            </label>
            <label className="space-y-2 text-sm">
              <span className="flex items-center gap-2 font-medium text-slate-100"><BadgeCheck className="h-4 w-4 text-violet-200" /> USN {index + 1}</span>
              <input className="w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-300/50 focus:ring-2 focus:ring-violet-400/20" {...register(`participants.${index}.usn` as const)} placeholder={`USN ${index + 1}`} />
              {errors.participants?.[index]?.usn ? <p className="text-xs text-rose-300">Required</p> : null}
            </label>
          </div>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm">
          <span className="flex items-center gap-2 font-medium text-slate-100"><Mail className="h-4 w-4 text-cyan-200" /> Email of Team Leader</span>
          <input type="email" className="w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-400/20" {...register('email')} placeholder="team@example.com" />
          {errors.email ? <p className="text-xs text-rose-300">{errors.email.message}</p> : null}
        </label>
        <label className="space-y-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm">
          <span className="flex items-center gap-2 font-medium text-slate-100"><PhoneCall className="h-4 w-4 text-cyan-200" /> Phone Number</span>
          <input
            inputMode="numeric"
            maxLength={10}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-400/20"
            {...register('phone')}
            onInput={(event) => {
              const target = event.currentTarget;
              target.value = target.value.replace(/\D/g, '').slice(0, 10);
            }}
            placeholder="10 digit number"
          />
          {errors.phone ? <p className="text-xs text-rose-300">{errors.phone.message}</p> : null}
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm">
          <span className="flex items-center gap-2 font-medium text-slate-100"><UserRound className="h-4 w-4 text-emerald-200" /> College Name</span>
          <input className="w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-400/20" {...register('college')} placeholder="College" />
        </label>
        <label className="space-y-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm">
          <span className="flex items-center gap-2 font-medium text-slate-100"><BadgeCheck className="h-4 w-4 text-emerald-200" /> Semester</span>
          <input className="w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-400/20" {...register('semester')} placeholder="Semester" />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/5 via-indigo-950/40 to-white/5 p-4 text-sm">
          <span className="flex items-center gap-2 font-medium text-slate-100"><Sparkles className="h-4 w-4 text-violet-200" /> Event</span>
          <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3.5 text-white outline-none transition" value={event.name} readOnly />
        </label>
        <label className="space-y-2 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/5 via-indigo-950/40 to-white/5 p-4 text-sm">
          <span className="flex items-center gap-2 font-medium text-slate-100"><Wallet className="h-4 w-4 text-violet-200" /> Transaction ID</span>
          <input className="w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-300/50 focus:ring-2 focus:ring-violet-400/20" {...register('transactionId')} placeholder="Transaction ID" />
        </label>
      </div>

      <label className="block space-y-3 rounded-[1.5rem] border border-dashed border-cyan-300/25 bg-white/5 p-4 text-sm">
        <span className="flex items-center gap-2 font-medium text-slate-100"><FileText className="h-4 w-4 text-cyan-200" /> Upload Payment Screenshot</span>
        <p className="text-xs text-slate-400">Only JPG or PNG, up to 1 MB.</p>
        <input type="file" accept="image/png,image/jpeg" className="w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-white file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950" {...register('screenshot')} />
      </label>

      {message ? <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">{message}{generatedId ? ` Registration ID: ${generatedId}` : ''}</p> : null}

      <button disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-indigo-400 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-950/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
        {submitting ? 'Submitting...' : 'Submit Registration'}
      </button>
    </form>
  );
}
