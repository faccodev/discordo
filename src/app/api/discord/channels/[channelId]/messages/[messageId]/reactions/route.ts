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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string; messageId: string }> }
) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const { channelId, messageId } = await params;
  const { emoji } = await request.json();

  if (!emoji || typeof emoji !== "string") {
    return NextResponse.json({ error: "emoji is required" }, { status: 400 });
  }

  try {
    const client = getDiscordClient();
    await client.addReaction(channelId, messageId, emoji);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error adding reaction:", error);
    return NextResponse.json({ error: "Failed to add reaction" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string; messageId: string }> }
) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const { channelId, messageId } = await params;
  const { emoji } = await request.json();

  if (!emoji || typeof emoji !== "string") {
    return NextResponse.json({ error: "emoji is required" }, { status: 400 });
  }

  try {
    const client = getDiscordClient();
    await client.deleteReaction(channelId, messageId, emoji);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error removing reaction:", error);
    return NextResponse.json({ error: "Failed to remove reaction" }, { status: 500 });
  }
}