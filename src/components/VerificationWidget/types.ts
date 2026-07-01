// ─── Fingerprint Types ────────────────────────────────────────────────────────

export interface StorageAvailability {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
}

export interface NetworkInfo {
  effectiveType?: string; // '4g' | '3g' | '2g' | 'slow-2g'
  downlink?: number;      // Mbps
  rtt?: number;           // ms
  saveData?: boolean;
}

export interface WebGLInfo {
  renderer: string;
  vendor: string;
  version: string;
  maxTextureSize: number;
  maxViewportDims: [number, number];
  shadingLanguageVersion: string;
}

export interface PerformanceTiming {
  pageLoadTimeMs: number;   // loadEventEnd - navigationStart
  domReadyTimeMs: number;   // domContentLoadedEventEnd - navigationStart
  firstPaintMs: number;     // first paint entry (if available)
}

export interface TelemetryFingerprint {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  screenAvailWidth: number;
  screenAvailHeight: number;
  screenPixelRatio: number;
  screenOrientation: string;
  colorDepth: number;
  timezone: string;
  timezoneOffset: number;
  language: string;
  // Navigator properties
  navigatorVendor: string;
  navigatorPlatform: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  maxTouchPoints: number;
  pluginsCount: number;
  pluginNames: string[];
  // Touch & mobile
  isMobile: boolean;
  isTablet: boolean;
  touchSupport: boolean;
  // Automation markers
  webdriverActive: boolean;
  webdriverSpoofed: boolean;
  chromeRuntimeMissing: boolean;
  pluginsArrayEmpty: boolean;
  languagesEmpty: boolean;
  permissionQueryMismatch: boolean;
  outerDimensionsZeroed: boolean;
  // Fingerprint hashes
  canvasFingerprint: string;
  fontDetectionHash: string;
  // WebGL (extended)
  webglRenderer: string;
  webglVendor: string;
  webglVersion: string;
  webglMaxTextureSize: number;
  // API support flags (for consistency check)
  hasWebRTC: boolean;
  hasServiceWorker: boolean;
  hasWebWorker: boolean;
  hasIndexedDB: boolean;
  hasWebGL: boolean;
  // Network info
  networkInfo: NetworkInfo;
  // Storage
  storageAvailability: StorageAvailability;
  // Performance timing
  performanceTiming: PerformanceTiming;
}

// ─── Touch Telemetry ──────────────────────────────────────────────────────────

export interface TouchPoint {
  x: number;
  y: number;
  t: number;
  pressure: number;       // touch.force / pressure
  radiusX: number;
  radiusY: number;
  rotationAngle: number;  // touch.rotationAngle
}

// ─── Sensor Telemetry ─────────────────────────────────────────────────────────

export interface MotionSample {
  ax: number; // acceleration x (m/s²)
  ay: number; // acceleration y (m/s²)
  az: number; // acceleration z (m/s²)
  t: number;
}

export interface OrientationSample {
  alpha: number;
  beta: number;
  gamma: number;
  t: number;
}

// ─── Behavior Telemetry ───────────────────────────────────────────────────────

export interface TelemetryBehavior {
  mouseEventsCount: number;
  keyPressesCount: number;
  scrollsCount: number;
  mousePoints: Array<{ x: number; y: number; t: number }>;
  keyTimings: number[];
  challengeSolved: boolean;
  challengeMethod: string;
  durationMs: number;
  backspaceCount: number;
  lastPasteTime: number;
  submitPauseMs: number;
  clickCount: number;
  clickAnomalies: number;
  focusChanges: number;
  tabSwitches: number;
  scrollTimings: number[];
  // Mobile sensor
  touchEvents: TouchPoint[];
  touchEventsCount: number;
  touchRotationVariance: number; // variance in touch rotation angles
  motionSamples: MotionSample[];
  orientationSamples: OrientationSample[];
  sensorAvailable: boolean;
  sensorIsStatic: boolean;
  accelerometerHasGravity: boolean; // magnitude ≈ 9.8 m/s²
  accelerometerStdDev: number;
  gyroscopeStdDev: number;
  // Entropy metrics
  mouseEntropyScore: number;
  keystrokeEntropyScore: number;
}

// ─── Root Payload ─────────────────────────────────────────────────────────────

export interface TelemetryPayload {
  fingerprint: TelemetryFingerprint;
  behavior: TelemetryBehavior;
  sdkVersion: string;
}
