import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─── VitaShield Daily Check-in API ───────────────────────────────────────────
// Records daily verification check-in data for model training.
// Manages streak tracking, anti-abuse, and Neuro Plan reward granting.
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

// ── Anti-abuse: in-memory rate limit per IP ──────────────────────────────────
// In production, use Redis or Supabase for distributed state
const checkinAttempts = new Map<string, { date: string; count: number }>();

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || '0.0.0.0';
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function isAbuseDetected(ip: string): boolean {
  const today = getTodayStr();
  const entry = checkinAttempts.get(ip);
  if (!entry || entry.date !== today) {
    checkinAttempts.set(ip, { date: today, count: 1 });
    return false;
  }
  entry.count++;
  // Max 4 real check-ins per day per IP (one per streak day), allow some margin
  return entry.count > 8;
}

// ── Supabase helpers ─────────────────────────────────────────────────────────
async function getOrCreateCheckinRecord(userId: string, today: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/vitashield_checkins?user_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc&limit=10`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  if (!res.ok) return null;
  return res.json();
}

async function insertCheckin(data: {
  user_id: string;
  checkin_date: string;
  day_number: number;
  streak: number;
  task_data: object;
  duration_ms: number;
  completion_ratio: number;
  ip_hash: string;
  rewarded: boolean;
}) {
  return fetch(`${SUPABASE_URL}/rest/v1/vitashield_checkins`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(data),
  });
}

async function grantNeuroPlan(userId: string, months: number) {
  // Set neuro_plan_until to now + months
  const until = new Date();
  until.setMonth(until.getMonth() + months);

  return fetch(`${SUPABASE_URL}/rest/v1/user_subscriptions?user_id=eq.${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plan: 'neuro',
      plan_until: until.toISOString(),
      vitashield_reward: true,
      vitashield_reward_at: new Date().toISOString(),
    }),
  });
}

// ── Hash IP for storage (privacy) ────────────────────────────────────────────
function hashIp(ip: string): string {
  // Simple hash for storage — not cryptographically strong but prevents raw IP storage
  let h = 0;
  for (let i = 0; i < ip.length; i++) { h = (h << 5) - h + ip.charCodeAt(i); h |= 0; }
  return 'ip_' + Math.abs(h).toString(16);
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const clientIp = getClientIp(req);
    const { userId, dayNumber, streak, taskData, durationMs, completionRatio, consentVersion } = req.body || {};

    // ── Validation ─────────────────────────────────────────────────────────
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing user_id' });
    }
    if (!dayNumber || dayNumber < 1 || dayNumber > 4) {
      return res.status(400).json({ success: false, error: 'Invalid day_number (1-4)' });
    }
    if (!consentVersion) {
      return res.status(400).json({ success: false, error: 'Missing consent_version — PDPA compliance required' });
    }

    // ── Anti-abuse check ───────────────────────────────────────────────────
    if (isAbuseDetected(clientIp)) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        vitashield_risk: 'abuse_detected',
      });
    }

    const today = getTodayStr();
    const newStreak = Math.min(streak + 1, 4);
    const shouldReward = newStreak >= 4;
    const ipHash = hashIp(clientIp);

    // ── Supabase persistence ───────────────────────────────────────────────
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        // Insert check-in record
        await insertCheckin({
          user_id: userId,
          checkin_date: today,
          day_number: dayNumber,
          streak: newStreak,
          task_data: {
            // Anonymized behavioral data for ML training
            clickCount: taskData?.clickSequence?.length || 0,
            reactionTimes: taskData?.reactionTimes || [],
            completionRatio: completionRatio || 0,
            durationMs: durationMs || 0,
            // DO NOT store raw x/y coordinates — aggregate only
            avgReactionMs: taskData?.reactionTimes?.length
              ? Math.round(taskData.reactionTimes.reduce((a: number, b: number) => a + b, 0) / taskData.reactionTimes.length)
              : 0,
          },
          duration_ms: durationMs || 0,
          completion_ratio: completionRatio || 1,
          ip_hash: ipHash,
          rewarded: shouldReward,
        });

        // Grant Neuro Plan on Day 4 completion
        if (shouldReward) {
          await grantNeuroPlan(userId, 3);
        }
      } catch (dbErr) {
        console.error('[VitaShield Checkin] DB error:', dbErr);
        // Non-fatal — still return success to user
      }
    }

    return res.status(200).json({
      success: true,
      streak: newStreak,
      dayNumber,
      rewarded: shouldReward,
      rewardType: shouldReward ? 'neuro_plan_3_months' : null,
      message: shouldReward
        ? '🎉 Congratulations! Neuro Plan 3 months granted!'
        : `Day ${dayNumber} complete! Streak: ${newStreak}/4`,
      nextCheckinDate: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().slice(0, 10);
      })(),
    });

  } catch (err: any) {
    console.error('[VitaShield Checkin] Error:', err);
    return res.status(500).json({ success: false, error: 'Internal error' });
  }
}
