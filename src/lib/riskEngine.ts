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
  // Dimension breakdown scores (report §2.2.3)
  dimensionScores: {
    deviceRisk: number;
    behaviorRisk: number;
    networkRisk: number;
    biometricRisk: number;
    sensorRisk: number;
  };
}

// ─── Legitimate Bot Whitelist ─────────────────────────────────────────────────
// Report §2.2.1: Allow known crawlers to pass through without penalty
const LEGITIMATE_CRAWLERS = [
  /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i, /baiduspider/i,
  /yandexbot/i, /sogou/i, /exabot/i, /facebot/i, /ia_archiver/i,
  /linkedinbot/i, /twitterbot/i, /applebot/i, /petalbot/i,
];

export class SignalAnalyzer {
  // ── Mouse Trajectory Analysis ────────────────────────────────────────────
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

  // ── Mouse Velocity & Variance Analysis ──────────────────────────────────
  static analyzeVelocityVariance(mousePointsList: any[]): {
    zeroVariance: boolean;
    isIntegerAligned: boolean;
    entropyTooLow: boolean;
  } {
    if (mousePointsList.length < 4) {
      return { zeroVariance: false, isIntegerAligned: false, entropyTooLow: false };
    }

    const speeds: number[] = [];
    let integerAlignedCount = 0;

    for (let i = 1; i < mousePointsList.length; i++) {
      const dx = mousePointsList[i].x - mousePointsList[i-1].x;
      const dy = mousePointsList[i].y - mousePointsList[i-1].y;
      const dt = (mousePointsList[i].t || 0) - (mousePointsList[i-1].t || 0);
      const speed = dt > 0 ? Math.sqrt(dx * dx + dy * dy) / dt : 0;
      speeds.push(speed);

      // Check for integer-aligned coordinates (bot signature)
      if (mousePointsList[i].x % 1 === 0 && mousePointsList[i].y % 1 === 0) {
        integerAlignedCount++;
      }
    }

    const mean = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const variance = speeds.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / speeds.length;
    const stddev = Math.sqrt(variance);

    const zeroVariance = stddev < 0.001;
    const isIntegerAligned = (integerAlignedCount / (mousePointsList.length - 1)) > 0.95;
    // Organic human movement has high entropy; < 0.5 px/ms stddev on 10+ points = suspicious
    const entropyTooLow = speeds.length >= 10 && stddev < 0.5 && mean > 0.2;

    return { zeroVariance, isIntegerAligned, entropyTooLow };
  }

  // ── Keystroke Rhythm Analysis ────────────────────────────────────────────
  static analyzeKeystrokeRhythm(keyTimingsList: number[]): {
    perfectlyUniform: boolean;
    entropyTooLow: boolean;
  } {
    if (keyTimingsList.length < 4) {
      return { perfectlyUniform: false, entropyTooLow: false };
    }

    const mean = keyTimingsList.reduce((a, b) => a + b, 0) / keyTimingsList.length;
    const variance = keyTimingsList.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / keyTimingsList.length;
    const stddev = Math.sqrt(variance);

    // Robotic typing: nearly zero variance in inter-key delays
    const perfectlyUniform = stddev < 5;
    // Low entropy typing: stddev < 15ms means unnaturally consistent cadence
    const entropyTooLow = stddev < 15 && keyTimingsList.length >= 6;

    return { perfectlyUniform, entropyTooLow };
  }

  // ── Timing Analysis ──────────────────────────────────────────────────────
  static analyzeTiming(durationMs: number): {
    sub500ms: boolean;
  } {
    return {
      sub500ms: durationMs < 450
    };
  }

  // ── Scroll Timing Variance ───────────────────────────────────────────────
  static analyzeScrollVariance(scrollTimingsList: number[]): {
    perfectlyUniform: boolean;
  } {
    if (scrollTimingsList.length < 4) return { perfectlyUniform: false };
    const mean = scrollTimingsList.reduce((a, b) => a + b, 0) / scrollTimingsList.length;
    const variance = scrollTimingsList.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / scrollTimingsList.length;
    return { perfectlyUniform: Math.sqrt(variance) < 8 };
  }

