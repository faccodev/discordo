import {
  GatewayOpcode,
  GatewayEvent,
  GatewayHelloPayload,
  GatewayIdentifyPayload,
  GatewayReadyPayload,
  GatewayVoiceStatePayload,
  GatewayVoiceServerPayload,
  GatewayMessage,
  DEFAULT_INTENTS,
  GATEWAY_PROPERTIES,
  GATEWAY_URL,
  type GatewayConnectionState,
} from './types';

export type GatewayEventHandler = (payload: unknown) => void;

interface GatewayEventMap {
  [GatewayEvent.Ready]: GatewayReadyPayload;
  [GatewayEvent.VoiceStateUpdate]: GatewayVoiceStatePayload;
  [GatewayEvent.VoiceServerUpdate]: GatewayVoiceServerPayload;
  [GatewayEvent.MessageCreate]: unknown;
  [GatewayEvent.MessageDelete]: unknown;
  [GatewayEvent.MessageReactionAdd]: unknown;
  [GatewayEvent.ChannelCreate]: unknown;
  [GatewayEvent.GuildCreate]: unknown;
  [GatewayEvent.PresenceUpdate]: unknown;
  [GatewayEvent.MessageTypingStart]: unknown;
  [key: string]: unknown;
}

export class GatewayClient {
  private ws: WebSocket | null = null;
  private token: string;
  private intents: number;
  private heartbeatInterval: number | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private lastSequence: number | null = null;
  private sessionId: string | null = null;
  private resumeGatewayUrl: string | null = null;
  private _state: GatewayConnectionState = 'disconnected';
  private listeners: Map<string, Set<GatewayEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_BASE_DELAY = 1000;

  // Voice state for call features
  private _currentVoiceState: GatewayVoiceStatePayload | null = null;
  private _voiceServerInfo: GatewayVoiceServerPayload | null = null;

  constructor(token: string, intents = DEFAULT_INTENTS) {
    this.token = token;
    this.intents = intents;
  }

  get state(): GatewayConnectionState {
    return this._state;
  }

  get currentVoiceState(): GatewayVoiceStatePayload | null {
    return this._currentVoiceState;
  }

  get voiceServerInfo(): GatewayVoiceServerPayload | null {
    return this._voiceServerInfo;
  }

