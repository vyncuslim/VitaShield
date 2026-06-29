import React, { useState } from 'react';
import { useBehaviorTracker } from './useBehaviorTracker';

interface VerificationWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  themePrimary?: string;
  themeBg?: string;
  themeText?: string;
}

export const VerificationWidget: React.FC<VerificationWidgetProps> = ({
  siteKey,
  onVerify,
  themePrimary = '#00f2fe',
  themeBg = 'rgba(13, 20, 35, 0.55)',
  themeText = '#94a3b8'
}) => {
  const { getTelemetryToken, solveChallenge, mouseEventsCount, isMobile } = useBehaviorTracker();
  const [challengeActive, setChallengeActive] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(3);

  const handleSubmitIntercept = () => {
    if (verified) return;

    // Check if kinetics look suspicious (no mouse movement and not on mobile)
    const isSuspicious = mouseEventsCount === 0 && !isMobile;

    if (isSuspicious) {
      setChallengeActive(true);
      return;
    }

    const token = getTelemetryToken();
    setVerified(true);
    onVerify(token);
  };

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
      setVerified(true);
      setChallengeActive(false);
      const token = getTelemetryToken();
      onVerify(token);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  };

  return (
    <div style={{ display: 'inline-block', margin: '0.5rem 0' }}>
      {/* Hidden input to mimic form integration */}
      <input type="hidden" name="vms-shield-token" value={verified ? getTelemetryToken() : ''} />

      {!challengeActive ? (
        <div 
          onClick={handleSubmitIntercept}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: verified ? 'rgba(16, 185, 129, 0.12)' : themeBg,
            border: verified ? '1px solid rgba(16, 185, 129, 0.35)' : `1px solid ${themePrimary}3d`,
            borderRadius: '8px',
            color: verified ? '#34d399' : themeText,
            fontFamily: 'sans-serif',
            fontSize: '11px',
            fontWeight: '600',
            cursor: verified ? 'default' : 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
            userSelect: 'none'
          }}
          data-sitekey={siteKey}
        >
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: verified ? '#10b981' : themePrimary,
            boxShadow: verified ? '0 0 8px #10b981' : `0 0 8px ${themePrimary}`
          }} />
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={verified ? '#34d399' : themePrimary} strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>
            {verified ? (
              <span>Verification Passed</span>
            ) : (
              <span>Protected by <strong style={{ color: '#fff' }}>VitaShield</strong></span>
            )}
          </span>
        </div>
      ) : (
        <div style={{
          width: '250px',
          height: '38px',
          background: themeBg,
          border: `1px solid ${themePrimary}5a`,
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          boxShadow: `0 0 12px ${themePrimary}33`,
          fontFamily: 'sans-serif'
        }}>
          <span style={{ fontSize: '11px', color: themeText, fontWeight: '700', pointerEvents: 'none', zIndex: 1 }}>
            🛡️ Slide to Verify Humanity
          </span>
          <div 
            onMouseDown={handleSliderDrag}
            onTouchStart={handleSliderDrag}
            style={{
              width: '32px',
              height: '32px',
              background: themePrimary,
              borderRadius: '50%',
              position: 'absolute',
              left: `${sliderPosition}px`,
              top: '3px',
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 8px ${themePrimary}`,
              zIndex: 2
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#080b10" strokeWidth="3">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
