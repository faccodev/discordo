import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/stores/ui-store';

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset store state
    useUIStore.setState({
      theme: 'dark',
      sidebarCollapsed: false,
      selectedGuildId: null,
      selectedChannelId: null,
      currentUser: null,
      guilds: [],
      channels: {},
      dms: [],
      expandedGuilds: [],
    });
  });

  it('toggles theme between dark and light', () => {
    expect(useUIStore.getState().theme).toBe('dark');
    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).toBe('light');
    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).toBe('dark');
  });

  it('sets theme explicitly', () => {
    useUIStore.getState().setTheme('light');
    expect(useUIStore.getState().theme).toBe('light');
    useUIStore.getState().setTheme('dark');
    expect(useUIStore.getState().theme).toBe('dark');
  });

  it('toggles sidebar collapsed state', () => {
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarCollapsed).toBe(true);
  });

  it('sets selected guild and channel', () => {
    useUIStore.getState().setSelectedGuild('123');
    expect(useUIStore.getState().selectedGuildId).toBe('123');
    useUIStore.getState().setSelectedChannel('456');
    expect(useUIStore.getState().selectedChannelId).toBe('456');
  });

  it('stores and retrieves current user', () => {
    const user = { id: '1', username: 'test', discriminator: '0001', avatar: null };
    useUIStore.getState().setCurrentUser(user);
    expect(useUIStore.getState().currentUser).toEqual(user);
  });

  it('caches guild channels', () => {
    const guildChannels = [{ id: '1', type: 0, name: 'general' }];
    useUIStore.getState().setChannels('guild1', guildChannels as never);
    expect(useUIStore.getState().getChannels('guild1')).toEqual(guildChannels);
    expect(useUIStore.getState().getChannels('guild2')).toEqual([]);
  });

  it('stores DMs', () => {
    const dms = [{ id: 'dm1', type: 1 }];
    useUIStore.getState().setDMs(dms as never);
    expect(useUIStore.getState().dms).toEqual(dms);
  });

  it('toggles guild expanded state', () => {
    expect(useUIStore.getState().isGuildExpanded('guild1')).toBe(false);
    useUIStore.getState().toggleGuildExpanded('guild1');
    expect(useUIStore.getState().isGuildExpanded('guild1')).toBe(true);
    useUIStore.getState().toggleGuildExpanded('guild1');
    expect(useUIStore.getState().isGuildExpanded('guild1')).toBe(false);
  });
});
