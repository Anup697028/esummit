import Link from 'next/link';
import Image from 'next/image';
import { Instagram } from 'lucide-react';

const INSTAGRAM_URL = 'https://www.instagram.com/e_cell_mitt?igsh=MXE3cWJoaDVjejFwcA==';

export function SiteShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:flex-nowrap sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white text-slate-800 ring-1 ring-slate-200 sm:h-16 sm:w-16">
              <Image src="/logo/mit-logo.png" alt="MIT Thandavapura Logo" width={64} height={64} sizes="64px" className="h-14 w-14 object-cover sm:h-16 sm:w-16" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-100">MIT Thandavapura</p>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <Link href="/" className="transition hover:text-slate-100">Home</Link>
            <Link href="/events" className="transition hover:text-slate-100">Events</Link>
          </nav>
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-100">E-Cell</p>
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 sm:h-16 sm:w-16">
              <Image src="/logo/logo.png" alt="E-Cell Logo" width={64} height={64} sizes="64px" className="h-14 w-14 object-cover sm:h-16 sm:w-16" />
            </div>
          </Link>
          <nav className="order-3 mt-1 flex w-full items-center gap-3 text-sm text-slate-100 md:hidden">
            <Link href="/" className="flex-1 rounded-full border border-cyan-300/25 bg-slate-900/70 px-4 py-2.5 text-center font-semibold transition hover:border-cyan-300/50 hover:bg-cyan-400/15 hover:text-white">Home</Link>
            <Link href="/events" className="flex-1 rounded-full border border-cyan-300/25 bg-slate-900/70 px-4 py-2.5 text-center font-semibold transition hover:border-cyan-300/50 hover:bg-cyan-400/15 hover:text-white">Events</Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-300 transition hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-cyan-100"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <p>© All rights reserved by E-Cell MITT</p>
        </div>
      </footer>
    </div>
  );
}
