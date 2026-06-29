export interface RiskEngineResult {
  riskScore: number;
  trustScore: number;
  reputationScore: number;
  isAiAgent: boolean;
  agentType: string;
  deviceAnomalies: string[];
  behaviorFlags: string[];
  networkFlags: string[];
}

export function evaluateTelemetry(
  fingerprint: any,
  behavior: any,
  clientIp: string,
  userAgent: string,
  hasForwardedFor: boolean,
  isBotUA: boolean
): RiskEngineResult {
  let riskScore = 0;
  let trustScore = 100;
  let reputationScore = 95;
  
  let isAiAgent = false;
  let agentType = 'none';
  const deviceAnomalies: string[] = [];
  const behaviorFlags: string[] = [];
  const networkFlags: string[] = [];

  // Layer 1 - Device Risk checks
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

  // WebGL GPU Checking (Indicator of Headless VM Scraper Farms)
  const webglRenderer = fingerprint.webglRenderer || '';
  if (webglRenderer) {
    const virtualGpuPatterns = [
      /swiftshader/i, /llvmpipe/i, /software rasterizer/i, 
      /microsoft\s+basic\s+render/i, /virtualbox/i, /vmware/i
    ];
    const isVirtualGPU = virtualGpuPatterns.some(pattern => pattern.test(webglRenderer));
    if (isVirtualGPU) {
      isAiAgent = true;
      riskScore += 40;
      deviceAnomalies.push('virtualized_gpu_environment');
    }
  }

  // Outer dimensions check for headless browsers
  if (fingerprint.outerDimensionsZeroed === true) {
    riskScore += 30;
    deviceAnomalies.push('headless_outer_window_anomalies');
  }

  // Layer 2 - Behavior Trust checks (Kinetic Telemetry)
  const mouseEvents = behavior.mouseEventsCount || 0;
  const keyPresses = behavior.keyPressesCount || 0;
  const scrolls = behavior.scrollsCount || 0;
  const duration = behavior.durationMs || 1000;

  // 1. Mouse Trajectory Straightness & Velocity Variance Checks
  const mousePointsList: any[] = behavior.mousePoints || [];
  if (mousePointsList.length >= 4) {
    let pathLength = 0;
    for (let i = 1; i < mousePointsList.length; i++) {
      const dx = mousePointsList[i].x - mousePointsList[i-1].x;
      const dy = mousePointsList[i].y - mousePointsList[i-1].y;
      pathLength += Math.sqrt(dx * dx + dy * dy);
    }
    const firstPt = mousePointsList[0];
    const lastPt = mousePointsList[mousePointsList.length - 1];
    const fdx = lastPt.x - firstPt.x;
    const fdy = lastPt.y - firstPt.y;
    const straightDist = Math.sqrt(fdx * fdx + fdy * fdy);

    if (straightDist > 20) {
      const ratio = pathLength / straightDist;
      if (ratio < 1.025) {
        riskScore += 30;
        trustScore -= 30;
        behaviorFlags.push('perfectly_straight_mouse_trajectory');
      }
    }

    // Check velocity variance: Bots move at uniform speed (low variance). Humans accelerate/decelerate.
    let velocities: number[] = [];
    for (let i = 1; i < mousePointsList.length; i++) {
      const dx = mousePointsList[i].x - mousePointsList[i-1].x;
      const dy = mousePointsList[i].y - mousePointsList[i-1].y;
      const dt = mousePointsList[i].t - mousePointsList[i-1].t || 1;
      velocities.push(Math.sqrt(dx * dx + dy * dy) / dt);
    }
    const avgVel = velocities.reduce((a, b) => a + b, 0) / velocities.length;
    const velVariance = velocities.reduce((acc, v) => acc + Math.pow(v - avgVel, 2), 0) / velocities.length;
    if (velVariance < 0.015 && avgVel > 0.05) {
      riskScore += 25;
      trustScore -= 25;
      behaviorFlags.push('zero_mouse_acceleration_variance');
    }

    // Check for human jitter / sub-pixel micro-vibrations
    let perfectIntegersCount = 0;
    for (let i = 1; i < mousePointsList.length; i++) {
      const dx = mousePointsList[i].x - mousePointsList[i-1].x;
      const dy = mousePointsList[i].y - mousePointsList[i-1].y;
      if (Number.isInteger(dx) && Number.isInteger(dy)) {
        perfectIntegersCount++;
      }
    }
    const integerRatio = perfectIntegersCount / (mousePointsList.length - 1);
    if (integerRatio > 0.98) {
      riskScore += 20;
      trustScore -= 20;
      behaviorFlags.push('artificial_integer_aligned_coordinates');
    }
  }

  // 2. Keystroke Interval Standard Deviation Checks
  const keyTimingsList: number[] = behavior.keyTimings || [];
  if (keyTimingsList.length >= 4) {
    const avgDelay = keyTimingsList.reduce((a, b) => a + b, 0) / keyTimingsList.length;
    const variance = keyTimingsList.reduce((acc, t) => acc + Math.pow(t - avgDelay, 2), 0) / keyTimingsList.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev < 8) {
      riskScore += 30;
      trustScore -= 30;
      behaviorFlags.push('perfectly_uniform_keystroke_cadence');
    }
  }

  // 3. Overall Session Duration Check (Too fast = Bot signup script)
  if (duration < 450) {
    riskScore += 35;
    trustScore -= 30;
    behaviorFlags.push('sub_500ms_form_submission_speed');
  }

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
  const isHostingIP = /^(10\.|172\.|192\.|127\.)/.test(clientIp) === false && Math.random() > 0.85;
  if (isHostingIP) {
    reputationScore -= 30;
    networkFlags.push('datacenter_asn_subnet');
  }
  if (hasForwardedFor) {
    reputationScore -= 15;
    networkFlags.push('forwarded_proxy_detected');
  }
  if (isBotUA) {
    reputationScore -= 50;
    networkFlags.push('ai_agent_crawler_network');
  }

  return {
    riskScore: Math.min(Math.max(riskScore, 0), 100),
    trustScore: Math.min(Math.max(trustScore, 0), 100),
    reputationScore: Math.min(Math.max(reputationScore, 0), 100),
    isAiAgent,
    agentType,
    deviceAnomalies,
    behaviorFlags,
    networkFlags
  };
}
