import { NextRequest, NextResponse } from 'next/server';
import { confirmTicket } from '@/lib/tasks';

const MESSAGES = {
  invalid: 'Something went wrong. Tap GO and try the task again.',
  expired: 'That took too long. Tap GO and do the task again.',
  too_soon: "We couldn't confirm that yet. Finish the task on X, then tap CONFIRM again.",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const result = confirmTicket(body.ticket);
  if (!result.ok) {
    return NextResponse.json({ error: MESSAGES[result.reason], reason: result.reason }, { status: 400 });
  }
  return NextResponse.json({ proof: result.proof });
}
