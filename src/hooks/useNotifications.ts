'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { DiscordMessage } from '@/lib/discord/types';

export type NotificationPermission = 'default' | 'granted' | 'denied';

interface UseNotificationsOptions {
  channelId: string;
  enabled?: boolean;
}

export function useNotifications({ channelId, enabled = true }: UseNotificationsOptions) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const queryClient = useQueryClient();
  const lastMessageIdRef = useRef<string | null>(null);

  // Check current permission on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    setPermission(Notification.permission as NotificationPermission);
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    const result = await Notification.requestPermission();
    setPermission(result as NotificationPermission);
    return result === 'granted';
  }, []);

  // Show a notification
  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permission !== 'granted') return;
      if (document.visibilityState === 'visible') return; // Only notify when tab is hidden

      try {
        const notification = new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: channelId,
          silent: false,
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);
      } catch {
        // Notification API failed — likely in an insecure context
      }
    },
    [permission, channelId]
  );

  // Poll for new messages and show notifications
  useEffect(() => {
    if (!enabled || permission !== 'granted') return;

    const interval = setInterval(async () => {
      if (document.visibilityState === 'visible') return; // Skip if tab is visible

      try {
        const res = await fetch(`/api/discord/channels/${channelId}/messages?limit=1`);
        if (!res.ok) return;

        const messages: DiscordMessage[] = await res.json();
        const latestMessage = messages[0];

        if (!latestMessage) return;

        const newMessageId = latestMessage.id;
        if (lastMessageIdRef.current && newMessageId !== lastMessageIdRef.current) {
          const authorName =
            latestMessage.member?.nick ||
            latestMessage.author.global_name ||
            latestMessage.author.username;

          // Don't notify for own messages
          const me = queryClient.getQueryData<{ id: string }>(['discord-me']);
          if (me && latestMessage.author.id === me.id) {
            lastMessageIdRef.current = newMessageId;
            return;
          }

          const preview =
            latestMessage.content?.slice(0, 100) ||
            (latestMessage.attachments?.length
              ? `📎 ${latestMessage.attachments[0].filename}`
              : latestMessage.embeds?.length
              ? latestMessage.embeds[0].title || 'Link'
              : '');

          const avatarUrl = latestMessage.author.avatar
            ? `https://cdn.discordapp.com/avatars/${latestMessage.author.id}/${latestMessage.author.avatar}.png?size=32`
            : undefined;

          showNotification(`${authorName}`, {
            body: preview,
            tag: newMessageId,
            icon: avatarUrl,
            badge: avatarUrl,
          });
        }

        lastMessageIdRef.current = newMessageId;
      } catch {
        // Silently fail polling
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [enabled, permission, channelId, showNotification, queryClient]);

  return {
    permission,
    requestPermission,
    showNotification,
  };
}
