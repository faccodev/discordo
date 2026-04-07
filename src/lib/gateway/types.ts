// Discord Gateway v10 — WebSocket types and constants

export const GATEWAY_VERSION = 10;
export const GATEWAY_URL = `wss://gateway.discord.gg/?v=${GATEWAY_VERSION}&encoding=json`;

// Gateway Opcodes
export enum GatewayOpcode {
  Dispatch = 0,
  Heartbeat = 1,
  Identify = 2,
  PresenceUpdate = 3,
  VoiceStateUpdate = 4,
  Resume = 6,
  Reconnect = 7,
  RequestGuildMembers = 8,
  InvalidSession = 9,
  Hello = 10,
  HeartbeatAck = 11,
}

// Intent flags
export const GatewayIntents = {
  GUILDS: 1 << 0,
  GUILD_MEMBERS: 1 << 1,
  GUILD_MODERATION: 1 << 2,
  GUILD_EMOJIS_AND_STICKERS: 1 << 3,
  GUILD_INTEGRATIONS: 1 << 4,
  GUILD_WEBHOOKS: 1 << 5,
  GUILD_INVITES: 1 << 6,
  GUILD_VOICE_STATES: 1 << 13,
  GUILD_PRESENCES: 1 << 12,
  GUILD_MESSAGES: 1 << 9,
  GUILD_MESSAGE_REACTIONS: 1 << 10,
  GUILD_MESSAGE_TYPING: 1 << 11,
  DIRECT_MESSAGES: 1 << 14,
  DIRECT_MESSAGE_REACTIONS: 1 << 15,
  DIRECT_MESSAGE_TYPING: 1 << 16,
} as const;

export const DEFAULT_INTENTS =
  GatewayIntents.GUILDS |
  GatewayIntents.GUILD_MESSAGES |
  GatewayIntents.GUILD_VOICE_STATES |
  GatewayIntents.DIRECT_MESSAGES |
  GatewayIntents.DIRECT_MESSAGE_REACTIONS |
  GatewayIntents.DIRECT_MESSAGE_TYPING;

// Client properties (super properties)
export const GATEWAY_PROPERTIES = {
  os: 'Windows',
  browser: 'Chrome',
  device: '',
  system_locale: 'en-US',
  browser_user_agent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
  browser_version: '143.0.0.0',
  os_version: '10',
  build_number: 382950,
  release_channel: 'stable',
  client_event_source: null,
} as const;

// Dispatch event names
export enum GatewayEvent {
  Ready = 'READY',
  Resumed = 'RESUMED',
  MessageCreate = 'MESSAGE_CREATE',
  MessageUpdate = 'MESSAGE_UPDATE',
  MessageDelete = 'MESSAGE_DELETE',
  MessageDeleteBulk = 'MESSAGE_DELETE_BULK',
  MessageReactionAdd = 'MESSAGE_REACTION_ADD',
  MessageReactionRemove = 'MESSAGE_REACTION_REMOVE',
  ChannelCreate = 'CHANNEL_CREATE',
  ChannelUpdate = 'CHANNEL_UPDATE',
  ChannelDelete = 'CHANNEL_DELETE',
  ChannelPinsUpdate = 'CHANNEL_PINS_UPDATE',
  GuildCreate = 'GUILD_CREATE',
  GuildUpdate = 'GUILD_UPDATE',
  GuildDelete = 'GUILD_DELETE',
  GuildBanAdd = 'GUILD_BAN_ADD',
  GuildBanRemove = 'GUILD_BAN_REMOVE',
  GuildEmojisUpdate = 'GUILD_EMOJIS_UPDATE',
  GuildIntegrationsUpdate = 'GUILD_INTEGRATIONS_UPDATE',
  GuildMemberAdd = 'GUILD_MEMBER_ADD',
  GuildMemberRemove = 'GUILD_MEMBER_REMOVE',
  GuildMemberUpdate = 'GUILD_MEMBER_UPDATE',
  GuildMembersChunk = 'GUILD_MEMBERS_CHUNK',
  GuildRoleCreate = 'GUILD_ROLE_CREATE',
  GuildRoleUpdate = 'GUILD_ROLE_UPDATE',
  GuildRoleDelete = 'GUILD_ROLE_DELETE',
  InviteCreate = 'INVITE_CREATE',
  InviteDelete = 'INVITE_DELETE',
  MessageTypingStart = 'TYPING_START',
  VoiceStateUpdate = 'VOICE_STATE_UPDATE',
  VoiceServerUpdate = 'VOICE_SERVER_UPDATE',
  WebhooksUpdate = 'WEBHOOKS_UPDATE',
  PresenceUpdate = 'PRESENCE_UPDATE',
  UserSettingsUpdate = 'USER_SETTINGS_UPDATE',
  UserGuildSettingsUpdate = 'USER_GUILD_SETTINGS_UPDATE',
  RelationshipAdd = 'RELATIONSHIP_ADD',
  RelationshipRemove = 'RELATIONSHIP_REMOVE',
  RelationshipUpdate = 'RELATIONSHIP_UPDATE',
}

// Payloads
export interface GatewayHelloPayload {
  heartbeat_interval: number;
  _trace: string[];
}

export interface GatewayIdentifyPayload {
  token: string;
  properties: typeof GATEWAY_PROPERTIES;
  compress?: boolean;
  large_threshold?: number;
  shard?: [number, number];
  presence?: GatewayPresencePayload;
  intents: number;
}

export interface GatewayPresencePayload {
  since: number | null;
  activities: GatewayActivity[];
  status: 'online' | 'dnd' | 'idle' | 'invisible' | 'offline';
  afk: boolean;
}

export interface GatewayActivity {
  name: string;
  type: number;
  url?: string;
  details?: string;
  state?: string;
  emoji?: {
    id: string | null;
    name: string;
    animated?: boolean;
  };
  timestamps?: {
    start?: number;
    end?: number;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  secrets?: {
    join?: string;
    spectate?: string;
    match?: string;
  };
  instance?: boolean;
  party?: {
    id?: string;
    size?: [number, number];
  };
  flags?: number;
}

export interface GatewayReadyPayload {
  v: number;
  user: {
    id: string;
    username: string;
    global_name: string | null;
    display_name: string | null;
    avatar: string | null;
    discriminator: string;
    public_flags: number;
    bot: boolean;
    email?: string;
    verified: boolean;
  };
  guilds: { id: string; unavailable: boolean }[];
  session_id: string;
  application: { id: string; flags: number };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user_settings?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user_guild_settings?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sessions?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resumable_session_portal?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connected_accounts?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chats?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  latest_channel_settings?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private_channels?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  guild_join_requests?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countries?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authenticated?: any;
}

export interface GatewayVoiceStatePayload {
  guild_id: string;
  channel_id: string | null;
  user_id: string;
  session_id: string;
  deaf: boolean;
  mute: boolean;
  self_deaf: boolean;
  self_mute: boolean;
  self_stream?: boolean;
  self_video: boolean;
  suppress: boolean;
  request_to_speak_timestamp: string | null;
}

export interface GatewayVoiceServerPayload {
  token: string;
  guild_id: string;
  endpoint: string;
}

// Gateway message envelope
export interface GatewayMessage<T = unknown> {
  op: GatewayOpcode;
  d?: T;
  s?: number;
  t?: string;
}

// Event listener type
export type GatewayEventHandler = (payload: unknown) => void;

// Connection state
export type GatewayConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'handshaking'
  | 'ready'
  | 'resuming'
  | 'invalid';