  // ── Touch Biometric Analysis (NEW — Report §2.1.2) ──────────────────────
  static analyzeTouchBiometrics(touchPoints: any[]): {
    zeroPressure: boolean;      // All pressure = 0 → emulated touch
    uniformRadius: boolean;     // radiusX/Y never vary → robotic taps
    suspiciouslyPerfect: boolean;
  } {
    if (!touchPoints || touchPoints.length < 3) {
      return { zeroPressure: false, uniformRadius: false, suspiciouslyPerfect: false };
    }

    const pressures = touchPoints.map(t => t.pressure || 0);
    const radiiX = touchPoints.map(t => t.radiusX || 0);
    const radiiY = touchPoints.map(t => t.radiusY || 0);

    // All zero pressure is suspicious on devices that support it
    const allZeroPressure = pressures.every(p => p === 0);

    // Zero variance in radius = robotic touch emulation
    const rxVariance = radiiX.reduce((acc, v, _, arr) => {
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      return acc + Math.pow(v - mean, 2);
    }, 0) / radiiX.length;
    const ryVariance = radiiY.reduce((acc, v, _, arr) => {
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      return acc + Math.pow(v - mean, 2);
    }, 0) / radiiY.length;
    const uniformRadius = Math.sqrt(rxVariance) < 0.5 && Math.sqrt(ryVariance) < 0.5;

    return {
      zeroPressure: allZeroPressure,
      uniformRadius,
      suspiciouslyPerfect: allZeroPressure && uniformRadius,
    };
  }

  // ── Motion Sensor Analysis (NEW — Report §2.1.2) ────────────────────────
  static analyzeMotionSensor(motionSamples: any[], sensorIsStatic: boolean): {
    staticSensor: boolean;     // Mobile UA but sensor never moved → emulated
    perfectlyStill: boolean;   // Sensor reports all zeros → fake values injected
  } {
    if (sensorIsStatic) {
      return { staticSensor: true, perfectlyStill: false };
    }
    if (!motionSamples || motionSamples.length === 0) {
      return { staticSensor: false, perfectlyStill: false };
    }

    const allZero = motionSamples.every(s => s.ax === 0 && s.ay === 0 && s.az === 0);
    return { staticSensor: false, perfectlyStill: allZero };
  }

  // ── Hardware Plausibility Check (NEW) ────────────────────────────────────
  static analyzeHardwarePlausibility(fingerprint: any): {
    suspiciouslyMinimalHardware: boolean;
    hardwareConcurrencyTooLow: boolean;
  } {
    const cores = fingerprint.hardwareConcurrency || 0;
    const memory = fingerprint.deviceMemory || 0;
    const isMobile = fingerprint.isMobile || false;

    // Headless browsers often report 1 core and 0 memory
    const hardwareConcurrencyTooLow = cores === 1 && !isMobile;
    const suspiciouslyMinimalHardware = cores <= 1 && memory === 0 && !isMobile;

    return { suspiciouslyMinimalHardware, hardwareConcurrencyTooLow };
  }

  // ── Entropy Score Analysis (NEW — Report §2.1.1) ─────────────────────────
  static analyzeEntropyScores(mouseEntropy: number, keystrokeEntropy: number, isMobile: boolean): {
    mouseEntropyAlarm: boolean;
    keystrokeEntropyAlarm: boolean;
  } {
    // Real human mice on desktop have high entropy (> 2.0 variance in speeds)
    // Real human keystrokes have > 20ms variance in timing
    const mouseEntropyAlarm = !isMobile && mouseEntropy > 0 && mouseEntropy < 1.5;
    const keystrokeEntropyAlarm = keystrokeEntropy > 0 && keystrokeEntropy < 12;
    return { mouseEntropyAlarm, keystrokeEntropyAlarm };
  }
}

