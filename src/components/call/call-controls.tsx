'use client';

import { useCallStore, type Participant } from '@/stores/call-store';
import { useUIStore } from '@/stores/ui-store';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  MoreHorizontal,
  UserPlus,
} from 'lucide-react';

interface CallControlsProps {
  className?: string;
}

export function CallControls({ className }: CallControlsProps) {
  const {
    isInCall,
    selfMuted,
    selfDeafened,
    selfVideoOn,
    selfScreenShare,
    participants,
    leaveCall,
    setSelfMuted,
    setSelfDeafened,
    setSelfVideoOn,
    setSelfScreenShare,
  } = useCallStore();

  if (!isInCall) return null;

  const participantCount = participants.size;

  return (
    <div className={cn('flex items-center gap-2 px-4 py-3 bg-[var(--color-bg-sidebar)] border-t border-[var(--color-border)]', className)}>
      {/* Participant avatars */}
      {participantCount > 0 && (
        <div className="flex items-center -space-x-2 mr-2">
          {Array.from(participants.values())
            .slice(0, 3)
            .map((p) => (
              <div key={p.userId} className="relative">
                <Avatar
                  src={p.avatar}
                  alt={p.globalName || p.username}
                  userId={p.userId}
                  size="xs"
                  className="ring-2 ring-[var(--color-border)]"
                />
                {/* Speaking indicator */}
                {!p.selfMute && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[var(--color-brand)] ring-1 ring-[var(--color-border)]" />
                )}
              </div>
            ))}
          {participantCount > 3 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-bg-hover)] font-mono text-xs font-medium text-[var(--color-text-secondary)] ring-2 ring-[var(--color-border)]">
              +{participantCount - 3}
            </div>
          )}
        </div>
      )}

      {/* Call controls */}
      <div className="flex items-center gap-1">
        {/* Mute */}
        <button
          onClick={() => setSelfMuted(!selfMuted)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
            selfMuted
              ? 'bg-[var(--color-error)] text-black hover:shadow-[0_0_8px_rgba(239,68,68,0.8)]'
              : 'bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] hover:bg-[rgba(62,207,142,0.1)]'
          )}
          title={selfMuted ? 'Unmute' : 'Mute'}
        >
          {selfMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>

        {/* Deafen */}
        <button
          onClick={() => setSelfDeafened(!selfDeafened)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
            selfDeafened
              ? 'bg-[var(--color-error)] text-black hover:shadow-[0_0_8px_rgba(239,68,68,0.8)]'
              : 'bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] hover:bg-[rgba(62,207,142,0.1)]'
          )}
          title={selfDeafened ? 'Undeafen' : 'Deafen'}
        >
          {selfDeafened ? (
            <HeadphoneOff className="h-4 w-4" />
          ) : (
            <Headphones className="h-4 w-4" />
          )}
        </button>

        {/* Video */}
        <button
          onClick={() => setSelfVideoOn(!selfVideoOn)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
            selfVideoOn
              ? 'bg-[var(--color-brand)] text-black hover:shadow-[0_0_8px_rgba(62,207,142,0.8)]'
              : 'bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] hover:bg-[rgba(62,207,142,0.1)]'
          )}
          title={selfVideoOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {selfVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </button>

        {/* Screen share */}
        <button
          onClick={() => setSelfScreenShare(!selfScreenShare)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
            selfScreenShare
              ? 'bg-[var(--color-brand)] text-black hover:shadow-[0_0_8px_rgba(62,207,142,0.8)]'
              : 'bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] hover:bg-[rgba(62,207,142,0.1)]'
          )}
          title={selfScreenShare ? 'Stop sharing' : 'Share screen'}
        >
          <Monitor className="h-4 w-4" />
        </button>

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-[var(--color-border)]" />

        {/* Leave call */}
        <button
          onClick={leaveCall}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-error)] text-black transition-colors hover:shadow-[0_0_8px_rgba(239,68,68,0.8)]"
          title="Leave call"
        >
          <PhoneOff className="h-4 w-4" />
        </button>
      </div>

      {/* Participant count */}
      <div className="ml-auto flex items-center gap-2">
        <span className="font-mono text-xs text-[var(--color-text-secondary)]">
          {participantCount + 1} in call
        </span>

        {/* More options */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] hover:bg-[rgba(62,207,142,0.1)] transition-colors"
          title="Call options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface ParticipantListProps {
  className?: string;
}

