"use client";

import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "@/stores/ui-store";

interface UnreadResponse {
  unread: Record<string, string | null>;
}

export function useUnreadStatus(channelIds: string[]) {
  const { isUnread, lastReadMessages } = useUIStore();

  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["discord-unread", channelIds],
    queryFn: async (): Promise<UnreadResponse> => {
      const params = channelIds.join(",");
      const res = await fetch(`/api/discord/unread?channels=${params}`);
      if (!res.ok) throw new Error("Failed to fetch unread status");
      return res.json();
    },
    enabled: channelIds.length > 0,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Combine API data with local lastReadMessages
  // If we have a local lastRead for a channel, use that for comparison
  // API gives us current last_message_id, we compare with stored lastRead
  const hasUnread = (channelId: string): boolean => {
    if (!data?.unread) return false;

    const currentLastMessageId = data.unread[channelId];
    if (!currentLastMessageId) return false;

    // Check local storage first
    const localLastRead = lastReadMessages[channelId];
    if (localLastRead) {
      return BigInt(currentLastMessageId) > BigInt(localLastRead);
    }

    // If no local record, use API-based check (compare with stored lastRead from Zustand)
    return isUnread(channelId, currentLastMessageId);
  };

  return {
    unreadMap: data?.unread ?? {},
    hasUnread,
    isLoading,
    lastUpdated: dataUpdatedAt,
  };
}

// Simpler hook for checking single channel
export function useChannelUnread(channelId: string | null) {
  const { lastReadMessages } = useUIStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["discord-channel", channelId, "unread"],
    queryFn: async () => {
      if (!channelId) return { lastMessageId: null };
      const res = await fetch(`/api/discord/channels/${channelId}`);
      if (!res.ok) throw new Error("Failed to fetch channel");
      const channel = await res.json();
      return { lastMessageId: channel.last_message_id };
    },
    enabled: !!channelId,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const isUnread = (): boolean => {
    if (!data?.lastMessageId || !channelId) return false;
    const lastRead = lastReadMessages[channelId];
    if (!lastRead) return false;
    return BigInt(data.lastMessageId) > BigInt(lastRead);
  };

  return { lastMessageId: data?.lastMessageId, isUnread: isUnread(), isLoading, refetch };
}