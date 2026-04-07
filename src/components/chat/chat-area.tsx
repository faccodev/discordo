"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "@/stores/ui-store";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { SearchModal } from "./search-modal";
import { useNotifications } from "@/hooks/useNotifications";
import { Loader2, Hash, Users, Search, Bell, BellOff } from "lucide-react";
import { ChannelType } from "@/lib/discord/types";
import type { DiscordChannel } from "@/lib/discord/types";

export function ChatArea({ channelId }: { channelId?: string }) {
  const { selectedChannelId, selectedGuildId, channels, guilds } = useUIStore();
  const [searchOpen, setSearchOpen] = useState(false);

  // Use URL channelId if provided, otherwise fall back to Zustand
  const activeChannelId = channelId || selectedChannelId;

  const { data: channelInfo } = useQuery({
    queryKey: ["discord-channel", activeChannelId],
    queryFn: async () => {
      const res = await fetch(`/api/discord/channels/${activeChannelId}`);
      if (!res.ok) throw new Error("Failed to fetch channel");
      return res.json() as Promise<DiscordChannel>;
    },
    enabled: !!activeChannelId,
  });

  // Browser notifications
  const {
    permission: notifPermission,
    requestPermission: requestNotifPermission,
  } = useNotifications({
    channelId: activeChannelId ?? "",
    enabled: !!activeChannelId,
  });

  const currentChannels = selectedGuildId ? channels[selectedGuildId] || [] : [];
  const currentChannel = currentChannels.find((c) => c.id === activeChannelId);
  const channelName = channelInfo?.name || currentChannel?.name || "Canal";
  const selectedGuild = guilds.find((g) => g.id === selectedGuildId);

  if (!activeChannelId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-dark">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-dark-hover">
            <Hash className="h-8 w-8 text-neutral-500" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {selectedGuild ? "Selecione um canal" : "Selecione um DM"}
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            {selectedGuild
              ? "Escolha um canal na barra lateral para começar a conversar"
              : "Escolha uma conversa na barra lateral para começar"}
          </p>
        </div>
      </div>
    );
  }

  const isVoiceChannel =
    channelInfo?.type === ChannelType.GUILD_VOICE ||
    channelInfo?.type === ChannelType.GUILD_STAGE_VOICE;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-dark">
      {/* Channel Header */}
      <div className="flex h-12 min-h-[48px] items-center border-b border-dark-bl bg-dark px-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {channelInfo?.type === ChannelType.GUILD_TEXT ||
          channelInfo?.type === undefined ? (
            <Hash className="h-5 w-5 flex-shrink-0 text-neutral-500" />
          ) : channelInfo?.type === ChannelType.GUILD_VOICE ? (
            <Users className="h-5 w-5 flex-shrink-0 text-neutral-500" />
          ) : null}
          <h1 className="truncate font-semibold text-white">{channelName}</h1>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1 ml-2">
          {/* Notifications toggle */}
          {notifPermission === 'default' && (
            <button
              onClick={requestNotifPermission}
              className="flex h-8 w-8 items-center justify-center rounded text-neutral-500 hover:bg-dark-hover hover:text-white transition-colors md:hidden"
              title="Ativar notificações"
            >
              <Bell className="h-5 w-5" />
            </button>
          )}
          {notifPermission === 'granted' && (
            <div className="hidden h-8 w-8 items-center justify-center rounded text-green-500 sm:flex" title="Notificações ativas">
              <Bell className="h-4 w-4" />
            </div>
          )}

          {/* Search */}
          {!isVoiceChannel && (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded text-neutral-500 hover:bg-dark-hover hover:text-white transition-colors"
              title="Pesquisar mensagens"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Topic */}
        {channelInfo?.topic && (
          <span className="ml-3 hidden border-l border-dark-hover pl-4 text-sm text-neutral-500 lg:block xl:hidden 2xl:block">
            {channelInfo.topic}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList channelId={activeChannelId} />
      </div>

      {/* Input */}
      {!isVoiceChannel && <MessageInput channelId={activeChannelId} />}

      {/* Search Modal */}
      {searchOpen && activeChannelId && (
        <SearchModal
          channelId={activeChannelId}
          channelName={channelName}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
}
