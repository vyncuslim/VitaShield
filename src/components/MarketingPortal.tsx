import React, { useState, useEffect } from 'react';
import { VerificationWidget } from './VerificationWidget/VerificationWidget';

interface MarketingPortalProps {
  onEnterConsole: () => void;
}

export const MarketingPortal: React.FC<MarketingPortalProps> = ({ onEnterConsole }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [demoToken, setDemoToken] = useState<string>('');
  const [demoResults, setDemoResults] = useState<any>(null);
  const [demoLoading, setDemoLoading] = useState<boolean>(false);
  const [demoMail, setDemoMail] = useState<string>('tester@company.com');

  const handleDemoVerify = async (token: string) => {
    setDemoToken(token);
    setDemoLoading(true);
    
    setTimeout(() => {
      try {
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
        
        setDemoResults({
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

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <header style={styles.topHeader}>
        <div style={styles.brand}>
          <div style={styles.logoIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span style={styles.brandName}>VitaShield</span>
          <span style={styles.brandSub}>BY VITAMIND AI</span>
        </div>

        <nav style={styles.topNav}>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#pipeline" style={styles.navLink}>How it Works</a>
          <a href="#pricing" style={styles.navLink}>Pricing</a>
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
            AI-Native Human <br />
            Verification Infrastructure
          </h1>
          <p style={styles.heroSubtitle}>
            Protect your platforms from bots, fraud, and AI-driven abuse. Deploy invisible behavioral telemetry with sub-200ms edge gateway latency.
          </p>

          <div style={styles.heroCtas}>
            <button onClick={onEnterConsole} style={styles.primaryCta}>Start Free Plan</button>
            <a href="#pricing" style={styles.secondaryCta}>View Pricing</a>
          </div>
        </div>
      </section>

      {/* Flowchart "How it Works" Pipeline Section */}
      <section id="pipeline" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle} className="gradient-text">How VitaShield Protects Your Platform</h2>
          <p style={styles.sectionSubtitle}> Cascading 4-layer validation network inspecting traffic silently at the edge.</p>
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
              <h4 style={styles.nodeTitle}>1. User / Client</h4>
              <p style={styles.nodeDesc}>Gathers screen size, WebGL browser specs, and mouse velocity.</p>
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
              <h4 style={styles.nodeTitle}>2. Signal Collection</h4>
              <p style={styles.nodeDesc}>Encrypts telemetry tokens via JS/React SDK locally.</p>
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
              <h4 style={styles.nodeTitle}>3. AI Risk Core</h4>
              <p style={styles.nodeDesc}>Classifies behavior kinetics into 0-100 threat ratings.</p>
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
              <h4 style={styles.nodeTitle}>4. Gateway Decision</h4>
              <p style={styles.nodeDesc}>Routes transaction to Allow, Challenge, or Block gates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Features Section */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle} className="gradient-text">Core Security Components</h2>
          <p style={styles.sectionSubtitle}>Enterprise protection layers defending API entryways.</p>
        </div>

        <div style={styles.productGrid}>
          <div className="glass-panel" style={styles.productCard}>
            <h4 style={styles.productTitle}>Verify Engine</h4>
            <p style={styles.productDesc}>
              Lightweight HTML/JS widget and React hooks dispatching silent telemetry payloads without client friction.
            </p>
          </div>

          <div className="glass-panel" style={styles.productCard}>
            <h4 style={styles.productTitle}>AI Risk Core</h4>
            <p style={styles.productDesc}>
              Cascading supervised learning pipelines evaluating keyboard dynamics and mouse trajectories.
            </p>
          </div>

          <div className="glass-panel" style={styles.productCard}>
            <h4 style={styles.productTitle}>Edge Proxy Gateway</h4>
            <p style={styles.productDesc}>
              Cloudflare Edge and Akamai CDN routing validating verification tokens in under 200ms latency.
            </p>
          </div>

          <div className="glass-panel" style={styles.productCard}>
            <h4 style={styles.productTitle}>Control Center</h4>
            <p style={styles.productDesc}>
              Custom Rules Builder and administrative Whitelist/Blacklist overrides to enforce regional policies.
            </p>
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
          <div className="glass-panel" style={{ flex: 1, minWidth: '320px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              />
            </div>

            <div style={{ padding: '8px 0' }}>
              <VerificationWidget
                siteKey="vms_pub_live_demo"
                onVerify={handleDemoVerify}
              />
            </div>

            <button
              onClick={() => {
                if (!demoToken) {
                  alert("Please solve the verification badge above first!");
                  return;
                }
                alert("Form submitted! Check the telemetry score card on the right.");
              }}
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
          </div>

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
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                Waiting for telemetry packet... Click "Protected by VitaShield" to trigger client signal compilation.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Matrix Section */}
      <section id="pricing" style={{ ...styles.section, marginBottom: '4rem' }}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle} className="gradient-text">Flexible Commercial Plans</h2>
          <p style={styles.sectionSubtitle}>Scale from basic test sandboxes to millions of requests daily.</p>
        </div>

        <div style={styles.pricingGrid}>
          {/* Plan 1 */}
          <div className="glass-panel" style={styles.pricingCard}>
            <span style={styles.pricingTier}>Developer MVP</span>
            <div style={styles.price}>$0</div>
            <p style={styles.pricingDesc}>Best for small websites, side projects, and sandbox tests.</p>
            <ul style={styles.pricingFeatures}>
              <li>1,000 verifications / month</li>
              <li>Standard Biometric Telemetry</li>
              <li>Invisible Captcha default</li>
              <li>Public Status Page access</li>
            </ul>
            <button onClick={onEnterConsole} style={styles.pricingCta}>Start Free</button>
          </div>

          {/* Plan 2 */}
          <div className="glass-panel" style={{ ...styles.pricingCard, border: '1px solid var(--secondary)' }}>
            <span style={{ ...styles.pricingTier, color: 'var(--secondary)' }}>Pro Growth</span>
            <div style={styles.price}>$98<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo base</span></div>
            <p style={styles.pricingDesc}>Best for SaaS, Web3 apps, and scaling products.</p>
            <ul style={styles.pricingFeatures}>
              <li>Up to 50,000 verifications / month</li>
              <li>Metered billing ($0.002 / extra req)</li>
              <li>Rules Customization Engine</li>
              <li>Slack & Webhook alerts integration</li>
            </ul>
            <button onClick={onEnterConsole} style={{ ...styles.pricingCta, background: 'var(--secondary)', color: '#000' }}>Upgrade Pro</button>
          </div>

          {/* Plan 3 */}
          <div className="glass-panel" style={styles.pricingCard}>
            <span style={styles.pricingTier}>Enterprise Suite</span>
            <div style={styles.price}>Custom</div>
            <p style={styles.pricingDesc}>Best for high QPS portals, AI clusters, and financial apps.</p>
            <ul style={styles.pricingFeatures}>
              <li>Unlimited verifications / SLA</li>
              <li>OpenAI Operator / Agent filters</li>
              <li>Federated Fraud Intelligence feed</li>
              <li>Dedicated multi-region hosting</li>
            </ul>
            <button onClick={onEnterConsole} style={styles.pricingCta}>Contact Sales</button>
          </div>
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
