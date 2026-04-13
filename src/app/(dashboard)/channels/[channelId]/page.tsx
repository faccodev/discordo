"use client";

import { useEffect } from "react";
import { use } from "react";
import { useParams } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { ChatArea } from "@/components/chat/chat-area";

export default function ChannelPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const { channelId } = use(params);
  const { setSelectedChannel } = useUIStore();

  useEffect(() => {
    if (channelId) {
      setSelectedChannel(channelId);
    }
  }, [channelId, setSelectedChannel]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ChatArea channelId={channelId} />
    </div>
  );
}
