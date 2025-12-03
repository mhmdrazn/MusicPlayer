import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { getAllPlaylists } from '@/lib/db/queries';
import { ThemeProvider } from '@/components/theme-provider';
import { OptimisticPlaylists } from './optimistic-playlists';
import { NowPlaying } from './now-playing';
import { PlaybackControls } from './playback-controls';
import { PlaybackProvider } from './playback-context';
import { PlaylistProvider } from './hooks/use-playlist';
import { UserButton } from '@/components/user-button';

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
      {/* ThemeProvider MUST wrap body content */}
      <body className="flex flex-col md:flex-row h-[100dvh] bg-background text-foreground antialiased">
        <ThemeProvider>
          <PlaybackProvider>
            <PlaylistProvider playlistsPromise={playlistsPromise}>
              {/* Sidebar playlists */}
              <OptimisticPlaylists />

              {/* Main content */}
              {children}
            </PlaylistProvider>

            {/* Bottom playback UI */}
            <NowPlaying />
            <PlaybackControls />
          </PlaybackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
