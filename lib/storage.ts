import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import { BURROW_CONFIG } from './config';

export interface WaitlistEntry {
  id: string;
  x_id: string;
  x_handle: string;
  x_avatar?: string | null;
  wallet: string;
  ref_code: string;
  referred_by?: string | null;
  referrals: number;
  points: number;
  created_at: string;
  rank?: number;
}

// Fallback in-memory store for local testing and initial preview
let fallbackWaitlist: WaitlistEntry[] = [
  {
    id: 'f-1',
    x_id: 'seed_1',
    x_handle: 'MineMaster99',
    x_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=miner1',
    wallet: '0x1234567890123456789012345678901234567890',
    ref_code: 'goldrush1',
    referrals: 48,
    points: 250,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'f-2',
    x_id: 'seed_2',
    x_handle: 'TunnelRat',
    x_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=miner2',
    wallet: '0x2345678901234567890123456789012345678901',
    ref_code: 'pickaxe2',
    referrals: 36,
    points: 190,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'f-3',
    x_id: 'seed_3',
    x_handle: 'DeepDriller',
    x_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=miner3',
    wallet: '0x3456789012345678901234567890123456789012',
    ref_code: 'dynamite',
    referrals: 29,
    points: 155,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'f-4',
    x_id: 'seed_4',
    x_handle: 'RobinhoodApe',
    x_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=miner4',
    wallet: '0x4567890123456789012345678901234567890123',
    ref_code: 'hoodchain',
    referrals: 21,
    points: 115,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'f-5',
    x_id: 'seed_5',
    x_handle: 'PixelMinerX',
    x_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=miner5',
    wallet: '0x5678901234567890123456789012345678901234',
    ref_code: 'burrow88',
    referrals: 19,
    points: 105,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'f-6',
    x_id: 'seed_6',
    x_handle: 'OreCrusher',
    x_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=miner6',
    wallet: '0x6789012345678901234567890123456789012345',
    ref_code: 'crusher7',
    referrals: 15,
    points: 85,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'f-7',
    x_id: 'seed_7',
    x_handle: 'SatoshiSpade',
    x_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=miner7',
    wallet: '0x7890123456789012345678901234567890123456',
    ref_code: 'spade404',
    referrals: 12,
    points: 70,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'f-8',
    x_id: 'seed_8',
    x_handle: 'CaveDweller',
    x_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=miner8',
    wallet: '0x8901234567890123456789012345678901234567',
    ref_code: 'darkcave',
    referrals: 9,
    points: 55,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'f-9',
    x_id: 'seed_9',
    x_handle: 'GoldVein',
    x_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=miner9',
    wallet: '0x9012345678901234567890123456789012345678',
    ref_code: 'veinfinder',
    referrals: 7,
    points: 45,
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'f-10',
    x_id: 'seed_10',
    x_handle: 'LanternGlow',
    x_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=miner10',
    wallet: '0xa123456789012345678901234567890123456789',
    ref_code: 'lampflame',
    referrals: 5,
    points: 35,
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
];

// Helper to calculate rank given points & created_at
function calculateRank(points: number, createdAt: string, all: WaitlistEntry[]): number {
  const higher = all.filter((item) => {
    if (item.points > points) return true;
    if (item.points === points && new Date(item.created_at) < new Date(createdAt)) return true;
    return false;
  });
  return higher.length + 1;
}

export async function findByXId(xId: string): Promise<WaitlistEntry | null> {
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('waitlist')
      .select('*')
      .eq('x_id', xId)
      .maybeSingle();
    return data;
  }
  return fallbackWaitlist.find((e) => e.x_id === xId) || null;
}

export async function findByWallet(wallet: string): Promise<WaitlistEntry | null> {
  const normalized = wallet.toLowerCase();
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('waitlist')
      .select('*')
      .eq('wallet', normalized)
      .maybeSingle();
    return data;
  }
  return fallbackWaitlist.find((e) => e.wallet.toLowerCase() === normalized) || null;
}

export async function findByRefCode(refCode: string): Promise<WaitlistEntry | null> {
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('waitlist')
      .select('*')
      .eq('ref_code', refCode)
      .maybeSingle();
    return data;
  }
  return fallbackWaitlist.find((e) => e.ref_code === refCode) || null;
}

export async function joinWaitlist({
  xId,
  xHandle,
  xAvatar,
  wallet,
  refCode,
  referredBy,
}: {
  xId: string;
  xHandle: string;
  xAvatar?: string;
  wallet: string;
  refCode: string;
  referredBy?: string | null;
}): Promise<{ entry: WaitlistEntry; position: number }> {
  const normalizedWallet = wallet.toLowerCase();
  const cleanHandle = xHandle.replace(/^@/, '');
  const startingPoints = BURROW_CONFIG.referral.startingPoints;

  if (isSupabaseConfigured && supabaseAdmin) {
    // Insert row
    const { data: newEntry, error } = await supabaseAdmin
      .from('waitlist')
      .insert({
        x_id: xId,
        x_handle: cleanHandle,
        x_avatar: xAvatar || null,
        wallet: normalizedWallet,
        ref_code: refCode,
        referred_by: referredBy || null,
        referrals: 0,
        points: startingPoints,
      })
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('waitlist')) {
        throw new Error("Supabase table 'waitlist' has not been created yet. Please execute the script in supabase/schema.sql in your Supabase SQL Editor.");
      }
      throw new Error(error.message);
    }

    // Credit referrer if valid
    if (referredBy && referredBy !== refCode) {
      await supabaseAdmin.rpc('credit_referrer', { code: referredBy });
    }

    // Calculate position
    const { count: higherCount } = await supabaseAdmin
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .or(`points.gt.${newEntry.points},and(points.eq.${newEntry.points},created_at.lt.${newEntry.created_at})`);

    const position = (higherCount || 0) + 1;
    return { entry: newEntry, position };
  }

  // Fallback in-memory
  const newEntry: WaitlistEntry = {
    id: `entry-${Date.now()}`,
    x_id: xId,
    x_handle: cleanHandle,
    x_avatar: xAvatar || null,
    wallet: normalizedWallet,
    ref_code: refCode,
    referred_by: referredBy || null,
    referrals: 0,
    points: startingPoints,
    created_at: new Date().toISOString(),
  };

  // Credit referrer
  if (referredBy && referredBy !== refCode) {
    const referrer = fallbackWaitlist.find((e) => e.ref_code === referredBy);
    if (referrer) {
      referrer.referrals += 1;
      referrer.points += BURROW_CONFIG.referral.pointsPerReferral;
    }
  }

  fallbackWaitlist.unshift(newEntry);
  const position = calculateRank(newEntry.points, newEntry.created_at, fallbackWaitlist);

  return { entry: newEntry, position };
}

export async function getStats() {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { count: totalSignups, error: countErr } = await supabaseAdmin
        .from('waitlist')
        .select('*', { count: 'exact', head: true });

      if (!countErr) {
        return {
          totalSignups: (totalSignups || 0) + 1240, // Base marketing seed offset
          realCount: totalSignups || 0,
          isLiveDb: true,
        };
      }
    } catch (err) {
      console.warn('Supabase query error:', err);
    }
  }

  // Fallback in-memory
  return {
    totalSignups: fallbackWaitlist.length + 1284,
    realCount: fallbackWaitlist.length,
    isLiveDb: false,
  };
}

export async function getAllWaitlistForExport(): Promise<WaitlistEntry[]> {
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('waitlist')
      .select('*')
      .order('points', { ascending: false })
      .order('created_at', { ascending: true });

    return (data || []).map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }

  const sorted = [...fallbackWaitlist].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return sorted.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}
