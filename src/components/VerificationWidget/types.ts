export interface TelemetryFingerprint {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  timezone: string;
  language: string;
  webdriverActive: boolean;
  pluginsCount: number;
  webglRenderer: string;
  outerDimensionsZeroed: boolean;
  isMobile: boolean;
  isTablet?: boolean;
  touchSupport?: boolean;
  maxTouchPoints?: number;
  chromeRuntimeMissing?: boolean;
  pluginsArrayEmpty?: boolean;
  languagesEmpty?: boolean;
  permissionQueryMismatch?: boolean;
  webdriverSpoofed?: boolean;
  // Canvas fingerprint hash
  canvasFingerprint?: string;
  // Hardware concurrency (CPU cores)
  hardwareConcurrency?: number;
  // Device memory (GB)
  deviceMemory?: number;
  // Color depth
  colorDepth?: number;
}

export interface TouchPoint {
  x: number;
  y: number;
  t: number;
  pressure: number;
  radiusX: number;
  radiusY: number;
}

export interface MotionSample {
  ax: number; // acceleration x
  ay: number; // acceleration y
  az: number; // acceleration z
  t: number;
}

export interface OrientationSample {
  alpha: number;
  beta: number;
  gamma: number;
  t: number;
}

export interface TelemetryBehavior {
  mouseEventsCount: number;
  keyPressesCount: number;
  scrollsCount: number;
  mousePoints: Array<{ x: number; y: number; t: number }>;
  keyTimings: number[];
  challengeSolved: boolean;
  challengeMethod: string;
  durationMs: number;
  backspaceCount?: number;
  lastPasteTime?: number;
  submitPauseMs?: number;
  clickCount?: number;
  clickAnomalies?: number;
  focusChanges?: number;
  tabSwitches?: number;
  scrollTimings?: number[];
  // Mobile sensor telemetry
  touchEvents?: TouchPoint[];
  touchEventsCount?: number;
  motionSamples?: MotionSample[];
  orientationSamples?: OrientationSample[];
  sensorAvailable?: boolean;
  sensorIsStatic?: boolean; // sensor never moves → emulated device
  // Entropy metrics
  mouseEntropyScore?: number;
  keystrokeEntropyScore?: number;
}

export interface TelemetryPayload {
  fingerprint: TelemetryFingerprint;
  behavior: TelemetryBehavior;
}
