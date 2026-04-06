"use client";

import Image from "next/image";
import { type Embed } from "@/lib/discord/types";
import { ExternalLink } from "lucide-react";

interface EmbedCardProps {
  embed: Embed;
}

function getEmbedColor(color?: number): string {
  if (!color) return "#5865F2";
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  return `rgb(${r}, ${g}, ${b})`;
}

export function EmbedCard({ embed }: EmbedCardProps) {
  const hasColor = !!embed.color;

  return (
    <div
      className="mt-1 flex max-w-[520px] overflow-hidden rounded"
      style={{
        backgroundColor: "#2B2D31",
        borderLeft: hasColor ? `4px solid ${getEmbedColor(embed.color)}` : undefined,
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
                className="rounded-full"
              />
            )}
            {embed.author.name && (
              <span className="text-xs font-medium text-white">
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
            className="mb-1 text-sm font-semibold text-blurple hover:underline"
          >
            {embed.title}
          </a>
        )}

        {/* Description */}
        {embed.description && (
          <div
            className="text-sm text-white"
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
                <p className="text-xs font-semibold text-white">{field.name}</p>
                <p className="text-sm text-neutral-400">{field.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {(embed.footer || embed.timestamp) && (
          <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
            {embed.footer?.icon_url && (
              <Image
                src={embed.footer.icon_url}
                alt=""
                width={16}
                height={16}
                className="rounded-full"
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
          <p className="mt-1 text-xs text-neutral-500">{embed.provider.name}</p>
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
              className="max-w-[80px] rounded object-cover"
            />
          </a>
        </div>
      )}
    </div>
  );
}
