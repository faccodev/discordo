import { DISCORD_API_BASE, Endpoints } from "./endpoints";
import type {
  DiscordUser,
  DiscordGuild,
  DiscordChannel,
  DiscordMessage,
  DiscordRole,
  GuildMember,
} from "./types";

const DISCORD_SUPER_PROPERTIES = {
  os: "Windows",
  browser: "Chrome",
  release_channel: "stable",
  client_build_number: 482285,
  client_event_source: null,
};

function getDiscordHeaders(token: string): Record<string, string> {
  const superProps = Buffer.from(JSON.stringify(DISCORD_SUPER_PROPERTIES)).toString("base64");
  return {
    Authorization: `Bot ${token}`,
    "Content-Type": "application/json",
    "X-Super-Properties": superProps,
    "Accept-Language": "en-US",
    Referer: "https://discord.com/channels/@me",
    "X-Discord-Locale": "en-US",
  };
}

async function discordFetch<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${DISCORD_API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getDiscordHeaders(token),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new DiscordAPIError(response.status, error, endpoint);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export class DiscordAPIError extends Error {
  constructor(
    public status: number,
    public body: string,
    public endpoint: string
  ) {
    super(`Discord API Error ${status} on ${endpoint}: ${body}`);
    this.name = "DiscordAPIError";
  }
}

export class DiscordClient {
  constructor(private token: string) {}

  // Users
  async getMe(): Promise<DiscordUser> {
    return discordFetch<DiscordUser>(Endpoints.me, this.token);
  }

  // Guilds
  async getUserGuilds(): Promise<DiscordGuild[]> {
    return discordFetch<DiscordGuild[]>(Endpoints.userGuilds, this.token);
  }

  async getGuild(guildId: string): Promise<DiscordGuild> {
    return discordFetch<DiscordGuild>(Endpoints.guild(guildId), this.token);
  }

  async getGuildChannels(guildId: string): Promise<DiscordChannel[]> {
    const channels = await discordFetch<DiscordChannel[]>(
      Endpoints.guildChannels(guildId),
      this.token
    );
    return channels.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  async getGuildRoles(guildId: string): Promise<DiscordRole[]> {
    return discordFetch<DiscordRole[]>(Endpoints.guildRoles(guildId), this.token);
  }

  async getGuildMember(guildId: string, userId: string): Promise<GuildMember & { user: DiscordUser }> {
    return discordFetch<GuildMember & { user: DiscordUser }>(
      Endpoints.guildMember(guildId, userId),
      this.token
    );
  }

  // Channels
  async getUserChannels(): Promise<DiscordChannel[]> {
    return discordFetch<DiscordChannel[]>(Endpoints.userChannels, this.token);
  }

  async getChannel(channelId: string): Promise<DiscordChannel> {
    return discordFetch<DiscordChannel>(Endpoints.channel(channelId), this.token);
  }

  async getChannelMessages(
    channelId: string,
    options: { limit?: number; before?: string; after?: string } = {}
  ): Promise<DiscordMessage[]> {
    const params = new URLSearchParams();
    params.set("limit", String(options.limit ?? 50));
    if (options.before) params.set("before", options.before);
    if (options.after) params.set("after", options.after);

    return discordFetch<DiscordMessage[]>(
      `${Endpoints.channelMessages(channelId)}?${params}`,
      this.token
    );
  }

  // Search messages in a channel
  async searchMessages(
    channelId: string,
    query: string,
    options: { limit?: number } = {}
  ): Promise<DiscordMessage[]> {
    const params = new URLSearchParams();
    params.set("content", query);
    params.set("limit", String(options.limit ?? 25));

    return discordFetch<DiscordMessage[]>(
      `${Endpoints.channelMessages(channelId)}/search?${params}`,
      this.token
    );
  }

  // Send message
  async sendMessage(channelId: string, content: string): Promise<DiscordMessage> {
    return discordFetch<DiscordMessage>(Endpoints.sendMessage(channelId), this.token, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }

  // Reactions
  async addReaction(channelId: string, messageId: string, emoji: string): Promise<void> {
    return discordFetch<void>(
      Endpoints.addReaction(channelId, messageId, emoji),
      this.token,
      { method: "PUT" }
    );
  }

  async deleteReaction(channelId: string, messageId: string, emoji: string): Promise<void> {
    return discordFetch<void>(
      Endpoints.deleteReaction(channelId, messageId, emoji),
      this.token,
      { method: "DELETE" }
    );
  }

  // Group DMs
  async createGroupDM(
    recipients: string[],
    name?: string,
    icon?: string
  ): Promise<unknown> {
    return discordFetch<unknown>(Endpoints.userChannels, this.token, {
      method: "POST",
      body: JSON.stringify({ recipients, name, icon }),
    });
  }

  async updateChannel(channelId: string, data: {
    name?: string;
    icon?: string;
    topic?: string;
  }): Promise<unknown> {
    return discordFetch<unknown>(Endpoints.channel(channelId), this.token, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async addRecipient(channelId: string, userId: string): Promise<void> {
    return discordFetch<void>(
      Endpoints.channelRecipient(channelId, userId),
      this.token,
      { method: "PUT" }
    );
  }

  async removeRecipient(channelId: string, userId: string): Promise<void> {
    return discordFetch<void>(
      Endpoints.channelRecipient(channelId, userId),
      this.token,
      { method: "DELETE" }
    );
  }
}

export function getDiscordClient(token?: string): DiscordClient {
  const discordToken = token || process.env.DISCORD_BOT_TOKEN;
  if (!discordToken) {
    throw new Error("DISCORD_BOT_TOKEN is not set");
  }
  return new DiscordClient(discordToken);
}
