export const DISCORD_API_BASE = process.env.DISCORD_API_BASE || "https://discord.com/api/v10";

export const Endpoints = {
  // Users
  me: "/users/@me",

  // Guilds
  userGuilds: "/users/@me/guilds",
  guild: (guildId: string) => `/guilds/${guildId}`,
  guildChannels: (guildId: string) => `/guilds/${guildId}/channels`,
  guildMember: (guildId: string, userId: string) => `/guilds/${guildId}/members/${userId}`,
  guildRoles: (guildId: string) => `/guilds/${guildId}/roles`,

  // Channels
  userChannels: "/users/@me/channels",
  channel: (channelId: string) => `/channels/${channelId}`,
  channelMessages: (channelId: string) => `/channels/${channelId}/messages`,
  channelSearch: (channelId: string) => `/channels/${channelId}/messages/search`,
  channelRecipient: (channelId: string, userId: string) => `/channels/${channelId}/recipients/${userId}`,

  // Gateway
  gateway: "/gateway",
  gatewayBot: "/gateway/bot",

  // Reactions
  addReaction: (channelId: string, messageId: string, emoji: string) =>
    `/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}/@me`,
  deleteReaction: (channelId: string, messageId: string, emoji: string) =>
    `/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}/@me`,

  // Messages
  sendMessage: (channelId: string) => `/channels/${channelId}/messages`,

  // Invite
  getInvite: (inviteCode: string) => `/invites/${inviteCode}`,
} as const;
