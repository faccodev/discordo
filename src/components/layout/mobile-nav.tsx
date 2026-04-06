'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import { Home, Hash, Users, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const { guilds, selectedGuildId, selectedChannelId, setSelectedGuild, setSelectedChannel } = useUIStore();
  const [showChannels, setShowChannels] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!isMobile) return null;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Mobile Top Bar */}
      <div className="flex items-center h-12 bg-dark-bl border-b border-dark px-2 gap-1 flex-shrink-0">
        {/* Back / Home */}
        {selectedGuildId ? (
          <button
            onClick={() => {
              setSelectedGuild(null);
              setSelectedChannel(null);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded text-sm text-neutral-400 hover:text-white hover:bg-dark-hover transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">DMs</span>
          </button>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-1 px-2 py-1 rounded text-sm text-neutral-400 hover:text-white hover:bg-dark-hover transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
        )}

        {/* Server name */}
        {selectedGuildId && (
          <button
            onClick={() => setShowChannels(true)}
            className="flex-1 flex items-center gap-2 ml-1 px-2 py-1 rounded text-sm text-white font-medium hover:bg-dark-hover transition-colors text-left truncate"
          >
            {guilds.find((g) => g.id === selectedGuildId)?.icon ? (
              <img
                src={`https://cdn.discordapp.com/icons/${selectedGuildId}/${guilds.find((g) => g.id === selectedGuildId)?.icon}.png`}
                alt=""
                className="w-5 h-5 rounded-full flex-shrink-0"
              />
            ) : (
              <Hash className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="truncate">
              {guilds.find((g) => g.id === selectedGuildId)?.name}
            </span>
          </button>
        )}

        {!selectedGuildId && (
          <span className="flex-1 text-sm font-semibold text-white px-2">
            Direct Messages
          </span>
        )}
      </div>

      {/* Channel / DM list */}
      {showChannels && (
        <div className="absolute inset-0 z-40 bg-dark flex flex-col">
          <div className="flex items-center h-12 bg-dark-bl border-b border-dark px-2">
            <button
              onClick={() => setShowChannels(false)}
              className="flex items-center gap-1 px-2 py-1 rounded text-sm text-neutral-400 hover:text-white hover:bg-dark-hover transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </button>
            <span className="ml-2 text-sm font-semibold text-white truncate">
              #{useUIStore.getState().selectedChannelId
                ? 'Chat'
                : 'Selecionar canal'}
            </span>
          </div>
          {/* MobileChannelSheet will be rendered here */}
          <MobileChannelSheet onSelect={() => setShowChannels(false)} />
        </div>
      )}
    </div>
  );
}

function MobileChannelSheet({ onSelect }: { onSelect: () => void }) {
  const { selectedGuildId, channels, selectedChannelId, setSelectedChannel } = useUIStore();
  const currentChannels = selectedGuildId ? channels[selectedGuildId] || [] : [];

  return (
    <div className="flex-1 overflow-y-auto p-2">
      <p className="px-2 py-1 text-xs font-semibold uppercase text-neutral-500">Canais</p>
      {currentChannels
        .filter((c) => c.type !== 4)
        .map((channel) => (
          <button
            key={channel.id}
            onClick={() => {
              setSelectedChannel(channel.id);
              onSelect();
            }}
            className={cn(
              'flex w-full items-center gap-2 rounded px-2 py-2 text-sm transition-colors',
              selectedChannelId === channel.id
                ? 'bg-dark-active text-white'
                : 'text-neutral-400 hover:bg-dark-hover hover:text-white'
            )}
          >
            <Hash className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{channel.name}</span>
          </button>
        ))}
    </div>
  );
}

// Mobile bottom bar for guild switching
export function MobileBottomBar() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex h-14 items-center justify-around border-t border-dark-bl bg-dark-bl px-4 md:hidden">
      {/* Quick server icons */}
      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-blurple">
        <Home className="h-5 w-5 text-white" />
      </button>
    </div>
  );
}
