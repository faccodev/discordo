'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar } from '@/components/ui/avatar';
import { X, Search, UserPlus, Loader2 } from 'lucide-react';
import type { DiscordUser } from '@/lib/discord/types';
import { cn } from '@/lib/utils';

interface CreateGroupModalProps {
  onClose: () => void;
}

export function CreateGroupModal({ onClose }: CreateGroupModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const overlayRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<DiscordUser[]>([]);
  const [step, setStep] = useState<'search' | 'name'>('search');

  // Focus input on mount
  useEffect(() => {
    if (step === 'search') {
      const timer = setTimeout(() => {
        document.querySelector<HTMLInputElement>('[data-search-input]')?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'name') {
      const timer = setTimeout(() => nameInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Close on Escape
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [onClose]);

  // Fetch recent DMs for search suggestions
  const { data: recentDMs } = useQuery<{ recipients: DiscordUser[] }[]>({
    queryKey: ['discord-dms'],
    queryFn: async () => {
      const res = await fetch('/api/discord/dms');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/discord/channels/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: selected.map((u) => u.id),
          name: name.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create group');
      }
      return res.json();
    },
    onSuccess: (channel) => {
      queryClient.invalidateQueries({ queryKey: ['discord-dms'] });
      onClose();
      router.push(`/channels/${(channel as { id: string }).id}`);
    },
  });

  const toggleUser = (user: DiscordUser) => {
    setSelected((prev) => {
      const exists = prev.find((u) => u.id === user.id);
      if (exists) return prev.filter((u) => u.id !== user.id);
      if (prev.length >= 10) return prev;
      return [...prev, user];
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Filter suggestions by search
  const suggestions = (recentDMs ?? [])
    .flatMap((dm) => dm.recipients ?? [])
    .filter((u) => !selected.find((s) => s.id === u.id))
    .filter((u) => {
      const query = search.toLowerCase();
      return (
        u.username.toLowerCase().includes(query) ||
        (u.global_name?.toLowerCase().includes(query) ?? false)
      );
    })
    .filter((u, idx, arr) => arr.findIndex((x) => x.id === u.id) === idx) // dedupe
    .slice(0, 8);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-sm border border-border-bright bg-bg-sidebar shadow-2xl shadow-primary/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-mono text-sm font-semibold text-primary">
            {step === 'search' ? '> CREATE_GROUP_DM' : '> NAME_GROUP'}
          </h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-sm text-text-dim hover:bg-bg-hover hover:text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {step === 'search' && (
            <>
              {/* Selected users */}
              {selected.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selected.map((u) => {
                    const name = u.global_name || u.username;
                    return (
                      <button
                        key={u.id}
                        onClick={() => toggleUser(u)}
                        className="flex items-center gap-1.5 rounded-sm border border-primary bg-primary/10 px-2 py-1 font-mono text-xs text-primary"
                      >
                        <img
                          src={
                            u.avatar
                              ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=20`
                              : undefined
                          }
                          alt=""
                          className="h-4 w-4 rounded-sm"
                        />
                        {name}
                        <X className="h-3 w-3" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
                <input
                  data-search-input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for people..."
                  className="w-full rounded-sm border border-border bg-bg py-2 pl-10 pr-4 font-mono text-sm text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                />
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-0.5">
                  {suggestions.map((user) => {
                    const name = user.global_name || user.username;
                    return (
                      <button
                        key={user.id}
                        onClick={() => toggleUser(user)}
                        className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left hover:bg-bg-hover transition-colors"
                      >
                        <Avatar
                          src={
                            user.avatar
                              ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32`
                              : undefined
                          }
                          alt={name}
                          userId={user.id}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-sm font-medium text-primary">{name}</p>
                          <p className="font-mono text-xs text-text-dim">@{user.username}</p>
                        </div>
                        <UserPlus className="h-4 w-4 text-text-dim" />
                      </button>
                    );
                  })}
                </div>
              )}

              {search && suggestions.length === 0 && (
                <p className="py-4 text-center font-mono text-sm text-text-dim">
                  No results for &ldquo;{search}&rdquo;
                </p>
              )}

              {!search && selected.length === 0 && (
                <p className="py-4 text-center font-mono text-sm text-text-dim">
                  Select people to add to your group
                </p>
              )}

              {/* Next button */}
              {selected.length > 0 && (
                <button
                  onClick={() => setStep('name')}
                  className="mt-4 w-full rounded-sm border border-primary bg-primary/10 py-2 font-mono text-sm font-medium text-primary hover:bg-primary hover:text-black transition-all"
                >
                  Continue with {selected.length} member{selected.length > 1 ? 's' : ''}
                </button>
              )}
            </>
          )}

          {step === 'name' && (
            <>
              {/* Selected summary */}
              <div className="mb-4 flex flex-wrap gap-2">
                {selected.map((u) => {
                  const name = u.global_name || u.username;
                  return (
                    <div key={u.id} className="flex items-center gap-1.5">
                      <Avatar
                        src={
                          u.avatar
                            ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=20`
                            : undefined
                        }
                        alt={name}
                        userId={u.id}
                        size="xs"
                      />
                      <span className="font-mono text-xs text-text-dim">{name}</span>
                    </div>
                  );
                })}
                <button
                  onClick={() => setStep('search')}
                  className="font-mono text-xs text-cyan hover:underline"
                >
                  Edit
                </button>
              </div>

              {/* Name input */}
              <div className="mb-4">
                <label className="mb-1.5 block font-mono text-xs font-semibold uppercase text-text-dim">
                  Group name (optional)
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Study Group, Weekend Plans"
                  maxLength={100}
                  className="w-full rounded-sm border border-border bg-bg py-2 px-3 font-mono text-sm text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                />
                <p className="mt-1 font-mono text-xs text-text-dim">{name.length}/100</p>
              </div>

              {createMutation.error && (
                <p className="mb-3 font-mono text-sm text-error">
                  {(createMutation.error as Error).message}
                </p>
              )}

              {/* Create button */}
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-sm border border-primary bg-primary/10 py-2 font-mono text-sm font-medium text-primary hover:bg-primary hover:text-black disabled:opacity-50 transition-all"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                [CREATE_GROUP_DM]
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}