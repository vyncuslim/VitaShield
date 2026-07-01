import React, { useState } from 'react';
import type { ShieldConfig } from '../types';

interface SettingsProps {
  config: ShieldConfig;
  setConfig: (config: ShieldConfig) => void;
}

export const Settings: React.FC<SettingsProps> = ({ config, setConfig }) => {
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [localConfig, setLocalConfig] = useState<ShieldConfig>({ ...config });

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as ShieldConfig['preset'];
    let strict: ShieldConfig['strictness'] = 'medium';
    let force: ShieldConfig['forcedMethod'] = 'auto';
    if (val === 'ai_apps' || val === 'crypto' || val === 'gaming') {
      strict = 'high';
    }
    if (val === 'ai_apps') {
      force = 'cryptographic_pow';
    } else if (val === 'gaming') {
      force = 'behavioral_telemetry';
    }
    setLocalConfig(prev => ({ 
      ...prev, 
      preset: val,
      strictness: strict,
      forcedMethod: force
    }));
  };

  const handleStrictnessChange = (level: 'low' | 'medium' | 'high') => {
    setLocalConfig(prev => ({ ...prev, strictness: level }));
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalConfig(prev => ({ 
      ...prev, 
      forcedMethod: e.target.value as ShieldConfig['forcedMethod']
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setConfig({ ...localConfig });
      setSaveLoading(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }, 800);
  };

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title} className="gradient-text">Engine Configurations</h1>
          <p style={styles.subtitle}>Fine-tune verification rules, risk parameters, and mitigation strictness.</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={styles.formLayout}>
        {/* Left column - main settings */}
        <div style={styles.mainSettingsCol}>
          {/* Protection Presets Selector */}
          <div className="glass-panel" style={styles.panel}>
            <h3 style={styles.panelTitle}>AI-Native Protection Presets</h3>
            <p style={styles.panelSubtitle}>Configure custom anti-bot protocols tailored to your industry niche.</p>
            
            <div className="input-group">
              <label className="input-label" htmlFor="protection-preset">Current Protection Preset</label>
              <select
                id="protection-preset"
                value={localConfig.preset}
                onChange={handlePresetChange}
                className="input-field"
                style={{ background: 'rgba(0,0,0,0.45)' }}
              >
                <option value="general">General Web Security (Standard anti-bot protection)</option>
                <option value="social">Social Platforms (Anti-fake accounts / duplicate registration detection)</option>
                <option value="ai_apps">AI Applications (Anti-bot prompt abuse / scraping mitigation)</option>
                <option value="crypto">Web3 & Crypto (Anti-sybil farming / multi-wallet tracking)</option>
                <option value="gaming">Gaming Portals (Anti-bot studios / clicking macro detection)</option>
              </select>
            </div>
            
            <div style={styles.presetExplanation}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <div style={{ fontSize: '0.82rem', lineHeight: '1.45', color: 'var(--text-muted)' }}>
                {localConfig.preset === 'general' && (
                  <span><strong>General Preset</strong>: Deploys standard multi-layered heuristics. Ideal for generic SaaS portals to verify humans silently using client behavioral biometrics.</span>
                )}
                {localConfig.preset === 'social' && (
                  <span><strong>Social Platforms Preset</strong>: Heavily prioritizes Layer 1 Device Fingerprint checks to block automated fake/duplicate account registration spikes while keeping user signup flow frictionless.</span>
                )}
                {localConfig.preset === 'ai_apps' && (
                  <span><strong>AI Apps Preset</strong>: Anti-bot scraping protocol. Dynamically increases cryptographic Proof-of-Work difficulty to curb mass LLM chat query loops and prompt injection scraping.</span>
                )}
                {localConfig.preset === 'crypto' && (
                  <span><strong>Web3 & Crypto Preset</strong>: Anti-sybil architecture. Scans hardware rendering footprints (WebGL/GPU) to prevent bad actors from claiming rewards across multiple wallets on duplicate setups.</span>
                )}
                {localConfig.preset === 'gaming' && (
                  <span><strong>Gaming Preset</strong>: Anti-studio macro guard. Focuses on Layer 2 Behavior analysis, logging micro-patterns of cursor movement jitter and click rhythms to identify automated macros.</span>
                )}
              </div>
            </div>
          </div>

          <div className="glass-panel" style={styles.panel}>
            <h3 style={styles.panelTitle}>Risk Threshold Rules</h3>
            <p style={styles.panelSubtitle}>Determine how aggressively VitaShield flags sessions.</p>

            <div style={styles.strictnessSelector}>
              <div style={styles.sliderLabelRow}>
                <span>Engine Sensitivity</span>
                <strong style={{ 
                  color: localConfig.strictness === 'high' 
                    ? 'var(--danger)' 
                    : localConfig.strictness === 'medium' 
                    ? 'var(--warning)' 
                    : 'var(--success)' 
                }}>
                  {localConfig.strictness.toUpperCase()}
                </strong>
              </div>

              <div style={styles.strictGrid}>
                <button
                  type="button"
                  onClick={() => handleStrictnessChange('low')}
                  style={{
                    ...styles.strictBtn,
                    ...(localConfig.strictness === 'low' ? styles.strictBtnActive : {})
                  }}
                >
                  <div style={styles.strictBtnTitle}>Low Sensitivity</div>
                  <div style={styles.strictBtnDesc}>Flags sessions with risk &gt; 85%. Minimizes user friction.</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleStrictnessChange('medium')}
                  style={{
                    ...styles.strictBtn,
                    ...(localConfig.strictness === 'medium' ? styles.strictBtnActive : {})
                  }}
                >
                  <div style={styles.strictBtnTitle}>Standard</div>
                  <div style={styles.strictBtnDesc}>Flags sessions with risk &gt; 70%. Best balancing index.</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleStrictnessChange('high')}
                  style={{
                    ...styles.strictBtn,
                    ...(localConfig.strictness === 'high' ? styles.strictBtnActive : {})
                  }}
                >
                  <div style={styles.strictBtnTitle}>Strict</div>
                  <div style={styles.strictBtnDesc}>Flags sessions with risk &gt; 45%. Recommended for checkout routes.</div>
                </button>
              </div>
            </div>

            <div style={styles.settingDivider} />

            <div className="input-group">
              <label className="input-label" htmlFor="forced-method">Verification Mode Override</label>
              <select
                id="forced-method"
                value={localConfig.forcedMethod}
                onChange={handleMethodChange}
                className="input-field"
                style={{ background: 'rgba(0,0,0,0.45)' }}
              >
                <option value="auto">Auto-detect (Invisible Telemetry fallback)</option>
                <option value="behavioral_telemetry">Force Behavioral Verification (Silent pass only)</option>
                <option value="captcha_3d">Force Interactive 3D CAPTCHA</option>
                <option value="biometric_scan">Force Biometric Facial Geometry Sweep</option>
                <option value="cryptographic_pow">Force Proof-of-Work Math Challenge</option>
              </select>
              <p style={styles.helperText}>
                By default, the engine executes invisible checks and only triggers interactive panels for suspect client payloads.
              </p>
            </div>
          </div>

          <div className="glass-panel" style={styles.panel}>
            <h3 style={styles.panelTitle}>Anti-Abuse Protocols</h3>
            <p style={styles.panelSubtitle}>Configure advanced security headers and scraping guards.</p>

            <div style={styles.togglesList}>
              <div style={styles.toggleRow}>
                <div>
                  <div style={styles.toggleTitle}>Block Residential Proxies</div>
                  <div style={styles.toggleDesc}>Instantly drop connections originating from known VPNs and hosting server pools.</div>
                </div>
                <label style={styles.switch}>
                  <input type="checkbox" defaultChecked />
                  <span style={styles.slider} />
                </label>
              </div>

              <div style={styles.toggleRow}>
                <div>
                  <div style={styles.toggleTitle}>Dynamic Cryptographic Hash Scaling</div>
                  <div style={styles.toggleDesc}>Increase Proof-of-Work puzzle difficulty automatically under high traffic volume.</div>
                </div>
                <label style={styles.switch}>
                  <input type="checkbox" defaultChecked />
                  <span style={styles.slider} />
                </label>
              </div>

              <div style={styles.toggleRow}>
                <div>
                  <div style={styles.toggleTitle}>Telemetry Silent Pass</div>
                  <div style={styles.toggleDesc}>Allow seamless form submission for users with 100% human kinematics scores.</div>
                </div>
                <label style={styles.switch}>
                  <input type="checkbox" defaultChecked />
                  <span style={styles.slider} />
                </label>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={styles.panel}>
            <h3 style={styles.panelTitle}>Custom Widget Styling & Themes</h3>
            <p style={styles.panelSubtitle}>Align the interactive verify challenge elements with your website styling themes.</p>

            <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label" htmlFor="theme-primary">Primary Glow</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="color"
                    id="theme-primary"
                    value={localConfig.themePrimary || '#00f2fe'}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, themePrimary: e.target.value }))}
                    style={{ width: '36px', height: '36px', border: 'none', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={localConfig.themePrimary || '#00f2fe'}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, themePrimary: e.target.value }))}
                    className="input-field"
                    style={{ margin: 0 }}
                  />
                </div>
              </div>

              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label" htmlFor="theme-bg">Container Background</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="color"
                    id="theme-bg"
                    value={localConfig.themeBg || '#0b1329'}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, themeBg: e.target.value }))}
                    style={{ width: '36px', height: '36px', border: 'none', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={localConfig.themeBg || '#0b1329'}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, themeBg: e.target.value }))}
                    className="input-field"
                    style={{ margin: 0 }}
                  />
                </div>
              </div>

              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label" htmlFor="theme-text">Text Color</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="color"
                    id="theme-text"
                    value={localConfig.themeText || '#a5f3fc'}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, themeText: e.target.value }))}
                    style={{ width: '36px', height: '36px', border: 'none', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={localConfig.themeText || '#a5f3fc'}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, themeText: e.target.value }))}
                    className="input-field"
                    style={{ margin: 0 }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)', marginBottom: '6px' }}>Generated Custom Script Embed Code:</div>
              <pre style={{ margin: 0, fontSize: '0.75rem', color: '#fff', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
{`<div id="vitashield-widget"
     data-sitekey="vms_pub_live_79a2b8e3df9102ca"
     data-theme-primary="${localConfig.themePrimary || '#00f2fe'}"
     data-theme-bg="${localConfig.themeBg || '#0b1329'}"
     data-theme-text="${localConfig.themeText || '#a5f3fc'}">
</div>`}
              </pre>
            </div>
          </div>
        </div>

        {/* Right column - sidebar save and status */}
        <div style={styles.sideSettingsCol}>
          <div className="glass-panel" style={{ ...styles.panel, position: 'sticky', top: '2rem' }}>
            <h3 style={styles.panelTitle}>Configuration Status</h3>
            
            <div style={styles.statusBox}>
              <div style={styles.statusRow}>
                <span style={styles.statusLabel}>Current Gateway</span>
                <span style={styles.statusVal}>vitashield.sleepsomno.com</span>
              </div>
              <div style={styles.statusRow}>
                <span style={styles.statusLabel}>TLS Requirement</span>
                <span style={styles.statusVal}>TLS 1.2 or higher</span>
              </div>
              <div style={styles.statusRow}>
                <span style={styles.statusLabel}>Sync Interval</span>
                <span style={styles.statusVal}>Real-time (WebSocket)</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={saveLoading}
              style={{
                ...styles.saveBtn,
                ...(saveSuccess ? styles.saveBtnSuccess : {})
              }}
            >
              {saveLoading ? (
                <span>Syncing rules...</span>
              ) : saveSuccess ? (
                <span>Rules Synced Successfully!</span>
              ) : (
                <span>Deploy Engine Rules</span>
              )}
            </button>
            
            <p style={styles.saveNotice}>
              Deploying changes distributes these rules globally across all edge proxy servers.
            </p>
          </div>
        </div>
      </form>
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
  formLayout: {
    display: 'grid',
    gridTemplateColumns: '1.7fr 1fr',
    gap: '1.5rem',
    alignItems: 'start'
  },
  mainSettingsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  sideSettingsCol: {
    position: 'sticky',
    top: '2rem'
  },
  panel: {
    padding: '1.75rem'
  },
  panelTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.02em',
    marginBottom: '0.25rem'
  },
  panelSubtitle: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    marginBottom: '1.5rem'
  },
  sliderLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#fff'
  },
  strictnessSelector: {
    display: 'flex',
    flexDirection: 'column'
  },
  strictGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '0.75rem'
  },
  strictBtn: {
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '1rem 1.25rem',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.25s ease'
  },
  strictBtnActive: {
    background: 'var(--secondary-glow)',
    borderColor: 'var(--secondary)',
    boxShadow: 'var(--glow-shadow)'
  },
  strictBtnTitle: {
    fontSize: '0.95rem',
    fontWeight: '750',
    color: '#fff',
    marginBottom: '0.25rem'
  },
  strictBtnDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4'
  },
  settingDivider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.04)',
    margin: '1.75rem 0'
  },
  helperText: {
    fontSize: '0.75rem',
    color: 'var(--text-dark)',
    marginTop: '0.5rem',
    lineHeight: '1.4'
  },
  togglesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem'
  },
  toggleTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff'
  },
  toggleDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginTop: '0.2rem',
    lineHeight: '1.4',
    maxWidth: '460px'
  },
  statusBox: {
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    margin: '1rem 0 1.5rem 0'
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem'
  },
  statusLabel: {
    color: 'var(--text-muted)'
  },
  statusVal: {
    color: '#fff',
    fontWeight: '600'
  },
  saveBtn: {
    width: '100%',
    padding: '0.85rem',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
    border: 'none',
    color: '#fff',
    fontSize: '0.92rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(6, 182, 212, 0.2)'
  },
  saveBtnSuccess: {
    background: 'var(--success)',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)'
  },
  saveNotice: {
    fontSize: '0.7rem',
    color: 'var(--text-dark)',
    textAlign: 'center',
    marginTop: '0.75rem',
    lineHeight: '1.4'
  },
  presetExplanation: {
    display: 'flex',
    gap: '0.75rem',
    background: 'rgba(6, 182, 212, 0.04)',
    border: '1px solid rgba(6, 182, 212, 0.12)',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
    marginTop: '1rem'
  },
  
  // Custom switch styles
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '46px',
    height: '24px',
    flexShrink: 0
  },
  slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: '24px',
    transition: '.4s',
    border: '1px solid var(--border-color)'
  }
};
// Add CSS overrides for switch states in components.css
