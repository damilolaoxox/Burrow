import { NextRequest, NextResponse } from 'next/server';
import { normalizeHandle } from '@/lib/tasks';

// Serves a person's X profile picture from our own domain, so the
// miner card can draw it onto a downloadable PNG without CORS issues.
export async function GET(req: NextRequest) {
  const handle = normalizeHandle(req.nextUrl.searchParams.get('u'));
  if (!handle) return new NextResponse(null, { status: 400 });

  try {
    const res = await fetch(`https://unavatar.io/x/${handle}?fallback=false`, {
      headers: { 'User-Agent': 'BurrowWaitlist/1.0' },
      next: { revalidate: 60 * 60 * 24 },
    });
    const type = res.headers.get('content-type') || '';
    if (!res.ok || !type.startsWith('image/')) {
      return new NextResponse(null, { status: 404 });
    }
    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