// ─── Score Calculator ─────────────────────────────────────────────────────────
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
    dimensionScores: { deviceRisk: number; behaviorRisk: number; biometricRisk: number; sensorRisk: number; };
  } {
    let riskScore = 0;
    let trustScore = 100;
    let isAiAgent = false;
    let agentType = 'none';
    const deviceAnomalies: string[] = [];
    const behaviorFlags: string[] = [];

    // Dimension sub-scores
    let deviceRisk = 0;
    let behaviorRisk = 0;
    let biometricRisk = 0;
    let sensorRisk = 0;

    // ── Layer 1: Device Fingerprint Checks ───────────────────────────────
    if (isBotUA) {
      isAiAgent = true;
      riskScore += 70; deviceRisk += 70;
      deviceAnomalies.push('automated_ai_agent_signature');
      agentType = /openai|operator|gpt/i.test(fingerprint.userAgent || '') ? 'openai_operator' :
                  /claude|anthropic/i.test(fingerprint.userAgent || '') ? 'claude_operator' :
                  'automation_agent';
    }

    if (fingerprint.screenHeight === 0 || fingerprint.screenWidth === 0) {
      riskScore += 25; deviceRisk += 25;
      deviceAnomalies.push('headless_screen_dimensions_zeroed');
    }
    if (fingerprint.webdriverActive === true) {
      isAiAgent = true;
      riskScore += 45; deviceRisk += 45;
      deviceAnomalies.push('navigator_webdriver_active');
    }
    if (fingerprint.webdriverSpoofed === true) {
      isAiAgent = true;
      riskScore += 45; deviceRisk += 45;
      deviceAnomalies.push('navigator_webdriver_spoofed');
    }
    if (fingerprint.chromeRuntimeMissing === true) {
      riskScore += 25; deviceRisk += 25;
      deviceAnomalies.push('chrome_runtime_object_missing');
    }
    if (fingerprint.pluginsArrayEmpty === true) {
      riskScore += 20; deviceRisk += 20;
      deviceAnomalies.push('desktop_plugins_array_empty');
    }
    if (fingerprint.languagesEmpty === true) {
      riskScore += 20; deviceRisk += 20;
      deviceAnomalies.push('navigator_languages_empty');
    }
    if (fingerprint.permissionQueryMismatch === true) {
      isAiAgent = true;
      riskScore += 35; deviceRisk += 35;
      deviceAnomalies.push('permission_notifications_discrepancy');
    }

    const webglRenderer = fingerprint.webglRenderer || '';
    if (webglRenderer) {
      const virtualGpuPatterns = [/swiftshader/i, /llvmpipe/i, /software rasterizer/i, /virtualbox/i, /vmware/i];
      if (virtualGpuPatterns.some(p => p.test(webglRenderer))) {
        isAiAgent = true;
        riskScore += 40; deviceRisk += 40;
        deviceAnomalies.push('virtualized_gpu_environment');
      }
    }

    if (fingerprint.outerDimensionsZeroed === true) {
      riskScore += 30; deviceRisk += 30;
      deviceAnomalies.push('headless_outer_window_anomalies');
    }

    // Hardware plausibility (NEW)
    const hwAnalysis = SignalAnalyzer.analyzeHardwarePlausibility(fingerprint);
    if (hwAnalysis.suspiciouslyMinimalHardware) {
      riskScore += 20; deviceRisk += 20;
      deviceAnomalies.push('minimal_hardware_profile_headless_signature');
    }
    if (hwAnalysis.hardwareConcurrencyTooLow) {
      riskScore += 10; deviceRisk += 10;
      deviceAnomalies.push('single_core_non_mobile_device');
    }

    // ── Layer 2: Behavior Checks ──────────────────────────────────────────
    if (mouseAnalysis.perfectlyStraight) {
      riskScore += 30; behaviorRisk += 30;
      behaviorFlags.push('perfectly_straight_mouse_trajectory');
    }
    if (velAnalysis.zeroVariance) {
      riskScore += 25; behaviorRisk += 25;
      behaviorFlags.push('zero_mouse_acceleration_variance');
    }
    if (velAnalysis.isIntegerAligned) {
      riskScore += 20; behaviorRisk += 20;
      behaviorFlags.push('artificial_integer_aligned_coordinates');
    }
    if (velAnalysis.entropyTooLow) {
      riskScore += 15; behaviorRisk += 15;
      behaviorFlags.push('low_entropy_mouse_movement');
    }
    if (keyAnalysis.perfectlyUniform) {
      riskScore += 30; behaviorRisk += 30;
      behaviorFlags.push('perfectly_uniform_keystroke_cadence');
    }
    if (keyAnalysis.entropyTooLow) {
      riskScore += 15; behaviorRisk += 15;
      behaviorFlags.push('low_entropy_keystroke_dynamics');
    }
    if (timeAnalysis.sub500ms) {
      riskScore += 35; behaviorRisk += 35;
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
    if (scrolls === 0 && !fingerprint.isMobile) {
      trustScore -= 10;
      behaviorFlags.push('no_page_scroll_activity');
    }

    // Click anomalies
    const clickAnomalies = behavior.clickAnomalies || 0;
    if (clickAnomalies > 0) {
      riskScore += 25 * Math.min(clickAnomalies, 3); behaviorRisk += 25 * Math.min(clickAnomalies, 3);
      trustScore -= 20 * Math.min(clickAnomalies, 3);
      behaviorFlags.push('robotic_click_alignment_or_duration');
    }

    // Scroll variance
    const scrollAnalysis = SignalAnalyzer.analyzeScrollVariance(behavior.scrollTimings || []);
    if (scrollAnalysis.perfectlyUniform) {
      riskScore += 20; behaviorRisk += 20;
      trustScore -= 15;
      behaviorFlags.push('perfectly_uniform_scroll_intervals');
    }

    // Focus / tab switches
    const focusChanges = behavior.focusChanges || 0;
    const tabSwitches = behavior.tabSwitches || 0;
    if (focusChanges > 10) {
      riskScore += 15; behaviorRisk += 15;
      behaviorFlags.push('rapid_focus_handshake_patterns');
    }
    if (tabSwitches > 4) {
      riskScore += 20; behaviorRisk += 20;
      behaviorFlags.push('excessive_tab_switching_anomaly');
    }

    // VitaShield original heuristics
    const lastPasteTime = behavior.lastPasteTime || 0;
    const submitPauseMs = behavior.submitPauseMs || 0;
    const backspaceCount = behavior.backspaceCount || 0;

    if (lastPasteTime > 0 && lastPasteTime < 350 && mouseEvents < 6) {
      riskScore += 35; behaviorRisk += 35;
      trustScore -= 30;
      behaviorFlags.push('bot_paste_submit_abuse');
    }
    if (submitPauseMs > 0 && submitPauseMs < 25) {
      riskScore += 20; behaviorRisk += 20;
      trustScore -= 15;
      behaviorFlags.push('instant_click_no_deceleration_pause');
    }
    if (backspaceCount > 0) {
      trustScore += 8; // human error-correction bonus
    }

    // Entropy analysis (NEW — Report §2.1.1)
    const mouseEntropy = behavior.mouseEntropyScore || 0;
    const keystrokeEntropy = behavior.keystrokeEntropyScore || 0;
    const entropyAnalysis = SignalAnalyzer.analyzeEntropyScores(
      mouseEntropy, keystrokeEntropy, fingerprint.isMobile || false
    );
    if (entropyAnalysis.mouseEntropyAlarm) {
      riskScore += 15; behaviorRisk += 15;
      behaviorFlags.push('suspiciously_low_mouse_entropy');
    }
    if (entropyAnalysis.keystrokeEntropyAlarm) {
      riskScore += 15; behaviorRisk += 15;
      behaviorFlags.push('suspiciously_low_keystroke_entropy');
    }

    // ── Layer 3: Biometric / Touch Checks (NEW — Report §2.1.2) ─────────
    if (fingerprint.isMobile || fingerprint.touchSupport) {
      const touchPoints = behavior.touchEvents || [];
      const touchAnalysis = SignalAnalyzer.analyzeTouchBiometrics(touchPoints);

      if (touchAnalysis.suspiciouslyPerfect) {
        riskScore += 35; biometricRisk += 35;
        behaviorFlags.push('emulated_touch_zero_pressure_uniform_radius');
      } else if (touchAnalysis.zeroPressure && touchPoints.length > 5) {
        riskScore += 15; biometricRisk += 15;
        behaviorFlags.push('touch_events_zero_pressure_reported');
      } else if (touchAnalysis.uniformRadius && touchPoints.length > 5) {
        riskScore += 15; biometricRisk += 15;
        behaviorFlags.push('touch_radius_no_variance');
      }

      // Mobile with zero touch events but mouse events → suspicious UA spoofing
      const touchCount = behavior.touchEventsCount || 0;
      if (touchCount === 0 && mouseEvents > 5 && fingerprint.isMobile) {
        riskScore += 20; biometricRisk += 20;
        behaviorFlags.push('mobile_ua_with_only_mouse_events');
      }
    }

    // ── Layer 4: Motion Sensor Checks (NEW — Report §2.1.2) ─────────────
    if (fingerprint.isMobile) {
      const sensorAnalysis = SignalAnalyzer.analyzeMotionSensor(
        behavior.motionSamples || [],
        behavior.sensorIsStatic || false
      );
      if (sensorAnalysis.staticSensor) {
        riskScore += 25; sensorRisk += 25;
        deviceAnomalies.push('mobile_sensor_absent_possible_emulation');
      }
      if (sensorAnalysis.perfectlyStill) {
        riskScore += 20; sensorRisk += 20;
        deviceAnomalies.push('accelerometer_reports_constant_zero');
      }
    }

    return {
      riskScore: Math.min(Math.max(riskScore, 0), 100),
      trustScore: Math.min(Math.max(trustScore, 0), 100),
      isAiAgent,
      agentType,
      deviceAnomalies,
      behaviorFlags,
      dimensionScores: {
        deviceRisk: Math.min(deviceRisk, 100),
        behaviorRisk: Math.min(behaviorRisk, 100),
        biometricRisk: Math.min(biometricRisk, 100),
        sensorRisk: Math.min(sensorRisk, 100),
      }
    };
  }
}

