import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ProtectedLayout } from '@/components/protected-layout';
import { AuthProvider } from '@/components/auth-provider';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Next.js Music Player',
  description: 'A music player built with Next.js.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0A0A0A',
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // NOTE: Removed getAllPlaylists() from root layout to avoid blocking startup
  // This was causing the app to hang for 3+ minutes trying to fetch from Supabase
  // Playlists are now fetched only on pages that need them (page.tsx, etc)

  return (
    <html lang="en" className={inter.className}>
      <body className="dark flex flex-col md:flex-row h-[100dvh] text-gray-200 bg-[#0A0A0A]">
        <AuthProvider>
          <ProtectedLayout>{children}</ProtectedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
