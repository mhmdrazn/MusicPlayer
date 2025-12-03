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
import { UserButton } from '@/components/user-button';

const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

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
        className={`block py-1 px-4 cursor-pointer hover:bg-[#1A1A1A] text-[#d1d5db] focus:outline-none focus:ring-[0.5px] focus:ring-gray-400 ${
          pathname === `/p/${playlist.id}` ? 'bg-[#1A1A1A]' : ''
        }`}
        tabIndex={0}
      >
        {playlist.name}
      </Link>
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-white focus:text-white"
              disabled={isPending || isDeleting}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Playlist options</span>
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
  const { playlists, updatePlaylist } = usePlaylist();
  const playlistsContainerRef = useRef<HTMLUListElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { registerPanelRef, handleKeyNavigation, setActivePanel } = usePlayback();
  const [isAdding, setIsAdding] = useState(false);

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

  return (
    <div
      className="hidden md:flex md:flex-col w-56 bg-[#121212] h-[100dvh] border-r border-gray-800"
      onClick={() => setActivePanel('sidebar')}
    >
      {/* Header Section */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <SearchInput />
        <div className="mb-6">
          <Link
            href="/"
            className={`block py-1 px-4 -mx-4 text-xs text-[#d1d5db] hover:bg-[#1A1A1A] transition-colors focus:outline-none focus:ring-[0.5px] focus:ring-gray-400 ${
              pathname === '/' ? 'bg-[#1A1A1A]' : ''
            }`}
          >
            All TrackSSSSS TES
          </Link>
        </div>
        <div className="flex justify-between items-center mb-4">
          <Link
            href="/"
            className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            Playlists
          </Link>
          <form action={addPlaylistAction}>
            <Button
              disabled={isProduction || isAdding}
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              type="submit"
            >
              <Plus className="w-3 h-3 text-gray-400" />
              <span className="sr-only">Add new playlist</span>
            </Button>
          </form>
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

      <div className="pb-16 mb-2 flex-shrink-0 border-t border-gray-800">
        <UserButton />
      </div>
    </div>
  );
}