export function ParticipantList({ className }: ParticipantListProps) {
  const { isInCall, participants, selfMuted, selfDeafened, selfVideoOn } = useCallStore();
  const { currentUser } = useUIStore();

  if (!isInCall) return null;

  const sortedParticipants = Array.from(participants.values()).sort((a, b) => {
    // Self first
    if (a.userId === currentUser?.id) return -1;
    if (b.userId === currentUser?.id) return 1;
    // Then by speaking status
    if (!a.selfMute && b.selfMute) return -1;
    if (a.selfMute && !b.selfMute) return 1;
    return 0;
  });

  return (
    <div
      className={cn(
        'flex flex-col gap-1 p-3 max-h-64 overflow-y-auto border-t border-[var(--color-border)]',
        className
      )}
    >
      <p className="mb-2 font-mono text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
        In Call — {participants.size + 1}
      </p>

      {/* Self */}
      <ParticipantRow
        user={{
          id: currentUser?.id ?? 'me',
          username: currentUser?.username ?? 'You',
          global_name: currentUser?.global_name ?? null,
          avatar: currentUser?.avatar ?? null,
          discriminator: currentUser?.discriminator ?? '0',
        }}
        muted={selfMuted}
        deafened={selfDeafened}
        videoOn={selfVideoOn}
        isSelf
      />

      {/* Others */}
      {sortedParticipants.map((p) => (
        <ParticipantRow
          key={p.userId}
          user={{
            id: p.userId,
            username: p.username,
            global_name: p.globalName,
            avatar: p.avatar,
            discriminator: p.discriminator,
          }}
          muted={p.selfMute}
          deafened={p.selfDeaf}
          videoOn={p.selfVideo}
          nickname={p.nickname}
        />
      ))}
    </div>
  );
}

function ParticipantRow({
  user,
  muted,
  deafened,
  videoOn,
  nickname,
  isSelf,
}: {
  user: { id: string; username: string; global_name: string | null; avatar: string | null; discriminator: string };
  muted: boolean;
  deafened: boolean;
  videoOn: boolean;
  nickname?: string | null;
  isSelf?: boolean;
}) {
  const name = nickname || user.global_name || user.username;
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : undefined;

  return (
    <div className="flex items-center gap-2 rounded-sm px-2 py-1 hover:bg-[var(--color-bg-hover)] transition-colors">
      <div className="relative">
        <Avatar
          src={avatarUrl}
          alt={name}
          userId={user.id}
          size="sm"
        />
        {/* Status dot */}
        {muted ? (
          <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 items-center justify-center rounded-full bg-[var(--color-error)] flex">
            <MicOff className="h-2.5 w-2.5 text-black" />
          </div>
        ) : (
          <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[var(--color-brand)] ring-1 ring-[var(--color-border)]" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-sm text-[var(--color-brand)]">
          {name}
          {isSelf && <span className="ml-1 text-[var(--color-text-secondary)]">(you)</span>}
        </p>
      </div>

      {/* Icons */}
      <div className="flex items-center gap-1">
        {deafened && <HeadphoneOff className="h-3 w-3 text-[var(--color-error)]" />}
        {muted && <MicOff className="h-3 w-3 text-[var(--color-error)]" />}
        {!videoOn && <VideoOff className="h-3 w-3 text-[var(--color-text-secondary)]" />}
      </div>
    </div>
  );
}