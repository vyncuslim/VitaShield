import type { VercelRequest, VercelResponse } from '@vercel/node';
import { evaluateTelemetry } from '../src/lib/riskEngine';

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

    // Validate Private API Key (Secret Key)
    if (secret && !secret.startsWith('vms_sec_')) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Invalid Secret API Key format.' });
    }

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

    // 2. Run Risk Engine v2 Layered Security Models using modular library
    const aiAgentPatterns = [
      /openai/i, /gptbot/i, /chatgpt/i, /chat-gpt/i, /claude/i, /anthropic/i,
      /google-extended/i, /googlebot/i, /bingbot/i, /crawler/i, /spider/i,
      /python-urllib/i, /axios/i, /headless/i, /puppeteer/i, /playwright/i,
      /selenium/i, /webdriver/i, /operator/i
    ];
    const isBotUA = aiAgentPatterns.some(pattern => pattern.test(userAgent));
    const hasForwardedFor = !!req.headers['x-forwarded-for'];

    const evaluation = evaluateTelemetry(
      fingerprint,
      behavior,
      clientIp,
      userAgent,
      hasForwardedFor,
      isBotUA
    );

    const {
      riskScore,
      trustScore,
      reputationScore,
      isAiAgent,
      agentType,
      deviceAnomalies,
      behaviorFlags,
      networkFlags
    } = evaluation;

    // 3. Make Adaptive Gate Decisions
    let decision: 'allow' | 'challenge' | 'block' = 'allow';
    if (riskScore >= 60 || isAiAgent) {
      decision = 'block';
    } else if (riskScore > 20 || trustScore < 65 || reputationScore < 75) {
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
                  webdriver: fingerprint.webdriverActive,
                  deviceAnomalies,
                  networkFlags,
                  reputationScore
                },
                behavior_metrics: {
                  mouseEvents,
                  keyPresses,
                  scrolls,
                  behaviorFlags,
                  trustScore
                }
              })
            });
          }
        }
      } catch (dbError) {
        console.error('Supabase write logging failed:', dbError);
      }
    }

    // 5. Output Risk Engine v2 Verification Payload Response
    return res.status(200).json({
      success: true,
      decision,
      scores: {
        risk_score: riskScore,
        trust_score: trustScore,
        reputation_score: reputationScore
      },
      detection_details: {
        is_ai_agent: isAiAgent,
        agent_type: agentType,
        device_anomalies: deviceAnomalies,
        behavior_flags: behaviorFlags,
        network_flags: networkFlags
      },
      // Backwards compatibility elements
      human_score: trustScore,
      risk_level: riskScore >= 60 ? 'high' : riskScore > 20 ? 'medium' : 'low',
      trust_and_reputation: {
        trust_score: trustScore,
        reputation: reputationScore >= 80 ? 'excellent' : reputationScore >= 50 ? 'suspicious' : 'dangerous',
        device_integrity: riskScore >= 60 ? 'compromised' : 'verified_device'
      },
      ai_agent_detection: {
        is_ai_agent: isAiAgent,
        agent_type: agentType,
        automation_likelihood: riskScore / 100
      }
    });

  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Internal gateway verification error.' });
  }
}
