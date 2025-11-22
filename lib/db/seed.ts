import fs from "fs/promises";
import path from "path";
import { parseBuffer } from "music-metadata";
import { db } from "./drizzle";
import { songs, playlists, playlistSongs } from "./schema";
import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";

async function seed() {
  console.log("Starting seed process...");
  await seedSongs();
  await seedPlaylists();
  console.log("Seed process completed successfully.");
}

async function seedSongs() {
  const tracksDir = path.join(process.cwd(), "tracks");
  const files = await fs.readdir(tracksDir);

  for (const file of files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return (
      ext === ".mp3" || ext === ".webm" || ext === ".wav" || ext === ".m4a"
    );
  })) {
    const filePath = path.join(tracksDir, file);
    const buffer = await fs.readFile(filePath);

    // Determine MIME type based on file extension
    const ext = path.extname(file).toLowerCase();
    let mimeType = "audio/mpeg"; // default to mp3
    if (ext === ".webm") mimeType = "audio/webm";
    else if (ext === ".wav") mimeType = "audio/wav";
    else if (ext === ".m4a") mimeType = "audio/mp4";

    // music-metadata expects a Uint8Array/ArrayBuffer-like type for parseBuffer
    const uint8 = new Uint8Array(buffer);
    const metadata = await parseBuffer(uint8, { mimeType });

    let imageUrl;
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const picture = metadata.common.picture[0];
      const imageBuffer = Buffer.from(picture.data);
      const { url } = await put(
        `album_covers/${file}.${picture.format}`,
        imageBuffer,
        {
          access: "public",
        }
      );
      imageUrl = url;
    }

    const { url: audioUrl } = await put(`audio/${file}`, buffer, {
      access: "public",
    });

    const songData = {
      name: metadata.common.title || path.parse(file).name,
      artist: metadata.common.artist || "Unknown Artist",
      album: metadata.common.album || "Unknown Album",
      duration: Math.round(metadata.format.duration || 0),
      genre: metadata.common.genre?.[0] || "Unknown Genre",
      bpm: metadata.common.bpm ? Math.round(metadata.common.bpm) : null,
      key: metadata.common.key || null,
      imageUrl,
      audioUrl,
      isLocal: false,
    };

    // Check if the song already exists
    const existingSong = await db
      .select()
      .from(songs)
      .where(eq(songs.audioUrl, songData.audioUrl))
      .limit(1);

    if (existingSong.length > 0) {
      // Update existing song
      await db
        .update(songs)
        .set(songData)
        .where(eq(songs.id, existingSong[0].id));
      console.log(`Updated song: ${songData.name}`);
    } else {
      // Insert new song
      await db.insert(songs).values(songData);
      console.log(`Seeded new song: ${songData.name}`);
    }
  }
}

async function seedPlaylists() {
  const playlistNames = [
    "Techno Essentials",
    "Deep House Vibes",
    "EDM Bangers",
    "Ambient Chill",
    "Drum and Bass Mix",
    "Trance Classics",
    "Dubstep Drops",
    "Electro Swing",
    "Synthwave Retrowave",
    "Progressive House",
    "Minimal Techno",
    "Future Bass",
  ];

  for (const name of playlistNames) {
    // Check if the playlist already exists
    const existingPlaylist = await db
      .select()
      .from(playlists)
      .where(eq(playlists.name, name))
      .limit(1);

    let playlist;
    if (existingPlaylist.length > 0) {
      playlist = existingPlaylist[0];
      console.log(`Playlist already exists: ${name}`);
    } else {
      const [newPlaylist] = await db
        .insert(playlists)
        .values({
          name,
          coverUrl:
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
        })
        .returning();
      playlist = newPlaylist;
      console.log(`Seeded new playlist: ${name}`);
    }

    // Add some random songs to the playlist
    const allSongs = await db.select().from(songs);

    if (allSongs.length === 0) {
      console.log(`No songs available to add to playlist: ${name}`);
      continue;
    }

    const playlistSongCount = Math.min(
      Math.floor(Math.random() * 10) + 5, // 5 to 14 songs
      allSongs.length // but not more than available songs
    );
    const shuffledSongs = allSongs.sort(() => 0.5 - Math.random());

    // Ensure we have a valid playlist id. Some DB drivers/clients may not
    // return the inserted row by default when calling `.returning()`.
    if (!playlist || !("id" in playlist) || !playlist.id) {
      // try to re-fetch by name as a fallback
      const found = await db
        .select()
        .from(playlists)
        .where(eq(playlists.name, name))
        .limit(1);
      if (found.length > 0) {
        playlist = found[0];
      }
    }

    if (!playlist || !("id" in playlist) || !playlist.id) {
      console.warn(`Could not determine id for playlist: ${name}, skipping`);
      continue;
    }

    // Remove existing playlist songs
    await db
      .delete(playlistSongs)
      .where(eq(playlistSongs.playlistId, playlist.id));

    // Add new playlist songs
    for (let i = 0; i < playlistSongCount; i++) {
      const song = shuffledSongs[i];
      if (!song) continue; // guard, just in case

      await db.insert(playlistSongs).values({
        playlistId: playlist.id,
        songId: song.id,
        order: i,
      });
    }

    console.log(`Added ${playlistSongCount} songs to playlist: ${name}`);
  }
}

seed()
  .catch(error => {
    console.error("Seed process failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    console.log("Seed process finished. Exiting...");
    process.exit(0);
  });
