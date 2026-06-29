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
}

export interface TelemetryPayload {
  fingerprint: TelemetryFingerprint;
  behavior: TelemetryBehavior;
}
