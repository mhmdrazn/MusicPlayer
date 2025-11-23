'use server';

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
  await createPlaylist(id, name);
  return { success: true };
}

/* -------------------------------------------------
   UPDATE PLAYLIST NAME
------------------------------------------------- */
export async function updatePlaylistNameAction(playlistId: string, name: string) {
  await db
    .update(playlists)
    .set({ name, updatedAt: new Date() })
    .where(eq(playlists.id, playlistId));

  return { success: true };
}

/* -------------------------------------------------
   DELETE PLAYLIST
------------------------------------------------- */
export async function deletePlaylistAction(id: string) {
  await db.transaction(async (tx) => {
    // Delete all songs inside playlist
    await tx.delete(playlistSongs).where(eq(playlistSongs.playlistId, id));

    // Delete playlist itself
    await tx.delete(playlists).where(eq(playlists.id, id));
  });

  return { success: true };
}

/* -------------------------------------------------
   UPLOAD PLAYLIST COVER
------------------------------------------------- */
export async function uploadPlaylistCoverAction(_: any, formData: FormData) {
  const playlistId = formData.get('playlistId') as string;
  const file = formData.get('file') as File;

  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  const blob = await put(`playlist-covers/${playlistId}-${file.name}`, file, {
    access: 'public',
  });

  await db
    .update(playlists)
    .set({ coverUrl: blob.url, updatedAt: new Date() })
    .where(eq(playlists.id, playlistId));

  return { success: true, coverUrl: blob.url };
}

/* -------------------------------------------------
   ADD SONG TO PLAYLIST
------------------------------------------------- */
export async function addToPlaylistAction(playlistId: string, songId: string) {
  // Check duplicate
  const existing = await db
    .select()
    .from(playlistSongs)
    .where(and(eq(playlistSongs.playlistId, playlistId), eq(playlistSongs.songId, songId)));

  if (existing.length > 0) {
    return { success: false, message: 'Already inside playlist' };
  }

  // Get max order
  const result = await db
    .select({ maxOrder: sql<number>`MAX(${playlistSongs.order})` })
    .from(playlistSongs)
    .where(eq(playlistSongs.playlistId, playlistId));

  const newOrder = (result[0]?.maxOrder ?? 0) + 1;

  await db.insert(playlistSongs).values({
    playlistId,
    songId,
    order: newOrder,
  });

  return { success: true };
}

/* -------------------------------------------------
   UPDATE TRACK FIELDS (TITLE, ARTIST, BPM, ETC)
------------------------------------------------- */
export async function updateTrackAction(_: any, formData: FormData) {
  const trackId = formData.get('trackId') as string;
  const field = formData.get('field') as string;
  let value: any = formData.get(field);

  if (!trackId || !field) {
    return { success: false, error: 'Invalid request' };
  }

  // Handle number fields
  if (field === 'bpm') {
    const parsed = parseInt(value);
    if (isNaN(parsed)) {
      return { success: false, error: 'bpm must be a number' };
    }
    value = parsed;
  }

  await db
    .update(songs)
    .set({ [field]: value })
    .where(eq(songs.id, trackId));

  return { success: true };
}

/* -------------------------------------------------
   UPDATE TRACK IMAGE
------------------------------------------------- */
export async function updateTrackImageAction(_: any, formData: FormData) {
  const trackId = formData.get('trackId') as string;
  const file = formData.get('file') as File;

  if (!file || !trackId) {
    return { success: false, error: 'Missing file or trackId' };
  }

  const blob = await put(`track-images/${trackId}-${file.name}`, file, {
    access: 'public',
  });

  await db.update(songs).set({ imageUrl: blob.url }).where(eq(songs.id, trackId));

  return { success: true, imageUrl: blob.url };
}
