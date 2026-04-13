'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  filename?: string;
  poster?: string;
  className?: string;
}

export function VideoPlayer({ src, filename, poster, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(pct);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={cn('relative w-full max-w-sm overflow-hidden rounded-sm border border-[var(--color-border)] bg-[var(--color-bg-deep)]', className)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        playsInline
      />

      {/* Big play button overlay */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-deep)]/40 transition-colors hover:bg-[var(--color-bg-deep)]/50 min-h-[100px]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(255,255,255,0.2)] backdrop-blur-sm transition-transform hover:scale-110">
            <Play className="h-7 w-7 text-[var(--color-text)] fill-[var(--color-text)]" />
          </div>
        </button>
      )}

      {/* Controls bar */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-6 transition-opacity',
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Progress bar */}
        <div
          className="group mb-1.5 h-1 w-full cursor-pointer rounded-full bg-white/30"
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full bg-[var(--color-brand)] transition-all group-hover:h-1.5"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-1">
          <button
            onClick={togglePlay}
            className="flex min-w-[44px] min-h-[44px] items-center justify-center rounded text-[var(--color-text)] hover:bg-[rgba(255,255,255,0.2)] transition-colors"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-[var(--color-text)]" />
            ) : (
              <Play className="h-5 w-5 fill-[var(--color-text)]" />
            )}
          </button>

          <button
            onClick={toggleMute}
            className="flex min-w-[44px] min-h-[44px] items-center justify-center rounded text-[var(--color-text)] hover:bg-[rgba(255,255,255,0.2)] transition-colors"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>

          <div className="flex-1" />

          {filename && (
            <span className="text-[10px] text-[var(--color-text)]/60 truncate max-w-[80px]">{filename}</span>
          )}

          <button
            onClick={toggleFullscreen}
            className="flex min-w-[44px] min-h-[44px] items-center justify-center rounded text-[var(--color-text)] hover:bg-[rgba(255,255,255,0.2)] transition-colors"
          >
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
