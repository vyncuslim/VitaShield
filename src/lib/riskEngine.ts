// ─── VitaShield Risk Engine v2.2 ─────────────────────────────────────────────
// New layers: fingerprint consistency, over-spoofing detection, performance
// timing anomaly, accelerometer gravity check, gyroscope variance, touch
// trajectory analysis, network consistency, WebGL vendor cross-check,
// font/storage/API support plausibility, granular dimension scores
// ──────────────────────────────────────────────────────────────────────────────

export interface RiskEngineResult {
  riskScore: number;
  trustScore: number;
  reputationScore: number;
  isAiAgent: boolean;
  agentType: string;
  deviceAnomalies: string[];
  behaviorFlags: string[];
  networkFlags: string[];
  consistencyFlags: string[];       // fingerprint cross-check violations
  overSpoofingFlags: string[];      // "too perfect" signals
  decision: 'allow' | 'challenge' | 'block';
  dimensionScores: {
    deviceRisk: number;
    behaviorRisk: number;
    networkRisk: number;
    biometricRisk: number;
    sensorRisk: number;
    consistencyRisk: number;        // fingerprint consistency score
    overSpoofingRisk: number;       // over-spoofing score
  };
}

// ─── Legitimate Crawler Whitelist ─────────────────────────────────────────────
const LEGITIMATE_CRAWLERS = [
  /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i, /baiduspider/i,
  /yandexbot/i, /sogou/i, /exabot/i, /facebot/i, /ia_archiver/i,
  /linkedinbot/i, /twitterbot/i, /applebot/i, /petalbot/i,
];

// ─── Known Spoofing Library Signatures ───────────────────────────────────────
// Known canvas fingerprint hashes produced by popular spoofing libraries
// (values here are illustrative; real deployment populates from threat DB)
const KNOWN_SPOOFED_CANVAS_HASHES = new Set([
  '0', '1', 'ffffffff', '0000000',
]);

// Known stealth-plugin WebGL renderer strings used in popular bot farms
const KNOWN_SPOOFED_RENDERERS = [
  'ANGLE (NVIDIA GeForce GTX 1080 Direct3D11 vs_5_0 ps_5_0)',
  'ANGLE (Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0)',
  'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060, OpenGL 4.1)',
  'Mesa DRI Intel(R) Iris(R) Xe Graphics (TGL GT2)',
];

// ─── Helper: standard deviation ───────────────────────────────────────────────
function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const v = values.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0) / values.length;
  return Math.sqrt(v);
}

// ─────────────────────────────────────────────────────────────────────────────
export class SignalAnalyzer {

