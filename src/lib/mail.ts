type MailPayload = {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    encoding?: string;
    cid?: string;
  }>;
};

type MailResult = {
  ok: boolean;
  skipped?: boolean;
  attempts?: number;
  error?: string;
};

const smtpHost = process.env.SMTP_HOST ?? 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT ?? '587');
const smtpUser = process.env.SMTP_USER ?? '';
const smtpPass = process.env.SMTP_PASS ?? '';
const mailFrom = process.env.SMTP_FROM ?? smtpUser;
const mailFromName = process.env.SMTP_FROM_NAME ?? 'E-Cell MITT';

const MAIL_RETRY_ATTEMPTS = Math.max(1, Number(process.env.SMTP_RETRY_ATTEMPTS ?? '3'));
const MAIL_RETRY_BASE_DELAY_MS = Math.max(0, Number(process.env.SMTP_RETRY_BASE_DELAY_MS ?? '500'));

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendMail(payload: MailPayload): Promise<MailResult> {
  if (!smtpUser || !smtpPass) {
    return { ok: false, skipped: true };
  }

  const nodemailer = await import('nodemailer');
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAIL_RETRY_ATTEMPTS; attempt += 1) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    try {
      await transporter.sendMail({
        from: `"${mailFromName}" <${mailFrom}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        attachments: payload.attachments
      });

      return { ok: true, attempts: attempt };
    } catch (error) {
      lastError = error;
      if (attempt < MAIL_RETRY_ATTEMPTS) {
        await sleep(MAIL_RETRY_BASE_DELAY_MS * attempt);
      }
    }
  }

  return {
    ok: false,
    attempts: MAIL_RETRY_ATTEMPTS,
    error: lastError instanceof Error ? lastError.message : 'Mail delivery failed'
  };
}
