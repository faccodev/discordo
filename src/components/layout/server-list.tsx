"use client";

import Image from "next/image";
import { useUIStore } from "@/stores/ui-store";
import { cn, getInitials } from "@/lib/utils";
import { Home, Sun, Moon } from "lucide-react";
import Link from "next/link";

export function ServerList() {
  const { guilds, selectedGuildId, setSelectedGuild, setSelectedChannel, theme, toggleTheme } = useUIStore();

  const handleGuildClick = (guildId: string) => {
    setSelectedGuild(guildId);
    setSelectedChannel(null);
  };

  return (
    <div className="flex h-full w-[72px] flex-col items-center border-r border-[var(--color-border)] bg-[var(--color-bg-sidebar)] py-3">
      {/* Home Button */}
      <Link
        href="/"
        className={cn(
          "group flex h-12 w-12 items-center justify-center rounded-lg transition-all",
          "hover:bg-[var(--color-bg-hover)]",
          selectedGuildId === null && "bg-[var(--color-brand)]/10"
        )}
        onClick={() => {
          setSelectedGuild(null);
          setSelectedChannel(null);
        }}
      >
        <Home className="h-6 w-6 text-[var(--color-brand)]" />
      </Link>

      {/* Separator */}
      <div className="my-2 h-[2px] w-8 rounded-full bg-[var(--color-border-mid)]" />

      {/* Guild List */}
      <div className="flex flex-1 flex-col items-center gap-2 overflow-y-auto">
        {guilds.map((guild) => (
          <button
            key={guild.id}
            onClick={() => handleGuildClick(guild.id)}
            className={cn(
              "group relative flex h-12 w-12 items-center justify-center rounded-lg transition-all",
              selectedGuildId === guild.id && "bg-[var(--color-brand)]/10"
            )}
            title={guild.name}
          >
            {guild.icon ? (
              <Image
                src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                alt={guild.name}
                width={48}
                height={48}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-bg-hover)] text-sm font-medium text-[var(--color-brand)]"
              >
                {getInitials(guild.name)}
              </div>
            )}

            {/* Selection indicator */}
            {selectedGuildId === guild.id && (
              <span className="absolute -left-1 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[var(--color-brand)]" />
            )}
          </button>
        ))}
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="mt-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-bg-hover)] transition-all hover:bg-[var(--color-border)]"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5 text-[var(--color-warning)]" />
        ) : (
          <Moon className="h-5 w-5 text-[var(--color-brand)]" />
        )}
      </button>
    </div>
  );
}