  async connect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
    }

    this._state = 'connecting';
    this.emit('stateChange', this._state);

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(GATEWAY_URL);
      } catch (err) {
        reject(err);
        return;
      }

      this.ws.onopen = () => {
        this._state = 'handshaking';
        this.emit('stateChange', this._state);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: GatewayMessage = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch (err) {
          console.error('[Gateway] Failed to parse message:', err);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[Gateway] WebSocket error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = (event) => {
        this.clearHeartbeat();
        const wasClean = event.wasClean && event.code === 1000;

        if (wasClean && this.sessionId && this.resumeGatewayUrl) {
          // Clean close (possibly reconnect to same session)
          this.attemptResume();
        } else if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
          this.attemptReconnect();
        } else {
          this._state = 'disconnected';
          this.emit('stateChange', this._state);
        }
      };
    });
  }

  private handleMessage(msg: GatewayMessage): void {
    switch (msg.op) {
      case GatewayOpcode.Hello:
        this.onHello(msg.d as GatewayHelloPayload);
        break;

      case GatewayOpcode.Heartbeat:
        this.sendHeartbeat();
        break;

      case GatewayOpcode.HeartbeatAck:
        // Heartbeat acknowledged — connection is healthy
        break;

      case GatewayOpcode.Dispatch:
        this.lastSequence = msg.s ?? this.lastSequence;
        const eventName = msg.t;
        if (eventName) {
          this.handleDispatch(eventName, msg.d);
        }
        break;

      case GatewayOpcode.InvalidSession:
        // Try to resume or reconnect
        if (msg.d === true) {
          this.attemptResume();
        } else {
          this.reconnectAttempts++;
          this.connect();
        }
        break;

      case GatewayOpcode.Reconnect:
        this.attemptResume();
        break;
    }
  }

  private onHello(payload: GatewayHelloPayload): void {
    this.heartbeatInterval = payload.heartbeat_interval;
    this.startHeartbeat();

    if (this.sessionId && this.resumeGatewayUrl) {
      this.sendResume();
    } else {
      this.sendIdentify();
    }
  }

  private sendIdentify(): void {
    const payload: GatewayIdentifyPayload = {
      token: this.token,
      properties: GATEWAY_PROPERTIES,
      compress: true,
      large_threshold: 250,
      intents: this.intents,
      presence: {
        since: null,
        activities: [],
        status: 'online',
        afk: false,
      },
    };

    this.send(GatewayOpcode.Identify, payload);
  }

  private sendResume(): void {
    if (!this.sessionId || !this.resumeGatewayUrl) return;

    this.send(GatewayOpcode.Resume, {
      token: this.token,
      session_id: this.sessionId,
      seq: this.lastSequence,
    });

    this._state = 'resuming';
    this.emit('stateChange', this._state);
  }

  private sendHeartbeat(): void {
    this.send(GatewayOpcode.Heartbeat, this.lastSequence);
  }

  private startHeartbeat(): void {
    if (!this.heartbeatInterval || this.heartbeatTimer) return;

    // Add some jitter (10% variance)
    const jitter = Math.random() * 0.1 * this.heartbeatInterval;
    const interval = this.heartbeatInterval + jitter;

    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, interval);
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handleDispatch(eventName: string, payload: unknown): void {
    // Handle READY — store session info
    if (eventName === GatewayEvent.Ready) {
      const ready = payload as GatewayReadyPayload;
      this.sessionId = ready.session_id;
      // Store the gateway URL for resume
      this.resumeGatewayUrl = GATEWAY_URL;
      this.reconnectAttempts = 0;
      this._state = 'ready';
      this.emit('stateChange', this._state);
    }

    // Handle VOICE_STATE_UPDATE — track our own voice state
    if (eventName === GatewayEvent.VoiceStateUpdate) {
      const voiceState = payload as GatewayVoiceStatePayload;
      // Check if it's our own user (we don't have our user_id here, check via channel_id)
      this._currentVoiceState = voiceState;
      this.emit('voiceStateUpdate', voiceState);
    }

    // Handle VOICE_SERVER_UPDATE — store voice server info
    if (eventName === GatewayEvent.VoiceServerUpdate) {
      const voiceServer = payload as GatewayVoiceServerPayload;
      this._voiceServerInfo = voiceServer;
      this.emit('voiceServerUpdate', voiceServer);
    }

    // Emit to registered listeners
    const handlers = this.listeners.get(eventName);
    if (handlers) {
      handlers.forEach((handler) => handler(payload));
    }
  }

  private send(op: GatewayOpcode, d?: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ op, d }));
  }

  // ── Public API ──────────────────────────────────────────────

  /** Send a VOICE_STATE_UPDATE to join/leave a voice channel */
  updateVoiceState(guildId: string, channelId: string | null, options?: {
    selfDeaf?: boolean;
    selfMute?: boolean;
  }): void {
    this.send(GatewayOpcode.VoiceStateUpdate, {
      guild_id: guildId,
      channel_id: channelId,
      self_deaf: options?.selfDeaf ?? false,
      self_mute: options?.selfMute ?? false,
    });
  }

  /** Update presence/activity */
  updatePresence(presence: {
    status?: 'online' | 'idle' | 'dnd' | 'offline';
    activities?: { name: string; type: number }[];
  }): void {
    this.send(GatewayOpcode.PresenceUpdate, {
      since: null,
      activities: presence.activities ?? [],
      status: presence.status ?? 'online',
      afk: false,
    });
  }

  /** Request guild members */
  requestGuildMembers(guildId: string, options?: {
    query?: string;
    limit?: number;
    presences?: boolean;
  }): void {
    this.send(GatewayOpcode.RequestGuildMembers, {
      guild_id: guildId,
      query: options?.query ?? '',
      limit: options?.limit ?? 0,
      presences: options?.presences ?? false,
    });
  }

  // ── Event System ──────────────────────────────────────────────

  /** Subscribe to a gateway event */
  on<T extends string>(
    event: T,
    handler: GatewayEventHandler
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as GatewayEventHandler);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(handler as GatewayEventHandler);
    };
  }

  /** Emit a custom internal event */
  private emit(event: string, data?: unknown): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((h) => h(data));
    }
  }

  /** Remove all event listeners */
  off(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────

  private attemptResume(): void {
    if (!this.sessionId) {
      this.connect();
      return;
    }

    this._state = 'connecting';
    this.emit('stateChange', this._state);
    this.reconnectAttempts++;

    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      this._state = 'disconnected';
      this.emit('stateChange', this._state);
      return;
    }

    const delay = this.RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempts - 1);
    setTimeout(() => this.connect(), delay);
  }

  private attemptReconnect(): void {
    this.reconnectAttempts++;
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      this._state = 'disconnected';
      this.emit('stateChange', this._state);
      return;
    }

    const delay = this.RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempts - 1);
    this._state = 'connecting';
    this.emit('stateChange', this._state);

    setTimeout(() => this.connect(), delay);
  }

  /** Disconnect from the gateway */
  disconnect(): void {
    this.clearHeartbeat();
    this.reconnectAttempts = this.MAX_RECONNECT_ATTEMPTS; // Prevent auto-reconnect
    this.ws?.close(1000, 'Client disconnected');
    this.ws = null;
    this._state = 'disconnected';
    this.emit('stateChange', this._state);
  }
}

// Singleton factory (per token)
const clients = new Map<string, GatewayClient>();

export function getGatewayClient(token?: string): GatewayClient {
  const t = token || process.env.DISCORD_BOT_TOKEN;
  if (!t) throw new Error('DISCORD_BOT_TOKEN is not set');
  if (!clients.has(t)) {
    clients.set(t, new GatewayClient(t));
  }
  return clients.get(t)!;
}