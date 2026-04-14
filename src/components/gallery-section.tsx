'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { GlassCard, SectionTitle } from '@/components/ui';

const GALLERY_IMAGES = [
  'WhatsApp Image 2026-04-07 at 3.37.11 PM (1).jpeg',
  'WhatsApp Image 2026-04-07 at 3.37.11 PM.jpeg',
  'WhatsApp Image 2026-04-07 at 3.37.50 PM (1).jpeg',
  'WhatsApp Image 2026-04-07 at 3.37.50 PM.jpeg',
  'WhatsApp Image 2026-04-07 at 3.38.26 PM.jpeg',
  'WhatsApp Image 2026-04-07 at 3.38.27 PM.jpeg',
  'WhatsApp Image 2026-04-07 at 3.39.40 PM.jpeg',
  'WhatsApp Image 2026-04-07 at 3.39.41 PM (1).jpeg',
  'WhatsApp Image 2026-04-07 at 3.39.41 PM.jpeg',
  'WhatsApp Image 2026-04-07 at 3.40.29 PM (1).jpeg',
  'WhatsApp Image 2026-04-07 at 3.40.29 PM (2).jpeg',
  'WhatsApp Image 2026-04-07 at 3.40.29 PM.jpeg',
  'WhatsApp Image 2026-04-07 at 3.40.30 PM (1).jpeg',
  'WhatsApp Image 2026-04-07 at 3.40.30 PM (2).jpeg',
  'WhatsApp Image 2026-04-07 at 3.40.30 PM (3).jpeg',
  'WhatsApp Image 2026-04-07 at 3.40.30 PM.jpeg',
  'WhatsApp Image 2026-04-07 at 3.40.31 PM (1).jpeg',
  'WhatsApp Image 2026-04-07 at 3.40.31 PM (2).jpeg',
  'WhatsApp Image 2026-04-07 at 3.40.31 PM (3).jpeg',
  'WhatsApp Image 2026-04-07 at 3.40.31 PM.jpeg',
  'WhatsApp Image 2026-04-07 at 3.40.32 PM.jpeg',
  'WhatsApp Image 2026-04-07 at 3.41.06 PM (1).jpeg',
  'WhatsApp Image 2026-04-07 at 3.41.06 PM.jpeg',
  'WhatsApp Image 2026-04-07 at 3.42.14 PM (1).jpeg',
  'WhatsApp Image 2026-04-07 at 3.42.14 PM (2).jpeg',
  'WhatsApp Image 2026-04-07 at 3.42.14 PM (3).jpeg',
  'WhatsApp Image 2026-04-07 at 3.42.14 PM.jpeg',
  'WhatsApp Image 2026-04-07 at 3.42.15 PM (1).jpeg',
  'WhatsApp Image 2026-04-07 at 3.42.15 PM (2).jpeg',
  'WhatsApp Image 2026-04-07 at 3.42.15 PM.jpeg',
  'WhatsApp Image 2026-04-07 at 3.42.16 PM (1).jpeg',
  'WhatsApp Image 2026-04-07 at 3.42.16 PM.jpeg'
];

export function GallerySection() {
  const [isOpen, setIsOpen] = useState(false);

  const galleryItems = useMemo(
    () => GALLERY_IMAGES.map((name) => ({
      name,
      src: `/logo/Events/${encodeURIComponent(name)}`
    })),
    []
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SectionTitle eyebrow="Legacy Frames" title="Legacy Frames" description="" />
      <GlassCard className="mt-6 border border-white/10 bg-white/5">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group inline-flex w-full items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-6 py-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
        >
          Explore Gallery
        </button>
      </GlassCard>

      <div className={`fixed inset-0 z-[70] transition duration-300 ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
        <div
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
        <div className={`absolute inset-x-4 top-8 bottom-8 mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/15 bg-slate-950/95 shadow-2xl transition duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-4'}`}>
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">View Moments</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/90 transition hover:bg-white/10"
              aria-label="Close gallery"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="h-[calc(100%-73px)] overflow-y-auto p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {galleryItems.map((item) => (
                <div key={item.name} className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-slate-900/70">
                  <Image src={item.src} alt="E-Cell event moment" fill className="object-cover transition duration-300 hover:scale-105" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
