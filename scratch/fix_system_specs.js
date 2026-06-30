const fs = require('fs');
const path = 'src/components/SystemSpecs.tsx';
let content = fs.readFileSync(path, 'utf8');

// We find the index of the start of the MATRIX_CATEGORIES array
const startIndex = content.indexOf('export const MATRIX_CATEGORIES = [');

// We find the index of the start of the SystemSpecs component declaration
const endIndex = content.indexOf('export const SystemSpecs: React.FC = () => {');

if (startIndex !== -1 && endIndex !== -1) {
  const prefix = content.substring(0, startIndex);
  const suffix = content.substring(endIndex);
  
  const replacement = `export const MATRIX_CATEGORIES = [
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
];

`;

  fs.writeFileSync(path, prefix + replacement + suffix, 'utf8');
  console.log('Replaced array successfully!');
} else {
  console.log('Error locating markers!');
}
