import { describe, it, expect } from 'vitest';
import { ChannelType, MessageType } from '@/lib/discord/types';
import type { Reaction, DiscordMessage, DiscordChannel } from '@/lib/discord/types';
import { GatewayOpcode, GatewayIntents } from '@/lib/gateway/types';

describe('ChannelType enum', () => {
  it('has correct values for key channel types', () => {
    expect(ChannelType.GUILD_TEXT).toBe(0);
    expect(ChannelType.DM).toBe(1);
    expect(ChannelType.GUILD_VOICE).toBe(2);
    expect(ChannelType.GROUP_DM).toBe(3);
    expect(ChannelType.GUILD_CATEGORY).toBe(4);
  });
});

describe('MessageType enum', () => {
  it('has correct values', () => {
    expect(MessageType.DEFAULT).toBe(0);
    expect(MessageType.RECIPIENT_ADD).toBe(1);
    expect(MessageType.RECIPIENT_REMOVE).toBe(2);
    expect(MessageType.REPLY).toBe(19);
    expect(MessageType.SLASH_COMMAND).toBe(20);
  });
});

describe('GatewayOpcode enum', () => {
  it('has correct values for key opcodes', () => {
    expect(GatewayOpcode.Dispatch).toBe(0);
    expect(GatewayOpcode.Heartbeat).toBe(1);
    expect(GatewayOpcode.Identify).toBe(2);
    expect(GatewayOpcode.VoiceStateUpdate).toBe(4);
    expect(GatewayOpcode.Resume).toBe(6);
    expect(GatewayOpcode.Hello).toBe(10);
    expect(GatewayOpcode.HeartbeatAck).toBe(11);
  });
});

describe('GatewayIntents flags', () => {
  it('has correct bitwise values', () => {
    expect(GatewayIntents.GUILDS).toBe(1 << 0);
    expect(GatewayIntents.GUILD_MESSAGES).toBe(1 << 9);
    expect(GatewayIntents.GUILD_VOICE_STATES).toBe(1 << 13);
    expect(GatewayIntents.DIRECT_MESSAGES).toBe(1 << 14);
  });

  it('can be combined with bitwise OR', () => {
    const combined = GatewayIntents.GUILDS | GatewayIntents.GUILD_MESSAGES;
    expect(combined).toBe((1 << 0) | (1 << 9));
    expect(combined & GatewayIntents.GUILDS).toBeTruthy();
    expect(combined & GatewayIntents.GUILD_MESSAGES).toBeTruthy();
  });
});

describe('Reaction type', () => {
  it('has correct shape', () => {
    const reaction: Reaction = {
      count: 5,
      me: true,
      emoji: { id: '123', name: '👍', animated: false },
    };
    expect(reaction.count).toBe(5);
    expect(reaction.me).toBe(true);
    expect(reaction.emoji.name).toBe('👍');
  });

  it('supports unicode emoji without id', () => {
    const reaction: Reaction = {
      count: 1,
      me: false,
      emoji: { id: null, name: '🔥' },
    };
    expect(reaction.emoji.id).toBe(null);
    expect(reaction.emoji.name).toBe('🔥');
  });
});

describe('DiscordMessage type', () => {
  it('has required fields', () => {
    const msg: DiscordMessage = {
      id: '123',
      channel_id: '456',
      author: { id: '1', username: 'test', discriminator: '0001', avatar: null },
      content: 'Hello',
      timestamp: new Date().toISOString(),
      type: MessageType.DEFAULT,
    };
    expect(msg.id).toBe('123');
    expect(msg.channel_id).toBe('456');
    expect(msg.content).toBe('Hello');
  });

  it('supports reactions array', () => {
    const msg: DiscordMessage = {
      id: '123',
      channel_id: '456',
      author: { id: '1', username: 'test', discriminator: '0001', avatar: null },
      content: 'With reactions',
      timestamp: new Date().toISOString(),
      type: MessageType.DEFAULT,
      reactions: [
        { count: 3, me: true, emoji: { id: null, name: '👍' } },
        { count: 1, me: false, emoji: { id: '789', name: 'custom' } },
      ],
    };
    expect(msg.reactions).toHaveLength(2);
    expect(msg.reactions![0].emoji.name).toBe('👍');
  });
});

describe('DiscordChannel type', () => {
  it('has correct structure for group DM', () => {
    const channel: DiscordChannel = {
      id: 'group1',
      type: ChannelType.GROUP_DM,
      name: 'My Group',
      recipients: [
        { id: '1', username: 'user1', discriminator: '0001', avatar: null },
        { id: '2', username: 'user2', discriminator: '0001', avatar: null },
      ],
    };
    expect(channel.type).toBe(ChannelType.GROUP_DM);
    expect(channel.name).toBe('My Group');
    expect(channel.recipients).toHaveLength(2);
  });
});
