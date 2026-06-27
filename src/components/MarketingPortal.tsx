import React, { useState, useEffect } from 'react';

interface MarketingPortalProps {
  onEnterConsole: () => void;
}

export const MarketingPortal: React.FC<MarketingPortalProps> = ({ onEnterConsole }) => {
  const [activeStep, setActiveStep] = useState<number>(0);

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
