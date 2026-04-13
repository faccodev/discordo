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
    <div className="flex flex-col flex-1 min-h-0 flex-shrink-0" style={{ height: '48px' }}>
      {/* Mobile Top Bar */}
      <div className="flex items-center h-full bg-[var(--color-bg-sidebar)] border-b border-[var(--color-border)] px-2 gap-1">
        {/* Back / Home */}
        {selectedGuildId ? (
          <button
            onClick={() => {
              setSelectedGuild(null);
              setSelectedChannel(null);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors min-w-[44px] min-h-[44px]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors min-w-[44px] min-h-[44px]"
          >
            <Home className="h-4 w-4" />
          </Link>
        )}

        {/* Server name - opens drawer */}
        {selectedGuildId ? (
          <button
            onClick={() => { setDrawerTab('channels'); setShowDrawer(true); }}
            className="flex-1 flex items-center gap-2 ml-1 px-2 py-1 rounded-lg text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors text-left truncate min-h-[44px]"
          >
            {guilds.find((g) => g.id === selectedGuildId)?.icon ? (
              <img
                src={`https://cdn.discordapp.com/icons/${selectedGuildId}/${guilds.find((g) => g.id === selectedGuildId)?.icon}.png`}
                alt=""
                className="w-5 h-5 rounded-lg flex-shrink-0 object-cover"
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
            className="flex-1 flex items-center gap-2 ml-1 px-2 py-1 rounded-lg text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors text-left min-h-[44px]"
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
          <div className="relative flex flex-col w-[280px] h-full bg-[var(--color-bg-sidebar)] border-r border-[var(--color-border)]">
            {/* Drawer Header */}
            <div className="flex items-center justify-between h-12 px-3 border-b border-[var(--color-border)] flex-shrink-0">
              <span className="text-sm font-medium text-[var(--color-text)] truncate">
                {drawerTab === 'channels' ? 'Canais' : 'Servidores'}
              </span>
              <button
                onClick={() => setShowDrawer(false)}
                className="flex items-center justify-center w-11 h-11 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab Switcher */}
            {selectedGuildId && (
              <div className="flex border-b border-[var(--color-border)] flex-shrink-0">
                <button
                  onClick={() => setDrawerTab('channels')}
                  className={cn(
                    'flex-1 px-3 py-3 text-xs font-medium uppercase transition-colors min-h-[44px]',
                    drawerTab === 'channels'
                      ? 'text-[var(--color-brand)] border-b-2 border-[var(--color-brand)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  )}
                >
                  Canais
                </button>
                <button
                  onClick={() => setDrawerTab('guilds')}
                  className={cn(
                    'flex-1 px-3 py-3 text-xs font-medium uppercase transition-colors min-h-[44px]',
                    drawerTab === 'guilds'
                      ? 'text-[var(--color-brand)] border-b-2 border-[var(--color-brand)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
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
        <p className="px-3 py-2 text-xs font-medium uppercase text-[var(--color-text-muted)]">Mensagens Diretas</p>
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
                  'flex w-full items-center gap-2 rounded-lg px-3 py-3 text-sm transition-colors min-h-[44px]',
                  selectedChannelId === dm.id
                    ? 'bg-[var(--color-brand)]/10 text-[var(--color-brand)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]'
                )}
              >
                <div className="w-6 h-6 rounded-full bg-[var(--color-bg-hover)] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-[var(--color-brand)] font-medium">
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
            className="mb-1 flex w-full items-center gap-1 px-3 py-2 text-xs font-medium uppercase text-[var(--color-text-muted)] hover:text-[var(--color-text)] min-h-[44px]"
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
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors min-h-[44px]',
                    selectedChannelId === channel.id
                      ? 'bg-[var(--color-brand)]/10 text-[var(--color-brand)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]'
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
              'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors min-h-[44px]',
              selectedChannelId === channel.id
                ? 'bg-[var(--color-brand)]/10 text-[var(--color-brand)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]'
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
          'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors min-h-[48px]',
          selectedGuildId === null
            ? 'bg-[var(--color-brand)]/10 text-[var(--color-brand)]'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]'
        )}
      >
        <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-hover)] flex items-center justify-center flex-shrink-0">
          <Home className="h-5 w-5 text-[var(--color-brand)]" />
        </div>
        <span>Direct Messages</span>
      </button>

      <p className="px-3 py-2 text-xs font-medium uppercase text-[var(--color-text-muted)]">Servidores</p>
      {guilds.map((guild) => (
        <button
          key={guild.id}
          onClick={() => onSelectGuild(guild.id)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors min-h-[48px]',
            selectedGuildId === guild.id
              ? 'bg-[var(--color-brand)]/10 text-[var(--color-brand)]'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]'
          )}
        >
          {guild.icon ? (
            <img
              src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
              alt={guild.name}
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-hover)] flex items-center justify-center flex-shrink-0 text-[var(--color-brand)] font-medium text-sm">
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
      className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center border-t border-[var(--color-border)] bg-[var(--color-bg-sidebar)] px-2 md:hidden"
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
            selectedGuildId === null && 'bg-[var(--color-brand)]/20'
          )}
        >
          <Home className={cn('h-6 w-6', selectedGuildId === null ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-secondary)]')} />
        </button>

        {/* Separator */}
        <div className="h-8 w-[2px] bg-[var(--color-border-mid)] flex-shrink-0" />

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
              selectedGuildId === guild.id && 'bg-[var(--color-brand)]/20'
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
              <div className="flex w-9 h-9 items-center justify-center rounded-lg bg-[var(--color-bg-hover)] text-[var(--color-brand)] font-medium text-sm">
                {guild.name.charAt(0).toUpperCase()}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
