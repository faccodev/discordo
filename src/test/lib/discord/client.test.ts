import { describe, it, expect } from 'vitest';
import { DiscordAPIError } from '@/lib/discord/client';

describe('DiscordAPIError', () => {
  it('creates error with status, body and endpoint', () => {
    const error = new DiscordAPIError(404, 'Not Found', '/channels/123');
    expect(error.status).toBe(404);
    expect(error.body).toBe('Not Found');
    expect(error.endpoint).toBe('/channels/123');
    expect(error.message).toContain('404');
    expect(error.message).toContain('/channels/123');
  });

  it('extends Error', () => {
    const error = new DiscordAPIError(500, 'Server Error', '/test');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('DiscordAPIError');
  });
});
