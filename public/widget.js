(function () {
  // Wait for the DOM to load
  function initVitaShield() {
    const container = document.getElementById('vitashield-widget') || document.querySelector('[data-sitekey]');
    if (!container) return;

    // Check if already initialized to prevent duplicates
    if (container.getAttribute('data-vms-initialized') === 'true') return;
    container.setAttribute('data-vms-initialized', 'true');

    // Find parent form
    const parentForm = container.closest('form');

    // 1. Render the premium, silent security badge inside the container
    container.innerHTML = `
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: rgba(13, 20, 35, 0.45);
        border: 1px solid rgba(6, 182, 212, 0.15);
        border-radius: 8px;
        color: #94a3b8;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 11px;
        font-weight: 600;
        backdrop-filter: blur(4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

    // 2. Behavioral Kinetics Capture Variables
    let telemetry = {
      fingerprint: {
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width || 0,
        screenHeight: window.screen.height || 0,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
        language: navigator.language || '',
        webdriverActive: navigator.webdriver || false,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      },
      behavior: {
        mouseEventsCount: 0,
        keyPressesCount: 0,
        scrollsCount: 0
      }
    };

    // 3. Track events silently
    window.addEventListener('mousemove', () => {
      telemetry.behavior.mouseEventsCount++;
    }, { passive: true });

    window.addEventListener('keydown', () => {
      telemetry.behavior.keyPressesCount++;
    }, { passive: true });

    window.addEventListener('scroll', () => {
      telemetry.behavior.scrollsCount++;
    }, { passive: true });

    // 4. Intercept form submission
    if (parentForm) {
      parentForm.addEventListener('submit', function (e) {
        // Create base64 verification token from telemetries
        const jsonString = JSON.stringify(telemetry);
        const b64Token = btoa(unescape(encodeURIComponent(jsonString)));

        // Remove old token input if exists
        const oldInput = parentForm.querySelector('input[name="vms-shield-token"]');
        if (oldInput) oldInput.remove();

        // Inject token hidden input
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'vms-shield-token';
        hiddenInput.value = b64Token;
        parentForm.appendChild(hiddenInput);

        // Dispatch verified custom event
        const verifiedEvent = new CustomEvent('vms-verified', {
          detail: { token: b64Token }
        });
        container.dispatchEvent(verifiedEvent);
      });
    }
  }

  // Bind to DOM load and standard page transit intervals
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVitaShield);
  } else {
    initVitaShield();
  }
})();
