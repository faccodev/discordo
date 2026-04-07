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
    <div className={cn('flex items-center gap-2 px-4 py-3 bg-dark-bl', className)}>
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
                  className="ring-2 ring-dark-bl"
                />
                {/* Speaking indicator */}
                {!p.selfMute && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-dark-bl" />
                )}
              </div>
            ))}
          {participantCount > 3 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-dark-hover text-xs font-medium text-neutral-400 ring-2 ring-dark-bl">
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
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-dark-hover text-neutral-400 hover:text-white hover:bg-dark-active'
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
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-dark-hover text-neutral-400 hover:text-white hover:bg-dark-active'
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
              ? 'bg-blurple text-white hover:bg-blurple-dark'
              : 'bg-dark-hover text-neutral-400 hover:text-white hover:bg-dark-active'
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
              ? 'bg-blurple text-white hover:bg-blurple-dark'
              : 'bg-dark-hover text-neutral-400 hover:text-white hover:bg-dark-active'
          )}
          title={selfScreenShare ? 'Stop sharing' : 'Share screen'}
        >
          <Monitor className="h-4 w-4" />
        </button>

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-dark-hover" />

        {/* Leave call */}
        <button
          onClick={leaveCall}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
          title="Leave call"
        >
          <PhoneOff className="h-4 w-4" />
        </button>
      </div>

      {/* Participant count */}
      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-neutral-500">
          {participantCount + 1} in call
        </span>

        {/* More options */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-dark-hover text-neutral-400 hover:text-white hover:bg-dark-active transition-colors"
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
        'flex flex-col gap-1 p-3 max-h-64 overflow-y-auto border-t border-dark',
        className
      )}
    >
      <p className="mb-2 text-xs font-semibold uppercase text-neutral-500">
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
    <div className="flex items-center gap-2 rounded px-2 py-1 hover:bg-dark-hover transition-colors">
      <div className="relative">
        <Avatar
          src={avatarUrl}
          alt={name}
          userId={user.id}
          size="sm"
        />
        {/* Status dot */}
        {muted ? (
          <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 items-center justify-center rounded-full bg-red-500 flex">
            <MicOff className="h-2.5 w-2.5 text-white" />
          </div>
        ) : (
          <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-dark-bl" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-white">
          {name}
          {isSelf && <span className="ml-1 text-neutral-500">(you)</span>}
        </p>
      </div>

      {/* Icons */}
      <div className="flex items-center gap-1">
        {deafened && <HeadphoneOff className="h-3 w-3 text-red-500" />}
        {muted && <MicOff className="h-3 w-3 text-red-500" />}
        {!videoOn && <VideoOff className="h-3 w-3 text-neutral-500" />}
      </div>
    </div>
  );
}