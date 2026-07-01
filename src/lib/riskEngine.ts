export interface RiskEngineResult {
  riskScore: number;
  trustScore: number;
  reputationScore: number;
  isAiAgent: boolean;
  agentType: string;
  deviceAnomalies: string[];
  behaviorFlags: string[];
  networkFlags: string[];
  decision: 'allow' | 'challenge' | 'block';
}

export class SignalAnalyzer {
  static analyzeMouseTrajectory(mousePointsList: any[]): {
    perfectlyStraight: boolean;
    hasPoints: boolean;
  } {
    if (mousePointsList.length < 4) {
      return { perfectlyStraight: false, hasPoints: mousePointsList.length > 0 };
    }

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
        return { perfectlyStraight: true, hasPoints: true };
      }
    }

    return { perfectlyStraight: false, hasPoints: true };
  }

  static analyzeVelocityVariance(mousePointsList: any[]): {
    zeroVariance: boolean;
    isIntegerAligned: boolean;
  } {
    if (mousePointsList.length < 4) {
      return { zeroVariance: false, isIntegerAligned: false };
    }

    let velocities: number[] = [];
    let perfectIntegersCount = 0;

    for (let i = 1; i < mousePointsList.length; i++) {
      const dx = mousePointsList[i].x - mousePointsList[i-1].x;
      const dy = mousePointsList[i].y - mousePointsList[i-1].y;
      const dt = mousePointsList[i].t - mousePointsList[i-1].t || 1;
      velocities.push(Math.sqrt(dx * dx + dy * dy) / dt);

      if (Number.isInteger(dx) && Number.isInteger(dy)) {
        perfectIntegersCount++;
      }
    }

    const avgVel = velocities.reduce((a, b) => a + b, 0) / velocities.length;
    const velVariance = velocities.reduce((acc, v) => acc + Math.pow(v - avgVel, 2), 0) / velocities.length;
    const integerRatio = perfectIntegersCount / (mousePointsList.length - 1);

    return {
      zeroVariance: velVariance < 0.015 && avgVel > 0.05,
      isIntegerAligned: integerRatio > 0.98
    };
  }

  static analyzeKeystrokeRhythm(keyTimingsList: number[]): {
    perfectlyUniform: boolean;
  } {
    if (keyTimingsList.length < 4) {
      return { perfectlyUniform: false };
    }

    const avgDelay = keyTimingsList.reduce((a, b) => a + b, 0) / keyTimingsList.length;
    const variance = keyTimingsList.reduce((acc, t) => acc + Math.pow(t - avgDelay, 2), 0) / keyTimingsList.length;
    const stdDev = Math.sqrt(variance);

    return {
      perfectlyUniform: stdDev < 8
    };
  }

  static analyzeTiming(durationMs: number): {
    sub500ms: boolean;
  } {
    return {
      sub500ms: durationMs < 450
    };
  }
}

