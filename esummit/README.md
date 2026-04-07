# EntreMITT

EntreMITT is a premium entrepreneurship summit platform built with Next.js, Firebase, and Gmail SMTP. It supports event browsing, registrations, screenshot uploads, admin approval workflows, CSV export, and email notifications.

## Features

- Premium landing page and event pages
- Event rules and registration details
- Registration form with validation
- Screenshot upload to Firebase Storage
- Firestore-backed registration records
- Admin dashboard for approve, reject, and notify actions
- CSV export for registrations
- Health check endpoint for production monitoring
- Email notifications through Gmail SMTP

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Firebase Firestore
- Firebase Storage
- Firebase Auth
- Firebase Admin SDK
- Nodemailer
- Tailwind CSS

## Prerequisites

- Node.js 18 or newer
- npm
- Firebase project
- SMTP account for outgoing mail

## Setup

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env.local` and fill in the required values.
4. Run the development server:

```bash
npm run dev
```

## Environment Variables

Set these in `.env.local` for local development and in your deployment platform for production:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_STORAGE_BUCKET=

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
SMTP_FROM_NAME=EntreMITT

NEXT_PUBLIC_ADMIN_EMAILS=
ADMIN_EMAILS=
APP_ORIGIN=
NEXT_PUBLIC_EVENT_MAX_TEAMS=60
```

Notes:
- Do not commit real secrets to GitHub.
- Keep `FIREBASE_PRIVATE_KEY` with newline formatting preserved.
- `NEXT_PUBLIC_EVENT_MAX_TEAMS` controls the default team cap for events.
- Speaker Session uses a separate capacity of 250 participants in the app logic.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Production Deployment

The project is ready for production build and can be deployed on Firebase App Hosting, Google Cloud Run, or Vercel.

Recommended checks before deploy:

1. Make sure `.env.local` is not committed.
2. Confirm the production environment variables are set.
3. Run a production build locally:

```bash
npm run build
```

4. Verify these live flows after deployment:
- Home page
- Events pages
- Registration flow
- Admin login
- Approve and reject actions
- CSV export
- Screenshot open links
- Health endpoint

## Health Check

A health endpoint is available at:

```bash
/health
```

## Project Structure

- `src/app` - App Router pages and API routes
- `src/components` - UI components
- `src/lib` - Firebase, mail, auth, and registration helpers
- `public/logo` - Static assets
- `rules` - Downloadable rules documents

## Security Notes

- Authentication is enforced for admin actions.
- Rejection and approval actions are handled on the backend.
- Secrets must stay in environment variables.
- Build artifacts and local secret files are ignored by Git through `.gitignore`.

## License

Private project for EntreMITT and MIT Thandavapura.
