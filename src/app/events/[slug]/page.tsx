import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/site-shell';
import { EventDetailPage as EventDetailContent } from '@/components/event-detail';
import { eventBySlug } from '@/lib/events';
import type { EventSlug } from '@/lib/types';

export default async function EventDetailRoutePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const eventSlug = slug as EventSlug;
  const event = eventBySlug(eventSlug);
  if (!event) notFound();

  return (
    <SiteShell>
      <EventDetailContent slug={eventSlug} />
    </SiteShell>
  );
}
