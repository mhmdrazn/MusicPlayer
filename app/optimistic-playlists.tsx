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

let isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

function PlaylistRow({ playlist }: { playlist: Playlist }) {
  let pathname = usePathname();
  let router = useRouter();
  let { deletePlaylist } = usePlaylist();
  let [isPending, startTransition] = useTransition();
  let [isDeleting, setIsDeleting] = useState(false);

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
    <li className={`group relative ${isPending || isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
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
              className="h-6 w-6 text-gray-400 hover:text-white focus:text-white"
              disabled={isPending || isDeleting}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem
              disabled={isProduction || isPending || isDeleting}
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
  let { playlists, updatePlaylist } = usePlaylist();
  let playlistsContainerRef = useRef<HTMLUListElement>(null);
  let pathname = usePathname();
  let router = useRouter();
  let { registerPanelRef, handleKeyNavigation, setActivePanel } = usePlayback();
  let [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    registerPanelRef('sidebar', playlistsContainerRef);
  }, [registerPanelRef]);

  async function addPlaylistAction() {
    if (isAdding) return; // Prevent double clicks
    
    setIsAdding(true);
    
    try {
      let newPlaylistId = uuidv4();
      let newPlaylist = {
        id: newPlaylistId,
        name: 'New Playlist',
        coverUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Optimistic update
      updatePlaylist(newPlaylistId, newPlaylist);
      
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

  function handleLogout() {
    // TODO: taruh logic logout di sini
    console.log('Logout clicked');
  }

  return (
    <div
      className="hidden md:block w-56 bg-background border-r border-border h-[100dvh] overflow-auto"
      onClick={() => setActivePanel('sidebar')}
    >
      {/* Header: Theme + Logout */}
      <div className="m-4 flex items-center justify-between">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="m-4">
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

          <form action={addPlaylistAction}>
            <Button
              disabled={isProduction || isAdding}
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              type="submit"
            >
              <Plus className="w-3 h-3 text-muted-foreground" />
            </Button>
          </form>
        </div>
      </div>

      {/* Playlist scroll area */}
      <ScrollArea className="h-[calc(100dvh-180px)]">
        <ul
          ref={playlistsContainerRef}
          className="space-y-0.5 text-xs mt-[1px]"
          onKeyDown={(e) => handleKeyNavigation(e, 'sidebar')}
        >
          {playlists.map((playlist) => (
            <PlaylistRow key={playlist.id} playlist={playlist} />
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}

//Nyoba test v2