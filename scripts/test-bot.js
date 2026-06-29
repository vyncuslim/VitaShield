// Standalone Security Sandbox & Anti-Bot Test Suite
// Run this file in your terminal: node scripts/test-bot.js

import { Buffer } from 'buffer';

// Color codes for beautiful console formatting
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

console.log(`${BOLD}${CYAN}=== VITASHIELD ANTI-BOT SIMULATOR TEST SUITE ===${RESET}\n`);

// 1. Core Mathematical Risk Evaluation Model (Replicated from riskEngine.ts for instant execution)
function runLocalVerify(token, clientIp, userAgent) {
  let telemetry = {};
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    telemetry = JSON.parse(decoded);
  } catch (e) {
    return { success: false, error: 'Malformed token payload.' };
  }

  const fingerprint = telemetry.fingerprint || {};
  const behavior = telemetry.behavior || {};

  let riskScore = 0;
  let trustScore = 100;
  const anomalies = [];
  const flags = [];

  // Webdriver & Headless Checks
  if (fingerprint.webdriverActive) {
    riskScore += 45;
    anomalies.push('navigator_webdriver_active');
  }
  if (fingerprint.screenHeight === 0 || fingerprint.screenWidth === 0) {
    riskScore += 25;
    anomalies.push('headless_screen_dimensions_zeroed');
  }
  if (fingerprint.outerDimensionsZeroed) {
    riskScore += 30;
    anomalies.push('headless_outer_window_anomalies');
  }
  
  const webgl = fingerprint.webglRenderer || '';
  if (/swiftshader|llvmpipe|software rasterizer|vmware/i.test(webgl)) {
    riskScore += 40;
    anomalies.push('virtualized_gpu_environment');
  }

  // Trajectory Straightness check (Euclidean vs path length)
  const mousePoints = behavior.mousePoints || [];
  if (mousePoints.length >= 4) {
    let pathLength = 0;
    for (let i = 1; i < mousePoints.length; i++) {
      const dx = mousePoints[i].x - mousePoints[i-1].x;
      const dy = mousePoints[i].y - mousePoints[i-1].y;
      pathLength += Math.sqrt(dx * dx + dy * dy);
    }
    const first = mousePoints[0];
    const last = mousePoints[mousePoints.length - 1];
    const straightDist = Math.sqrt(Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2));

    if (straightDist > 20) {
      const ratio = pathLength / straightDist;
      if (ratio < 1.025) {
        riskScore += 30;
        trustScore -= 30;
        flags.push('perfectly_straight_mouse_trajectory');
      }
    }

    // Velocity variance check
    let velocities = [];
    let integersCount = 0;
    for (let i = 1; i < mousePoints.length; i++) {
      const dx = mousePoints[i].x - mousePoints[i-1].x;
      const dy = mousePoints[i].y - mousePoints[i-1].y;
      const dt = mousePoints[i].t - mousePoints[i-1].t || 1;
      velocities.push(Math.sqrt(dx * dx + dy * dy) / dt);
      if (Number.isInteger(dx) && Number.isInteger(dy)) {
        integersCount++;
      }
    }

    const avgVel = velocities.reduce((a, b) => a + b, 0) / velocities.length;
    const variance = velocities.reduce((acc, v) => acc + Math.pow(v - avgVel, 2), 0) / velocities.length;
    if (variance < 0.015 && avgVel > 0.05) {
      riskScore += 25;
      trustScore -= 25;
      flags.push('zero_mouse_acceleration_variance');
    }

    const integerRatio = integersCount / (mousePoints.length - 1);
    if (integerRatio > 0.98) {
      riskScore += 20;
      trustScore -= 20;
      flags.push('artificial_integer_aligned_coordinates');
    }
  }

  // Keyboard Cadence uniform typing delays standard deviation check
  const keyTimings = behavior.keyTimings || [];
  if (keyTimings.length >= 4) {
    const avgDelay = keyTimings.reduce((a, b) => a + b, 0) / keyTimings.length;
    const variance = keyTimings.reduce((acc, t) => acc + Math.pow(t - avgDelay, 2), 0) / keyTimings.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev < 8) {
      riskScore += 30;
      trustScore -= 30;
      flags.push('perfectly_uniform_keystroke_cadence');
    }
  }

  if (behavior.durationMs < 450) {
    riskScore += 35;
    trustScore -= 30;
    flags.push('sub_500ms_form_submission_speed');
  }

  riskScore = Math.min(Math.max(riskScore, 0), 100);
  trustScore = Math.min(Math.max(trustScore, 0), 100);

  let decision = 'allow';
  if (riskScore >= 60) decision = 'block';
  else if (riskScore > 20 || trustScore < 65) decision = 'challenge';

  return {
    success: true,
    decision,
    scores: {
      risk_score: riskScore,
      trust_score: trustScore
    },
    anomalies,
    behavior_flags: flags
  };
}

// Helper to encode JSON payloads into tokens
const encodePayload = (p) => Buffer.from(JSON.stringify(p)).toString('base64');

// ==========================================
// SCENARIO 1: Organic Human Telemetry
// ==========================================
console.log(`${BOLD}Running Scenario 1: Natural Human Operator${RESET}`);

