import { adminDb } from './firebase-admin';
import { eventBySlug } from './events';
import type { EventSlug, RegistrationParticipant, RegistrationRecord } from './types';
import { sendMail } from './mail';
import { revalidatePath } from 'next/cache';
import type { Transaction } from 'firebase-admin/firestore';

const COUNTER_MAP: Record<EventSlug, string> = {
  ideathon: 'IDE',
  'fusion-x': 'FUS',
  'case-study': 'CAS',
  quiz: 'QIZ',
  elocution: 'ELO',
  'speaker-session': 'SPS'
};

type EventCoordinators = {
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

const EVENT_COORDINATORS: Record<EventSlug, EventCoordinators> = {
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

function getCoordinatorEmailHtml(eventSlug: EventSlug) {
  const coordinators = EVENT_COORDINATORS[eventSlug];
  const facultyLine = coordinators.faculty
    ? `<p style="margin:0 0 8px 0;"><strong>Faculty Coordinator:</strong><br />${coordinators.faculty.name} | ${coordinators.faculty.phone}</p>`
    : '';

  const studentsLines = coordinators.students
    .map(
      (student, index) =>
        `<p style="margin:0 0 8px 0;">${index + 1}. ${student.name} | ${student.phone} | <a href="mailto:${student.email}">${student.email}</a></p>`
    )
    .join('');

  return `
    ${facultyLine}
    <p style="margin:0 0 6px 0;"><strong>Student Coordinators:</strong></p>
    ${studentsLines}
  `;
}

export async function getRegistrationCount(event: EventSlug) {
  const eventDefinition = eventBySlug(event);
  const maxTeams = eventDefinition?.maxTeams ?? 60;
  const eventDoc = await adminDb.collection('events').doc(event).get();
  const cachedCount = Number(eventDoc.data()?.registered_count ?? NaN);
  if (event !== 'speaker-session' && Number.isFinite(cachedCount) && cachedCount >= 0) {
    return cachedCount;
  }

  let count = 0;
  if (event === 'speaker-session' || event === 'quiz') {
    const snapshot = await adminDb.collection('registrations').where('event', '==', event).get();
    count = snapshot.docs.reduce((total, doc) => {
      const data = doc.data() as RegistrationRecord;
      const participants = Array.isArray(data.participants) ? data.participants.length : 0;
      if (event === 'quiz') {
        return total + Math.max(0, participants);
      }
      return total + Math.max(1, participants);
    }, 0);
  } else {
    const snapshot = await adminDb.collection('registrations').where('event', '==', event).get();
    count = snapshot.size;
  }
  await adminDb
    .collection('events')
    .doc(event)
    .set(
      {
        registered_count: count,
        fee: eventDefinition?.fee ?? null,
        registration_open: count < maxTeams,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  return count;
}

export async function createRegistrationId(event: EventSlug, maxTeams: number) {
  const shortCode = COUNTER_MAP[event];
  const counterRef = adminDb.collection('eventCounters').doc(event);

  const serial = await adminDb.runTransaction(async (transaction: Transaction) => {
    const snapshot = await transaction.get(counterRef);
    const current = snapshot.exists ? Number(snapshot.data()?.count ?? 0) : 0;
    const next = current + 1;
    if (next > maxTeams) {
      throw new Error('Registration limit reached');
    }
    transaction.set(counterRef, { count: next, updatedAt: new Date().toISOString() }, { merge: true });
    return next;
  });

  return {
    registrationId: `${shortCode}-${String(serial).padStart(3, '0')}`,
    serial
  };
}

export async function createRegistration(input: {
  event: EventSlug;
  teamName: string;
  teamLeaderName: string;
  participants: RegistrationParticipant[];
  email: string;
  phone: string;
  college: string;
  semester: string;
  transactionId: string;
  screenshotUrl: string;
}) {
  const event = eventBySlug(input.event);
  if (!event) {
    throw new Error('Invalid event');
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedTeamName = input.teamName.trim().toLowerCase().replace(/\s+/g, ' ');

  const eventRef = adminDb.collection('events').doc(input.event);
  const registrationsRef = adminDb.collection('registrations');
  const [eventDoc, existingGlobalEmail, existingLegacyEmail, registrationsForEventSnapshot] = await Promise.all([
    eventRef.get(),
    registrationsRef.where('email_normalized', '==', normalizedEmail).limit(1).get(),
    registrationsRef.where('email', '==', input.email.trim()).limit(1).get(),
    registrationsRef.where('event', '==', input.event).get()
  ]);

  const registrationOpen = eventDoc.exists ? Boolean(eventDoc.data()?.registration_open) : true;
  if (!registrationOpen) {
    throw new Error('Registration is closed for this event');
  }

  if (!existingGlobalEmail.empty) {
    throw new Error('This email is already registered for another event');
  }

  if (!existingLegacyEmail.empty) {
    throw new Error('This email is already registered for another event');
  }

  const duplicateTeamName = registrationsForEventSnapshot.docs.some((doc) => {
    const data = doc.data() as Partial<RegistrationRecord> & { team_name_normalized?: string };
    const existingNormalized = String(data.team_name_normalized ?? data.team_name ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
    return existingNormalized.length > 0 && existingNormalized === normalizedTeamName;
  });

  if (duplicateTeamName) {
    throw new Error('Team name already exists for this event');
  }

  const slotsNeeded =
    input.event === 'speaker-session'
      ? Math.max(1, input.participants.length)
      : input.event === 'quiz'
        ? Math.max(0, input.participants.length)
        : 1;
  const { registrationId } = await createRegistrationId(input.event, event.maxTeams);
  const nowIso = new Date().toISOString();
  const record: RegistrationRecord = {
    registration_id: registrationId,
    event: input.event,
    team_name: input.teamName,
    team_leader_name: input.teamLeaderName,
    participants: input.participants,
    email: input.email,
    email_normalized: normalizedEmail,
    phone: input.phone,
    college: input.college,
    semester: input.semester,
    transaction_id: input.transactionId,
    screenshot_url: input.screenshotUrl,
    team_name_normalized: normalizedTeamName,
    status: 'Pending Verification',
    createdAt: nowIso
  };

  await adminDb.runTransaction(async (transaction) => {
    const eventSnapshot = await transaction.get(eventRef);
    let currentRegistrations = Number(eventSnapshot.data()?.registered_count ?? NaN);

    if (input.event === 'speaker-session' || input.event === 'quiz' || !Number.isFinite(currentRegistrations) || currentRegistrations < 0) {
      const registrationsSnapshot = await transaction.get(registrationsRef.where('event', '==', input.event));
      if (input.event === 'speaker-session') {
        currentRegistrations = registrationsSnapshot.docs.reduce((total, doc) => {
          const data = doc.data() as RegistrationRecord;
          const participants = Array.isArray(data.participants) ? data.participants.length : 0;
          return total + Math.max(1, participants);
        }, 0);
      } else if (input.event === 'quiz') {
        currentRegistrations = registrationsSnapshot.docs.reduce((total, doc) => {
          const data = doc.data() as RegistrationRecord;
          const participants = Array.isArray(data.participants) ? data.participants.length : 0;
          return total + Math.max(0, participants);
        }, 0);
      } else {
        currentRegistrations = registrationsSnapshot.size;
      }
    }

    const nextRegistrations = currentRegistrations + slotsNeeded;
    if (nextRegistrations > event.maxTeams) {
      throw new Error('Registration limit reached');
    }

    const recordRef = registrationsRef.doc(registrationId);
    transaction.set(recordRef, record);
    transaction.set(
      eventRef,
      {
        registered_count: nextRegistrations,
        max_teams: event.maxTeams,
        fee: event.fee,
        registration_open: nextRegistrations < event.maxTeams,
        updatedAt: nowIso
      },
      { merge: true }
    );
  });
  revalidatePath(`/events/${input.event}`);
  revalidatePath(`/register/${input.event}`);

  const collegeLogoCid = 'college-logo';
  const ecellLogoCid = 'ecell-logo';
  const collegeLogoPath = `${process.cwd()}/logo/mit-logo.png`;
  const ecellLogoPath = `${process.cwd()}/logo/logo.png`;

  void sendMail({
    to: record.email,
    subject: `Registration Received - ${record.registration_id}`,
    attachments: [
      {
        filename: 'mit-logo.png',
        path: collegeLogoPath,
        cid: collegeLogoCid
      },
      {
        filename: 'logo.png',
        path: ecellLogoPath,
        cid: ecellLogoCid
      }
    ],
    html: `
      <html>
        <head>
          <meta name="color-scheme" content="light only">
        </head>
        <body style="margin:0;padding:0;background:#f8fafc;">
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;background:#f8fafc;padding:24px 16px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
          <tr>
            <td style="padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;background:#ffffff;border-top-left-radius:12px;border-top-right-radius:12px;">
                <tr>
                  <td style="padding:24px 26px 22px 26px;border-bottom:1px solid #e2e8f0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 auto;">
                      <tr>
                        <td width="33%" align="center" valign="middle" style="vertical-align:middle;background:#ffffff;line-height:0;padding:6px 8px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="background:#ffffff;border-radius:6px;">
                            <tr>
                              <td style="background-color:#ffffff;padding:5px;border-radius:6px;">
                                <img src="cid:${collegeLogoCid}" alt="MITT" style="height:46px;width:auto;display:block;margin:0 auto;" />
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="34%" align="center" style="vertical-align:middle;padding:0 8px;">
                          <h1 style="margin:0;font-size:21px;font-weight:700;line-height:1.2;color:#0f172a;text-align:center;">EntreMITT</h1>
                        </td>
                        <td width="33%" align="center" valign="middle" style="vertical-align:middle;background:#ffffff;line-height:0;padding:6px 8px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="background:#ffffff;border-radius:6px;">
                            <tr>
                              <td style="background-color:#ffffff;padding:5px;border-radius:6px;">
                                <img src="cid:${ecellLogoCid}" alt="E-Cell" style="height:46px;width:auto;display:block;margin:0 auto;" />
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 24px 24px 24px;color:#0f172a;">
          <p style="margin:0 0 12px 0;">Dear ${record.team_leader_name || record.team_name},</p>
          <p style="margin:0 0 12px 0;">Thank you for registering your team <strong>${record.team_name}</strong> for <strong>${event.name}</strong> in EntreMITT.</p>
          <p style="margin:0 0 18px 0;">Your payment transaction is currently under verification. Our team will review your submission shortly.</p>

          <table style="width:100%;border-collapse:collapse;margin:0 0 18px 0;background:#ffffff;color:#0f172a;border-radius:8px;overflow:hidden;">
            <tbody>
              <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Registration ID</td><td style="padding:8px;border:1px solid #e2e8f0;">${record.registration_id}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Event Name</td><td style="padding:8px;border:1px solid #e2e8f0;">${event.name}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Team Name</td><td style="padding:8px;border:1px solid #e2e8f0;">${record.team_name}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Team Leader Name</td><td style="padding:8px;border:1px solid #e2e8f0;">${record.team_leader_name || ''}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Email</td><td style="padding:8px;border:1px solid #e2e8f0;">${record.email}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Phone</td><td style="padding:8px;border:1px solid #e2e8f0;">${record.phone}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">College</td><td style="padding:8px;border:1px solid #e2e8f0;">${record.college}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Transaction ID</td><td style="padding:8px;border:1px solid #e2e8f0;">${record.transaction_id}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Status</td><td style="padding:8px;border:1px solid #e2e8f0;">Pending Verification</td></tr>
            </tbody>
          </table>

          <p style="margin:0 0 8px 0;"><strong>For further details or queries, please contact:</strong></p>
          ${getCoordinatorEmailHtml(record.event)}
            </td>
          </tr>
        </table>
          </div>
        </body>
      </html>
    `
  }).catch(() => undefined);

  return record;
}

export async function notifyTeam(record: RegistrationRecord) {
  const event = eventBySlug(record.event);
  if (!event) {
    throw new Error('Invalid event');
  }

  const collegeLogoCid = 'college-logo';
  const ecellLogoCid = 'ecell-logo';
  const collegeLogoPath = `${process.cwd()}/logo/mit-logo.png`;
  const ecellLogoPath = `${process.cwd()}/logo/logo.png`;

  return sendMail({
    to: record.email,
    subject: `Registration Confirmed - ${record.registration_id}`,
    attachments: [
      {
        filename: 'mit-logo.png',
        path: collegeLogoPath,
        cid: collegeLogoCid
      },
      {
        filename: 'logo.png',
        path: ecellLogoPath,
        cid: ecellLogoCid
      }
    ],
    html: `
      <html>
        <head>
          <meta name="color-scheme" content="light only">
        </head>
        <body style="margin:0;padding:0;background:#f8fafc;">
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;background:#f8fafc;padding:24px 16px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
          <tr>
            <td style="padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;background:#ffffff;border-top-left-radius:12px;border-top-right-radius:12px;">
                <tr>
                  <td style="padding:24px 26px 22px 26px;border-bottom:1px solid #e2e8f0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 auto;">
                      <tr>
                        <td width="33%" align="center" valign="middle" style="vertical-align:middle;background:#ffffff;line-height:0;padding:6px 8px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="background:#ffffff;border-radius:6px;">
                            <tr>
                              <td style="background-color:#ffffff;padding:5px;border-radius:6px;">
                                <img src="cid:${collegeLogoCid}" alt="MITT" style="height:46px;width:auto;display:block;margin:0 auto;" />
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="34%" align="center" style="vertical-align:middle;padding:0 8px;">
                          <h1 style="margin:0;font-size:21px;font-weight:700;line-height:1.2;color:#0f172a;text-align:center;">EntreMITT</h1>
                        </td>
                        <td width="33%" align="center" valign="middle" style="vertical-align:middle;background:#ffffff;line-height:0;padding:6px 8px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="background:#ffffff;border-radius:6px;">
                            <tr>
                              <td style="background-color:#ffffff;padding:5px;border-radius:6px;">
                                <img src="cid:${ecellLogoCid}" alt="E-Cell" style="height:46px;width:auto;display:block;margin:0 auto;" />
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 24px 24px 24px;color:#0f172a;">
          <p style="margin:0 0 12px 0;">Dear ${record.team_leader_name || record.team_name},</p>
          <p style="margin:0 0 12px 0;">Congratulations! 🎉</p>
          <p style="margin:0 0 12px 0;">We are pleased to inform you that your team <strong>${record.team_name}</strong> has been successfully registered for <strong>${event.name}</strong> at EntreMITT, scheduled on 30th April.</p>
          <p style="margin:0 0 12px 0;">We are excited and look forward to your participation in the event.</p>
          <p style="margin:0 0 18px 0;">Your payment transaction has been successfully verified.</p>

          <table style="width:100%;border-collapse:collapse;margin:0 0 18px 0;background:#ffffff;color:#0f172a;border-radius:8px;overflow:hidden;">
            <tbody>
              <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Registration ID</td><td style="padding:8px;border:1px solid #e2e8f0;">${record.registration_id}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Event Name</td><td style="padding:8px;border:1px solid #e2e8f0;">${event.name}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Team Name</td><td style="padding:8px;border:1px solid #e2e8f0;">${record.team_name}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Transaction ID</td><td style="padding:8px;border:1px solid #e2e8f0;">${record.transaction_id}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Status</td><td style="padding:8px;border:1px solid #e2e8f0;">Approved</td></tr>
            </tbody>
          </table>

          <p style="margin:0 0 18px 0;">Please note that this email serves as your official confirmation and must be presented during entry to the event.</p>

          <p style="margin:0 0 8px 0;"><strong>For any queries, contact:</strong></p>
          ${getCoordinatorEmailHtml(record.event)}
            </td>
          </tr>
        </table>
          </div>
        </body>
      </html>
    `
  });
}

export async function notifyRejection(record: RegistrationRecord, reason: string) {
  const event = eventBySlug(record.event);
  if (!event) {
    throw new Error('Invalid event');
  }

  const collegeLogoCid = 'college-logo';
  const ecellLogoCid = 'ecell-logo';
  const collegeLogoPath = `${process.cwd()}/logo/mit-logo.png`;
  const ecellLogoPath = `${process.cwd()}/logo/logo.png`;

  return sendMail({
    to: record.email,
    subject: `Registration Update - ${record.registration_id}`,
    attachments: [
      {
        filename: 'mit-logo.png',
        path: collegeLogoPath,
        cid: collegeLogoCid
      },
      {
        filename: 'logo.png',
        path: ecellLogoPath,
        cid: ecellLogoCid
      }
    ],
    html: `
      <html>
        <head>
          <meta name="color-scheme" content="light only">
        </head>
        <body style="margin:0;padding:0;background:#f8fafc;">
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;background:#f8fafc;padding:24px 16px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
              <tr>
                <td style="padding:24px 26px 22px 26px;border-bottom:1px solid #e2e8f0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 auto;">
                    <tr>
                      <td width="33%" align="center" valign="middle" style="vertical-align:middle;background:#ffffff;line-height:0;padding:6px 8px;">
                        <img src="cid:${collegeLogoCid}" alt="MITT" style="height:46px;width:auto;display:block;margin:0 auto;" />
                      </td>
                      <td width="34%" align="center" style="vertical-align:middle;padding:0 8px;">
                        <h1 style="margin:0;font-size:21px;font-weight:700;line-height:1.2;color:#0f172a;text-align:center;">EntreMITT</h1>
                      </td>
                      <td width="33%" align="center" valign="middle" style="vertical-align:middle;background:#ffffff;line-height:0;padding:6px 8px;">
                        <img src="cid:${ecellLogoCid}" alt="E-Cell" style="height:46px;width:auto;display:block;margin:0 auto;" />
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:22px 24px 24px 24px;color:#0f172a;">
                  <p style="margin:0 0 12px 0;">Dear ${record.team_leader_name || record.team_name},</p>
                  <p style="margin:0 0 12px 0;">Thank you for your interest in <strong>${event.name}</strong> at EntreMITT.</p>
                  <p style="margin:0 0 12px 0;">Unfortunately, your registration was not selected at this stage.</p>
                  <p style="margin:0 0 18px 0;"><strong>Reason:</strong> ${reason}</p>

                  <table style="width:100%;border-collapse:collapse;margin:0 0 18px 0;background:#ffffff;color:#0f172a;border-radius:8px;overflow:hidden;">
                    <tbody>
                      <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Registration ID</td><td style="padding:8px;border:1px solid #e2e8f0;">${record.registration_id}</td></tr>
                      <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Event Name</td><td style="padding:8px;border:1px solid #e2e8f0;">${event.name}</td></tr>
                      <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Team Name</td><td style="padding:8px;border:1px solid #e2e8f0;">${record.team_name}</td></tr>
                      <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">Status</td><td style="padding:8px;border:1px solid #e2e8f0;">Rejected</td></tr>
                    </tbody>
                  </table>

                  <p style="margin:0 0 8px 0;"><strong>For any queries, contact:</strong></p>
                  ${getCoordinatorEmailHtml(record.event)}
                </td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `
  });
}
