import React, { useState } from 'react';

interface IPOverride {
  id: string;
  ip: string;
  type: 'whitelist' | 'blacklist';
  reason: string;
  addedAt: string;
}

interface ReviewSession {
  id: string;
  score: number;
  country: string;
  trigger: string;
}

export const AdminPortal: React.FC = () => {
  const [overrides, setOverrides] = useState<IPOverride[]>([
    {
      id: 'ov-1',
      ip: '104.244.42.1',
      type: 'blacklist',
      reason: 'Flagged by shared Fraud Intelligence feed (Bot Farm node)',
      addedAt: '2026-06-27 10:12'
    },
    {
      id: 'ov-2',
      ip: '192.168.1.200',
      type: 'whitelist',
      reason: 'Developer team sandbox office route',
      addedAt: '2026-06-27 12:45'
    }
  ]);

  const [reviewQueue, setReviewQueue] = useState<ReviewSession[]>([
    {
      id: 'vms_ses_8f3a921d7b0',
      score: 55,
      country: 'MY',
      trigger: 'Suspicious cursor velocity deviation'
    },
    {
      id: 'vms_ses_2ac44e9ff1c',
      score: 68,
      country: 'US',
      trigger: 'Virtual machine headers match'
    }
  ]);

  const [newIp, setNewIp] = useState('');
  const [newType, setNewType] = useState<'whitelist' | 'blacklist'>('blacklist');
  const [newReason, setNewReason] = useState('');

  const addOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) return;

    const newOv: IPOverride = {
      id: `ov-${Date.now()}`,
      ip: newIp,
      type: newType,
      reason: newReason || 'Manual administrator override',
      addedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setOverrides([newOv, ...overrides]);
    setNewIp('');
    setNewReason('');
  };

  const removeOverride = (id: string) => {
    setOverrides(overrides.filter(ov => ov.id !== id));
  };

  const handleReviewAction = (id: string, _action: 'allow' | 'block') => {
    setReviewQueue(reviewQueue.filter(ses => ses.id !== id));
  };

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title} className="gradient-text">Admin Control & Operations Panel</h1>
          <p style={styles.subtitle}>Gateway health metrics, database whitelist overrides, and session review boards.</p>
        </div>
      </div>

      {/* Health Metrics Grid */}
      <div style={styles.statsGrid}>
        <div className="glass-panel" style={styles.statCard}>
          <span style={styles.statLabel}>Gateway Health</span>
          <div style={styles.statVal}>99.997%</div>
          <span style={styles.statSub}>Edge routing stability SLA</span>
        </div>
        <div className="glass-panel" style={styles.statCard}>
          <span style={styles.statLabel}>Avg Latency</span>
          <div style={styles.statVal}>112ms</div>
          <span style={styles.statSub}><strong style={{ color: 'var(--success)' }}>&lt; 200ms Target</strong></span>
        </div>
        <div className="glass-panel" style={styles.statCard}>
          <span style={styles.statLabel}>Challenge Pass Rate</span>
          <div style={styles.statVal}>94.8%</div>
          <span style={styles.statSub}>12,408 successful solves</span>
        </div>
        <div className="glass-panel" style={styles.statCard}>
          <span style={styles.statLabel}>Threat Mitigation</span>
          <div style={{ ...styles.statVal, color: 'var(--success)' }}>NORMAL</div>
          <span style={styles.statSub}>0 active attack vectors</span>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Left: Overrides Controls */}
        <div className="glass-panel" style={styles.leftCol}>
          <h3 style={styles.panelTitle}>Manual Overrides Rules</h3>
          <p style={styles.panelSubtitle}>Add rules to bypass verification or drop connections immediately for specific IPs.</p>

          <form onSubmit={addOverride} style={styles.formInline}>
            <input 
              required 
              type="text" 
              placeholder="IP Address (e.g. 192.168.1.1)" 
              value={newIp} 
              onChange={e=>setNewIp(e.target.value)} 
              className="input-field" 
              style={{ flex: 1.5 }}
            />
            <select value={newType} onChange={e=>setNewType(e.target.value as any)} style={styles.selector}>
              <option value="blacklist">Blacklist</option>
              <option value="whitelist">Whitelist</option>
            </select>
            <input 
              type="text" 
              placeholder="Override Reason" 
              value={newReason} 
              onChange={e=>setNewReason(e.target.value)} 
              className="input-field" 
              style={{ flex: 2 }}
            />
            <button type="submit" className="settings-btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
              Add Override
            </button>
          </form>

          {/* Overrides Table */}
          <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>IP Address</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Added At</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {overrides.map((ov) => (
                  <tr key={ov.id}>
                    <td style={styles.tdIp}>{ov.ip}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: ov.type === 'whitelist' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: ov.type === 'whitelist' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {ov.type.toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.tdDesc}>{ov.reason}</td>
                    <td style={styles.tdDate}>{ov.addedAt}</td>
                    <td style={styles.td}>
                      <button onClick={() => removeOverride(ov.id)} style={styles.removeBtn}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Manual Review Drawer */}
        <div className="glass-panel" style={styles.rightCol}>
          <h3 style={styles.panelTitle}>Manual Audit Review</h3>
          <p style={styles.panelSubtitle}>Sessions flagged by detection engines for high threat scoring.</p>

          <div style={styles.reviewList}>
            {reviewQueue.length === 0 ? (
              <div style={styles.emptyReview}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No flagged sessions in review queue.</span>
              </div>
            ) : (
              reviewQueue.map((ses) => (
                <div key={ses.id} style={styles.reviewCard}>
                  <div style={styles.reviewHeader}>
                    <span style={styles.reviewId}>{ses.id}</span>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: '700',
                      color: ses.score > 60 ? 'var(--danger)' : 'var(--warning)'
                    }}>
                      Score: {ses.score}/100
                    </span>
                  </div>
                  <div style={styles.reviewBody}>
                    <div>Country: <strong>{ses.country}</strong></div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginTop: '0.2rem' }}>
                      Flag: {ses.trigger}
                    </div>
                  </div>
                  <div style={styles.reviewButtons}>
                    <button 
                      onClick={() => handleReviewAction(ses.id, 'allow')} 
                      style={styles.reviewAllowBtn}
                    >
                      Bypass Whitelist
                    </button>
                    <button 
                      onClick={() => handleReviewAction(ses.id, 'block')} 
                      style={styles.reviewBlockBtn}
                    >
                      Confirm Block
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: any } = {
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.25rem'
  },
  statCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  statLabel: {
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    color: 'var(--text-dark)',
    fontWeight: '750',
    letterSpacing: '0.06em'
  },
  statVal: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#fff'
  },
  statSub: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '1.5rem',
    alignItems: 'start'
  },
  leftCol: {
    padding: '1.75rem'
  },
  rightCol: {
    padding: '1.75rem'
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
    marginBottom: '1.5rem'
  },
  formInline: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  selector: {
    padding: '0.65rem 0.85rem',
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.88rem',
    outline: 'none',
    width: '120px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.82rem',
    textAlign: 'left'
  },
  th: {
    padding: '0.6rem 0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-dark)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  td: {
    padding: '0.75rem 0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    color: '#fff'
  },
  tdIp: {
    padding: '0.75rem 0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    fontFamily: 'var(--font-mono)',
    color: 'var(--secondary)'
  },
  tdDesc: {
    padding: '0.75rem 0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    color: 'var(--text-muted)',
    maxWidth: '240px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  tdDate: {
    padding: '0.75rem 0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    color: 'var(--text-dark)',
    fontFamily: 'var(--font-mono)'
  },
  badge: {
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px'
  },
  removeBtn: {
    background: 'transparent',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: 'var(--danger)',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  reviewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  emptyReview: {
    padding: '2rem',
    textAlign: 'center',
    background: 'rgba(0,0,0,0.1)',
    borderRadius: '8px',
    border: '1px dashed rgba(255,255,255,0.03)'
  },
  reviewCard: {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  reviewId: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    color: 'var(--secondary)'
  },
  reviewBody: {
    fontSize: '0.8rem',
    color: '#fff'
  },
  reviewButtons: {
    display: 'flex',
    gap: '0.5rem'
  },
  reviewAllowBtn: {
    flex: 1,
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    color: 'var(--success)',
    padding: '0.4rem',
    borderRadius: '6px',
    fontSize: '0.74rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  reviewBlockBtn: {
    flex: 1,
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: 'var(--danger)',
    padding: '0.4rem',
    borderRadius: '6px',
    fontSize: '0.74rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};
