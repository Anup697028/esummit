import type { Metadata } from 'next';
import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
