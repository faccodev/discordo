"use client";

import { useState, useEffect } from "react";
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
      return "text-neutral-500";
    case ChannelType.GUILD_TEXT:
    default:
      return "text-neutral-500 group-hover:text-white";
  }
}

export function ChannelSidebar() {
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
  } = useUIStore();

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
    <div className="flex h-full w-60 flex-col bg-dark-sd">
      {/* Header */}
      <div className="flex h-12 items-center border-b border-dark-bl px-4 shadow-sm">
        {selectedGuild ? (
          <h2 className="flex items-center gap-2 font-semibold text-white">
            {selectedGuild.icon ? (
              <img
                src={`https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png`}
                alt=""
                className="h-6 w-6 rounded-full"
              />
            ) : null}
            {selectedGuild.name}
          </h2>
        ) : (
          <h2 className="font-semibold text-white">Direct Messages</h2>
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
                    className="mb-1 flex w-full items-center gap-1 px-1 text-xs font-semibold uppercase text-neutral-400 hover:text-white"
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
                          onSelect={() => setSelectedChannel(channel.id)}
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
                    onSelect={() => setSelectedChannel(channel.id)}
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
                <p className="text-xs font-semibold uppercase text-neutral-400">
                  Mensagens Diretas
                </p>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="flex h-5 w-5 items-center justify-center rounded text-neutral-500 hover:bg-dark-hover hover:text-white transition-colors"
                  title="Create group DM"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              {dms.map((dm) => {
                const recipient = dm.recipients?.[0];
                const name = dm.name || recipient?.username || "Unknown";
                return (
                  <button
                    key={dm.id}
                    onClick={() => setSelectedChannel(dm.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
                      selectedChannelId === dm.id
                        ? "bg-dark-active text-white"
                        : "text-neutral-400 hover:bg-dark-hover hover:text-white"
                    )}
                  >
                    <Avatar
                      src={recipient?.avatar}
                      alt={name}
                      userId={recipient?.id}
                      size="sm"
                    />
                    <span className="truncate">{name}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* User Footer */}
      {currentUser && (
        <div className="flex h-12 items-center bg-dark-bl px-2">
          <Avatar
            src={currentUser.avatar}
            alt={currentUser.username}
            userId={currentUser.id}
            size="sm"
          />
          <div className="ml-2 flex-1 truncate">
            <p className="truncate text-sm font-medium text-white">
              {currentUser.global_name || currentUser.username}
            </p>
            <p className="truncate text-xs text-neutral-500">
              #{currentUser.discriminator}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="mr-1 flex h-8 w-8 items-center justify-center rounded text-neutral-500 hover:bg-dark-hover hover:text-white transition-colors"
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
  const isVoice =
    channel.type === ChannelType.GUILD_VOICE ||
    channel.type === ChannelType.GUILD_STAGE_VOICE;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center gap-1 rounded px-2 py-1 text-sm transition-colors",
        isSelected
          ? "bg-dark-active text-white"
          : "text-neutral-400 hover:bg-dark-hover hover:text-white",
        isVoice && "font-normal"
      )}
    >
      {getChannelIcon(channel)}
      <span className={cn("flex-1 truncate text-left", isVoice && "ml-1")}>
        {channel.name}
      </span>
      {channel.topic && (
        <span className="ml-1 text-xs text-neutral-500">{channel.topic}</span>
      )}
    </button>
  );
}
