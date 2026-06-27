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

    // 2. Run Risk Engine v2 Layered Security Models
    let riskScore = 0;
    let trustScore = 100;
    let reputationScore = 95;
    
    let isAiAgent = false;
    let agentType = 'none';
    let deviceAnomalies: string[] = [];
    let behaviorFlags: string[] = [];
    let networkFlags: string[] = [];

    // Layer 1 - Device Risk checks
    const aiAgentPatterns = [
      /openai/i, /gptbot/i, /chatgpt/i, /chat-gpt/i, /claude/i, /anthropic/i,
      /google-extended/i, /googlebot/i, /bingbot/i, /crawler/i, /spider/i,
      /python-urllib/i, /axios/i, /headless/i, /puppeteer/i, /playwright/i,
      /selenium/i, /webdriver/i, /operator/i
    ];
    
    const isBotUA = aiAgentPatterns.some(pattern => pattern.test(userAgent));
    if (isBotUA) {
      isAiAgent = true;
      riskScore += 70;
      deviceAnomalies.push('automated_ai_agent_signature');
      
      if (/openai|operator|gpt/i.test(userAgent)) {
        agentType = 'openai_operator';
      } else if (/claude|anthropic/i.test(userAgent)) {
        agentType = 'claude_operator';
      } else {
        agentType = 'automation_agent';
      }
    }

    if (fingerprint.screenHeight === 0 || fingerprint.screenWidth === 0) {
      riskScore += 25;
      deviceAnomalies.push('headless_screen_dimensions_zeroed');
    }
    if (fingerprint.webdriverActive === true) {
      isAiAgent = true;
      riskScore += 45;
      deviceAnomalies.push('navigator_webdriver_active');
    }

    // Layer 2 - Behavior Trust checks (Kinetic Telemetry)
    const mouseEvents = behavior.mouseEventsCount || 0;
    const keyPresses = behavior.keyPressesCount || 0;
    const scrolls = behavior.scrollsCount || 0;

    if (mouseEvents === 0 && !fingerprint.isMobile) {
      trustScore -= 50;
      behaviorFlags.push('zero_mouse_kinetics');
    } else if (mouseEvents > 0 && mouseEvents < 3) {
      trustScore -= 20;
      behaviorFlags.push('abnormally_low_mouse_dynamics');
    }
    
    if (keyPresses === 0 && !fingerprint.isMobile) {
      trustScore -= 15;
      behaviorFlags.push('zero_keystroke_cadence');
    }
    if (scrolls === 0) {
      trustScore -= 10;
      behaviorFlags.push('no_page_scroll_activity');
    }

    // Layer 3 - Network Reputation checks
    const isHostingIP = /^(10\.|172\.|192\.|127\.)/.test(clientIp) === false && Math.random() > 0.85; // Simulated proxy lookup
    if (isHostingIP) {
      reputationScore -= 30;
      networkFlags.push('datacenter_asn_subnet');
    }
    if (req.headers['x-forwarded-for']) {
      reputationScore -= 15;
      networkFlags.push('forwarded_proxy_detected');
    }
    if (isBotUA) {
      reputationScore -= 50;
      networkFlags.push('ai_agent_crawler_network');
    }

    // Normalize and cap scores between 0 and 100
    riskScore = Math.min(Math.max(riskScore, 0), 100);
    trustScore = Math.min(Math.max(trustScore, 0), 100);
    reputationScore = Math.min(Math.max(reputationScore, 0), 100);

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
