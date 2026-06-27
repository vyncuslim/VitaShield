import type { VercelRequest, VercelResponse } from '@vercel/node';

// Fallback Supabase settings if environment variables are not set on Vercel yet
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qgoelcorfcqxberbayul.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { secret, token, ip } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Missing verification token.' });
    }

    // 1. Decode token payload (Base64 encrypted by client-side widget.js)
    let telemetry: any = {};
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      telemetry = JSON.parse(decoded);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid or malformed verification token.' });
    }

    const fingerprint = telemetry.fingerprint || {};
    const behavior = telemetry.behavior || {};
    const clientIp = ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = fingerprint.userAgent || req.headers['user-agent'] || '';

    // 2. Run Layered Security Heuristics
    let riskScore = 10; // Base safe score
    let reasons: string[] = [];

    // Layer 1 - User Agent / Headless checks
    const botPatterns = [/headless/i, /puppeteer/i, /playwright/i, /selenium/i, /webdriver/i, /openai/i, /chatgpt/i, /python/i, /curl/i, /wget/i];
    const isBotUA = botPatterns.some(pattern => pattern.test(userAgent));
    if (isBotUA) {
      riskScore += 65;
      reasons.push('automated_user_agent_signature');
    }

    // Layer 2 - Client integrity details
    if (fingerprint.screenHeight === 0 || fingerprint.screenWidth === 0) {
      riskScore += 20;
      reasons.push('headless_screen_dimensions');
    }
    if (fingerprint.webdriverActive === true) {
      riskScore += 40;
      reasons.push('navigator_webdriver_active');
    }

    // Layer 3 - Behavior Scan kinetics check
    if (behavior.mouseEventsCount === 0 && !fingerprint.isMobile) {
      riskScore += 35;
      reasons.push('zero_mouse_kinetics_detected');
    } else if (behavior.mouseEventsCount > 0 && behavior.mouseEventsCount < 3) {
      riskScore += 15;
      reasons.push('abnormally_low_mouse_dynamics');
    }

    // Cap score at 100
    riskScore = Math.min(riskScore, 100);

    // 3. Make Gate Decisions
    let decision: 'allow' | 'challenge' | 'block' = 'allow';
    if (riskScore > 60) {
      decision = 'block';
    } else if (riskScore > 20) {
      decision = 'challenge';
    }

    // 4. Log Session & Telemetry directly to Supabase REST API
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        // First, insert session
        const sessionResponse = await fetch(`${SUPABASE_URL}/rest/v1/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            status: decision === 'block' ? 'blocked' : 'active'
          })
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          const sessionId = sessionData[0]?.id;

          if (sessionId) {
            // Second, insert telemetry log
            await fetch(`${SUPABASE_URL}/rest/v1/telemetry_logs`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
              },
              body: JSON.stringify({
                session_id: sessionId,
                risk_score: riskScore,
                device_fingerprint: {
                  userAgent,
                  ipAddress: clientIp,
                  screenWidth: fingerprint.screenWidth,
                  screenHeight: fingerprint.screenHeight,
                  timezone: fingerprint.timezone,
                  webdriver: fingerprint.webdriverActive
                },
                behavior_metrics: {
                  mouseEvents: behavior.mouseEventsCount,
                  keyPresses: behavior.keyPressesCount,
                  scrolls: behavior.scrollsCount,
                  anomalies: reasons
                }
              })
            });
          }
        }
      } catch (dbError) {
        console.error('Supabase write logging failed:', dbError);
      }
    }

    // 5. Output Verification Payload Response
    return res.status(200).json({
      success: true,
      human_score: 100 - riskScore,
      risk_level: riskScore > 60 ? 'high' : riskScore > 20 ? 'medium' : 'low',
      decision,
      trust_and_reputation: {
        trust_score: Math.max(0, 100 - riskScore - 5),
        reputation: riskScore > 60 ? 'dangerous' : riskScore > 20 ? 'suspicious' : 'excellent',
        device_integrity: riskScore > 60 ? 'compromised' : 'verified_device'
      },
      ai_agent_detection: {
        is_ai_agent: isBotUA,
        agent_type: isBotUA ? 'crawler_or_operator' : 'none',
        automation_likelihood: riskScore / 100
      }
    });

  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Internal gateway verification error.' });
  }
}
