import { useEffect, useRef } from 'react';
import type { TelemetryPayload, TouchPoint, MotionSample, OrientationSample } from './types';

export const useBehaviorTracker = () => {
  const startTime = useRef<number>(Date.now());
  const mouseEventsCount = useRef<number>(0);
  const keyPressesCount = useRef<number>(0);
  const scrollsCount = useRef<number>(0);
  const mousePoints = useRef<Array<{ x: number; y: number; t: number }>>([]);
  const keyTimings = useRef<number[]>([]);
  const lastKeyTime = useRef<number>(0);
  const challengeSolved = useRef<boolean>(false);
  const challengeMethod = useRef<string>('none');
  const backspaceCount = useRef<number>(0);
  const lastPasteTime = useRef<number>(0);
  const lastMouseMoveTime = useRef<number>(0);
  const permissionQueryMismatch = useRef<boolean>(false);
  const clickCount = useRef<number>(0);
  const clickAnomalies = useRef<number>(0);
  const lastMouseDownTime = useRef<number>(0);
  const focusChanges = useRef<number>(0);
  const tabSwitches = useRef<number>(0);
  const scrollTimings = useRef<number[]>([]);
  const lastScrollTime = useRef<number>(0);

  // === Mobile sensor refs ===
  const touchEvents = useRef<TouchPoint[]>([]);
  const touchEventsCount = useRef<number>(0);
  const motionSamples = useRef<MotionSample[]>([]);
  const orientationSamples = useRef<OrientationSample[]>([]);
  const sensorAvailable = useRef<boolean>(false);
  const sensorIsStatic = useRef<boolean>(false);

  useEffect(() => {
    // Permission API mismatch check (headless browser signature)
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'notifications' as any })
        .then((permissionStatus) => {
          if (typeof Notification !== 'undefined' && Notification.permission === 'denied' && permissionStatus.state === 'prompt') {
            permissionQueryMismatch.current = true;
          }
        })
        .catch(() => {});
    }

    // === Mouse event handlers ===
    const handleMouseMove = (e: MouseEvent) => {
      lastMouseMoveTime.current = Date.now();
      mouseEventsCount.current++;
      if (mousePoints.current.length < 50) {
        mousePoints.current.push({ x: e.clientX, y: e.clientY, t: lastMouseMoveTime.current });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      keyPressesCount.current++;
      if (e.key === 'Backspace' || e.key === 'Delete') {
        backspaceCount.current++;
      }
      const now = Date.now();
      if (lastKeyTime.current > 0 && keyTimings.current.length < 20) {
        keyTimings.current.push(now - lastKeyTime.current);
      }
      lastKeyTime.current = now;
    };

    const handlePaste = () => {
      lastPasteTime.current = Date.now();
    };

    const handleMouseDown = () => {
      lastMouseDownTime.current = Date.now();
    };

    const handleMouseUp = (e: MouseEvent) => {
      clickCount.current++;
      if (lastMouseDownTime.current > 0) {
        const clickDuration = Date.now() - lastMouseDownTime.current;
        // Robotic click: < 5ms or perfectly divisible by 10ms
        if (clickDuration < 5 || clickDuration % 10 === 0) {
          clickAnomalies.current++;
        }
      }
      if (e.target instanceof Element) {
        const rect = e.target.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        // Pixel-perfect center click = robotic
        if (Math.abs(relX - centerX) < 0.1 && Math.abs(relY - centerY) < 0.1) {
          clickAnomalies.current++;
        }
      }
    };

    const handleFocus = () => {
      focusChanges.current++;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitches.current++;
      }
    };

    const handleScroll = () => {
      scrollsCount.current++;
      const now = Date.now();
      if (lastScrollTime.current > 0 && scrollTimings.current.length < 15) {
        scrollTimings.current.push(now - lastScrollTime.current);
      }
      lastScrollTime.current = now;
    };

    // === Mobile Touch handlers ===
    const handleTouchStart = (e: TouchEvent) => {
      touchEventsCount.current++;
      const touch = e.changedTouches[0];
      if (touchEvents.current.length < 40 && touch) {
        touchEvents.current.push({
          x: touch.clientX,
          y: touch.clientY,
          t: Date.now(),
          pressure: (touch as any).force ?? (touch as any).pressure ?? 0,
          radiusX: (touch as any).radiusX ?? 0,
          radiusY: (touch as any).radiusY ?? 0,
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (touchEvents.current.length < 40 && touch) {
        touchEvents.current.push({
          x: touch.clientX,
          y: touch.clientY,
          t: Date.now(),
          pressure: (touch as any).force ?? (touch as any).pressure ?? 0,
          radiusX: (touch as any).radiusX ?? 0,
          radiusY: (touch as any).radiusY ?? 0,
        });
      }
    };

    // === Device Motion (accelerometer) ===
    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      sensorAvailable.current = true;
      const acc = e.accelerationIncludingGravity;
      if (acc && motionSamples.current.length < 20) {
        motionSamples.current.push({
          ax: acc.x ?? 0,
          ay: acc.y ?? 0,
          az: acc.z ?? 0,
          t: Date.now(),
        });
      }
    };

    // === Device Orientation (gyroscope) ===
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (orientationSamples.current.length < 15) {
        orientationSamples.current.push({
          alpha: e.alpha ?? 0,
          beta: e.beta ?? 0,
          gamma: e.gamma ?? 0,
          t: Date.now(),
        });
      }
    };

    // Register all listeners
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    window.addEventListener('paste', handlePaste, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    window.addEventListener('focus', handleFocus, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });
    window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });

    // After 3s, check if sensor data never arrived on a mobile device → emulation flag
    const sensorCheckTimer = setTimeout(() => {
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobileUA && !sensorAvailable.current && navigator.maxTouchPoints > 0) {
        sensorIsStatic.current = true;
      }
    }, 3000);

    return () => {
      clearTimeout(sensorCheckTimer);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);

  const getWebGLRenderer = (): string => {
    try {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (!gl) return '';
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return '';
      return (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string) || '';
    } catch (e) {
      return '';
    }
  };

  const getCanvasFingerprint = (): string => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      ctx.textBaseline = 'top';
      ctx.font = "14px 'Arial'";
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('VitaShield🛡️', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('VitaShield🛡️', 4, 17);
      const raw = canvas.toDataURL();
      // Simple hash
      let hash = 0;
      for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash |= 0;
      }
      return hash.toString(16);
    } catch {
      return '';
    }
  };

  const computeEntropy = (values: number[]): number => {
    if (values.length < 4) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
    return Math.round(Math.sqrt(variance) * 100) / 100;
  };

  const getTelemetryToken = (): string => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent);

    const isWebdriverSpoofed = () => {
      try {
        const desc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'webdriver');
        if (desc && desc.get && desc.get.toString().indexOf('[native code]') === -1) {
          return true;
        }
        if (Object.prototype.hasOwnProperty.call(navigator, 'webdriver')) {
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    };
    const webdriverSpoofed = isWebdriverSpoofed();

    const mouseEntropyScore = computeEntropy(
      mousePoints.current.length > 1
        ? mousePoints.current.slice(1).map((p, i) => Math.sqrt(
            Math.pow(p.x - mousePoints.current[i].x, 2) +
            Math.pow(p.y - mousePoints.current[i].y, 2)
          ))
        : []
    );

    const keystrokeEntropyScore = computeEntropy(keyTimings.current);

    const payload: TelemetryPayload = {
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
        isTablet,
        touchSupport: navigator.maxTouchPoints > 0,
        maxTouchPoints: navigator.maxTouchPoints || 0,
        chromeRuntimeMissing: /chrome/i.test(navigator.userAgent) && (!(window as any).chrome || !(window as any).chrome.runtime),
        pluginsArrayEmpty: !isMobile && (!navigator.plugins || navigator.plugins.length === 0),
        languagesEmpty: !navigator.languages || navigator.languages.length === 0,
        permissionQueryMismatch: permissionQueryMismatch.current,
        webdriverSpoofed,
        canvasFingerprint: getCanvasFingerprint(),
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        deviceMemory: (navigator as any).deviceMemory || 0,
        colorDepth: window.screen.colorDepth || 0,
      },
      behavior: {
        mouseEventsCount: mouseEventsCount.current,
        keyPressesCount: keyPressesCount.current,
        scrollsCount: scrollsCount.current,
        mousePoints: mousePoints.current,
        keyTimings: keyTimings.current,
        challengeSolved: challengeSolved.current,
        challengeMethod: challengeMethod.current,
        durationMs: Date.now() - startTime.current,
        backspaceCount: backspaceCount.current,
        lastPasteTime: lastPasteTime.current > 0 ? (Date.now() - lastPasteTime.current) : 0,
        submitPauseMs: lastMouseMoveTime.current > 0 ? (Date.now() - lastMouseMoveTime.current) : 0,
        clickCount: clickCount.current,
        clickAnomalies: clickAnomalies.current,
        focusChanges: focusChanges.current,
        tabSwitches: tabSwitches.current,
        scrollTimings: scrollTimings.current,
        // Mobile sensor
        touchEvents: touchEvents.current,
        touchEventsCount: touchEventsCount.current,
        motionSamples: motionSamples.current,
        orientationSamples: orientationSamples.current,
        sensorAvailable: sensorAvailable.current,
        sensorIsStatic: sensorIsStatic.current,
        // Entropy metrics
        mouseEntropyScore,
        keystrokeEntropyScore,
      }
    };

    const jsonString = JSON.stringify(payload);
    return btoa(unescape(encodeURIComponent(jsonString)));
  };

  const solveChallenge = (method: string) => {
    challengeSolved.current = true;
    challengeMethod.current = method;
  };

  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

  return {
    getTelemetryToken,
    solveChallenge,
    mouseEventsCount: mouseEventsCount.current,
    isMobile: isMobileDevice
  };
};
