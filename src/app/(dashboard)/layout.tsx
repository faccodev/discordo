"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ServerList } from "@/components/layout/server-list";
import { ChannelSidebar } from "@/components/layout/channel-sidebar";
import { MobileNav, MobileBottomBar } from "@/components/layout/mobile-nav";
import { ChatArea } from "@/components/chat/chat-area";
import { useUIStore } from "@/stores/ui-store";
import { Loader2 } from "lucide-react";
import type { DiscordChannel, DiscordGuild, DiscordUser } from "@/lib/discord/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const {
    setGuilds,
    setDMs,
    setCurrentUser,
  } = useUIStore();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { data: me, isError: meError } = useQuery<DiscordUser>({
    queryKey: ["discord-me"],
    queryFn: async () => {
      const res = await fetch("/api/discord/me");
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  const { data: guilds } = useQuery<DiscordGuild[]>({
    queryKey: ["discord-guilds"],
    queryFn: async () => {
      const res = await fetch("/api/discord/guilds");
      if (!res.ok) throw new Error("Failed to fetch guilds");
      return res.json();
    },
  });

  const { data: dms } = useQuery<DiscordChannel[]>({
    queryKey: ["discord-dms"],
    queryFn: async () => {
      const res = await fetch("/api/discord/dms");
      if (!res.ok) throw new Error("Failed to fetch DMs");
      return res.json();
    },
  });

  useEffect(() => {
    if (meError) {
      router.push("/login");
    }
  }, [meError, router]);

  useEffect(() => {
    if (me) setCurrentUser(me);
  }, [me, setCurrentUser]);

  useEffect(() => {
    if (guilds) setGuilds(guilds);
  }, [guilds, setGuilds]);

  useEffect(() => {
    if (dms) setDMs(dms);
  }, [dms, setDMs]);

  if (!me) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-dark">
        <Loader2 className="h-8 w-8 animate-spin text-blurple" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark">
      {/* Server List — hidden on mobile */}
      {!isMobile && <ServerList />}

      {/* Channel Sidebar — hidden on mobile (replaced by top bar) */}
      {!isMobile && <ChannelSidebar />}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile navigation */}
        {isMobile && <MobileNav />}

        {/* Page content */}
        <div className="flex flex-1 overflow-hidden">
          {children}
        </div>
      </div>

      {/* Mobile bottom bar */}
      {isMobile && <MobileBottomBar />}
    </div>
  );
}
