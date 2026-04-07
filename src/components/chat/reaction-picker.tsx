'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Smile, X } from 'lucide-react';

// Common Discord-like emojis for quick access
const QUICK_EMOJIS = [
  '👍', '👎', '❤️', '😄', '😢', '😮', '🤔', '🎉',
  '😍', '😂', '🥺', '😎', '🤩', '😭', '😤',
  '✅', '❌', '💯', '🔥', '✨', '💀', '🙈', '👀',
];

function encodeEmoji(emoji: string): string {
  // Custom emoji format: :emojiName:
  if (emoji.startsWith(':') && emoji.endsWith(':')) {
    return emoji;
  }
  // Unicode emoji — URL encode it
  return encodeURIComponent(emoji);
}

interface ReactionPickerProps {
  channelId: string;
  messageId: string;
  onClose: () => void;
}

export function ReactionPicker({ channelId, messageId, onClose }: ReactionPickerProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  const toggleMutation = useMutation({
    mutationFn: async (emoji: string) => {
      const encoded = encodeEmoji(emoji);
      const res = await fetch(`/api/discord/channels/${channelId}/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji: encoded }),
      });
      if (!res.ok) throw new Error('Failed to toggle reaction');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discord-messages', channelId] });
      onClose();
    },
  });

  const filteredEmojis = search
    ? QUICK_EMOJIS.filter((e) => e.includes(search))
    : QUICK_EMOJIS;

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full left-0 z-50 mb-2 w-80 rounded-lg border border-dark-bl bg-dark shadow-xl"
    >
      {/* Search */}
      <div className="flex items-center gap-2 border-b border-dark px-3 py-2">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emoji..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
        />
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded text-neutral-500 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Quick emojis */}
      <div className="flex flex-wrap gap-1 p-2">
        {filteredEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => toggleMutation.mutate(emoji)}
            disabled={toggleMutation.isPending}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded text-lg transition-colors',
              'hover:bg-dark-hover hover:scale-110',
              toggleMutation.isPending && 'opacity-50'
            )}
            title={emoji}
          >
            {emoji}
          </button>
        ))}
        {filteredEmojis.length === 0 && (
          <p className="w-full py-4 text-center text-sm text-neutral-500">
            No results
          </p>
        )}
      </div>
    </div>
  );
}

// Reaction badge shown on messages
interface ReactionBadgeProps {
  count: number;
  me: boolean;
  emoji: { id: string | null; name: string | null; animated?: boolean };
  onClick?: () => void;
}

export function ReactionBadge({ count, me, emoji, onClick }: ReactionBadgeProps) {
  const displayEmoji = emoji.name || '❓';

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors',
        me
          ? 'border-blurple bg-blurple/20 text-blurple'
          : 'border-dark-bl bg-dark-hover text-neutral-400 hover:border-dark-hover hover:bg-dark-active hover:text-white'
      )}
    >
      <span className="text-sm">{displayEmoji}</span>
      <span className={cn('font-medium', me && 'text-blurple')}>{count}</span>
    </button>
  );
}