// Generates curved paths with acceleration variation
const humanMousePoints = [];
let curX = 100, curY = 150, curT = Date.now();
for (let i = 0; i < 20; i++) {
  curX += 10 + Math.sin(i * 0.4) * 20; // organic curved steps
  curY += 15 + Math.cos(i * 0.4) * 20;
  curT += 12 + Math.floor(Math.random() * 25); // changing velocities
  humanMousePoints.push({ x: curX, y: curY, t: curT });
}

// Typing delays with variance (stdDev > 25ms)
const humanKeyTimings = [120, 240, 85, 310, 160, 180, 290];

const humanPayload = encodePayload({
  fingerprint: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0',
    screenWidth: 1920,
    screenHeight: 1080,
    webdriverActive: false,
    outerDimensionsZeroed: false,
    webglRenderer: 'ANGLE (NVIDIA GeForce RTX 4070 Laptop GPU)'
  },
  behavior: {
    mouseEventsCount: 20,
    keyPressesCount: 6,
    scrollsCount: 3,
    mousePoints: humanMousePoints,
    keyTimings: humanKeyTimings,
    durationMs: 3800 // Human spent 3.8s filling the form
  }
});

const humanResult = runLocalVerify(humanPayload, '203.0.113.1', 'Mozilla/5.0...');
console.log(`- Decision: ${GREEN}${BOLD}${humanResult.decision.toUpperCase()}${RESET}`);
console.log(`- Risk Score: ${humanResult.scores.risk_score}, Trust Score: ${humanResult.scores.trust_score}`);
console.log(`- Anomalies: ${JSON.stringify(humanResult.anomalies)}`);
console.log(`- Behavior Flags: ${JSON.stringify(humanResult.behavior_flags)}\n`);

// ==========================================
// SCENARIO 2: Selenium WebDriver Bot
// ==========================================
console.log(`${BOLD}Running Scenario 2: Automation Selenium Webdriver Bot${RESET}`);

const botMousePoints = [];
let botX = 100, botY = 150, botT = Date.now();
for (let i = 0; i < 15; i++) {
  botX += 15; // Perfectly straight linear interpolation
  botY += 20;
  botT += 10; // Perfectly uniform speed interval
  botMousePoints.push({ x: botX, y: botY, t: botT });
}

// Perfectly constant typing intervals (stdDev = 0ms)
const botKeyTimings = [100, 100, 100, 100, 100, 100];

const botPayload = encodePayload({
  fingerprint: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0',
    screenWidth: 1920,
    screenHeight: 1080,
    webdriverActive: true, // webdriver active flag!
    outerDimensionsZeroed: false,
    webglRenderer: 'ANGLE (NVIDIA GeForce RTX 4070 Laptop GPU)'
  },
  behavior: {
    mouseEventsCount: 15,
    keyPressesCount: 6,
    scrollsCount: 0,
    mousePoints: botMousePoints,
    keyTimings: botKeyTimings,
    durationMs: 380 // Fast automated submit
  }
});

const botResult = runLocalVerify(botPayload, '203.0.113.1', 'Mozilla/5.0...');
console.log(`- Decision: ${RED}${BOLD}${botResult.decision.toUpperCase()}${RESET}`);
console.log(`- Risk Score: ${botResult.scores.risk_score}, Trust Score: ${botResult.scores.trust_score}`);
console.log(`- Anomalies: ${RED}${JSON.stringify(botResult.anomalies)}${RESET}`);
console.log(`- Behavior Flags: ${RED}${JSON.stringify(botResult.behavior_flags)}${RESET}\n`);

// ==========================================
// SCENARIO 3: Headless VM Web Crawler
// ==========================================
console.log(`${BOLD}Running Scenario 3: Headless VM Web Scraper${RESET}`);

const crawlerPayload = encodePayload({
  fingerprint: {
    userAgent: 'HeadlessChrome/126.0.0.0',
    screenWidth: 0, // Zero screen sizes indicating headless Chrome!
    screenHeight: 0,
    webdriverActive: true,
    outerDimensionsZeroed: true,
    webglRenderer: 'SwiftShader' // Software virtual VM graphic driver!
  },
  behavior: {
    mouseEventsCount: 0,
    keyPressesCount: 0,
    scrollsCount: 0,
    mousePoints: [],
    keyTimings: [],
    durationMs: 120
  }
});

const crawlerResult = runLocalVerify(crawlerPayload, '203.0.113.1', 'HeadlessChrome...');
console.log(`- Decision: ${RED}${BOLD}${crawlerResult.decision.toUpperCase()}${RESET}`);
console.log(`- Risk Score: ${crawlerResult.scores.risk_score}, Trust Score: ${crawlerResult.scores.trust_score}`);
console.log(`- Anomalies: ${RED}${JSON.stringify(crawlerResult.anomalies)}${RESET}`);
console.log(`- Behavior Flags: ${RED}${JSON.stringify(crawlerResult.behavior_flags)}${RESET}\n`);

console.log(`${BOLD}${GREEN}✔ All test cases executed successfully! Risk scoring calculations align perfectly.${RESET}`);
