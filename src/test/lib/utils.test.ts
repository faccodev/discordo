import { describe, it, expect } from 'vitest';
import { formatRelativeTime, formatTimestamp, cn } from '@/lib/utils';

describe('formatTimestamp', () => {
  it('formats ISO timestamp', () => {
    const result = formatTimestamp('2024-01-15T10:30:00.000Z');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});

describe('formatRelativeTime', () => {
  it('handles recent timestamps', () => {
    const now = new Date();
    const recent = new Date(now.getTime() - 60 * 1000); // 1 minute ago
    const result = formatRelativeTime(recent.toISOString());
    expect(result).toBeTruthy();
  });

  it('handles old timestamps', () => {
    const old = new Date('2020-01-01T00:00:00.000Z');
    const result = formatRelativeTime(old.toISOString());
    expect(result).toBeTruthy();
  });
});

describe('cn (className merger)', () => {
  it('merges class names', () => {
    const result = cn('foo', 'bar');
    expect(result).toBe('foo bar');
  });

  it('filters falsy values', () => {
    const result = cn('foo', false, null, undefined, '', 'bar');
    expect(result).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    const result = cn('foo', true && 'bar', false && 'baz');
    expect(result).toBe('foo bar');
  });

  it('handles tailwind-merge objects', () => {
    const result = cn('px-2 py-1', { 'bg-red-500': true, 'bg-blue-500': false });
    expect(result).toBe('px-2 py-1 bg-red-500');
  });

  it('handles undefined inputs', () => {
    const result = cn('base', undefined, 'after');
    expect(result).toBe('base after');
  });
});
