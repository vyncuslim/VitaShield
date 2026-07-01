(function () {
  // ─── VitaShield Widget v2.2 ─────────────────────────────────────────────────
  // New: multi-dimensional fingerprint fusion, WebGL extended params,
  // fingerprint consistency data, network info, performance timing,
  // navigator vendor/platform/pluginNames, storage availability,
  // API support flags, font detection, touch rotationAngle, accelerometer
  // gravity detection, gyroscope variance, over-spoofing data collection
  // ────────────────────────────────────────────────────────────────────────────
  var SDK_VERSION = '2.2';

  function initVitaShield() {
    var startTime = Date.now();
    var container = document.getElementById('vitashield-widget') || document.querySelector('[data-sitekey]');
    if (!container) return;

    if (container.getAttribute('data-vms-initialized') === 'true') return;
    container.setAttribute('data-vms-initialized', 'true');

    var parentForm = container.closest('form');
    var themePrimary = container.getAttribute('data-theme-primary') || '#00f2fe';
    var themeBg = container.getAttribute('data-theme-bg') || 'rgba(13, 20, 35, 0.55)';
    var themeText = container.getAttribute('data-theme-text') || '#94a3b8';
    var debugMode = container.getAttribute('data-debug') === 'true';

    var log = debugMode ? function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('[VitaShield]');
      console.log.apply(console, args);
    } : function() {};

    // ── Badge render ──────────────────────────────────────────────────────────
    container.innerHTML =
      '<div id="vms-badge-box" style="' +
        'display:inline-flex;align-items:center;gap:8px;' +
        'padding:7px 14px;background:' + themeBg + ';' +
        'border:1px solid ' + themePrimary + '4a;border-radius:8px;' +
        'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
        'box-shadow:0 0 14px ' + themePrimary + '1a;' +
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;' +
        'user-select:none;">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="' + themePrimary + '" stroke-width="2.5">' +
          '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' +
        '</svg>' +
        '<span style="font-size:11px;color:' + themeText + ';font-weight:600;letter-spacing:0.02em;">Protected by VitaShield</span>' +
        '<svg id="vms-spinner" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="' + themePrimary + '" stroke-width="3" style="animation:vms-spin 1.2s linear infinite;opacity:0.7;">' +
          '<path d="M12 2a10 10 0 0 1 10 10"/>' +
        '</svg>' +
      '</div>' +
      '<style>@keyframes vms-spin{to{transform:rotate(360deg)}}</style>';

    // ── Telemetry state ───────────────────────────────────────────────────────
    var mousePoints = [], keyTimings = [], scrollTimings = [], touchEvents = [];
    var motionSamples = [], orientationSamples = [];
    var lastKeyTime = 0, lastMouseMoveTime = 0, lastScrollTime = 0, lastMouseDownTime = 0;
    var clickCount = 0, clickAnomalies = 0, focusChanges = 0, tabSwitches = 0;
    var touchEventsCount = 0;
    var sensorAvailable = false, sensorIsStatic = false;
    var permissionQueryMismatch = false;
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // ── Permission query mismatch (async) ─────────────────────────────────────
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'notifications' })
        .then(function(ps) {
          if (typeof Notification !== 'undefined' && Notification.permission === 'denied' && ps.state === 'prompt') {
            permissionQueryMismatch = true;
            log('Permission mismatch detected');
          }
        }).catch(function() {});
    }

    // ── Fingerprint helpers ───────────────────────────────────────────────────

    function getWebGLInfo() {
      try {
        var cv = document.createElement('canvas');
        var gl = cv.getContext('webgl') || cv.getContext('experimental-webgl');
        if (!gl) return { renderer: '', vendor: '', version: '', maxTextureSize: 0, shadingLanguageVersion: '' };
        var ext = gl.getExtension('WEBGL_debug_renderer_info');
        var vdims = gl.getParameter(gl.MAX_VIEWPORT_DIMS) || [0, 0];
        return {
          renderer: ext ? (gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '') : '',
          vendor:   ext ? (gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)   || '') : '',
          version:  gl.getParameter(gl.VERSION) || '',
          shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || '',
          maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0,
          maxViewportDims: [vdims[0] || 0, vdims[1] || 0],
        };
      } catch (e) { return { renderer: '', vendor: '', version: '', maxTextureSize: 0, shadingLanguageVersion: '', maxViewportDims: [0,0] }; }
    }

    function getCanvasFingerprint() {
      try {
        var cv = document.createElement('canvas');
        cv.width = 200; cv.height = 50;
        var ctx = cv.getContext('2d');
        if (!ctx) return '';
        ctx.textBaseline = 'top';
        ctx.font = "14px Arial";
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('VitaShield\uD83D\uDEE1', 2, 15);
        ctx.fillStyle = 'rgba(102,204,0,0.7)';
        ctx.fillText('VitaShield\uD83D\uDEE1', 4, 17);
        var raw = cv.toDataURL();
        var h = 0;
        for (var i = 0; i < raw.length; i++) { h = ((h << 5) - h) + raw.charCodeAt(i); h |= 0; }
        return h.toString(16);
      } catch (e) { return ''; }
    }

    function getFontDetectionHash() {
      // Detect a set of fonts using canvas text width measurement
      // Different OS/browser environments render fonts differently
      try {
        var cv = document.createElement('canvas');
        var ctx = cv.getContext('2d');
        if (!ctx) return '';
        var testString = 'mmmmmmmmmmlli';
        var baseFonts = ['monospace', 'sans-serif', 'serif'];
        var testFonts = [
          'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
          'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Palatino Linotype',
          'Lucida Console', 'Tahoma', 'Arial Narrow', 'Segoe UI',
          '.AppleSystemUIFont', 'Helvetica Neue', 'Roboto'
        ];
        var baseWidths = {};
        baseFonts.forEach(function(bf) {
          ctx.font = '72px ' + bf;
          baseWidths[bf] = ctx.measureText(testString).width;
        });
        var detectedFonts = [];
        testFonts.forEach(function(font) {
          var detected = baseFonts.some(function(bf) {
            ctx.font = '72px ' + font + ',' + bf;
            return ctx.measureText(testString).width !== baseWidths[bf];
          });
          if (detected) detectedFonts.push(font);
        });
        var joined = detectedFonts.sort().join(',');
        var h2 = 0;
        for (var i = 0; i < joined.length; i++) { h2 = ((h2 << 5) - h2) + joined.charCodeAt(i); h2 |= 0; }
        return h2.toString(16);
      } catch (e) { return ''; }
    }

    function getStorageAvailability() {
      function check(type) {
        try { var s = window[type]; s.setItem('__vms', '1'); s.removeItem('__vms'); return true; }
        catch (e) { return false; }
      }
      var idbOk = false;
      try { idbOk = !!window.indexedDB; } catch(e) {}
      return {
        localStorage: check('localStorage'),
        sessionStorage: check('sessionStorage'),
        indexedDB: idbOk,
      };
    }

    function getNetworkInfo() {
      var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!conn) return {};
      return {
        effectiveType: conn.effectiveType || '',
        downlink: conn.downlink || 0,
        rtt: conn.rtt || 0,
        saveData: conn.saveData || false,
      };
    }

    function getPerformanceTiming() {
      try {
        var t = performance && performance.timing;
        if (!t || !t.navigationStart || !t.loadEventEnd) return { pageLoadTimeMs: 0, domReadyTimeMs: 0, firstPaintMs: 0 };
        var pageLoad = t.loadEventEnd - t.navigationStart;
        var domReady = t.domContentLoadedEventEnd - t.navigationStart;
        var firstPaint = 0;
        if (performance.getEntriesByType) {
          var paintEntries = performance.getEntriesByType('paint');
          var fpEntry = paintEntries.find(function(e) { return e.name === 'first-paint'; });
          if (fpEntry) firstPaint = Math.round(fpEntry.startTime);
        }
        return {
          pageLoadTimeMs: Math.max(0, pageLoad),
          domReadyTimeMs: Math.max(0, domReady),
          firstPaintMs: firstPaint,
        };
      } catch (e) { return { pageLoadTimeMs: 0, domReadyTimeMs: 0, firstPaintMs: 0 }; }
    }

    function getScreenOrientation() {
      try {
        return (screen.orientation && screen.orientation.type) ||
               (screen.mozOrientation) || (screen.msOrientation) || '';
      } catch(e) { return ''; }
    }

    function hasWebRTC() {
      return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia || (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ||
                window.RTCPeerConnection || window.webkitRTCPeerConnection);
    }

    function getPluginNames() {
      try {
        var names = [];
        for (var i = 0; i < navigator.plugins.length; i++) {
          names.push(navigator.plugins[i].name);
        }
        return names.slice(0, 10); // cap at 10
      } catch(e) { return []; }
    }

    function isWebdriverSpoofed() {
      try {
        var desc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'webdriver');
        if (desc && desc.get && desc.get.toString().indexOf('[native code]') === -1) return true;
        if (Object.prototype.hasOwnProperty.call(navigator, 'webdriver')) return true;
        return false;
      } catch(e) { return false; }
    }

    // ── Collect all fingerprint data ──────────────────────────────────────────
    var glInfo = getWebGLInfo();
    var storageAvail = getStorageAvailability();
    var networkInfo = getNetworkInfo();
    var perfTiming = getPerformanceTiming();

    var telemetry = {
      sdkVersion: SDK_VERSION,
      fingerprint: {
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width || 0,
        screenHeight: window.screen.height || 0,
        screenAvailWidth: window.screen.availWidth || 0,
        screenAvailHeight: window.screen.availHeight || 0,
        screenPixelRatio: window.devicePixelRatio || 1,
        screenOrientation: getScreenOrientation(),
        colorDepth: window.screen.colorDepth || 0,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
        timezoneOffset: new Date().getTimezoneOffset(),
        language: navigator.language || '',
        // Navigator properties
        navigatorVendor: navigator.vendor || '',
        navigatorPlatform: navigator.platform || '',
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        deviceMemory: navigator.deviceMemory || 0,
        maxTouchPoints: navigator.maxTouchPoints || 0,
        pluginsCount: navigator.plugins ? navigator.plugins.length : 0,
        pluginNames: getPluginNames(),
        // Touch & mobile
        isMobile: isMobile,
        isTablet: /iPad|Android/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent),
        touchSupport: navigator.maxTouchPoints > 0,
        // Automation markers
        webdriverActive: navigator.webdriver || false,
        webdriverSpoofed: isWebdriverSpoofed(),
        chromeRuntimeMissing: /chrome/i.test(navigator.userAgent) && (!window.chrome || !window.chrome.runtime),
        pluginsArrayEmpty: !isMobile && (!navigator.plugins || navigator.plugins.length === 0),
        languagesEmpty: !navigator.languages || navigator.languages.length === 0,
        permissionQueryMismatch: false, // filled async
        outerDimensionsZeroed: (window.outerWidth === 0 && window.outerHeight === 0),
        // Fingerprint hashes
        canvasFingerprint: getCanvasFingerprint(),
        fontDetectionHash: getFontDetectionHash(),
        // WebGL (extended)
        webglRenderer: glInfo.renderer,
        webglVendor: glInfo.vendor,
        webglVersion: glInfo.version,
        webglMaxTextureSize: glInfo.maxTextureSize,
        // API support flags
        hasWebRTC: hasWebRTC(),
        hasServiceWorker: 'serviceWorker' in navigator,
        hasWebWorker: typeof Worker !== 'undefined',
        hasIndexedDB: storageAvail.indexedDB,
        hasWebGL: !!(document.createElement('canvas').getContext('webgl')),
        // Network & storage
        networkInfo: networkInfo,
        storageAvailability: storageAvail,
        // Performance timing
        performanceTiming: perfTiming,
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
        touchRotationVariance: 0,
        motionSamples: [],
        orientationSamples: [],
        sensorAvailable: false,
        sensorIsStatic: false,
        accelerometerHasGravity: false,
        accelerometerStdDev: 0,
        gyroscopeStdDev: 0,
        mouseEntropyScore: 0,
        keystrokeEntropyScore: 0,
      }
    };

    // ── Entropy helper ────────────────────────────────────────────────────────
    function computeEntropy(values) {
      if (values.length < 4) return 0;
      var mean = values.reduce(function(a,b){return a+b;}, 0) / values.length;
      var variance = values.reduce(function(acc,v){return acc+Math.pow(v-mean,2);}, 0) / values.length;
      return Math.round(Math.sqrt(variance) * 100) / 100;
    }

    function computeStdDev(values) {
      if (values.length < 2) return 0;
      var mean = values.reduce(function(a,b){return a+b;},0) / values.length;
      var v = values.reduce(function(acc,x){return acc+Math.pow(x-mean,2);},0) / values.length;
      return Math.sqrt(v);
    }

    // ── Event listeners ───────────────────────────────────────────────────────
    window.addEventListener('mousemove', function(e) {
      lastMouseMoveTime = Date.now();
      telemetry.behavior.mouseEventsCount++;
      if (mousePoints.length < 50) mousePoints.push({ x: e.clientX, y: e.clientY, t: lastMouseMoveTime });
    }, { passive: true });

    window.addEventListener('keydown', function(e) {
      telemetry.behavior.keyPressesCount++;
      if (e.key === 'Backspace' || e.key === 'Delete') telemetry.behavior.backspaceCount++;
      var now = Date.now();
      if (lastKeyTime > 0 && keyTimings.length < 20) keyTimings.push(now - lastKeyTime);
      lastKeyTime = now;
    }, { passive: true });

    window.addEventListener('paste', function() {
      telemetry.behavior.lastPasteTime = Date.now();
    }, { passive: true });

    window.addEventListener('scroll', function() {
      telemetry.behavior.scrollsCount++;
      var now = Date.now();
      if (lastScrollTime > 0 && scrollTimings.length < 15) scrollTimings.push(now - lastScrollTime);
      lastScrollTime = now;
    }, { passive: true });

    window.addEventListener('mousedown', function() {
      lastMouseDownTime = Date.now();
    }, { passive: true });

    window.addEventListener('mouseup', function(e) {
      clickCount++;
      if (lastMouseDownTime > 0) {
        var dur = Date.now() - lastMouseDownTime;
        if (dur < 5 || dur % 10 === 0) clickAnomalies++;
      }
      if (e.target && e.target.getBoundingClientRect) {
        var rect = e.target.getBoundingClientRect();
        var cx = rect.width / 2, cy = rect.height / 2;
        if (Math.abs(e.clientX - rect.left - cx) < 0.1 && Math.abs(e.clientY - rect.top - cy) < 0.1) {
          clickAnomalies++;
        }
      }
    }, { passive: true });

    window.addEventListener('focus', function() { focusChanges++; }, { passive: true });

    document.addEventListener('visibilitychange', function() {
      if (document.hidden) tabSwitches++;
    }, { passive: true });

    // ── Touch biometrics ──────────────────────────────────────────────────────
    function captureTouchPoint(e) {
      var touch = e.changedTouches && e.changedTouches[0];
      if (touch && touchEvents.length < 40) {
        touchEventsCount++;
        touchEvents.push({
          x: touch.clientX,
          y: touch.clientY,
          t: Date.now(),
          pressure: touch.force || touch.pressure || 0,
          radiusX: touch.radiusX || 0,
          radiusY: touch.radiusY || 0,
          rotationAngle: touch.rotationAngle || 0,
        });
      }
    }
    window.addEventListener('touchstart', captureTouchPoint, { passive: true });
    window.addEventListener('touchmove',  captureTouchPoint, { passive: true });

    // ── Device Motion (accelerometer) ─────────────────────────────────────────
    window.addEventListener('devicemotion', function(e) {
      sensorAvailable = true;
      var acc = e.accelerationIncludingGravity;
      if (acc && motionSamples.length < 30) {
        motionSamples.push({ ax: acc.x || 0, ay: acc.y || 0, az: acc.z || 0, t: Date.now() });
      }
    }, { passive: true });

    // ── Device Orientation (gyroscope) ────────────────────────────────────────
    window.addEventListener('deviceorientation', function(e) {
      if (orientationSamples.length < 20) {
        orientationSamples.push({ alpha: e.alpha || 0, beta: e.beta || 0, gamma: e.gamma || 0, t: Date.now() });
      }
    }, { passive: true });

    // Emulated device check: mobile UA + no motion after 3s
    setTimeout(function() {
      if (isMobile && !sensorAvailable && navigator.maxTouchPoints > 0) {
        sensorIsStatic = true;
        log('Sensor static: mobile UA but no motion events after 3s');
      }
    }, 3000);

    // ── Slider challenge UI ───────────────────────────────────────────────────
    function triggerSliderChallenge(onComplete) {
      container.innerHTML =
        '<div id="vms-challenge-container" style="' +
          'width:250px;height:38px;background:' + themeBg + ';' +
          'border:1px solid ' + themePrimary + '5a;border-radius:20px;' +
          'position:relative;overflow:hidden;display:flex;align-items:center;' +
          'justify-content:center;user-select:none;' +
          'font-family:-apple-system,BlinkMacSystemFont,sans-serif;' +
          'box-shadow:0 0 12px ' + themePrimary + '33;">' +
          '<span style="font-size:11px;color:' + themeText + ';font-weight:700;pointer-events:none;z-index:1;">' +
            '\uD83D\uDEE1\uFE0F Slide to Verify Humanity</span>' +
          '<div id="vms-slider-handle" style="' +
            'width:32px;height:32px;background:' + themePrimary + ';border-radius:50%;' +
            'position:absolute;left:3px;top:2px;cursor:grab;display:flex;' +
            'align-items:center;justify-content:center;' +
            'box-shadow:0 0 8px ' + themePrimary + ';z-index:2;">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#080b10" stroke-width="3">' +
              '<polyline points="9 18 15 12 9 6"/>' +
            '</svg>' +
          '</div>' +
        '</div>';

      var handle = document.getElementById('vms-slider-handle');
      var track  = document.getElementById('vms-challenge-container');
      if (!handle || !track) return;

      var isDragging = false, startX = 0;
      var maxDrag = track.clientWidth - handle.clientWidth - 6;

      function onStart(e) { isDragging = true; startX = (e.touches ? e.touches[0].clientX : e.clientX) - handle.offsetLeft; handle.style.cursor = 'grabbing'; }
      function onMove(e) {
        if (!isDragging) return;
        var cx = e.touches ? e.touches[0].clientX : e.clientX;
        var left = Math.max(3, Math.min(cx - startX, maxDrag));
        handle.style.left = left + 'px';
        if (left >= maxDrag - 2) { isDragging = false; onSuccess(); }
      }
      function onEnd() {
        if (!isDragging) return;
        isDragging = false;
        handle.style.cursor = 'grab';
        if (parseInt(handle.style.left) < maxDrag - 2) handle.style.left = '3px';
      }
      function onSuccess() {
        telemetry.behavior.challengeSolved = true;
        telemetry.behavior.challengeMethod = 'slider';
        container.innerHTML =
          '<div style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;' +
            'background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);border-radius:8px;' +
            'color:#34d399;font-family:sans-serif;font-size:11px;font-weight:700;">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' +
            '<span>\u2705 Verification Complete</span>' +
          '</div>';
        if (onComplete) onComplete();
      }

      handle.addEventListener('mousedown', onStart);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
      handle.addEventListener('touchstart', onStart, { passive: true });
      window.addEventListener('touchmove', onMove, { passive: true });
      window.addEventListener('touchend', onEnd);
    }

    // ── Form interception & token packaging ───────────────────────────────────
    if (parentForm) {
      parentForm.addEventListener('submit', function(e) {
        // Flush accumulated data
        telemetry.fingerprint.permissionQueryMismatch = permissionQueryMismatch;
        telemetry.behavior.mousePoints      = mousePoints;
        telemetry.behavior.keyTimings       = keyTimings;
        telemetry.behavior.clickCount       = clickCount;
        telemetry.behavior.clickAnomalies   = clickAnomalies;
        telemetry.behavior.focusChanges     = focusChanges;
        telemetry.behavior.tabSwitches      = tabSwitches;
        telemetry.behavior.scrollTimings    = scrollTimings;
        telemetry.behavior.touchEvents      = touchEvents;
        telemetry.behavior.touchEventsCount = touchEventsCount;
        telemetry.behavior.motionSamples    = motionSamples;
        telemetry.behavior.orientationSamples = orientationSamples;
        telemetry.behavior.sensorAvailable  = sensorAvailable;
        telemetry.behavior.sensorIsStatic   = sensorIsStatic;

        // Compute touch rotation variance
        if (touchEvents.length > 2) {
          var rotations = touchEvents.map(function(t) { return t.rotationAngle; });
          telemetry.behavior.touchRotationVariance = computeStdDev(rotations);
        }

        // Compute accelerometer gravity and stddev
        if (motionSamples.length > 3) {
          var magnitudes = motionSamples.map(function(s) {
            return Math.sqrt(s.ax * s.ax + s.ay * s.ay + s.az * s.az);
          });
          telemetry.behavior.accelerometerHasGravity = magnitudes.some(function(m) { return Math.abs(m - 9.8) < 2.5; });
          telemetry.behavior.accelerometerStdDev = computeStdDev(magnitudes);
        }

        // Compute gyroscope stddev
        if (orientationSamples.length > 3) {
          var alphas = orientationSamples.map(function(s) { return s.alpha; });
          telemetry.behavior.gyroscopeStdDev = computeStdDev(alphas);
        }

        // Compute entropy scores
        var mouseDeltas = mousePoints.length > 1
          ? mousePoints.slice(1).map(function(p, i) {
              return Math.sqrt(Math.pow(p.x - mousePoints[i].x, 2) + Math.pow(p.y - mousePoints[i].y, 2));
            })
          : [];
        telemetry.behavior.mouseEntropyScore = computeEntropy(mouseDeltas);
        telemetry.behavior.keystrokeEntropyScore = computeEntropy(keyTimings);

        // Refresh performance timing at submit time (more accurate)
        telemetry.fingerprint.performanceTiming = getPerformanceTiming();

        var isSuspicious = telemetry.behavior.mouseEventsCount === 0
          && !telemetry.behavior.challengeSolved
          && !telemetry.fingerprint.isMobile
          && telemetry.behavior.touchEventsCount === 0;

        if (isSuspicious) {
          e.preventDefault();
          e.stopPropagation();
          triggerSliderChallenge(function() {
            setTimeout(function() { parentForm.submit(); }, 800);
          });
          return false;
        }

        var now = Date.now();
        telemetry.behavior.durationMs  = now - startTime;
        if (lastMouseMoveTime > 0) telemetry.behavior.submitPauseMs = now - lastMouseMoveTime;
        if (telemetry.behavior.lastPasteTime > 0) telemetry.behavior.lastPasteTime = now - telemetry.behavior.lastPasteTime;

        var b64Token = btoa(unescape(encodeURIComponent(JSON.stringify(telemetry))));

        if (debugMode) {
          log('v' + SDK_VERSION + ' token ready, size:', JSON.stringify(telemetry).length, 'bytes');
          log('Fingerprint consistency data: vendor=' + telemetry.fingerprint.navigatorVendor +
              ' platform=' + telemetry.fingerprint.navigatorPlatform);
          log('WebGL: renderer=' + telemetry.fingerprint.webglRenderer +
              ' vendor=' + telemetry.fingerprint.webglVendor +
              ' maxTexture=' + telemetry.fingerprint.webglMaxTextureSize);
          log('Font hash:', telemetry.fingerprint.fontDetectionHash);
          log('Perf timing: load=' + telemetry.fingerprint.performanceTiming.pageLoadTimeMs +
              'ms domReady=' + telemetry.fingerprint.performanceTiming.domReadyTimeMs + 'ms');
          log('Accelerometer: hasGravity=' + telemetry.behavior.accelerometerHasGravity +
              ' stddev=' + telemetry.behavior.accelerometerStdDev);
          log('Gyroscope stddev:', telemetry.behavior.gyroscopeStdDev);
          log('Touch rotation variance:', telemetry.behavior.touchRotationVariance);
          log('Mouse entropy:', telemetry.behavior.mouseEntropyScore,
              'Keystroke entropy:', telemetry.behavior.keystrokeEntropyScore);
          log('Network:', JSON.stringify(telemetry.fingerprint.networkInfo));
        }

        var old = parentForm.querySelector('input[name="vms-shield-token"]');
        if (old) old.remove();
        var inp = document.createElement('input');
        inp.type = 'hidden'; inp.name = 'vms-shield-token'; inp.value = b64Token;
        parentForm.appendChild(inp);

        container.dispatchEvent(new CustomEvent('vms-verified', { detail: { token: b64Token } }));
      });
    }

    log('VitaShield v' + SDK_VERSION + ' initialized. Mobile:', isMobile, '| Debug:', debugMode);

    // Fire ready callbacks
    if (typeof window.onVitaShieldReady === 'function') {
      window.onVitaShieldReady({ version: SDK_VERSION, isMobile: isMobile });
    }
    window.dispatchEvent(new CustomEvent('vitashield:ready', { detail: { version: SDK_VERSION, isMobile: isMobile } }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVitaShield);
  } else {
    initVitaShield();
  }
})();
