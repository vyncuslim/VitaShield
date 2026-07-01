import React, { useState } from 'react';

export const MATRIX_CATEGORIES = [
  {
    id: 'behavioral',
    title: '1. Behavioral Biometrics',
    description: 'Analyze fine-grained mouse movements and operator cadences to distinguish human users from automation scripts.',
    methods: [
      { name: 'Mouse Path Straightness, Curvature & Velocity', desc: 'Detect if mouse movement paths exhibit overly perfect lines or predictable acceleration parameters.', power: 'High', difficulty: 'Medium' },
      { name: 'Velocity and Acceleration Variance', desc: 'Humans produce organic physiological noise. Automated scripts exhibit near-zero velocity variance.', power: 'High', difficulty: 'Medium' },
      { name: 'Click Position and Mouse Down Intervals', desc: 'Analyze whether mouse clicks land exactly on target centers, and measure millisecond-level mouse-down intervals.', power: 'Medium', difficulty: 'Low' },
      { name: 'Keyboard Input Rhythm (Dwell / Flight Time)', desc: 'Measure key press durations (Dwell) and typing transitions (Flight) to train keystroke dynamics classifiers.', power: 'High', difficulty: 'High' },
      { name: 'Scroll Speeds, Decelerations & Rebounds', desc: 'Examine scrolling pause triggers, backward scroll rates, and scrolling acceleration curves during page reading.', power: 'Medium', difficulty: 'Medium' },
      { name: 'Focus Handshake Patterns and Latencies', desc: 'Track focus changes across window tabs and text inputs to identify robotic sequential behaviors.', power: 'High', difficulty: 'Medium' },
      { name: 'Hover Duration and Organic Tremors', desc: 'Analyze micro-movement jitter while a cursor hovers over interface elements to capture physiological noise.', power: 'Medium', difficulty: 'Medium' },
      { name: 'Multi-element Navigation Sequences', desc: 'Human user patterns flow top-down based on cognitive pathways. Bots move instantly to target fields.', power: 'High', difficulty: 'Medium' },
      { name: 'Overall Hesitation-Action Time Windows', desc: 'Assess whether client cursor velocity decelerates organically before committing critical form clicks.', power: 'High', difficulty: 'Medium' },
      { name: 'Multi-tab and Concurrent Window Switches', desc: 'Monitor concurrent actions across multiple browser contexts to catch concurrent submission bots.', power: 'High', difficulty: 'High' }
    ]
  },
  {
    id: 'fingerprint',
    title: '2. Device & Environment Fingerprinting',
    description: 'Inspect execution environments, browser capabilities, graphic engines, and system markers.',
    methods: [
      { name: 'WebDriver & Automation Framework Markers', desc: 'Verify indicators like navigator.webdriver, chrome.runtime, and Selenium driver variables.', power: 'Maximum', difficulty: 'Low' },
      { name: 'Canvas, WebGL, and WebGPU Fingerprints', desc: 'Extract hardware-specific GPU rendering codes using graphics render pipelines.', power: 'High', difficulty: 'Medium' },
      { name: 'System Fonts, Plugins, and Extensions', desc: 'Enumerate system font availability and browser extension signatures.', power: 'Medium', difficulty: 'Medium' },
      { name: 'Audio Fingerprint (AudioContext)', desc: 'Generate silent sine waves via browser oscillator APIs to map audio rendering noise differences.', power: 'Medium', difficulty: 'High' },
      { name: 'Mobile Sensors (Gyroscope, Accelerometer)', desc: 'Capture touch surface dimensions, touch pressure curves, and gyroscope coordinates on mobile browsers.', power: 'High', difficulty: 'High' },
      { name: 'TLS / JA3 / JA4 Fingerprinting', desc: 'Inspect SSL/TLS cipher suites during network handshakes to match Curl or headless library signatures.', power: 'Maximum', difficulty: 'High' },
      { name: 'HTTP/2 Settings and Header Ordering', desc: 'Compare HTTP/2 flow window sizes and request header case conventions against normal browsers.', power: 'High', difficulty: 'High' },
      { name: 'WebRTC Interface Leak Detection', desc: 'Probe local private IP addresses and multimedia hardware profiles via WebRTC sockets.', power: 'Medium', difficulty: 'Medium' },
      { name: 'Battery Status and Power States', desc: 'Query device battery percentage and charge states to intercept mobile phone farms.', power: 'Medium', difficulty: 'Low' },
      { name: 'Refresh Rates and Color Gamut Profiling', desc: 'Inspect monitor refresh speeds (e.g. 60Hz vs 120Hz) and color profiles (sRGB/P3 gamut).', power: 'Medium', difficulty: 'Low' },
      { name: 'JavaScript Engine Execution Benchmarks', desc: 'Execute micro-benchmark algorithms to evaluate JS execution speed deviations across CPUs.', power: 'High', difficulty: 'High' },
      { name: 'WebAssembly Compilation Fingerprints', desc: 'Determine WASM support, compilation timings, and thread pools behavior.', power: 'High', difficulty: 'Medium' }
    ]
  },
  {
    id: 'temporal',
    title: '3. Temporal & Patterns Analysis',
    description: 'Monitor temporal intervals and submission frequencies to catch scheduling scripts.',
    methods: [
      { name: 'Sub-500ms Instant Form Submission', desc: 'Intercept forms filled and submitted instantly after page load, bypassing human reading limits.', power: 'Maximum', difficulty: 'Low' },
      { name: 'Transaction Frequency Variance Analysis', desc: 'Calculate the standard deviation of transaction intervals to locate cron jobs or scheduled actions.', power: 'High', difficulty: 'Medium' },
      { name: 'Cognitive Reading & Hesitation Intervals', desc: 'Cross-check password typing and form reads with standard human cognitive speeds.', power: 'Medium', difficulty: 'Medium' },
      { name: 'Off-hours Activity Spikes', desc: 'Correlate high frequency activity spikes during local night hours with bot subnet activity.', power: 'Medium', difficulty: 'Low' },
      { name: 'Keystroke and Click Rhythm Entropy', desc: 'Calculate the entropy of action chains; automated scripts score near-zero entropy.', power: 'High', difficulty: 'High' },
      { name: 'Page Residency vs Interactive Count Ratio', desc: 'Match total tab time against the quantity of mouse scrolls and clicks to weed out idle scraper bots.', power: 'High', difficulty: 'Medium' }
    ]
  },
  {
    id: 'challenge',
    title: '4. Interactive Challenge-Responses',
    description: 'Route suspect payloads through visual, cryptographic, or biometric verification gates.',
    methods: [
      { name: 'Legacy Visual CAPTCHAs', desc: 'Verify distorted text grids or object selection panels (2nd-gen security).', power: 'Medium', difficulty: 'Low' },
      { name: 'Slider Puzzles and Alignment Quizzes', desc: 'Validate visual alignments while scoring cursor velocity variance and friction trajectory.', power: 'High', difficulty: 'Medium' },
      { name: 'Proof-of-Work (Client Computational Puzzle)', desc: 'Force background client threads to compute high-difficulty SHA-256 puzzles to slow down scrapers.', power: 'Maximum', difficulty: 'High' },
      { name: 'Semantic Understanding Questions', desc: 'Challenge users with spatial logic queries or visual categorizations.', power: 'High', difficulty: 'Medium' },
      { name: 'Gamified Captchas', desc: 'Incorporate mini-games (e.g. rotating 3D models upright) to increase bot bypass costs.', power: 'High', difficulty: 'High' },
      { name: 'Adaptive Mitigation Scaling', desc: 'Scale verification difficulty dynamically from silent passes to 3D challenges based on client reputation.', power: 'Maximum', difficulty: 'High' },
      { name: 'Action Sequence Challenges', desc: 'Require users to trace custom visual paths or gesture double-clicks to unlock pathways.', power: 'High', difficulty: 'Medium' }
    ]
  },
  {
    id: 'network',
    title: '5. Network & Proxy Identifications',
    description: 'Audit transport layer IP blocks, routing paths, and residential proxy networks.',
    methods: [
      { name: 'IP Reputation Database Check', desc: 'Match client subnets against public server, VPS, and cloud hosting ASN nodes (e.g. AWS, DigitalOcean).', power: 'High', difficulty: 'Low' },
      { name: 'Proxy Protocol Fingerprinting', desc: 'Inspect TCP flags to identify intermediate routing via VLESS, SOCKS5, or gRPC proxies.', power: 'Maximum', difficulty: 'Medium' },
      { name: 'VPN and Residential Proxy Tracing', desc: 'Measure TCP round-trip delay (RTT) vs geographic distances to flag residential proxy proxies.', power: 'High', difficulty: 'High' },
      { name: 'Tor Exit Node Verification', desc: 'Compare incoming IPs against real-time Tor directory consensus lists to flag Onion network sessions.', power: 'Maximum', difficulty: 'Low' },
      { name: 'ASN Subnet Anomalies & Spikes', desc: 'Monitor concurrent spikes from specific ISP ASN ranges to stop distributed network scans.', power: 'High', difficulty: 'Medium' },
      { name: 'Physical Consistency (IP vs Locale)', desc: 'Validate consistency between client IP location, system language, clock, and networking lag.', power: 'High', difficulty: 'Medium' }
    ]
  },
  {
    id: 'semantic',
    title: '6. Content & Semantics Auditing',
    description: 'Inspect inputs to stop programmatic spamming or machine generated text.',
    methods: [
      { name: 'LLM Generated Content Classification', desc: 'Evaluate word probability distributions to catch bulk text generated by GPT architectures.', power: 'High', difficulty: 'High' },
      { name: 'Duplicate & Template String Matching', desc: 'Cross-check inputs with historical databases to filter automated review bots.', power: 'Medium', difficulty: 'Low' },
      { name: 'Semantic Coherence Inspections', desc: 'Detect random character strings or automated keyword stuffing.', power: 'High', difficulty: 'High' },
      { name: 'Hyperlink & Image Usage Ratios', desc: 'Monitor hyperlink percentages in message bodies to prevent forum spamming.', power: 'Medium', difficulty: 'Low' },
      { name: 'Paste & Immediate Submission Analysis', desc: 'Flag events where paste and submit clicks occur in under 350ms, pointing to headless macros.', power: 'High', difficulty: 'Low' }
    ]
  },
  {
    id: 'reputation',
    title: '7. Reputation & Historical Ledger',
    description: 'Maintain historic trust scoring for return users to guarantee friction-free speeds.',
    methods: [
      { name: 'Device Fingerprint History Scoring', desc: 'Generate encrypted browser cookie tokens to bypass checks for recognized devices.', power: 'High', difficulty: 'Medium' },
      { name: 'IP / Account Trust Scoring', desc: 'Track historical pass rates for clients to decrease challenge triggers over time.', power: 'High', difficulty: 'Medium' },
      { name: 'Cross-Domain Security Network Ledger', desc: 'Share threat indicators across a federated network of domains for early detection.', power: 'High', difficulty: 'High' },
      { name: 'New Device / Untracked IP Gating', desc: 'Route newly detected browser configurations through invisible telemetry evaluations.', power: 'Medium', difficulty: 'Low' },
      { name: 'IP Association Network Analysis', desc: 'Analyze relationship graphs between IPs, user IDs, and device cookies to blacklist bot rings.', power: 'Maximum', difficulty: 'High' }
    ]
  },
  {
    id: 'ml',
    title: '8. Machine Learning Models',
    description: 'Train classification models to proactively flag emerging threat vectors.',
    methods: [
      { name: 'Anomaly Models (Isolation Forest)', desc: 'Train unsupervised neural nets to catch zero-day bot mutations without hardcoded rules.', power: 'High', difficulty: 'High' },
      { name: 'Kinetic Classification Algorithms', desc: 'Convert cursor movements into vector matrices to classify bot trajectories.', power: 'High', difficulty: 'High' },
      { name: 'Adversarial Example Detectors', desc: 'Recognize bots simulating human tremors and organic noise patterns.', power: 'Maximum', difficulty: 'High' },
      { name: 'Real-time Online Edge Retraining', desc: 'Re-train neural weight parameters on edge nodes to adapt to local scraping spikes.', power: 'Maximum', difficulty: 'High' },
      { name: 'Ensemble Model Voting Systems', desc: 'Combine rule matches, Isolation Forests, and device checks to compute final threat scores.', power: 'High', difficulty: 'High' },
      { name: 'Self-Updating Signature Rules', desc: 'Feed blocked payloads back into rule generation loops to automatically compile WAF rules.', power: 'Maximum', difficulty: 'High' }
    ]
  },
  {
    id: 'honeypot',
    title: '9. Honeypots & Traps',
    description: 'Inject client traps to capture automated scripts scanning DOM layouts.',
    methods: [
      { name: 'Hidden Input Fields (Honeypot)', desc: 'Insert CSS-hidden inputs into forms; bots completing these inputs expose themselves instantly.', power: 'Maximum', difficulty: 'Low' },
      { name: 'Hidden Anchor Tags / Links', desc: 'Place invisible links on pages; scrapers requesting these targets are blacklisted.', power: 'Maximum', difficulty: 'Low' },
      { name: 'Deceptive API Handlers', desc: 'Expose fake private API routes in scripts to capture rogue endpoint scanning.', power: 'High', difficulty: 'Medium' },
      { name: 'Dynamic Position Field Shuffling', desc: 'Dynamically shuffle hidden field names and coordinates to bypass script checks.', power: 'Medium', difficulty: 'Low' },
      { name: 'Deceptive Frontend Errors', desc: 'Inject false JS runtime exceptions to analyze if clients ignore browser warnings.', power: 'High', difficulty: 'Medium' }
    ]
  },
  {
    id: 'protocol',
    title: '10. Network Protocol Validation',
    description: 'Audit network layer data structures to guarantee client integrity.',
    methods: [
      { name: 'Request Header Integrity checks', desc: 'Cross-check incoming HTTP header names and casing order with client User-Agent standards.', power: 'High', difficulty: 'Medium' },
      { name: 'Leaky Bucket API Rate Limiting', desc: 'Deploy rolling-window algorithms to throttle query bursts targeting REST paths.', power: 'High', difficulty: 'Low' },
      { name: 'Cookie & Storage Expiry Check', desc: 'Verify cookie lifetimes and client storage variables to catch script restarts.', power: 'Medium', difficulty: 'Low' },
      { name: 'Referer Chain & Origin Matching', desc: 'Audit HTTP Referer paths and Origin routes to prevent automated cross-site requests.', power: 'Medium', difficulty: 'Low' },
      { name: 'Payload Structural Casing Check', desc: 'Inspect request body formats for anomalous non-standard characters.', power: 'High', difficulty: 'Medium' }
    ]
  },
  {
    id: 'other',
    title: '11. Other Advanced Defense Systems',
    description: 'Adopt next-generation industry standards and hardware-level web verification tools.',
    methods: [
      { name: 'Browser Attestation APIs', desc: 'Invoke hardware-level client device integrity checks (e.g. Apple Private Access Tokens).', power: 'High', difficulty: 'High' },
      { name: 'JS Sandbox & Scope Protection', desc: 'Verify if native JS functions or object prototypes have been modified by proxy scripts.', power: 'High', difficulty: 'High' },
      { name: 'Memory Footprint Analysis', desc: 'Track RAM metrics and Garbage Collection trends to isolate automation engines.', power: 'Medium', difficulty: 'High' },
      { name: 'CSS Frame Rate & Animation Audits', desc: 'Measure requestAnimationFrame timings to verify if CSS rendering matches display hardware.', power: 'Medium', difficulty: 'Medium' },
      { name: 'SVG Rendering Deviations', desc: 'Draw test SVG shapes to map hardware rendering and GPU font layout anomalies.', power: 'High', difficulty: 'Medium' },
      { name: 'Private Click Measurement Checks', desc: 'Block bots mimicking clicks on ad attribution frameworks.', power: 'Medium', difficulty: 'High' },
      { name: 'Privacy-Preserving Federated Learning', desc: 'Compute threat intelligence parameters decentralized across nodes.', power: 'High', difficulty: 'High' },
      { name: 'WebAuthn Hardware Tokens', desc: 'Route high-threat transactions through visual FaceID/TouchID or FIDO hardware keys.', power: 'Maximum', difficulty: 'High' }
    ]
  },
  {
    id: 'vitashield',
    title: '🛡️ VitaShield Proprietary Heuristics',
    description: 'Our proprietary algorithms designed specifically to counter advanced human-mimicking AI Agents and bot automation scripts.',
    methods: [
      { name: 'Sub-pixel Jitter Bio-noise Mapping', desc: 'Analyze cursor streams for sub-pixel physiological tremors. Script paths lack these micro-vibrations.', power: 'Maximum', difficulty: 'Medium' },
      { name: 'Deceleration Hesitation Window Detection', desc: 'Track cursor velocity changes before clicks. Bots lack organic cognitive hesitation intervals.', power: 'Maximum', difficulty: 'Medium' },
      { name: 'Multi-tab Cross-session Tracking', desc: 'Correlate navigation flows across browser tabs to capture multi-tab scraping bots.', power: 'High', difficulty: 'High' },
      { name: 'Backspace & Keystroke Typo Analysis', desc: 'Reward natural spelling typos and backspace edits. Bots produce error-free keyboard cadences.', power: 'Medium', difficulty: 'Low' },
      { name: 'Adaptive Thinking Duration Modeling', desc: 'Calculate cognitive delays depending on input complexity to slow down rapid API submissions.', power: 'High', difficulty: 'High' },
      { name: 'Semantic-Input Velocity Consistency Engine', desc: 'Measure the complexity of text relative to client input speeds to flag instant LLM copy-pastes.', power: 'High', difficulty: 'High' },
      { name: 'Progressive Device Trust Accumulation', desc: 'Require newly registered devices to compile trust logs over time rather than granting instant passes.', power: 'High', difficulty: 'Medium' },
      { name: 'Adversarial Sample Feedback Loop', desc: 'Automatically retrain risk networks using captured bot payloads to evolve WAF policies.', power: 'Maximum', difficulty: 'High' },
      { name: 'Micro-interaction Stress Testing', desc: 'Inject subtle hover or slide challenges on high-risk routes to verify manual kinetics.', power: 'Maximum', difficulty: 'Medium' },
      { name: 'Clipboard Post-action Behavior Chain', desc: 'Evaluate user actions post-pasting (e.g. edits, readings) to differentiate humans from clipboard scripts.', power: 'High', difficulty: 'Low' },
      { name: 'Focus Flow Entropy Analysis', desc: 'Calculate the mathematical entropy of navigation flow. Human interaction yields high entropy.', power: 'High', difficulty: 'Medium' },
      { name: 'Temporal Rhythm Anomaly Detection', desc: 'Cross-check action timestamps with local timezones to catch automated off-hour traffic.', power: 'Medium', difficulty: 'Medium' },
      { name: 'Hybrid Probabilistic-Behavioral Fusion Engine', desc: 'Fuse classic rule decisions with machine learning confidence scores to yield dynamic risk verdicts.', power: 'Maximum', difficulty: 'High' }
    ]
  }
];export const SystemSpecs: React.FC = () => {
  const [activeSpecTab, setActiveSpecTab] = useState<'blueprint' | 'supabase' | 'api' | 'matrix'>('matrix');
  const [activeMatrixCategory, setActiveMatrixCategory] = useState<string>('behavioral');

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
            onClick={() => setActiveSpecTab('matrix')} 
            style={{ ...styles.tabBtn, ...(activeSpecTab === 'matrix' ? styles.tabBtnActive : {}) }}
          >
            Defense Capability Matrix
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
                <h4>Compliance & Privacy Specs</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                VitaShield strictly complies with global data privacy frameworks including <strong>GDPR (Europe)</strong> and <strong>PDPA (Malaysia)</strong>.
                The system is engineered with a Zero-PII architecture: dynamic IP addresses are cryptographically hashed (one-way salted hashes) prior to ingestion. Biometric heuristics are evaluated entirely on the client-side inside our sandboxed SDK, <strong>never uploading or saving raw facial images or voice cadences to our servers</strong>. This ensures compliance with enterprise security requirements, aligning with <strong>SOC2 Type II</strong> auditing standards.
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
                    <li style={{ color: 'var(--secondary)' }}>→ Granular Filter Console</li>
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

        {/* Tab 4: Defense Capability Matrix */}
        {activeSpecTab === 'matrix' && (
          <div style={styles.specBody}>
            <h2 style={styles.specHeaderTitle}>Defense Capability Matrix</h2>
            <p style={styles.specDesc}>
              VitaShield aggregates all industry-standard verification mechanisms alongside our proprietary biological kinetics behavioral checks.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', marginTop: '1.5rem', alignItems: 'start' }}>
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
                    {cat.id === 'vitashield' ? '🛡️ ' : ''}{cat.title.split(' (')[0]}
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