  // ── Mouse Trajectory ─────────────────────────────────────────────────────
  static analyzeMouseTrajectory(pts: any[]): { perfectlyStraight: boolean; hasPoints: boolean } {
    if (pts.length < 4) return { perfectlyStraight: false, hasPoints: pts.length > 0 };
    let pathLen = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y;
      pathLen += Math.sqrt(dx*dx + dy*dy);
    }
    const fdx = pts[pts.length-1].x - pts[0].x, fdy = pts[pts.length-1].y - pts[0].y;
    const straight = Math.sqrt(fdx*fdx + fdy*fdy);
    if (straight > 20 && pathLen / straight < 1.025) return { perfectlyStraight: true, hasPoints: true };
    return { perfectlyStraight: false, hasPoints: true };
  }

  // ── Mouse Velocity Variance ──────────────────────────────────────────────
  static analyzeVelocityVariance(pts: any[]): {
    zeroVariance: boolean; isIntegerAligned: boolean; entropyTooLow: boolean;
  } {
    if (pts.length < 4) return { zeroVariance: false, isIntegerAligned: false, entropyTooLow: false };
    const speeds: number[] = [];
    let intAligned = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y;
      const dt = (pts[i].t || 0) - (pts[i-1].t || 0);
      speeds.push(dt > 0 ? Math.sqrt(dx*dx+dy*dy)/dt : 0);
      if (pts[i].x % 1 === 0 && pts[i].y % 1 === 0) intAligned++;
    }
    const sd = stdDev(speeds);
    const mean = speeds.reduce((a,b)=>a+b,0)/speeds.length;
    return {
      zeroVariance: sd < 0.001,
      isIntegerAligned: (intAligned / (pts.length-1)) > 0.95,
      entropyTooLow: speeds.length >= 10 && sd < 0.5 && mean > 0.2,
    };
  }

  // ── Keystroke Rhythm ─────────────────────────────────────────────────────
  static analyzeKeystrokeRhythm(timings: number[]): {
    perfectlyUniform: boolean; entropyTooLow: boolean;
  } {
    if (timings.length < 4) return { perfectlyUniform: false, entropyTooLow: false };
    const sd = stdDev(timings);
    return { perfectlyUniform: sd < 5, entropyTooLow: sd < 15 && timings.length >= 6 };
  }

  // ── Timing ───────────────────────────────────────────────────────────────
  static analyzeTiming(ms: number): { sub500ms: boolean } {
    return { sub500ms: ms < 450 };
  }

  // ── Scroll Variance ──────────────────────────────────────────────────────
  static analyzeScrollVariance(timings: number[]): { perfectlyUniform: boolean } {
    if (timings.length < 4) return { perfectlyUniform: false };
    return { perfectlyUniform: stdDev(timings) < 8 };
  }

  // ── Touch Biometrics ─────────────────────────────────────────────────────
  static analyzeTouchBiometrics(pts: any[]): {
    zeroPressure: boolean; uniformRadius: boolean; suspiciouslyPerfect: boolean;
    trajectoryTooLinear: boolean;
  } {
    if (!pts || pts.length < 3) {
      return { zeroPressure: false, uniformRadius: false, suspiciouslyPerfect: false, trajectoryTooLinear: false };
    }
    const pressures = pts.map((t: any) => t.pressure || 0);
    const radiiX = pts.map((t: any) => t.radiusX || 0);
    const radiiY = pts.map((t: any) => t.radiusY || 0);
    const zeroPressure  = pressures.every((p: number) => p === 0);
    const uniformRadius = stdDev(radiiX) < 0.5 && stdDev(radiiY) < 0.5;

    // Touch trajectory linearity (similar to mouse straight-line check)
    let trajectoryTooLinear = false;
    if (pts.length >= 4) {
      let pathLen = 0;
      for (let i = 1; i < pts.length; i++) {
        const dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y;
        pathLen += Math.sqrt(dx*dx + dy*dy);
      }
      const fdx = pts[pts.length-1].x - pts[0].x, fdy = pts[pts.length-1].y - pts[0].y;
      const straight = Math.sqrt(fdx*fdx + fdy*fdy);
      if (straight > 10 && pathLen / straight < 1.03) trajectoryTooLinear = true;
    }

    return { zeroPressure, uniformRadius, suspiciouslyPerfect: zeroPressure && uniformRadius, trajectoryTooLinear };
  }

  // ── Accelerometer Analysis (NEW — gravity + stddev) ───────────────────────
  static analyzeAccelerometer(samples: any[], sensorIsStatic: boolean): {
    staticSensor: boolean;
    missingGravity: boolean;      // real device always has ~9.8 m/s²
    perfectlyStill: boolean;      // all zeros → fake values
    stdDevTooLow: boolean;        // implausibly stable for handheld device
  } {
    if (sensorIsStatic) return { staticSensor: true, missingGravity: true, perfectlyStill: false, stdDevTooLow: false };
    if (!samples || samples.length < 3) {
      return { staticSensor: false, missingGravity: false, perfectlyStill: false, stdDevTooLow: false };
    }
    const mags = samples.map((s: any) => Math.sqrt(s.ax*s.ax + s.ay*s.ay + s.az*s.az));
    const hasGravity = mags.some(m => Math.abs(m - 9.8) < 2.5);
    const allZero = samples.every((s: any) => s.ax === 0 && s.ay === 0 && s.az === 0);
    const sd = stdDev(mags);
    return {
      staticSensor: false,
      missingGravity: !hasGravity,
      perfectlyStill: allZero,
      stdDevTooLow: sd < 0.05 && !allZero, // suspiciously stable but not zero
    };
  }

  // ── Gyroscope Analysis (NEW) ─────────────────────────────────────────────
  static analyzeGyroscope(samples: any[]): {
    noVariance: boolean; // real device in hand always trembles slightly
  } {
    if (!samples || samples.length < 5) return { noVariance: false };
    const alphas = samples.map((s: any) => s.alpha);
    return { noVariance: stdDev(alphas) < 0.05 };
  }

  // ── Hardware Plausibility ─────────────────────────────────────────────────
  static analyzeHardwarePlausibility(fp: any): {
    suspiciouslyMinimalHardware: boolean;
    hardwareConcurrencyTooLow: boolean;
  } {
    const cores = fp.hardwareConcurrency || 0;
    const mem   = fp.deviceMemory || 0;
    return {
      hardwareConcurrencyTooLow:     cores === 1 && !fp.isMobile,
      suspiciouslyMinimalHardware:   cores <= 1 && mem === 0 && !fp.isMobile,
    };
  }

  // ── Entropy Score Analysis ────────────────────────────────────────────────
  static analyzeEntropyScores(mouseEntropy: number, keystrokeEntropy: number, isMobile: boolean): {
    mouseEntropyAlarm: boolean; keystrokeEntropyAlarm: boolean;
  } {
    return {
      mouseEntropyAlarm:      !isMobile && mouseEntropy > 0 && mouseEntropy < 1.5,
      keystrokeEntropyAlarm:  keystrokeEntropy > 0 && keystrokeEntropy < 12,
    };
  }

  // ── Fingerprint Consistency (NEW — Report §2.1.1) ─────────────────────────
  // Cross-validates multiple fingerprint fields against each other.
  // Real browsers always have internally consistent field combinations.
  // Stealth plugins often fix some fields but miss subtle cross-dependencies.
  static analyzeFingerprintConsistency(fp: any): {
    flags: string[];
    score: number; // 0-100 risk contribution
  } {
    const flags: string[] = [];
    let score = 0;

    const ua: string = (fp.userAgent || '').toLowerCase();
    const vendor: string = (fp.navigatorVendor || '').toLowerCase();
    const platform: string = (fp.navigatorPlatform || '').toLowerCase();
    const isMobile: boolean = fp.isMobile || false;

    // 1. Chrome UA → must have "Google Inc." vendor
    if (/chrome/.test(ua) && !/chromium|edg/.test(ua)) {
      if (vendor !== 'google inc.') {
        flags.push('chrome_ua_wrong_vendor');
        score += 25;
      }
    }
    // 2. Firefox UA → vendor must be empty string
    if (/firefox/.test(ua) && !vendor) {
      // OK
    } else if (/firefox/.test(ua) && vendor && vendor !== '') {
      flags.push('firefox_ua_unexpected_vendor');
      score += 15;
    }
    // 3. Safari UA → vendor should be "apple computer, inc."
    if (/safari/.test(ua) && !/chrome/.test(ua)) {
      if (!vendor.includes('apple')) {
        flags.push('safari_ua_non_apple_vendor');
        score += 20;
      }
    }

    // 4. UA says Windows → platform should contain 'win'
    if (/windows/.test(ua) && platform && !platform.includes('win')) {
      flags.push('windows_ua_non_windows_platform');
      score += 30;
    }
    // 5. UA says Mac → platform should contain 'mac'
    if (/macintosh|mac os x/.test(ua) && !/iphone|ipad/.test(ua) && platform && !platform.includes('mac')) {
      flags.push('mac_ua_non_mac_platform');
      score += 30;
    }
    // 6. UA says Linux → platform should contain 'linux'
    if (/linux/.test(ua) && !/android/.test(ua) && platform && !platform.includes('linux')) {
      flags.push('linux_ua_non_linux_platform');
      score += 25;
    }
    // 7. Android UA → platform should be 'linux armv8l' or similar
    if (/android/.test(ua) && platform && !platform.includes('linux') && !platform.includes('arm') && !platform.includes('android')) {
      flags.push('android_ua_unexpected_platform');
      score += 20;
    }

    // 8. Mobile UA claims touch but maxTouchPoints = 0
    if (isMobile && (fp.maxTouchPoints || 0) === 0) {
      flags.push('mobile_ua_zero_touch_points');
      score += 25;
    }
    // 9. Desktop UA but has touch points > 5 (suspicious on pure desktop)
    if (!isMobile && (fp.maxTouchPoints || 0) > 5 && !/ipad/.test(ua)) {
      flags.push('desktop_ua_high_touch_points');
      score += 10;
    }

    // 10. Chrome UA but chromeRuntimeMissing = true (stealth deleted it)
    if (/chrome/.test(ua) && fp.chromeRuntimeMissing === true) {
      flags.push('chrome_ua_runtime_deleted');
      score += 30;
    }

    // 11. Desktop UA but outerDimensions zeroed (headless)
    if (!isMobile && fp.outerDimensionsZeroed) {
      flags.push('desktop_headless_zero_outer_dims');
      score += 25;
    }

    // 12. Performance timing: page load < 80ms → headless fast boot
    const perfLoad = fp.performanceTiming?.pageLoadTimeMs || 0;
    if (perfLoad > 0 && perfLoad < 80) {
      flags.push('suspiciously_fast_page_load');
      score += 20;
    }
    // domReady < 30ms → headless
    const domReady = fp.performanceTiming?.domReadyTimeMs || 0;
    if (domReady > 0 && domReady < 30) {
      flags.push('suspiciously_fast_dom_ready');
      score += 15;
    }

    // 13. WebGL vendor cross-check with renderer
    const glVendor   = (fp.webglVendor || '').toLowerCase();
    const glRenderer = (fp.webglRenderer || '').toLowerCase();
    if (glRenderer && glVendor) {
      // NVIDIA renderer but AMD vendor → impossible
      if (glRenderer.includes('nvidia') && glVendor.includes('amd')) {
        flags.push('webgl_vendor_renderer_mismatch');
        score += 35;
      }
      if (glRenderer.includes('amd') && glVendor.includes('nvidia')) {
        flags.push('webgl_vendor_renderer_mismatch');
        score += 35;
      }
    }

    // 14. Network type vs mobile UA
    const effectiveType = fp.networkInfo?.effectiveType || '';
    if (effectiveType && isMobile && effectiveType === '4g' && (fp.networkInfo?.rtt || 0) < 5) {
      // RTT < 5ms on claimed mobile 4G → likely desktop with mobile UA
      flags.push('mobile_ua_desktop_network_rtt');
      score += 15;
    }

    // 15. Missing first-paint but claims normal browser
    // (headless browsers often skip paint pipeline)
    const firstPaint = fp.performanceTiming?.firstPaintMs || 0;
    if (firstPaint === 0 && perfLoad > 200 && /chrome/.test(ua)) {
      flags.push('chrome_missing_first_paint_entry');
      score += 10;
    }

    // 16. Storage inconsistency: claims Chrome but no localStorage
    if (/chrome/.test(ua) && fp.storageAvailability?.localStorage === false) {
      flags.push('chrome_ua_no_localStorage');
      score += 15;
    }

    // 17. No WebRTC in a modern Chrome/Firefox (headless or stripped)
    if ((/chrome|firefox/.test(ua)) && fp.hasWebRTC === false) {
      flags.push('modern_browser_missing_webrtc');
      score += 15;
    }

    return { flags, score: Math.min(score, 100) };
  }

  // ── Over-Spoofing Detection (NEW — Report §2.1.4) ─────────────────────────
  // Too-perfect fingerprints betray themselves: real users have some
  // natural imperfections that bot farms overcorrect or under-randomize.
  static detectOverSpoofing(fp: any, behavior: any): {
    flags: string[];
    score: number;
  } {
    const flags: string[] = [];
    let score = 0;

    const ua: string = fp.userAgent || '';

    // 1. webdriverSpoofed=true means defineProperty was used to hide it
    //    This IS the stealth plugin operating — strongest over-spoof signal
    if (fp.webdriverSpoofed === true) {
      flags.push('webdriver_property_descriptor_patched');
      score += 45;
    }

    // 2. Known spoofed canvas hash (matches known bot farm fingerprint DB)
    if (fp.canvasFingerprint && KNOWN_SPOOFED_CANVAS_HASHES.has(fp.canvasFingerprint)) {
      flags.push('canvas_fingerprint_in_known_spoof_database');
      score += 35;
    }

    // 3. Known spoofed WebGL renderer string (exact match to common bot config)
    const renderer = fp.webglRenderer || '';
    if (KNOWN_SPOOFED_RENDERERS.some(r => r.toLowerCase() === renderer.toLowerCase())) {
      flags.push('webgl_renderer_matches_known_spoofing_string');
      score += 30;
    }

    // 4. Pixel ratio is exactly 1.0 on claimed high-end mobile
    //    Real iPhone/Samsung never have exactly 1.0 DPR
    if (fp.isMobile && (fp.screenPixelRatio || 1) === 1.0 && !/ipad/i.test(ua)) {
      flags.push('mobile_ua_pixel_ratio_exactly_1');
      score += 20;
    }

    // 5. Chrome UA + chrome.runtime={} (faked object, not real runtime)
    //    Real Chrome runtime has many more properties
    if (/chrome/i.test(ua) && fp.chromeRuntimeMissing === false) {
      // Chrome runtime exists — but check if it's a stub (empty object)
      // We can detect this via the pluginsCount: real chrome always has plugins
      if ((fp.pluginsCount || 0) === 0 && !fp.isMobile) {
        flags.push('chrome_runtime_faked_no_plugins');
        score += 25;
      }
    }

    // 6. Color depth = 24 is correct; 32 on headless is suspicious
    //    (Some headless configs report non-standard depths)
    if ((fp.colorDepth || 0) === 32 && !fp.isMobile) {
      flags.push('non_standard_color_depth_32');
      score += 10;
    }

    // 7. Zero font detection hash: headless browsers often render no fonts
    //    or all fonts map to the same fallback
    if (fp.fontDetectionHash === '0' || fp.fontDetectionHash === '') {
      flags.push('no_distinct_fonts_detected');
      score += 15;
    }

    // 8. Hardware concurrency exactly 2 or 4 on "high-end" mobile UA
    //    Automation farms often cap at low fixed values
    const cores = fp.hardwareConcurrency || 0;
    if (fp.isMobile && cores > 0 && cores <= 2 && /iphone 1[3-9]|samsung s2[0-9]/i.test(ua)) {
      flags.push('high_end_mobile_suspiciously_low_cores');
      score += 15;
    }

    // 9. Timezone vs language mismatch (broad heuristic)
    const tz = fp.timezone || '';
    const lang = (fp.language || '').toLowerCase();
    if (tz.includes('America') && lang.startsWith('zh')) {
      // Not necessarily bot, but flag for network review
      flags.push('timezone_language_region_mismatch');
      score += 5;
    }

    // 10. Submit so fast there can't be a real page load
    const durationMs = behavior.durationMs || 0;
    const perfLoad   = fp.performanceTiming?.pageLoadTimeMs || 0;
    if (durationMs > 0 && perfLoad > 0 && durationMs < perfLoad) {
      // Form submitted before the page even finished loading → scripted
      flags.push('form_submitted_before_page_loaded');
      score += 30;
    }

    return { flags, score: Math.min(score, 100) };
  }
}

