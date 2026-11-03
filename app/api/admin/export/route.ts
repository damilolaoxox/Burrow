import { NextRequest, NextResponse } from 'next/server';
import { getAllWaitlistForExport } from '@/lib/storage';
import { BURROW_CONFIG } from '@/lib/config';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const key = searchParams.get('key') || req.headers.get('authorization')?.replace('Bearer ', '');
  const format = searchParams.get('format') || 'csv';

  const expectedKey = process.env.ADMIN_SECRET_KEY || BURROW_CONFIG.admin.defaultSecret;

  if (!key || key !== expectedKey) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid admin secret key. Provide ?key=your_secret' },
      { status: 401 }
    );
  }

  const data = await getAllWaitlistForExport();

  if (format === 'json') {
    return NextResponse.json({
      count: data.length,
      entries: data,
    });
  }

  // Generate CSV format specified in guide:
  // rank,x_handle,wallet,points,referrals,ref_code,referred_by,created_at
  const headers = ['Rank', 'X_Handle', 'Wallet_Address', 'Points', 'Referrals', 'Ref_Code', 'Referred_By', 'Reply_Link', 'Created_At'];
  const rows = data.map((item, idx) => [
    idx + 1,
    `@${item.x_handle}`,
    item.wallet,
    item.points,
    item.referrals,
    item.ref_code,
    item.referred_by || '',
    item.reply_url || '',
    item.created_at,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="burrow-waitlist-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
