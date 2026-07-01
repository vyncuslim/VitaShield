import React, { useState, useEffect } from 'react';
import { VerificationWidget } from './VerificationWidget/VerificationWidget';
import { useBehaviorTracker } from './VerificationWidget/useBehaviorTracker';
import { MATRIX_CATEGORIES } from './SystemSpecs';
import { evaluateTelemetry } from '../lib/riskEngine';
import { DailyCheckinWidget } from './DailyCheckinWidget';

interface MarketingPortalProps {
  onEnterConsole: () => void;
}

export const MarketingPortal: React.FC<MarketingPortalProps> = ({ onEnterConsole }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [demoResults, setDemoResults] = useState<any>(null);
  const [demoLoading, setDemoLoading] = useState<boolean>(false);
  const [demoMail, setDemoMail] = useState<string>('tester@company.com');
  const [activeMatrixCategory, setActiveMatrixCategory] = useState<string>('behavioral');
  const [docsTab, setDocsTab] = useState<'nodejs' | 'python' | 'go' | 'curl'>('nodejs');

  // Interactive Backend API sandbox states
  const [mockRiskScore, setMockRiskScore] = useState<number>(12);
  const [mockWebdriver, setMockWebdriver] = useState<boolean>(false);
  const [mockStraightMouse, setMockStraightMouse] = useState<boolean>(false);
  const [mockSwiftshader, setMockSwiftshader] = useState<boolean>(false);

  // Cycle the 4-step flowchart automatically every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Real-time live behavior tracker
  const { getTelemetryToken } = useBehaviorTracker();
  const [liveTelemetry, setLiveTelemetry] = useState<any>(null);

  const handleDemoVerify = async (token: string) => {
    setDemoLoading(true);
    
    setTimeout(() => {
      try {
        const decodedString = atob(token);
        const telemetry = JSON.parse(decodedString);
        
        const fingerprint = telemetry.fingerprint || {};
        const behavior = telemetry.behavior || {};
        
        const clientIp = '127.0.0.1';
        const hasForwardedFor = false;
        const aiAgentPatterns = [
          /openai/i, /gptbot/i, /chatgpt/i, /chat-gpt/i, /claude/i, /anthropic/i,
          /google-extended/i, /googlebot/i, /bingbot/i, /crawler/i, /spider/i,
          /python-urllib/i, /axios/i, /headless/i, /puppeteer/i, /playwright/i,
          /selenium/i, /webdriver/i, /operator/i
        ];
        const userAgent = fingerprint.userAgent || '';
        const isBotUA = aiAgentPatterns.some(pattern => pattern.test(userAgent));

        const evaluation = evaluateTelemetry(
          fingerprint,
          behavior,
          clientIp,
          userAgent,
          hasForwardedFor,
          isBotUA
        );
        
        const mousePoints = behavior.mousePoints || [];
        let straightRatio = 1.25;
        if (mousePoints.length >= 4) {
          let pathLen = 0;
          for (let i = 1; i < mousePoints.length; i++) {
            pathLen += Math.sqrt(Math.pow(mousePoints[i].x - mousePoints[i-1].x, 2) + Math.pow(mousePoints[i].y - mousePoints[i-1].y, 2));
          }
          const first = mousePoints[0];
          const last = mousePoints[mousePoints.length - 1];
          const straight = Math.sqrt(Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2));
          straightRatio = pathLen / (straight || 1);
        }
        
        const keyTimings = behavior.keyTimings || [];
        let keyStd = 35;
        if (keyTimings.length >= 4) {
          const avg = keyTimings.reduce((a: number, b: number) => a + b, 0) / keyTimings.length;
          const variance = keyTimings.reduce((acc: number, t: number) => acc + Math.pow(t - avg, 2), 0) / keyTimings.length;
          keyStd = Math.sqrt(variance);
        }
        
        setDemoResults({
          success: true,
          decision: evaluation.decision,
          scores: {
            risk_score: evaluation.riskScore,
            trust_score: evaluation.trustScore,
            reputation_score: evaluation.reputationScore
          },
          details: {
            is_ai_agent: evaluation.isAiAgent,
            device_anomalies: evaluation.deviceAnomalies,
            behavior_flags: evaluation.behaviorFlags.concat(evaluation.networkFlags),
            mouse_straightness: Math.round(straightRatio * 100) / 100,
            key_std_dev: Math.round(keyStd * 10) / 10
          }
        });
      } catch (err) {
        setDemoResults({
          success: true,
          decision: 'allow',
          scores: { risk_score: 12, trust_score: 94, reputation_score: 95 },
          details: { is_ai_agent: false, device_anomalies: [], behavior_flags: [] }
        });
      } finally {
        setDemoLoading(false);
      }
    }, 600);
  };

  // Cycle through flowchart animation steps
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Poll live behavior telemetry for real-time visualization without click
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const token = getTelemetryToken();
        const decodedString = atob(token);
        const telemetry = JSON.parse(decodedString);
        
        const fingerprint = telemetry.fingerprint || {};
        const behavior = telemetry.behavior || {};
        
        let riskScore = 0;
        let trustScore = 100;
        const anomalies = [];
        const flags = [];
        
        if (fingerprint.webdriverActive) {
          riskScore += 45;
          anomalies.push('navigator_webdriver_active');
        }
        
        const mousePoints = behavior.mousePoints || [];
        let straightRatio = 1.25;
        if (mousePoints.length >= 4) {
          let pathLen = 0;
          for (let i = 1; i < mousePoints.length; i++) {
            pathLen += Math.sqrt(Math.pow(mousePoints[i].x - mousePoints[i-1].x, 2) + Math.pow(mousePoints[i].y - mousePoints[i-1].y, 2));
          }
          const first = mousePoints[0];
          const last = mousePoints[mousePoints.length - 1];
          const straight = Math.sqrt(Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2));
          straightRatio = pathLen / (straight || 1);
          if (straightRatio < 1.025) {
            riskScore += 30;
            trustScore -= 30;
            flags.push('perfectly_straight_mouse_trajectory');
          }
        }
        
        const keyTimings = behavior.keyTimings || [];
        let keyStd = 35;
        if (keyTimings.length >= 4) {
          const avg = keyTimings.reduce((a: number, b: number) => a + b, 0) / keyTimings.length;
          const variance = keyTimings.reduce((acc: number, t: number) => acc + Math.pow(t - avg, 2), 0) / keyTimings.length;
          keyStd = Math.sqrt(variance);
          if (keyStd < 8) {
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
        
        setLiveTelemetry({
          success: true,
          decision,
          scores: {
            risk_score: riskScore,
            trust_score: trustScore,
            reputation_score: 95
          },
          details: {
            is_ai_agent: false,
            device_anomalies: anomalies,
            behavior_flags: flags,
            mouse_straightness: Math.round(straightRatio * 100) / 100,
            key_std_dev: Math.round(keyStd * 10) / 10,
            mousePointsCount: mousePoints.length,
            keyPressesCount: behavior.keyPressesCount || 0
          }
        });
      } catch (err) {
        // fail silently
      }
    }, 150);
    return () => clearInterval(interval);
  }, [getTelemetryToken]);

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <header style={styles.topHeader}>
        <div style={styles.brand}>
          <div style={{ ...styles.logoIcon, background: 'transparent', border: 'none' }}>
            <img src="/logo.jpg" alt="VitaShield Logo" style={{ width: '100%', height: '100%', borderRadius: '4px', objectFit: 'cover' }} />
          </div>
          <span style={styles.brandName}>VitaShield</span>
          <span style={styles.brandSub}>BY VITAMIND AI</span>
        </div>

        <nav style={styles.topNav}>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#pipeline" style={styles.navLink}>How it Works</a>
          <a href="#matrix" style={styles.navLink}>Defense Matrix</a>
          <a href="#docs" style={styles.navLink}>Documentation</a>
          <a href="#contact" style={styles.navLink}>Contact</a>
          <button onClick={onEnterConsole} style={styles.consoleBtn}>Go to Console</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div className="grid-overlay" />
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <span style={styles.heroBadgePulse} />
            <span>AI-Native Verification Infrastructure</span>
          </div>
          <h1 style={styles.heroTitle} className="gradient-text">
            VitaShield <br />
            Next-Gen AI-Native Human Verification & Anti-Bot Infrastructure
          </h1>
          <p style={styles.heroSubtitle}>
            Engineered to counter advanced automation and AI agents, combining 13 proprietary innovations to deliver high-precision, zero-friction verification.
          </p>

          <div style={styles.heroCtas}>
            <button onClick={onEnterConsole} style={styles.primaryCta}>Deploy Shield Console</button>
            <a href="#demo-sandbox" style={styles.secondaryCta}>View Live Demo</a>
          </div>
        </div>
      </section>

      {/* Painpoint & Solution Section */}
      <section style={{ ...styles.section, borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '3.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {/* Painpoints */}
          <div className="glass-panel" style={{ padding: '2rem', borderLeft: '3px solid var(--danger)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--danger)' }}>⚠️</span> Traditional Verification Has Failed
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
              Today's bots and AI agents easily bypass standard CAPTCHA and slider puzzles by mimicking human trajectories.
              Enterprises face account abuse, web scraping, and API attacks, while legacy gatekeepers hurt user conversion rates.
            </p>
          </div>

          {/* Solutions */}
          <div className="glass-panel" style={{ padding: '2rem', borderLeft: '3px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#00f2fe', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--primary)' }}>🛡️</span> VitaShield: Redefining Human Verification
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
              VitaShield is a modern, <strong>AI-Native Human Verification Infrastructure</strong>.
              We merge behavioral biometrics, device fingerprinting, and proprietary heuristics to silently analyze traffic without client friction.
            </p>
          </div>
        </div>
      </section>

      {/* ── VitaShield Beta Daily Check-in ───────────────────────────────── */}
      <section id="daily-checkin" style={{ ...styles.section, paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: '40px', alignItems: 'center' }}>

            {/* Left: Text */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)',
                borderRadius: '20px', padding: '5px 14px', marginBottom: '16px',
              }}>
                <span style={{ fontSize: '12px', color: '#a855f7', fontWeight: 700, letterSpacing: '0.06em' }}>🧪 BETA PROGRAM</span>
              </div>
              <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.3 }}>
                Help Train the Future of<br />
                <span style={{ background: 'linear-gradient(135deg, #a855f7, #00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Human Verification AI
                </span>
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.7, margin: '0 0 20px' }}>
                每天完成一个 10 秒小挑战，你的自然行为数据将帮助 VitaShield 更好地区分真实人类与 AI Bot。
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { icon: '🖱️', text: '收集真实鼠标轨迹、点击节奏、反应时间' },
                  { icon: '🧠', text: '训练 VitaShield 行为识别 AI 模型' },
                  { icon: '🎁', text: '连续 4 天 → 免费获得 Neuro Plan 3 个月' },
                  { icon: '🔒', text: '数据严格保密，不出售给第三方 (PDPA 合规)' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Widget */}
            <DailyCheckinWidget />

          </div>
        </div>
      </section>

      {/* Flowchart "How it Works" Pipeline Section */}
      <section id="pipeline" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle} className="gradient-text">Cascading 3-Step Edge Defense</h2>
          <p style={styles.sectionSubtitle}>Cascade silent checks at the edge to distinguish human kinetics from AI agents.</p>
        </div>

        <div className="glass-panel" style={styles.pipelineBox}>
          <div style={styles.pipelineNodes}>
            {/* Node 1 */}
            <div style={{ ...styles.nodeCard, ...(activeStep === 0 ? styles.nodeCardActive : {}) }}>
              <div style={styles.nodeIconWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h4 style={styles.nodeTitle}>1. Invisible Telemetry</h4>
              <p style={styles.nodeDesc}>Frontend silently captures mouse kinematics and keyboard cadence without client actions.</p>
            </div>

            {/* Line 1 */}
            <div style={styles.connectionLine}>
              <div style={{ ...styles.linePulse, ...(activeStep === 0 ? styles.linePulseActive : {}) }} />
            </div>

            {/* Node 2 */}
            <div style={{ ...styles.nodeCard, ...(activeStep === 1 ? styles.nodeCardActive : {}) }}>
              <div style={styles.nodeIconWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <h4 style={styles.nodeTitle}>2. Token Compilation</h4>
              <p style={styles.nodeDesc}>Client SDK compiles encrypted browser telemetry dynamically into transactions.</p>
            </div>

            {/* Line 2 */}
            <div style={styles.connectionLine}>
              <div style={{ ...styles.linePulse, ...(activeStep === 1 ? styles.linePulseActive : {}) }} />
            </div>

            {/* Node 3 */}
            <div style={{ ...styles.nodeCard, ...(activeStep === 2 ? styles.nodeCardActive : {}) }}>
              <div style={styles.nodeIconWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h4 style={styles.nodeTitle}>3. Risk Scoring & Decision</h4>
              <p style={styles.nodeDesc}>Risk Engine evaluates telemetry into 0-100 scores to Allow, Challenge, or Block.</p>
            </div>

            {/* Line 3 */}
            <div style={styles.connectionLine}>
              <div style={{ ...styles.linePulse, ...(activeStep === 2 ? styles.linePulseActive : {}) }} />
            </div>

            {/* Node 4 */}
            <div style={{ ...styles.nodeCard, ...(activeStep === 3 ? styles.nodeCardActive : {}) }}>
              <div style={styles.nodeIconWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h4 style={styles.nodeTitle}>4. Adaptive Gate Decision</h4>
              <p style={styles.nodeDesc}>Low-risk queries pass instantly, high-risk flags trigger progressive verification layers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Features & Original Heuristics Section */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle} className="gradient-text">13 Proprietary Anti-Bot Heuristics</h2>
          <p style={styles.sectionSubtitle}>We build proprietary algorithms that detect advanced scripts and operator patterns.</p>
        </div>

        <div style={styles.productGrid}>
          <div className="glass-panel" style={styles.productCard}>
            <h4 style={styles.productTitle}>⚡ Sub-pixel Jitter & Bio-noise</h4>
            <p style={styles.productDesc}>
              Map sub-pixel micro-jitter and human physiological noise. Bots cannot mimic these tiny organic fluctuations.
            </p>
          </div>

          <div className="glass-panel" style={styles.productCard}>
            <h4 style={styles.productTitle}>⏳ Deceleration Pause Recognition</h4>
            <p style={styles.productDesc}>
              Track deceleration and hesitation intervals before clicks. Automations click instantly with constant speeds.
            </p>
          </div>

          <div className="glass-panel" style={styles.productCard}>
            <h4 style={styles.productTitle}>🧠 Adaptive Thinking Duration</h4>
            <p style={styles.productDesc}>
              Model appropriate thinking duration based on input complexity to prevent rapid script submissions.
            </p>
          </div>

          <div className="glass-panel" style={styles.productCard}>
            <h4 style={styles.productTitle}>⌨️ Backspace & Typo Analysis</h4>
            <p style={styles.productDesc}>
              Reward natural spelling errors and backspace corrections. Bots produce error-free keystroke cadence.
            </p>
          </div>

          <div className="glass-panel" style={styles.productCard}>
            <h4 style={styles.productTitle}>🔗 Multi-tab Cross-session Tracking</h4>
            <p style={styles.productDesc}>
              Correlate sessions across multiple browser tabs to capture concurrent automated form submissions.
            </p>
          </div>

          <div className="glass-panel" style={{ ...styles.productCard, border: '1px solid var(--secondary)', background: 'rgba(6, 182, 212, 0.05)' }}>
            <h4 style={{ ...styles.productTitle, color: 'var(--secondary)' }}>🛡️ Explore All 13 Proprietary Layers</h4>
            <p style={styles.productDesc}>
              VitaShield also equips clipboard chain analytics, focus flow entropy, and probabilistic scoring.
            </p>
            <div style={{ marginTop: '0.75rem' }}>
              <a href="#matrix" style={{ color: '#00f2fe', fontWeight: '700', textDecoration: 'none', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Go to Algorithm Matrix <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Scenarios and Why Choose Grid */}
      <section style={styles.section}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          {/* Scenarios */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, marginBottom: '1.25rem' }}>High-Value Protection Scenarios</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { title: 'SaaS Signup & Login Protection', desc: 'Block automated account creation and credential stuffing attacks.' },
                { title: 'Web3 Airdrop & Wallet Defense', desc: 'Prevent Sybil attacks and automated contract execution.' },
                { title: 'API Gateway Rate Limiting', desc: 'Protect backend APIs from scraping, replay attacks, and abuse.' },
                { title: 'E-commerce & Gaming Integrity', desc: 'Block checkout bots, scalpers, and scraper bots.' },
                { title: 'Zero-Friction Client Verification', desc: 'Safeguard business conversion channels silently.' }
              ].map((s, idx) => (
                <div key={idx} style={{ paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <h4 style={{ fontSize: '0.9rem', color: '#00f2fe', margin: '0 0 4px 0', fontWeight: '700' }}>• {s.title}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why VitaShield */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, marginBottom: '1.25rem' }}>Why Developers Choose VitaShield</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { title: 'Stronger Shielding', desc: 'Built to stop next-gen automated frameworks and AI operators.' },
                { title: 'Better UX', desc: '95% of users experience zero friction with no legacy images to click.' },
                { title: 'Adversarial Self-Learning', desc: 'Intercepted samples feed back into the risk core to self-evolve rules.' },
                { title: 'Developer-First SDKs', desc: 'Integrate with a single line of script. Native React, Next.js, and Node support.' },
                { title: 'Enterprise Reliability', desc: 'Multi-tenant logs, custom threat thresholds, and real-time dashboard analytics.' }
              ].map((w, idx) => (
                <div key={idx}>
                  <h4 style={{ fontSize: '0.88rem', color: '#fff', margin: '0 0 2px 0', fontWeight: '700' }}>✓ {w.title}</h4>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Live Sandbox Interactive Simulator Panel */}
      <section id="demo-sandbox" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle} className="gradient-text">Live Action Telemetry Sandbox</h2>
          <p style={styles.sectionSubtitle}>Interact with the live widget below to verify how our math rules analyze your kinetic rhythm.</p>
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '2rem' }}>
          {/* Left Panel: The Form */}
          <form 
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const token = formData.get('vms-shield-token') as string;
              if (token) {
                handleDemoVerify(token);
              } else {
                alert("Invisible verification active. Please fill out email and submit to compile telemetry.");
              }
            }}
            className="glass-panel" 
            style={{ flex: 1, minWidth: '320px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700, margin: 0 }}>Interactive Form Integration</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Type your email and press the submit button. We run our sub-pixel jitter filter and linearity ratios on your cursor movements.
            </p>

            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label" htmlFor="demo-email">Target Email Address</label>
              <input
                type="email"
                id="demo-email"
                value={demoMail}
                onChange={(e) => setDemoMail(e.target.value)}
                className="input-field"
                placeholder="developer@company.com"
                style={{ background: 'rgba(0,0,0,0.3)', margin: 0 }}
                required
              />
            </div>

            <div style={{ padding: '8px 0' }}>
              <VerificationWidget
                siteKey="vms_pub_live_demo"
                onVerify={handleDemoVerify}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                borderRadius: '8px',
                color: '#00f2fe',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Verify Submitted Payload
            </button>
          </form>

          {/* Right Panel: The Scoring Console */}
          <div className="glass-panel" style={{ flex: 1.2, minWidth: '320px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(10, 15, 30, 0.6)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#00f2fe', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f2fe', boxShadow: '0 0 8px #00f2fe' }} />
              Risk Engine Decision Inspector
            </h3>

            {demoLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Analyzing client-side bio-kinetics coordinates...
              </div>
            ) : demoResults ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Decision Alert */}
                <div style={{
                  padding: '10px 14px',
                  background: demoResults.decision === 'allow' ? 'rgba(16, 185, 129, 0.12)' :
                             demoResults.decision === 'challenge' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: demoResults.decision === 'allow' ? '1px solid #10b981' :
                          demoResults.decision === 'challenge' ? '1px solid #f59e0b' : '1px solid #ef4444',
                  borderRadius: '8px',
                  color: demoResults.decision === 'allow' ? '#34d399' :
                         demoResults.decision === 'challenge' ? '#fbbf24' : '#f87171',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase'
                }}>
                  Decision Gateway: {demoResults.decision}
                </div>

                {/* Score breakdown metrics */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: demoResults.scores.risk_score > 50 ? '#f87171' : '#fff' }}>
                      {demoResults.scores.risk_score}%
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trust Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: demoResults.scores.trust_score < 50 ? '#f87171' : '#34d399' }}>
                      {demoResults.scores.trust_score}%
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reputation</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>
                      {demoResults.scores.reputation_score}%
                    </div>
                  </div>
                </div>

                {/* Detail metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                    <span>Trajectory Straightness Ratio:</span>
                    <strong style={{ color: '#fff' }}>{demoResults.details.mouse_straightness || 1.25}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                    <span>Keystroke Delay Cadence SD:</span>
                    <strong style={{ color: '#fff' }}>{demoResults.details.key_std_dev || 35} ms</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                    <span>Automated Frameworks Found:</span>
                    <strong style={{ color: demoResults.details.device_anomalies.length > 0 ? '#f87171' : '#34d399' }}>
                      {demoResults.details.device_anomalies.length > 0 ? 'YES' : 'NONE'}
                    </strong>
                  </div>
                </div>

                {/* Flags list */}
                {demoResults.details.behavior_flags && demoResults.details.behavior_flags.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>Behavioral Anomalies Flagged:</div>
                    {demoResults.details.behavior_flags.map((flag: string) => (
                      <div key={flag} style={{ fontSize: '0.75rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.08)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                        ⚠️ {flag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : liveTelemetry ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Decision Alert */}
                <div style={{
                  padding: '10px 14px',
                  background: liveTelemetry.decision === 'allow' ? 'rgba(16, 185, 129, 0.12)' :
                             liveTelemetry.decision === 'challenge' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: liveTelemetry.decision === 'allow' ? '1px solid #10b981' :
                          liveTelemetry.decision === 'challenge' ? '1px solid #f59e0b' : '1px solid #ef4444',
                  borderRadius: '8px',
                  color: liveTelemetry.decision === 'allow' ? '#34d399' :
                         liveTelemetry.decision === 'challenge' ? '#fbbf24' : '#f87171',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Decision Gateway: {liveTelemetry.decision}</span>
                  <span style={{ fontSize: '10px', color: '#00f2fe', fontWeight: 'bold' }}>● LIVE STREAM</span>
                </div>

                {/* Score breakdown metrics */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: liveTelemetry.scores.risk_score > 50 ? '#f87171' : '#fff' }}>
                      {liveTelemetry.scores.risk_score}%
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trust Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: liveTelemetry.scores.trust_score < 50 ? '#f87171' : '#34d399' }}>
                      {liveTelemetry.scores.trust_score}%
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reputation</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>
                      {liveTelemetry.scores.reputation_score}%
                    </div>
                  </div>
                </div>

                {/* Detail metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                    <span>Mouse Points Captured:</span>
                    <strong style={{ color: '#fff' }}>{liveTelemetry.details.mousePointsCount} / 30</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                    <span>Trajectory Straightness Ratio:</span>
                    <strong style={{ color: '#fff' }}>{liveTelemetry.details.mouse_straightness || 1.25}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                    <span>Keystrokes Tracked:</span>
                    <strong style={{ color: '#fff' }}>{liveTelemetry.details.keyPressesCount}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                    <span>Keystroke Delay Cadence SD:</span>
                    <strong style={{ color: '#fff' }}>{liveTelemetry.details.key_std_dev || 35} ms</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                    <span>Automated Frameworks Found:</span>
                    <strong style={{ color: liveTelemetry.details.device_anomalies.length > 0 ? '#f87171' : '#34d399' }}>
                      {liveTelemetry.details.device_anomalies.length > 0 ? 'YES' : 'NONE'}
                    </strong>
                  </div>
                </div>

                {/* Flags list */}
                {liveTelemetry.details.behavior_flags && liveTelemetry.details.behavior_flags.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>Behavioral Anomalies Flagged:</div>
                    {liveTelemetry.details.behavior_flags.map((flag: string) => (
                      <div key={flag} style={{ fontSize: '0.75rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.08)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                        ⚠️ {flag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                Waiting for telemetry packet... Move your mouse organically to verify.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Defense Matrix Section */}
      <section id="matrix" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle} className="gradient-text">Defense Capability Matrix</h2>
          <p style={styles.sectionSubtitle}>
            Explore the 12 security dimensions, standard browser checks, and proprietary kinetics filters integrated inside VitaShield.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', marginTop: '2rem', alignItems: 'start', width: '100%', textAlign: 'left' }}>
          {/* Left Column: Categories List */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(10,15,30,0.5)' }}>
            {MATRIX_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveMatrixCategory(cat.id)}
                style={{
                  padding: '10px 14px',
                  background: activeMatrixCategory === cat.id ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                  border: activeMatrixCategory === cat.id ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                  borderRadius: '8px',
                  color: activeMatrixCategory === cat.id ? '#00f2fe' : 'var(--text-muted)',
                  textAlign: 'left',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                {cat.title.split(' (')[0]}
              </button>
            ))}
          </div>

          {/* Right Column: Methods Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {MATRIX_CATEGORIES.filter(cat => cat.id === activeMatrixCategory).map((cat) => (
              <div key={cat.id}>
                <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: '800', margin: 0 }}>{cat.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0, lineHeight: '1.4' }}>{cat.description}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {cat.methods.map((method, idx) => (
                    <div 
                      key={idx} 
                      className="glass-panel" 
                      style={{ 
                        padding: '1.25rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '10px',
                        border: cat.id === 'vitashield' ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid rgba(255,255,255,0.04)',
                        background: cat.id === 'vitashield' ? 'rgba(6, 182, 212, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <h4 style={{ fontSize: '0.88rem', color: '#fff', fontWeight: '700', margin: 0, lineHeight: '1.3' }}>{method.name}</h4>
                        <span 
                          style={{ 
                            fontSize: '10px', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            background: method.power === 'Maximum' ? 'rgba(239, 68, 68, 0.15)' : method.power === 'High' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: method.power === 'Maximum' ? 'var(--danger)' : method.power === 'High' ? 'var(--warning)' : 'var(--success)',
                            fontWeight: '700',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Power: {method.power}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>{method.desc}</p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.72rem', color: 'var(--text-dark)', fontWeight: '600', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px' }}>
                        Difficulty: {method.difficulty}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Docs & Quick Start Section */}
      <section id="docs" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle} className="gradient-text">Developer Quick Start & Docs</h2>
          <p style={styles.sectionSubtitle}>
            Embed the frontend telemetry widget and verify tokens on your server in minutes.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, marginBottom: '1.5rem' }}>
            How to Integrate VitaShield: Step-by-Step
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', flexWrap: 'wrap' }}>
            {/* Step 1: Frontend */}
            <div>
              <h4 style={{ fontSize: '1.05rem', color: '#00f2fe', margin: '0 0 10px 0', fontWeight: '800' }}>
                Step 1: Frontend Telemetry Widget
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                Load our client-side SDK in your HTML header. It silently monitors organic human biological rhythms (mouse speed, deceleration hesitation, typing flight/dwell times) to generate cryptographic trust tokens.
              </p>
              
              <div style={{ background: 'rgba(5, 7, 12, 0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', overflowX: 'auto', color: '#e2e8f0' }}>
                <div style={{ color: '#6b7280', marginBottom: '0.5rem' }}>{"<!-- Load the SDK client -->"}</div>
                <div style={{ color: '#38bdf8' }}>
                  {"<script "}
                  <span style={{ color: '#fbbf24' }}>src</span>
                  {"="}
                  <span style={{ color: '#34d399' }}>"https://vitashield.sleepsomno.com/widget.js"</span>
                  {" async defer></script>"}
                </div>
                <br />
                <div style={{ color: '#6b7280', marginBottom: '0.5rem' }}>{"<!-- Form container -->"}</div>
                <div style={{ color: '#38bdf8' }}>
                  {"<form "}
                  <span style={{ color: '#fbbf24' }}>id</span>
                  {"="}
                  <span style={{ color: '#34d399' }}>"auth-form"</span>
                  {" "}
                  <span style={{ color: '#fbbf24' }}>action</span>
                  {"="}
                  <span style={{ color: '#34d399' }}>"/submit"</span>
                  {" "}
                  <span style={{ color: '#fbbf24' }}>method</span>
                  {"="}
                  <span style={{ color: '#34d399' }}>"POST"</span>
                  {">"}
                </div>
                <div style={{ paddingLeft: '1rem', color: '#38bdf8' }}>
                  {"<input "}
                  <span style={{ color: '#fbbf24' }}>type</span>
                  {"="}
                  <span style={{ color: '#34d399' }}>"email"</span>
                  {" required />"}
                  <br />
                  {"<!-- VitaShield Widget - Zero human clicks required -->"}
                  <br />
                  {"<div "}
                  <span style={{ color: '#fbbf24' }}>id</span>
                  {"="}
                  <span style={{ color: '#34d399' }}>"vitashield-widget"</span>
                  {" "}
                  <span style={{ color: '#fbbf24' }}>data-sitekey</span>
                  {"="}
                  <span style={{ color: '#34d399' }}>"vms_pub_live_79a2b8e3df9102ca"</span>
                  {"></div>"}
                  <br />
                  {"<button "}
                  <span style={{ color: '#fbbf24' }}>type</span>
                  {"="}
                  <span style={{ color: '#34d399' }}>"submit"</span>
                  {">Login Securely</button>"}
                </div>
                <div style={{ color: '#38bdf8' }}>
                  {"</form>"}
                </div>
              </div>
            </div>

            {/* Step 2: Backend */}
            <div>
              <h4 style={{ fontSize: '1.05rem', color: '#00f2fe', margin: '0 0 10px 0', fontWeight: '800' }}>
                Step 2: Backend API Verification
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                When your form is submitted, VitaShield automatically appends a hidden token named <code>vms-shield-token</code> to your payload. Query our secure verify endpoint on your server before processing the request.
              </p>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                {['nodejs', 'python', 'go', 'curl'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setDocsTab(lang as any)}
                    style={{
                      padding: '4px 10px',
                      background: docsTab === lang ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255,255,255,0.02)',
                      border: docsTab === lang ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '6px',
                      color: docsTab === lang ? '#00f2fe' : 'var(--text-muted)',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <div style={{ background: 'rgba(5, 7, 12, 0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', overflowX: 'auto', color: '#e2e8f0', height: '180px' }}>
                {docsTab === 'nodejs' && (
                  <pre style={{ margin: 0 }}>{`// Node.js Express Backend
app.post('/submit', async (req, res) => {
  const token = req.body['vms-shield-token'];
  
  // Call secure verification route
  const verify = await fetch('https://vitashield.sleepsomno.com/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: 'vms_sec_live_9c0f73b18274d8a21f7c',
      token: token,
      ip: req.ip
    })
  });
  
  const result = await verify.json();
  if (result.success && result.risk_score < 60) {
    res.send("Authentication Successful!");
  } else {
    res.status(403).send("Bot activity blocked.");
  }
});`}</pre>
                )}
                {docsTab === 'python' && (
                  <pre style={{ margin: 0 }}>{`# Python Flask / requests verify
import requests

def verify_session(token, client_ip):
    url = "https://vitashield.sleepsomno.com/api/verify"
    payload = {
        "secret": "vms_sec_live_9c0f73b18274d8a21f7c",
        "token": token,
        "ip": client_ip
    }
    r = requests.post(url, json=payload, timeout=5)
    result = r.json()
    
    # Return success validation flags
    return result.get("success") and result.get("risk_score") < 60`}</pre>
                )}
                {docsTab === 'go' && (
                  <pre style={{ margin: 0 }}>{`// Golang verify logic
func verifyToken(token string, ip string) bool {
    client := &http.Client{Timeout: 5 * time.Second}
    payload := map[string]string{
        "secret": "vms_sec_live_9c0f73b18274d8a21f7c",
        "token":  token,
        "ip":     ip,
    }
    body, _ := json.Marshal(payload)
    resp, err := client.Post("https://vitashield.sleepsomno.com/api/verify", "application/json", bytes.NewBuffer(body))
    // Decode and parse risk_score ...
    return riskScore < 60
}`}</pre>
                )}
                {docsTab === 'curl' && (
                  <pre style={{ margin: 0 }}>{`# Shell verify script curl query
curl -X POST https://vitashield.sleepsomno.com/api/verify \\
  -H "Content-Type: application/json" \\
  -d '{
    "secret": "vms_sec_live_9c0f73b18274d8a21f7c",
    "token": "token_from_client_form",
    "ip": "1.2.3.4"
  }'`}</pre>
                )}
              </div>

              {/* Interactive API Sandbox Simulator */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem' }}>
                <h5 style={{ fontSize: '0.85rem', color: '#fff', margin: '0 0 8px 0', fontWeight: '800' }}>
                  Interactive API Response Simulator (模拟 API 响应沙盒)
                </h5>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                  Adjust parameters below to see how the client-side telemetry converts into backend risk decisions and JSON payloads.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', alignItems: 'start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Risk Score Slider */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Simulated Risk Score:</span>
                        <strong style={{ color: mockRiskScore >= 60 ? 'var(--danger)' : mockRiskScore > 20 ? 'var(--warning)' : 'var(--success)' }}>
                          {mockRiskScore}%
                        </strong>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={mockRiskScore}
                        onChange={(e) => setMockRiskScore(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--secondary)', cursor: 'pointer' }}
                      />
                    </div>

                    {/* Checkboxes */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Simulated Telemetry Markers:</span>
                      
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: '#fff', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={mockWebdriver}
                          onChange={(e) => setMockWebdriver(e.target.checked)}
                          style={{ accentColor: 'var(--secondary)' }}
                        />
                        <span>WebDriver Active (自动化测试)</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: '#fff', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={mockStraightMouse}
                          onChange={(e) => setMockStraightMouse(e.target.checked)}
                          style={{ accentColor: 'var(--secondary)' }}
                        />
                        <span>Straight Trajectory (匀速直线轨迹)</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: '#fff', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={mockSwiftshader}
                          onChange={(e) => setMockSwiftshader(e.target.checked)}
                          style={{ accentColor: 'var(--secondary)' }}
                        />
                        <span>SwiftShader GPU (无头虚拟机环境)</span>
                      </label>
                    </div>
                  </div>

                  {/* Simulated JSON Panel */}
                  <div style={{ background: 'rgba(5, 7, 12, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', overflowX: 'auto', maxHeight: '185px' }}>
                    <div style={{ color: 'var(--text-dark)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px', marginBottom: '6px', fontSize: '0.68rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>RESPONSE BODY (JSON)</span>
                      <span style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: '800',
                        background: mockRiskScore >= 60 ? 'rgba(239,68,68,0.12)' : mockRiskScore > 20 ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
                        color: mockRiskScore >= 60 ? 'var(--danger)' : mockRiskScore > 20 ? 'var(--warning)' : 'var(--success)'
                      }}>
                        {mockRiskScore >= 60 ? 'BLOCK (403)' : mockRiskScore > 20 ? 'CHALLENGE' : 'ALLOW'}
                      </span>
                    </div>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#38bdf8' }}>
                      {JSON.stringify({
                        success: true,
                        timestamp: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
                        risk_score: mockRiskScore,
                        decision: mockRiskScore >= 60 ? 'block' : mockRiskScore > 20 ? 'challenge' : 'allow',
                        details: {
                          device_anomalies: [
                            ...(mockWebdriver ? ['navigator_webdriver_active'] : []),
                            ...(mockSwiftshader ? ['virtualized_gpu_environment'] : [])
                          ],
                          behavior_flags: [
                            ...(mockStraightMouse ? ['perfectly_straight_mouse_trajectory'] : []),
                            ...(mockRiskScore > 40 ? ['sub_500ms_form_submission_speed'] : [])
                          ]
                        }
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Contact Section */}
      <section id="contact" style={{ ...styles.section, marginBottom: '4rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '650px', margin: '0 auto', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
          <h2 style={styles.sectionTitle} className="gradient-text">Ready to Upgrade Your Platform Security?</h2>
          <p style={{ ...styles.sectionSubtitle, maxWidth: '100%' }}>
            Experience zero-friction threat defense today or schedule an enterprise walkthrough.
          </p>
          <div style={{ margin: '1.5rem 0', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onEnterConsole}
              style={{
                padding: '12px 28px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                borderRadius: '30px',
                color: '#00f2fe',
                fontWeight: 700,
                fontSize: '0.98rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Get Started Free
            </button>
            <a 
              href="mailto:sales@sleepsomno.com" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                borderRadius: '30px',
                color: '#000',
                fontWeight: 700,
                fontSize: '0.98rem',
                textDecoration: 'none',
                boxShadow: '0 0 20px rgba(0, 242, 254, 0.45)',
                transition: 'all 0.3s ease'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Schedule Demo
            </a>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            For custom integrations or inquiries, contact sales@sleepsomno.com. Typical deployments are live within 24 hours.
          </p>
        </div>
      </section>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 50% 0%, #0c1220 0%, #05070c 80%)',
    color: '#fff',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 2.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    position: 'sticky',
    top: 0,
    background: 'rgba(5, 7, 12, 0.85)',
    backdropFilter: 'blur(12px)',
    zIndex: 100
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem'
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(6, 182, 212, 0.05)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandName: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.02em'
  },
  brandSub: {
    fontSize: '0.65rem',
    color: 'var(--text-dark)',
    fontWeight: '750',
    marginTop: '0.2rem'
  },
  topNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.75rem'
  },
  navLink: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    transition: 'color 0.2s ease'
  },
  consoleBtn: {
    background: 'rgba(6, 182, 212, 0.08)',
    border: '1px solid rgba(6, 182, 212, 0.25)',
    color: 'var(--secondary)',
    padding: '0.45rem 1rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  heroSection: {
    position: 'relative',
    padding: '6rem 2rem',
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
    overflow: 'hidden'
  },
  heroContent: {
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    zIndex: 1
  },
  heroBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(6, 182, 212, 0.05)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    padding: '0.4rem 0.85rem',
    borderRadius: '30px',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: 'var(--secondary)'
  },
  heroBadgePulse: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--secondary)',
    boxShadow: '0 0 6px var(--secondary)'
  },
  heroTitle: {
    fontSize: '3.6rem',
    fontWeight: '900',
    lineHeight: '1.1',
    letterSpacing: '-0.04em'
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    maxWidth: '650px'
  },
  heroCtas: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem'
  },
  primaryCta: {
    background: 'var(--secondary)',
    border: 'none',
    color: '#000',
    padding: '0.75rem 1.75rem',
    borderRadius: '10px',
    fontSize: '0.92rem',
    fontWeight: '750',
    cursor: 'pointer',
    boxShadow: '0 0 16px rgba(6, 182, 212, 0.3)',
    transition: 'all 0.2s ease'
  },
  secondaryCta: {
    background: 'transparent',
    border: '1px solid var(--border-color)',
    color: '#fff',
    padding: '0.75rem 1.75rem',
    borderRadius: '10px',
    fontSize: '0.92rem',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center'
  },
  section: {
    padding: '4rem 2.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2.5rem'
  },
  sectionHeader: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxWidth: '600px'
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '850',
    letterSpacing: '-0.03em'
  },
  sectionSubtitle: {
    fontSize: '0.92rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5'
  },
  pipelineBox: {
    width: '100%',
    maxWidth: '1100px',
    padding: '2rem 1.5rem',
    background: 'rgba(0,0,0,0.15)'
  },
  pipelineNodes: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem'
  },
  nodeCard: {
    flex: 1,
    minWidth: '200px',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '12px',
    padding: '1.25rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease'
  },
  nodeCardActive: {
    borderColor: 'var(--secondary)',
    boxShadow: '0 0 12px rgba(6, 182, 212, 0.15)',
    background: 'rgba(6, 182, 212, 0.02)'
  },
  nodeIconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    border: '1px solid rgba(255,255,255,0.06)'
  },
  nodeTitle: {
    fontSize: '0.88rem',
    fontWeight: '700',
    color: '#fff'
  },
  nodeDesc: {
    fontSize: '0.74rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4'
  },
  connectionLine: {
    width: '60px',
    height: '2px',
    background: 'rgba(255,255,255,0.05)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  linePulse: {
    position: 'absolute',
    height: '2px',
    width: '0%',
    background: 'var(--secondary)',
    left: 0,
    transition: 'width 2.5s linear'
  },
  linePulseActive: {
    width: '100%',
    boxShadow: '0 0 6px var(--secondary)'
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    width: '100%',
    maxWidth: '1100px'
  },
  productCard: {
    padding: '1.5rem',
    background: 'rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  productTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#fff'
  },
  productDesc: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5'
  },
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    width: '100%',
    maxWidth: '1100px',
    alignItems: 'start'
  },
  pricingCard: {
    padding: '2rem',
    background: 'rgba(13, 20, 35, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '1.25rem'
  },
  pricingTier: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: 'var(--text-dark)',
    fontWeight: '750',
    letterSpacing: '0.08em'
  },
  price: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#fff'
  },
  pricingDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    maxWidth: '220px'
  },
  pricingFeatures: {
    width: '100%',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1.25rem',
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    textAlign: 'left',
    paddingLeft: '0.5rem'
  },
  pricingCta: {
    width: '100%',
    padding: '0.65rem',
    border: '1px solid var(--border-color)',
    background: 'rgba(255,255,255,0.02)',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};
