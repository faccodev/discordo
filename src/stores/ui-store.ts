import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DiscordGuild, DiscordChannel, DiscordUser } from "@/lib/discord/types";

interface UnreadState {
  channelId: string;
  lastReadMessageId: string | null;
}

interface UIState {
  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Selected items
  selectedGuildId: string | null;
  selectedChannelId: string | null;

  setSelectedGuild: (guildId: string | null) => void;
  setSelectedChannel: (channelId: string | null) => void;

  // Current user (from Discord)
  currentUser: DiscordUser | null;
  setCurrentUser: (user: DiscordUser | null) => void;

  // Cached data
  guilds: DiscordGuild[];
  setGuilds: (guilds: DiscordGuild[]) => void;

  channels: Record<string, DiscordChannel[]>;
  setChannels: (guildId: string, channels: DiscordChannel[]) => void;
  getChannels: (guildId: string) => DiscordChannel[];

  // DMs
  dms: DiscordChannel[];
  setDMs: (channels: DiscordChannel[]) => void;

  // Unread channels: lastReadMessageId per channelId
  lastReadMessages: Record<string, string>;
  setLastReadMessage: (channelId: string, messageId: string) => void;
  markChannelRead: (channelId: string, lastMessageId: string) => void;
  isUnread: (channelId: string, currentLastMessageId: string) => boolean;

  // Expanded guilds (for showing channels)
  expandedGuilds: Set<string>;
  toggleGuildExpanded: (guildId: string) => void;
  isGuildExpanded: (guildId: string) => boolean;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Selected items
      selectedGuildId: null,
      selectedChannelId: null,
      setSelectedGuild: (guildId) => set({ selectedGuildId: guildId }),
      setSelectedChannel: (channelId) => set({ selectedChannelId: channelId }),

      // Current user
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),

      // Guilds
      guilds: [],
      setGuilds: (guilds) => set({ guilds }),

      // Channels
      channels: {},
      setChannels: (guildId, channels) =>
        set((state) => ({
          channels: { ...state.channels, [guildId]: channels },
        })),
      getChannels: (guildId) => get().channels[guildId] || [],

      // DMs
      dms: [],
      setDMs: (dms) => set({ dms }),

      // Unread tracking
      lastReadMessages: {},
      setLastReadMessage: (channelId, messageId) =>
        set((state) => ({
          lastReadMessages: { ...state.lastReadMessages, [channelId]: messageId },
        })),
      markChannelRead: (channelId, lastMessageId) =>
        set((state) => ({
          lastReadMessages: { ...state.lastReadMessages, [channelId]: lastMessageId },
        })),
      isUnread: (channelId, currentLastMessageId) => {
        const lastRead = get().lastReadMessages[channelId];
        if (!lastRead) return false;
        // Compare using BigInt for snowflake IDs
        return BigInt(currentLastMessageId) > BigInt(lastRead);
      },

      // Expanded guilds
      expandedGuilds: new Set<string>(),
      toggleGuildExpanded: (guildId) =>
        set((state) => {
          const newSet = new Set(state.expandedGuilds);
          if (newSet.has(guildId)) {
            newSet.delete(guildId);
          } else {
            newSet.add(guildId);
          }
          return { expandedGuilds: newSet };
        }),
      isGuildExpanded: (guildId) => get().expandedGuilds.has(guildId),
    }),
    {
      name: "discordo-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        selectedGuildId: state.selectedGuildId,
        selectedChannelId: state.selectedChannelId,
        theme: state.theme,
        lastReadMessages: state.lastReadMessages,
      }),
    }
  )
);
