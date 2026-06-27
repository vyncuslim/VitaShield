import React, { useState, useEffect, useRef } from 'react';
import type { ShieldConfig } from '../types';

interface WidgetPlaygroundProps {
  config: ShieldConfig;
  onAddLog: (method: 'behavioral_telemetry' | 'captcha_3d' | 'biometric_scan' | 'cryptographic_pow', status: 'passed' | 'flagged' | 'blocked', score: number) => void;
}

export const WidgetPlayground: React.FC<WidgetPlaygroundProps> = ({ config, onAddLog }) => {
  const [formType, setFormType] = useState<'signup' | 'login' | 'ai_apps' | 'crypto'>('signup');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('100');
  const [address, setAddress] = useState('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  const [prompt, setPrompt] = useState('Generate an optimized React table component.');
  
  // Widget states
  const [widgetActive, setWidgetActive] = useState(false);
  const [currentMethod, setCurrentMethod] = useState<'behavioral_telemetry' | 'captcha_3d' | 'biometric_scan' | 'cryptographic_pow'>('behavioral_telemetry');
  const [widgetState, setWidgetState] = useState<'idle' | 'running' | 'interactive' | 'success' | 'failed'>('idle');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  
  // 3D CAPTCHA states
  const [captchaRotation, setCaptchaRotation] = useState(135); // Start off-center
  const [isCaptchaTargetReached, setIsCaptchaTargetReached] = useState(false);

  // Biometric Scan states
  const [bioProgress, setBioProgress] = useState(0);

  // PoW puzzle states
  const [powProgress, setPowProgress] = useState(0);
  const [powNonce, setPowNonce] = useState('0x00000000');
  const [powConsoleLines, setPowConsoleLines] = useState<string[]>([]);

  // Ref to automatically scroll terminal to bottom
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  const addTerminalLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  const startVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (widgetState === 'running' || widgetState === 'success') return;

    setWidgetActive(true);
    setWidgetState('running');
    setTerminalLogs([]);
    addTerminalLog('CLIENT SDK: Telemetry active. Collecting client device info (screen resolution, WebGL vendor)...');
    addTerminalLog('CLIENT SDK: Telemetry active. Collecting client browser info (locales, user-agent details)...');
    addTerminalLog('CLIENT SDK: Telemetry active. Monitoring user behavior (mouse trajectory kinematics, typing intervals)...');
    addTerminalLog('CLIENT SDK: Compiling telemetry payload and dispatching to Secure Gateway...');

    // Determine verification method
    let method = config.forcedMethod;
    if (method === 'auto') {
      if (config.preset === 'social') {
        method = 'captcha_3d';
      } else if (config.preset === 'ai_apps') {
        method = 'cryptographic_pow';
      } else if (config.preset === 'crypto') {
        method = 'biometric_scan';
      } else if (config.preset === 'gaming') {
        method = 'behavioral_telemetry';
      } else {
        // general preset uses strictness
        if (config.strictness === 'high') {
          method = 'biometric_scan';
        } else if (config.strictness === 'medium') {
          method = 'captcha_3d';
        } else {
          method = 'behavioral_telemetry';
        }
      }
    }

    setCurrentMethod(method);
    
    setTimeout(() => {
      addTerminalLog('SECURE GATEWAY: Connection established. Routing metadata packet to Risk Engine...');
      
      if (method === 'behavioral_telemetry') {
        addTerminalLog('RISK ENGINE: Scoring telemetry payload -> Risk Score: 12/100 (Safe range: 0-30).');
        addTerminalLog('VERIFICATION ENGINE: Analysis complete -> Classification: HUMAN.');
        addTerminalLog('SECURE GATEWAY: Decision -> ALLOW. Form submission authorized silently.');
        simulateInvisibleTelemetry();
      } else if (method === 'captcha_3d') {
        addTerminalLog('RISK ENGINE: Scoring telemetry payload -> Risk Score: 48/100 (Medium range: 31-70).');
        addTerminalLog('VERIFICATION ENGINE: Analysis complete -> Classification: SUSPECT/BOT_MARKER_FOUND.');
        addTerminalLog('SECURE GATEWAY: Decision -> CHALLENGE. Directing client to 3D CAPTCHA module.');
        simulate3DCaptcha();
      } else if (method === 'biometric_scan') {
        addTerminalLog('RISK ENGINE: Scoring telemetry payload -> Risk Score: 62/100 (Medium range: 31-70).');
        addTerminalLog('VERIFICATION ENGINE: Analysis complete -> Classification: UNKNOWN_INTEGRITY.');
        addTerminalLog('SECURE GATEWAY: Decision -> CHALLENGE. Requesting client biometric facial geometric check.');
        simulateBiometricScan();
      } else if (method === 'cryptographic_pow') {
        addTerminalLog('RISK ENGINE: Scoring telemetry payload -> Risk Score: 68/100 (Medium range: 31-70).');
        addTerminalLog('VERIFICATION ENGINE: Analysis complete -> Classification: REPETITIVE_REQUESTS_SUSPECTED.');
        addTerminalLog('SECURE GATEWAY: Decision -> CHALLENGE. Requesting client cryptographic Proof-of-Work.');
        simulateProofOfWork();
      }
    }, 600);
  };

  // 1. Silent invisible check simulation
  const simulateInvisibleTelemetry = () => {
    setTimeout(() => {
      addTerminalLog('GATEWAY: Signature payload finalized. Verification token created.');
      setWidgetState('success');
      onAddLog('behavioral_telemetry', 'passed', 12);
    }, 800);
  };

  // 2. 3D alignment puzzle
  const simulate3DCaptcha = () => {
    setCaptchaRotation(120 + Math.floor(Math.random() * 80)); // random rotation offset
    setIsCaptchaTargetReached(false);
    setWidgetState('interactive');
  };

  const handleCaptchaSlider = (val: number) => {
    setCaptchaRotation(val);
    const tolerance = 8;
    const diff = Math.abs(val);
    if (diff <= tolerance) {
      setIsCaptchaTargetReached(true);
    } else {
      setIsCaptchaTargetReached(false);
    }
  };

  const submitCaptcha = () => {
    if (isCaptchaTargetReached) {
      addTerminalLog('CLIENT SDK: Interactive alignment successfully solved by user (upright visual target match).');
      addTerminalLog('VERIFICATION ENGINE: Slider pattern matches human kinematics. Classification -> HUMAN.');
      addTerminalLog('SECURE GATEWAY: Decision -> ALLOW. Granting clearance token.');
      
      setTimeout(() => {
        setWidgetState('success');
        onAddLog('captcha_3d', 'passed', 18);
      }, 600);
    } else {
      addTerminalLog('CLIENT SDK: Object rotation incorrect. Solve failed.');
    }
  };

  // 3. Biometric scanning
  const simulateBiometricScan = () => {
    setBioProgress(0);
    setWidgetState('running');
    
    setTimeout(() => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        setBioProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(interval);
          addTerminalLog('CLIENT SDK: Liveness checks and geometric facial mesh mapping finished.');
          addTerminalLog('VERIFICATION ENGINE: Mathematical model returns HUMAN liveness signature.');
          addTerminalLog('SECURE GATEWAY: Decision -> ALLOW. Granting clearance token.');
          
          setTimeout(() => {
            setWidgetState('success');
            onAddLog('biometric_scan', 'passed', 15);
          }, 500);
        }
      }, 150);
    }, 400);
  };

  // 4. Client-side Proof of Work math puzzle
  const simulateProofOfWork = () => {
    setPowProgress(0);
    setPowConsoleLines(['[CLIENT SDK] Initializing SHA-256 loop...']);
    setWidgetState('running');

    setTimeout(() => {
      let currentPercent = 0;
      const lines = [
        'Nonce check: 0x0ea82b1d -> Hash: a2fd...',
        'Nonce check: 0x3d0b2f9a -> Hash: 91fa...',
        'Nonce check: 0x9a8f27c3 -> Hash: 00b4...',
        'Nonce check: 0x1f9e2d3c -> Hash: 000c...',
        'Nonce check: 0x7c9b8e21 -> Hash: 00000a7b...'
      ];

      const interval = setInterval(() => {
        currentPercent += 20;
        setPowProgress(currentPercent);
        
        const lineIdx = Math.floor((currentPercent / 100) * (lines.length - 1));
        setPowConsoleLines((prev) => [...prev, lines[lineIdx]]);

        if (currentPercent >= 100) {
          clearInterval(interval);
          setPowNonce('0x7c9b8e21');
          addTerminalLog('CLIENT SDK: SHA-256 collision nonce calculated.');
          addTerminalLog('VERIFICATION ENGINE: Hash verified against difficulty envelope. Classification -> HUMAN.');
          addTerminalLog('SECURE GATEWAY: Decision -> ALLOW. Granting clearance token.');
          
          setTimeout(() => {
            setWidgetState('success');
            onAddLog('cryptographic_pow', 'passed', 8);
          }, 500);
        }
      }, 300);
    }, 400);
  };

  const resetForm = () => {
    setWidgetActive(false);
    setWidgetState('idle');
    setCaptchaRotation(135);
    setIsCaptchaTargetReached(false);
    setBioProgress(0);
    setPowProgress(0);
  };

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title} className="gradient-text">Verification Widget Playground</h1>
          <p style={styles.subtitle}>Test how VitaShield renders and behaves inside mock web transaction routers.</p>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Left Column: Form Simulator */}
        <div className="glass-panel" style={styles.formPanel}>
          <div style={styles.formPanelHeader}>
            <span style={styles.panelTitle}>Target Form Simulator</span>
            <select 
              value={formType} 
              onChange={(e) => {
                setFormType(e.target.value as any);
                resetForm();
              }}
              style={styles.formSelector}
            >
              <option value="signup">Secure Signup Demo (Anti-Spam / Registration)</option>
              <option value="login">Secure Login Demo (Anti-Credential Stuffing)</option>
              <option value="ai_apps">Bot Detection Sandbox (API Protection Demo)</option>
              <option value="crypto">Crypto Web3 Demo (Anti-Sybil Airdrop Claim)</option>
            </select>
          </div>

          <form onSubmit={startVerification} style={styles.form}>
            {formType === 'signup' && (
              <>
                <div className="input-group">
                  <label className="input-label">Social Username</label>
                  <input required type="text" placeholder="vitamind_fan" value={username} onChange={e=>setUsername(e.target.value)} className="input-field" />
                </div>
                <div className="input-group">
                  <label className="input-label">User Description (Bio)</label>
                  <textarea placeholder="AI researcher and developer..." value={email} onChange={e=>setEmail(e.target.value)} className="input-field" style={{ height: '70px', resize: 'none' }} />
                </div>
              </>
            )}

            {formType === 'login' && (
              <>
                <div className="input-group">
                  <label className="input-label">User Account Email</label>
                  <input required type="email" placeholder="admin@vitamind.ai" value={email} onChange={e=>setEmail(e.target.value)} className="input-field" />
                </div>
                <div className="input-group">
                  <label className="input-label">Secure Passcode</label>
                  <input required type="password" placeholder="••••••••••••" className="input-field" />
                </div>
              </>
            )}

            {formType === 'ai_apps' && (
              <>
                <div className="input-group">
                  <label className="input-label">LLM API Query Prompt</label>
                  <textarea required value={prompt} onChange={e=>setPrompt(e.target.value)} className="input-field" style={{ height: '70px', resize: 'none' }} />
                </div>
                <div className="input-group">
                  <label className="input-label">Max Token Output Limit</label>
                  <input required type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="input-field" />
                </div>
              </>
            )}

            {formType === 'crypto' && (
              <>
                <div className="input-group">
                  <label className="input-label">Web3 Wallet Address</label>
                  <input required type="text" value={address} onChange={e=>setAddress(e.target.value)} className="input-field" />
                </div>
                <div className="input-group">
                  <label className="input-label">Airdrop Tokens to Claim ($VMD)</label>
                  <input required type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="input-field" />
                </div>
              </>
            )}

            {/* Simulated VitaShield widget container */}
            <div style={styles.widgetContainerOuter}>
              {!widgetActive ? (
                <div style={styles.widgetPlaceholder}>
                  <div style={styles.widgetLogoPlaceholder}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <span style={styles.widgetPlaceholderText}>VitaShield protects this form submit trigger.</span>
                </div>
              ) : (
                <div className="glass-panel" style={styles.widgetBox}>
                  {/* Widget Running state */}
                  {widgetState === 'running' && (
                    <div style={styles.widgetSubState}>
                      {currentMethod === 'biometric_scan' ? (
                        <>
                          <div className={`biometric-scanner-box scanning`}>
                            <div className="biometric-grid" />
                            <div className="biometric-face-path">
                              <div className="biometric-eye-line">
                                <span className="biometric-eye-dot" />
                                <span className="biometric-eye-dot" />
                              </div>
                            </div>
                            <div className="biometric-sweep-line" />
                          </div>
                          <span style={styles.widgetStatusMain}>Biometric Facial Geometry Sweep...</span>
                          <span style={styles.widgetStatusSub}>{bioProgress}% mesh scanning completed</span>
                        </>
                      ) : currentMethod === 'cryptographic_pow' ? (
                        <>
                          <div className="pow-progress-box">
                            <div style={styles.powStatusRow}>
                              <span style={{color: '#fff'}}>Proof of Work Math Solver {powProgress === 100 && `(Nonce: ${powNonce})`}</span>
                              <span style={{fontFamily: 'var(--font-mono)'}}>{powProgress}%</span>
                            </div>
                            <div className="pow-loading-bar">
                              <div className="pow-loading-progress" style={{ width: `${powProgress}%` }} />
                            </div>
                            <div className="pow-puzzle-console">
                              {powConsoleLines.map((line, idx) => (
                                <div key={idx}>{line}</div>
                              ))}
                            </div>
                          </div>
                          <span style={{ ...styles.widgetStatusSub, marginTop: '0.5rem' }}>Solving client-side cryptographic puzzles (non-interactive bot mitigation)...</span>
                        </>
                      ) : (
                        <>
                          <div style={styles.spinner} />
                          <span style={styles.widgetStatusMain}>Analyzing browser telemetry dynamics...</span>
                          <span style={styles.widgetStatusSub}>Checking device markers & request environment</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Widget Interactive 3D CAPTCHA state */}
                  {widgetState === 'interactive' && currentMethod === 'captcha_3d' && (
                    <div style={styles.widgetSubState}>
                      <div className="captcha-container-box">
                        <div className={`captcha-viewport ${isCaptchaTargetReached ? 'verified' : ''}`}>
                          <div className="captcha-success-glow" />
                          
                          {/* target silhouette outline */}
                          <div className="captcha-target-silhouette" />
                          
                          {/* rotatable wireframe shape */}
                          <div 
                            className="captcha-object-wrapper"
                            style={{ transform: `rotate(${captchaRotation}deg)` }}
                          >
                            <div className="captcha-wireframe-cube">
                              <div className="captcha-wireframe-indicator" />
                            </div>
                          </div>
                        </div>

                        <div className="captcha-slider-bar">
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={captchaRotation}
                            onChange={(e) => handleCaptchaSlider(Number(e.target.value))}
                            className="captcha-slider-input"
                          />
                        </div>
                      </div>

                      <span style={{ ...styles.widgetStatusMain, marginTop: '0.75rem' }}>Align Upright Challenge</span>
                      <span style={styles.widgetStatusSub}>Rotate the 3D cube model until the dot matches the top slot.</span>
                      
                      <button 
                        type="button" 
                        onClick={submitCaptcha}
                        style={{
                          ...styles.widgetSubmitBtn,
                          opacity: isCaptchaTargetReached ? 1 : 0.5,
                          cursor: isCaptchaTargetReached ? 'pointer' : 'not-allowed'
                        }}
                      >
                        Confirm Alignment
                      </button>
                    </div>
                  )}

                  {/* Widget Success state */}
                  {widgetState === 'success' && (
                    <div style={styles.widgetSuccessState}>
                      <div style={styles.successIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div style={styles.successTextContainer}>
                        <div style={styles.successTitle}>Security Clearance Verified</div>
                        <div style={styles.successDesc}>Token: <code>vmt_live_{Math.floor(Math.random()*100000)}...</code></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submission Actions */}
            <div style={styles.actionRow}>
              {widgetState === 'success' ? (
                <button type="button" onClick={resetForm} style={styles.actionBtnSecondary}>
                  Reset Playground
                </button>
              ) : (
                <button type="submit" disabled={widgetState === 'running'} style={styles.actionBtnPrimary}>
                  {widgetState === 'running' ? 'Verifying Session...' : 'Secure Submit Request'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Live API Log Console */}
        <div className="glass-panel" style={styles.consolePanel}>
          <div style={styles.consoleHeader}>
            <div style={styles.consoleIndicatorRow}>
              <span style={styles.consoleDot} />
              <span style={styles.consoleTitle}>Shield Edge Log Terminal</span>
            </div>
            <button onClick={() => setTerminalLogs([])} style={styles.clearBtn}>
              Clear Terminal
            </button>
          </div>

          <div style={styles.consoleBody}>
            {terminalLogs.length === 0 ? (
              <div style={styles.consoleEmpty}>
                Waiting for form submission triggers... Click 'Secure Submit Request' to watch real-time client-gateway protocol handshakes.
              </div>
            ) : (
              <div style={styles.consoleOutput}>
                {terminalLogs.map((log, idx) => (
                  <div key={idx} style={styles.consoleLine}>
                    {log}
                  </div>
                ))}
                {widgetState === 'success' && (
                  <div style={styles.jsonOutput}>
                    {`// POST /v1/verify response payload:
{
  "success": true,
  "client_sdk_collection": {
    "device_info": {
      "screen_resolution": "2560x1440",
      "hardware_concurrency": 8,
      "device_memory": 16
    },
    "browser_info": {
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0",
      "locales": ["zh-TW", "en-US"],
      "timezone": "Asia/Taipei"
    },
    "user_behavior": {
      "mouse_click_intervals_ms": [120, 240, 80],
      "keystroke_cadence_score": 92
    }
  },
  "risk_engine": {
    "score": ${currentMethod === 'behavioral_telemetry' ? 12 : currentMethod === 'captcha_3d' ? 48 : currentMethod === 'biometric_scan' ? 62 : 68},
    "level": "${currentMethod === 'behavioral_telemetry' ? 'Safe (0-30)' : 'Medium (31-70)'}"
  },
  "verification_engine": {
    "classification": "human",
    "challenge_completed": "${currentMethod}"
  },
  "secure_gateway_decision": {
    "action": "allow",
    "gateway_code": "ALLOW_CLEARED_SESSION",
    "timestamp": "${new Date().toISOString()}"
  }
}`}
                  </div>
                )}
                <div ref={terminalEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.03em'
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.98rem',
    marginTop: '0.25rem'
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '1.5rem',
    alignItems: 'start'
  },
  formPanel: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  formPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    paddingBottom: '1rem'
  },
  panelTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.02em'
  },
  formSelector: {
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.45rem 0.75rem',
    fontSize: '0.82rem',
    color: '#fff',
    cursor: 'pointer',
    outline: 'none'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  widgetContainerOuter: {
    marginTop: '0.5rem',
    marginBottom: '1.5rem'
  },
  widgetPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px dashed var(--border-color)',
    borderRadius: '10px',
    padding: '0.85rem 1rem'
  },
  widgetLogoPlaceholder: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: 'rgba(6, 182, 212, 0.05)',
    border: '1px solid rgba(6, 182, 212, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  widgetPlaceholderText: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)'
  },
  widgetBox: {
    padding: '1.25rem',
    background: 'rgba(0, 0, 0, 0.35)',
    border: '1.5px solid rgba(6, 182, 212, 0.18)',
    boxShadow: 'var(--glow-shadow)',
    borderRadius: '12px'
  },
  widgetSubState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 0'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(6, 182, 212, 0.1)',
    borderTopColor: 'var(--secondary)',
    borderRadius: '50%',
    animation: 'spin-slow 1s linear infinite',
    marginBottom: '1rem'
  },
  widgetStatusMain: {
    fontSize: '0.92rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.2rem'
  },
  widgetStatusSub: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
    lineHeight: '1.4'
  },
  widgetSubmitBtn: {
    marginTop: '1.25rem',
    width: '100%',
    padding: '0.65rem 1rem',
    background: 'var(--secondary)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '600',
    fontSize: '0.85rem',
    transition: 'background 0.2s ease'
  },
  widgetSuccessState: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  successIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'var(--success)',
    boxShadow: '0 0 15px var(--success)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  successTextContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  successTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#fff'
  },
  successDesc: {
    fontSize: '0.76rem',
    color: 'var(--text-muted)',
    marginTop: '0.15rem'
  },
  actionRow: {
    display: 'flex',
    gap: '0.75rem'
  },
  actionBtnPrimary: {
    flex: 1,
    padding: '0.8rem',
    background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
    border: 'none',
    color: '#fff',
    fontWeight: '700',
    fontSize: '0.92rem',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(6, 182, 212, 0.15)'
  },
  actionBtnSecondary: {
    flex: 1,
    padding: '0.8rem',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    fontWeight: '600',
    fontSize: '0.92rem',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  consolePanel: {
    padding: '1.5rem',
    height: '480px',
    display: 'flex',
    flexDirection: 'column'
  },
  consoleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '0.75rem',
    marginBottom: '1rem'
  },
  consoleIndicatorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  consoleDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--secondary)',
    boxShadow: '0 0 6px var(--secondary)',
    display: 'inline-block'
  },
  consoleTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'var(--font-mono)'
  },
  clearBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontWeight: '500'
  },
  consoleBody: {
    flex: 1,
    background: '#04060b',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    padding: '1rem',
    overflowY: 'auto',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5'
  },
  consoleEmpty: {
    color: 'var(--text-dark)',
    textAlign: 'center',
    padding: '3rem 1.5rem'
  },
  consoleOutput: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  consoleLine: {
    color: '#e2e8f0',
    whiteSpace: 'pre-wrap'
  },
  jsonOutput: {
    color: 'var(--secondary)',
    marginTop: '0.75rem',
    borderTop: '1px dashed rgba(255, 255, 255, 0.05)',
    paddingTop: '0.75rem',
    whiteSpace: 'pre-wrap'
  }
};
