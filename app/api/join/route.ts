import { NextRequest, NextResponse } from 'next/server';
import { isAddress, verifyMessage } from 'viem';
import { nanoid } from 'nanoid';
import { findByXId, findByWallet, joinWaitlist, getStats } from '@/lib/storage';
import { BURROW_CONFIG } from '@/lib/config';
import { checkProofs, normalizeHandle } from '@/lib/tasks';

// Simple in-memory IP rate limiter (5 requests per 10 minutes)
const ipRateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRateMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 15) {
    return false;
  }
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('cf-connecting-ip') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { xHandle, wallet, signature, nonce, taskProofs } = body;

    const cleanHandle = normalizeHandle(xHandle);
    if (!cleanHandle) {
      return NextResponse.json(
        { error: 'Please enter a valid X username (letters, numbers and _ only).' },
        { status: 400 }
      );
    }
    const xId = `x_${cleanHandle.toLowerCase()}`;

    const proofResult = checkProofs(taskProofs, cleanHandle);
    if (!proofResult) {
      return NextResponse.json(
        { error: 'Please complete all the tasks (Like, Repost, Reply, Follow) before joining.' },
        { status: 400 }
      );
    }

    if (!wallet || typeof wallet !== 'string' || !isAddress(wallet.toLowerCase())) {
      return NextResponse.json(
        { error: 'Please provide a valid EVM wallet address (0x...).' },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase() as `0x${string}`;

    // Check if X user has already joined
    const existingByX = await findByXId(xId);
    if (existingByX) {
      const { totalSignups } = await getStats();
      return NextResponse.json({
        success: true,
        alreadyJoined: true,
        entry: existingByX,
        position: existingByX.rank || 1,
        totalSignups,
        message: 'Welcome back! You are already registered on the Burrow waitlist.',
      });
    }

    // Check if wallet is already used
    const existingByWallet = await findByWallet(normalizedWallet);
    if (existingByWallet) {
      return NextResponse.json(
        { error: `Wallet ${normalizedWallet.slice(0, 6)}...${normalizedWallet.slice(-4)} is already registered with @${existingByWallet.x_handle}.` },
        { status: 400 }
      );
    }

    // Verify signature if provided
    if (signature && nonce) {
      try {
        const expectedMessage = `Join the Burrow waitlist\nX: @${cleanHandle}\nWallet: ${normalizedWallet}\nNonce: ${nonce}`;
        const isValid = await verifyMessage({
          address: normalizedWallet,
          message: expectedMessage,
          signature: signature as `0x${string}`,
        });

        if (!isValid) {
          return NextResponse.json(
            { error: 'Cryptographic wallet signature verification failed.' },
            { status: 400 }
          );
        }
      } catch (err: any) {
        return NextResponse.json(
          { error: `Signature verification failed: ${err.message || 'Invalid signature'}` },
          { status: 400 }
        );
      }
    }

    // Get referral code from cookie if present
    const referralCookie = req.cookies.get(BURROW_CONFIG.referral.cookieName)?.value || body.referredBy || null;

    // Generate unique 8-character referral code
    const refCode = nanoid(8);

    // Save entry and credit referrer
    const { entry, position } = await joinWaitlist({
      xId,
      xHandle: cleanHandle,
      xAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanHandle}`,
      wallet: normalizedWallet,
      refCode,
      referredBy: referralCookie,
      replyUrl: proofResult.replyUrl,
    });

    const { totalSignups } = await getStats();

    return NextResponse.json({
      success: true,
      entry,
      position,
      totalSignups,
      message: 'Successfully joined the Burrow waitlist!',
    });
  } catch (err: any) {
    console.error('Join error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error processing waitlist entry.' },
      { status: 500 }
    );
  }
}