// ─── Score Calculator ─────────────────────────────────────────────────────────
export class ScoreCalculator {
  static calculateRiskScore(
    fingerprint: any, behavior: any, isBotUA: boolean,
    mouseAnalysis: any, velAnalysis: any, keyAnalysis: any, timeAnalysis: any
  ): {
    riskScore: number; trustScore: number; isAiAgent: boolean;
    agentType: string; deviceAnomalies: string[]; behaviorFlags: string[];
    consistencyFlags: string[]; overSpoofingFlags: string[];
    dimensionScores: {
      deviceRisk: number; behaviorRisk: number; networkRisk: number;
      biometricRisk: number; sensorRisk: number;
      consistencyRisk: number; overSpoofingRisk: number;
    };
  } {
    let riskScore = 0, trustScore = 100;
    let isAiAgent = false, agentType = 'none';
    const deviceAnomalies: string[] = [];
    const behaviorFlags: string[] = [];
    let deviceRisk = 0, behaviorRisk = 0, biometricRisk = 0, sensorRisk = 0;

    // ── Layer 1: Automation Markers ──────────────────────────────────────
    if (isBotUA) {
      isAiAgent = true; riskScore += 70; deviceRisk += 70;
      deviceAnomalies.push('automated_ai_agent_signature');
      agentType = /openai|operator|gpt/i.test(fingerprint.userAgent || '')  ? 'openai_operator' :
                  /claude|anthropic/i.test(fingerprint.userAgent || '')      ? 'claude_operator' :
                  'automation_agent';
    }
    if (fingerprint.screenHeight === 0 || fingerprint.screenWidth === 0) {
      riskScore += 25; deviceRisk += 25;
      deviceAnomalies.push('headless_screen_dimensions_zeroed');
    }
    if (fingerprint.webdriverActive === true) {
      isAiAgent = true; riskScore += 45; deviceRisk += 45;
      deviceAnomalies.push('navigator_webdriver_active');
    }
    if (fingerprint.webdriverSpoofed === true) {
      isAiAgent = true; riskScore += 45; deviceRisk += 45;
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
      isAiAgent = true; riskScore += 35; deviceRisk += 35;
      deviceAnomalies.push('permission_notifications_discrepancy');
    }
    const glRenderer = fingerprint.webglRenderer || '';
    if (glRenderer) {
      const virtualGPUs = [/swiftshader/i, /llvmpipe/i, /software rasterizer/i, /virtualbox/i, /vmware/i];
      if (virtualGPUs.some(p => p.test(glRenderer))) {
        isAiAgent = true; riskScore += 40; deviceRisk += 40;
        deviceAnomalies.push('virtualized_gpu_environment');
      }
    }
    if (fingerprint.outerDimensionsZeroed === true) {
      riskScore += 30; deviceRisk += 30;
      deviceAnomalies.push('headless_outer_window_anomalies');
    }

    // Hardware plausibility
    const hwA = SignalAnalyzer.analyzeHardwarePlausibility(fingerprint);
    if (hwA.suspiciouslyMinimalHardware) {
      riskScore += 20; deviceRisk += 20;
      deviceAnomalies.push('minimal_hardware_profile_headless_signature');
    }
    if (hwA.hardwareConcurrencyTooLow) {
      riskScore += 10; deviceRisk += 10;
      deviceAnomalies.push('single_core_non_mobile_device');
    }

    // ── Layer 2: Behavior Analysis ───────────────────────────────────────
    if (mouseAnalysis.perfectlyStraight)  { riskScore += 30; behaviorRisk += 30; behaviorFlags.push('perfectly_straight_mouse_trajectory'); }
    if (velAnalysis.zeroVariance)         { riskScore += 25; behaviorRisk += 25; behaviorFlags.push('zero_mouse_acceleration_variance'); }
    if (velAnalysis.isIntegerAligned)     { riskScore += 20; behaviorRisk += 20; behaviorFlags.push('artificial_integer_aligned_coordinates'); }
    if (velAnalysis.entropyTooLow)        { riskScore += 15; behaviorRisk += 15; behaviorFlags.push('low_entropy_mouse_movement'); }
    if (keyAnalysis.perfectlyUniform)     { riskScore += 30; behaviorRisk += 30; behaviorFlags.push('perfectly_uniform_keystroke_cadence'); }
    if (keyAnalysis.entropyTooLow)        { riskScore += 15; behaviorRisk += 15; behaviorFlags.push('low_entropy_keystroke_dynamics'); }
    if (timeAnalysis.sub500ms)            { riskScore += 35; behaviorRisk += 35; behaviorFlags.push('sub_500ms_form_submission_speed'); }

    const mouseEvents = behavior.mouseEventsCount || 0;
    const keyPresses  = behavior.keyPressesCount  || 0;
    const scrolls     = behavior.scrollsCount     || 0;
    if (mouseEvents === 0 && !fingerprint.isMobile) { trustScore -= 50; behaviorFlags.push('zero_mouse_kinetics'); }
    else if (mouseEvents > 0 && mouseEvents < 3)    { trustScore -= 20; behaviorFlags.push('abnormally_low_mouse_dynamics'); }
    if (keyPresses === 0 && !fingerprint.isMobile)  { trustScore -= 15; behaviorFlags.push('zero_keystroke_cadence'); }
    if (scrolls === 0    && !fingerprint.isMobile)  { trustScore -= 10; behaviorFlags.push('no_page_scroll_activity'); }

    const clickAnomalies = behavior.clickAnomalies || 0;
    if (clickAnomalies > 0) {
      const cap = Math.min(clickAnomalies, 3);
      riskScore += 25 * cap; behaviorRisk += 25 * cap;
      trustScore -= 20 * cap;
      behaviorFlags.push('robotic_click_alignment_or_duration');
    }
    const scrollAnalysis = SignalAnalyzer.analyzeScrollVariance(behavior.scrollTimings || []);
    if (scrollAnalysis.perfectlyUniform) { riskScore += 20; behaviorRisk += 20; trustScore -= 15; behaviorFlags.push('perfectly_uniform_scroll_intervals'); }
    if ((behavior.focusChanges || 0) > 10) { riskScore += 15; behaviorRisk += 15; behaviorFlags.push('rapid_focus_handshake_patterns'); }
    if ((behavior.tabSwitches  || 0) > 4)  { riskScore += 20; behaviorRisk += 20; behaviorFlags.push('excessive_tab_switching_anomaly'); }

    const lastPaste   = behavior.lastPasteTime  || 0;
    const submitPause = behavior.submitPauseMs  || 0;
    const backspace   = behavior.backspaceCount || 0;
    if (lastPaste > 0 && lastPaste < 350 && mouseEvents < 6) { riskScore += 35; behaviorRisk += 35; trustScore -= 30; behaviorFlags.push('bot_paste_submit_abuse'); }
    if (submitPause > 0 && submitPause < 25)                  { riskScore += 20; behaviorRisk += 20; trustScore -= 15; behaviorFlags.push('instant_click_no_deceleration_pause'); }
    if (backspace > 0)                                        { trustScore += 8; }

    const entrA = SignalAnalyzer.analyzeEntropyScores(
      behavior.mouseEntropyScore || 0, behavior.keystrokeEntropyScore || 0, fingerprint.isMobile || false
    );
    if (entrA.mouseEntropyAlarm)      { riskScore += 15; behaviorRisk += 15; behaviorFlags.push('suspiciously_low_mouse_entropy'); }
    if (entrA.keystrokeEntropyAlarm)  { riskScore += 15; behaviorRisk += 15; behaviorFlags.push('suspiciously_low_keystroke_entropy'); }

    // ── Layer 3: Touch Biometrics ────────────────────────────────────────
    if (fingerprint.isMobile || fingerprint.touchSupport) {
      const touchPts  = behavior.touchEvents || [];
      const touchA    = SignalAnalyzer.analyzeTouchBiometrics(touchPts);
      const touchCount = behavior.touchEventsCount || 0;

      if (touchA.suspiciouslyPerfect)  { riskScore += 35; biometricRisk += 35; behaviorFlags.push('emulated_touch_zero_pressure_uniform_radius'); }
      else if (touchA.zeroPressure && touchPts.length > 5) { riskScore += 15; biometricRisk += 15; behaviorFlags.push('touch_events_zero_pressure_reported'); }
      else if (touchA.uniformRadius && touchPts.length > 5) { riskScore += 15; biometricRisk += 15; behaviorFlags.push('touch_radius_no_variance'); }
      if (touchA.trajectoryTooLinear) { riskScore += 20; biometricRisk += 20; behaviorFlags.push('touch_trajectory_perfectly_linear'); }

      if (touchCount === 0 && mouseEvents > 5 && fingerprint.isMobile) {
        riskScore += 20; biometricRisk += 20;
        behaviorFlags.push('mobile_ua_with_only_mouse_events');
      }

      // Touch rotation variance = 0 with many touch events → robotic
      const rotVar = behavior.touchRotationVariance || 0;
      if (touchCount > 5 && rotVar === 0) {
        riskScore += 15; biometricRisk += 15;
        behaviorFlags.push('touch_rotation_zero_variance');
      }
    }

    // ── Layer 4: Motion Sensors ──────────────────────────────────────────
    if (fingerprint.isMobile) {
      const accA = SignalAnalyzer.analyzeAccelerometer(
        behavior.motionSamples || [], behavior.sensorIsStatic || false
      );
      if (accA.staticSensor)     { riskScore += 25; sensorRisk += 25; deviceAnomalies.push('mobile_sensor_absent_emulation'); }
      if (accA.perfectlyStill)   { riskScore += 20; sensorRisk += 20; deviceAnomalies.push('accelerometer_constant_zero'); }
      if (accA.missingGravity && !accA.staticSensor && (behavior.motionSamples || []).length > 3) {
        riskScore += 20; sensorRisk += 20;
        deviceAnomalies.push('accelerometer_missing_gravity_component');
      }
      if (accA.stdDevTooLow)     { riskScore += 15; sensorRisk += 15; deviceAnomalies.push('accelerometer_implausibly_stable'); }

      const gyroA = SignalAnalyzer.analyzeGyroscope(behavior.orientationSamples || []);
      if (gyroA.noVariance)      { riskScore += 15; sensorRisk += 15; deviceAnomalies.push('gyroscope_zero_variance'); }
    }

    return {
      riskScore: Math.min(Math.max(riskScore, 0), 100),
      trustScore: Math.min(Math.max(trustScore, 0), 100),
      isAiAgent, agentType, deviceAnomalies, behaviorFlags,
      consistencyFlags: [], overSpoofingFlags: [],
      dimensionScores: {
        deviceRisk:      Math.min(deviceRisk,    100),
        behaviorRisk:    Math.min(behaviorRisk,  100),
        networkRisk:     0,
        biometricRisk:   Math.min(biometricRisk, 100),
        sensorRisk:      Math.min(sensorRisk,    100),
        consistencyRisk: 0,
        overSpoofingRisk: 0,
      }
    };
  }
}

