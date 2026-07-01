import { useEffect, useRef } from 'react';
import type { TelemetryPayload, TouchPoint, MotionSample, OrientationSample } from './types';

const SDK_VERSION = '2.2';

export const useBehaviorTracker = () => {
  const startTime = useRef<number>(Date.now());
  const mouseEventsCount  = useRef<number>(0);
  const keyPressesCount   = useRef<number>(0);
  const scrollsCount      = useRef<number>(0);
  const mousePoints       = useRef<Array<{x:number;y:number;t:number}>>([]);
  const keyTimings        = useRef<number[]>([]);
  const lastKeyTime       = useRef<number>(0);
  const challengeSolved   = useRef<boolean>(false);
  const challengeMethod   = useRef<string>('none');
  const backspaceCount    = useRef<number>(0);
  const lastPasteTime     = useRef<number>(0);
  const lastMouseMoveTime = useRef<number>(0);
  const permissionQueryMismatch = useRef<boolean>(false);
  const clickCount        = useRef<number>(0);
  const clickAnomalies    = useRef<number>(0);
  const lastMouseDownTime = useRef<number>(0);
  const focusChanges      = useRef<number>(0);
  const tabSwitches       = useRef<number>(0);
  const scrollTimings     = useRef<number[]>([]);
  const lastScrollTime    = useRef<number>(0);

  // Mobile sensor refs
  const touchEvents       = useRef<TouchPoint[]>([]);
  const touchEventsCount  = useRef<number>(0);
  const motionSamples     = useRef<MotionSample[]>([]);
  const orientationSamples = useRef<OrientationSample[]>([]);
  const sensorAvailable   = useRef<boolean>(false);
  const sensorIsStatic    = useRef<boolean>(false);

  useEffect(() => {
    // Permissions API mismatch check
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'notifications' as any })
        .then((ps) => {
          if (typeof Notification !== 'undefined' && Notification.permission === 'denied' && ps.state === 'prompt') {
            permissionQueryMismatch.current = true;
          }
        }).catch(() => {});
    }

    // Mouse
    const onMouseMove = (e: MouseEvent) => {
      lastMouseMoveTime.current = Date.now();
      mouseEventsCount.current++;
      if (mousePoints.current.length < 50) {
        mousePoints.current.push({ x: e.clientX, y: e.clientY, t: lastMouseMoveTime.current });
      }
    };

    // Keyboard
    const onKeyDown = (e: KeyboardEvent) => {
      keyPressesCount.current++;
      if (e.key === 'Backspace' || e.key === 'Delete') backspaceCount.current++;
      const now = Date.now();
      if (lastKeyTime.current > 0 && keyTimings.current.length < 20) {
        keyTimings.current.push(now - lastKeyTime.current);
      }
      lastKeyTime.current = now;
    };

    const onPaste = () => { lastPasteTime.current = Date.now(); };

    // Scroll
    const onScroll = () => {
      scrollsCount.current++;
      const now = Date.now();
      if (lastScrollTime.current > 0 && scrollTimings.current.length < 15) {
        scrollTimings.current.push(now - lastScrollTime.current);
      }
      lastScrollTime.current = now;
    };

    // Click analysis
    const onMouseDown = () => { lastMouseDownTime.current = Date.now(); };
    const onMouseUp = (e: MouseEvent) => {
      clickCount.current++;
      if (lastMouseDownTime.current > 0) {
        const dur = Date.now() - lastMouseDownTime.current;
        if (dur < 5 || dur % 10 === 0) clickAnomalies.current++;
      }
      const target = e.target as Element;
      if (target?.getBoundingClientRect) {
        const rect = target.getBoundingClientRect();
        const cx = rect.width / 2, cy = rect.height / 2;
        if (Math.abs(e.clientX - rect.left - cx) < 0.1 && Math.abs(e.clientY - rect.top - cy) < 0.1) {
          clickAnomalies.current++;
        }
      }
    };

    const onFocus = () => { focusChanges.current++; };
    const onVisibilityChange = () => { if (document.hidden) tabSwitches.current++; };

    // Touch biometrics
    const onTouch = (e: TouchEvent) => {
      const touch = e.changedTouches?.[0];
      if (touch && touchEvents.current.length < 40) {
        touchEventsCount.current++;
        touchEvents.current.push({
          x: touch.clientX,
          y: touch.clientY,
          t: Date.now(),
          pressure:      (touch as any).force ?? (touch as any).pressure ?? 0,
          radiusX:       (touch as any).radiusX ?? 0,
          radiusY:       (touch as any).radiusY ?? 0,
          rotationAngle: (touch as any).rotationAngle ?? 0,
        });
      }
    };

    // Accelerometer
    const onDeviceMotion = (e: DeviceMotionEvent) => {
      sensorAvailable.current = true;
      const acc = e.accelerationIncludingGravity;
      if (acc && motionSamples.current.length < 30) {
        motionSamples.current.push({ ax: acc.x ?? 0, ay: acc.y ?? 0, az: acc.z ?? 0, t: Date.now() });
      }
    };

    // Gyroscope
    const onDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (orientationSamples.current.length < 20) {
        orientationSamples.current.push({ alpha: e.alpha ?? 0, beta: e.beta ?? 0, gamma: e.gamma ?? 0, t: Date.now() });
      }
    };

    window.addEventListener('mousemove',    onMouseMove,          { passive: true });
    window.addEventListener('keydown',      onKeyDown,            { passive: true });
    window.addEventListener('paste',        onPaste,              { passive: true });
    window.addEventListener('scroll',       onScroll,             { passive: true });
    window.addEventListener('mousedown',    onMouseDown,          { passive: true });
    window.addEventListener('mouseup',      onMouseUp,            { passive: true });
    window.addEventListener('focus',        onFocus,              { passive: true });
    window.addEventListener('touchstart',   onTouch,              { passive: true });
    window.addEventListener('touchmove',    onTouch,              { passive: true });
    window.addEventListener('devicemotion', onDeviceMotion,       { passive: true });
    window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange, { passive: true });

    // Emulated device check: mobile UA but no sensor events after 3s
    const sensorTimer = setTimeout(() => {
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobileUA && !sensorAvailable.current && navigator.maxTouchPoints > 0) {
        sensorIsStatic.current = true;
      }
    }, 3000);

    return () => {
      clearTimeout(sensorTimer);
      window.removeEventListener('mousemove',    onMouseMove);
      window.removeEventListener('keydown',      onKeyDown);
      window.removeEventListener('paste',        onPaste);
      window.removeEventListener('scroll',       onScroll);
      window.removeEventListener('mousedown',    onMouseDown);
      window.removeEventListener('mouseup',      onMouseUp);
      window.removeEventListener('focus',        onFocus);
      window.removeEventListener('touchstart',   onTouch);
      window.removeEventListener('touchmove',    onTouch);
      window.removeEventListener('devicemotion', onDeviceMotion);
      window.removeEventListener('deviceorientation', onDeviceOrientation);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  // ── Fingerprint helpers ──────────────────────────────────────────────────────

  const getWebGLInfo = () => {
    try {
      const cv = document.createElement('canvas');
      const gl = (cv.getContext('webgl') || cv.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (!gl) return { renderer: '', vendor: '', version: '', webglMaxTextureSize: 0 };
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      return {
        renderer: ext ? (gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string || '') : '',
        vendor:   ext ? (gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)   as string || '') : '',
        version:  (gl.getParameter(gl.VERSION) as string) || '',
        webglMaxTextureSize: (gl.getParameter(gl.MAX_TEXTURE_SIZE) as number) || 0,
      };
    } catch { return { renderer: '', vendor: '', version: '', webglMaxTextureSize: 0 }; }
  };

  const getCanvasFingerprint = (): string => {
    try {
      const cv = document.createElement('canvas');
      cv.width = 200; cv.height = 50;
      const ctx = cv.getContext('2d');
      if (!ctx) return '';
      ctx.textBaseline = 'top';
      ctx.font = "14px 'Arial'";
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('VitaShield🛡️', 2, 15);
      ctx.fillStyle = 'rgba(102,204,0,0.7)';
      ctx.fillText('VitaShield🛡️', 4, 17);
      const raw = cv.toDataURL();
      let h = 0;
      for (let i = 0; i < raw.length; i++) { h = ((h << 5) - h) + raw.charCodeAt(i); h |= 0; }
      return h.toString(16);
    } catch { return ''; }
  };

  const getFontDetectionHash = (): string => {
    try {
      const cv = document.createElement('canvas');
      const ctx = cv.getContext('2d');
      if (!ctx) return '';
      const testStr = 'mmmmmmmmmmlli';
      const baseFonts = ['monospace', 'sans-serif', 'serif'];
      const testFonts = ['Arial', 'Verdana', 'Georgia', 'Courier New', 'Roboto', 'Segoe UI', 'Helvetica Neue', '.AppleSystemUIFont'];
      const baseWidths: Record<string, number> = {};
      baseFonts.forEach(bf => { ctx.font = `72px ${bf}`; baseWidths[bf] = ctx.measureText(testStr).width; });
      const detected: string[] = [];
      testFonts.forEach(font => {
        const found = baseFonts.some(bf => {
          ctx.font = `72px ${font},${bf}`;
          return ctx.measureText(testStr).width !== baseWidths[bf];
        });
        if (found) detected.push(font);
      });
      const joined = detected.sort().join(',');
      let h = 0;
      for (let i = 0; i < joined.length; i++) { h = ((h << 5) - h) + joined.charCodeAt(i); h |= 0; }
      return h.toString(16);
    } catch { return ''; }
  };

  const getStorageAvailability = () => {
    const check = (type: string) => {
      try { const s = (window as any)[type]; s.setItem('__vms', '1'); s.removeItem('__vms'); return true; }
      catch { return false; }
    };
    return {
      localStorage: check('localStorage'),
      sessionStorage: check('sessionStorage'),
      indexedDB: !!window.indexedDB,
    };
  };

  const getNetworkInfo = () => {
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (!conn) return {};
    return { effectiveType: conn.effectiveType || '', downlink: conn.downlink || 0, rtt: conn.rtt || 0, saveData: conn.saveData || false };
  };

  const getPerformanceTiming = () => {
    try {
      const t = performance?.timing;
      if (!t?.navigationStart || !t?.loadEventEnd) return { pageLoadTimeMs: 0, domReadyTimeMs: 0, firstPaintMs: 0 };
      const paintEntries = performance.getEntriesByType?.('paint') ?? [];
      const fp = paintEntries.find((e: any) => e.name === 'first-paint');
      return {
        pageLoadTimeMs: Math.max(0, t.loadEventEnd - t.navigationStart),
        domReadyTimeMs: Math.max(0, t.domContentLoadedEventEnd - t.navigationStart),
        firstPaintMs:   fp ? Math.round((fp as any).startTime) : 0,
      };
    } catch { return { pageLoadTimeMs: 0, domReadyTimeMs: 0, firstPaintMs: 0 }; }
  };

  const isWebdriverSpoofed = (): boolean => {
    try {
      const desc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'webdriver');
      if (desc?.get && desc.get.toString().indexOf('[native code]') === -1) return true;
      if (Object.prototype.hasOwnProperty.call(navigator, 'webdriver')) return true;
      return false;
    } catch { return false; }
  };

  const computeEntropy = (values: number[]): number => {
    if (values.length < 4) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const v = values.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0) / values.length;
    return Math.round(Math.sqrt(v) * 100) / 100;
  };

  const computeStdDev = (values: number[]): number => {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const v = values.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0) / values.length;
    return Math.sqrt(v);
  };

  // ── Token generator ─────────────────────────────────────────────────────────
  const getTelemetryToken = (): string => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const glInfo = getWebGLInfo();
    const storageAvail = getStorageAvailability();
    const networkInfo = getNetworkInfo();
    const perfTiming = getPerformanceTiming();

    // Accelerometer gravity + stddev
    const mags = motionSamples.current.map(s => Math.sqrt(s.ax*s.ax + s.ay*s.ay + s.az*s.az));
    const accHasGravity = mags.some(m => Math.abs(m - 9.8) < 2.5);
    const accStdDev = computeStdDev(mags);

    // Gyroscope stddev
    const alphas = orientationSamples.current.map(s => s.alpha);
    const gyroStdDev = computeStdDev(alphas);

    // Touch rotation variance
    const rotations = touchEvents.current.map(t => t.rotationAngle);
    const touchRotVar = computeStdDev(rotations);

    // Entropy
    const mouseDeltas = mousePoints.current.length > 1
      ? mousePoints.current.slice(1).map((p, i) => Math.sqrt(Math.pow(p.x - mousePoints.current[i].x,2) + Math.pow(p.y - mousePoints.current[i].y,2)))
      : [];
    const mouseEntropy     = computeEntropy(mouseDeltas);
    const keystrokeEntropy = computeEntropy(keyTimings.current);

    const payload: TelemetryPayload = {
      sdkVersion: SDK_VERSION,
      fingerprint: {
        userAgent: navigator.userAgent,
        screenWidth:       window.screen.width     || 0,
        screenHeight:      window.screen.height    || 0,
        screenAvailWidth:  window.screen.availWidth  || 0,
        screenAvailHeight: window.screen.availHeight || 0,
        screenPixelRatio:  window.devicePixelRatio   || 1,
        screenOrientation: (screen as any)?.orientation?.type || '',
        colorDepth:        window.screen.colorDepth  || 0,
        timezone:          Intl.DateTimeFormat().resolvedOptions().timeZone || '',
        timezoneOffset:    new Date().getTimezoneOffset(),
        language:          navigator.language || '',
        navigatorVendor:   navigator.vendor   || '',
        navigatorPlatform: navigator.platform || '',
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        deviceMemory:        (navigator as any).deviceMemory || 0,
        maxTouchPoints:      navigator.maxTouchPoints || 0,
        pluginsCount:        navigator.plugins?.length || 0,
        pluginNames:         Array.from(navigator.plugins || []).map((p: any) => p.name).slice(0, 10),
        isMobile,
        isTablet: /iPad|Android/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent),
        touchSupport: navigator.maxTouchPoints > 0,
        webdriverActive:          navigator.webdriver || false,
        webdriverSpoofed:         isWebdriverSpoofed(),
        chromeRuntimeMissing:     /chrome/i.test(navigator.userAgent) && (!(window as any).chrome || !(window as any).chrome.runtime),
        pluginsArrayEmpty:        !isMobile && (!navigator.plugins || navigator.plugins.length === 0),
        languagesEmpty:           !navigator.languages || navigator.languages.length === 0,
        permissionQueryMismatch:  permissionQueryMismatch.current,
        outerDimensionsZeroed:    window.outerWidth === 0 && window.outerHeight === 0,
        canvasFingerprint:    getCanvasFingerprint(),
        fontDetectionHash:    getFontDetectionHash(),
        webglRenderer:        glInfo.renderer,
        webglVendor:          glInfo.vendor,
        webglVersion:         glInfo.version,
        webglMaxTextureSize:  glInfo.webglMaxTextureSize,
        hasWebRTC:          !!((navigator as any).getUserMedia || (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) || (window as any).RTCPeerConnection),
        hasServiceWorker:   'serviceWorker' in navigator,
        hasWebWorker:       typeof Worker !== 'undefined',
        hasIndexedDB:       storageAvail.indexedDB,
        hasWebGL:           !!(document.createElement('canvas').getContext('webgl')),
        networkInfo,
        storageAvailability: storageAvail,
        performanceTiming:   perfTiming,
      },
      behavior: {
        mouseEventsCount:  mouseEventsCount.current,
        keyPressesCount:   keyPressesCount.current,
        scrollsCount:      scrollsCount.current,
        mousePoints:       mousePoints.current,
        keyTimings:        keyTimings.current,
        challengeSolved:   challengeSolved.current,
        challengeMethod:   challengeMethod.current,
        durationMs:        Date.now() - startTime.current,
        backspaceCount:    backspaceCount.current,
        lastPasteTime:     lastPasteTime.current > 0 ? (Date.now() - lastPasteTime.current) : 0,
        submitPauseMs:     lastMouseMoveTime.current > 0 ? (Date.now() - lastMouseMoveTime.current) : 0,
        clickCount:        clickCount.current,
        clickAnomalies:    clickAnomalies.current,
        focusChanges:      focusChanges.current,
        tabSwitches:       tabSwitches.current,
        scrollTimings:     scrollTimings.current,
        touchEvents:       touchEvents.current,
        touchEventsCount:  touchEventsCount.current,
        touchRotationVariance: touchRotVar,
        motionSamples:     motionSamples.current,
        orientationSamples: orientationSamples.current,
        sensorAvailable:   sensorAvailable.current,
        sensorIsStatic:    sensorIsStatic.current,
        accelerometerHasGravity: accHasGravity,
        accelerometerStdDev:     accStdDev,
        gyroscopeStdDev:         gyroStdDev,
        mouseEntropyScore:     mouseEntropy,
        keystrokeEntropyScore: keystrokeEntropy,
      }
    };

    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  };

  const solveChallenge = (method: string) => {
    challengeSolved.current = true;
    challengeMethod.current = method;
  };

  return {
    getTelemetryToken,
    solveChallenge,
    mouseEventsCount: mouseEventsCount.current,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent),
  };
};
