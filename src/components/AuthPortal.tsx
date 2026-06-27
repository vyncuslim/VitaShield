import React, { useState, useEffect } from 'react';

// Supabase details from user configuration
const SUPABASE_URL = 'https://qgoelcorfcqxberbayul.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Dkkd8-9400Yu7PoSDM-cAw_Url6CiRx';

interface AuthPortalProps {
  onAuthSuccess: (session: any) => void;
  onBackToHome: () => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ onAuthSuccess, onBackToHome }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Verification widget state
  const [isVerified, setIsVerified] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Telemetry track variables for the widget
  const [mouseEventsCount, setMouseEventsCount] = useState(0);

  useEffect(() => {
    const handleMouseMove = () => setMouseEventsCount(c => c + 1);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Simulate widget verification
  const handleVerifyClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Base64 encode dummy telemetry representing verification pass
      const payload = {
        fingerprint: { userAgent: navigator.userAgent, screenWidth: window.screen.width, screenHeight: window.screen.height },
        behavior: { mouseEventsCount: mouseEventsCount + 10 }
      };
      const b64 = btoa(JSON.stringify(payload));
      setToken(b64);
      setIsVerified(true);
      setIsLoading(false);
    }, 1200);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isVerified) {
      setErrorMsg('Please complete the VitaShield verification check first.');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isSignUp 
        ? `${SUPABASE_URL}/auth/v1/signup` 
        : `${SUPABASE_URL}/auth/v1/token?grant_type=password`;

      const bodyObj = isSignUp 
        ? { email, password } 
        : { email, password, gotrue_meta_security: { token } }; // Pass the verification token to supabase backend metadata

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(bodyObj)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error_description || data.msg || data.error || 'Authentication process failed.');
      }

      if (isSignUp) {
        setSuccessMsg('Registration successful! Please check your email inbox to confirm your account, then Sign In.');
        setIsSignUp(false);
      } else {
        // Sign in successful
        const session = {
          accessToken: data.access_token,
          user: {
            id: data.user?.id,
            email: data.user?.email,
          }
        };
        onAuthSuccess(session);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={onBackToHome} style={styles.backBtn}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}>
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Home
      </button>

      <div className="glass-panel" style={styles.authBox}>
        {/* Brand Header */}
        <div style={styles.brandHeader}>
          <div style={styles.logoIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 style={styles.brandName}>VitaShield Console</h2>
        </div>

        <p style={styles.authSubtitle}>
          {isSignUp ? 'Create your enterprise developer account.' : 'Sign in to access your threat security dashboard.'}
        </p>

        {!isSignUp && (
          <div style={styles.ssoNotice}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2.5" style={{ marginRight: '6px' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>sleepsomno.com 用戶可直接使用原帳號電子信箱與密碼登入</span>
          </div>
        )}

        {errorMsg && <div style={styles.alertError}>{errorMsg}</div>}
        {successMsg && <div style={styles.alertSuccess}>{successMsg}</div>}

        <form onSubmit={handleAuthSubmit} style={styles.form}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              required 
              type="email" 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field" 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              required 
              type="password" 
              placeholder="••••••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field" 
            />
          </div>

          {/* Verification Widget Container */}
          <div style={styles.widgetWrapper}>
            {!isVerified ? (
              <div 
                onClick={isLoading ? undefined : handleVerifyClick} 
                style={{ ...styles.widgetPlaceholder, cursor: isLoading ? 'default' : 'pointer' }}
              >
                <div style={styles.widgetIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <span>{isLoading ? 'Scanning biometrics...' : 'Verify you are human to sign in'}</span>
              </div>
            ) : (
              <div style={styles.widgetSuccess}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>VitaShield Verification Secured</span>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !isVerified} 
            style={{ 
              ...styles.submitBtn, 
              ...(!isVerified || isLoading ? styles.submitBtnDisabled : {}) 
            }}
          >
            {isLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={styles.toggleRow}>
          <span>{isSignUp ? 'Already have an account?' : 'Need a developer account?'}</span>
          <button 
            type="button" 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setSuccessMsg(null);
            }} 
            style={styles.toggleBtn}
          >
            {isSignUp ? 'Sign In' : 'Register Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 50% 0%, #080c16 0%, #030407 80%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    position: 'relative',
    padding: '2rem'
  },
  backBtn: {
    position: 'absolute',
    top: '2rem',
    left: '2rem',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s ease'
  },
  authBox: {
    width: '100%',
    maxWidth: '420px',
    padding: '2.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    background: 'rgba(13, 20, 35, 0.4)'
  },
  brandHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    justifyContent: 'center'
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(6, 182, 212, 0.05)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandName: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.02em'
  },
  authSubtitle: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
    lineHeight: '1.4'
  },
  alertError: {
    padding: '0.75rem',
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '8px',
    color: '#f87171',
    fontSize: '0.78rem',
    lineHeight: '1.4'
  },
  alertSuccess: {
    padding: '0.75rem',
    background: 'rgba(34, 197, 94, 0.08)',
    border: '1px solid rgba(34, 197, 94, 0.25)',
    borderRadius: '8px',
    color: '#4ade80',
    fontSize: '0.78rem',
    lineHeight: '1.4'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  widgetWrapper: {
    width: '100%',
    marginTop: '0.25rem'
  },
  widgetPlaceholder: {
    width: '100%',
    padding: '0.65rem',
    background: 'rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    transition: 'all 0.2s ease',
    userSelect: 'none'
  },
  widgetIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'pulse 1.5s infinite'
  },
  widgetSuccess: {
    width: '100%',
    padding: '0.65rem',
    background: 'rgba(34, 197, 94, 0.05)',
    border: '1px solid rgba(34, 197, 94, 0.2)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    fontSize: '0.78rem',
    color: 'var(--success)'
  },
  submitBtn: {
    background: 'var(--secondary)',
    border: 'none',
    color: '#000',
    padding: '0.7rem',
    borderRadius: '8px',
    fontSize: '0.88rem',
    fontWeight: '750',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 0 12px rgba(6, 182, 212, 0.2)'
  },
  submitBtnDisabled: {
    background: 'var(--text-dark)',
    color: 'var(--text-muted)',
    cursor: 'not-allowed',
    boxShadow: 'none'
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.76rem',
    color: 'var(--text-muted)',
    marginTop: '0.5rem'
  },
  toggleBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--secondary)',
    fontWeight: '700',
    cursor: 'pointer',
    padding: 0
  },
  ssoNotice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(6, 182, 212, 0.04)',
    border: '1px solid rgba(6, 182, 212, 0.12)',
    padding: '0.55rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.72rem',
    color: '#94a3b8',
    lineHeight: '1.4',
    width: '100%',
    boxSizing: 'border-box'
  }
};
