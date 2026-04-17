// Discord API Types based on v10

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string;
  avatar: string | null;
  bot?: boolean;
  email?: string;
  flags?: number;
  public_flags?: number;
  banner?: string | null;
  accent_color?: number;
  locale?: string;
  mfa_enabled?: boolean;
  verified?: boolean;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions?: string;
  features: string[];
}

export interface DiscordChannel {
  id: string;
  type: ChannelType;
  guild_id?: string;
  name?: string;
  parent_id?: string | null;
  position?: number;
  last_message_id?: string | null;
  topic?: string | null;
  nsfw?: boolean;
  bitrate?: number;
  user_limit?: number;
  rate_limit_per_user?: number;
  recipients?: DiscordUser[];
}

export enum ChannelType {
  GUILD_TEXT = 0,
  DM = 1,
  GUILD_VOICE = 2,
  GROUP_DM = 3,
  GUILD_CATEGORY = 4,
  GUILD_ANNOUNCEMENT = 5,
  ANNOUNCEMENT_THREAD = 10,
  PUBLIC_THREAD = 11,
  PRIVATE_THREAD = 12,
  GUILD_STAGE_VOICE = 13,
  GUILD_DIRECTORY = 14,
  GUILD_FORUM = 15,
  GUILD_MEDIA = 16,
}

export interface DiscordMessage {
  id: string;
  channel_id: string;
  guild_id?: string;
  author: DiscordUser;
  content: string;
  timestamp: string;
  edited_timestamp?: string | null;
  tts?: boolean;
  mention_everyone?: boolean;
  mentions?: DiscordUser[];
  mention_roles?: string[];
  mention_channels?: { id: string; guild_id: string; name: string; type: ChannelType }[];
  attachments?: Attachment[];
  embeds?: Embed[];
  reactions?: Reaction[];
  type: MessageType;
  member?: GuildMember;
}

export enum MessageType {
  DEFAULT = 0,
  RECIPIENT_ADD = 1,
  RECIPIENT_REMOVE = 2,
  CALL = 3,
  CHANNEL_NAME_CHANGE = 4,
  CHANNEL_ICON_CHANGE = 5,
  REPLY = 19,
  SLASH_COMMAND = 20,
  THREAD_STARTER_MESSAGE = 21,
  GUILD_INVITE_REMINDER = 22,
  AUTO_MODERATION_ACTION = 23,
  ROLE_SUBSCRIPTION = 24,
}

export interface Attachment {
  id: string;
  filename: string;
  description?: string;
  content_type?: string;
  size: number;
  url: string;
  proxy_url: string;
  width?: number;
  height?: number;
  ephemeral?: boolean;
}

export interface Embed {
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  color?: number;
  timestamp?: string;
  footer?: {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  image?: {
    url: string;
    proxy_url?: string;
    width?: number;
    height?: number;
  };
  thumbnail?: {
    url: string;
    proxy_url?: string;
    width?: number;
    height?: number;
  };
  video?: {
    url: string;
    proxy_url?: string;
    width?: number;
    height?: number;
  };
  provider?: {
    name?: string;
    url?: string;
  };
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
}

export interface Reaction {
  count: number;
  me: boolean;
  emoji: {
    id: string | null;
    name: string | null;
    animated?: boolean;
  };
}

export interface GuildMember {
  roles: string[];
  nick?: string | null;
  avatar?: string | null;
  joined_at: string;
  deaf: boolean;
  mute: boolean;
  flags: number;
  pending?: boolean;
  permissions?: string;
  communication_disabled_until?: string | null;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  icon?: string | null;
  unicode_emoji?: string | null;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
  tags?: {
    bot_id?: string;
    integration_id?: string;
    subscription_listing_id?: string;
    premium_subscriber?: null;
  };
}

export interface DiscordEmoji {
  id: string;
  name: string;
  roles?: DiscordRole[];
  require_colons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;
}

// Gateway types
export interface GatewayInfo {
  url: string;
  shards: number;
  session_start: {
    max_concurrency: number;
    remaining: number;
    reset_after: number;
    total: number;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  classes: any;
}

// API Response types
export interface DiscordPaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
}

// Application Command types (Discord Slash Commands)
export interface ApplicationCommandOptionChoice {
  name: string;
  value: string | number;
}

export interface ApplicationCommandOption {
  name: string;
  description: string;
  type: number; // 1=SUB_COMMAND, 2=SUB_COMMAND_GROUP, 3=STRING, 4=INTEGER, 5=BOOLEAN, 6=USER, 7=CHANNEL, 8=ROLE, 9=MENTIONABLE, 10=NUMBER
  required?: boolean;
  choices?: ApplicationCommandOptionChoice[];
  options?: ApplicationCommandOption[];
}

export interface ApplicationCommand {
  id: string;
  type: number; // 1=CHAT_INPUT, 2=USER, 3=MESSAGE
  application_id: string;
  guild_id?: string;
  name: string;
  description: string;
  options?: ApplicationCommandOption[];
  default_member_permissions?: string | null;
  dm_permission?: boolean;
  nsfw?: boolean;
  version: string;
}
