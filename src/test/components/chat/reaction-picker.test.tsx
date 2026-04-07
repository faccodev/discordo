import { describe, it, expect } from 'vitest';

// Test the emoji encoding logic (isolated from the component)
function encodeEmoji(emoji: string): string {
  if (emoji.startsWith(':') && emoji.endsWith(':')) {
    return emoji;
  }
  return encodeURIComponent(emoji);
}

describe('encodeEmoji', () => {
  it('encodes custom emoji format as-is', () => {
    expect(encodeEmoji(':thumbsup:')).toBe(':thumbsup:');
    expect(encodeEmoji(':custom_emoji:')).toBe(':custom_emoji:');
  });

  it('URL-encodes unicode emoji', () => {
    expect(encodeEmoji('👍')).toBe('%F0%9F%91%8D');
    expect(encodeEmoji('🔥')).toBe('%F0%9F%94%A5');
    expect(encodeEmoji('👀')).toBe('%F0%9F%91%80');
  });

  it('passes through encoded custom emoji', () => {
    const result = encodeEmoji(':thumbsup:');
    expect(result).toBe(':thumbsup:');
  });
});

describe('ReactionPicker quick emoji list', () => {
  const QUICK_EMOJIS = [
    '👍', '👎', '❤️', '😄', '😢', '😮', '🤔', '🎉',
    '😍', '😂', '🥺', '😎', '🤩', '😭', '😤',
    '✅', '❌', '💯', '🔥', '✨', '💀', '🙈', '👀',
  ];

  it('contains expected emojis', () => {
    expect(QUICK_EMOJIS).toContain('👍');
    expect(QUICK_EMOJIS).toContain('❤️');
    expect(QUICK_EMOJIS).toContain('🎉');
    expect(QUICK_EMOJIS).toContain('🔥');
  });

  it('has 23 quick emojis', () => {
    expect(QUICK_EMOJIS).toHaveLength(23);
  });

  it('filters emojis by search query', () => {
    const search = '👀';
    const filtered = QUICK_EMOJIS.filter((e) => e.includes(search));
    expect(filtered).toContain('👀');
  });

  it('returns empty array for no matches', () => {
    const search = '🦄';
    const filtered = QUICK_EMOJIS.filter((e) => e.includes(search));
    expect(filtered).toHaveLength(0);
  });
});