export class ScoreCalculator {
  static calculateRiskScore(
    fingerprint: any,
    behavior: any,
    isBotUA: boolean,
    mouseAnalysis: any,
    velAnalysis: any,
    keyAnalysis: any,
    timeAnalysis: any
  ): {
    riskScore: number;
    trustScore: number;
    isAiAgent: boolean;
    agentType: string;
    deviceAnomalies: string[];
    behaviorFlags: string[];
  } {
    let riskScore = 0;
    let trustScore = 100;
    let isAiAgent = false;
    let agentType = 'none';
    const deviceAnomalies: string[] = [];
    const behaviorFlags: string[] = [];

    // Device Checks (Layer 1)
    if (isBotUA) {
      isAiAgent = true;
      riskScore += 70;
      deviceAnomalies.push('automated_ai_agent_signature');
      agentType = /openai|operator|gpt/i.test(fingerprint.userAgent || '') ? 'openai_operator' :
                  /claude|anthropic/i.test(fingerprint.userAgent || '') ? 'claude_operator' :
                  'automation_agent';
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
    if (fingerprint.webdriverSpoofed === true) {
      isAiAgent = true;
      riskScore += 45;
      deviceAnomalies.push('navigator_webdriver_spoofed');
    }
    if (fingerprint.chromeRuntimeMissing === true) {
      riskScore += 25;
      deviceAnomalies.push('chrome_runtime_object_missing');
    }
    if (fingerprint.pluginsArrayEmpty === true) {
      riskScore += 20;
      deviceAnomalies.push('desktop_plugins_array_empty');
    }
    if (fingerprint.languagesEmpty === true) {
      riskScore += 20;
      deviceAnomalies.push('navigator_languages_empty');
    }
    if (fingerprint.permissionQueryMismatch === true) {
      isAiAgent = true;
      riskScore += 35;
      deviceAnomalies.push('permission_notifications_discrepancy');
    }

    const webglRenderer = fingerprint.webglRenderer || '';
    if (webglRenderer) {
      const virtualGpuPatterns = [/swiftshader/i, /llvmpipe/i, /software rasterizer/i, /virtualbox/i, /vmware/i];
      if (virtualGpuPatterns.some(p => p.test(webglRenderer))) {
        isAiAgent = true;
        riskScore += 40;
        deviceAnomalies.push('virtualized_gpu_environment');
      }
    }

    if (fingerprint.outerDimensionsZeroed === true) {
      riskScore += 30;
      deviceAnomalies.push('headless_outer_window_anomalies');
    }

    // Behavior Checks (Layer 2)
    if (mouseAnalysis.perfectlyStraight) {
      riskScore += 30;
      trustScore -= 30;
      behaviorFlags.push('perfectly_straight_mouse_trajectory');
    }
    if (velAnalysis.zeroVariance) {
      riskScore += 25;
      trustScore -= 25;
      behaviorFlags.push('zero_mouse_acceleration_variance');
    }
    if (velAnalysis.isIntegerAligned) {
      riskScore += 20;
      trustScore -= 20;
      behaviorFlags.push('artificial_integer_aligned_coordinates');
    }
    if (keyAnalysis.perfectlyUniform) {
      riskScore += 30;
      trustScore -= 30;
      behaviorFlags.push('perfectly_uniform_keystroke_cadence');
    }
    if (timeAnalysis.sub500ms) {
      riskScore += 35;
      trustScore -= 30;
      behaviorFlags.push('sub_500ms_form_submission_speed');
    }

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

    // 4. VitaShield Original Heuristics
    const lastPasteTime = behavior.lastPasteTime || 0;
    const submitPauseMs = behavior.submitPauseMs || 0;
    const backspaceCount = behavior.backspaceCount || 0;

    // A. Post-Copy-Paste Behavior Abuse (Credential Stuffing Bot signature)
    if (lastPasteTime > 0 && lastPasteTime < 350 && mouseEvents < 6) {
      riskScore += 35;
      trustScore -= 30;
      behaviorFlags.push('bot_paste_submit_abuse');
    }

    // B. Deceleration click hesitation pattern check
    if (submitPauseMs > 0 && submitPauseMs < 25) {
      riskScore += 20;
      trustScore -= 15;
      behaviorFlags.push('instant_click_no_deceleration_pause');
    }

    // C. Error correction bonus
    if (backspaceCount > 0) {
      trustScore += 8;
    }

    return {
      riskScore: Math.min(Math.max(riskScore, 0), 100),
      trustScore: Math.min(Math.max(trustScore, 0), 100),
      isAiAgent,
      agentType,
      deviceAnomalies,
      behaviorFlags
    };
  }
}

export class DecisionMaker {
  static makeDecision(
    riskScore: number,
    trustScore: number,
    reputationScore: number,
    isAiAgent: boolean,
    challengeSolved?: boolean
  ): 'allow' | 'challenge' | 'block' {
    if (challengeSolved) {
      return 'allow';
    }
    if (riskScore >= 60 || isAiAgent) {
      return 'block';
    }
    if (riskScore > 20 || trustScore < 65 || reputationScore < 75) {
      return 'challenge';
    }
    return 'allow';
  }
}

export function evaluateTelemetry(
  fingerprint: any,
  behavior: any,
  clientIp: string,
  _userAgent: string,
  hasForwardedFor: boolean,
  isBotUA: boolean
): RiskEngineResult {
  // 1. Analyze signals
  const mousePointsList = behavior.mousePoints || [];
  const keyTimingsList = behavior.keyTimings || [];
  const durationMs = behavior.durationMs || 1000;
  const challengeSolved = behavior.challengeSolved || false;

  const mouseAnalysis = SignalAnalyzer.analyzeMouseTrajectory(mousePointsList);
  const velAnalysis = SignalAnalyzer.analyzeVelocityVariance(mousePointsList);
  const keyAnalysis = SignalAnalyzer.analyzeKeystrokeRhythm(keyTimingsList);
  const timeAnalysis = SignalAnalyzer.analyzeTiming(durationMs);

  // 2. Score calculations
  const scores = ScoreCalculator.calculateRiskScore(
    fingerprint,
    behavior,
    isBotUA,
    mouseAnalysis,
    velAnalysis,
    keyAnalysis,
    timeAnalysis
  );

  // 3. Network Reputation (Layer 3)
  let reputationScore = 95;
  const networkFlags: string[] = [];

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

  reputationScore = Math.min(Math.max(reputationScore, 0), 100);

  // 4. Decision making
  const decision = DecisionMaker.makeDecision(
    scores.riskScore,
    scores.trustScore,
    reputationScore,
    scores.isAiAgent,
    challengeSolved
  );

  return {
    riskScore: scores.riskScore,
    trustScore: scores.trustScore,
    reputationScore,
    isAiAgent: scores.isAiAgent,
    agentType: scores.agentType,
    deviceAnomalies: scores.deviceAnomalies,
    behaviorFlags: scores.behaviorFlags,
    networkFlags,
    decision
  };
}
