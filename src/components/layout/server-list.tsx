"use client";

import Image from "next/image";
import { useUIStore } from "@/stores/ui-store";
import { cn, getInitials, getAvatarColor } from "@/lib/utils";
import { Home, Settings, Sun, Moon } from "lucide-react";
import Link from "next/link";

export function ServerList() {
  const { guilds, selectedGuildId, setSelectedGuild, setSelectedChannel, theme, toggleTheme } = useUIStore();

  const handleGuildClick = (guildId: string) => {
    setSelectedGuild(guildId);
    setSelectedChannel(null);
  };

  return (
    <div className="flex h-full w-[72px] flex-col items-center border-l-2 border-primary bg-bg-sidebar py-3">
      {/* Home Button */}
      <Link
        href="/"
        className={cn(
          "group flex h-12 w-12 items-center justify-center rounded-sm transition-all",
          "hover:rounded-lg hover:shadow-[0_0_8px_#00FF41]",
          selectedGuildId === null && "rounded-sm bg-primary/20 shadow-[0_0_8px_#00FF41]"
        )}
        onClick={() => {
          setSelectedGuild(null);
          setSelectedChannel(null);
        }}
      >
        <Home className="h-6 w-6 text-primary" />
      </Link>

      {/* Separator */}
      <div className="my-2 h-[2px] w-8 rounded-full bg-border-bright" />

      {/* Guild List */}
      <div className="flex flex-1 flex-col items-center gap-2 overflow-y-auto">
        {guilds.map((guild) => (
          <button
            key={guild.id}
            onClick={() => handleGuildClick(guild.id)}
            className={cn(
              "group relative flex h-12 w-12 items-center justify-center rounded-sm transition-all",
              "hover:rounded-lg",
              selectedGuildId === guild.id && "rounded-sm bg-primary/20 shadow-[0_0_8px_#00FF41]"
            )}
            title={guild.name}
          >
            {guild.icon ? (
              <Image
                src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                alt={guild.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-sm object-cover grayscale brightness-75 contrast-100 transition-all duration-300 group-hover:grayscale-0 group-hover:brightness-100"
              />
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-sm text-sm font-bold font-mono text-primary"
                style={{ backgroundColor: "#1A1A1A", border: "1px solid #1F3D1F" }}
              >
                {getInitials(guild.name)}
              </div>
            )}

            {/* Online indicator dot */}
            {selectedGuildId === guild.id && (
              <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="mt-auto flex h-10 w-10 items-center justify-center rounded-sm bg-bg-hover transition-all hover:rounded-lg hover:shadow-[0_0_8px_#00FF41]"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5 text-warning" />
        ) : (
          <Moon className="h-5 w-5 text-primary" />
        )}
      </button>
    </div>
  );
}
