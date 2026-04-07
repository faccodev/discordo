"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { ChatArea } from "@/components/chat/chat-area";

export default function ChannelPage() {
  const params = useParams();
  const router = useRouter();
  const { setSelectedChannel, dms } = useUIStore();

  const channelId = params.channelId as string;

  useEffect(() => {
    if (channelId) {
      setSelectedChannel(channelId);
    }
  }, [channelId, setSelectedChannel]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ChatArea channelId={channelId} />
    </div>
  );
}
