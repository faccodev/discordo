"use client";

import { useUIStore } from "@/stores/ui-store";
import { ChatArea } from "@/components/chat/chat-area";

export default function DashboardPage() {
  const { selectedChannelId } = useUIStore();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ChatArea />
    </div>
  );
}
