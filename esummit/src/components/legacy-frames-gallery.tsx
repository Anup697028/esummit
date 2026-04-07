'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GlassCard, SectionTitle } from '@/components/ui';

const EVENT_IMAGES = [
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
];

export function LegacyFramesGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % EVENT_IMAGES.length);
    }
  };

  const handlePrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + EVENT_IMAGES.length) % EVENT_IMAGES.length);
    }
  };

  return (
    <div>
      <SectionTitle eyebrow="Gallery" title="Legacy Frames" description="Moments from past E-Cell events and celebrations." />
      <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3">
        {EVENT_IMAGES.slice(0, 6).map((image, index) => (
          <button
            key={image}
            onClick={() => setSelectedIndex(index)}
            className="group relative h-32 overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-cyan-300/50 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <Image
              src={`/logo/events/${image}`}
              alt={`Event moment ${index + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
          </button>
        ))}
        <button
          onClick={() => setSelectedIndex(6)}
          className="group relative h-32 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 transition-all duration-300 hover:border-cyan-300/50 hover:shadow-lg hover:shadow-cyan-500/20 flex items-center justify-center"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-300 group-hover:text-cyan-200">+{EVENT_IMAGES.length - 6}</div>
            <p className="text-xs text-slate-300 mt-1">More Frames</p>
          </div>
        </button>
      </div>

      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close gallery"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          <div className="relative w-full max-w-2xl max-h-[80vh]">
            <Image
              src={`/logo/events/${EVENT_IMAGES[selectedIndex]}`}
              alt={`Event moment ${selectedIndex + 1}`}
              width={800}
              height={800}
              className="w-full h-auto rounded-lg object-contain"
            />

            <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
              <button
                onClick={handlePrev}
                className="pointer-events-auto p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={handleNext}
                className="pointer-events-auto p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-slate-300 bg-black/50 px-4 py-2 rounded-full">
            {selectedIndex + 1} / {EVENT_IMAGES.length}
          </div>
        </div>
      )}
    </div>
  );
}
