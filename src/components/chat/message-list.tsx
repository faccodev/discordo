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
import { VideoPlayer } from "./video-player";
import { AudioPlayer } from "./audio-player";
import { ImageLightbox } from "./image-lightbox";
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

  const parts2: React.ReactNode[] = [];
  const mentionMap = new Map<string, string>();
  if (mentions) mentions.forEach((m) => mentionMap.set(m.id, m.username));

  // Escape HTML to prevent XSS
  let processed = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Process Discord mentions first (before any markdown)
  const userMentionRe = /&lt;@!?(\d+)&gt;/g;
  processed = processed.replace(userMentionRe, (m, id) => {
    const username = mentionMap.get(id) || `User ${id}`;
    return `[[MENTION:${id}:${username}]]`;
  });

  const channelRe = /&lt;#(\d+)&gt;/g;
  processed = processed.replace(channelRe, (_m, id) => `[[CHANNEL:${id}]]`);

  // Markdown formatting: bold, italic, strikethrough, links, code
  // Order matters: code first to protect markdown chars inside code
  const markdownRe = /(`[^`\n]+`|\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_|~~([^~]+)~~|\[([^\]]+)\]\(([^)]+)\))/g;

  let lastIndex = 0;
  let match;
  const segments: { type: string; content: string; url?: string }[] = [];
  const tempProcessed = processed; // keep original reference for mentions

  // Split by code blocks first to avoid formatting inside them
  const codeBlockRe = /(`{3}[\s\S]*?`{3})|`[^`\n]+`/g;
  const blocks: { type: "code" | "text"; content: string; match: string }[] = [];
  let codeLast = 0;
  let codeMatch;

  const reForCode = /(`{3}[\s\S]*?`{3})|`[^`\n]+`/g;
  while ((codeMatch = reForCode.exec(processed)) !== null) {
    if (codeMatch.index > codeLast) {
      blocks.push({ type: "text", content: processed.slice(codeLast, codeMatch.index), match: "" });
    }
    blocks.push({ type: "code", content: codeMatch[0], match: codeMatch[0] });
    codeLast = codeMatch.index + codeMatch[0].length;
  }
  if (codeLast < processed.length) {
    blocks.push({ type: "text", content: processed.slice(codeLast), match: "" });
  }

  blocks.forEach((block) => {
    if (block.type === "code") {
      // Unescape for display
      const unescaped = block.content
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
      if (block.content.startsWith("```")) {
        segments.push({ type: "codeblock", content: unescaped });
      } else {
        segments.push({ type: "inlinecode", content: unescaped });
      }
    } else {
      // Apply markdown to text
      const markdownRe = /(\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_|~~([^~]+)~~|\[([^\]]+)\]\(([^)]+)\)|(`{3}[\s\S]*?`{3})|`([^`\n]+)`)/g;
      let m;
      let textLast = 0;
      while ((m = markdownRe.exec(block.content)) !== null) {
        if (m.index > textLast) {
          segments.push({ type: "text", content: block.content.slice(textLast, m.index) });
        }
        if (m[2] !== undefined) {
          segments.push({ type: "bold", content: m[2] });
        } else if (m[3] !== undefined) {
          segments.push({ type: "italic", content: m[3] });
        } else if (m[4] !== undefined) {
          segments.push({ type: "italic", content: m[4] });
        } else if (m[5] !== undefined) {
          segments.push({ type: "strike", content: m[5] });
        } else if (m[6] !== undefined && m[7] !== undefined) {
          segments.push({ type: "link", content: m[6], url: m[7] });
        } else if (m[8] !== undefined) {
          segments.push({ type: "codeblock", content: m[8] });
        } else if (m[9] !== undefined) {
          segments.push({ type: "inlinecode", content: m[9] });
        }
        textLast = m.index + m[0].length;
      }
      if (textLast < block.content.length) {
        segments.push({ type: "text", content: block.content.slice(textLast) });
      }
    }
  });

  segments.forEach((seg, idx) => {
    if (seg.type === "text") {
      // Restore mention/channel markers that were escaped
      const withMentions = seg.content
        .replace(/\[\[MENTION:([^:]+):([^\]]+)\]\]/g, (_s, id, username) =>
          `<span class="mention rounded px-0.5">@${username}</span>`
        )
        .replace(/\[\[CHANNEL:([^\]]+)\]\]/g, (_s, id) =>
          `<span class="channel-mention rounded px-0.5">#${id}</span>`
        );
      // Render allowed HTML from mentions
      parts2.push(<span key={idx} dangerouslySetInnerHTML={{ __html: withMentions }} />);
    } else if (seg.type === "bold") {
      parts2.push(<strong key={idx} className="font-bold">{seg.content}</strong>);
    } else if (seg.type === "italic") {
      parts2.push(<em key={idx} className="italic">{seg.content}</em>);
    } else if (seg.type === "strike") {
      parts2.push(<del key={idx} className="line-through opacity-60">{seg.content}</del>);
    } else if (seg.type === "link") {
      parts2.push(<a key={idx} href={seg.url} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">{seg.content}</a>);
    } else if (seg.type === "inlinecode") {
      const unescaped = seg.content.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
      parts2.push(
        <code key={idx} className="mx-0.5 rounded-sm bg-bg-hover border border-border px-1 py-0.5 font-mono text-xs text-primary">
          {unescaped}
        </code>
      );
    } else if (seg.type === "codeblock") {
      const code = seg.content
        .replace(/```(\w*)\n?/, "")
        .replace(/```$/, "")
        .trim();
      const lang = seg.content.match(/^```(\w*)/)?.[1] || "plaintext";
      try {
        if (lang && hljs.getLanguage(lang)) {
          const highlighted = hljs.highlight(code, { language: lang }).value;
          parts2.push(
            <pre key={idx} className="my-2 overflow-x-auto rounded-sm border border-border bg-bg-hover p-3">
              <code className="font-mono text-xs text-primary" dangerouslySetInnerHTML={{ __html: highlighted }} />
            </pre>
          );
        } else {
          parts2.push(
            <pre key={idx} className="my-2 overflow-x-auto rounded-sm border border-border bg-bg-hover p-3">
              <code className="font-mono text-xs text-primary">{code}</code>
            </pre>
          );
        }
      } catch {
        parts2.push(
          <pre key={idx} className="my-2 overflow-x-auto rounded-sm border border-border bg-bg-hover p-3">
            <code className="font-mono text-xs text-primary">{code}</code>
          </pre>
        );
      }
    }
  });

  return parts2.length > 0 ? parts2 : [content];
}

function renderCode(content: string): React.ReactNode[] {
  return parseContent(content);
}

function ImageWithFallback({
  src,
  alt,
  authorInitial,
  onClick,
}: {
  src: string;
  alt: string;
  authorInitial: string;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={onClick}
      className="block max-w-[100px] overflow-hidden rounded-sm"
    >
      {imgError ? (
        <div className="flex h-14 w-14 items-center justify-center border border-border bg-bg-hover font-mono text-2xl text-primary">
          {authorInitial}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className="max-h-24 rounded-sm object-cover hover:opacity-90 transition-opacity"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      )}
    </button>
  );
}

function MessageItem({ message }: { message: DiscordMessage }) {
  const isContentMessage = isMessageWithContent(message.type);
  const [showPicker, setShowPicker] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxIsVideo, setLightboxIsVideo] = useState(false);

  if (!isContentMessage) {
    return (
      <div className="my-2 flex items-center gap-2">
        <div className="h-px flex-1 bg-border-bright" />
        <span className="px-2 text-xs font-mono text-cyan">{message.content}</span>
        <div className="h-px flex-1 bg-border-bright" />
      </div>
    );
  }

  const authorName = message.member?.nick || message.author.global_name || message.author.username;
  const avatarUrl = message.author.avatar
    ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`
    : null;
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <div className="group relative flex gap-3 px-4 py-0.5 hover:bg-primary/5">
      {/* Avatar */}
      <Avatar
        src={avatarUrl}
        alt={authorName}
        userId={message.author.id}
        size="lg"
        className="mt-0.5 h-8 w-8 flex-shrink-0"
      />

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Header */}
        <div className="flex items-baseline gap-2 leading-tight">
          <span className="font-mono text-sm font-semibold text-primary">{authorName}</span>
          <span className="font-mono text-xs text-text-muted">
            {formatTimestamp(message.timestamp)}
          </span>
          {message.edited_timestamp && (
            <span className="font-mono text-xs text-text-muted">(editado)</span>
          )}
        </div>

        {/* Message Content */}
        <div className="message-content leading-relaxed font-mono text-xs text-text-dim">
          {renderCode(message.content)}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((attachment) => {
              const imageUrl = attachment.proxy_url || attachment.url;
              const isImage = attachment.content_type?.startsWith("image/");
              const isVideo = attachment.content_type?.startsWith("video/");

              // Resolve partial URLs (e.g. just an ID without CDN domain)
              const resolvedUrl = imageUrl.startsWith("http")
                ? imageUrl
                : `https://cdn.discordapp.com/attachments/${message.channel_id}/${message.id}/${attachment.filename}`;

              if (isImage) {
                return (
                  <ImageWithFallback
                    key={attachment.id}
                    src={resolvedUrl}
                    alt={attachment.description || attachment.filename}
                    authorInitial={authorInitial}
                    onClick={() => { setLightboxSrc(resolvedUrl); setLightboxIsVideo(false); }}
                  />
                );
              }

              if (isVideo) {
                return (
                  <button
                    key={attachment.id}
                    onClick={() => { setLightboxSrc(resolvedUrl); setLightboxIsVideo(true); }}
                    className="block max-w-[180px] overflow-hidden rounded"
                  >
                    <VideoPlayer
                      src={resolvedUrl}
                      filename={attachment.filename}
                      className="max-w-[180px]"
                    />
                  </button>
                );
              }

              if (attachment.content_type?.startsWith("audio/")) {
                return (
                  <AudioPlayer
                    key={attachment.id}
                    src={resolvedUrl}
                    filename={attachment.filename}
                  />
                );
              }

              return (
                <a
                  key={attachment.id}
                  href={resolvedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-mono text-xs text-cyan hover:underline"
                >
                  📎 {attachment.filename}
                  {attachment.size > 0 && (
                    <span className="text-xs font-mono text-text-dim">
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
              className="flex h-6 w-6 items-center justify-center rounded-sm border border-border bg-bg-hover text-text-dim hover:border-primary hover:text-primary transition-colors"
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

        {/* Image/Video Lightbox */}
        {lightboxSrc && (
          <ImageLightbox
            src={lightboxSrc}
            isVideo={lightboxIsVideo}
            onClose={() => setLightboxSrc(null)}
          />
        )}
      </div>
    </div>
  );
}

export function MessageList({ channelId }: { channelId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { currentUser, markChannelRead } = useUIStore();

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
  const lastMessageId = allMessages[allMessages.length - 1]?.id;

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

  // Mark channel as read when user scrolls to bottom or opens channel with messages
  useEffect(() => {
    if (lastMessageId) {
      fetch(`/api/discord/channels/${channelId}/ack`, { method: "POST" });
      markChannelRead(channelId, lastMessageId);
    }
  }, [channelId, lastMessageId, markChannelRead]);

  // Scroll to bottom when messages finish loading (after entering a channel)
  useEffect(() => {
    if (!isLoading && allMessages.length > 0) {
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      });
    }
  }, [isLoading, channelId]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center font-mono text-error">
        Erro ao carregar mensagens
      </div>
    );
  }

  if (allMessages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-mono text-text-dim">Nenhuma mensagem ainda</p>
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
            className="rounded-sm border border-border bg-bg-hover px-4 py-2 text-sm font-mono text-text-dim hover:border-primary hover:text-primary disabled:opacity-50"
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
          className="fixed bottom-24 right-8 flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-mono text-black shadow-lg transition-all hover:shadow-[0_0_12px_#00FF41]"
        >
          <ArrowDown className="h-4 w-4" />
          Novas mensagens
        </button>
      )}
    </div>
  );
}
