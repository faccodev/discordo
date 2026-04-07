import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { getDiscordClient } from "@/lib/discord/client";

async function authenticate(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), userId: null };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }), userId: null };
  }

  return { error: null, userId: payload.sub };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const { channelId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get("limit") || "50";
  const before = searchParams.get("before") || undefined;

  try {
    const client = getDiscordClient();
    const messages = await client.getChannelMessages(channelId, {
      limit: parseInt(limit, 10),
      before,
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const { channelId } = await params;

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // File upload via FormData
      const formData = await request.formData();
      const content = formData.get("content") as string | null;
      const files = formData.getAll("files") as File[];

      if (!content && files.length === 0) {
        return NextResponse.json({ error: "Content or files required" }, { status: 400 });
      }

      // Build FormData for Discord API — must NOT set Content-Type header manually
      const body = new FormData();
      if (content) body.append("content", content);
      for (const file of files) {
        body.append("files", file);
      }

      const discordToken = process.env.DISCORD_BOT_TOKEN!;
      const isUserToken = discordToken.length > 60 && discordToken.startsWith("MTI");
      const authHeader = isUserToken ? discordToken : `Bot ${discordToken}`;

      const res = await fetch(
        `https://discord.com/api/v10/channels/${channelId}/messages`,
        {
          method: "POST",
          headers: { Authorization: authHeader },
          body,
        }
      );

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Discord API ${res.status}: ${err}`);
      }
      return NextResponse.json(await res.json());
    } else {
      // JSON body (text only)
      const body = await request.json();
      const { content } = body;

      if (!content || typeof content !== "string") {
        return NextResponse.json({ error: "Content is required" }, { status: 400 });
      }

      if (content.length > 2000) {
        return NextResponse.json({ error: "Content too long (max 2000 chars)" }, { status: 400 });
      }

      const client = getDiscordClient();
      const message = await client.sendMessage(channelId, content);
      return NextResponse.json(message);
    }
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
