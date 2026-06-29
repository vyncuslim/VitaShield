import React, { useState, useMemo } from 'react';
import type { VerificationLog } from '../types';

interface LogsTableProps {
  logs: VerificationLog[];
}

export const LogsTable: React.FC<LogsTableProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [inspectingLog, setInspectingLog] = useState<VerificationLog | null>(null);

  // Filter logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = 
        log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.includes(searchTerm) ||
        log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.browser.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;
      const matchesMethod = selectedMethod === 'all' || log.method === selectedMethod;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [logs, searchTerm, selectedStatus, selectedMethod]);

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'behavioral_telemetry': return 'Behavioral Telemetry';
      case 'captcha_3d': return '3D CAPTCHA';
      case 'biometric_scan': return 'Biometric Scan';
      case 'cryptographic_pow': return 'Cryptographic PoW';
      default: return method;
    }
  };

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString() + ' - ' + d.toLocaleDateString();
  };

  return (
    <div style={styles.container}>
      {/* Logs Controls Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title} className="gradient-text">Verification Audit Stream</h1>
          <p style={styles.subtitle}>Detailed historical logs of all verification events, telemetry details, and actions.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel" style={styles.filtersBar}>
        <div style={styles.searchWrapper}>
          <svg style={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dark)" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by Request ID, IP, Country, Device..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.dropdownsWrapper}>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)} 
            style={styles.selectInput}
          >
            <option value="all">All Statuses</option>
            <option value="passed">Passed</option>
            <option value="flagged">Flagged</option>
            <option value="blocked">Blocked</option>
          </select>

          <select 
            value={selectedMethod} 
            onChange={(e) => setSelectedMethod(e.target.value)} 
            style={styles.selectInput}
          >
            <option value="all">All Methods</option>
            <option value="behavioral_telemetry">Behavioral Telemetry</option>
            <option value="captcha_3d">3D CAPTCHA</option>
            <option value="biometric_scan">Biometric Scan</option>
            <option value="cryptographic_pow">Cryptographic PoW</option>
          </select>
        </div>
      </div>

      {/* Main Logs Table Grid */}
      <div style={styles.tableAndDrawerContainer}>
        {/* Table list */}
        <div className="glass-panel" style={styles.tablePanel}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={{ ...styles.th, width: '15%' }}>Request ID</th>
                <th style={{ ...styles.th, width: '20%' }}>Timestamp</th>
                <th style={{ ...styles.th, width: '15%' }}>IP Address</th>
                <th style={{ ...styles.th, width: '10%' }}>Risk Score</th>
                <th style={{ ...styles.th, width: '18%' }}>Method</th>
                <th style={{ ...styles.th, width: '12%' }}>Status</th>
                <th style={{ ...styles.th, width: '10%', textAlign: 'center' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} style={styles.tr}>
                    <td style={styles.tdCode}>{log.id}</td>
                    <td style={styles.td}>{formatTimestamp(log.timestamp)}</td>
                    <td style={styles.td}>
                      <div>{log.ipAddress}</div>
                      <div style={styles.subtext}>{log.location}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.riskScoreCell}>
                        <span style={styles.riskText}>{log.riskScore}%</span>
                        <div style={styles.riskBarBg}>
                          <div style={{
                            ...styles.riskBarFill,
                            width: `${log.riskScore}%`,
                            background: log.riskScore > 70 
                              ? 'var(--danger)' 
                              : log.riskScore > 30 
                              ? 'var(--warning)' 
                              : 'var(--success)'
                          }} />
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>{getMethodLabel(log.method)}</td>
                    <td style={styles.td}>
                      <span className={`badge badge-${log.status}`}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <button 
                        onClick={() => setInspectingLog(log)}
                        style={{
                          ...styles.inspectBtn,
                          ...(inspectingLog?.id === log.id ? styles.inspectBtnActive : {})
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={styles.emptyCell}>
                    No verification records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Audit Drawer Panel */}
        {inspectingLog && (
          <div className="glass-panel" style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <h3 style={styles.drawerTitle}>Audit Analysis</h3>
              <button onClick={() => setInspectingLog(null)} style={styles.closeBtn}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={styles.drawerBody}>
              <div style={styles.detailCard}>
                <span style={styles.detailLabel}>Verification Rating</span>
                <div style={styles.ratingBox}>
                  <div style={{
                    ...styles.ratingGauge,
                    borderColor: inspectingLog.riskScore > 70 
                      ? 'var(--danger)' 
                      : inspectingLog.riskScore > 30 
                      ? 'var(--warning)' 
                      : 'var(--success)'
                  }}>
                    <span style={styles.ratingNumber}>{inspectingLog.riskScore}</span>
                    <span style={styles.ratingLabelText}>Risk Score</span>
                  </div>
                  <div style={styles.verdictBox}>
                    <div style={styles.verdictTitle}>
                      Verdict:{' '}
                      <span style={{ 
                        color: inspectingLog.status === 'passed' 
                          ? 'var(--success)' 
                          : inspectingLog.status === 'flagged' 
                          ? 'var(--warning)' 
                          : 'var(--danger)'
                      }}>
                        {inspectingLog.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={styles.verdictDesc}>
                      {inspectingLog.riskScore > 70 
                        ? 'Suspicious behavior fingerprints and non-human telemetry patterns triggered instant blocking.' 
                        : inspectingLog.riskScore > 30 
                        ? 'Marginal interaction dynamics triggered interactive verification challenge which remains unconfirmed or flagged.' 
                        : 'Clean mouse kinematics, standard device fingerprints, and verified challenge validation. Seamless pass.'
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.drawerSection}>
                <h4 style={styles.sectionTitle}>Telemetry & Network Details</h4>
                <div style={styles.detailGrid}>
                  <div style={styles.gridItem}>
                    <span style={styles.gridLabel}>Request ID</span>
                    <span style={styles.gridValueCode}>{inspectingLog.id}</span>
                  </div>
                  <div style={styles.gridItem}>
                    <span style={styles.gridLabel}>IP Address</span>
                    <span style={styles.gridValue}>{inspectingLog.ipAddress}</span>
                  </div>
                  <div style={styles.gridItem}>
                    <span style={styles.gridLabel}>Client Location</span>
                    <span style={styles.gridValue}>{inspectingLog.location}</span>
                  </div>
                  <div style={styles.gridItem}>
                    <span style={styles.gridLabel}>Platform / OS</span>
                    <span style={styles.gridValue}>{inspectingLog.device}</span>
                  </div>
                  <div style={styles.gridItem}>
                    <span style={styles.gridLabel}>Web Browser</span>
                    <span style={styles.gridValue}>{inspectingLog.browser}</span>
                  </div>
                  <div style={styles.gridItem}>
                    <span style={styles.gridLabel}>Challenge Method</span>
                    <span style={styles.gridValue}>{getMethodLabel(inspectingLog.method)}</span>
                  </div>
                </div>
              </div>

              <div style={styles.drawerSection}>
                <h4 style={styles.sectionTitle}>Engine Signal Telemetry</h4>
                <div style={styles.signalsList}>
                  {/* Device Anomalies */}
                  {inspectingLog.deviceAnomalies && inspectingLog.deviceAnomalies.length > 0 ? (
                    inspectingLog.deviceAnomalies.map((anomaly: string) => (
                      <div key={anomaly} style={{ ...styles.signalRow, background: 'rgba(239, 68, 68, 0.05)', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                        <span style={{ color: '#fff' }}>Anomaly: {anomaly.replace(/_/g, ' ')}</span>
                        <span style={{ color: 'var(--danger)', fontWeight: '600' }}>FLAGGED</span>
                      </div>
                    ))
                  ) : (
                    <div style={styles.signalRow}>
                      <span>Device Fingerprint Integrity</span>
                      <span style={{ color: 'var(--success)', fontWeight: '600' }}>VERIFIED</span>
                    </div>
                  )}

                  {/* Behavior Flags */}
                  {inspectingLog.flags && inspectingLog.flags.length > 0 ? (
                    inspectingLog.flags.map((flag: string) => (
                      <div key={flag} style={{ ...styles.signalRow, background: 'rgba(245, 158, 11, 0.05)', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                        <span style={{ color: '#fff' }}>Kinetics: {flag.replace(/_/g, ' ')}</span>
                        <span style={{ color: 'var(--warning)', fontWeight: '600' }}>WARNING</span>
                      </div>
                    ))
                  ) : (
                    <div style={styles.signalRow}>
                      <span>Kinetics Pattern Analysis</span>
                      <span style={{ color: 'var(--success)', fontWeight: '600' }}>HUMAN FLOW</span>
                    </div>
                  )}
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
    gap: '1.5rem'
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
  filtersBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.5rem 0.85rem',
    flex: '1',
    minWidth: '280px'
  },
  searchIcon: {
    display: 'flex',
    alignItems: 'center'
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    width: '100%',
    fontSize: '0.88rem',
    color: '#fff',
    outline: 'none'
  },
  dropdownsWrapper: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center'
  },
  selectInput: {
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.5rem 1rem 0.5rem 0.75rem',
    fontSize: '0.85rem',
    color: 'var(--text-main)',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '140px'
  },
  tableAndDrawerContainer: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'start',
    width: '100%'
  },
  tablePanel: {
    flex: 1,
    overflowX: 'auto',
    padding: '1.25rem'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  thRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
  },
  th: {
    padding: '1rem 0.75rem',
    fontSize: '0.82rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    transition: 'background 0.2s ease',
    cursor: 'pointer'
  },
  td: {
    padding: '1rem 0.75rem',
    fontSize: '0.88rem',
    color: '#f1f5f9',
    verticalAlign: 'middle'
  },
  tdCode: {
    padding: '1rem 0.75rem',
    fontSize: '0.82rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--secondary)',
    verticalAlign: 'middle'
  },
  subtext: {
    fontSize: '0.75rem',
    color: 'var(--text-dark)',
    marginTop: '0.15rem'
  },
  riskScoreCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  riskText: {
    fontSize: '0.82rem',
    fontWeight: '600',
    fontFamily: 'var(--font-mono)'
  },
  riskBarBg: {
    width: '80px',
    height: '4px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '2px'
  },
  riskBarFill: {
    height: '100%',
    borderRadius: '2px'
  },
  inspectBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.35rem 0.75rem',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  inspectBtnActive: {
    background: 'var(--secondary-glow)',
    borderColor: 'var(--secondary)',
    color: '#fff'
  },
  emptyCell: {
    padding: '3rem',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.9rem'
  },
  drawer: {
    width: '360px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'stretch',
    background: 'rgba(11, 15, 26, 0.95)',
    border: '1px solid rgba(6, 182, 212, 0.15)',
    boxShadow: 'var(--glow-shadow)',
    animation: 'slide-up 0.3s ease'
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '0.75rem',
    marginBottom: '1.25rem'
  },
  drawerTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#fff'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '0.2rem'
  },
  drawerBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    flex: 1,
    overflowY: 'auto'
  },
  detailCard: {
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '10px',
    padding: '1rem'
  },
  detailLabel: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: 'var(--text-dark)',
    fontWeight: '600',
    display: 'block',
    marginBottom: '0.75rem'
  },
  ratingBox: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  ratingGauge: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: '3px solid transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.3)'
  },
  ratingNumber: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'var(--font-mono)'
  },
  ratingLabelText: {
    fontSize: '0.52rem',
    color: 'var(--text-dark)',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginTop: '-0.1rem'
  },
  verdictBox: {
    flex: 1
  },
  verdictTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem'
  },
  verdictDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    lineHeight: '1.35'
  },
  drawerSection: {
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
    paddingTop: '1rem'
  },
  sectionTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.75rem'
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '0.65rem'
  },
  gridItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.78rem',
    alignItems: 'center'
  },
  gridLabel: {
    color: 'var(--text-dark)',
    fontWeight: '500'
  },
  gridValue: {
    color: 'var(--text-main)',
    fontWeight: '600'
  },
  gridValueCode: {
    fontFamily: 'var(--font-mono)',
    color: 'var(--secondary)',
    fontWeight: '600'
  },
  signalsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  signalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.76rem',
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '0.5rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.02)'
  }
};
