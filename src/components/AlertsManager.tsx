import React, { useState } from 'react';

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  threshold: string;
  channels: string[];
  enabled: boolean;
}

export const AlertsManager: React.FC = () => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: 'rule-1',
      name: 'Attack Spike Alert',
      metric: 'Bot Block Ratio',
      threshold: '> 15% in 5 mins',
      channels: ['Slack', 'Email'],
      enabled: true
    },
    {
      id: 'rule-2',
      name: 'API Latency Threshold',
      metric: 'Average Edge Latency',
      threshold: '> 250ms for 1 min',
      channels: ['Slack', 'Webhook'],
      enabled: true
    },
    {
      id: 'rule-3',
      name: 'High Fail Rate',
      metric: 'Challenge Solve Failure',
      threshold: '> 40% in 15 mins',
      channels: ['Email'],
      enabled: false
    }
  ]);

  const [slackUrl, setSlackUrl] = useState('https://hooks.slack.com/services/YOUR_WORKSPACE_ID/YOUR_CHANNEL_ID/YOUR_WEBHOOK_TOKEN');
  const [discordUrl, setDiscordUrl] = useState('');
  const [emailAddress, setEmailAddress] = useState('security-ops@vitamind.ai');
  const [webhookUrl, setWebhookUrl] = useState('');

  const [spikePercent, setSpikePercent] = useState(15);
  const [saveStatus, setSaveStatus] = useState(false);

  const toggleAlert = (id: string) => {
    setAlertRules(alertRules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title} className="gradient-text">Alerts & Webhooks Manager</h1>
          <p style={styles.subtitle}>Configure automated channels to trigger warnings for latency spikes or attack traffic.</p>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Left: Alerts channels setup */}
        <div className="glass-panel" style={styles.leftCol}>
          <h3 style={styles.panelTitle}>Notification Integrations</h3>
          <p style={styles.panelSubtitle}>Route event alarms directly to your engineering team communication chatrooms.</p>

          <form onSubmit={handleSave} style={styles.form}>
            <div className="input-group">
              <label className="input-label">Slack Incoming Webhook URL</label>
              <input 
                type="text" 
                placeholder="https://hooks.slack.com/services/..." 
                value={slackUrl} 
                onChange={e=>setSlackUrl(e.target.value)} 
                className="input-field" 
                style={styles.inputMono}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Discord Webhook Destination</label>
              <input 
                type="text" 
                placeholder="https://discord.com/api/webhooks/..." 
                value={discordUrl} 
                onChange={e=>setDiscordUrl(e.target.value)} 
                className="input-field" 
                style={styles.inputMono}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Ops Security Email List</label>
              <input 
                type="email" 
                value={emailAddress} 
                onChange={e=>setEmailAddress(e.target.value)} 
                className="input-field" 
              />
            </div>

            <div className="input-group">
              <label className="input-label">Generic Webhook Endpoint (POST JSON)</label>
              <input 
                type="text" 
                placeholder="https://api.yourdomain.com/v1/bot-alerts" 
                value={webhookUrl} 
                onChange={e=>setWebhookUrl(e.target.value)} 
                className="input-field" 
                style={styles.inputMono}
              />
            </div>

            <div style={styles.btnRow}>
              <button type="submit" className="settings-btn-primary">
                {saveStatus ? 'Settings Saved ✓' : 'Save Alerts Configuration'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Rules Thresholds & Active alarms */}
        <div style={styles.rightCol}>
          {/* Spike slider card */}
          <div className="glass-panel" style={styles.rightCard}>
            <h3 style={styles.panelTitle}>Sensitivity Thresholds</h3>
            <p style={styles.panelSubtitle}>Adjust trigger thresholds for bot traffic spikes.</p>

            <div style={styles.sliderBox}>
              <div style={styles.sliderLabel}>
                <span>Spike Threshold:</span> <strong>{spikePercent}% Block Rate</strong>
              </div>
              <input 
                type="range" 
                min="5" 
                max="50" 
                value={spikePercent} 
                onChange={(e) => setSpikePercent(Number(e.target.value))}
                className="captcha-slider-input"
              />
              <p style={styles.sliderDesc}>
                Triggers Slack/Email notifications if the firewall blocks more than {spikePercent}% of aggregate connections inside a 5-minute sliding window.
              </p>
            </div>
          </div>

          {/* Active alarms list */}
          <div className="glass-panel" style={{ ...styles.rightCard, marginTop: '1.25rem' }}>
            <h3 style={styles.panelTitle}>Active Monitor Alarms</h3>
            <p style={styles.panelSubtitle}>Configure custom triggers for health check telemetry.</p>

            <div style={styles.alertList}>
              {alertRules.map((rule) => (
                <div 
                  key={rule.id} 
                  style={{ 
                    ...styles.alertCard, 
                    borderColor: rule.enabled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                    opacity: rule.enabled ? 1 : 0.6
                  }}
                >
                  <div style={styles.alertTop}>
                    <div style={styles.alertMeta}>
                      <span style={styles.alertName}>{rule.name}</span>
                      <span style={styles.alertThreshold}>
                        {rule.metric}: <code>{rule.threshold}</code>
                      </span>
                    </div>
                    <button 
                      onClick={() => toggleAlert(rule.id)}
                      style={{
                        ...styles.toggleBtn,
                        background: rule.enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        color: rule.enabled ? 'var(--success)' : 'var(--text-muted)'
                      }}
                    >
                      {rule.enabled ? 'Active' : 'Muted'}
                    </button>
                  </div>
                  
                  <div style={styles.channelsRow}>
                    {rule.channels.map((chan, idx) => (
                      <span key={idx} style={styles.channelBadge}>{chan}</span>
                    ))}
                  </div>
                </div>
              ))}
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
    gridTemplateColumns: '1.2fr 1fr',
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
  rightCard: {
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  inputMono: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem'
  },
  btnRow: {
    marginTop: '0.5rem'
  },
  sliderBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '0.5rem'
  },
  sliderLabel: {
    fontSize: '0.88rem',
    color: '#fff'
  },
  sliderDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    marginTop: '0.25rem'
  },
  alertList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  alertCard: {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '10px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
    transition: 'all 0.2s ease'
  },
  alertTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  alertMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem'
  },
  alertName: {
    fontSize: '0.88rem',
    fontWeight: '700',
    color: '#fff'
  },
  alertThreshold: {
    fontSize: '0.76rem',
    color: 'var(--text-muted)'
  },
  toggleBtn: {
    border: 'none',
    padding: '0.3rem 0.65rem',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  channelsRow: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap'
  },
  channelBadge: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '4px',
    fontSize: '0.7rem',
    color: 'var(--text-main)',
    padding: '0.15rem 0.4rem',
    fontWeight: '600'
  }
};
