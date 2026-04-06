import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { getDiscordClient } from "@/lib/discord/client";

async function withAuth(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), client: null };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }), client: null };
  }

  try {
    const client = getDiscordClient();
    return { error: null, client };
  } catch {
    return { error: NextResponse.json({ error: "Discord not configured" }, { status: 500 }), client: null };
  }
}

export async function GET(request: NextRequest) {
  const auth = await withAuth(request);
  if (auth.error) return auth.error;

  try {
    const me = await auth.client!.getMe();
    return NextResponse.json(me);
  } catch (error) {
    console.error("Error fetching me:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
