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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseEventsCount.current++;
      if (mousePoints.current.length < 30) {
        mousePoints.current.push({ x: e.clientX, y: e.clientY, t: Date.now() });
      }
    };

    const handleKeyDown = () => {
      keyPressesCount.current++;
      const now = Date.now();
      if (lastKeyTime.current > 0 && keyTimings.current.length < 15) {
        keyTimings.current.push(now - lastKeyTime.current);
      }
      lastKeyTime.current = now;
    };

    const handleScroll = () => {
      scrollsCount.current++;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
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
        isMobile
      },
      behavior: {
        mouseEventsCount: mouseEventsCount.current,
        keyPressesCount: keyPressesCount.current,
        scrollsCount: scrollsCount.current,
        mousePoints: mousePoints.current,
        keyTimings: keyTimings.current,
        challengeSolved: challengeSolved.current,
        challengeMethod: challengeMethod.current,
        durationMs: Date.now() - startTime.current
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
