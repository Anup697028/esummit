import type { Metadata } from 'next';
import './globals.css';
import { AnnouncementPopup } from '@/components/announcement-popup';

export const metadata: Metadata = {
  title: 'EntreMITT',
  description: 'EntreMITT platform with registrations, payments, and admin management.',
  icons: {
    icon: '/logo/logo.png'
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AnnouncementPopup />
        {children}
      </body>
    </html>
  );
}
