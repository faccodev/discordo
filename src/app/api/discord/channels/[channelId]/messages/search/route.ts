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
  const query = searchParams.get("q");
  const pageSize = Math.min(parseInt(searchParams.get("limit") || "25"), 50);
  const cursor = searchParams.get("cursor") || undefined;

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: "Search query 'q' is required" },
      { status: 400 }
    );
  }

  try {
    const client = getDiscordClient();

    // Build search options
    const searchOptions: { limit?: number; before?: string } = {
      limit: pageSize,
    };

    if (cursor) {
      searchOptions.before = cursor;
    }

    const messages = await client.searchMessages(channelId, query.trim(), searchOptions);

    // Find next cursor (next page before message ID)
    let nextCursor: string | null = null;
    if (messages.length === pageSize && messages.length > 0) {
      nextCursor = messages[messages.length - 1].id;
    }

    return NextResponse.json({
      messages,
      nextCursor,
      query: query.trim(),
      total: messages.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed", details: String(error) },
      { status: 500 }
    );
  }
}