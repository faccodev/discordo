"use client";

import Image from "next/image";
import { useUIStore } from "@/stores/ui-store";
import { cn, getInitials, getAvatarColor } from "@/lib/utils";
import { Home, Settings } from "lucide-react";
import Link from "next/link";

export function ServerList() {
  const { guilds, selectedGuildId, setSelectedGuild, setSelectedChannel } = useUIStore();

  const handleGuildClick = (guildId: string) => {
    setSelectedGuild(guildId);
    setSelectedChannel(null);
  };

  return (
    <div className="flex h-full w-[72px] flex-col items-center bg-dark-bl py-3">
      {/* Home Button */}
      <Link
        href="/"
        className={cn(
          "group flex h-12 w-12 items-center justify-center rounded-xl transition-all",
          "hover:rounded-2xl hover:bg-blurple",
          selectedGuildId === null && "rounded-2xl bg-blurple"
        )}
        onClick={() => {
          setSelectedGuild(null);
          setSelectedChannel(null);
        }}
      >
        <Home className="h-6 w-6 text-white" />
      </Link>

      {/* Separator */}
      <div className="my-2 h-[2px] w-8 rounded-full bg-dark-hover" />

      {/* Guild List */}
      <div className="flex flex-1 flex-col items-center gap-2 overflow-y-auto">
        {guilds.map((guild) => (
          <button
            key={guild.id}
            onClick={() => handleGuildClick(guild.id)}
            className={cn(
              "group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all",
              "hover:rounded-2xl",
              selectedGuildId === guild.id && "rounded-2xl bg-blurple"
            )}
            title={guild.name}
          >
            {guild.icon ? (
              <Image
                src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                alt={guild.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: getAvatarColor(guild.id) }}
              >
                {getInitials(guild.name)}
              </div>
            )}

            {/* Online indicator dot */}
            {selectedGuildId === guild.id && (
              <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white" />
            )}
          </button>
        ))}
      </div>

      {/* Settings Button */}
      <button
        className="mt-auto flex h-10 w-10 items-center justify-center rounded-xl bg-dark-hover transition-all hover:rounded-2xl hover:bg-blurple"
        title="Configurações"
      >
        <Settings className="h-5 w-5 text-green-500" />
      </button>
    </div>
  );
}
