import { GlassCard, SectionTitle } from './ui';

type LegacyFramesGalleryProps = {
  className?: string;
};

export function LegacyFramesGallery({ className }: LegacyFramesGalleryProps) {
  return (
    <section className={className}>
      <SectionTitle eyebrow="Gallery" title="Legacy Frames" description="Past event moments." />
      <GlassCard className="p-6 text-center text-slate-300">Gallery moved back to archived deployment state.</GlassCard>
    </section>
  );
}
