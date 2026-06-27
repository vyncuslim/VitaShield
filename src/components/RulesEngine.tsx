import React, { useState } from 'react';

interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string;
  action: 'allow' | 'challenge' | 'block';
  enabled: boolean;
  desc: string;
}

export const RulesEngine: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([
    {
      id: 'rule-1',
      field: 'IP VPN / Proxy',
      operator: '==',
      value: 'true',
      action: 'challenge',
      enabled: true,
      desc: 'If request originates from a known VPN or proxy pool, force challenge verification.'
    },
    {
      id: 'rule-2',
      field: 'User Agent',
      operator: 'contains',
      value: 'OpenAI-Operator',
      action: 'block',
      enabled: true,
      desc: 'If request is initiated by the OpenAI Operator AI Agent, block access instantly.'
    },
    {
      id: 'rule-3',
      field: 'Risk Score',
      operator: '>',
      value: '75',
      action: 'block',
      enabled: true,
      desc: 'If session evaluation exceeds 75/100 danger threshold, drop connection.'
    },
    {
      id: 'rule-4',
      field: 'Country Code',
      operator: '==',
      value: 'KP',
      action: 'block',
      enabled: false,
      desc: 'If origin country is North Korea (KP), apply strict block gate.'
    }
  ]);

  const [newField, setNewField] = useState('Risk Score');
  const [newOperator, setNewOperator] = useState('>');
  const [newValue, setNewValue] = useState('');
  const [newAction, setNewAction] = useState<'allow' | 'challenge' | 'block'>('challenge');

  const addRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      field: newField,
      operator: newOperator,
      value: newValue,
      action: newAction,
      enabled: true,
      desc: `If ${newField} ${newOperator} "${newValue}", then execute: ${newAction.toUpperCase()}.`
    };

    setRules([...rules, newRule]);
    setNewValue('');
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title} className="gradient-text">Custom Rules Engine</h1>
          <p style={styles.subtitle}>Define logic gates to dynamically bypass, challenge, or drop client sessions.</p>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Left Col: Add Rule */}
        <div className="glass-panel" style={styles.formPanel}>
          <h3 style={styles.panelTitle}>Create Custom Rule</h3>
          <p style={styles.panelSubtitle}>Add conditional rules to route incoming traffic matching threat criteria.</p>

          <form onSubmit={addRule} style={styles.form}>
            <div className="input-group">
              <label className="input-label">Parameter Field</label>
              <select value={newField} onChange={e=>setNewField(e.target.value)} style={styles.selector}>
                <option value="Risk Score">Risk Score (0-100)</option>
                <option value="User Agent">User Agent Header</option>
                <option value="Country Code">Country Code (ISO)</option>
                <option value="IP VPN / Proxy">VPN or Proxy Flag</option>
                <option value="Device OS">Device Operating System</option>
                <option value="AI Agent Likelihood">AI Agent Score</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Comparison Operator</label>
              <select value={newOperator} onChange={e=>setNewOperator(e.target.value)} style={styles.selector}>
                <option value="==">equals (==)</option>
                <option value="!=">does not equal (!=)</option>
                <option value=">">greater than (&gt;)</option>
                <option value="<">less than (&lt;)</option>
                <option value="contains">contains substring</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Target Comparison Value</label>
              <input 
                required 
                type="text" 
                placeholder="e.g. 70, OpenAI-Operator, CN" 
                value={newValue} 
                onChange={e=>setNewValue(e.target.value)} 
                className="input-field" 
              />
            </div>

            <div className="input-group">
              <label className="input-label">Gateway Action Verdict</label>
              <div style={styles.radioRow}>
                {(['allow', 'challenge', 'block'] as const).map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => setNewAction(action)}
                    style={{
                      ...styles.actionBtn,
                      ...(newAction === action ? styles.actionBtnActive[action] : {})
                    }}
                  >
                    {action.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="settings-btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Add Active Rule
            </button>
          </form>
        </div>

        {/* Right Col: Rules List */}
        <div className="glass-panel" style={styles.listPanel}>
          <div style={styles.listHeader}>
            <h3 style={styles.panelTitle}>Active Security Policies</h3>
            <span style={styles.rulesCount}>{rules.length} Policies Listed</span>
          </div>

          <div style={styles.rulesList}>
            {rules.map((rule) => (
              <div 
                key={rule.id} 
                style={{ 
                  ...styles.ruleCard, 
                  borderColor: rule.enabled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                  opacity: rule.enabled ? 1 : 0.6
                }}
              >
                <div style={styles.ruleTop}>
                  <div style={styles.ruleDetails}>
                    <span style={styles.ruleExpression}>
                      IF <strong style={{ color: 'var(--secondary)' }}>{rule.field}</strong> {rule.operator} <strong>"{rule.value}"</strong>
                    </span>
                    <span 
                      style={{ 
                        ...styles.actionBadge, 
                        ...styles.actionBadgeStyle[rule.action]
                      }}
                    >
                      {rule.action.toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={styles.ruleControls}>
                    <button 
                      onClick={() => toggleRule(rule.id)}
                      style={{
                        ...styles.toggleBtn,
                        background: rule.enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        color: rule.enabled ? 'var(--success)' : 'var(--text-muted)'
                      }}
                    >
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </button>
                    <button onClick={() => deleteRule(rule.id)} style={styles.deleteBtn}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p style={styles.ruleDesc}>{rule.desc}</p>
              </div>
            ))}
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
  layout: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1.8fr',
    gap: '1.5rem',
    alignItems: 'start'
  },
  formPanel: {
    padding: '1.75rem'
  },
  listPanel: {
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
  selector: {
    width: '100%',
    padding: '0.65rem 0.85rem',
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.88rem',
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  radioRow: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.25rem'
  },
  actionBtn: {
    flex: 1,
    padding: '0.55rem 0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-muted)',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  actionBtnActive: {
    allow: {
      background: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'var(--success)',
      color: 'var(--success)'
    },
    challenge: {
      background: 'rgba(6, 182, 212, 0.1)',
      borderColor: 'var(--secondary)',
      color: 'var(--secondary)'
    },
    block: {
      background: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'var(--danger)',
      color: 'var(--danger)'
    }
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem'
  },
  rulesCount: {
    fontSize: '0.8rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--secondary)'
  },
  rulesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  ruleCard: {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
    transition: 'all 0.2s ease'
  },
  ruleTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  ruleDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  ruleExpression: {
    fontSize: '0.88rem',
    color: '#e2e8f0'
  },
  actionBadge: {
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px'
  },
  actionBadgeStyle: {
    allow: {
      background: 'rgba(16, 185, 129, 0.1)',
      color: 'var(--success)'
    },
    challenge: {
      background: 'rgba(6, 182, 212, 0.1)',
      color: 'var(--secondary)'
    },
    block: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: 'var(--danger)'
    }
  },
  ruleControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
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
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-dark)',
    cursor: 'pointer',
    padding: '0.3rem',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '6px',
    transition: 'all 0.2s ease'
  },
  ruleDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4'
  }
};
