'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/ui-store';
import { useCallStore } from '@/stores/call-store';

interface ShortcutHandlers {
  openSearch?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers = {}) {
  const router = useRouter();
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const { isInCall, setSelfMuted, setSelfDeafened } = useCallStore();

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const target = e.target as HTMLElement;

      // Don't trigger shortcuts when typing in inputs/textareas (except Escape)
      const isTyping =
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'INPUT' ||
        target.isContentEditable;

      // Ctrl+K → Open search
      if (ctrl && e.key === 'k') {
        e.preventDefault();
        handlers.openSearch?.();
        return;
      }

      if (isTyping && e.key !== 'Escape') return;

      // Escape → blur/focus main
      if (e.key === 'Escape') {
        if (document.activeElement && document.activeElement !== document.body) {
          (document.activeElement as HTMLElement).blur();
        }
        return;
      }

      // Ctrl+Shift+U → Toggle mute (when in call)
      if (ctrl && shift && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        if (isInCall) setSelfMuted(!isInCall);
        return;
      }

      // Ctrl+Shift+D → Toggle deafen (when in call)
      if (ctrl && shift && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (isInCall) setSelfDeafened(!isInCall);
        return;
      }

      // Ctrl+Shift+L → Toggle light/dark mode
      if (ctrl && shift && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleTheme();
        return;
      }

      // Ctrl+, → Navigate to settings (placeholder)
      if (ctrl && e.key === ',') {
        e.preventDefault();
        // Future: router.push('/settings')
        return;
      }
    };

    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [handlers, toggleTheme, isInCall, setSelfMuted, setSelfDeafened]);
}