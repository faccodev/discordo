"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { CreateGroupModal } from "@/components/chat/create-group-modal";
import {
  Hash,
  Volume2,
  ChevronDown,
  ChevronRight,
  Plus,
  Sun,
  Moon,
} from "lucide-react";
import { ChannelType } from "@/lib/discord/types";
import type { DiscordChannel } from "@/lib/discord/types";

function getChannelIcon(channel: DiscordChannel) {
  switch (channel.type) {
    case ChannelType.GUILD_VOICE:
    case ChannelType.GUILD_STAGE_VOICE:
      return <Volume2 className="h-4 w-4" />;
    case ChannelType.GUILD_CATEGORY:
      return null;
    case ChannelType.GUILD_TEXT:
    default:
      return <Hash className="h-4 w-4" />;
  }
}

export function ChannelSidebar() {
  const router = useRouter();
  const {
    selectedGuildId,
    selectedChannelId,
    setSelectedChannel,
    guilds,
    dms,
    channels,
    setChannels,
    toggleGuildExpanded,
    isGuildExpanded,
    sidebarCollapsed,
    currentUser,
    theme,
    toggleTheme,
    isUnread,
  } = useUIStore();

  const navigateToChannel = (channelId: string) => {
    setSelectedChannel(channelId);
    router.push(`/channels/${channelId}`);
  };

  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const selectedGuild = guilds.find((g) => g.id === selectedGuildId);

  // Fetch channels when guild is selected
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

  const currentChannels = selectedGuildId ? channels[selectedGuildId] || [] : [];

  // Group channels by category
  const categories = currentChannels.filter(
    (c) => c.type === ChannelType.GUILD_CATEGORY
  );
  const uncategorizedChannels = currentChannels.filter(
    (c) => !c.parent_id && c.type !== ChannelType.GUILD_CATEGORY
  );

  const getChannelsForCategory = (parentId: string) =>
    currentChannels.filter((c) => c.parent_id === parentId);

  if (sidebarCollapsed) {
    return null;
  }

  return (
    <div className="flex h-full w-60 flex-col bg-[var(--color-bg-sidebar)] border-r border-[var(--color-border)]">
      {/* Header */}
      <div className="flex h-12 items-center border-b border-[var(--color-border)] px-4">
        {selectedGuild ? (
          <h2 className="flex items-center gap-2 font-medium text-[var(--color-text)]">
            {selectedGuild.icon ? (
              <img
                src={`https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png`}
                alt=""
                className="h-6 w-6 rounded-lg object-cover"
              />
            ) : null}
            {selectedGuild.name}
          </h2>
        ) : (
          <h2 className="font-medium text-[var(--color-text)]">Direct Messages</h2>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {selectedGuildId ? (
          <>
            {/* Guild Channels */}
            <div className="space-y-1">
              {categories.map((category) => (
                <div key={category.id} className="mt-4 first:mt-0">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleGuildExpanded(category.id)}
                    className="mb-1 flex w-full items-center gap-1 px-1 py-1 text-xs font-medium uppercase text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
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
                        <ChannelItem
                          key={channel.id}
                          channel={channel}
                          isSelected={selectedChannelId === channel.id}
                          onSelect={() => navigateToChannel(channel.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Uncategorized Channels */}
              <div className="space-y-0.5">
                {uncategorizedChannels.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isSelected={selectedChannelId === channel.id}
                    onSelect={() => navigateToChannel(channel.id)}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Direct Messages */}
            <div className="space-y-0.5">
              <div className="mb-2 flex items-center justify-between px-2">
                <p className="text-xs font-medium uppercase text-[var(--color-text-muted)]">
                  Mensagens Diretas
                </p>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-brand)] transition-colors"
                  title="Create group DM"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
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
                  const isDmUnread = dm.last_message_id ? isUnread(dm.id, dm.last_message_id) : false;
                  return (
                    <button
                      key={dm.id}
                      onClick={() => navigateToChannel(dm.id)}
                      className={cn(
                        "group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                        selectedChannelId === dm.id
                          ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]"
                      )}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar
                          src={recipient?.avatar}
                          alt={name}
                          userId={recipient?.id}
                          size="sm"
                        />
                        {isDmUnread && (
                          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--color-brand)]" />
                        )}
                      </div>
                      <span className={cn("truncate", isDmUnread && "font-medium text-[var(--color-brand)]")}>{name}</span>
                    </button>
                  );
                })}
            </div>
          </>
        )}
      </div>

      {/* User Footer */}
      {currentUser && (
        <div className="flex h-14 items-center border-t border-[var(--color-border)] bg-[var(--color-bg-deep)] px-3">
          <Avatar
            src={currentUser.avatar}
            alt={currentUser.username}
            userId={currentUser.id}
            size="sm"
          />
          <div className="ml-3 flex-1 truncate">
            <p className="truncate text-sm font-medium text-[var(--color-text)]">
              {currentUser.global_name || currentUser.username}
            </p>
            <p className="truncate text-xs text-[var(--color-text-muted)]">
              #{currentUser.discriminator}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="mr-1 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-brand)] transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal onClose={() => setShowCreateGroup(false)} />
      )}
    </div>
  );
}

function ChannelItem({
  channel,
  isSelected,
  onSelect,
}: {
  channel: DiscordChannel;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { isUnread } = useUIStore();
  const isVoice =
    channel.type === ChannelType.GUILD_VOICE ||
    channel.type === ChannelType.GUILD_STAGE_VOICE;
  const channelUnread = channel.last_message_id ? isUnread(channel.id, channel.last_message_id) : false;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors",
        isSelected
          ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]",
        isVoice && "font-normal"
      )}
    >
      {getChannelIcon(channel)}
      <span className={cn("flex-1 truncate text-left", isVoice && "ml-1", channelUnread && "font-medium text-[var(--color-brand)]")}>
        {channel.name}
      </span>
      {channelUnread && (
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[var(--color-brand)]" />
      )}
    </button>
  );
}
