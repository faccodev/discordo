"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useUIStore } from "@/stores/ui-store";
import { Avatar } from "@/components/ui/avatar";
import { EmbedCard } from "./embed-card";
import { formatRelativeTime, formatTimestamp, cn } from "@/lib/utils";
import { Loader2, ArrowDown, Smile } from "lucide-react";
import { MessageType } from "@/lib/discord/types";
import type { DiscordMessage } from "@/lib/discord/types";
import { ReactionBadge } from "./reaction-picker";
import { ReactionPicker } from "./reaction-picker";
import hljs from "highlight.js";

const MESSAGE_TYPES_WITH_CONTENT = [
  MessageType.DEFAULT,
  MessageType.REPLY,
  MessageType.SLASH_COMMAND,
];

function isMessageWithContent(type: MessageType): boolean {
  return MESSAGE_TYPES_WITH_CONTENT.includes(type);
}

function parseContent(content: string, mentions?: { id: string; username: string }[]): React.ReactNode[] {
  if (!content) return [];

  const parts: React.ReactNode[] = [];
  const mentionRegex = /<@!?(\d+)>/g;
  const channelRegex = /<#(\d+)>/g;
  const roleRegex = /<@&(\d+)>/g;
  const emojiRegex = /<(a)?:(\w+):(\d+)>/g;

  let lastIndex = 0;
  let match;

  // Split by all mention types
  const combinedRegex = /<[@#&]!?(\d+)|<a?:(\w+):(\d+)>|(`{3}[\s\S]*?`{3}|`[^`\n]+`)/g;
  const segments: { type: string; content: string; id?: string; animated?: boolean; emojiName?: string; emojiId?: string }[] = [];

  let i = 0;
  const temp = content;
  const mentionsById = new Map(mentions?.map((m) => [m.id, m]) || []);

  // Simple approach: process text and mentions separately
  const parts2: React.ReactNode[] = [];
  const mentionMap = new Map<string, string>();

  if (mentions) {
    mentions.forEach((m) => mentionMap.set(m.id, m.username));
  }

  // Process user mentions
  let processed = content;
  const userMentionRe = /<@!?(\d+)>/g;
  let userMatch;
  while ((userMatch = userMentionRe.exec(content)) !== null) {
    const id = userMatch[1];
    const username = mentionMap.get(id) || `User ${id}`;
    processed = processed.replace(userMatch[0], `[[MENTION:${id}:${username}]]`);
  }

  // Process channel mentions
  const channelRe = /<#(\d+)>/g;
  let channelMatch;
  while ((channelMatch = channelRe.exec(content)) !== null) {
    processed = processed.replace(channelMatch[0], `[[CHANNEL:${channelMatch[1]}]]`);
  }

  // Split by our markers
  const segments2 = processed.split(/(\[\[(?:MENTION|CHANNEL):[^\]]+\]\])/g);

  segments2.forEach((seg, idx) => {
    if (seg.startsWith("[[MENTION:")) {
      const [, id, username] = seg.match(/\[\[MENTION:([^:]+):([^\]]+)\]\]/) || [];
      parts2.push(
        <span key={idx} className="mention rounded px-0.5">
          @{username}
        </span>
      );
    } else if (seg.startsWith("[[CHANNEL:")) {
      const [, id] = seg.match(/\[\[CHANNEL:([^\]]+)\]\]/) || [];
      parts2.push(
        <span key={idx} className="channel-mention rounded px-0.5">
          #{id}
        </span>
      );
    } else if (seg) {
      parts2.push(seg);
    }
  });

  return parts2.length > 0 ? parts2 : [content];
}