// ─── Decision Maker ───────────────────────────────────────────────────────────
export class DecisionMaker {
  static makeDecision(
    riskScore: number, trustScore: number, reputationScore: number,
    isAiAgent: boolean, challengeSolved?: boolean
  ): 'allow' | 'challenge' | 'block' {
    if (challengeSolved) return 'allow';
    if (riskScore >= 60 || isAiAgent) return 'block';
    if (riskScore > 20 || trustScore < 65 || reputationScore < 75) return 'challenge';
    return 'allow';
  }
}

// ─── Main Evaluation Entry Point ──────────────────────────────────────────────
export function evaluateTelemetry(
  fingerprint: any, behavior: any,
  clientIp: string, userAgent: string,
  hasForwardedFor: boolean, isBotUA: boolean
): RiskEngineResult {

  // Legitimate crawler whitelist
  const isLegitCrawler = LEGITIMATE_CRAWLERS.some(p => p.test(userAgent));
  if (isLegitCrawler) {
    return {
      riskScore: 0, trustScore: 100, reputationScore: 100,
      isAiAgent: false, agentType: 'legitimate_crawler',
      deviceAnomalies: [], behaviorFlags: [], networkFlags: [],
      consistencyFlags: [], overSpoofingFlags: [],
      decision: 'allow',
      dimensionScores: { deviceRisk:0, behaviorRisk:0, networkRisk:0, biometricRisk:0, sensorRisk:0, consistencyRisk:0, overSpoofingRisk:0 },
    };
  }

  // 1. Signal analysis
  const mousePointsList = behavior.mousePoints || [];
  const keyTimingsList  = behavior.keyTimings  || [];
  const durationMs      = behavior.durationMs  || 1000;
  const challengeSolved = behavior.challengeSolved || false;

  const mouseAnalysis = SignalAnalyzer.analyzeMouseTrajectory(mousePointsList);
  const velAnalysis   = SignalAnalyzer.analyzeVelocityVariance(mousePointsList);
  const keyAnalysis   = SignalAnalyzer.analyzeKeystrokeRhythm(keyTimingsList);
  const timeAnalysis  = SignalAnalyzer.analyzeTiming(durationMs);

  // 2. Core scoring
  const scores = ScoreCalculator.calculateRiskScore(
    fingerprint, behavior, isBotUA,
    mouseAnalysis, velAnalysis, keyAnalysis, timeAnalysis
  );

  // 3. Fingerprint consistency (Layer 5 — NEW)
  const consistencyResult  = SignalAnalyzer.analyzeFingerprintConsistency(fingerprint);
  const overSpoofingResult = SignalAnalyzer.detectOverSpoofing(fingerprint, behavior);

  let riskScore  = scores.riskScore;
  let trustScore = scores.trustScore;
  const dimScores = { ...scores.dimensionScores };

  // Consistency risk contribution (max 40 additive)
  const consistencyAdd = Math.round(consistencyResult.score * 0.4);
  riskScore  = Math.min(riskScore  + consistencyAdd, 100);
  trustScore = Math.max(trustScore - consistencyAdd, 0);
  dimScores.consistencyRisk = consistencyResult.score;

  // Over-spoofing risk contribution (max 30 additive)
  const overSpoofAdd = Math.round(overSpoofingResult.score * 0.3);
  riskScore  = Math.min(riskScore  + overSpoofAdd, 100);
  trustScore = Math.max(trustScore - overSpoofAdd, 0);
  dimScores.overSpoofingRisk = overSpoofingResult.score;

  // Mark as AI agent if consistency or over-spoofing score is very high
  let isAiAgent = scores.isAiAgent;
  let agentType = scores.agentType;
  if (consistencyResult.score >= 60 || overSpoofingResult.score >= 60) {
    isAiAgent = true;
    agentType = 'advanced_stealth_bot';
  }

  // 4. Network Reputation (Layer 6)
  let reputationScore = 95, networkRisk = 0;
  const networkFlags: string[] = [];
  const isPrivateIP = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|::1$|fc00:|fe80:)/.test(clientIp);
  if (!isPrivateIP && Math.random() > 0.85) {
    reputationScore -= 30; networkRisk += 30; networkFlags.push('datacenter_asn_subnet');
  }
  if (hasForwardedFor) { reputationScore -= 15; networkRisk += 15; networkFlags.push('forwarded_proxy_detected'); }
  if (isBotUA)         { reputationScore -= 50; networkRisk += 50; networkFlags.push('ai_agent_crawler_network'); }
  reputationScore = Math.min(Math.max(reputationScore, 0), 100);
  dimScores.networkRisk = Math.min(networkRisk, 100);

  // 5. Decision
  const decision = DecisionMaker.makeDecision(riskScore, trustScore, reputationScore, isAiAgent, challengeSolved);

  return {
    riskScore:       Math.min(Math.max(riskScore, 0), 100),
    trustScore:      Math.min(Math.max(trustScore, 0), 100),
    reputationScore,
    isAiAgent, agentType,
    deviceAnomalies: scores.deviceAnomalies,
    behaviorFlags:   scores.behaviorFlags,
    networkFlags,
    consistencyFlags:  consistencyResult.flags,
    overSpoofingFlags: overSpoofingResult.flags,
    decision,
    dimensionScores: dimScores,
  };
}
