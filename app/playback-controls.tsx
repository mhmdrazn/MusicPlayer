'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { usePlayback } from '@/app/playback-context';

/* -----------------------------------------------------------
   TRACK INFO (kiri)
----------------------------------------------------------- */
export function TrackInfo() {
  let { currentTrack } = usePlayback();

  return (
    <div className="flex items-center space-x-3 w-1/3 text-foreground">
      {currentTrack && (
        <>
          <img
            src={currentTrack.imageUrl || '/placeholder.svg'}
            alt="Now playing"
            className="w-10 h-10 object-cover rounded"
          />
          <div className="flex-shrink min-w-0">
            <div className="text-sm font-medium truncate max-w-[200px]">{currentTrack.name}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
              {currentTrack.artist}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 hidden sm:flex">
            <Heart className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
}

/* -----------------------------------------------------------
   PLAYBACK BUTTONS (tengah)
----------------------------------------------------------- */
export function PlaybackButtons() {
  let { isPlaying, togglePlayPause, playPreviousTrack, playNextTrack, currentTrack } =
    usePlayback();

  return (
    <div className="flex items-center space-x-2 text-foreground">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={playPreviousTrack}
        disabled={!currentTrack}
      >
        <SkipBack className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={togglePlayPause}
        disabled={!currentTrack}
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={playNextTrack}
        disabled={!currentTrack}
      >
        <SkipForward className="w-4 h-4" />
      </Button>
    </div>
  );
}

/* -----------------------------------------------------------
   PROGRESS BAR (tengah)
----------------------------------------------------------- */
export function ProgressBar() {
  let { currentTime, duration, audioRef, setCurrentTime } = usePlayback();
  let progressBarRef = useRef<HTMLDivElement>(null);

  let formatTime = (time: number) => {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  let handleProgressChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current) {
      let rect = progressBarRef.current.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      let newTime = (percentage / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="flex items-center w-full mt-1 text-muted-foreground">
      <span className="text-xs tabular-nums">{formatTime(currentTime)}</span>
      <div
        ref={progressBarRef}
        className="flex-grow mx-2 h-1 bg-muted rounded-full cursor-pointer relative"
        onClick={handleProgressChange}
      >
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        ></div>
      </div>
      <span className="text-xs tabular-nums">{formatTime(duration)}</span>
    </div>
  );
}

/* -----------------------------------------------------------
   VOLUME (kanan)
----------------------------------------------------------- */
export function Volume() {
  let { audioRef, currentTrack } = usePlayback();
  let [volume, setVolume] = useState(100);
  let [isMuted, setIsMuted] = useState(false);
  let [isVolumeVisible, setIsVolumeVisible] = useState(false);
  let volumeBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted, audioRef]);

  let handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (volumeBarRef.current) {
      let rect = volumeBarRef.current.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setVolume(percentage);
      if (audioRef.current) {
        audioRef.current.volume = percentage / 100;
      }
      setIsMuted(percentage === 0);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-foreground"
        onClick={() => setIsVolumeVisible(!isVolumeVisible)}
        disabled={!currentTrack}
      >
        {isMuted ? <VolumeX /> : <Volume2 />}
      </Button>

      {isVolumeVisible && (
        <div className="absolute bottom-full right-0 mb-2 p-2 bg-background border border-border rounded-md shadow-lg">
          <div
            ref={volumeBarRef}
            className="w-20 h-1 bg-muted rounded-full cursor-pointer relative"
            onClick={handleVolumeChange}
          >
            <div
              className="absolute top-0 left-0 h-full bg-primary rounded-full"
              style={{ width: `${volume}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -----------------------------------------------------------
   MAIN NAVBAR WRAPPER
----------------------------------------------------------- */
export function PlaybackControls() {
  let {
    currentTrack,
    audioRef,
    setCurrentTime,
    setDuration,
    playPreviousTrack,
    playNextTrack,
    togglePlayPause,
  } = usePlayback();

  useEffect(() => {
    let audio = audioRef.current;
    if (!audio) return;

    let updateTime = () => setCurrentTime(audio.currentTime);
    let updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [audioRef, setCurrentTime, setDuration]);

  return (
    <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between p-3 bg-background border-t border-border">
      <audio ref={audioRef} />
      <TrackInfo />
      <div className="flex flex-col items-center w-1/3">
        <PlaybackButtons />
        <ProgressBar />
      </div>
      <div className="flex items-center justify-end space-x-2 w-1/3">
        <Volume />
      </div>
    </div>
  );
}
