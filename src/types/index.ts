export interface VerificationLog {
  id: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  method: 'behavioral_telemetry' | 'captcha_3d' | 'biometric_scan' | 'cryptographic_pow';
  status: 'passed' | 'flagged' | 'blocked';
  riskScore: number; // 0 to 100
}

export interface ShieldConfig {
  preset: 'general' | 'social' | 'ai_apps' | 'crypto' | 'gaming';
  strictness: 'low' | 'medium' | 'high';
  forcedMethod: 'auto' | 'behavioral_telemetry' | 'captcha_3d' | 'biometric_scan' | 'cryptographic_pow';
  bypassIpList: string[];
  blockIpList: string[];
}

export interface DeveloperKeys {
  publicKey: string;
  secretKey: string;
}
