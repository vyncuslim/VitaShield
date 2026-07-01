import React, { useState } from 'react';
import { useBehaviorTracker } from './VerificationWidget/useBehaviorTracker';

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

  // Progressive challenge triggers
  const { getTelemetryToken, solveChallenge, isMobile } = useBehaviorTracker();
  const [challengeActive, setChallengeActive] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(3);

  const handleSliderDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const handle = e.currentTarget;
    const track = handle.parentElement;
    if (!track) return;

    const maxDrag = track.clientWidth - handle.clientWidth - 6;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startX = clientX - sliderPosition;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      let left = currentX - startX;
      left = Math.max(3, Math.min(left, maxDrag));
      setSliderPosition(left);

      if (left >= maxDrag - 2) {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('touchmove', onMove);
        onSuccess();
      }
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchend', onEnd);

      if (sliderPosition < maxDrag - 2) {
        setSliderPosition(3);
      }
    };

    const onSuccess = () => {
      solveChallenge('slider');
      setChallengeActive(false);
      const token = getTelemetryToken();
      submitAuth(token);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. Gather silent behavioral telemetry
    const token = getTelemetryToken();
    let isSuspicious = false;

    try {
      const decoded = JSON.parse(atob(token));
      const fingerprint = decoded.fingerprint || {};
      const behavior = decoded.behavior || {};

      // Flag bot if WebDriver is active or zero mouse coordinates tracked on desktop (unless challenge already solved)
      if (fingerprint.webdriverActive && !behavior.challengeSolved) {
        isSuspicious = true;
      }
      if ((behavior.mouseEventsCount || 0) === 0 && !isMobile && !behavior.challengeSolved) {
        isSuspicious = true;
      }
      // Speed check: suspicious if form filled and submitted under 400ms
      if ((behavior.durationMs || 0) < 400 && !behavior.challengeSolved) {
        isSuspicious = true;
      }
    } catch (err) {
      isSuspicious = true;
    }

    if (isSuspicious) {
      setErrorMsg('VitaShield: Suspicious automation trajectory detected. Please drag the slider to unlock.');
      setChallengeActive(true);
      return;
    }

    // 2. Submit clean request
    submitAuth(token);
  };

  const submitAuth = async (verifiedToken: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const endpoint = isSignUp 
        ? `${SUPABASE_URL}/auth/v1/signup` 
        : `${SUPABASE_URL}/auth/v1/token?grant_type=password`;

      const bodyObj = isSignUp 
        ? { email, password } 
        : { email, password, gotrue_meta_security: { token: verifiedToken } };

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
        setSuccessMsg('Registration successful! Please check your email to activate, then sign in.');
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
          <div style={{ ...styles.logoIcon, background: 'transparent', border: 'none' }}>
            <img src="/logo.jpg" alt="VitaShield Logo" style={{ width: '100%', height: '100%', borderRadius: '4px', objectFit: 'cover' }} />
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
            <span>sleepsomno.com users can log in directly using their existing credentials.</span>
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

          {/* Conditional Sliding Challenge when suspicious traffic triggers */}
          {challengeActive && (
            <div style={{ margin: '12px 0', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '100%',
                height: '38px',
                background: 'rgba(13, 20, 35, 0.75)',
                border: '1px solid #00f2fe5a',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
                boxShadow: '0 0 12px rgba(0, 242, 254, 0.2)'
              }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', pointerEvents: 'none', zIndex: 1 }}>
                  🛡️ Slide to Verify Humanity
                </span>
                <div 
                  onMouseDown={handleSliderDrag}
                  onTouchStart={handleSliderDrag}
                  style={{
                    width: '32px',
                    height: '32px',
                    background: '#00f2fe',
                    borderRadius: '50%',
                    position: 'absolute',
                    left: `${sliderPosition}px`,
                    top: '3px',
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 8px #00f2fe',
                    zIndex: 2
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#080b10" strokeWidth="3">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading || challengeActive} 
            style={{ 
              ...styles.submitBtn, 
              ...(isLoading || challengeActive ? styles.submitBtnDisabled : {}) 
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
              setChallengeActive(false);
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
