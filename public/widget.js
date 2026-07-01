(function () {
  // ─── VitaShield Widget v2.1 ─────────────────────────────────────────────────
  // Improvements: mobile sensor telemetry, touch biometrics, canvas fingerprint,
  // entropy scoring, debug mode, VitaShieldReady callback, hardware fingerprint
  // ────────────────────────────────────────────────────────────────────────────

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
    const debugMode = container.getAttribute('data-debug') === 'true';

    const log = debugMode ? (...args) => console.log('[VitaShield]', ...args) : () => {};

    // 1. Render the initial Premium Silent Shield Badge
    const renderDefaultBadge = () => {
      container.innerHTML = `
        <div id="vms-badge-box" style="
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          background: ${themeBg};
          border: 1px solid ${themePrimary}4a;
          border-radius: 8px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 0 0 14px ${themePrimary}1a;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          user-select: none;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${themePrimary}" stroke-width="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span style="font-size: 11px; color: ${themeText}; font-weight: 600; letter-spacing: 0.02em;">Protected by VitaShield</span>
          <svg id="vms-spinner" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="${themePrimary}" stroke-width="3" style="animation: vms-spin 1.2s linear infinite; opacity:0.7;">
            <path d="M12 2a10 10 0 0 1 10 10"/>
          </svg>
        </div>
        <style>
          @keyframes vms-spin { to { transform: rotate(360deg); } }
        </style>
      `;
    };

    renderDefaultBadge();

    // 2. Telemetry state variables
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

    // === Mobile sensor state ===
    let touchEvents = [];
    let touchEventsCount = 0;
    let motionSamples = [];
    let orientationSamples = [];
    let sensorAvailable = false;
    let sensorIsStatic = false;

    // Check permissions API asynchronously
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'notifications' })
        .then((permissionStatus) => {
          if (typeof Notification !== 'undefined' && Notification.permission === 'denied' && permissionStatus.state === 'prompt') {
            permissionQueryMismatch = true;
            log('Permission mismatch detected');
          }
        })
        .catch(() => {});
    }

    const getWebGLRenderer = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return '';
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        if (!ext) return '';
        return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '';
      } catch (e) { return ''; }
    };

    const getCanvasFingerprint = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 200; canvas.height = 50;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';
        ctx.textBaseline = 'top';
        ctx.font = "14px Arial";
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('VitaShield\u{1F6E1}', 2, 15);
        ctx.fillStyle = 'rgba(102,204,0,0.7)';
        ctx.fillText('VitaShield\u{1F6E1}', 4, 17);
        const raw = canvas.toDataURL();
        let hash = 0;
        for (let i = 0; i < raw.length; i++) {
          hash = ((hash << 5) - hash) + raw.charCodeAt(i);
          hash |= 0;
        }
        return hash.toString(16);
      } catch (e) { return ''; }
    };

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // 3. Build initial telemetry fingerprint
    const telemetry = {
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
        isMobile,
        isTablet: /iPad|Android/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent),
        touchSupport: navigator.maxTouchPoints > 0,
        maxTouchPoints: navigator.maxTouchPoints || 0,
        chromeRuntimeMissing: /chrome/i.test(navigator.userAgent) && (!window.chrome || !window.chrome.runtime),
        pluginsArrayEmpty: !isMobile && (!navigator.plugins || navigator.plugins.length === 0),
        languagesEmpty: !navigator.languages || navigator.languages.length === 0,
        permissionQueryMismatch: false, // updated async
        webdriverSpoofed: (() => {
          try {
            const desc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'webdriver');
            if (desc && desc.get && desc.get.toString().indexOf('[native code]') === -1) return true;
            if (Object.prototype.hasOwnProperty.call(navigator, 'webdriver')) return true;
            return false;
          } catch(e) { return false; }
        })(),
        canvasFingerprint: getCanvasFingerprint(),
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        deviceMemory: navigator.deviceMemory || 0,
        colorDepth: window.screen.colorDepth || 0,
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
        scrollTimings: [],
        touchEvents: [],
        touchEventsCount: 0,
        motionSamples: [],
        orientationSamples: [],
        sensorAvailable: false,
        sensorIsStatic: false,
        mouseEntropyScore: 0,
        keystrokeEntropyScore: 0,
      }
    };

    // Entropy helper
    const computeEntropy = (values) => {
      if (values.length < 4) return 0;
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
      return Math.round(Math.sqrt(variance) * 100) / 100;
    };

    // 4. Track events silently
    window.addEventListener('mousemove', (e) => {
      lastMouseMoveTime = Date.now();
      telemetry.behavior.mouseEventsCount++;
      if (mousePoints.length < 50) {
        mousePoints.push({ x: e.clientX, y: e.clientY, t: lastMouseMoveTime });
      }
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      telemetry.behavior.keyPressesCount++;
      if (e.key === 'Backspace' || e.key === 'Delete') {
        telemetry.behavior.backspaceCount++;
      }
      const now = Date.now();
      if (lastKeyTime > 0 && keyTimings.length < 20) {
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

    // === Mobile Touch Biometrics ===
    const captureTouchPoint = (e) => {
      const touch = e.changedTouches && e.changedTouches[0];
      if (touch && touchEvents.length < 40) {
        touchEventsCount++;
        touchEvents.push({
          x: touch.clientX,
          y: touch.clientY,
          t: Date.now(),
          pressure: touch.force || touch.pressure || 0,
          radiusX: touch.radiusX || 0,
          radiusY: touch.radiusY || 0,
        });
      }
    };

    window.addEventListener('touchstart', captureTouchPoint, { passive: true });
    window.addEventListener('touchmove', captureTouchPoint, { passive: true });

    // === Device Motion (Accelerometer) ===
    window.addEventListener('devicemotion', (e) => {
      sensorAvailable = true;
      const acc = e.accelerationIncludingGravity;
      if (acc && motionSamples.length < 20) {
        motionSamples.push({ ax: acc.x || 0, ay: acc.y || 0, az: acc.z || 0, t: Date.now() });
      }
    }, { passive: true });

    // === Device Orientation (Gyroscope) ===
    window.addEventListener('deviceorientation', (e) => {
      if (orientationSamples.length < 15) {
        orientationSamples.push({
          alpha: e.alpha || 0,
          beta: e.beta || 0,
          gamma: e.gamma || 0,
          t: Date.now()
        });
      }
    }, { passive: true });

    // Check if mobile sensor is suspiciously absent → emulated device
    setTimeout(() => {
      if (isMobile && !sensorAvailable && navigator.maxTouchPoints > 0) {
        sensorIsStatic = true;
        log('Sensor static detected: mobile UA but no motion events');
      }
    }, 3000);

    // 5. Client-side Slider Challenge mitigation UI
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

    // 6. Intercept form submission to package full telemetry
    if (parentForm) {
      parentForm.addEventListener('submit', function (e) {
        // Flush accumulated data into telemetry
        telemetry.fingerprint.permissionQueryMismatch = permissionQueryMismatch;
        telemetry.behavior.mousePoints = mousePoints;
        telemetry.behavior.keyTimings = keyTimings;
        telemetry.behavior.clickCount = clickCount;
        telemetry.behavior.clickAnomalies = clickAnomalies;
        telemetry.behavior.focusChanges = focusChanges;
        telemetry.behavior.tabSwitches = tabSwitches;
        telemetry.behavior.scrollTimings = scrollTimings;
        telemetry.behavior.touchEvents = touchEvents;
        telemetry.behavior.touchEventsCount = touchEventsCount;
        telemetry.behavior.motionSamples = motionSamples;
        telemetry.behavior.orientationSamples = orientationSamples;
        telemetry.behavior.sensorAvailable = sensorAvailable;
        telemetry.behavior.sensorIsStatic = sensorIsStatic;

        // Compute entropy scores
        const mouseDeltas = mousePoints.length > 1
          ? mousePoints.slice(1).map((p, i) => Math.sqrt(
              Math.pow(p.x - mousePoints[i].x, 2) + Math.pow(p.y - mousePoints[i].y, 2)
            ))
          : [];
        telemetry.behavior.mouseEntropyScore = computeEntropy(mouseDeltas);
        telemetry.behavior.keystrokeEntropyScore = computeEntropy(keyTimings);

        const isSuspicious = telemetry.behavior.mouseEventsCount === 0
          && !telemetry.behavior.challengeSolved
          && !telemetry.fingerprint.isMobile
          && telemetry.behavior.touchEventsCount === 0;

        if (isSuspicious) {
          e.preventDefault();
          e.stopPropagation();
          triggerSliderChallenge(() => {
            setTimeout(() => { parentForm.submit(); }, 800);
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

        if (debugMode) {
          log('Token generated, payload size:', jsonString.length, 'bytes');
          log('Mouse entropy:', telemetry.behavior.mouseEntropyScore);
          log('Keystroke entropy:', telemetry.behavior.keystrokeEntropyScore);
          log('Touch events collected:', touchEventsCount);
          log('Sensor available:', sensorAvailable, '| static:', sensorIsStatic);
        }

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

    log('VitaShield initialized. Mobile:', isMobile, '| Debug mode:', debugMode);

    // 7. Fire VitaShieldReady global callback
    if (typeof window.onVitaShieldReady === 'function') {
      window.onVitaShieldReady({ version: '2.1', isMobile });
    }
    window.dispatchEvent(new CustomEvent('vitashield:ready', { detail: { version: '2.1', isMobile } }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVitaShield);
  } else {
    initVitaShield();
  }
})();
