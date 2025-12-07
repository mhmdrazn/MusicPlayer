'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
} from 'react';
import { Song } from '@/lib/db/types';

type Panel = 'sidebar' | 'tracklist';

type PlaybackContextType = {
  isPlaying: boolean;
  currentTrack: Song | null;
  currentTime: number;
  duration: number;
  togglePlayPause: () => void;
  playTrack: (track: Song) => void;
  playNextTrack: () => void;
  playPreviousTrack: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaylist: (songs: Song[]) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  activePanel: Panel;
  setActivePanel: (panel: Panel) => void;
  registerPanelRef: (panel: Panel, ref: React.RefObject<HTMLElement>) => void;
  handleKeyNavigation: (e: React.KeyboardEvent, panel: Panel) => void;
  isShuffle: boolean;
  toggleShuffle: () => void;
  isFavorite: (trackId: string) => boolean;
  toggleFavorite: (track: Song) => Promise<void>;
  favoriteIds: Set<string>;
};

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

function useKeyboardNavigation() {
  const [activePanel, setActivePanel] = useState<Panel>('sidebar');
  const panelRefs = useRef<Record<Panel, React.RefObject<HTMLElement> | null>>({
    sidebar: null,
    tracklist: null,
  });

  const registerPanelRef = useCallback((panel: Panel, ref: React.RefObject<HTMLElement>) => {
    panelRefs.current[panel] = ref;
  }, []);

  const handleKeyNavigation = useCallback((e: React.KeyboardEvent, panel: Panel) => {
    const currentRef = panelRefs.current[panel];
    if (!currentRef?.current) return;

    const items = Array.from(currentRef.current.querySelectorAll('[tabindex="0"]'));
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    switch (e.key) {
      case 'ArrowDown':
      case 'j': {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        (items[nextIndex] as HTMLElement).focus();
        break;
      }
      case 'ArrowUp':
      case 'k': {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        (items[prevIndex] as HTMLElement).focus();
        break;
      }
      case 'h':
        if (panel === 'tracklist') {
          e.preventDefault();
          setActivePanel('sidebar');
          const sidebarFirstItem = panelRefs.current.sidebar?.current?.querySelector(
            '[tabindex="0"]'
          ) as HTMLElement | null;
          sidebarFirstItem?.focus();
        }
        break;
      case 'l':
        if (panel === 'sidebar') {
          e.preventDefault();
          setActivePanel('tracklist');
          const tracklistFirstItem = panelRefs.current.tracklist?.current?.querySelector(
            '[tabindex="0"]'
          ) as HTMLElement | null;
          tracklistFirstItem?.focus();
        }
        break;
    }
  }, []);

  return { activePanel, setActivePanel, registerPanelRef, handleKeyNavigation };
}

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement>(null);

  const { activePanel, setActivePanel, registerPanelRef, handleKeyNavigation } =
    useKeyboardNavigation();

  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            // Playback was interrupted or failed
            if (error.name !== 'AbortError') {
              console.warn('Playback error:', error);
            }
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const playTrack = useCallback(
    (track: Song) => {
      setCurrentTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.src = getAudioSrc(track.audioUrl as string);
        // Create a promise for play() to handle interruptions gracefully
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Auto-play started successfully
            })
            .catch((error) => {
              // Playback was interrupted or failed - this is normal
              // Don't treat it as a hard error
              if (error.name !== 'AbortError') {
                console.warn('Playback error:', error);
              }
            });
        }
      }
      setActivePanel('tracklist');
    },
    [setActivePanel]
  );

  const playNextTrack = useCallback(() => {
    if (currentTrack && playlist.length > 0) {
      const currentIndex = playlist.findIndex((track) => track.id === currentTrack.id);
      let nextIndex: number;

      if (isShuffle) {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } else {
        nextIndex = (currentIndex + 1) % playlist.length;
      }
      playTrack(playlist[nextIndex]);
    }
  }, [currentTrack, playlist, playTrack, isShuffle]);

  const playPreviousTrack = useCallback(() => {
    if (currentTrack && playlist.length > 0) {
      const currentIndex = playlist.findIndex((track) => track.id === currentTrack.id);
      const previousIndex = (currentIndex - 1 + playlist.length) % playlist.length;
      playTrack(playlist[previousIndex]);
    }
  }, [currentTrack, playlist, playTrack]);

  const getAudioSrc = (url: string) => {
    if (url.startsWith('file://')) {
      const filename = url.split('/').pop();
      return `/api/audio/${encodeURIComponent(filename || '')}`;
    }
    return url;
  };

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => {
      const newShuffle = !prev;
      // If turning on shuffle, play a random track from playlist
      if (newShuffle && playlist.length > 0) {
        const randomIndex = Math.floor(Math.random() * playlist.length);
        playTrack(playlist[randomIndex]);
      }
      return newShuffle;
    });
  }, [playlist, playTrack]);

  const isFavorite = useCallback(
    (trackId: string) => {
      return favoriteIds.has(trackId);
    },
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (track: Song) => {
      try {
        const newFavorites = new Set(favoriteIds);
        if (newFavorites.has(track.id)) {
          newFavorites.delete(track.id);
        } else {
          newFavorites.add(track.id);
        }
        setFavoriteIds(newFavorites);

        // Call server action to add/remove from favorites playlist
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            songId: track.id,
            isFavorite: newFavorites.has(track.id),
          }),
        });
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
      }
    },
    [favoriteIds]
  );

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[type="search"]'
        ) as HTMLInputElement | null;
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [togglePlayPause]);

  // Auto-play next track when current track ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTrackEnd = () => {
      playNextTrack();
    };

    audio.addEventListener('ended', handleTrackEnd);
    return () => audio.removeEventListener('ended', handleTrackEnd);
  }, [playNextTrack]);

  return (
    <PlaybackContext.Provider
      value={{
        isPlaying,
        currentTrack,
        currentTime,
        duration,
        togglePlayPause,
        playTrack,
        playNextTrack,
        playPreviousTrack,
        setCurrentTime,
        setDuration,
        setPlaylist,
        audioRef,
        activePanel,
        setActivePanel,
        registerPanelRef,
        handleKeyNavigation,
        isShuffle,
        toggleShuffle,
        isFavorite,
        toggleFavorite,
        favoriteIds,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const context = useContext(PlaybackContext);
  if (context === undefined) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return context;
}
