(function () {
  function initVitaShield() {
    const startTime = Date.now();
    const container = document.getElementById('vitashield-widget') || document.querySelector('[data-sitekey]');
    if (!container) return;

    if (container.getAttribute('data-vms-initialized') === 'true') return;
    container.setAttribute('data-vms-initialized', 'true');

    const parentForm = container.closest('form');

    // Extract custom styling data attributes
    const themePrimary = container.getAttribute('data-theme-primary') || '#00f2fe';
    const themeBg = container.getAttribute('data-theme-bg') || 'rgba(13, 20, 35, 0.55)';
    const themeText = container.getAttribute('data-theme-text') || '#94a3b8';

    // 1. Render the initial Premium Silent Shield Badge
    const renderDefaultBadge = () => {
      container.innerHTML = `
        <div id="vms-badge-box" style="
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: ${themeBg};
          border: 1px solid ${themePrimary}3d;
          border-radius: 8px;
          color: ${themeText};
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
            background: ${themePrimary};
            box-shadow: 0 0 8px ${themePrimary};
            display: inline-block;
          "></span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${themePrimary}" stroke-width="2.5" style="margin-top: -1px;">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Protected by <strong style="color: #fff; font-weight: 700;">VitaShield</strong></span>
        </div>
      `;
    };

    renderDefaultBadge();

    let mousePoints = [];
    let keyTimings = [];
    let lastKeyTime = 0;
    let lastMouseMoveTime = 0;
    let permissionQueryMismatch = false;
    let clickCount = 0;
    let clickAnomalies = 0;
    let lastMouseDownTime = 0;
    let focusChanges = 0;
    let tabSwitches = 0;
    let scrollTimings = [];
    let lastScrollTime = 0;

    // Check permissions API asynchronously
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'notifications' })
        .then((permissionStatus) => {
          if (typeof Notification !== 'undefined' && Notification.permission === 'denied' && permissionStatus.state === 'prompt') {
            permissionQueryMismatch = true;
          }
        })
        .catch(() => {});
    }

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
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        chromeRuntimeMissing: /chrome/i.test(navigator.userAgent) && (!window.chrome || !window.chrome.runtime),
        pluginsArrayEmpty: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (!navigator.plugins || navigator.plugins.length === 0),
        languagesEmpty: !navigator.languages || navigator.languages.length === 0,
        permissionQueryMismatch: permissionQueryMismatch,
        webdriverSpoofed: (() => {
          try {
            const desc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'webdriver');
            if (desc && desc.get && desc.get.toString().indexOf('[native code]') === -1) return true;
            if (Object.prototype.hasOwnProperty.call(navigator, 'webdriver')) return true;
            return false;
          } catch(e) { return false; }
        })()
      },
      behavior: {
        mouseEventsCount: 0,
        keyPressesCount: 0,
        scrollsCount: 0,
        mousePoints: [],
        keyTimings: [],
        challengeSolved: false,
        challengeMethod: 'none',
        durationMs: 0,
        backspaceCount: 0,
        lastPasteTime: 0,
        submitPauseMs: 0,
        clickCount: 0,
        clickAnomalies: 0,
        focusChanges: 0,
        tabSwitches: 0,
        scrollTimings: []
      }
    };

    // 3. Track events silently
    window.addEventListener('mousemove', (e) => {
      lastMouseMoveTime = Date.now();
      telemetry.behavior.mouseEventsCount++;
      if (mousePoints.length < 30) {
        mousePoints.push({ x: e.clientX, y: e.clientY, t: lastMouseMoveTime });
      }
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      telemetry.behavior.keyPressesCount++;
      if (e.key === 'Backspace' || e.key === 'Delete') {
        telemetry.behavior.backspaceCount++;
      }
      const now = Date.now();
      if (lastKeyTime > 0 && keyTimings.length < 15) {
        keyTimings.push(now - lastKeyTime);
      }
      lastKeyTime = now;
    }, { passive: true });

    window.addEventListener('paste', () => {
      telemetry.behavior.lastPasteTime = Date.now();
    }, { passive: true });

    window.addEventListener('scroll', () => {
      telemetry.behavior.scrollsCount++;
      const now = Date.now();
      if (lastScrollTime > 0 && scrollTimings.length < 15) {
        scrollTimings.push(now - lastScrollTime);
      }
      lastScrollTime = now;
    }, { passive: true });

    window.addEventListener('mousedown', () => {
      lastMouseDownTime = Date.now();
    }, { passive: true });

    window.addEventListener('mouseup', (e) => {
      clickCount++;
      if (lastMouseDownTime > 0) {
        const clickDuration = Date.now() - lastMouseDownTime;
        if (clickDuration < 5 || clickDuration % 10 === 0) {
          clickAnomalies++;
        }
      }
      if (e.target && e.target.getBoundingClientRect) {
        const rect = e.target.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        if (Math.abs(relX - centerX) < 0.1 && Math.abs(relY - centerY) < 0.1) {
          clickAnomalies++;
        }
      }
    }, { passive: true });

    window.addEventListener('focus', () => {
      focusChanges++;
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        tabSwitches++;
      }
    }, { passive: true });

    // 4. Client-side Slider Challenge mitigation UI
    const triggerSliderChallenge = (onComplete) => {
      container.innerHTML = `
        <div id="vms-challenge-container" style="
          width: 250px;
          height: 38px;
          background: ${themeBg};
          border: 1px solid ${themePrimary}5a;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          box-shadow: 0 0 12px ${themePrimary}33;
        ">
          <span style="font-size: 11px; color: ${themeText}; font-weight: 700; pointer-events: none; z-index: 1;">🛡️ Slide to Verify Humanity</span>
          <div id="vms-slider-handle" style="
            width: 32px;
            height: 32px;
            background: ${themePrimary};
            border-radius: 50%;
            position: absolute;
            left: 3px;
            top: 2px;
            cursor: grab;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 8px ${themePrimary};
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
        telemetry.behavior.clickCount = clickCount;
        telemetry.behavior.clickAnomalies = clickAnomalies;
        telemetry.behavior.focusChanges = focusChanges;
        telemetry.behavior.tabSwitches = tabSwitches;
        telemetry.behavior.scrollTimings = scrollTimings;

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

        const now = Date.now();
        telemetry.behavior.durationMs = now - startTime;
        if (lastMouseMoveTime > 0) {
          telemetry.behavior.submitPauseMs = now - lastMouseMoveTime;
        }
        if (telemetry.behavior.lastPasteTime > 0) {
          telemetry.behavior.lastPasteTime = now - telemetry.behavior.lastPasteTime;
        }

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
