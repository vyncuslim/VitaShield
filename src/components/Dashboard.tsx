import React, { useState } from 'react';
import type { ShieldConfig } from '../types';

interface DashboardProps {
  config: ShieldConfig;
}

export const Dashboard: React.FC<DashboardProps> = ({ config }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; human: number; bot: number; index: number } | null>(null);

  // Dynamic KPI stats based on preset selector
  const getKpis = () => {
    switch (config.preset) {
      case 'social':
        return [
          {
            title: 'Attack Count',
            value: '8,721',
            change: '+15.2% fake accounts',
            isUp: true,
            color: 'var(--warning)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            )
          },
          {
            title: 'Bot Traffic Rate',
            value: '4.8%',
            change: '+0.5% duplicate signups',
            isUp: true,
            color: 'var(--primary)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            )
          },
          {
            title: 'Blocked Requests',
            value: '3,120',
            change: '+14.2% mass registrations',
            isUp: true,
            color: 'var(--danger)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )
          },
          {
            title: 'Device Trust Pass',
            value: '97.4%',
            change: '+1.1% fingerprint sync',
            isUp: true,
            color: 'var(--success)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )
          }
        ];
      case 'ai_apps':
        return [
          {
            title: 'Attack Count',
            value: '14,212',
            change: '+22.4% scraper bots',
            isUp: true,
            color: 'var(--warning)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 22 22 22 12 2" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )
          },
          {
            title: 'Bot Traffic Rate',
            value: '12.4%',
            change: '+4.1% prompt injection',
            isUp: true,
            color: 'var(--primary)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            )
          },
          {
            title: 'Blocked Requests',
            value: '9,230',
            change: '+28.2% LLM hijack limit',
            isUp: true,
            color: 'var(--danger)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )
          },
          {
            title: 'PoW Solver Pass',
            value: '91.8%',
            change: '+0.5% hash calculation',
            isUp: true,
            color: 'var(--success)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )
          }
        ];
      case 'crypto':
        return [
          {
            title: 'Attack Count',
            value: '2,410',
            change: '+8.3% duplicate GPUs',
            isUp: true,
            color: 'var(--warning)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            )
          },
          {
            title: 'Bot Traffic Rate',
            value: '3.5%',
            change: '-0.8% Sybil scripts',
            isUp: false,
            color: 'var(--primary)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            )
          },
          {
            title: 'Blocked Requests',
            value: '1,822',
            change: '+19.4% wallet farming',
            isUp: true,
            color: 'var(--danger)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            )
          },
          {
            title: 'Anti-Sybil Clearance',
            value: '96.2%',
            change: '+1.5% WebGL hardware',
            isUp: true,
            color: 'var(--success)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )
          }
        ];
      case 'gaming':
        return [
          {
            title: 'Attack Count',
            value: '28,102',
            change: '+32.1% studio macros',
            isUp: true,
            color: 'var(--warning)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )
          },
          {
            title: 'Bot Traffic Rate',
            value: '8.9%',
            change: '+2.4% auto-clickers',
            isUp: true,
            color: 'var(--primary)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            )
          },
          {
            title: 'Blocked Requests',
            value: '14,812',
            change: '+15.3% client macros',
            isUp: true,
            color: 'var(--danger)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="9" x2="15" y2="15" />
                <line x1="15" y1="9" x2="9" y2="15" />
              </svg>
            )
          },
          {
            title: 'Kinetics Tracker Pass',
            value: '95.1%',
            change: '+0.4% cursor path scan',
            isUp: true,
            color: 'var(--success)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )
          }
        ];
      case 'general':
      default:
        return [
          {
            title: 'Attack Count',
            value: '12,482',
            change: '+18.1% vs last week',
            isUp: true,
            color: 'var(--warning)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )
          },
          {
            title: 'Bot Traffic Rate',
            value: '5.8%',
            change: '+1.2% activity spike',
            isUp: true,
            color: 'var(--primary)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            )
          },
          {
            title: 'Blocked Requests',
            value: '4,208',
            change: '+12.4% block efficiency',
            isUp: true,
            color: 'var(--danger)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )
          },
          {
            title: 'Human Pass Rate',
            value: '94.2%',
            change: '+0.8% accuracy gain',
            isUp: true,
            color: 'var(--success)',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )
          }
        ];
    }
  };

  const kpis = getKpis();

  // Chart data setup (Last 7 Days)
  const chartData = [
    { day: 'Mon', human: 12000, bot: 300 },
    { day: 'Tue', human: 15400, bot: 950 },
    { day: 'Wed', human: 14200, bot: 400 },
    { day: 'Thu', human: 18100, bot: 2100 }, // attack spike
    { day: 'Fri', human: 19500, bot: 600 },
    { day: 'Sat', human: 11000, bot: 250 },
    { day: 'Sun', human: 13200, bot: 320 }
  ];

  const maxVal = 22000;
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
              {[0, 5000, 10000, 15000, 20000].map((val, i) => {
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
                    {val >= 1000 ? `${val / 1000}k` : val}
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
                <span>Datacenter Scrapers</span>
              </div>
              <span style={styles.metricValueText}>38.5%</span>
            </div>
            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: '38.5%', background: 'var(--primary)' }} />
            </div>

            <div style={styles.metricRow}>
              <div style={styles.metricLabelInfo}>
                <span style={{ ...styles.metricColorIndicator, background: 'var(--secondary)' }} />
                <span>Headless Browsers (Puppeteer)</span>
              </div>
              <span style={styles.metricValueText}>29.4%</span>
            </div>
            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: '29.4%', background: 'var(--secondary)' }} />
            </div>

            <div style={styles.metricRow}>
              <div style={styles.metricLabelInfo}>
                <span style={{ ...styles.metricColorIndicator, background: 'var(--warning)' }} />
                <span>AI Agent Solvers</span>
              </div>
              <span style={styles.metricValueText}>21.2%</span>
            </div>
            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: '21.2%', background: 'var(--warning)' }} />
            </div>

            <div style={styles.metricRow}>
              <div style={styles.metricLabelInfo}>
                <span style={{ ...styles.metricColorIndicator, background: 'var(--danger)' }} />
                <span>Residential Proxy Spoofing</span>
              </div>
              <span style={styles.metricValueText}>10.9%</span>
            </div>
            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: '10.9%', background: 'var(--danger)' }} />
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
