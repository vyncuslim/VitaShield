(function () {
  function initVitaShield() {
    const startTime = Date.now();
    const container = document.getElementById('vitashield-widget') || document.querySelector('[data-sitekey]');
    if (!container) return;

    if (container.getAttribute('data-vms-initialized') === 'true') return;
    container.setAttribute('data-vms-initialized', 'true');

    const parentForm = container.closest('form');

    // 1. Render the initial Premium Silent Shield Badge
    const renderDefaultBadge = () => {
      container.innerHTML = `
        <div id="vms-badge-box" style="
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(13, 20, 35, 0.55);
          border: 1px solid rgba(6, 182, 212, 0.15);
          border-radius: 8px;
          color: #94a3b8;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 11px;
          font-weight: 600;
          backdrop-filter: blur(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        ">
          <span style="
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #00f2fe;
            box-shadow: 0 0 8px #00f2fe;
            display: inline-block;
          "></span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" stroke-width="2.5" style="margin-top: -1px;">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Protected by <strong style="color: #fff; font-weight: 700;">VitaShield</strong></span>
        </div>
      `;
    };

    renderDefaultBadge();

    // 2. Behavioral Kinetics Capture Variables (Risk Engine v2)
    let mousePoints = [];
    let keyTimings = [];
    let lastKeyTime = 0;

    const getWebGLRenderer = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return '';
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) return '';
        return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
      } catch (e) {
        return '';
      }
    };

    let telemetry = {
      fingerprint: {
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width || 0,
        screenHeight: window.screen.height || 0,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
        language: navigator.language || '',
        webdriverActive: navigator.webdriver || false,
        pluginsCount: navigator.plugins ? navigator.plugins.length : 0,
        webglRenderer: getWebGLRenderer(),
        outerDimensionsZeroed: (window.outerWidth === 0 && window.outerHeight === 0),
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      },
      behavior: {
        mouseEventsCount: 0,
        keyPressesCount: 0,
        scrollsCount: 0,
        mousePoints: [],
        keyTimings: [],
        challengeSolved: false,
        challengeMethod: 'none',
        durationMs: 0
      }
    };

    // 3. Track events silently
    window.addEventListener('mousemove', (e) => {
      telemetry.behavior.mouseEventsCount++;
      if (mousePoints.length < 30) {
        mousePoints.push({ x: e.clientX, y: e.clientY, t: Date.now() });
      }
    }, { passive: true });

    window.addEventListener('keydown', () => {
      telemetry.behavior.keyPressesCount++;
      const now = Date.now();
      if (lastKeyTime > 0 && keyTimings.length < 15) {
        keyTimings.push(now - lastKeyTime);
      }
      lastKeyTime = now;
    }, { passive: true });

    window.addEventListener('scroll', () => {
      telemetry.behavior.scrollsCount++;
    }, { passive: true });

    // 4. Client-side Slider Challenge mitigation UI
    const triggerSliderChallenge = (onComplete) => {
      container.innerHTML = `
        <div id="vms-challenge-container" style="
          width: 250px;
          height: 38px;
          background: rgba(13, 20, 35, 0.85);
          border: 1px solid rgba(6, 182, 212, 0.35);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          box-shadow: 0 0 12px rgba(6, 182, 212, 0.15);
        ">
          <span style="font-size: 11px; color: #a5f3fc; font-weight: 700; pointer-events: none; z-index: 1;">🛡️ Slide to Verify Humanity</span>
          <div id="vms-slider-handle" style="
            width: 32px;
            height: 32px;
            background: #00f2fe;
            border-radius: 50%;
            position: absolute;
            left: 3px;
            top: 2px;
            cursor: grab;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 8px #00f2fe;
            z-index: 2;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#080b10" stroke-width="3">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      `;

      const handle = document.getElementById('vms-slider-handle');
      const track = document.getElementById('vms-challenge-container');
      if (!handle || !track) return;

      let isDragging = false;
      let startX = 0;
      let maxDrag = track.clientWidth - handle.clientWidth - 6;

      const onStart = (e) => {
        isDragging = true;
        startX = (e.touches ? e.touches[0].clientX : e.clientX) - handle.offsetLeft;
        handle.style.cursor = 'grabbing';
      };

      const onMove = (e) => {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let left = clientX - startX;
        left = Math.max(3, Math.min(left, maxDrag));
        handle.style.left = `${left}px`;

        if (left >= maxDrag - 2) {
          isDragging = false;
          onSuccess();
        }
      };

      const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        handle.style.cursor = 'grab';
        if (parseInt(handle.style.left) < maxDrag - 2) {
          handle.style.left = '3px';
        }
      };

      const onSuccess = () => {
        telemetry.behavior.challengeSolved = true;
        telemetry.behavior.challengeMethod = 'slider';
        
        container.innerHTML = `
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: rgba(16, 185, 129, 0.15);
            border: 1px solid rgba(16, 185, 129, 0.4);
            border-radius: 8px;
            color: #34d399;
            font-family: sans-serif;
            font-size: 11px;
            font-weight: 700;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.1);
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>✅ Verification Complete</span>
          </div>
        `;
        
        if (onComplete) onComplete();
      };

      handle.addEventListener('mousedown', onStart);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);

      handle.addEventListener('touchstart', onStart, { passive: true });
      window.addEventListener('touchmove', onMove, { passive: true });
      window.addEventListener('touchend', onEnd);
    };

    // 5. Intercept form submission to inspect risk scoring
    if (parentForm) {
      parentForm.addEventListener('submit', function (e) {
        telemetry.behavior.mousePoints = mousePoints;
        telemetry.behavior.keyTimings = keyTimings;

        const isSuspicious = telemetry.behavior.mouseEventsCount === 0 && !telemetry.behavior.challengeSolved && !telemetry.fingerprint.isMobile;

        if (isSuspicious) {
          e.preventDefault();
          e.stopPropagation();
          triggerSliderChallenge(() => {
            setTimeout(() => {
              parentForm.submit();
            }, 800);
          });
          return false;
        }

        telemetry.behavior.durationMs = Date.now() - startTime;

        const jsonString = JSON.stringify(telemetry);
        const b64Token = btoa(unescape(encodeURIComponent(jsonString)));

        const oldInput = parentForm.querySelector('input[name="vms-shield-token"]');
        if (oldInput) oldInput.remove();

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'vms-shield-token';
        hiddenInput.value = b64Token;
        parentForm.appendChild(hiddenInput);

        const verifiedEvent = new CustomEvent('vms-verified', {
          detail: { token: b64Token }
        });
        container.dispatchEvent(verifiedEvent);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVitaShield);
  } else {
    initVitaShield();
  }
})();