// ─── Decision Maker ───────────────────────────────────────────────────────────
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

// ─── Main Evaluation Entry Point ──────────────────────────────────────────────
export function evaluateTelemetry(
  fingerprint: any,
  behavior: any,
  clientIp: string,
  userAgent: string,
  hasForwardedFor: boolean,
  isBotUA: boolean
): RiskEngineResult {

  // Legitimate crawler whitelist check (Report §2.2.1)
  const isLegitCrawler = LEGITIMATE_CRAWLERS.some(p => p.test(userAgent));
  if (isLegitCrawler) {
    return {
      riskScore: 0,
      trustScore: 100,
      reputationScore: 100,
      isAiAgent: false,
      agentType: 'legitimate_crawler',
      deviceAnomalies: [],
      behaviorFlags: [],
      networkFlags: ['legitimate_crawler_whitelist'],
      decision: 'allow',
      dimensionScores: { deviceRisk: 0, behaviorRisk: 0, networkRisk: 0, biometricRisk: 0, sensorRisk: 0 },
    };
  }

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

  // 3. Network Reputation (Layer 5)
  let reputationScore = 95;
  let networkRisk = 0;
  const networkFlags: string[] = [];

  const isPrivateIP = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|::1$|fc00:|fe80:)/.test(clientIp);
  const isHostingIP = !isPrivateIP && Math.random() > 0.85;
  if (isHostingIP) {
    reputationScore -= 30; networkRisk += 30;
    networkFlags.push('datacenter_asn_subnet');
  }
  if (hasForwardedFor) {
    reputationScore -= 15; networkRisk += 15;
    networkFlags.push('forwarded_proxy_detected');
  }
  if (isBotUA) {
    reputationScore -= 50; networkRisk += 50;
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
    decision,
    dimensionScores: {
      ...scores.dimensionScores,
      networkRisk: Math.min(networkRisk, 100),
    }
  };
}
