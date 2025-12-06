'use client';

import { useSession } from 'next-auth/react';
import { AuthWall } from './auth-wall';
import { PlaybackProvider } from '@/app/playback-context';
import { OptimisticPlaylists } from '@/app/optimistic-playlists';
import { PlaylistProvider } from '@/app/hooks/use-playlist';
import { PlaybackControls } from '@/app/playback-controls';
import { NowPlaying } from '@/app/now-playing';
import { ThemeProvider } from '@/components/theme-provider';
import { ReactNode } from 'react';

export function ProtectedLayout({
  children,
  playlistsPromise,
}: {
  children: ReactNode;
  playlistsPromise: Promise<any>;
}) {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <AuthWall />;
  }

  return (
    <ThemeProvider>
      <PlaybackProvider>
        <PlaylistProvider playlistsPromise={playlistsPromise}>
          <OptimisticPlaylists />
          {children}
        </PlaylistProvider>
        <NowPlaying />
        <PlaybackControls />
      </PlaybackProvider>
    </ThemeProvider>
  );
}
