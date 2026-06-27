import React, { useState } from 'react';

export const SystemSpecs: React.FC = () => {
  const [activeSpecTab, setActiveSpecTab] = useState<'blueprint' | 'supabase' | 'api' | 'pricing'>('blueprint');
  const [requestVolume, setRequestVolume] = useState<number>(50000); // Default requests
  const [targetIndustry, setTargetIndustry] = useState<'social' | 'ai_apps' | 'crypto' | 'gaming'>('social');

  // Calculates pricing based on volume
  const getPricingQuote = (volume: number) => {
    if (volume <= 1000) {
      return { 
        tier: 'Free MVP Tier', 
        cost: 0, 
        desc: 'Ideal for basic testing & personal landing pages. Limits verification to 1k requests/month.' 
      };
    } else if (volume <= 150000) {
      // Pro: $0.002 per request after first 1k free
      const billable = volume - 1000;
      const total = billable * 0.002;
      return { 
        tier: 'Pro Growth Tier', 
        cost: Math.round(total * 100) / 100, 
        desc: 'SaaS multi-tenant billing. Complete access to behavioral biometrics, device trust signals, and Stripe integration.' 
      };
    } else {
      // Enterprise: Custom quoting, discounted rate
      return { 
        tier: 'Enterprise Suite', 
        cost: 'Custom Quote', 
        desc: 'Includes custom Rules Engine, Federated Threat Feed, OpenAI Operator AI Agent detection, and multi-region deployment.' 
      };
    }
  };

  const quote = getPricingQuote(requestVolume);

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title} className="gradient-text">System Specifications & Architecture</h1>
          <p style={styles.subtitle}>VitaShield platform blueprints, database models, and commercial roadmap.</p>
        </div>
      </div>

      {/* Tabs Panel */}
      <div className="glass-panel" style={styles.tabsPanel}>
        <div style={styles.tabsWrapper}>
          <button 
            onClick={() => setActiveSpecTab('blueprint')} 
            style={{ ...styles.tabBtn, ...(activeSpecTab === 'blueprint' ? styles.tabBtnActive : {}) }}
          >
            5-Block Blueprint & Roadmap
          </button>
          <button 
            onClick={() => setActiveSpecTab('supabase')} 
            style={{ ...styles.tabBtn, ...(activeSpecTab === 'supabase' ? styles.tabBtnActive : {}) }}
          >
            Supabase Schemas
          </button>
          <button 
            onClick={() => setActiveSpecTab('api')} 
            style={{ ...styles.tabBtn, ...(activeSpecTab === 'api' ? styles.tabBtnActive : {}) }}
          >
            API & Trust Payload
          </button>
          <button 
            onClick={() => setActiveSpecTab('pricing')} 
            style={{ ...styles.tabBtn, ...(activeSpecTab === 'pricing' ? styles.tabBtnActive : {}) }}
          >
            Pricing & Volume Calculator
          </button>
        </div>

        {/* Tab 1: 5-Block Blueprint & Roadmap */}
        {activeSpecTab === 'blueprint' && (
          <div style={styles.specBody}>
            <h2 style={styles.specHeaderTitle}>Multi-Layer AI-Native Security Architecture</h2>
            <p style={styles.specDesc}>VitaShield separates security criteria across Product, Tech, Detection, Security, and Compliance.</p>

            <div style={styles.blueprintGrid}>
              <div style={styles.blueprintCard}>
                <div style={{ ...styles.blueprintHeader, color: 'var(--secondary)' }}>
                  <span style={styles.blueprintNum}>01</span>
                  <h4>Product Specs</h4>
                </div>
                <ul style={styles.specList}>
                  <li>Real-time Human/Bot/AI Agent detection</li>
                  <li>Real-Time Trust & Reputation Scoring</li>
                  <li>Allow / Challenge / Block gateway routing</li>
                  <li>Vanilla JS, React & Next.js SDKs</li>
                </ul>
              </div>

              <div style={styles.blueprintCard}>
                <div style={{ ...styles.blueprintHeader, color: 'var(--primary)' }}>
                  <span style={styles.blueprintNum}>02</span>
                  <h4>Technical Specs</h4>
                </div>
                <ul style={styles.specList}>
                  <li>API Gateway response latency &lt; 200ms</li>
                  <li>99.99% uptime guarantee (Status Page metrics)</li>
                  <li>Edge auto-scaling via Cloudflare Workers</li>
                  <li>Supabase multi-tenant DB replication</li>
                </ul>
              </div>

              <div style={styles.blueprintCard}>
                <div style={{ ...styles.blueprintHeader, color: 'var(--warning)' }}>
                  <span style={styles.blueprintNum}>03</span>
                  <h4>Detection Specs</h4>
                </div>
                <ul style={styles.specList}>
                  <li>Device Trust (browser, GPU, WebGL signatures)</li>
                  <li>Behavior Scan (mouse kinematics, typing cadence)</li>
                  <li>Network Rep (Proxy/VPN/Tor/ASN lookup)</li>
                  <li>AI Agent Detection (e.g. OpenAI Operator)</li>
                </ul>
              </div>

              <div style={styles.blueprintCard}>
                <div style={{ ...styles.blueprintHeader, color: 'var(--danger)' }}>
                  <span style={styles.blueprintNum}>04</span>
                  <h4>Security Specs</h4>
                </div>
                <ul style={styles.specList}>
                  <li>Cloudflare WAF rate-limiting filters</li>
                  <li>JWT Bearer token API authorization</li>
                  <li>Federated Fraud threat network feeds</li>
                  <li>Secure HTTPS TLS 1.3 socket paths</li>
                </ul>
              </div>
            </div>

            {/* Compliance Block */}
            <div style={styles.compliancePanel}>
              <div style={{ ...styles.blueprintHeader, color: 'var(--success)' }}>
                <span style={styles.blueprintNum}>05</span>
                <h4>Compliance & Privacy Specs (合规要求)</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                VitaShield 嚴格遵循全球最嚴格私隱法規，包括 <strong>GDPR (歐洲)</strong> 與 <strong>PDPA (馬來西亞)</strong>。
                系統採用「無 PII（個人識別資訊）」設計：動態 IP 地址在寫入數據庫前進行單向 Salted Hash 加密，且生物識別特徵僅於客戶端經由 Client SDK telemetries 生成哈希值比對，<strong>絕不上傳或保存任何用戶的原始人臉圖像或語音數據</strong>，保障最高規格的隱私合規性，同時滿足 <strong>SOC2</strong> 安全稽核要求。
              </p>
            </div>

            {/* Implementation Roadmap */}
            <div style={styles.roadmapBox}>
              <h3 style={styles.sectionTitle}>VitaShield Development Roadmap</h3>
              <div style={styles.roadmapGrid}>
                <div style={styles.roadmapCol}>
                  <div style={styles.roadmapHeader}>Phase 1 - MVP</div>
                  <ul style={styles.roadmapList}>
                    <li style={{ color: 'var(--success)' }}>✓ Verification API</li>
                    <li style={{ color: 'var(--success)' }}>✓ Security Dashboard</li>
                    <li style={{ color: 'var(--success)' }}>✓ Risk Engine 0-100</li>
                  </ul>
                </div>
                <div style={styles.roadmapCol}>
                  <div style={styles.roadmapHeader}>Phase 2 - Growth</div>
                  <ul style={styles.roadmapList}>
                    <li style={{ color: 'var(--secondary)' }}>→ JS/React/Next SDKs</li>
                    <li style={{ color: 'var(--secondary)' }}>→ Stripe Billing Portal</li>
                    <li style={{ color: 'var(--secondary)' }}>→ Analytics Logs Inspect</li>
                  </ul>
                </div>
                <div style={styles.roadmapCol}>
                  <div style={styles.roadmapHeader}>Phase 3 - Enterprise</div>
                  <ul style={styles.roadmapList}>
                    <li>✦ Rules Customization Engine</li>
                    <li>✦ Federated Threat Network</li>
                    <li>✦ OpenAI Operator Agent Detection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Supabase Schema Details */}
        {activeSpecTab === 'supabase' && (
          <div style={styles.specBody}>
            <h2 style={styles.specHeaderTitle}>Supabase Relational Database Engine Schemas</h2>
            <p style={styles.specDesc}>Multi-tenant relational database structure for storing active sessions, audits, and threat heuristics in Supabase.</p>

            <div style={styles.dbGrid}>
              <div style={styles.dbTableCard}>
                <h4 style={styles.dbTableName}>Table: <code>sessions</code></h4>
                <p style={styles.dbTableDesc}>Stores transaction session headers and overall challenge resolution status.</p>
                <table style={styles.schemaTable}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Column</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Attributes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={styles.tdCode}>id</td>
                      <td style={styles.td}>UUID</td>
                      <td style={styles.tdMuted}>PRIMARY KEY</td>
                    </tr>
                    <tr>
                      <td style={styles.tdCode}>tenant_id</td>
                      <td style={styles.td}>UUID</td>
                      <td style={styles.tdMuted}>FOREIGN KEY (Multi-tenant)</td>
                    </tr>
                    <tr>
                      <td style={styles.tdCode}>created_at</td>
                      <td style={styles.td}>TIMESTAMP</td>
                      <td style={styles.tdMuted}>DEFAULT NOW()</td>
                    </tr>
                    <tr>
                      <td style={styles.tdCode}>status</td>
                      <td style={styles.td}>VARCHAR</td>
                      <td style={styles.tdMuted}>active / solved / blocked</td>
                    </tr>
                    <tr>
                      <td style={styles.tdCode}>client_ip</td>
                      <td style={styles.td}>VARCHAR</td>
                      <td style={styles.tdMuted}>Salted Hashed IP (GDPR)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={styles.dbTableCard}>
                <h4 style={styles.dbTableName}>Table: <code>telemetry_logs</code></h4>
                <p style={styles.dbTableDesc}>Stores detailed hardware device fingerprints and behavior kinetic variables.</p>
                <table style={styles.schemaTable}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Column</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Attributes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={styles.tdCode}>id</td>
                      <td style={styles.td}>UUID</td>
                      <td style={styles.tdMuted}>PRIMARY KEY</td>
                    </tr>
                    <tr>
                      <td style={styles.tdCode}>session_id</td>
                      <td style={styles.td}>UUID</td>
                      <td style={styles.tdMuted}>FOREIGN KEY REFERENCES sessions</td>
                    </tr>
                    <tr>
                      <td style={styles.tdCode}>risk_score</td>
                      <td style={styles.td}>INT</td>
                      <td style={styles.tdMuted}>0 - 100 Scoring Index</td>
                    </tr>
                    <tr>
                      <td style={styles.tdCode}>device_fingerprint</td>
                      <td style={styles.td}>JSONB</td>
                      <td style={styles.tdMuted}>GPU, Canvas, Screen details</td>
                    </tr>
                    <tr>
                      <td style={styles.tdCode}>behavior_metrics</td>
                      <td style={styles.td}>JSONB</td>
                      <td style={styles.tdMuted}>Mouse coords, click intervals</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: API & Trust Payload */}
        {activeSpecTab === 'api' && (
          <div style={styles.specBody}>
            <h2 style={styles.specHeaderTitle}>Edge Gateway API & Advanced Trust Payload Schema</h2>
            <p style={styles.specDesc}>Developers verify verification tokens via backend server calls. Response includes our advanced **Trust & Reputation Layer** and **AI Agent Detection** metrics.</p>

            <div style={styles.apiBox}>
              <div style={styles.apiEndpointRow}>
                <span style={styles.apiMethod}>POST</span>
                <span style={styles.apiPath}>/v1/verify</span>
                <span style={styles.apiLabel}>Verify Transaction Token</span>
              </div>
              <div style={styles.apiCodeBlock}>
                <strong>Request Headers:</strong>
                <pre style={styles.preCode}>
{`Authorization: Bearer vms_sec_live_9c0f73b...
Content-Type: application/json`}
                </pre>
                <strong>JSON Response Payload:</strong>
                <pre style={styles.preCode}>
{`{
  "success": true,
  "human_score": 92,
  "risk_level": "low",
  "decision": "allow",
  
  "trust_and_reputation": {
    "trust_score": 94,
    "reputation": "excellent",
    "device_integrity": "verified_device"
  },
  
  "ai_agent_detection": {
    "is_ai_agent": false,
    "agent_type": "none",
    "automation_likelihood": 0.02,
    "signatures": {
      "openai_operator_detected": false,
      "headless_browser_flagged": false
    }
  },
  
  "verified_at": "${new Date().toISOString()}"
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Interactive Calculator */}
        {activeSpecTab === 'pricing' && (
          <div style={styles.specBody}>
            <h2 style={styles.specHeaderTitle}>Interactive Commercial Billing Estimator</h2>
            <p style={styles.specDesc}>VitaShield provides usage-based pricing backed by high-throughput Cloudflare Worker scaling.</p>

            <div style={styles.calcContainer}>
              <div style={styles.calcLeftCol}>
                <div className="input-group">
                  <label className="input-label">Estimated Monthly Verifications</label>
                  <div style={styles.sliderRow}>
                    <input 
                      type="range" 
                      min="500" 
                      max="300000" 
                      step="500"
                      value={requestVolume} 
                      onChange={(e) => setRequestVolume(Number(e.target.value))}
                      className="captcha-slider-input"
                    />
                    <div style={styles.volumeDisplay}>{requestVolume.toLocaleString()} reqs/mo</div>
                  </div>
                </div>

                <div className="input-group" style={{ marginTop: '1.5rem' }}>
                  <label className="input-label">Target Industry Preset</label>
                  <div style={styles.presetButtonsRow}>
                    {(['social', 'ai_apps', 'crypto', 'gaming'] as const).map((industry) => (
                      <button
                        key={industry}
                        type="button"
                        onClick={() => setTargetIndustry(industry)}
                        style={{
                          ...styles.calcIndustryBtn,
                          ...(targetIndustry === industry ? styles.calcIndustryBtnActive : {})
                        }}
                      >
                        {industry === 'social' && 'Social Media'}
                        {industry === 'ai_apps' && 'AI Applications'}
                        {industry === 'crypto' && 'Crypto / Web3'}
                        {industry === 'gaming' && 'Gaming Portal'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={styles.calcRightCol}>
                <div style={styles.quoteCard}>
                  <span style={styles.quoteSub}>Estimated Plan Match</span>
                  <h3 style={styles.quoteTierTitle}>{quote.tier}</h3>
                  <div style={styles.quotePrice}>
                    {typeof quote.cost === 'number' ? (
                      <>
                        <span style={styles.currencySymbol}>$</span>
                        <span style={styles.priceNum}>{quote.cost.toFixed(0)}</span>
                        <span style={styles.pricePeriod}>/ mo</span>
                      </>
                    ) : (
                      <span style={{ fontSize: '1.8rem' }}>{quote.cost}</span>
                    )}
                  </div>
                  <p style={styles.quoteDesc}>{quote.desc}</p>
                  
                  <div style={styles.quoteSlaBox}>
                    <div style={styles.slaItem}>
                      <span>Billing Model:</span> <strong>Stripe Metered</strong>
                    </div>
                    <div style={styles.slaItem}>
                      <span>Edge Latency SLA:</span> <strong>{requestVolume > 150000 ? '<100ms' : '<200ms'}</strong>
                    </div>
                    <div style={styles.slaItem}>
                      <span>AI Agent Shield:</span> <strong>{targetIndustry === 'ai_apps' ? 'ACTIVE' : 'STANDARD'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
  tabsPanel: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem'
  },
  tabsWrapper: {
    display: 'flex',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    gap: '0.5rem',
    overflowX: 'auto'
  },
  tabBtn: {
    padding: '0.85rem 1.25rem',
    background: 'transparent',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    borderBottom: '2.5px solid transparent',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  },
  tabBtnActive: {
    color: 'var(--secondary)',
    borderBottomColor: 'var(--secondary)',
    background: 'rgba(6, 182, 212, 0.03)'
  },
  specBody: {
    animation: 'slide-up 0.3s ease'
  },
  specHeaderTitle: {
    fontSize: '1.25rem',
    fontWeight: '750',
    color: '#fff',
    letterSpacing: '-0.02em',
    marginBottom: '0.25rem'
  },
  specDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginBottom: '1.5rem'
  },
  blueprintGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
    marginBottom: '1.5rem'
  },
  blueprintCard: {
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  blueprintHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    paddingBottom: '0.65rem'
  },
  blueprintNum: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9rem',
    fontWeight: '750',
    opacity: 0.6
  },
  specList: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    paddingLeft: '0.25rem'
  },
  compliancePanel: {
    background: 'rgba(16, 185, 129, 0.02)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1rem'
  },
  roadmapBox: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginTop: '1.5rem'
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '1rem'
  },
  roadmapGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.25rem'
  },
  roadmapCol: {
    background: 'rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    padding: '1rem'
  },
  roadmapHeader: {
    fontSize: '0.88rem',
    fontWeight: '700',
    color: 'var(--secondary)',
    marginBottom: '0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    paddingBottom: '0.4rem'
  },
  roadmapList: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: 'var(--text-muted)'
  },
  dbGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    alignItems: 'start'
  },
  dbTableCard: {
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.5rem'
  },
  dbTableName: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--secondary)'
  },
  dbTableDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginTop: '0.2rem',
    marginBottom: '1.25rem'
  },
  schemaTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.82rem',
    textAlign: 'left'
  },
  th: {
    padding: '0.5rem 0.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-dark)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  td: {
    padding: '0.65rem 0.25rem',
    color: 'var(--text-main)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
  },
  tdCode: {
    padding: '0.65rem 0.25rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--primary)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
  },
  tdMuted: {
    padding: '0.65rem 0.25rem',
    color: 'var(--text-dark)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
  },
  apiBox: {
    background: '#04060b',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  apiEndpointRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.85rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
  },
  apiMethod: {
    fontSize: '0.72rem',
    fontWeight: '800',
    background: 'var(--secondary)',
    color: '#000',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px'
  },
  apiPath: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    color: '#fff',
    fontWeight: '600'
  },
  apiLabel: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginLeft: 'auto'
  },
  apiCodeBlock: {
    padding: '1.25rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.78rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  preCode: {
    color: '#e2e8f0',
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.02)',
    overflowX: 'auto',
    marginBottom: '0.75rem'
  },
  calcContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    alignItems: 'center'
  },
  calcLeftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    marginTop: '0.5rem'
  },
  volumeDisplay: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.92rem',
    fontWeight: '700',
    color: 'var(--secondary)',
    width: '130px',
    textAlign: 'right'
  },
  presetButtonsRow: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
    flexWrap: 'wrap'
  },
  calcIndustryBtn: {
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border-color)',
    padding: '0.55rem 0.85rem',
    fontSize: '0.78rem',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    transition: 'all 0.2s ease'
  },
  calcIndustryBtnActive: {
    background: 'var(--secondary-glow)',
    borderColor: 'var(--secondary)',
    color: '#fff'
  },
  calcRightCol: {},
  quoteCard: {
    background: 'radial-gradient(circle at 100% 0%, rgba(6, 182, 212, 0.08) 0%, transparent 60%), rgba(13, 20, 35, 0.5)',
    border: '1px solid var(--border-color-glow)',
    boxShadow: 'var(--glow-shadow)',
    borderRadius: '16px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  quoteSub: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: 'var(--text-dark)',
    fontWeight: '750',
    letterSpacing: '0.08em'
  },
  quoteTierTitle: {
    fontSize: '1.5rem',
    color: '#fff',
    marginTop: '0.25rem',
    marginBottom: '0.75rem'
  },
  quotePrice: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    color: 'var(--secondary)',
    marginBottom: '1rem'
  },
  currencySymbol: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginTop: '0.25rem',
    marginRight: '0.1rem'
  },
  priceNum: {
    fontSize: '3rem',
    fontWeight: '800',
    lineHeight: '1',
    letterSpacing: '-0.04em'
  },
  pricePeriod: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    marginLeft: '0.25rem',
    alignSelf: 'flex-end',
    marginBottom: '0.25rem'
  },
  quoteDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: '1.45',
    marginBottom: '1.5rem',
    maxWidth: '280px'
  },
  quoteSlaBox: {
    width: '100%',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.78rem'
  },
  slaItem: {
    display: 'flex',
    justifyContent: 'space-between',
    color: 'var(--text-muted)'
  }
};
