import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { getDiscordClient } from "@/lib/discord/client";

// GET /api/discord/unread - fetch last_message_id for multiple channels
export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const channelIds = searchParams.get("channels")?.split(",") || [];

  if (channelIds.length === 0) {
    return NextResponse.json({ unread: {} });
  }

  try {
    const client = getDiscordClient();
    const results: Record<string, string | null> = {};

    // Fetch last message for each channel
    // Using Promise.all for parallel requests (max 10 concurrent)
    const batchSize = 10;
    for (let i = 0; i < channelIds.length; i += batchSize) {
      const batch = channelIds.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(async (channelId) => {
          const channel = await client.getChannel(channelId);
          return { channelId, lastMessageId: channel.last_message_id };
        })
      );

      batchResults.forEach((result, idx) => {
        if (result.status === "fulfilled") {
          results[result.value.channelId] = result.value.lastMessageId ?? null;
        } else {
          // Channel not accessible (e.g., no access to private channel)
          results[batch[idx]] = null;
        }
      });
    }

    return NextResponse.json({ unread: results });
  } catch (error) {
    console.error("Error fetching unread status:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread status" },
      { status: 500 }
    );
  }
}