import { NextRequest, NextResponse } from 'next/server';
import { createTicket, isTaskId, normalizeHandle } from '@/lib/tasks';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const handle = normalizeHandle(body.handle);
  if (!handle) {
    return NextResponse.json({ error: 'Enter a valid X username first.' }, { status: 400 });
  }
  if (!isTaskId(body.task)) {
    return NextResponse.json({ error: 'Unknown task.' }, { status: 400 });
  }
  return NextResponse.json({ ticket: createTicket(body.task, handle) });
}
