import React, { useState } from 'react';
import type { ShieldConfig, VerificationLog } from '../types';

interface DashboardProps {
  config: ShieldConfig;
  logs: VerificationLog[];
}

export const Dashboard: React.FC<DashboardProps> = ({ config, logs }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; human: number; bot: number; index: number } | null>(null);

  // Calculate live stats dynamically based on logs
  const total = logs.length;
  const blocked = logs.filter(l => l.status === 'blocked').length;
  const passed = logs.filter(l => l.status === 'passed').length;
  const flagged = logs.filter(l => l.status === 'flagged').length;

  const botRate = total ? ((blocked / total) * 100).toFixed(1) + '%' : '0.0%';
  const deviceTrust = total ? (((passed + flagged) / total) * 100).toFixed(1) + '%' : '100.0%';

  const kpis = [
    {
      title: 'Total Verification Attempts',
      value: total.toLocaleString(),
      change: 'Real-time gateway inquiries',
      isUp: true,
      color: 'var(--primary)',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      )
    },
    {
      title: 'Bot Traffic Rate',
      value: botRate,
      change: `${blocked} anomalies blocked`,
      isUp: blocked > 0,
      color: 'var(--warning)',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      )
    },
    {
      title: 'Blocked Requests',
      value: blocked.toLocaleString(),
      change: 'Dropped connections',
      isUp: blocked > 0,
      color: 'var(--danger)',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    },
    {
      title: 'Average Device Integrity',
      value: deviceTrust,
      change: 'Passing verified hardware',
      isUp: true,
      color: 'var(--success)',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )
    }
  ];

  // Group logs dynamically by day of week
  const chartData = [
    { day: 'Mon', human: logs.filter(l => l.status !== 'blocked' && new Date(l.timestamp).getDay() === 1).length, bot: logs.filter(l => l.status === 'blocked' && new Date(l.timestamp).getDay() === 1).length },
    { day: 'Tue', human: logs.filter(l => l.status !== 'blocked' && new Date(l.timestamp).getDay() === 2).length, bot: logs.filter(l => l.status === 'blocked' && new Date(l.timestamp).getDay() === 2).length },
    { day: 'Wed', human: logs.filter(l => l.status !== 'blocked' && new Date(l.timestamp).getDay() === 3).length, bot: logs.filter(l => l.status === 'blocked' && new Date(l.timestamp).getDay() === 3).length },
    { day: 'Thu', human: logs.filter(l => l.status !== 'blocked' && new Date(l.timestamp).getDay() === 4).length, bot: logs.filter(l => l.status === 'blocked' && new Date(l.timestamp).getDay() === 4).length },
    { day: 'Fri', human: logs.filter(l => l.status !== 'blocked' && new Date(l.timestamp).getDay() === 5).length, bot: logs.filter(l => l.status === 'blocked' && new Date(l.timestamp).getDay() === 5).length },
    { day: 'Sat', human: logs.filter(l => l.status !== 'blocked' && new Date(l.timestamp).getDay() === 6).length, bot: logs.filter(l => l.status === 'blocked' && new Date(l.timestamp).getDay() === 6).length },
    { day: 'Sun', human: logs.filter(l => l.status !== 'blocked' && new Date(l.timestamp).getDay() === 0).length, bot: logs.filter(l => l.status === 'blocked' && new Date(l.timestamp).getDay() === 0).length }
  ];

  const maxVal = Math.max(10, ...chartData.map(d => Math.max(d.human, d.bot))) + 2;
  const yLabels = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal];

  // Calculate live verification method distribution for Threat Intelligence
  const methodCounts = {
    telemetry: logs.filter(l => l.method === 'behavioral_telemetry').length,
    captcha: logs.filter(l => l.method === 'captcha_3d').length,
    pow: logs.filter(l => l.method === 'cryptographic_pow').length,
    biometrics: logs.filter(l => l.method === 'biometric_scan').length
  };
  const methodTotal = total || 1;
  const pctTelemetry = ((methodCounts.telemetry / methodTotal) * 100).toFixed(1);
  const pctCaptcha = ((methodCounts.captcha / methodTotal) * 100).toFixed(1);
  const pctPow = ((methodCounts.pow / methodTotal) * 100).toFixed(1);
  const pctBiometrics = ((methodCounts.biometrics / methodTotal) * 100).toFixed(1);
  const width = 600;
  const height = 220;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates helper
  const getCoords = (index: number, val: number) => {
    const x = paddingLeft + (index / (chartData.length - 1)) * chartWidth;
    const y = height - paddingBottom - (val / maxVal) * chartHeight;
    return { x, y };
  };

  // Generate paths
  const humanCoords = chartData.map((d, i) => getCoords(i, d.human));
  const botCoords = chartData.map((d, i) => getCoords(i, d.bot));

  const createLinePath = (coords: { x: number; y: number }[]) => {
    return coords.reduce((acc, c, i) => {
      return i === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
    }, '');
  };

  const createAreaPath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    const line = createLinePath(coords);
    return `${line} L ${coords[coords.length - 1].x} ${height - paddingBottom} L ${coords[0].x} ${height - paddingBottom} Z`;
  };

  const humanLine = createLinePath(humanCoords);
  const humanArea = createAreaPath(humanCoords);
  const botLine = createLinePath(botCoords);
  const botArea = createAreaPath(botCoords);

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title} className="gradient-text">Security Intelligence Console</h1>
          <p style={styles.subtitle}>Real-time telemetry and anti-bot verification insights across your networks.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={styles.presetBadge}>
            <span>Preset: <strong>{
              config.preset === 'social' ? 'Social Platform' :
              config.preset === 'ai_apps' ? 'AI Apps Guard' :
              config.preset === 'crypto' ? 'Anti-Sybil Crypto' :
              config.preset === 'gaming' ? 'Gaming Macro' : 'General Web'
            }</strong></span>
          </div>
          <div style={styles.threatBadge}>
            <span style={styles.threatPulse} />
            <span>Threat Level: <strong style={{ color: 'var(--success)' }}>NORMAL</strong></span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {kpis.map((kpi, i) => (
          <div key={i} className="glass-panel kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">{kpi.title}</span>
              <div className="kpi-icon-wrapper">{kpi.icon}</div>
            </div>
            <div className="kpi-value" style={{ color: '#fff' }}>{kpi.value}</div>
            <div className={`kpi-change ${kpi.isUp ? 'up' : 'down'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: kpi.isUp ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                <polyline points="18 15 12 9 6 15" />
              </svg>
              <span>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Geo Splits */}
      <div style={styles.chartsGrid}>
        {/* Verification Traffic Line Chart */}
        <div className="glass-panel" style={styles.chartPanel}>
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>Verification Traffic Analytics</h3>
              <p style={styles.panelSubtitle}>Weekly verification request load vs bot interventions</p>
            </div>
            <div style={styles.chartLegend}>
              <div style={styles.legendItem}>
                <span style={{ ...styles.legendDot, background: 'var(--secondary)' }} />
                <span style={styles.legendText}>Humans Verified</span>
              </div>
              <div style={styles.legendItem}>
                <span style={{ ...styles.legendDot, background: 'var(--danger)' }} />
                <span style={styles.legendText}>Bots Blocked</span>
              </div>
            </div>
          </div>

          <div style={styles.chartWrapper}>
            <svg viewBox={`0 0 ${width} ${height}`} style={styles.svg}>
              <defs>
                <linearGradient id="humanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="botGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--danger)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--danger)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = paddingTop + ratio * chartHeight;
                return (
                  <line
                    key={i}
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.04)"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                );
              })}

              {/* X Axis Labels */}
              {chartData.map((d, i) => {
                const x = paddingLeft + (i / (chartData.length - 1)) * chartWidth;
                return (
                  <text
                    key={i}
                    x={x}
                    y={height - 10}
                    fill="var(--text-dark)"
                    fontSize="11"
                    fontWeight="500"
                    textAnchor="middle"
                  >
                    {d.day}
                  </text>
                );
              })}

              {/* Y Axis Labels */}
              {yLabels.map((val, i) => {
                const y = height - paddingBottom - (val / maxVal) * chartHeight;
                return (
                  <text
                    key={i}
                    x={paddingLeft - 8}
                    y={y + 4}
                    fill="var(--text-dark)"
                    fontSize="11"
                    fontWeight="500"
                    textAnchor="end"
                  >
                    {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                  </text>
                );
              })}

              {/* Area Under Curves */}
              <path d={humanArea} fill="url(#humanGrad)" />
              <path d={botArea} fill="url(#botGrad)" />

              {/* Line Curves */}
              <path d={humanLine} fill="none" stroke="var(--secondary)" strokeWidth="2.5" />
              <path d={botLine} fill="none" stroke="var(--danger)" strokeWidth="2" strokeDasharray="1,1" />

              {/* Interaction points */}
              {chartData.map((d, i) => {
                const hc = humanCoords[i];
                const bc = botCoords[i];
                const isHovered = hoveredPoint?.index === i;
                return (
                  <g key={i}>
                    {/* Hover hotspot */}
                    <rect
                      x={hc.x - 20}
                      y={0}
                      width={40}
                      height={height}
                      fill="transparent"
                      cursor="pointer"
                      onMouseEnter={() => setHoveredPoint({ ...d, index: i })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    
                    {/* Human dot */}
                    <circle
                      cx={hc.x}
                      cy={hc.y}
                      r={isHovered ? 6 : 4}
                      fill="#06b6d4"
                      stroke="#080b10"
                      strokeWidth="2"
                    />

                    {/* Bot dot */}
                    <circle
                      cx={bc.x}
                      cy={bc.y}
                      r={isHovered ? 5 : 3.5}
                      fill="#ef4444"
                      stroke="#080b10"
                      strokeWidth="1.5"
                    />

                    {/* Hover vertical line */}
                    {isHovered && (
                      <line
                        x1={hc.x}
                        y1={paddingTop}
                        x2={hc.x}
                        y2={height - paddingBottom}
                        stroke="rgba(6, 182, 212, 0.2)"
                        strokeWidth="1.5"
                        pointerEvents="none"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div style={{
                ...styles.tooltip,
                left: `${paddingLeft + (hoveredPoint.index / (chartData.length - 1)) * chartWidth}px`
              }}>
                <div style={styles.tooltipTitle}>{hoveredPoint.day} Analysis</div>
                <div style={{ color: 'var(--secondary)', display: 'flex', justifyContent: 'space-between', gap: '1.5rem' }}>
                  <span>Verified:</span> <strong>{hoveredPoint.human.toLocaleString()}</strong>
                </div>
                <div style={{ color: 'var(--danger)', display: 'flex', justifyContent: 'space-between', gap: '1.5rem' }}>
                  <span>Blocked:</span> <strong>{hoveredPoint.bot.toLocaleString()}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Threat Intelligence / Bot Origins */}
        <div className="glass-panel" style={styles.sidePanel}>
          <h3 style={styles.panelTitle}>Threat Intelligence</h3>
          <p style={styles.panelSubtitle}>Key traffic channels and automated bot fingerprints</p>

          <div style={styles.metricList}>
            <div style={styles.metricRow}>
              <div style={styles.metricLabelInfo}>
                <span style={styles.metricColorIndicator} />
                <span>Behavioral Telemetry</span>
              </div>
              <span style={styles.metricValueText}>{pctTelemetry}%</span>
            </div>
            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: `${pctTelemetry}%`, background: 'var(--primary)' }} />
            </div>

            <div style={styles.metricRow}>
              <div style={styles.metricLabelInfo}>
                <span style={{ ...styles.metricColorIndicator, background: 'var(--secondary)' }} />
                <span>3D Capcha Challenge</span>
              </div>
              <span style={styles.metricValueText}>{pctCaptcha}%</span>
            </div>
            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: `${pctCaptcha}%`, background: 'var(--secondary)' }} />
            </div>

            <div style={styles.metricRow}>
              <div style={styles.metricLabelInfo}>
                <span style={{ ...styles.metricColorIndicator, background: 'var(--warning)' }} />
                <span>Proof-of-Work Puzzles</span>
              </div>
              <span style={styles.metricValueText}>{pctPow}%</span>
            </div>
            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: `${pctPow}%`, background: 'var(--warning)' }} />
            </div>

            <div style={styles.metricRow}>
              <div style={styles.metricLabelInfo}>
                <span style={{ ...styles.metricColorIndicator, background: 'var(--danger)' }} />
                <span>Kinetics Biometric Scan</span>
              </div>
              <span style={styles.metricValueText}>{pctBiometrics}%</span>
            </div>
            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: `${pctBiometrics}%`, background: 'var(--danger)' }} />
            </div>
          </div>

          <div style={styles.warningBox}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div style={styles.warningText}>
              Thursday spike: Detected coordinated scrapers targeting <code>/v1/auth/signup</code> from residential endpoints. Auto-mitigation triggered.
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
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
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
  presetBadge: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(6, 182, 212, 0.05)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#fff'
  },
  threatBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    background: 'rgba(16, 185, 129, 0.05)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#fff'
  },
  threatPulse: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--success)',
    boxShadow: '0 0 8px var(--success)',
    animation: 'dot-pulse 2s infinite'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1.7fr 1fr',
    gap: '1.5rem',
    alignItems: 'start'
  },
  chartPanel: {
    padding: '1.75rem',
    position: 'relative'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '0.75rem'
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
    marginTop: '0.1rem'
  },
  chartLegend: {
    display: 'flex',
    gap: '1.25rem'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  legendText: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '500'
  },
  chartWrapper: {
    position: 'relative',
    width: '100%'
  },
  svg: {
    width: '100%',
    height: 'auto',
    display: 'block'
  },
  tooltip: {
    position: 'absolute',
    top: '15px',
    transform: 'translateX(-50%)',
    background: 'rgba(5, 7, 12, 0.95)',
    border: '1px solid var(--border-color-glow)',
    boxShadow: 'var(--glow-shadow)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '0.78rem',
    fontFamily: 'var(--font-mono)',
    zIndex: 10,
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  tooltipTitle: {
    fontWeight: '700',
    color: '#fff',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '0.25rem',
    marginBottom: '0.25rem'
  },
  sidePanel: {
    padding: '1.75rem'
  },
  metricList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    margin: '1.5rem 0'
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem'
  },
  metricLabelInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-muted)'
  },
  metricColorIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--primary)'
  },
  metricValueText: {
    fontWeight: '700',
    color: '#fff'
  },
  progressContainer: {
    width: '100%',
    height: '4px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: '2px'
  },
  warningBox: {
    display: 'flex',
    gap: '0.75rem',
    background: 'rgba(245, 158, 11, 0.03)',
    border: '1px solid rgba(245, 158, 11, 0.12)',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
    marginTop: '1.5rem'
  },
  warningText: {
    fontSize: '0.76rem',
    lineHeight: '1.4',
    color: 'var(--text-muted)'
  }
};
