'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { X, Search, Loader2, ArrowUp, ArrowDown, Hash, FileText, Image, Paperclip } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { DiscordMessage } from '@/lib/discord/types';

interface SearchModalProps {
  channelId?: string;
  channelName?: string;
  onClose: () => void;
}

interface SearchResponse {
  messages: DiscordMessage[];
  nextCursor: string | null;
  query: string;
  total: number;
}

export function SearchModal({ channelId, channelName, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loadMore, setLoadMore] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounce search query (faster for better UX)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setSelectedIndex(0);
    }, 300);
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

  // Fetch search results (message content search via Discord API)
  const { data: searchData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['discord-search', channelId, debouncedQuery],
    queryFn: async (): Promise<SearchResponse> => {
      if (!channelId) return { messages: [], nextCursor: null, query: '', total: 0 };
      const params = new URLSearchParams({ q: debouncedQuery, limit: '50' });
      const res = await fetch(
        `/api/discord/channels/${channelId}/messages/search?${params}`
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Search failed');
      }
      return res.json();
    },
    enabled: !!channelId && debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
    retry: 1,
  });

  // Fetch recent messages to search in embeds (Discord API only searches message content)
  const { data: recentMessages } = useQuery({
    queryKey: ['discord-messages-embed-search', channelId, debouncedQuery],
    queryFn: async (): Promise<DiscordMessage[]> => {
      if (!channelId || !debouncedQuery) return [];
      // Fetch last 100 messages to search through embeds
      const res = await fetch(
        `/api/discord/channels/${channelId}/messages?limit=100`
      );
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!channelId && debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
  });

  // Combine search results: API results + messages with matching embeds
  const messages = useMemo(() => {
    const apiMessages = searchData?.messages || [];
    const seenIds = new Set(apiMessages.map((m) => m.id));

    // Find messages where embeds match the search query
    const embedMatches = (recentMessages || [])
      .filter((msg) => {
        if (seenIds.has(msg.id)) return false;
        // Search in embed title, description, author name, footer, fields
        return msg.embeds?.some((embed) =>
          embed.title?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          embed.description?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          embed.author?.name?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          embed.footer?.text?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          embed.fields?.some((field) =>
            field.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            field.value.toLowerCase().includes(debouncedQuery.toLowerCase())
          )
        );
      });

    return [...apiMessages, ...embedMatches];
  }, [searchData, recentMessages, debouncedQuery]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!messages.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, messages.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (messages[selectedIndex]) {
          navigateToMessage(messages[selectedIndex]);
        }
        break;
    }
  }, [messages, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const item = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const navigateToMessage = useCallback((message: DiscordMessage) => {
    onClose();
    router.push(`/channels/${message.channel_id}`);
  }, [onClose, router]);

  // Clear selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[10vh]"
    >
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-sidebar)] shadow-2xl shadow-[rgba(62,207,142,0.15)]">
        {/* Header with search input */}
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <Search className="h-5 w-5 flex-shrink-0 text-[var(--color-brand)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Search${channelName ? ` in #${channelName}` : ''}...`}
            className="flex-1 bg-transparent font-mono text-base md:text-sm text-[var(--color-brand)] placeholder:text-[var(--color-text-muted)] focus:outline-none min-h-[36px]"
            autoComplete="off"
            spellCheck="false"
          />
          {isFetching && <Loader2 className="h-4 w-4 animate-spin text-[var(--color-brand)]" />}
          {query && !isFetching && (
            <button
              onClick={() => setQuery('')}
              className="flex-shrink-0 rounded-sm p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results */}
        <div ref={resultsRef} className="max-h-[65vh] overflow-y-auto overscroll-behavior-contain">
          {/* Empty state - no query */}
          {!query && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-bg-hover)]">
                <Search className="h-7 w-7 text-[var(--color-text-muted)]" />
              </div>
              <p className="font-mono text-sm font-medium text-[var(--color-text-secondary)]">
                Search{channelName ? ` in #${channelName}` : ' messages'}
              </p>
              <p className="mt-2 font-mono text-xs text-[var(--color-text-muted)]">
                Type at least 2 characters to search
              </p>
              <div className="mt-6 flex gap-2">
                <kbd className="rounded bg-[var(--color-bg-hover)] px-2 py-1 font-mono text-xs text-[var(--color-text-secondary)]">↑↓</kbd>
                <span className="font-mono text-xs text-[var(--color-text-muted)]">navigate</span>
                <kbd className="rounded bg-[var(--color-bg-hover)] px-2 py-1 font-mono text-xs text-[var(--color-text-secondary)]">Enter</kbd>
                <span className="font-mono text-xs text-[var(--color-text-muted)]">open</span>
                <kbd className="rounded bg-[var(--color-bg-hover)] px-2 py-1 font-mono text-xs text-[var(--color-text-secondary)]">Esc</kbd>
                <span className="font-mono text-xs text-[var(--color-text-muted)]">close</span>
              </div>
            </div>
          )}

          {/* Typing state */}
          {query && debouncedQuery.length < 2 && (
            <div className="flex items-center justify-center py-12 font-mono text-sm text-[var(--color-text-secondary)]">
              Keep typing...
            </div>
          )}

          {/* No results */}
          {debouncedQuery.length >= 2 && !isFetching && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-bg-hover)]">
                <Hash className="h-7 w-7 text-[var(--color-text-muted)]" />
              </div>
              <p className="font-mono text-sm font-medium text-[var(--color-text-secondary)]">
                No results for &ldquo;<span className="text-[var(--color-brand)]">{debouncedQuery}</span>&rdquo;
              </p>
              <p className="mt-2 font-mono text-xs text-[var(--color-text-muted)]">
                Try a different keyword or check the spelling
              </p>
            </div>
          )}

          {/* Results list */}
          {messages.length > 0 && (
            <div className="divide-y divide-[var(--color-border)]">
              {messages.map((message, index) => (
                <SearchResultItem
                  key={message.id}
                  message={message}
                  query={debouncedQuery}
                  isSelected={index === selectedIndex}
                  onClick={() => navigateToMessage(message)}
                  onMouseEnter={() => setSelectedIndex(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-2">
          <div className="flex items-center gap-4">
            <p className="font-mono text-xs text-[var(--color-text-muted)]">
              {messages.length > 0 && `${messages.length} results`}
            </p>
            <p className="font-mono text-xs text-[var(--color-text-muted)]">
              {messages.length > 0 && (
                <span className="ml-2">
                  Selected: {selectedIndex + 1}/{messages.length}
                </span>
              )}
            </p>
          </div>
          <p className="font-mono text-xs text-[var(--color-text-muted)]">
            Press ESC to close
          </p>
        </div>
      </div>
    </div>
  );
}

interface SearchResultItemProps {
  message: DiscordMessage;
  query: string;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

function SearchResultItem({ message, query, isSelected, onClick, onMouseEnter }: SearchResultItemProps) {
  const authorName =
    message.member?.nick || message.author.global_name || message.author.username;
  const avatarUrl = message.author.avatar
    ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`
    : undefined;

  const hasAttachments = message.attachments && message.attachments.length > 0;
  const hasEmbeds = message.embeds && message.embeds.length > 0;

  // Find if query matches in content or embeds
  const queryLower = query.toLowerCase();
  const contentMatches = message.content.toLowerCase().includes(queryLower);
  const matchingEmbed = message.embeds?.find((embed) =>
    embed.title?.toLowerCase().includes(queryLower) ||
    embed.description?.toLowerCase().includes(queryLower) ||
    embed.author?.name?.toLowerCase().includes(queryLower)
  );

  const highlightedContent = useMemo(() => {
    if (contentMatches) {
      return highlightSearchTerm(message.content, query);
    }
    if (matchingEmbed) {
      // Show the matching embed field
      if (matchingEmbed.title?.toLowerCase().includes(queryLower)) {
        return <span className="italic opacity-80">📎 {matchingEmbed.title}</span>;
      }
      if (matchingEmbed.description) {
        // Truncate and highlight
        const desc = matchingEmbed.description.slice(0, 200);
        return <span className="italic opacity-80">📎 {desc}{matchingEmbed.description.length > 200 ? '...' : ''}</span>;
      }
    }
    return message.content || <span className="italic text-[var(--color-text-muted)]">No text content</span>;
  }, [message.content, message.embeds, query, contentMatches, matchingEmbed]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors min-h-[72px]',
        isSelected
          ? 'bg-[var(--color-bg-hover)] border-l-2 border-[var(--color-brand)]'
          : 'hover:bg-[var(--color-bg-hover)] border-l-2 border-transparent'
      )}
    >
      <div className="relative flex-shrink-0">
        <Avatar
          src={avatarUrl}
          alt={authorName}
          userId={message.author.id}
          size="sm"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className={cn(
            'font-mono text-sm font-semibold',
            isSelected ? 'text-[var(--color-brand)]' : 'text-[var(--color-text)]'
          )}>
            {authorName}
          </span>
          <span className="font-mono text-xs text-[var(--color-text-muted)]">
            {formatRelativeTime(message.timestamp)}
          </span>
          {matchingEmbed && !contentMatches && (
            <span className="ml-auto font-mono text-xs text-[var(--color-brand)] bg-[rgba(62,207,142,0.15)] px-1.5 py-0.5 rounded">
              in embed
            </span>
          )}
        </div>

        <div className={cn(
          'mt-1 font-mono text-sm leading-relaxed',
          isSelected ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-secondary)]'
        )}>
          {highlightedContent}
        </div>

        {/* Attachment/Embed indicators */}
        {(hasAttachments || hasEmbeds) && (
          <div className="mt-1.5 flex items-center gap-2">
            {hasAttachments && (
              <span className="flex items-center gap-1 font-mono text-xs text-[var(--color-text-muted)]">
                <Paperclip className="h-3 w-3" />
                {message.attachments![0].filename}
                {message.attachments!.length > 1 && ` +${message.attachments!.length - 1}`}
              </span>
            )}
            {hasEmbeds && !hasAttachments && (
              <span className="flex items-center gap-1 font-mono text-xs text-[var(--color-text-muted)]">
                <FileText className="h-3 w-3" />
                Link/Embed
              </span>
            )}
          </div>
        )}
      </div>

      {/* Active indicator */}
      {isSelected && (
        <div className="flex-shrink-0 self-center">
          <ArrowUp className="h-4 w-4 text-[var(--color-brand)]" />
        </div>
      )}
    </button>
  );
}

function highlightSearchTerm(text: string, query: string): React.ReactNode {
  if (!text || !query) {
    return text || <span className="italic text-[var(--color-text-muted)]">No text content</span>;
  }

  const parts: React.ReactNode[] = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  let lastIndex = 0;
  let index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    return text;
  }

  while (index !== -1) {
    // Add text before match
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    // Add highlighted match
    parts.push(
      <mark
        key={index}
        className="rounded-sm bg-[rgba(62,207,142,0.25)] px-0.5 py-0 text-[var(--color-brand)] font-semibold"
      >
        {text.slice(index, index + query.length)}
      </mark>
    );

    lastIndex = index + query.length;
    index = lowerText.indexOf(lowerQuery, lastIndex);
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}