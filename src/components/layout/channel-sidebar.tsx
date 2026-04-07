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
  Users,
  Plus,
  Phone,
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

function getChannelIconColor(channel: DiscordChannel) {
  switch (channel.type) {
    case ChannelType.GUILD_VOICE:
    case ChannelType.GUILD_STAGE_VOICE:
      return "text-text-dim";
    case ChannelType.GUILD_TEXT:
    default:
      return "text-text-dim group-hover:text-primary";
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
    expandedGuilds,
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
    <div className="flex h-full w-60 flex-col glass-sidebar border-r border-border">
      {/* Header */}
      <div className="flex h-12 items-center border-b border-border-bright/30 px-4 shadow-sm">
        {selectedGuild ? (
          <h2 className="flex items-center gap-2 font-mono font-semibold text-primary">
            {selectedGuild.icon ? (
              <img
                src={`https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png`}
                alt=""
                className="h-6 w-6 rounded-sm grayscale hover:grayscale-0 transition-all duration-300"
              />
            ) : null}
            {selectedGuild.name}
          </h2>
        ) : (
          <h2 className="font-mono font-semibold text-primary">Direct Messages</h2>
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
                    className="mb-1 flex w-full items-center gap-1 px-1 text-xs font-semibold uppercase text-text-dim hover:text-primary"
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
                <p className="text-xs font-semibold uppercase text-text-dim">
                  Mensagens Diretas
                </p>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="flex h-5 w-5 items-center justify-center rounded-sm text-text-dim hover:bg-bg-hover hover:text-primary transition-colors"
                  title="Create group DM"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              {dms
                .slice()
                .sort((a, b) => {
                  // Sort by last_message_id descending (most recent first)
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
                        "group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                        selectedChannelId === dm.id
                          ? "glass-active text-primary"
                          : "text-text-dim hover:bg-bg-hover hover:text-primary hover:shadow-[0_0_10px_rgba(0,255,65,0.1)]"
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
                          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_6px_#00FF41]" />
                        )}
                      </div>
                      <span className={cn("truncate", isDmUnread && "font-semibold text-primary")}>{name}</span>
                    </button>
                  );
                })}
            </div>
          </>
        )}
      </div>

      {/* User Footer */}
      {currentUser && (
        <div className="flex h-14 items-center border-t border-border-bright/30 glass px-3">
          <Avatar
            src={currentUser.avatar}
            alt={currentUser.username}
            userId={currentUser.id}
            size="sm"
          />
          <div className="ml-3 flex-1 truncate">
            <p className="truncate text-sm font-mono font-medium text-primary">
              {currentUser.global_name || currentUser.username}
            </p>
            <p className="truncate text-xs font-mono text-text-dim">
              #{currentUser.discriminator}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="mr-1 flex h-8 w-8 items-center justify-center rounded-lg text-text-dim hover:bg-bg-hover hover:text-primary transition-colors hover:shadow-[0_0_10px_rgba(0,255,65,0.2)]"
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
        "group flex w-full items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-mono transition-all duration-200",
        isSelected
          ? "glass-active text-primary"
          : "text-text-dim hover:bg-bg-hover hover:text-primary hover:shadow-[0_0_10px_rgba(0,255,65,0.1)]",
        isVoice && "font-normal"
      )}
    >
      {getChannelIcon(channel)}
      <span className={cn("flex-1 truncate text-left", isVoice && "ml-1", channelUnread && "font-semibold text-primary")}>
        {channel.name}
      </span>
      {channelUnread && (
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary shadow-[0_0_6px_#00FF41]" />
      )}
      {channel.topic && (
        <span className="ml-1 font-mono text-xs text-text-dim">{channel.topic}</span>
      )}
    </button>
  );
}
