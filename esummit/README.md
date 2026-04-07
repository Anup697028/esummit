# EntreMITT

A premium entrepreneurship summit platform built with Next.js, Firestore, Firebase Storage, Firebase Auth, and Gmail SMTP.

## Setup

1. Copy `.env.example` to `.env.local` and fill in the values.
2. Install dependencies.
3. Run `npm run dev`.

## Launch Configuration

- Set `NEXT_PUBLIC_EVENT_MAX_TEAMS` to control the per-event registration cap. Default is `60`.
- Screenshot uploads are limited to `1 MB` and only `JPG` or `PNG` files are accepted.

## Features

- Premium responsive landing page
- Event detail pages with rules and payment information
- Registration form with validation
- Firebase Storage screenshot upload
- Firestore-backed registration records
- Admin dashboard with approve/reject/notify actions
- Gmail SMTP email notification support
