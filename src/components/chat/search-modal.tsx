'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { X, Search, Loader2, ArrowUp, ArrowDown, Hash } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { formatRelativeTime } from '@/lib/utils';
import type { DiscordMessage } from '@/lib/discord/types';

interface SearchModalProps {
  channelId?: string;
  channelName?: string;
  onClose: () => void;
}

export function SearchModal({ channelId, channelName, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const { data: results, isLoading, isFetching } = useQuery({
    queryKey: ['discord-search', channelId, debouncedQuery],
    queryFn: async () => {
      if (!channelId) return [];
      const params = new URLSearchParams({ q: debouncedQuery });
      const res = await fetch(
        `/api/discord/channels/${channelId}/messages/search?${params}`
      );
      if (!res.ok) throw new Error('Search failed');
      return res.json() as Promise<DiscordMessage[]>;
    },
    enabled: !!channelId && debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
  });

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[15vh]"
    >
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-dark shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-dark-bl px-4 py-3">
          <Search className="h-4 w-4 flex-shrink-0 text-neutral-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search${channelName ? ` in #${channelName}` : ''}...`}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
          />
          {isFetching && <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />}
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded p-1 text-neutral-500 hover:bg-dark-hover hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* Empty state */}
          {!query && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="mb-3 h-10 w-10 text-neutral-600" />
              <p className="text-sm font-medium text-neutral-400">
                Search{channelName ? ` in #${channelName}` : ' messages'}
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                Type at least 2 characters to search
              </p>
            </div>
          )}

          {/* Loading */}
          {query && debouncedQuery.length < 2 && (
            <div className="flex items-center justify-center py-12 text-sm text-neutral-500">
              Keep typing...
            </div>
          )}

          {/* Results */}
          {debouncedQuery.length >= 2 && results?.length === 0 && !isFetching && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-neutral-400">
                No results for &ldquo;{debouncedQuery}&rdquo;
              </p>
            </div>
          )}

          {results && results.length > 0 && (
            <div className="divide-y divide-dark-bl">
              {results.map((message) => (
                <SearchResultItem key={message.id} message={message} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-dark-bl px-4 py-2">
          <p className="text-xs text-neutral-600">
            {results?.length ?? 0} results • Press ESC to close
          </p>
        </div>
      </div>
    </div>
  );
}

function SearchResultItem({ message }: { message: DiscordMessage }) {
  const router = useRouter();
  const authorName =
    message.member?.nick || message.author.global_name || message.author.username;
  const avatarUrl = message.author.avatar
    ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`
    : undefined;

  const handleClick = () => {
    // Navigate to channel and scroll to message
    router.push(`/channels/${message.channel_id}`);
    // Could also scroll to message with fragment
  };

  return (
    <button
      onClick={handleClick}
      className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-dark-hover transition-colors"
    >
      <Avatar
        src={avatarUrl}
        alt={authorName}
        userId={message.author.id}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-white">{authorName}</span>
          <span className="text-xs text-neutral-500">
            {formatRelativeTime(message.timestamp)}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm text-neutral-300">
          {highlightQuery(message.content)}
        </p>
        {message.attachments && message.attachments.length > 0 && (
          <p className="mt-1 text-xs text-neutral-600">
            📎 {message.attachments[0].filename}
          </p>
        )}
      </div>
    </button>
  );
}

function highlightQuery(text: string): React.ReactNode {
  // Simple highlight — will be refined
  return text || <span className="italic text-neutral-600">No text content</span>;
}
