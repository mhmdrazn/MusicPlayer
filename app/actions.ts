'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { playlists, playlistSongs, songs } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { put } from '@vercel/blob';
import {
  createPlaylist,
  updatePlaylist as updatePlaylistQuery,
  deletePlaylist as deletePlaylistQuery,
} from '@/lib/db/queries';

/* -------------------------------------------------
   CREATE PLAYLIST
------------------------------------------------- */
export async function createPlaylistAction(id: string, name: string) {
  try {
    await createPlaylist(id, name);

    // Revalidate paths
    revalidatePath('/');
    revalidatePath(`/p/${id}`);

    return { success: true };
  } catch (error) {
    console.error('Error creating playlist:', error);
    return { success: false, error: 'Failed to create playlist' };
  }
}

export async function uploadPlaylistCoverAction(_: any, formData: FormData) {
  const playlistId = formData.get('playlistId') as string;
  const file = formData.get('file') as File;

  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  try {
    const blob = await put(`playlist-covers/${playlistId}-${file.name}`, file, {
      access: 'public',
    });

    await db.update(playlists).set({ coverUrl: blob.url }).where(eq(playlists.id, playlistId));
    await db.update(playlists).set({ coverUrl: blob.url }).where(eq(playlists.id, playlistId));

    revalidatePath(`/p/${playlistId}`);
    revalidatePath('/');

    return { success: true, coverUrl: blob.url };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error: 'Failed to upload file' };
  }
}

export async function updatePlaylistNameAction(playlistId: string, name: string) {
  try {
    await db.update(playlists).set({ name }).where(eq(playlists.id, playlistId));

    revalidatePath('/', 'layout');
    revalidatePath(`/p/${playlistId}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating playlist name:', error);
    return { success: false, error: 'Failed to update playlist name' };
  }
}

export async function deletePlaylistAction(id: string) {
  try {
    await db.transaction(async (tx) => {
      // Delete all songs in the playlist first
      await tx.delete(playlistSongs).where(eq(playlistSongs.playlistId, id)).execute();

      // Then delete the playlist
      await tx.delete(playlists).where(eq(playlists.id, id)).execute();
    });

    // Revalidate all relevant paths
    revalidatePath('/'); // Homepage
    revalidatePath(`/p/${id}`); // The playlist page
    revalidatePath('/p/[id]', 'page'); // Dynamic playlist routes
    revalidatePath('/', 'layout'); // Layout cache

    return { success: true };
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return { success: false, error: 'Failed to delete playlist' };
  }
}

/* -------------------------------------------------
   ADD SONG TO PLAYLIST
------------------------------------------------- */
export async function addToPlaylistAction(playlistId: string, songId: string) {
  try {
    // Check if the song is already in the playlist
    const existingEntry = await db
      .select()
      .from(playlistSongs)
      .where(and(eq(playlistSongs.playlistId, playlistId), eq(playlistSongs.songId, songId)))
      .execute();

    if (existingEntry.length > 0) {
      return { success: false, message: 'Song is already in the playlist' };
    }

    // Get the current maximum order for the playlist
    const maxOrderResult = await db
      .select({ maxOrder: sql<number>`MAX(${playlistSongs.order})` })
      .from(playlistSongs)
      .where(eq(playlistSongs.playlistId, playlistId))
      .execute();

    const newOrder = (maxOrderResult[0]?.maxOrder ?? 0) + 1;

    await db
      .insert(playlistSongs)
      .values({
        playlistId,
        songId,
        order: newOrder,
      })
      .execute();

    revalidatePath('/', 'layout');
    revalidatePath(`/p/${playlistId}`);

    return { success: true, message: 'Songs added to playlist successfully' };
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    return { success: false, message: 'Failed to add song to playlist' };
  }
}

/* -------------------------------------------------
   UPDATE TRACK FIELDS (TITLE, ARTIST, BPM, ETC)
------------------------------------------------- */
export async function updateTrackAction(_: any, formData: FormData) {
  try {
    const trackId = formData.get('trackId') as string;
    const field = formData.get('field') as string;
    let value = formData.get(field) as string;

    if (field === 'bpm') {
      const parsedValue = parseInt(value);
      if (isNaN(parsedValue)) {
        return { success: false, error: 'bpm should be a valid number' };
      }
      value = parsedValue.toString();
    }

    const data: Partial<typeof songs.$inferInsert> = { [field]: value };
    await db.update(songs).set(data).where(eq(songs.id, trackId));

    revalidatePath('/', 'layout');
    revalidatePath('/');

    return { success: true, error: '' };
  } catch (error) {
    console.error('Error updating track:', error);
    return { success: false, error: 'Failed to update track' };
  }
}

/* -------------------------------------------------
   UPDATE TRACK IMAGE
------------------------------------------------- */
export async function updateTrackImageAction(_: any, formData: FormData) {
  try {
    const trackId = formData.get('trackId') as string;
    const file = formData.get('file') as File;

    if (!trackId || !file) {
      return { success: false, error: 'Missing trackId or file' };
    }

    const blob = await put(`track-images/${trackId}-${file.name}`, file, {
      access: 'public',
    });

    await db.update(songs).set({ imageUrl: blob.url }).where(eq(songs.id, trackId));

    revalidatePath('/', 'layout');
    revalidatePath('/');

    return { success: true, imageUrl: blob.url };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error: 'Failed to upload file' };
  }
}

// Action untuk clear cache manual
export async function clearCacheAction() {
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error clearing cache:', error);
    return { success: false, error: 'Failed to clear cache' };
  }
}
