'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { VideoPlayer } from './video-player';

interface ImageLightboxProps {
  src: string;
  alt?: string;
  isVideo?: boolean;
  onClose: () => void;
}

export function ImageLightbox({ src, isVideo, onClose }: ImageLightboxProps) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handle);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handle);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-sm border border-[var(--color-brand)] bg-[var(--color-bg-hover)] text-[var(--color-brand)] hover:shadow-[0_0_8px_#00D4FF] transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
      {isVideo ? (
        <div className="max-h-[85vh] max-w-[90vw] w-full" onClick={(e) => e.stopPropagation()}>
          <VideoPlayer src={src} className="w-full max-w-3xl mx-auto" />
        </div>
      ) : (
        <img
          src={src}
          alt=""
          className="max-h-[90vh] max-w-[90vw] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}
