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

  return { error: null, userId: payload.sub, token };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const { guildId } = await params;

  try {
    // First, get the application_id from the user token via /oauth2/applications/@me
    const isUserToken = auth.token.length > 60 && auth.token.startsWith("MTI");
    const appRes = await fetch("https://discord.com/api/v10/oauth2/applications/@me", {
      headers: { Authorization: isUserToken ? auth.token : `Bearer ${auth.token}` },
    });

    if (!appRes.ok) {
      const err = await appRes.text();
      console.error("Failed to get application info:", err);
      return NextResponse.json({ error: "Failed to get application info" }, { status: 500 });
    }

    const appData = await appRes.json();
    const applicationId = appData.id;

    // Then get guild commands using bot token
    const client = getDiscordClient();
    const commands = await client.getGuildApplicationCommands(applicationId, guildId);

    return NextResponse.json(commands);
  } catch (error) {
    console.error("Error fetching guild commands:", error);
    return NextResponse.json(
      { error: "Failed to fetch guild commands" },
      { status: 500 }
    );
  }
}