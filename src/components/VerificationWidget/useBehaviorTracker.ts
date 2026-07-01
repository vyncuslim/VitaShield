import { useEffect, useRef } from 'react';
import type { TelemetryPayload } from './types';

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

  useEffect(() => {
    // Check permission query mismatch (headless browser signature)
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'notifications' as any })
        .then((permissionStatus) => {
          if (typeof Notification !== 'undefined' && Notification.permission === 'denied' && permissionStatus.state === 'prompt') {
            permissionQueryMismatch.current = true;
          }
        })
        .catch(() => {});
    }

    const handleMouseMove = (e: MouseEvent) => {
      lastMouseMoveTime.current = Date.now();
      mouseEventsCount.current++;
      if (mousePoints.current.length < 30) {
        mousePoints.current.push({ x: e.clientX, y: e.clientY, t: lastMouseMoveTime.current });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      keyPressesCount.current++;
      if (e.key === 'Backspace' || e.key === 'Delete') {
        backspaceCount.current++;
      }
      const now = Date.now();
      if (lastKeyTime.current > 0 && keyTimings.current.length < 15) {
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

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    window.addEventListener('paste', handlePaste, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    window.addEventListener('focus', handleFocus, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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

  const getTelemetryToken = (): string => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
        chromeRuntimeMissing: /chrome/i.test(navigator.userAgent) && (!(window as any).chrome || !(window as any).chrome.runtime),
        pluginsArrayEmpty: !isMobile && (!navigator.plugins || navigator.plugins.length === 0),
        languagesEmpty: !navigator.languages || navigator.languages.length === 0,
        permissionQueryMismatch: permissionQueryMismatch.current,
        webdriverSpoofed
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
        scrollTimings: scrollTimings.current
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
