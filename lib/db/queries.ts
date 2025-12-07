import { eq, sql, desc, asc, and } from 'drizzle-orm';
import { unstable_cache, revalidateTag } from 'next/cache';
import { db } from './drizzle';
import { songs, playlists, playlistSongs } from './schema';

export const getAllSongs = unstable_cache(
  async () => {
    return db.select().from(songs).orderBy(asc(songs.name));
  },
  ['all-songs'],
  {
    tags: ['songs'],
    revalidate: 60, // Revalidate setiap 60 detik (opsional)
  }
);

export const getSongById = unstable_cache(
  async (id: string) => {
    return db.query.songs.findFirst({
      where: eq(songs.id, id),
    });
  },
  ['song-by-id'],
  { tags: ['songs'] }
);

export const getAllPlaylists = unstable_cache(
  async () => {
    return db.select().from(playlists).orderBy(desc(playlists.createdAt));
  },
  ['all-playlists'],
  { tags: ['playlists'] }
);

export const getPlaylistWithSongs = unstable_cache(
  async (id: string) => {
    const result = await db.query.playlists.findFirst({
      where: eq(playlists.id, id),
      with: {
        playlistSongs: {
          columns: {
            order: true,
          },
          with: {
            song: true,
          },
          orderBy: asc(playlistSongs.order),
        },
      },
    });

    if (!result) return null;

    const songs = result.playlistSongs.map((ps) => ({
      ...ps.song,
      order: ps.order,
    }));

    const trackCount = songs.length;
    const duration = songs.reduce((total, song) => total + song.duration, 0);

    return {
      ...result,
      songs,
      trackCount,
      duration,
    };
  },
  ['playlist-with-songs'],
  { tags: ['playlists', 'songs'] }
);

export const addSongToPlaylist = async (playlistId: string, songId: string, order: number) => {
  const result = await db.insert(playlistSongs).values({ playlistId, songId, order });
  revalidateTag('playlists');
  revalidateTag('songs'); // Tambahkan ini
  return result;
};

export const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
  const result = await db
    .delete(playlistSongs)
    .where(and(eq(playlistSongs.playlistId, playlistId), eq(playlistSongs.songId, songId)));
  revalidateTag('playlists');
  revalidateTag('songs'); // Tambahkan ini
  return result;
};

export const createPlaylist = async (id: string, name: string, coverUrl?: string) => {
  const result = await db.insert(playlists).values({ id, name, coverUrl }).returning();
  revalidateTag('playlists');
  return result[0];
};

export const updatePlaylist = async (id: string, name: string, coverUrl?: string) => {
  const result = await db
    .update(playlists)
    .set({ name, coverUrl, updatedAt: new Date() })
    .where(eq(playlists.id, id))
    .returning();
  revalidateTag('playlists');
  return result[0];
};

export const deletePlaylist = async (id: string) => {
  // First, delete all playlist songs
  await db.delete(playlistSongs).where(eq(playlistSongs.playlistId, id));
  // Then delete the playlist
  const result = await db.delete(playlists).where(eq(playlists.id, id));

  revalidateTag('playlists');
  return result;
};

export const searchSongs = unstable_cache(
  async (searchTerm: string) => {
    const similarityExpression = sql`GREATEST(
      similarity(${songs.name}, ${searchTerm}),
      similarity(${songs.artist}, ${searchTerm}),
      similarity(COALESCE(${songs.album}, ''), ${searchTerm})
    )`;

    return db
      .select({
        id: songs.id,
        name: songs.name,
        artist: songs.artist,
        album: songs.album,
        duration: songs.duration,
        imageUrl: songs.imageUrl,
        audioUrl: songs.audioUrl,
        similarity: sql`${similarityExpression}::float`,
      })
      .from(songs)
      .orderBy(desc(similarityExpression), asc(songs.name))
      .limit(100); // Naikin dari 50 jadi 100
  },
  ['search-songs'],
  { tags: ['songs'] }
);

export const getRecentlyAddedSongs = unstable_cache(
  async (limit: number = 10) => {
    return db.select().from(songs).orderBy(desc(songs.createdAt)).limit(limit);
  },
  ['recently-added-songs'],
  { tags: ['songs'] }
);

// Tambahkan helper function untuk clear cache manual
export const clearSongsCache = () => {
  revalidateTag('songs');
};

export const clearPlaylistsCache = () => {
  revalidateTag('playlists');
};
