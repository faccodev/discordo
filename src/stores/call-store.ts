import { create } from 'zustand';
import type { DiscordUser } from '@/lib/discord/types';

export interface Participant {
  userId: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  discriminator: string;
  nickname?: string | null;
  roles?: string[];
  deaf: boolean;
  mute: boolean;
  selfDeaf: boolean;
  selfMute: boolean;
  selfVideo: boolean;
  selfStream: boolean;
  suppress: boolean;
  sessionId: string;
}

export interface CallState {
  // Connection status
  isInCall: boolean;
  callChannelId: string | null;
  callGuildId: string | null;

  // Self state
  selfMuted: boolean;
  selfDeafened: boolean;
  selfVideoOn: boolean;
  selfScreenShare: boolean;

  // Participants
  participants: Map<string, Participant>;

  // Voice server info (from VOICE_SERVER_UPDATE)
  voiceEndpoint: string | null;
  voiceToken: string | null;
  voiceSessionId: string | null;

  // Actions
  joinCall: (channelId: string, guildId: string) => void;
  leaveCall: () => void;
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (p: Participant) => void;
  removeParticipant: (userId: string) => void;
  updateParticipant: (userId: string, updates: Partial<Participant>) => void;
  setSelfMuted: (muted: boolean) => void;
  setSelfDeafened: (deafened: boolean) => void;
  setSelfVideoOn: (on: boolean) => void;
  setSelfScreenShare: (on: boolean) => void;
  setVoiceServerInfo: (endpoint: string, token: string, sessionId: string) => void;
}

export const useCallStore = create<CallState>()((set, get) => ({
  isInCall: false,
  callChannelId: null,
  callGuildId: null,
  selfMuted: false,
  selfDeafened: false,
  selfVideoOn: false,
  selfScreenShare: false,
  participants: new Map(),
  voiceEndpoint: null,
  voiceToken: null,
  voiceSessionId: null,

  joinCall: (channelId, guildId) => {
    set({
      isInCall: true,
      callChannelId: channelId,
      callGuildId: guildId,
      selfMuted: false,
      selfDeafened: false,
      selfVideoOn: false,
      selfScreenShare: false,
      participants: new Map(),
    });
  },

  leaveCall: () => {
    set({
      isInCall: false,
      callChannelId: null,
      callGuildId: null,
      selfMuted: false,
      selfDeafened: false,
      selfVideoOn: false,
      selfScreenShare: false,
      participants: new Map(),
      voiceEndpoint: null,
      voiceToken: null,
      voiceSessionId: null,
    });
  },

  setParticipants: (participants) => {
    const map = new Map<string, Participant>();
    participants.forEach((p) => map.set(p.userId, p));
    set({ participants: map });
  },

  addParticipant: (p) => {
    const { participants } = get();
    const newMap = new Map(participants);
    newMap.set(p.userId, p);
    set({ participants: newMap });
  },

  removeParticipant: (userId) => {
    const { participants } = get();
    const newMap = new Map(participants);
    newMap.delete(userId);
    set({ participants: newMap });
  },

  updateParticipant: (userId, updates) => {
    const { participants } = get();
    const existing = participants.get(userId);
    if (!existing) return;
    const newMap = new Map(participants);
    newMap.set(userId, { ...existing, ...updates });
    set({ participants: newMap });
  },

  setSelfMuted: (muted) => set({ selfMuted: muted }),
  setSelfDeafened: (deafened) => set({ selfDeafened: deafened }),
  setSelfVideoOn: (on) => set({ selfVideoOn: on }),
  setSelfScreenShare: (on) => set({ selfScreenShare: on }),

  setVoiceServerInfo: (endpoint, token, sessionId) => {
    set({ voiceEndpoint: endpoint, voiceToken: token, voiceSessionId: sessionId });
  },
}));