function renderCode(content: string): React.ReactNode[] {
  // Inline code
  if (!content.includes("```")) {
    return parseContent(content);
  }

  const parts: React.ReactNode[] = [];
  const codeBlockRe = /```(\w*)\n?([\s\S]*?)```|`([^`]+)`/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRe.exec(content)) !== null) {
    // Text before code block
    if (match.index > lastIndex) {
      parts.push(...parseContent(content.slice(lastIndex, match.index)));
    }

    if (match[3]) {
      // Inline code
      parts.push(
        <code key={match.index} className="mx-0.5 rounded bg-dark-bl px-1 py-0.5 font-mono text-sm">
          {match[3]}
        </code>
      );
    } else {
      // Code block
      const lang = match[1] || "plaintext";
      const code = match[2].trim();
      try {
        if (lang && hljs.getLanguage(lang)) {
          const highlighted = hljs.highlight(code, { language: lang }).value;
          parts.push(
            <pre key={match.index} className="my-2 overflow-x-auto rounded bg-dark-bl p-3">
              <code
                className="font-mono text-sm"
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            </pre>
          );
        } else {
          parts.push(
            <pre key={match.index} className="my-2 overflow-x-auto rounded bg-dark-bl p-3">
              <code className="font-mono text-sm">{code}</code>
            </pre>
          );
        }
      } catch {
        parts.push(
          <pre key={match.index} className="my-2 overflow-x-auto rounded bg-dark-bl p-3">
            <code className="font-mono text-sm">{code}</code>
          </pre>
        );
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < content.length) {
    parts.push(...parseContent(content.slice(lastIndex)));
  }

  return parts;
}

function MessageItem({ message }: { message: DiscordMessage }) {
  const isContentMessage = isMessageWithContent(message.type);
  const [showPicker, setShowPicker] = useState<string | null>(null);

  if (!isContentMessage) {
    return (
      <div className="my-2 flex items-center gap-2">
        <div className="h-px flex-1 bg-dark-hover" />
        <span className="px-2 text-xs text-neutral-500">{message.content}</span>
        <div className="h-px flex-1 bg-dark-hover" />
      </div>
    );
  }

  const authorName = message.member?.nick || message.author.global_name || message.author.username;
  const avatarUrl = message.author.avatar
    ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`
    : null;

  return (
    <div className="group relative flex gap-4 px-4 py-1 hover:bg-dark-hover/50">
      {/* Avatar */}
      <Avatar
        src={avatarUrl}
        alt={authorName}
        userId={message.author.id}
        size="lg"
        className="mt-0.5 h-10 w-10 flex-shrink-0"
      />

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Header */}
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-white">{authorName}</span>
          <span className="text-xs text-neutral-500">
            {formatTimestamp(message.timestamp)}
          </span>
          {message.edited_timestamp && (
            <span className="text-xs text-neutral-600">(editado)</span>
          )}
        </div>

        {/* Message Content */}
        <div className="message-content mt-0.5 text-sm text-white">
          {renderCode(message.content)}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((attachment) => {
              const imageUrl = attachment.proxy_url || attachment.url;
              const isImage = attachment.content_type?.startsWith("image/");

              // Resolve partial URLs (e.g. just an ID without CDN domain)
              const resolvedUrl = imageUrl.startsWith("http")
                ? imageUrl
                : `https://cdn.discordapp.com/attachments/${message.channel_id}/${message.id}/${attachment.filename}`;

              if (isImage) {
                return (
                  <a
                    key={attachment.id}
                    href={resolvedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block max-w-md overflow-hidden rounded"
                  >
                    <img
                      src={resolvedUrl}
                      alt={attachment.description || attachment.filename}
                      className="max-h-96 rounded object-cover"
                      loading="lazy"
                    />
                  </a>
                );
              }
              return (
                <a
                  key={attachment.id}
                  href={resolvedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blurple hover:underline"
                >
                  📎 {attachment.filename}
                  {attachment.size > 0 && (
                    <span className="text-xs text-neutral-500">
                      ({(attachment.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        )}

        {/* Embeds */}
        {message.embeds && message.embeds.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.embeds.map((embed, idx) => (
              <EmbedCard key={idx} embed={embed} />
            ))}
          </div>
        )}

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.reactions.map((reaction, idx) => (
              <ReactionBadge
                key={idx}
                count={reaction.count}
                me={reaction.me}
                emoji={reaction.emoji}
                onClick={() =>
                  setShowPicker(showPicker === message.id ? null : message.id)
                }
              />
            ))}
            <button
              onClick={() =>
                setShowPicker(showPicker === message.id ? null : message.id)
              }
              className="flex h-6 w-6 items-center justify-center rounded-full border border-dark-bl bg-dark-hover text-neutral-500 hover:border-blurple hover:text-blurple transition-colors"
              title="Add reaction"
            >
              <Smile className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Reaction Picker */}
        {showPicker === message.id && (
          <div className="relative">
            <ReactionPicker
              channelId={message.channel_id}
              messageId={message.id}
              onClose={() => setShowPicker(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function MessageList({ channelId }: { channelId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { currentUser } = useUIStore();

  const {
    data: messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["discord-messages", channelId],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: "50" });
      if (pageParam) params.set("before", pageParam);
      const res = await fetch(`/api/discord/channels/${channelId}/messages?${params}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json() as Promise<DiscordMessage[]>;
    },
    getNextPageParam: (lastPage) =>
      lastPage.length > 0 ? lastPage[lastPage.length - 1].id : undefined,
    initialPageParam: undefined as string | undefined,
  });

  const allMessages = messages?.pages.flat().reverse() || [];

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 300);
  }, []);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (allMessages.length > 0) {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [channelId]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blurple" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        Erro ao carregar mensagens
      </div>
    );
  }

  if (allMessages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-neutral-500">Nenhuma mensagem ainda</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto px-4"
    >
      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center py-4">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded bg-dark-hover px-4 py-2 text-sm text-neutral-400 hover:bg-dark-active hover:text-white disabled:opacity-50"
          >
            {isFetchingNextPage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Carregar mensagens mais antigas"
            )}
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-0.5 pb-4">
        {allMessages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-8 flex items-center gap-1 rounded-full bg-blurple px-3 py-1.5 text-sm text-white shadow-lg transition-all hover:bg-blurple-dark"
        >
          <ArrowDown className="h-4 w-4" />
          Novas mensagens
        </button>
      )}
    </div>
  );
}
