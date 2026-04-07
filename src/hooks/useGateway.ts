'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getGatewayClient, GatewayClient } from '@/lib/gateway/gateway-client';
import {
  GatewayEvent,
  type GatewayConnectionState,
} from '@/lib/gateway/types';
import { useUIStore } from '@/stores/ui-store';

interface UseGatewayOptions {
  /** Auto-connect when Discord token is available */
  autoConnect?: boolean;
  /** Enable voice state tracking */
  trackVoiceStates?: boolean;
  /** Enable message events */
  trackMessages?: boolean;
}

interface UseGatewayReturn {
  state: GatewayConnectionState;
  client: GatewayClient | null;
  connect: () => void;
  disconnect: () => void;
  updateVoiceState: (guildId: string, channelId: string | null) => void;
  onVoiceStateUpdate: (handler: (payload: unknown) => void) => () => void;
  onVoiceServerUpdate: (handler: (payload: unknown) => void) => () => void;
  onReady: (handler: (payload: unknown) => void) => () => void;
}

export function useGateway(options: UseGatewayOptions = {}): UseGatewayReturn {
  const { autoConnect = true, trackVoiceStates = true } = options;
  const clientRef = useRef<GatewayClient | null>(null);
  const [state, setState] = useState<GatewayConnectionState>('disconnected');

  // Get token from Zustand store (set during login)
  const { currentUser } = useUIStore();

  // Initialize client
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_DISCORD_TOKEN && typeof window !== 'undefined') {
      // Client-side: token should come from session, not env
      // For now, we rely on the server-side token passed via cookie
      // The actual connection will use the server-provided token
    }
  }, []);

  const connect = useCallback(() => {
    if (clientRef.current && clientRef.current.state !== 'disconnected') return;

    try {
      const client = getGatewayClient();
      clientRef.current = client;

      client.on('stateChange', (newState) => {
        setState(newState as GatewayConnectionState);
      });

      client.connect();
    } catch (err) {
      console.error('[useGateway] Failed to get client:', err);
    }
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
    clientRef.current = null;
  }, []);

  const updateVoiceState = useCallback((guildId: string, channelId: string | null) => {
    clientRef.current?.updateVoiceState(guildId, channelId);
  }, []);

  const onVoiceStateUpdate = useCallback(
    (handler: (payload: unknown) => void) => {
      const client = clientRef.current;
      if (!client) return () => {};
      const unsubscribe = client.on(GatewayEvent.VoiceStateUpdate, handler);
      return unsubscribe;
    },
    []
  );

  const onVoiceServerUpdate = useCallback(
    (handler: (payload: unknown) => void) => {
      const client = clientRef.current;
      if (!client) return () => {};
      return client.on(GatewayEvent.VoiceServerUpdate, handler);
    },
    []
  );

  const onReady = useCallback(
    (handler: (payload: unknown) => void) => {
      const client = clientRef.current;
      if (!client) return () => {};
      return client.on(GatewayEvent.Ready, handler);
    },
    []
  );

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && typeof window !== 'undefined') {
      // Small delay to ensure client is ready
      const timer = setTimeout(() => connect(), 500);
      return () => clearTimeout(timer);
    }
  }, [autoConnect, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't disconnect on unmount — let it persist
    };
  }, []);

  return {
    state,
    client: clientRef.current,
    connect,
    disconnect,
    updateVoiceState,
    onVoiceStateUpdate,
    onVoiceServerUpdate,
    onReady,
  };
}