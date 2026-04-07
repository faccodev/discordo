"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { Hash } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { selectedChannelId, setSelectedChannel, dms } = useUIStore();

  // On mount with no selected channel, redirect to first DM
  useEffect(() => {
    if (!selectedChannelId && dms.length > 0) {
      const firstDm = dms[0];
      setSelectedChannel(firstDm.id);
      router.push(`/channels/${firstDm.id}`);
    }
  }, [selectedChannelId, dms, setSelectedChannel, router]);

  if (!selectedChannelId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <Hash className="h-16 w-16 text-neutral-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Bem-vindo ao Discordo</h2>
        <p className="text-neutral-500 text-sm">Seleciona um canal ou DM para começar</p>
      </div>
    );
  }

  return null;
}
