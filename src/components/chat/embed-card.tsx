"use client";

import Image from "next/image";
import { type Embed } from "@/lib/discord/types";
import { ExternalLink } from "lucide-react";

interface EmbedCardProps {
  embed: Embed;
}

function getEmbedColor(color?: number): string {
  if (!color) return "#00FF41";
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  return `rgb(${r}, ${g}, ${b})`;
}

export function EmbedCard({ embed }: EmbedCardProps) {
  const hasColor = !!embed.color;

  return (
    <div
      className="mt-1 flex max-w-[520px] overflow-hidden rounded-sm"
      style={{
        backgroundColor: "#0A0A0A",
        borderLeft: hasColor ? `4px solid ${getEmbedColor(embed.color)}` : "4px solid #00FF41",
      }}
    >
      <div className="flex flex-1 flex-col p-3">
        {/* Author */}
        {embed.author && (
          <div className="mb-2 flex items-center gap-2">
            {embed.author.icon_url && (
              <Image
                src={embed.author.icon_url}
                alt=""
                width={20}
                height={20}
                className="rounded-sm"
              />
            )}
            {embed.author.name && (
              <span className="font-mono text-xs font-medium text-primary">
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
            className="mb-1 font-mono text-sm font-semibold text-cyan hover:underline"
          >
            {embed.title}
          </a>
        )}

        {/* Description */}
        {embed.description && (
          <div
            className="font-mono text-sm text-primary/80"
            dangerouslySetInnerHTML={{ __html: embed.description }}
          />
        )}

        {/* Image (not thumbnail) */}
        {embed.image && (
          <a
            href={embed.image.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block"
          >
            <Image
              src={embed.image.url}
              alt=""
              width={embed.image.width || 400}
              height={embed.image.height || 200}
              className="max-w-full rounded object-cover"
              style={{
                maxHeight: embed.image.height || 200,
              }}
            />
          </a>
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
                <p className="font-mono text-xs font-semibold text-primary">{field.name}</p>
                <p className="font-mono text-sm text-text-dim">{field.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {(embed.footer || embed.timestamp) && (
          <div className="mt-2 flex items-center gap-2 font-mono text-xs text-text-dim">
            {embed.footer?.icon_url && (
              <Image
                src={embed.footer.icon_url}
                alt=""
                width={16}
                height={16}
                className="rounded-sm"
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
          <p className="mt-1 font-mono text-xs text-text-dim">{embed.provider.name}</p>
        )}
      </div>

      {/* Thumbnail */}
      {embed.thumbnail && (
        <div className="flex-shrink-0 p-2">
          <a href={embed.thumbnail.url} target="_blank" rel="noopener noreferrer">
            <Image
              src={embed.thumbnail.url}
              alt=""
              width={embed.thumbnail.width || 80}
              height={embed.thumbnail.height || 80}
              className="max-w-[80px] rounded-sm object-cover"
            />
          </a>
        </div>
      )}
    </div>
  );
}
