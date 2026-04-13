'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import { Home, Hash, Volume2, ChevronLeft, ChevronDown, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ChannelType } from '@/lib/discord/types';
import type { DiscordChannel } from '@/lib/discord/types';

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const router = useRouter();
  const { guilds, selectedGuildId, selectedChannelId, setSelectedGuild, setSelectedChannel, setChannels } = useUIStore();
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'channels' | 'guilds'>('channels');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Fetch channels when guild is selected (same logic as ChannelSidebar)
  const { data: guildChannels } = useQuery({
    queryKey: ["discord-guilds", selectedGuildId, "channels"],
    queryFn: async () => {
      const res = await fetch(`/api/discord/guilds/${selectedGuildId}/channels`);
      if (!res.ok) throw new Error("Failed to fetch channels");
      return res.json() as Promise<DiscordChannel[]>;
    },
    enabled: !!selectedGuildId,
  });

  useEffect(() => {
    if (guildChannels && selectedGuildId) {
      setChannels(selectedGuildId, guildChannels);
    }
  }, [guildChannels, selectedGuildId, setChannels]);

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
            className="flex items-center gap-1 px-2 py-1 rounded-sm text-sm font-mono text-text-dim hover:text-primary hover:bg-bg-hover transition-colors min-w-[44px] min-h-[44px]"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">DMs</span>
          </button>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-1 px-2 py-1 rounded-sm text-sm font-mono text-text-dim hover:text-primary hover:bg-bg-hover transition-colors min-w-[44px] min-h-[44px]"
          >
            <Home className="h-4 w-4" />
          </Link>
        )}

        {/* Server name - opens drawer */}
        {selectedGuildId ? (
          <button
            onClick={() => { setDrawerTab('channels'); setShowDrawer(true); }}
            className="flex-1 flex items-center gap-2 ml-1 px-2 py-1 rounded-sm text-sm font-mono font-medium text-primary hover:bg-bg-hover transition-colors text-left truncate min-h-[44px]"
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
            className="flex-1 flex items-center gap-2 ml-1 px-2 py-1 rounded-sm text-sm font-mono font-medium text-primary hover:bg-bg-hover transition-colors text-left min-h-[44px]"
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
                className="flex items-center justify-center w-11 h-11 rounded-lg text-text-dim hover:text-primary hover:bg-bg-hover transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab Switcher */}
            {selectedGuildId && (
              <div className="flex border-b border-border-bright/30 flex-shrink-0">
                <button
                  onClick={() => setDrawerTab('channels')}
                  className={cn(
                    'flex-1 px-3 py-3 text-xs font-semibold uppercase transition-colors min-h-[44px]',
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
                    'flex-1 px-3 py-3 text-xs font-semibold uppercase transition-colors min-h-[44px]',
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
                    router.push(`/channels/${id}`);
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
  const { channels, dms, isGuildExpanded, toggleGuildExpanded } = useUIStore();
  const currentChannels = selectedGuildId ? channels[selectedGuildId] || [] : [];

  // Group channels by category (same logic as desktop channel-sidebar)
  const categories = currentChannels.filter((c) => c.type === ChannelType.GUILD_CATEGORY);
  const uncategorizedChannels = currentChannels.filter(
    (c) => !c.parent_id && c.type !== ChannelType.GUILD_CATEGORY
  );
  const getChannelsForCategory = (parentId: string) =>
    currentChannels.filter((c) => c.parent_id === parentId);

  const getChannelIcon = (type: number) => {
    if (type === ChannelType.GUILD_VOICE || type === ChannelType.GUILD_STAGE_VOICE) {
      return <Volume2 className="h-4 w-4 flex-shrink-0" />;
    }
    return <Hash className="h-4 w-4 flex-shrink-0" />;
  };

  if (!selectedGuildId) {
    // Show DMs
    return (
      <div>
        <p className="px-3 py-2 text-xs font-semibold uppercase text-text-dim">Mensagens Diretas</p>
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
                  'flex w-full items-center gap-2 rounded-lg px-3 py-3 text-sm font-mono transition-colors min-h-[44px]',
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
    <div className="space-y-1">
      {/* Categories with collapsible channels */}
      {categories.map((category) => (
        <div key={category.id} className="mt-3 first:mt-0">
          {/* Category Header */}
          <button
            onClick={() => toggleGuildExpanded(category.id)}
            className="mb-1 flex w-full items-center gap-1 px-3 py-2 text-xs font-semibold uppercase text-text-dim hover:text-primary min-h-[44px]"
          >
            {isGuildExpanded(category.id) ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            {category.name}
          </button>

          {/* Category Channels */}
          {isGuildExpanded(category.id) && (
            <div className="space-y-0.5">
              {getChannelsForCategory(category.id).map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onSelectChannel(channel.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-mono transition-colors min-h-[44px]',
                    selectedChannelId === channel.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-dim hover:bg-bg-hover hover:text-primary'
                  )}
                >
                  {getChannelIcon(channel.type)}
                  <span className="truncate">{channel.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Uncategorized Channels */}
      <div className="space-y-0.5">
        {uncategorizedChannels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onSelectChannel(channel.id)}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-mono transition-colors min-h-[44px]',
              selectedChannelId === channel.id
                ? 'bg-primary/10 text-primary'
                : 'text-text-dim hover:bg-bg-hover hover:text-primary'
            )}
          >
            {getChannelIcon(channel.type)}
            <span className="truncate">{channel.name}</span>
          </button>
        ))}
      </div>
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
    <div className="space-y-1">
      <button
        onClick={() => {
          setSelectedGuild(null);
          setSelectedChannel(null);
          onSelectGuild('');
        }}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-mono transition-colors min-h-[48px]',
          selectedGuildId === null
            ? 'bg-primary/10 text-primary'
            : 'text-text-dim hover:bg-bg-hover hover:text-primary'
        )}
      >
        <div className="w-10 h-10 rounded-sm bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Home className="h-5 w-5 text-primary" />
        </div>
        <span>Direct Messages</span>
      </button>

      <p className="px-3 py-2 text-xs font-semibold uppercase text-text-dim">Servidores</p>
      {guilds.map((guild) => (
        <button
          key={guild.id}
          onClick={() => onSelectGuild(guild.id)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-mono transition-colors min-h-[48px]',
            selectedGuildId === guild.id
              ? 'bg-primary/10 text-primary'
              : 'text-text-dim hover:bg-bg-hover hover:text-primary'
          )}
        >
          {guild.icon ? (
            <img
              src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
              alt={guild.name}
              className="w-10 h-10 rounded-sm object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-sm bg-bg-hover flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
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
    <div
      className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center border-t border-border-bright bg-bg-sidebar px-2 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Horizontal scrollable guild list */}
      <div className="flex gap-2 items-center flex-1 h-full overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Home / DMs button */}
        <button
          onClick={() => {
            setSelectedGuild(null);
            setSelectedChannel(null);
          }}
          className={cn(
            'flex items-center justify-center rounded-lg flex-shrink-0 transition-all min-w-[44px] min-h-[44px] p-1',
            selectedGuildId === null && 'bg-primary shadow-[0_0_8px_#00D4FF]'
          )}
        >
          <Home className={cn('h-6 w-6', selectedGuildId === null ? 'text-black' : 'text-primary')} />
        </button>

        {/* Separator */}
        <div className="h-8 w-[2px] bg-border-bright flex-shrink-0" />

        {/* Guild buttons */}
        {guilds.map((guild) => (
          <button
            key={guild.id}
            onClick={() => {
              setSelectedGuild(guild.id);
              setSelectedChannel(null);
            }}
            className={cn(
              'flex items-center justify-center rounded-lg flex-shrink-0 transition-all min-w-[44px] min-h-[44px] p-1',
              selectedGuildId === guild.id && 'bg-primary/20 shadow-[0_0_8px_#00D4FF]'
            )}
            title={guild.name}
          >
            {guild.icon ? (
              <Image
                src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                alt={guild.name}
                width={36}
                height={36}
                className="w-9 h-9 rounded-lg object-cover"
              />
            ) : (
              <div className="flex w-9 h-9 items-center justify-center rounded-lg bg-bg-hover text-primary font-bold text-sm">
                {guild.name.charAt(0).toUpperCase()}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
