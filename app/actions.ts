'use server';

import { createPlaylist } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { playlists, playlistSongs, songs } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { put } from '@vercel/blob';

export async function createPlaylistAction(id: string, name: string) {
  // Let's only handle this on local for now
  if (process.env.VERCEL_ENV === 'production') {
    return { success: false, error: 'Not available in production' };
  }

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
  // Let's only handle this on local for now
  if (process.env.VERCEL_ENV === 'production') {
    return { success: false, error: 'Not available in production' };
  }

  const playlistId = formData.get('playlistId') as string;
  const file = formData.get('file') as File;

  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  try {
    const blob = await put(`playlist-covers/${playlistId}-${file.name}`, file, {
      access: 'public',
    });

    await db
      .update(playlists)
      .set({ coverUrl: blob.url })
      .where(eq(playlists.id, playlistId));

    revalidatePath(`/p/${playlistId}`);
    revalidatePath('/');

    return { success: true, coverUrl: blob.url };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error: 'Failed to upload file' };
  }
}

export async function updatePlaylistNameAction(
  playlistId: string,
  name: string
) {
  // Let's only handle this on local for now
  if (process.env.VERCEL_ENV === 'production') {
    return { success: false, error: 'Not available in production' };
  }

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
  // Let's only handle this on local for now
  if (process.env.VERCEL_ENV === 'production') {
    return { success: false, error: 'Not available in production' };
  }

  try {
    await db.transaction(async (tx) => {
      // Delete all songs in the playlist first
      await tx
        .delete(playlistSongs)
        .where(eq(playlistSongs.playlistId, id))
        .execute();

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

export async function addToPlaylistAction(playlistId: string, songId: string) {
  try {
    // Check if the song is already in the playlist
    const existingEntry = await db
      .select()
      .from(playlistSongs)
      .where(
        and(
          eq(playlistSongs.playlistId, playlistId),
          eq(playlistSongs.songId, songId)
        )
      )
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

    return { success: true, message: 'Song added to playlist successfully' };
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    return { success: false, message: 'Failed to add song to playlist' };
  }
}

export async function updateTrackAction(_: any, formData: FormData) {
  try {
    let trackId = formData.get('trackId') as string;
    let field = formData.get('field') as string;
    let value = formData.get(field) as string;

    if (field === 'bpm') {
      const parsedValue = parseInt(value);
      if (isNaN(parsedValue)) {
        return { success: false, error: 'bpm should be a valid number' };
      }
      value = parsedValue.toString();
    }

    let data: Partial<typeof songs.$inferInsert> = { [field]: value };
    await db.update(songs).set(data).where(eq(songs.id, trackId));
    
    revalidatePath('/', 'layout');
    revalidatePath('/');

    return { success: true, error: '' };
  } catch (error) {
    console.error('Error updating track:', error);
    return { success: false, error: 'Failed to update track' };
  }
}

export async function updateTrackImageAction(_: any, formData: FormData) {
  let trackId = formData.get('trackId') as string;
  let file = formData.get('file') as File;

  if (!trackId || !file) {
    return { success: false, error: 'Missing trackId or file' };
  }

  try {
    const blob = await put(`track-images/${trackId}-${file.name}`, file, {
      access: 'public',
    });

    await db
      .update(songs)
      .set({ imageUrl: blob.url })
      .where(eq(songs.id, trackId));

    revalidatePath('/', 'layout');
    revalidatePath('/');

    return { success: true, imageUrl: blob.url };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error: 'Failed to upload file' };
  }
}