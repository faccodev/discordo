import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getDiscordClient } from '@/lib/discord/client';

async function authenticate(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), userId: null };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }), userId: null };
  }

  return { error: null, userId: payload.sub };
}

export async function POST(request: NextRequest) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { recipients, name, icon } = body;

    // Validate recipients
    if (!recipients || !Array.isArray(recipients) || recipients.length < 1) {
      return NextResponse.json(
        { error: 'At least one recipient is required' },
        { status: 400 }
      );
    }

    if (recipients.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 recipients in a group DM' },
        { status: 400 }
      );
    }

    const client = getDiscordClient();
    const channel = await client.createGroupDM(recipients, name, icon);
    return NextResponse.json(channel);
  } catch (error) {
    console.error('Create group DM error:', error);
    return NextResponse.json(
      { error: 'Failed to create group DM' },
      { status: 500 }
    );
  }
}