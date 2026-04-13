'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
  filename?: string;
}

export function AudioPlayer({ src, filename }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(pct);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex w-full max-w-sm items-center gap-3 rounded-sm border border-border bg-bg-hover px-3 py-2">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        className="flex min-w-[44px] min-h-[44px] flex-shrink-0 items-center justify-center rounded-full bg-primary text-black hover:shadow-[0_0_8px_#00FF41] transition-colors p-2"
      >
        {isPlaying ? (
          <Pause className="h-5 w-5 fill-black" />
        ) : (
          <Play className="h-5 w-5 fill-black" />
        )}
      </button>

      {/* Progress */}
      <div className="flex-1">
        <div
          className="group h-1.5 w-full cursor-pointer rounded-full bg-border"
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-mono text-xs text-text-dim">
            {formatTime(audioRef.current?.currentTime || 0)} / {formatTime(duration)}
          </span>
          {filename && (
            <span className="truncate font-mono text-xs text-text-dim max-w-[100px]">{filename}</span>
          )}
        </div>
      </div>

      {/* Mute */}
      <button
        onClick={toggleMute}
        className="flex min-w-[44px] min-h-[44px] flex-shrink-0 items-center justify-center rounded text-text-dim hover:text-primary transition-colors p-2"
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
