'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import { Home, Hash, Users, ChevronLeft, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const { guilds, selectedGuildId, selectedChannelId, setSelectedGuild, setSelectedChannel } = useUIStore();
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'channels' | 'guilds'>('channels');
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
      <div className="flex items-center h-12 bg-bg-sidebar border-b border-border-bright px-2 gap-1 flex-shrink-0">
        {/* Back / Home */}
        {selectedGuildId ? (
          <button
            onClick={() => {
              setSelectedGuild(null);
              setSelectedChannel(null);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-sm text-sm font-mono text-text-dim hover:text-primary hover:bg-bg-hover transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">DMs</span>
          </button>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-1 px-2 py-1 rounded-sm text-sm font-mono text-text-dim hover:text-primary hover:bg-bg-hover transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
        )}

        {/* Server name - opens drawer */}
        {selectedGuildId ? (
          <button
            onClick={() => { setDrawerTab('channels'); setShowDrawer(true); }}
            className="flex-1 flex items-center gap-2 ml-1 px-2 py-1 rounded-sm text-sm font-mono font-medium text-primary hover:bg-bg-hover transition-colors text-left truncate"
          >
            {guilds.find((g) => g.id === selectedGuildId)?.icon ? (
              <img
                src={`https://cdn.discordapp.com/icons/${selectedGuildId}/${guilds.find((g) => g.id === selectedGuildId)?.icon}.png`}
                alt=""
                className="w-5 h-5 rounded-sm flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300"
              />
            ) : (
              <Hash className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="truncate">
              {guilds.find((g) => g.id === selectedGuildId)?.name}
            </span>
          </button>
        ) : (
          <button
            onClick={() => { setDrawerTab('guilds'); setShowDrawer(true); }}
            className="flex-1 flex items-center gap-2 ml-1 px-2 py-1 rounded-sm text-sm font-mono font-medium text-primary hover:bg-bg-hover transition-colors text-left"
          >
            <Home className="h-4 w-4" />
            <span>Direct Messages</span>
          </button>
        )}
      </div>

      {/* Drawer Overlay */}
      {showDrawer && (
        <div className="absolute inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDrawer(false)}
          />

          {/* Drawer */}
          <div className="relative flex flex-col w-[280px] h-full glass-sidebar border-r border-border shadow-xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between h-12 px-3 border-b border-border-bright/30 flex-shrink-0">
              <span className="text-sm font-mono font-semibold text-primary truncate">
                {drawerTab === 'channels' ? 'Canais' : 'Servidores'}
              </span>
              <button
                onClick={() => setShowDrawer(false)}
                className="flex items-center justify-center w-8 h-8 rounded-sm text-text-dim hover:text-primary hover:bg-bg-hover transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tab Switcher */}
            {selectedGuildId && (
              <div className="flex border-b border-border-bright/30 flex-shrink-0">
                <button
                  onClick={() => setDrawerTab('channels')}
                  className={cn(
                    'flex-1 px-3 py-2 text-xs font-semibold uppercase transition-colors',
                    drawerTab === 'channels'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-text-dim hover:text-primary'
                  )}
                >
                  Canais
                </button>
                <button
                  onClick={() => setDrawerTab('guilds')}
                  className={cn(
                    'flex-1 px-3 py-2 text-xs font-semibold uppercase transition-colors',
                    drawerTab === 'guilds'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-text-dim hover:text-primary'
                  )}
                >
                  Servidores
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-2">
              {drawerTab === 'channels' ? (
                <MobileChannelSheet
                  selectedGuildId={selectedGuildId}
                  selectedChannelId={selectedChannelId}
                  onSelectChannel={(id) => {
                    setSelectedChannel(id);
                    setShowDrawer(false);
                  }}
                />
              ) : (
                <MobileGuildSheet
                  guilds={guilds}
                  selectedGuildId={selectedGuildId}
                  onSelectGuild={(id) => {
                    setSelectedGuild(id);
                    setSelectedChannel(null);
                    setDrawerTab('channels');
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileChannelSheet({
  selectedGuildId,
  selectedChannelId,
  onSelectChannel,
}: {
  selectedGuildId: string | null;
  selectedChannelId: string | null;
  onSelectChannel: (id: string) => void;
}) {
  const { channels, dms } = useUIStore();
  const currentChannels = selectedGuildId ? channels[selectedGuildId] || [] : [];

  if (!selectedGuildId) {
    // Show DMs
    return (
      <div>
        <p className="px-2 py-1 text-xs font-semibold uppercase text-text-dim">Mensagens Diretas</p>
        {dms
          .slice()
          .sort((a, b) => {
            const aId = BigInt(a.last_message_id || "0");
            const bId = BigInt(b.last_message_id || "0");
            return bId > aId ? 1 : bId < aId ? -1 : 0;
          })
          .map((dm) => {
            const recipient = dm.recipients?.[0];
            const name = dm.name || recipient?.username || "Unknown";
            return (
              <button
                key={dm.id}
                onClick={() => onSelectChannel(dm.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm font-mono transition-colors',
                  selectedChannelId === dm.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-dim hover:bg-bg-hover hover:text-primary'
                )}
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-primary font-bold">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="truncate">{name}</span>
              </button>
            );
          })}
      </div>
    );
  }

  return (
    <div>
      <p className="px-2 py-1 text-xs font-semibold uppercase text-text-dim">Canais de Texto</p>
      {currentChannels
        .filter((c) => c.type !== 4)
        .map((channel) => (
          <button
            key={channel.id}
            onClick={() => onSelectChannel(channel.id)}
            className={cn(
              'flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm font-mono transition-colors',
              selectedChannelId === channel.id
                ? 'bg-primary/10 text-primary'
                : 'text-text-dim hover:bg-bg-hover hover:text-primary'
            )}
          >
            <Hash className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{channel.name}</span>
          </button>
        ))}
    </div>
  );
}

function MobileGuildSheet({
  guilds,
  selectedGuildId,
  onSelectGuild,
}: {
  guilds: { id: string; name: string; icon: string | null }[];
  selectedGuildId: string | null;
  onSelectGuild: (id: string) => void;
}) {
  const { setSelectedGuild, setSelectedChannel } = useUIStore();

  return (
    <div>
      <button
        onClick={() => {
          setSelectedGuild(null);
          setSelectedChannel(null);
          onSelectGuild('');
        }}
        className={cn(
          'flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm font-mono transition-colors mb-2',
          selectedGuildId === null
            ? 'bg-primary/10 text-primary'
            : 'text-text-dim hover:bg-bg-hover hover:text-primary'
        )}
      >
        <div className="w-8 h-8 rounded-sm bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Home className="h-4 w-4 text-primary" />
        </div>
        <span>Direct Messages</span>
      </button>

      <p className="px-2 py-1 text-xs font-semibold uppercase text-text-dim">Servidores</p>
      {guilds.map((guild) => (
        <button
          key={guild.id}
          onClick={() => onSelectGuild(guild.id)}
          className={cn(
            'flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm font-mono transition-colors',
            selectedGuildId === guild.id
              ? 'bg-primary/10 text-primary'
              : 'text-text-dim hover:bg-bg-hover hover:text-primary'
          )}
        >
          {guild.icon ? (
            <img
              src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
              alt={guild.name}
              className="w-8 h-8 rounded-sm object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-sm bg-bg-hover flex items-center justify-center flex-shrink-0 text-primary font-bold text-xs">
              {guild.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="truncate">{guild.name}</span>
        </button>
      ))}
    </div>
  );
}

// Mobile bottom bar for guild switching
export function MobileBottomBar() {
  const { guilds, selectedGuildId, setSelectedGuild, setSelectedChannel } = useUIStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex h-14 items-center border-t border-border-bright bg-bg-sidebar px-2 md:hidden">
      {/* Horizontal scrollable guild list */}
      <div className="flex gap-1 overflow-x-auto items-center flex-1 h-full py-2 scrollbar-hide">
        {/* Home / DMs button */}
        <button
          onClick={() => {
            setSelectedGuild(null);
            setSelectedChannel(null);
          }}
          className={cn(
            'flex items-center justify-center h-10 w-10 rounded-sm flex-shrink-0 transition-all',
            selectedGuildId === null && 'rounded-lg bg-primary shadow-[0_0_8px_#00FF41]'
          )}
        >
          <Home className={cn('h-5 w-5', selectedGuildId === null ? 'text-black' : 'text-primary')} />
        </button>

        {/* Separator */}
        <div className="h-8 w-[2px] bg-border-bright flex-shrink-0 mx-1" />

        {/* Guild buttons */}
        {guilds.map((guild) => (
          <button
            key={guild.id}
            onClick={() => {
              setSelectedGuild(guild.id);
              setSelectedChannel(null);
            }}
            className={cn(
              'flex items-center justify-center h-10 w-10 rounded-sm flex-shrink-0 transition-all',
              selectedGuildId === guild.id && 'rounded-lg bg-primary/20 shadow-[0_0_8px_#00FF41]'
            )}
            title={guild.name}
          >
            {guild.icon ? (
              <Image
                src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                alt={guild.name}
                width={32}
                height={32}
                className="h-8 w-8 rounded-sm object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-bg-hover text-primary font-bold text-sm">
                {guild.name.charAt(0).toUpperCase()}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
