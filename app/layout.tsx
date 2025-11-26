import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { getAllPlaylists } from '@/lib/db/queries';
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
  const playlistsPromise = getAllPlaylists();

  return (
    <html lang="en" className={inter.className}>
      <body className="dark flex flex-col md:flex-row h-[100dvh] text-gray-200 bg-[#0A0A0A]">
        <AuthProvider>
          <ProtectedLayout playlistsPromise={playlistsPromise}>{children}</ProtectedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
