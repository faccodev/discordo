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
    <div className="flex-none h-14 bg-[var(--color-bg-sidebar)] border-b border-[var(--color-border)]">
      {/* Mobile Top Bar */}
      <div className="flex items-center h-full px-2 gap-1">
        {/* Back / Home */}
        {selectedGuildId ? (
          <button
            onClick={() => {
              setSelectedGuild(null);
              setSelectedChannel(null);
            }}
            className="flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors min-w-[44px] min-h-[44px]"
            aria-label="Voltar para DMs"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <Link
            href="/"
            className="flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors min-w-[44px] min-h-[44px]"
            aria-label="Página inicial"
          >
            <Home className="h-5 w-5" />
          </Link>
        )}

        {/* Server/Channel name - opens drawer */}
        {selectedGuildId ? (
          <button
            onClick={() => { setDrawerTab('channels'); setShowDrawer(true); }}
            className="flex-1 flex items-center gap-2 ml-1 px-3 py-1 rounded-lg text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors text-left truncate min-h-[44px]"
            aria-label="Abrir lista de servidores e canais"
          >
            {guilds.find((g) => g.id === selectedGuildId)?.icon ? (
              <img
                src={`https://cdn.discordapp.com/icons/${selectedGuildId}/${guilds.find((g) => g.id === selectedGuildId)?.icon}.png`}
                alt=""
                className="w-6 h-6 rounded-lg flex-shrink-0 object-cover"
              />
            ) : (
              <Hash className="h-5 w-5 flex-shrink-0 text-[var(--color-brand)]" />
            )}
            <span className="truncate flex-1">
              {guilds.find((g) => g.id === selectedGuildId)?.name}
            </span>
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-[var(--color-text-muted)]" />
          </button>
        ) : (
          <button
            onClick={() => { setDrawerTab('guilds'); setShowDrawer(true); }}
            className="flex-1 flex items-center gap-2 ml-1 px-3 py-1 rounded-lg text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors text-left min-h-[44px]"
            aria-label="Abrir lista de servidores"
          >
            <Home className="h-5 w-5 flex-shrink-0 text-[var(--color-brand)]" />
            <span className="flex-1">Direct Messages</span>
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-[var(--color-text-muted)]" />
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

          {/* Drawer - full width on mobile */}
          <div className="relative flex flex-col w-[85vw] max-w-[320px] h-full bg-[var(--color-bg-sidebar)] border-r border-[var(--color-border)] shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--color-border)] flex-shrink-0">
              <div className="flex items-center gap-2">
                {selectedGuildId ? (
                  guilds.find((g) => g.id === selectedGuildId)?.icon ? (
                    <img
                      src={`https://cdn.discordapp.com/icons/${selectedGuildId}/${guilds.find((g) => g.id === selectedGuildId)?.icon}.png`}
                      alt=""
                      className="w-6 h-6 rounded-lg object-cover"
                    />
                  ) : (
                    <Hash className="h-5 w-5 text-[var(--color-brand)]" />
                  )
                ) : (
                  <Home className="h-5 w-5 text-[var(--color-brand)]" />
                )}
                <span className="text-base font-semibold text-[var(--color-text)] truncate">
                  {selectedGuildId
                    ? guilds.find((g) => g.id === selectedGuildId)?.name
                    : 'Direct Messages'}
                </span>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors min-w-[44px] min-h-[44px]"
                aria-label="Fechar menu"
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
                    'flex-1 px-3 py-3 text-sm font-semibold uppercase tracking-wide transition-colors min-h-[48px]',
                    drawerTab === 'channels'
                      ? 'text-[var(--color-brand)] border-b-2 border-[var(--color-brand)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]'
                  )}
                >
                  Canais
                </button>
                <button
                  onClick={() => setDrawerTab('guilds')}
                  className={cn(
                    'flex-1 px-3 py-3 text-sm font-semibold uppercase tracking-wide transition-colors min-h-[48px]',
                    drawerTab === 'guilds'
                      ? 'text-[var(--color-brand)] border-b-2 border-[var(--color-brand)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]'
                  )}
                >
                  Servidores
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 overscroll-behavior-contain">
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
      <div className="space-y-1">
        <p className="px-1 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Mensagens Diretas</p>
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
                  'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all min-h-[48px]',
                  selectedChannelId === dm.id
                    ? 'bg-[var(--color-brand)]/15 text-[var(--color-brand)] font-medium shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]'
                )}
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-bg-hover)] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm text-[var(--color-brand)] font-semibold">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="truncate flex-1">{name}</span>
                {selectedChannelId === dm.id && (
                  <span className="w-2 h-2 rounded-full bg-[var(--color-brand)]" />
                )}
              </button>
            );
          })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Uncategorized Channels - Show first if no categories */}
      {uncategorizedChannels.length > 0 && categories.length === 0 && (
        <div className="space-y-1">
          {uncategorizedChannels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onSelectChannel(channel.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all min-h-[48px]',
                selectedChannelId === channel.id
                  ? 'bg-[var(--color-brand)]/15 text-[var(--color-brand)] font-medium shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]'
              )}
            >
              <span className={cn(selectedChannelId === channel.id ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-muted)]')}>
                {getChannelIcon(channel.type)}
              </span>
              <span className="truncate">{channel.name}</span>
              {selectedChannelId === channel.id && (
                <span className="ml-auto w-2 h-2 rounded-full bg-[var(--color-brand)]" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Categories with collapsible channels */}
      {categories.map((category) => (
        <div key={category.id} className="mt-1">
          {/* Category Header */}
          <button
            onClick={() => toggleGuildExpanded(category.id)}
            className="mb-1 flex w-full items-center gap-2 px-1 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] hover:text-[var(--color-brand)] min-h-[40px] transition-colors"
          >
            {isGuildExpanded(category.id) ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            <span className="truncate">{category.name}</span>
          </button>

          {/* Category Channels */}
          {isGuildExpanded(category.id) && (
            <div className="space-y-0.5 ml-1">
              {getChannelsForCategory(category.id).map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onSelectChannel(channel.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all min-h-[48px]',
                    selectedChannelId === channel.id
                      ? 'bg-[var(--color-brand)]/15 text-[var(--color-brand)] font-medium shadow-sm'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]'
                  )}
                >
                  <span className={cn(selectedChannelId === channel.id ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-muted)]')}>
                    {getChannelIcon(channel.type)}
                  </span>
                  <span className="truncate">{channel.name}</span>
                  {selectedChannelId === channel.id && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-[var(--color-brand)]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Uncategorized Channels - Show below categories */}
      {uncategorizedChannels.length > 0 && categories.length > 0 && (
        <div className="space-y-0.5 mt-2">
          <p className="px-1 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Outros</p>
          {uncategorizedChannels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onSelectChannel(channel.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all min-h-[48px]',
                selectedChannelId === channel.id
                  ? 'bg-[var(--color-brand)]/15 text-[var(--color-brand)] font-medium shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]'
              )}
            >
              <span className={cn(selectedChannelId === channel.id ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-muted)]')}>
                {getChannelIcon(channel.type)}
              </span>
              <span className="truncate">{channel.name}</span>
              {selectedChannelId === channel.id && (
                <span className="ml-auto w-2 h-2 rounded-full bg-[var(--color-brand)]" />
              )}
            </button>
          ))}
        </div>
      )}
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
    <div className="space-y-2">
      {/* DMs Section */}
      <div>
        <p className="px-1 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Direct Messages</p>
        <button
          onClick={() => {
            setSelectedGuild(null);
            setSelectedChannel(null);
            onSelectGuild('');
          }}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all min-h-[48px] w-full',
            selectedGuildId === null
              ? 'bg-[var(--color-brand)]/15 text-[var(--color-brand)] font-medium shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]'
          )}
        >
          <div className="w-10 h-10 rounded-full bg-[var(--color-bg-hover)] flex items-center justify-center flex-shrink-0">
            <Home className="h-5 w-5 text-[var(--color-brand)]" />
          </div>
          <span className="flex-1 text-left">Direct Messages</span>
          {selectedGuildId === null && (
            <span className="w-2 h-2 rounded-full bg-[var(--color-brand)]" />
          )}
        </button>
      </div>

      {/* Servers Section */}
      <div>
        <p className="px-1 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Servidores</p>
        <div className="space-y-1">
          {guilds.map((guild) => (
            <button
              key={guild.id}
              onClick={() => onSelectGuild(guild.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all min-h-[48px]',
                selectedGuildId === guild.id
                  ? 'bg-[var(--color-brand)]/15 text-[var(--color-brand)] font-medium shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]'
              )}
            >
              {guild.icon ? (
                <img
                  src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                  alt={guild.name}
                  className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-hover)] flex items-center justify-center flex-shrink-0 text-[var(--color-brand)] font-bold text-sm">
                  {guild.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="truncate flex-1 text-left">{guild.name}</span>
              {selectedGuildId === guild.id && (
                <span className="w-2 h-2 rounded-full bg-[var(--color-brand)]" />
              )}
            </button>
          ))}
        </div>
      </div>
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
