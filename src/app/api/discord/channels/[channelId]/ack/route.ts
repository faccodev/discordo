import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { getDiscordClient } from "@/lib/discord/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { channelId } = await params;

  try {
    const client = getDiscordClient();
    // Discord marks a channel as read by "ack-ing" the last message
    // We use the channels/@me/{channelId}/messages/{messageId}/ack endpoint
    // For simplicity, we get the latest message and ack it
    const messages = await client.getChannelMessages(channelId, { limit: 1 });
    const lastMessageId = messages[0]?.id;

    if (lastMessageId) {
      const ackEndpoint = `/channels/${channelId}/messages/${lastMessageId}/ack`;
      await fetch(`${process.env.DISCORD_API_BASE || "https://discord.com/api/v10"}${ackEndpoint}`, {
        method: "POST",
        headers: {
          Authorization: token.length > 60 && token.startsWith("MTI") ? token : `Bot ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: null }),
      });
    }

    return NextResponse.json({ success: true, lastMessageId });
  } catch (error) {
    console.error("Error marking channel read:", error);
    return NextResponse.json(
      { error: "Failed to mark channel read" },
      { status: 500 }
    );
  }
}
