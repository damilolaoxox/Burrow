-- Burrow Waitlist Supabase Schema
-- Run this in the Supabase SQL Editor (https://app.supabase.com)

-- 1. Create waitlist table
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  x_id text unique not null,
  x_handle text not null,
  x_avatar text,
  wallet text unique,
  ref_code text unique not null,
  referred_by text,
  reply_url text,
  referrals int not null default 0,
  points int not null default 10,
  created_at timestamptz not null default now()
);

-- Adds the reply link column to a table created before it existed (safe to re-run)
alter table waitlist add column if not exists reply_url text;

-- 2. Indexes for fast leaderboards and referral queries
create index if not exists waitlist_rank on waitlist (points desc, created_at asc);
create index if not exists waitlist_ref_code on waitlist (ref_code);
create index if not exists waitlist_x_id on waitlist (x_id);
create index if not exists waitlist_wallet on waitlist (wallet);

-- 3. Row Level Security: Server-only access (via Supabase Service Role key)
alter table waitlist enable row level security;

-- 4. Credit referrer atomic function
create or replace function credit_referrer(code text) 
returns void as $$
begin
  update waitlist 
  set referrals = referrals + 1, 
      points = points + 5 
  where ref_code = code;
end;
$$ language plpgsql security definer;

-- 5. Optional Seed Data for initial testing
insert into waitlist (x_id, x_handle, x_avatar, wallet, ref_code, referrals, points, created_at)
values 
  ('seed_1', 'MineMaster99', 'https://api.dicebear.com/7.x/bottts/svg?seed=miner1', '0x1234567890123456789012345678901234567890', 'goldrush1', 48, 250, now() - interval '5 days'),
  ('seed_2', 'TunnelRat', 'https://api.dicebear.com/7.x/bottts/svg?seed=miner2', '0x2345678901234567890123456789012345678901', 'pickaxe2', 36, 190, now() - interval '4 days'),
  ('seed_3', 'DeepDriller', 'https://api.dicebear.com/7.x/bottts/svg?seed=miner3', '0x3456789012345678901234567890123456789012', 'dynamite', 29, 155, now() - interval '3 days'),
  ('seed_4', 'RobinhoodApe', 'https://api.dicebear.com/7.x/bottts/svg?seed=miner4', '0x4567890123456789012345678901234567890123', 'hoodchain', 21, 115, now() - interval '3 days'),
  ('seed_5', 'PixelMinerX', 'https://api.dicebear.com/7.x/bottts/svg?seed=miner5', '0x5678901234567890123456789012345678901234', 'burrow88', 19, 105, now() - interval '2 days'),
  ('seed_6', 'OreCrusher', 'https://api.dicebear.com/7.x/bottts/svg?seed=miner6', '0x6789012345678901234567890123456789012345', 'crusher7', 15, 85, now() - interval '2 days'),
  ('seed_7', 'SatoshiSpade', 'https://api.dicebear.com/7.x/bottts/svg?seed=miner7', '0x7890123456789012345678901234567890123456', 'spade404', 12, 70, now() - interval '1 day'),
  ('seed_8', 'CaveDweller', 'https://api.dicebear.com/7.x/bottts/svg?seed=miner8', '0x8901234567890123456789012345678901234567', 'darkcave', 9, 55, now() - interval '1 day'),
  ('seed_9', 'GoldVein', 'https://api.dicebear.com/7.x/bottts/svg?seed=miner9', '0x9012345678901234567890123456789012345678', 'veinfinder', 7, 45, now() - interval '12 hours'),
  ('seed_10', 'LanternGlow', 'https://api.dicebear.com/7.x/bottts/svg?seed=miner10', '0xa123456789012345678901234567890123456789', 'lampflame', 5, 35, now() - interval '6 hours')
on conflict do nothing;
