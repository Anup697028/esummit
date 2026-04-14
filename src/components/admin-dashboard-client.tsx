'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { allowedAdmins } from '@/lib/auth';
import { clientAuth } from '@/lib/firebase-client';
import { eventDefinitions } from '@/lib/events';
import type { EventSlug, RegistrationRecord } from '@/lib/types';

type EventLiveCount = {
  registered: number;
  checkedIn: number;
  remaining: number;
};

const EVENT_SECTIONS: Array<{ key: EventSlug; title: string }> = [
  { key: 'ideathon', title: 'Ideathon' },
  { key: 'fusion-x', title: 'Fusion X' },
  { key: 'case-study', title: 'Case Study' },
  { key: 'quiz', title: 'Quiz' },
  { key: 'elocution', title: 'Elocution' },
  { key: 'speaker-session', title: 'Speaker Session' }
];

const EVENT_LIMITS = Object.fromEntries(eventDefinitions.map((event) => [event.slug, event.maxTeams])) as Record<EventSlug, number>;

const eventThemes: Record<EventSlug, { card: string; border: string; badge: string; headerBorder: string; headerText: string }> = {
  ideathon: {
    card: 'from-amber-500/25 via-orange-500/10 to-rose-500/10',
    border: 'border-amber-400/30',
    badge: 'bg-amber-400/15 text-amber-100',
    headerBorder: 'border-amber-400/30',
    headerText: 'text-amber-300'
  },
  'fusion-x': {
    card: 'from-cyan-500/25 via-sky-500/10 to-blue-500/10',
    border: 'border-cyan-400/30',
    badge: 'bg-cyan-400/15 text-cyan-100',
    headerBorder: 'border-cyan-400/30',
    headerText: 'text-cyan-300'
  },
  'case-study': {
    card: 'from-emerald-500/25 via-teal-500/10 to-cyan-500/10',
    border: 'border-emerald-400/30',
    badge: 'bg-emerald-400/15 text-emerald-100',
    headerBorder: 'border-emerald-400/30',
    headerText: 'text-emerald-300'
  },
  quiz: {
    card: 'from-fuchsia-500/25 via-pink-500/10 to-rose-500/10',
    border: 'border-fuchsia-400/30',
    badge: 'bg-fuchsia-400/15 text-fuchsia-100',
    headerBorder: 'border-fuchsia-400/30',
    headerText: 'text-fuchsia-300'
  },
  elocution: {
    card: 'from-violet-500/25 via-indigo-500/10 to-cyan-500/10',
    border: 'border-violet-400/30',
    badge: 'bg-violet-400/15 text-violet-100',
    headerBorder: 'border-violet-400/30',
    headerText: 'text-violet-300'
  },
  'speaker-session': {
    card: 'from-rose-500/25 via-orange-500/10 to-amber-500/10',
    border: 'border-rose-400/30',
    badge: 'bg-rose-400/15 text-rose-100',
    headerBorder: 'border-rose-400/30',
    headerText: 'text-rose-300'
  }
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function getAuthHeaders() {
  const user = clientAuth.currentUser;
  if (!user) {
    throw new Error('Session expired. Please login again.');
  }

  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export function AdminDashboardClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [recordsByEvent, setRecordsByEvent] = useState<Partial<Record<EventSlug, RegistrationRecord[]>>>({});
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventSlug | null>(null);
  const [loadingEvent, setLoadingEvent] = useState<EventSlug | null>(null);
  const [csvDownloading, setCsvDownloading] = useState<EventSlug | null>(null);
  const [eventLiveCounts, setEventLiveCounts] = useState<Partial<Record<EventSlug, EventLiveCount>>>({});
  const [totals, setTotals] = useState<{ registered: number; checkedIn: number; remaining: number }>({
    registered: 0,
    checkedIn: 0,
    remaining: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [pagination, setPagination] = useState<{ page: number; pageSize: number; total: number }>({ page: 1, pageSize: 25, total: 0 });
  const [activeRecord, setActiveRecord] = useState<RegistrationRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingCheckIn, setSavingCheckIn] = useState(false);

  useEffect(() => {
    void signOut(clientAuth);
    setLoggedIn(false);
    setSelectedEvent(null);
    setRecordsByEvent({});
  }, []);

  const loadCounts = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/admin/registrations?summary=counts', { headers });
      const data = await response.json();
      const counts = typeof data.counts === 'object' && data.counts ? data.counts : {};
      const normalized = Object.fromEntries(
        EVENT_SECTIONS.map((section) => {
          const count = counts[section.key] ?? {};
          return [
            section.key,
            {
              registered: Number(count.registered ?? 0),
              checkedIn: Number(count.checkedIn ?? 0),
              remaining: Number(count.remaining ?? 0)
            }
          ];
        })
      ) as Partial<Record<EventSlug, EventLiveCount>>;

      setEventLiveCounts(normalized);
      const totalRegistered = Number(data.totalRegistered ?? data.total ?? 0);
      const totalCheckedIn = Number(data.totalCheckedIn ?? 0);
      setTotals({
        registered: totalRegistered,
        checkedIn: totalCheckedIn,
        remaining: Math.max(0, Number(data.totalRemaining ?? totalRegistered - totalCheckedIn))
      });
    } catch {
      setEventLiveCounts({});
      setTotals({ registered: 0, checkedIn: 0, remaining: 0 });
    }
  }, []);

  const loadEventRecords = useCallback(async (event: EventSlug, page = 1, silent = false) => {
    if (!silent) {
      setLoadingEvent(event);
      setMessage('');
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/admin/registrations?event=${event}&page=${page}&pageSize=${pageSize}`, { headers });
      const data = await response.json();
      const records = Array.isArray(data.records) ? (data.records as RegistrationRecord[]) : [];
      setRecordsByEvent((current) => ({ ...current, [event]: records }));
      setPagination(
        typeof data.pagination === 'object' && data.pagination
          ? {
              page: Number(data.pagination.page ?? page),
              pageSize: Number(data.pagination.pageSize ?? pageSize),
              total: Number(data.pagination.total ?? records.length)
            }
          : { page, pageSize, total: records.length }
      );
    } catch {
      if (!silent) {
        setMessage('Failed to load registrations');
      }
    } finally {
      if (!silent) {
        setLoadingEvent((current) => (current === event ? null : current));
      }
    }
  }, [pageSize]);

  useEffect(() => {
    if (!loggedIn) {
      return;
    }

    void loadCounts();
    const timer = window.setInterval(() => {
      void loadCounts();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [loggedIn, loadCounts]);

  useEffect(() => {
    if (!loggedIn || !selectedEvent) {
      return;
    }

    void loadEventRecords(selectedEvent, currentPage);
    const timer = window.setInterval(() => {
      void loadEventRecords(selectedEvent, currentPage, true);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [loggedIn, selectedEvent, currentPage, loadEventRecords]);

  const handleLogin = async () => {
    try {
      const credential = await signInWithEmailAndPassword(clientAuth, email, password);
      if (!credential.user.email || !allowedAdmins.includes(credential.user.email.toLowerCase())) {
        await signOut(clientAuth);
        setMessage('Not an allowed admin');
        return;
      }

      setLoggedIn(true);
      setMessage('Logged in');
    } catch {
      setMessage('Login failed');
    }
  };

  const updateCachedRecord = (registrationId: string, changes: Partial<RegistrationRecord>) => {
    setRecordsByEvent((current) => {
      const nextState: Partial<Record<EventSlug, RegistrationRecord[]>> = { ...current };
      for (const event of EVENT_SECTIONS) {
        const records = nextState[event.key];
        if (!records) {
          continue;
        }

        nextState[event.key] = records.map((record) => (record.registration_id === registrationId ? { ...record, ...changes } : record));
      }
      return nextState;
    });
  };

  const removeCachedRecord = (registrationId: string) => {
    setRecordsByEvent((current) => {
      const nextState: Partial<Record<EventSlug, RegistrationRecord[]>> = { ...current };
      for (const event of EVENT_SECTIONS) {
        const records = nextState[event.key];
        if (!records) {
          continue;
        }

        nextState[event.key] = records.filter((record) => record.registration_id !== registrationId);
      }
      return nextState;
    });
  };

  const handleSectionClick = async (event: EventSlug) => {
    const nextEvent = selectedEvent === event ? null : event;
    setSelectedEvent(nextEvent);
    setCurrentPage(1);
    if (nextEvent) {
      await loadEventRecords(nextEvent, 1);
    }
  };

  const goToPage = async (page: number) => {
    if (!selectedEvent || page < 1) {
      return;
    }

    const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
    const nextPage = Math.min(page, totalPages);
    setCurrentPage(nextPage);
    await loadEventRecords(selectedEvent, nextPage);
  };

  const downloadCsv = async (event: EventSlug) => {
    setCsvDownloading(event);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/admin/registrations?event=${event}&format=csv`, { headers });
      if (!response.ok) {
        throw new Error('CSV download failed');
      }

      const blob = await response.blob();
      downloadBlob(blob, `${event}-registrations.csv`);
    } catch {
      setMessage('Failed to download CSV');
    } finally {
      setCsvDownloading((current) => (current === event ? null : current));
    }
  };

  const changeRegistrationStatus = async (registrationId: string, status: RegistrationRecord['status']) => {
    let rejectionReason = '';
    if (status === 'Rejected') {
      const confirmed = window.confirm('Rejecting will permanently delete this registration. Continue?');
      if (!confirmed) {
        return;
      }

      rejectionReason = 'Rejected by admin.';
    }

    const headers = await getAuthHeaders();
    const response = await fetch('/api/admin/registrations/update-status', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationId, status, rejectionReason })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(typeof data.error === 'string' ? data.error : 'Failed to update status');
      return;
    }

    if (status === 'Rejected') {
      removeCachedRecord(registrationId);
      if (modalOpen && activeRecord?.registration_id === registrationId) {
        setModalOpen(false);
        setActiveRecord(null);
      }
      setMessage('Registration rejected and deleted.');
    } else {
      updateCachedRecord(registrationId, { status });
      setMessage('Registration approved successfully.');
    }

    await loadCounts();
    if (selectedEvent) {
      await loadEventRecords(selectedEvent, currentPage, true);
    }
  };

  const openDetails = async (registrationId: string) => {
    setModalOpen(true);
    setLoadingDetail(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/admin/registrations?registrationId=${encodeURIComponent(registrationId)}`, { headers });
      const data = await response.json();
      if (!response.ok || !data.record) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to load details');
      }
      setActiveRecord(data.record as RegistrationRecord);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load details');
      setModalOpen(false);
      setActiveRecord(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const confirmCheckIn = async (registrationId: string, method: 'manual' | 'qr') => {
    if (method === 'manual') {
      const approved = window.confirm('Are you sure you want to manually check-in this team?');
      if (!approved) {
        return;
      }
    }

    setSavingCheckIn(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/admin/registrations/check-in', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, method })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to check in team');
      }

      const changes: Partial<RegistrationRecord> = data.alreadyCheckedIn
        ? { checked_in: true }
        : { checked_in: true, checked_in_time: new Date().toISOString(), checkin_method: method };

      updateCachedRecord(registrationId, changes);
      setActiveRecord((current) => (current && current.registration_id === registrationId ? { ...current, ...changes } : current));
      setMessage(data.alreadyCheckedIn ? '✅ Already Checked In' : '✅ Checked In Successfully');

      await loadCounts();
      if (selectedEvent) {
        await loadEventRecords(selectedEvent, currentPage, true);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to check in team');
    } finally {
      setSavingCheckIn(false);
    }
  };

  if (!loggedIn) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h1 className="text-2xl font-semibold text-white">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-400">Allowed admins only</p>
          <div className="mt-6 space-y-4">
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Admin email" />
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
            <button className="w-full rounded-full bg-cyan-400 px-6 py-3 font-semibold text-slate-950" onClick={handleLogin}>Login</button>
            {message ? <p className="text-sm text-slate-300">{message}</p> : null}
          </div>
        </div>
      </main>
    );
  }

  const activeEventCounts = selectedEvent
    ? eventLiveCounts[selectedEvent] ?? { registered: 0, checkedIn: 0, remaining: 0 }
    : totals;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">Manage registrations, approvals, check-ins, and CSV export.</p>
          <p className="mt-2 text-sm text-cyan-300">Total registrations across all events: {totals.registered}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin-scanner" className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-2 text-sm text-cyan-100 transition hover:bg-cyan-300/20">
            Open Scanner
          </Link>
          <button className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white" onClick={() => signOut(clientAuth)}>Logout</button>
        </div>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Total Registered</p>
          <p className="mt-2 text-2xl font-semibold text-white">{activeEventCounts.registered}</p>
        </div>
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-200">Total Checked-In</p>
          <p className="mt-2 text-2xl font-semibold text-white">{activeEventCounts.checkedIn}</p>
        </div>
        <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-200">Remaining</p>
          <p className="mt-2 text-2xl font-semibold text-white">{activeEventCounts.remaining}</p>
        </div>
      </section>

      <section className="mt-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {EVENT_SECTIONS.map((section) => {
            const isSelected = selectedEvent === section.key;
            const isLoading = loadingEvent === section.key;
            const counts = eventLiveCounts[section.key] ?? { registered: 0, checkedIn: 0, remaining: 0 };
            const maxTeams = EVENT_LIMITS[section.key] ?? 60;
            const isFull = counts.registered >= maxTeams;
            const theme = eventThemes[section.key];
            return (
              <button
                key={section.key}
                type="button"
                onClick={() => void handleSectionClick(section.key)}
                className={`rounded-3xl border px-5 py-4 text-left transition ${isSelected ? `${theme.border} bg-gradient-to-br ${theme.card}` : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'}`}
                aria-expanded={isSelected}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-xs uppercase tracking-[0.3em] ${isSelected ? theme.headerText : 'text-slate-400'}`}>Event Division</p>
                    <h2 className="mt-2 text-xl font-semibold">{section.title}</h2>
                    <p className={`mt-2 text-sm ${isFull ? 'font-semibold text-rose-300' : 'text-slate-300'}`}>
                      Registered: {counts.registered} / {maxTeams}
                    </p>
                    <p className="mt-1 text-xs text-emerald-200">Checked-In: {counts.checkedIn} | Remaining: {counts.remaining}</p>
                  </div>
                  <span className="text-xs text-slate-400">{isSelected ? 'Open' : 'Closed'}</span>
                </div>
                <p className="mt-3 text-sm text-slate-400">{isLoading ? 'Loading registrations...' : 'Click to manage registrations and check-ins.'}</p>
              </button>
            );
          })}
        </div>
      </section>

      {selectedEvent ? (
        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className={`flex flex-col gap-4 border-b ${eventThemes[selectedEvent].headerBorder} bg-slate-950/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between`}>
            <div>
              <p className={`text-xs uppercase tracking-[0.3em] ${eventThemes[selectedEvent].headerText}`}>Active Event</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{EVENT_SECTIONS.find((section) => section.key === selectedEvent)?.title}</h2>
            </div>
            <button
              type="button"
              onClick={() => void downloadCsv(selectedEvent)}
              disabled={csvDownloading === selectedEvent}
              className="inline-flex items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-300/20 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {csvDownloading === selectedEvent ? 'Downloading...' : 'Download CSV'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1360px] w-full text-left text-sm text-slate-200">
              <thead className={`bg-gradient-to-r ${eventThemes[selectedEvent].card} text-xs uppercase tracking-[0.2em] text-slate-300`}>
                <tr>
                  <th className="px-4 py-4">Reg ID</th>
                  <th className="px-4 py-4">Team</th>
                  <th className="px-4 py-4">Team Leader</th>
                  <th className="px-4 py-4">Participants</th>
                  <th className="px-4 py-4">College</th>
                  <th className="px-4 py-4">Email</th>
                  <th className="px-4 py-4">Transaction ID</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Check-In Status</th>
                  <th className="px-4 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {(recordsByEvent[selectedEvent] ?? []).map((record) => (
                  <tr key={record.registration_id} className={`border-t ${eventThemes[selectedEvent].headerBorder}`}>
                    <td className="px-4 py-4">{record.registration_id}</td>
                    <td className="px-4 py-4">{record.team_name}</td>
                    <td className="px-4 py-4">{record.team_leader_name}</td>
                    <td className="px-4 py-4">{record.participants?.length ?? 0}</td>
                    <td className="px-4 py-4">{record.college}</td>
                    <td className="px-4 py-4">{record.email}</td>
                    <td className="px-4 py-4">{record.transaction_id}</td>
                    <td className="px-4 py-4">{record.status}</td>
                    <td className="px-4 py-4">{record.checked_in ? '✅ Checked In' : '❌ Not Checked In'}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-full border border-sky-300/30 bg-sky-300/20 px-4 py-2 text-xs font-medium text-sky-100 transition hover:bg-sky-300/30"
                          onClick={() => void openDetails(record.registration_id)}
                        >
                          View / Check-In
                        </button>
                        {(() => {
                          const isApproved = record.status === 'Approved';
                          const isRejected = record.status === 'Rejected';
                          return (
                            <>
                              <button
                                className="rounded-full border border-emerald-300/30 bg-emerald-300/20 px-4 py-2 text-xs font-medium text-emerald-100 transition hover:bg-emerald-300/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:blur-[0.5px]"
                                onClick={() => void changeRegistrationStatus(record.registration_id, 'Approved')}
                                disabled={isApproved || isRejected}
                              >
                                {isApproved ? 'Approved' : 'Approve'}
                              </button>
                              <button
                                className="rounded-full border border-rose-300/30 bg-rose-300/20 px-4 py-2 text-xs font-medium text-rose-100 transition hover:bg-rose-300/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:blur-[0.5px]"
                                onClick={() => void changeRegistrationStatus(record.registration_id, 'Rejected')}
                                disabled={isRejected || isApproved}
                              >
                                {isRejected ? 'Rejected' : 'Reject'}
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-4 text-sm text-slate-300">
            <p>
              Showing page {pagination.page} of {Math.max(1, Math.ceil(pagination.total / pagination.pageSize))} ({pagination.total} records total)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void goToPage(currentPage - 1)}
                disabled={currentPage <= 1 || loadingEvent === selectedEvent}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => void goToPage(currentPage + 1)}
                disabled={currentPage >= Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) || loadingEvent === selectedEvent}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {message ? <p className="mt-4 text-sm text-cyan-300">{message}</p> : null}

      {modalOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/95 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Team Details</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-200">Close</button>
            </div>

            {loadingDetail ? <p className="mt-5 text-sm text-slate-300">Loading team details...</p> : null}

            {!loadingDetail && activeRecord ? (
              <div className="mt-5 space-y-4 text-sm text-slate-200">
                <p><span className="text-slate-400">Registration ID:</span> {activeRecord.registration_id}</p>
                <p><span className="text-slate-400">Event Name:</span> {EVENT_SECTIONS.find((section) => section.key === activeRecord.event)?.title ?? activeRecord.event}</p>
                <p><span className="text-slate-400">Team Name:</span> {activeRecord.team_name}</p>
                <p><span className="text-slate-400">College:</span> {activeRecord.college}</p>
                <p><span className="text-slate-400">Email:</span> {activeRecord.email}</p>
                <p><span className="text-slate-400">Phone:</span> {activeRecord.phone}</p>
                <p><span className="text-slate-400">Transaction ID:</span> {activeRecord.transaction_id}</p>

                <div>
                  <p className="text-slate-400">Participants:</p>
                  <ul className="mt-2 space-y-1">
                    {(activeRecord.participants ?? []).map((participant, index) => (
                      <li key={`${participant.name}-${index}`}>
                        {participant.name} - {participant.usn ?? 'N/A'}
                      </li>
                    ))}
                  </ul>
                </div>

                {activeRecord.screenshot_url ? (
                  <a href={activeRecord.screenshot_url} target="_blank" rel="noreferrer" className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/15 px-4 py-2 text-cyan-100 hover:bg-cyan-300/25">
                    Payment Screenshot
                  </a>
                ) : null}

                <p className="font-semibold">{activeRecord.checked_in ? '✅ Already Checked In' : '❌ Not Checked In'}</p>

                {!activeRecord.checked_in ? (
                  <button
                    type="button"
                    onClick={() => void confirmCheckIn(activeRecord.registration_id, 'manual')}
                    disabled={savingCheckIn}
                    className="rounded-full border border-emerald-300/30 bg-emerald-300/20 px-5 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingCheckIn ? 'Updating...' : 'Confirm Check-In'}
                  </button>
                ) : (
                  <button type="button" disabled className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm text-slate-300">
                    ✅ Checked In Successfully
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
