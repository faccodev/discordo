"use client";

import { useState } from "react";
import Image from "next/image";
import { type Embed } from "@/lib/discord/types";
import { VideoPlayer } from "./video-player";
import { ImageLightbox } from "./image-lightbox";
import hljs from "highlight.js";

interface EmbedCardProps {
  embed: Embed;
}

function getEmbedColor(color?: number): string {
  if (!color) return "#00D4FF";
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  return `rgb(${r}, ${g}, ${b})`;
}

function EmbedImage({
  src,
  alt,
  width,
  height,
  onClick,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  onClick: () => void;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="flex items-center justify-center rounded-sm border border-[var(--color-border)] bg-[var(--color-bg-hover)] font-mono text-sm text-[var(--color-brand)] cursor-pointer"
        style={{ width: width || 400, height: height || 200 }}
        onClick={onClick}
      >
        🖼️
      </div>
    );
  }

  return (
    <button onClick={onClick} className="mt-2 block text-left">
      <Image
        src={src}
        alt={alt}
        width={width || 400}
        height={height || 200}
        className="max-w-full rounded-sm object-cover"
        style={{ maxHeight: height || 200 }}
        onError={() => setFailed(true)}
      />
    </button>
  );
}

function renderMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  const parts: React.ReactNode[] = [];

  // Escape HTML first
  let escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Process markdown patterns (bold, italic, strike, link, code)
  const tokens: { type: string; content: string; url?: string }[] = [];
  const codeRe = /(`{3}[\s\S]*?`{3})|`([^`\n]+)`/g;
  const markdownRe = /(\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_|~~([^~]+)~~|\[([^\]]+)\]\(([^)]+)\))/g;

  let lastIdx = 0;
  let m;

  while ((m = codeRe.exec(escaped)) !== null) {
    if (m.index > lastIdx) {
      tokens.push({ type: "text", content: escaped.slice(lastIdx, m.index) });
    }
    tokens.push({ type: m[0].startsWith("```") ? "codeblock" : "inlinecode", content: m[0] });
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < escaped.length) {
    tokens.push({ type: "text", content: escaped.slice(lastIdx) });
  }

  const result: React.ReactNode[] = [];

  tokens.forEach((token, idx) => {
    if (token.type === "text") {
      // Apply inline markdown to plain text segments
      let textContent = token.content;
      const inlineParts: React.ReactNode[] = [];
      let inlineLast = 0;
      while ((m = markdownRe.exec(textContent)) !== null) {
        if (m.index > inlineLast) {
          inlineParts.push(<span key={`${idx}-t-${inlineLast}`}>{textContent.slice(inlineLast, m.index)}</span>);
        }
        if (m[2] !== undefined) {
          inlineParts.push(<strong key={`${idx}-b-${m.index}`} className="font-bold">{m[2]}</strong>);
        } else if (m[3] !== undefined) {
          inlineParts.push(<em key={`${idx}-i-${m.index}`} className="italic">{m[3]}</em>);
        } else if (m[4] !== undefined) {
          inlineParts.push(<em key={`${idx}-i-${m.index}`} className="italic">{m[4]}</em>);
        } else if (m[5] !== undefined) {
          inlineParts.push(<del key={`${idx}-s-${m.index}`} className="line-through opacity-60">{m[5]}</del>);
        } else if (m[6] !== undefined && m[7] !== undefined) {
          inlineParts.push(<a key={`${idx}-l-${m.index}`} href={m[7]} target="_blank" rel="noopener noreferrer" className="text-[var(--color-brand)] hover:underline">{m[6]}</a>);
        }
        inlineLast = m.index + m[0].length;
      }
      if (inlineLast < textContent.length) {
        inlineParts.push(<span key={`${idx}-t-${inlineLast}`}>{textContent.slice(inlineLast)}</span>);
      }
      result.push(...inlineParts);
    } else if (token.type === "inlinecode") {
      const code = token.content.slice(1, -1)
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
      result.push(
        <code key={idx} className="mx-0.5 rounded-sm bg-[var(--color-bg-hover)] border border-[var(--color-border)] px-1 py-0.5 font-mono text-xs text-[var(--color-brand)]">
          {code}
        </code>
      );
    } else if (token.type === "codeblock") {
      const code = token.content
        .replace(/```(\w*)\n?/, "").replace(/```$/, "").trim();
      const lang = token.content.match(/^```(\w*)/)?.[1] || "plaintext";
      try {
        if (lang && hljs.getLanguage(lang)) {
          const highlighted = hljs.highlight(code, { language: lang }).value;
          result.push(
            <pre key={idx} className="my-2 overflow-x-auto rounded-sm border border-[var(--color-border)] bg-[var(--color-bg-hover)] p-3">
              <code className="font-mono text-xs text-[var(--color-brand)]" dangerouslySetInnerHTML={{ __html: highlighted }} />
            </pre>
          );
        } else {
          result.push(
            <pre key={idx} className="my-2 overflow-x-auto rounded-sm border border-[var(--color-border)] bg-[var(--color-bg-hover)] p-3">
              <code className="font-mono text-xs text-[var(--color-brand)]">{code}</code>
            </pre>
          );
        }
      } catch {
        result.push(
          <pre key={idx} className="my-2 overflow-x-auto rounded-sm border border-[var(--color-border)] bg-[var(--color-bg-hover)] p-3">
            <code className="font-mono text-xs text-[var(--color-brand)]">{code}</code>
          </pre>
        );
      }
    }
  });

  return result;
}

export function EmbedCard({ embed }: EmbedCardProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxIsVideo, setLightboxIsVideo] = useState(false);
  const hasColor = !!embed.color;
  const hasVideo = !!embed.video?.url;

  return (
    <>
      <div
        className="mt-1 flex max-w-[520px] overflow-hidden rounded-sm"
        style={{
          backgroundColor: "#0A0A0A",
          borderLeft: hasColor ? `4px solid ${getEmbedColor(embed.color)}` : "4px solid #00D4FF",
        }}
      >
        <div className="flex flex-1 flex-col p-3">
          {/* Author */}
          {embed.author && (
            <div className="mb-2 flex items-center gap-2">
              {embed.author.icon_url && (
                <img
                  src={embed.author.icon_url}
                  alt=""
                  className="h-5 w-5 rounded-sm grayscale"
                />
              )}
              {embed.author.name && (
                <span className="font-mono text-xs font-medium text-[var(--color-brand)]">
                  {embed.author.name}
                </span>
              )}
            </div>
          )}

          {/* Title */}
          {embed.title && (
            <a
              href={embed.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-1 font-mono text-sm font-semibold text-[var(--color-brand)] hover:underline"
            >
              {embed.title}
            </a>
          )}

          {/* Video */}
          {hasVideo && (
            <button
              className="mt-2 block text-left"
              onClick={() => { setLightboxSrc(embed.video!.url); setLightboxIsVideo(true); }}
            >
              <VideoPlayer
                src={embed.video!.url}
                filename={embed.provider?.name}
                className="max-w-[400px]"
              />
            </button>
          )}

          {/* Description */}
          {embed.description && (
            <div className="font-mono text-xs text-[var(--color-text-secondary)] leading-relaxed space-y-1">
              {renderMarkdown(embed.description)}
            </div>
          )}

          {/* Image */}
          {embed.image && !hasVideo && (
            <EmbedImage
              src={embed.image.proxy_url || embed.image.url}
              alt=""
              width={embed.image.width || 400}
              height={embed.image.height || 200}
              onClick={() => {
                setLightboxSrc(embed.image!.proxy_url || embed.image!.url);
                setLightboxIsVideo(false);
              }}
            />
          )}

          {/* Fields */}
          {embed.fields && embed.fields.length > 0 && (
            <div
              className={`mt-2 grid gap-1 ${
                embed.fields.some((f) => f.inline) ? "grid-cols-2" : ""
              }`}
            >
              {embed.fields.map((field, idx) => (
                <div key={idx} className={field.inline ? "col-span-1" : "col-span-2"}>
                  <p className="font-mono text-xs font-semibold text-[var(--color-brand)]">{field.name}</p>
                  <p className="font-mono text-xs text-[var(--color-text-secondary)] leading-relaxed">{field.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {(embed.footer || embed.timestamp) && (
            <div className="mt-2 flex items-center gap-2 font-mono text-xs text-[var(--color-text-muted)]">
              {embed.footer?.icon_url && (
                <img
                  src={embed.footer.icon_url}
                  alt=""
                  className="h-4 w-4 rounded-sm grayscale"
                />
              )}
              <span>
                {embed.footer?.text}
                {embed.footer?.text && embed.timestamp && " • "}
                {embed.timestamp &&
                  new Date(embed.timestamp).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </span>
            </div>
          )}

          {/* Provider */}
          {embed.provider?.name && (
            <p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">{embed.provider.name}</p>
          )}
        </div>

        {/* Thumbnail */}
        {embed.thumbnail && (
          <div className="flex-shrink-0 p-2">
            <button onClick={() => {
              setLightboxSrc(embed.thumbnail!.proxy_url || embed.thumbnail!.url);
              setLightboxIsVideo(false);
            }}>
              <Image
                src={embed.thumbnail.proxy_url || embed.thumbnail.url}
                alt=""
                width={embed.thumbnail.width || 80}
                height={embed.thumbnail.height || 80}
                className="max-w-[80px] rounded-sm object-cover grayscale hover:grayscale-0 transition-all duration-300"
              />
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          isVideo={lightboxIsVideo}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </>
  );
}
