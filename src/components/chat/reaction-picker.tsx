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
      className="absolute bottom-full left-0 z-50 mb-2 w-80 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-sidebar)] shadow-xl"
    >
      {/* Search */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3 py-2">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emoji..."
          className="flex-1 bg-transparent font-mono text-sm text-[var(--color-brand)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
        />
        <button
          onClick={onClose}
          className="flex min-w-[44px] min-h-[44px] items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition-colors"
        >
          <X className="h-5 w-5" />
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
              'flex min-w-[44px] min-h-[44px] items-center justify-center rounded-lg text-xl transition-colors',
              'hover:bg-[var(--color-brand)]/10 hover:scale-110',
              toggleMutation.isPending && 'opacity-50'
            )}
            title={emoji}
          >
            {emoji}
          </button>
        ))}
        {filteredEmojis.length === 0 && (
          <p className="w-full py-4 text-center font-mono text-sm text-[var(--color-text-secondary)]">
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
        'flex items-center gap-1 rounded-sm border px-2 py-0.5 font-mono text-xs transition-colors',
        me
          ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-brand)]'
          : 'border-[var(--color-border)] bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)]/5 hover:text-[var(--color-brand)]'
      )}
    >
      <span className="text-sm">{displayEmoji}</span>
      <span className={cn('font-medium', me && 'text-[var(--color-brand)]')}>{count}</span>
    </button>
  );
}