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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string; userId: string }> }
) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const { channelId, userId } = await params;

  try {
    const client = getDiscordClient();
    await client.addRecipient(channelId, userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Add recipient error:', error);
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string; userId: string }> }
) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  const { channelId, userId } = await params;

  try {
    const client = getDiscordClient();
    await client.removeRecipient(channelId, userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Remove recipient error:', error);
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}