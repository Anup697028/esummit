'use client';

import { useEffect, useRef, useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { allowedAdmins } from '@/lib/auth';
import { clientAuth } from '@/lib/firebase-client';
import { eventDefinitions } from '@/lib/events';
import type { RegistrationRecord } from '@/lib/types';

function extractRegistrationIdFromQr(raw: string) {
  const text = raw.trim();
  if (!text) {
    return '';
  }

  try {
    const parsed = JSON.parse(text) as { registration_id?: string };
    return String(parsed.registration_id ?? '').trim();
  } catch {
    return text;
  }
}

function getEventName(slug: string) {
  return eventDefinitions.find((event) => event.slug === slug)?.name ?? slug;
}

async function getAuthHeaders() {
  const user = clientAuth.currentUser;
  if (!user) {
    throw new Error('Session expired. Please login again.');
  }

  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export default function AdminScannerPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [record, setRecord] = useState<RegistrationRecord | null>(null);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [savingCheckIn, setSavingCheckIn] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const stopScanner = () => {
    if (animationRef.current != null) {
      window.cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }

    setScanning(false);
  };

  const loadRegistration = async (registrationId: string) => {
    setLoadingRecord(true);
    setMessage('');
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/admin/registrations?registrationId=${encodeURIComponent(registrationId)}`, { headers });
      const data = await response.json();
      if (!response.ok || !data.record) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Registration not found');
      }

      setRecord(data.record as RegistrationRecord);
      stopScanner();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to fetch team details');
    } finally {
      setLoadingRecord(false);
    }
  };

  const startScanner = async () => {
    setMessage('');
    setRecord(null);

    if (typeof window === 'undefined' || !(window as unknown as { BarcodeDetector?: unknown }).BarcodeDetector) {
      setMessage('QR scanner is not supported in this browser. Use manual registration ID check-in.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      streamRef.current = stream;

      if (!videoRef.current) {
        throw new Error('Camera preview not available');
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setScanning(true);

      const detector = new BarcodeDetector({ formats: ['qr_code'] });

      const scanFrame = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          animationRef.current = window.requestAnimationFrame(() => {
            void scanFrame();
          });
          return;
        }

        try {
          const barcodes = await detector.detect(videoRef.current);
          const qrCode = barcodes[0]?.rawValue ?? '';
          if (qrCode) {
            const registrationId = extractRegistrationIdFromQr(qrCode);
            if (!registrationId) {
              setMessage('QR code data is invalid.');
              stopScanner();
              return;
            }

            await loadRegistration(registrationId);
            return;
          }
        } catch {
          setMessage('Unable to read QR. Try scanning again.');
          stopScanner();
          return;
        }

        animationRef.current = window.requestAnimationFrame(() => {
          void scanFrame();
        });
      };

      animationRef.current = window.requestAnimationFrame(() => {
        void scanFrame();
      });
    } catch {
      setMessage('Camera access denied or unavailable. Use manual registration ID check-in.');
      stopScanner();
    }
  };

  useEffect(() => {
    void signOut(clientAuth);
    setLoggedIn(false);

    return () => {
      stopScanner();
    };
  }, []);

  useEffect(() => {
    if (!loggedIn) {
      return;
    }

    void startScanner();
  }, [loggedIn]);

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

  const confirmCheckIn = async () => {
    if (!record) {
      return;
    }

    setSavingCheckIn(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/admin/registrations/check-in', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: record.registration_id, method: 'qr' })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to confirm check-in');
      }

      if (data.alreadyCheckedIn) {
        setRecord((current) => (current ? { ...current, checked_in: true } : current));
        setMessage('✅ Already Checked In');
        return;
      }

      setRecord((current) =>
        current
          ? {
              ...current,
              checked_in: true,
              checked_in_time: new Date().toISOString(),
              checkin_method: 'qr'
            }
          : current
      );
      setMessage('✅ Checked In Successfully');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to confirm check-in');
    } finally {
      setSavingCheckIn(false);
    }
  };

  const handleManualLookup = async () => {
    const registrationId = manualCode.trim();
    if (!registrationId) {
      setMessage('Enter a registration ID to continue.');
      return;
    }

    await loadRegistration(registrationId);
  };

  if (!loggedIn) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h1 className="text-2xl font-semibold text-white">Admin Scanner Login</h1>
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

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Admin QR Scanner</h1>
          <p className="mt-2 text-sm text-slate-300">Scan QR, verify details, and confirm check-in.</p>
        </div>
        <button className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white" onClick={() => signOut(clientAuth)}>Logout</button>
      </div>

      {!record ? (
        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <video ref={videoRef} className="h-[340px] w-full rounded-2xl bg-slate-950 object-cover" autoPlay muted playsInline />
            <p className="mt-3 text-sm text-slate-300">{scanning ? 'Scanning in progress. Hold QR steady in frame.' : 'Scanner stopped. Use Scan Next Team to restart.'}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 lg:w-[320px]">
            <p className="text-sm text-slate-300">Manual fallback</p>
            <input
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white"
              placeholder="Enter registration ID"
            />
            <button className="mt-3 w-full rounded-full border border-cyan-300/30 bg-cyan-400/20 px-4 py-2.5 text-sm text-cyan-100" onClick={() => void handleManualLookup()}>
              Fetch Team Details
            </button>
            <button className="mt-3 w-full rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-slate-100" onClick={() => void startScanner()}>
              Restart Scanner
            </button>
          </div>
        </section>
      ) : null}

      {loadingRecord ? <p className="mt-4 text-sm text-slate-300">Loading team details...</p> : null}

      {record ? (
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
          <h2 className="text-xl font-semibold text-white">Team Details</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <p><span className="text-slate-400">Registration ID:</span> {record.registration_id}</p>
            <p><span className="text-slate-400">Event Name:</span> {getEventName(record.event)}</p>
            <p><span className="text-slate-400">Team Name:</span> {record.team_name}</p>
            <p><span className="text-slate-400">College:</span> {record.college}</p>
            <p><span className="text-slate-400">Email:</span> {record.email}</p>
            <p><span className="text-slate-400">Phone:</span> {record.phone}</p>
            <p><span className="text-slate-400">Transaction ID:</span> {record.transaction_id}</p>
          </div>

          <div className="mt-4">
            <p className="text-slate-400">Participants:</p>
            <ul className="mt-2 space-y-1">
              {(record.participants ?? []).map((participant, index) => (
                <li key={`${participant.name}-${index}`}>{participant.name} - {participant.usn ?? 'N/A'}</li>
              ))}
            </ul>
          </div>

          {record.screenshot_url ? (
            <a href={record.screenshot_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/15 px-4 py-2 text-cyan-100 hover:bg-cyan-300/25">
              Payment Screenshot
            </a>
          ) : null}

          <p className="mt-4 text-base font-semibold">{record.checked_in ? '✅ Already Checked In' : '❌ Not Checked In'}</p>

          <div className="mt-4 flex flex-wrap gap-3">
            {!record.checked_in ? (
              <button
                type="button"
                onClick={() => void confirmCheckIn()}
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
            <button
              type="button"
              onClick={() => {
                setRecord(null);
                void startScanner();
              }}
              className="rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm text-slate-100"
            >
              Scan Next Team
            </button>
          </div>
        </section>
      ) : null}

      {message ? <p className="mt-4 text-sm text-cyan-300">{message}</p> : null}
    </main>
  );
}
