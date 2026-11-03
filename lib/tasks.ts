// SERVER-ONLY. Never import this from a client component: it holds the
// minimum task times and the signing secret.
import { createHmac, timingSafeEqual } from 'crypto';

export const TASK_IDS = ['like', 'repost', 'reply', 'follow'] as const;
export type TaskId = (typeof TASK_IDS)[number];

// Minimum seconds between tapping GO and tapping CONFIRM for each task.
// Confirming faster than this is rejected. Not shown anywhere on the site.
const MIN_SECONDS: Record<TaskId, number> = {
  like: 4,
  repost: 3,
  reply: 5,
  follow: 4,
};

// A GO ticket expires after this long; the person has to tap GO again.
const TICKET_MAX_AGE_MS = 30 * 60 * 1000;

const SECRET =
  process.env.TASK_SECRET ||
  process.env.ADMIN_SECRET_KEY ||
  'burrow-dev-task-secret-change-me';

export function isTaskId(v: unknown): v is TaskId {
  return typeof v === 'string' && (TASK_IDS as readonly string[]).includes(v);
}

export function normalizeHandle(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const h = raw.trim().replace(/^@/, '');
  return /^[A-Za-z0-9_]{1,15}$/.test(h) ? h : null;
}

function sign(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verify(token: unknown): any | null {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = createHmac('sha256', SECRET).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString());
  } catch {
    return null;
  }
}

/** Issued when the person taps GO. Records the start time server-side. */
export function createTicket(task: TaskId, handle: string): string {
  return sign({ k: 'go', t: task, h: handle.toLowerCase(), s: Date.now() });
}

export type ConfirmResult =
  | { ok: true; proof: string }
  | { ok: false; reason: 'invalid' | 'too_soon' | 'expired' | 'bad_link' };

/**
 * Accepts x.com / twitter.com links like https://x.com/<username>/status/<id>
 * and returns a clean link, only if the username matches the person's.
 */
export function normalizeReplyUrl(raw: unknown, handle: string): string | null {
  if (typeof raw !== 'string') return null;
  const m = raw
    .trim()
    .match(/^(?:https?:\/\/)?(?:www\.|mobile\.)?(?:x|twitter)\.com\/([A-Za-z0-9_]{1,15})\/status\/(\d{5,25})/i);
  if (!m || m[1].toLowerCase() !== handle.toLowerCase()) return null;
  return `https://x.com/${m[1]}/status/${m[2]}`;
}

/** Called when the person taps CONFIRM. */
export function confirmTicket(ticket: unknown, replyUrl?: unknown): ConfirmResult {
  const p = verify(ticket);
  if (!p || p.k !== 'go' || !isTaskId(p.t) || typeof p.s !== 'number') {
    return { ok: false, reason: 'invalid' };
  }
  const elapsed = Date.now() - p.s;
  if (elapsed > TICKET_MAX_AGE_MS) return { ok: false, reason: 'expired' };

  let url: string | undefined;
  if (p.t === 'reply') {
    const clean = normalizeReplyUrl(replyUrl, p.h);
    if (!clean) return { ok: false, reason: 'bad_link' };
    url = clean;
  }

  if (elapsed < MIN_SECONDS[p.t as TaskId] * 1000) return { ok: false, reason: 'too_soon' };
  return { ok: true, proof: sign({ k: 'done', t: p.t, h: p.h, c: Date.now(), u: url }) };
}

/**
 * Checks the join request carries a valid completion proof for every task.
 * Returns the reply link on success, or null if any task is missing.
 */
export function checkProofs(proofs: unknown, handle: string): { replyUrl: string } | null {
  if (!proofs || typeof proofs !== 'object') return null;
  const h = handle.toLowerCase();
  let replyUrl = '';
  for (const t of TASK_IDS) {
    const p = verify((proofs as Record<string, unknown>)[t]);
    if (!p || p.k !== 'done' || p.t !== t || p.h !== h) return null;
    if (t === 'reply') {
      if (typeof p.u !== 'string') return null;
      replyUrl = p.u;
    }
  }
  return { replyUrl };
}
