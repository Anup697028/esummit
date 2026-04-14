import { SiteShell } from '@/components/site-shell';
import { EventDetailPage } from '@/components/event-detail';

export default async function SpeakerSessionPage() {
  return (
    <SiteShell>
      <EventDetailPage slug="speaker-session" />
    </SiteShell>
  );
}
