import { describe, it, expect, beforeEach } from 'vitest';
import { useCallStore, type Participant } from '@/stores/call-store';

describe('useCallStore', () => {
  beforeEach(() => {
    useCallStore.setState({
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
  });

  it('joins and leaves a call', () => {
    useCallStore.getState().joinCall('channel1', 'guild1');
    expect(useCallStore.getState().isInCall).toBe(true);
    expect(useCallStore.getState().callChannelId).toBe('channel1');
    expect(useCallStore.getState().callGuildId).toBe('guild1');

    useCallStore.getState().leaveCall();
    expect(useCallStore.getState().isInCall).toBe(false);
    expect(useCallStore.getState().callChannelId).toBe(null);
    expect(useCallStore.getState().callGuildId).toBe(null);
  });

  it('sets mute and deafen state', () => {
    expect(useCallStore.getState().selfMuted).toBe(false);
    expect(useCallStore.getState().selfDeafened).toBe(false);

    useCallStore.getState().setSelfMuted(true);
    expect(useCallStore.getState().selfMuted).toBe(true);
    useCallStore.getState().setSelfMuted(false);
    expect(useCallStore.getState().selfMuted).toBe(false);

    useCallStore.getState().setSelfDeafened(true);
    expect(useCallStore.getState().selfDeafened).toBe(true);
    useCallStore.getState().setSelfDeafened(false);
    expect(useCallStore.getState().selfDeafened).toBe(false);
  });

  it('sets video and screen share state', () => {
    expect(useCallStore.getState().selfVideoOn).toBe(false);
    useCallStore.getState().setSelfVideoOn(true);
    expect(useCallStore.getState().selfVideoOn).toBe(true);

    expect(useCallStore.getState().selfScreenShare).toBe(false);
    useCallStore.getState().setSelfScreenShare(true);
    expect(useCallStore.getState().selfScreenShare).toBe(true);
  });

  it('manages participants', () => {
    const participant: Participant = {
      userId: '123',
      username: 'TestUser',
      globalName: null,
      avatar: null,
      discriminator: '0001',
      deaf: false,
      mute: false,
      selfDeaf: false,
      selfMute: false,
      selfVideo: false,
      selfStream: false,
      suppress: false,
      sessionId: 'session1',
    };

    useCallStore.getState().addParticipant(participant);
    expect(useCallStore.getState().participants.get('123')).toEqual(participant);

    useCallStore.getState().updateParticipant('123', { mute: true });
    expect(useCallStore.getState().participants.get('123')?.mute).toBe(true);

    useCallStore.getState().removeParticipant('123');
    expect(useCallStore.getState().participants.has('123')).toBe(false);
  });

  it('sets voice server info', () => {
    useCallStore.getState().setVoiceServerInfo(
      'us-west1.discord.gg',
      'voice_token',
      'session_123'
    );
    expect(useCallStore.getState().voiceEndpoint).toBe('us-west1.discord.gg');
    expect(useCallStore.getState().voiceToken).toBe('voice_token');
    expect(useCallStore.getState().voiceSessionId).toBe('session_123');
  });
});
