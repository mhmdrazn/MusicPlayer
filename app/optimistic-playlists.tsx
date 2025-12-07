'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MoreVertical, Trash } from 'lucide-react';
import { useRef, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { usePlayback } from '@/app/playback-context';
import { createPlaylistAction, deletePlaylistAction } from './actions';
import { usePlaylist } from '@/app/hooks/use-playlist';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Playlist } from '@/lib/db/types';
import { v4 as uuidv4 } from 'uuid';
import { SearchInput } from './search';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserButton } from '@/components/user-button';

function PlaylistRow({ playlist }: { playlist: Playlist }) {
  const pathname = usePathname();
  const router = useRouter();
  const { deletePlaylist } = usePlaylist();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeletePlaylist(id: string) {
    if (isDeleting) return; // Prevent double clicks

    setIsDeleting(true);

    startTransition(async () => {
      try {
        // 1. Redirect dulu jika sedang di halaman playlist yang akan dihapus
        if (pathname === `/p/${id}`) {
          router.push('/');
        }

        // 2. Optimistic update - hapus dari UI dulu
        deletePlaylist(id);

        // 3. Delete dari server
        const result = await deletePlaylistAction(id);

        // 4. Cek hasil
        if (result && result.error) {
          console.error('Failed to delete playlist:', result.error);
          // Rollback dengan refresh data dari server
          router.refresh();
        } else {
          // 5. Refresh untuk sinkronisasi final
          router.refresh();
        }
      } catch (error) {
        console.error('Error deleting playlist:', error);
        // Rollback dengan refresh data dari server
        router.refresh();
      } finally {
        setIsDeleting(false);
      }
    });
  }

  return (
    <li
      className={`group relative ${isPending || isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <Link
        prefetch={true}
        href={`/p/${playlist.id}`}
        className={`
          block py-1 px-4 cursor-pointer 
          hover:bg-accent hover:text-foreground 
          text-muted-foreground 
          rounded-sm
          focus:outline-none
          focus:ring-1
          focus:ring-primary
          ${pathname === `/p/${playlist.id}` ? 'bg-accent text-foreground' : ''}
        `}
      >
        {playlist.name}
      </Link>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground focus:text-foreground"
              disabled={isPending || isDeleting}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem
              disabled={isPending || isDeleting}
              onClick={() => handleDeletePlaylist(playlist.id)}
              className="text-xs"
            >
              <Trash className="mr-2 size-3" />
              {isDeleting ? 'Deleting...' : 'Delete Playlist'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}

export function OptimisticPlaylists() {
  const { playlists, updatePlaylist } = usePlaylist();
  const playlistsContainerRef = useRef<HTMLUListElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { registerPanelRef, handleKeyNavigation, setActivePanel } = usePlayback();
  const [isAdding, setIsAdding] = useState(false);
  const [_isPending, startTransition] = useTransition();

  useEffect(() => {
    registerPanelRef('sidebar', playlistsContainerRef);
  }, [registerPanelRef]);

  async function addPlaylistAction() {
    if (isAdding) return; // Prevent double clicks

    setIsAdding(true);

    try {
      const newPlaylistId = uuidv4();
      const newPlaylist = {
        id: newPlaylistId,
        name: 'New Playlist',
        coverUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Wrap optimistic update in startTransition
      startTransition(() => {
        updatePlaylist(newPlaylistId, newPlaylist);
      });

      // Navigate
      router.prefetch(`/p/${newPlaylistId}`);
      router.push(`/p/${newPlaylistId}`);

      // Server action
      await createPlaylistAction(newPlaylistId, 'New Playlist');

      // Refresh
      router.refresh();
    } catch (error) {
      console.error('Error creating playlist:', error);
      router.refresh();
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div
      className="hidden md:flex md:flex-col w-56 bg-background border-r border-border h-[100dvh]"
      onClick={() => setActivePanel('sidebar')}
    >
      {/* Header: Theme Toggle */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-sm font-semibold text-foreground">Music Player</h1>
        <ThemeToggle />
      </div>

      {/* Search */}
      <div className="flex-shrink-0 px-4 pb-2">
        <SearchInput />

        <div className="mb-6">
          <Link
            href="/"
            className={`
              block py-1 px-4 -mx-4 text-xs 
              text-muted-foreground 
              hover:bg-accent hover:text-foreground 
              rounded-sm
              ${pathname === '/' ? 'bg-accent text-foreground' : ''}
            `}
          >
            All Tracks
          </Link>
        </div>

        {/* Playlists header */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-semibold text-muted-foreground">Playlists</span>

          <Button
            disabled={isAdding}
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={addPlaylistAction}
            type="button"
          >
            <Plus className="w-3 h-3 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Scrollable Playlist Area */}
      <ScrollArea className="flex-1 min-h-0 px-0">
        <ul
          ref={playlistsContainerRef}
          className="space-y-0.5 text-xs"
          onKeyDown={(e) => handleKeyNavigation(e, 'sidebar')}
        >
          {playlists.map((playlist) => (
            <PlaylistRow key={playlist.id} playlist={playlist} />
          ))}
        </ul>
      </ScrollArea>

      <div className="pb-16 mb-2 flex-shrink-0 border-t border-border">
        <UserButton />
      </div>
    </div>
  );
}
