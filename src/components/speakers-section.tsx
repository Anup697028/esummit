'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Linkedin, X } from 'lucide-react';

const spotlightSpeaker: {
  name: string;
  role: string;
  image: string;
  linkedin: string;
  tagline: string;
  bio: string;
  extendedBio: string;
} = {
  name: 'Rtn Shadakshari Swamy',
  role: 'Managing Director, Agamin Group | CII Member',
  tagline: 'Transforming healthcare and innovation through visionary leadership',
  bio: 'Rtn Shadakshari Swamy has been at the forefront of business-led healthcare innovation, helping scale ideas that combine social impact with operational excellence. He champions industry-academia collaboration and startup mentorship for future founders.',
  extendedBio:
    'As Managing Director of Agamin Group and an active CII member, Rtn Shadakshari Swamy has consistently worked at the intersection of leadership, innovation, and impact. His work spans strategic growth initiatives, ecosystem collaboration, and mentoring emerging entrepreneurs. Through his journey, he has supported bold ideas in healthcare and beyond, shaping ventures that deliver both economic and societal value.',
  image: '/logo/1642753558769.jfif',
  linkedin: 'https://www.linkedin.com/in/shadakshari'
};

export function SpeakersSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.18 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef}>
      <div
        className={`mt-5 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-blue-500 p-8 shadow-[0_24px_55px_rgba(59,130,246,0.25)] transition-all duration-700 sm:p-10 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <div className="flex flex-col gap-8 md:flex-row md:items-center">
          <div className="relative h-64 w-full shrink-0 overflow-hidden rounded-xl border border-white/25 md:h-72 md:w-60">
            <Image
              src={spotlightSpeaker.image}
              alt={spotlightSpeaker.name}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 240px, 100vw"
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white sm:text-3xl">{spotlightSpeaker.name}</h3>
                <p className="mt-1 text-sm font-medium text-blue-100 sm:text-base">{spotlightSpeaker.role}</p>
              </div>
              <a
                href={spotlightSpeaker.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white/90 transition duration-300 hover:scale-110 hover:bg-blue-700/70 hover:text-blue-100"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
            <p className="text-base font-semibold text-white/95">{spotlightSpeaker.tagline}</p>
            <p className="max-w-3xl text-sm leading-7 text-blue-100/95">{spotlightSpeaker.bio}</p>
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="inline-flex items-center rounded-full bg-slate-950/85 px-6 py-2.5 text-sm font-semibold text-white transition duration-300 hover:scale-[1.03] hover:bg-slate-900"
            >
              View Profile
            </button>
          </div>
        </div>
      </div>

      {isProfileOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 shadow-2xl shadow-black/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">{spotlightSpeaker.name}</h3>
                <p className="mt-1 text-sm text-cyan-100">{spotlightSpeaker.role}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Close profile dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-200">{spotlightSpeaker.extendedBio}</p>
            <a
              href={spotlightSpeaker.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-blue-300/50 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:scale-[1.02] hover:bg-blue-500/30"
            >
              <Linkedin className="h-4 w-4" />
              Connect on LinkedIn
            </a>
          </div>
        </div>
      ) : null}
    </section>
  );
}
