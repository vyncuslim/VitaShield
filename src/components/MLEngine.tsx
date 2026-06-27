import React, { useState } from 'react';

export const MLEngine: React.FC = () => {
  const [activeModel, setActiveModel] = useState<'v2.4-stable' | 'v2.5-shadow'>('v2.4-stable');
  const [ingestionStatus, setIngestionStatus] = useState<'active' | 'paused'>('active');

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title} className="gradient-text">Machine Learning Pipeline</h1>
          <p style={styles.subtitle}>Supervised behavior kinetics training, ROC evaluations, and hot-swap shadow models.</p>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Left: Model Diagnostics & ROC Curve */}
        <div className="glass-panel" style={styles.leftCol}>
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>ROC Curve Performance Evaluation</h3>
              <p style={styles.panelSubtitle}>Area Under Curve (AUC) validation for AI Agent & Headless browser detections.</p>
            </div>
            <div style={styles.aucBadge}>
              <span>AUC: <strong>0.988</strong></span>
            </div>
          </div>

          {/* SVG ROC Curve Chart */}
          <div style={styles.chartWrapper}>
            <svg viewBox="0 0 400 300" style={styles.svg}>
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="40" y2="260" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <line x1="40" y1="260" x2="380" y2="260" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <line x1="40" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="380" y1="20" x2="380" y2="260" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

              {/* Diagonal Reference Line (Random guess: AUC = 0.5) */}
              <line x1="40" y1="260" x2="380" y2="20" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4 4" />

              {/* ROC Curve Path (High-arc representing AUC = 0.988) */}
              <path 
                d="M 40 260 Q 42 60 120 35 T 380 20" 
                fill="none" 
                stroke="var(--secondary)" 
                strokeWidth="3.5"
                style={{ filter: 'drop-shadow(0 0 6px var(--secondary-glow))' }}
              />

              {/* Threshold Dot indicators */}
              <circle cx="80" cy="45" r="5" fill="var(--primary)" />
              <text x="92" y="48" fill="var(--text-main)" fontSize="9" fontFamily="var(--font-mono)">Threshold = 40 (Challenge)</text>

              <circle cx="160" cy="30" r="5" fill="var(--danger)" />
              <text x="172" y="33" fill="var(--text-main)" fontSize="9" fontFamily="var(--font-mono)">Threshold = 65 (Block)</text>

              {/* Chart labels */}
              <text x="210" y="285" fill="var(--text-dark)" fontSize="10" textAnchor="middle">False Positive Rate (FPR)</text>
              <text x="15" y="140" fill="var(--text-dark)" fontSize="10" textAnchor="middle" transform="rotate(-90 15 140)">True Positive Rate (TPR)</text>
            </svg>
          </div>
        </div>

        {/* Right: Confusion Matrix & Control Panel */}
        <div style={styles.rightCol}>
          {/* Confusion Matrix Card */}
          <div className="glass-panel" style={styles.matrixCard}>
            <h3 style={styles.panelTitle}>Bot Classification Matrix</h3>
            <p style={styles.panelSubtitle}>Distribution of actual vs predicted telemetry classifications.</p>

            <div style={styles.matrixGrid}>
              <div style={styles.matrixLabelRow}>
                <div style={{ flex: 1 }} />
                <div style={styles.matrixHeaderLabel}>Predicted Human</div>
                <div style={styles.matrixHeaderLabel}>Predicted Bot</div>
              </div>
              
              <div style={styles.matrixRow}>
                <div style={styles.matrixRowLabel}>Actual Human</div>
                <div style={styles.matrixCellSuccess}>
                  <span style={styles.matrixCellVal}>99.92%</span>
                  <span style={styles.matrixCellSub}>True Negative</span>
                </div>
                <div style={styles.matrixCellDanger}>
                  <span style={styles.matrixCellVal}>0.08%</span>
                  <span style={styles.matrixCellSub}>False Positive</span>
                </div>
              </div>

              <div style={styles.matrixRow}>
                <div style={styles.matrixRowLabel}>Actual Bot</div>
                <div style={styles.matrixCellDanger}>
                  <span style={styles.matrixCellVal}>1.60%</span>
                  <span style={styles.matrixCellSub}>False Negative</span>
                </div>
                <div style={styles.matrixCellSuccess}>
                  <span style={styles.matrixCellVal}>98.40%</span>
                  <span style={styles.matrixCellSub}>True Positive</span>
                </div>
              </div>
            </div>
          </div>

          {/* Model Controls Card */}
          <div className="glass-panel" style={{ ...styles.controlCard, marginTop: '1.25rem' }}>
            <h3 style={styles.panelTitle}>Pipeline Deployments</h3>
            <p style={styles.panelSubtitle}>Roll out new neural architectures to edge gateways.</p>

            <div style={styles.pipelineControls}>
              <div style={styles.pipelineItem}>
                <span>Ingestion Pipeline:</span>
                <button 
                  onClick={() => setIngestionStatus(ingestionStatus === 'active' ? 'paused' : 'active')}
                  style={{
                    ...styles.statusBtn,
                    background: ingestionStatus === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: ingestionStatus === 'active' ? 'var(--success)' : 'var(--danger)'
                  }}
                >
                  {ingestionStatus.toUpperCase()}
                </button>
              </div>

              <div style={styles.pipelineItem}>
                <span>Production Model:</span>
                <select 
                  value={activeModel} 
                  onChange={e=>setActiveModel(e.target.value as any)} 
                  style={styles.modelSelector}
                >
                  <option value="v2.4-stable">v2.4-Stable (Current)</option>
                  <option value="v2.5-shadow">v2.5-Shadow (Candidate)</option>
                </select>
              </div>

              <div style={styles.pipelineInfoBox}>
                <strong>Deployment Mode:</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                  {activeModel === 'v2.4-stable' ? (
                    'v2.4-Stable handles 100% of live verify routing. v2.5-Shadow is currently shadowing traffic to compute AUC parameters without taking action.'
                  ) : (
                    'v2.5-Shadow promoted to primary gateway routing. Evaluates cursor curve deviations with 0.08% lower false-positive margin.'
                  )}
                </p>
              </div>
            </div>
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
    gridTemplateColumns: '1.4fr 1fr',
    gap: '1.5rem',
    alignItems: 'start'
  },
  leftCol: {
    padding: '1.75rem'
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  panelTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.02em'
  },
  panelSubtitle: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    marginTop: '0.2rem',
    marginBottom: '0.5rem'
  },
  aucBadge: {
    background: 'rgba(6, 182, 212, 0.05)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    padding: '0.4rem 0.85rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: '#fff'
  },
  chartWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.1)',
    borderRadius: '12px',
    padding: '1rem',
    border: '1px solid rgba(255,255,255,0.02)'
  },
  svg: {
    width: '100%',
    height: 'auto',
    maxHeight: '260px'
  },
  matrixCard: {
    padding: '1.75rem'
  },
  controlCard: {
    padding: '1.75rem'
  },
  matrixGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '1.25rem'
  },
  matrixLabelRow: {
    display: 'flex',
    gap: '0.5rem',
    textAlign: 'center'
  },
  matrixHeaderLabel: {
    flex: 1,
    fontSize: '0.78rem',
    fontWeight: '700',
    color: 'var(--text-dark)'
  },
  matrixRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  },
  matrixRowLabel: {
    width: '90px',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: 'var(--text-dark)',
    textAlign: 'right',
    paddingRight: '0.5rem'
  },
  matrixCellSuccess: {
    flex: 1,
    background: 'rgba(16, 185, 129, 0.03)',
    border: '1px solid rgba(16, 185, 129, 0.1)',
    borderRadius: '8px',
    padding: '0.65rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  matrixCellDanger: {
    flex: 1,
    background: 'rgba(239, 68, 68, 0.03)',
    border: '1px solid rgba(239, 68, 68, 0.1)',
    borderRadius: '8px',
    padding: '0.65rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  matrixCellVal: {
    fontSize: '0.98rem',
    fontWeight: '800',
    color: '#fff'
  },
  matrixCellSub: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    marginTop: '0.1rem'
  },
  pipelineControls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1.25rem'
  },
  pipelineItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
    color: '#fff'
  },
  statusBtn: {
    border: 'none',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.76rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  modelSelector: {
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: '#fff',
    padding: '0.4rem 0.75rem',
    fontSize: '0.82rem',
    outline: 'none'
  },
  pipelineInfoBox: {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '8px',
    padding: '0.85rem',
    fontSize: '0.8rem',
    color: '#fff'
  }
};
