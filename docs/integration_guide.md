# VitaShield Developer Integration Guide

Welcome to the **VitaShield** integration guide. This document details how to integrate our AI-native invisible behavioral verification infrastructure into your web application in under 2 minutes.

---

## 1. Frontend Integration Options

### Option A: Vanilla JavaScript (Script Tag)
For traditional multipage static HTML forms, inject the CDN script and place the widget container directly inside your `<form>` element.

```html
<form id="signup-form" action="/api/register" method="POST">
  <!-- Standard fields -->
  <input type="email" name="email" required />
  
  <!-- 1. The VitaShield Widget Container -->
  <div 
    id="vitashield-widget" 
    data-sitekey="your_public_sitekey_here"
    data-theme-primary="#00f2fe"
    data-theme-bg="rgba(13, 20, 35, 0.55)"
    data-theme-text="#94a3b8"
  ></div>

  <button type="submit">Submit</button>
</form>

<!-- 2. Embed the SDK script at the bottom of the body -->
<script src="https://cdn.vitashield.sleepsomno.com/widget.js" defer></script>
```

#### How it works:
*   Upon form submission, the script intercepts the submit handler.
*   It packages client-side device signals (WebGL vendor, window dimension matches, timezone) and kinetics (mouse coordinate velocity vectors, key timing variances).
*   It appends a hidden form field `<input type="hidden" name="vms-shield-token" value="BASE64_TOKEN" />` to the parent form before allowing submission.
*   If bot-like metrics are caught (e.g. zero mouse points), the form is suspended, and an interactive slider challenge is displayed for confirmation.

---

### Graceful Fallback for JavaScript-Disabled Clients (无 JS 降级模式)
If a client disables JavaScript (a behavior typical of headless scrapers to bypass client tracking scripts), the frontend SDK will not initialize. To prevent your form submission from breaking while ensuring security, place a `<noscript>` tag directly inside your `<form>`:

```html
<noscript>
  <div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px; color: #f87171; font-family: sans-serif; font-size: 12px; margin: 12px 0;">
    ⚠️ JavaScript is disabled. For security validation, please submit the form to proceed to fallback security gates.
    <input type="hidden" name="vms-no-js-fallback" value="true" />
  </div>
</noscript>
```

#### Backend Fallback Verification:
When your server intercepts the form data:
1. If the request contains `vms-no-js-fallback = "true"`, treat this session as high-risk (`risk_score = 95`).
2. Redirect the client to a static 3D Captcha confirmation page, or enforce a strict Rate-Limit policy to prevent scraper flooding.

---

### Option B: React / Next.js Component
For modern single-page apps, import our modular React component and track validation status inside your state loop.

```tsx
import React, { useState } from 'react';
import { VerificationWidget } from './components/VerificationWidget/VerificationWidget';

export const SignupForm = () => {
  const [token, setToken] = useState<string>('');
  
  const handleVerify = (verifiedToken: string) => {
    setToken(verifiedToken);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("Please complete the VitaShield verification badge first!");
      return;
    }

    // Post to your backend API
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email: 'user@company.com' })
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" placeholder="user@company.com" required />
      
      <VerificationWidget 
        siteKey="your_public_sitekey_here"
        onVerify={handleVerify}
        themePrimary="#ff007f" // Optional custom color configurations
      />

      <button type="submit">Register</button>
    </form>
  );
};
```

---

## 2. Backend Token Verification (POST /v1/verify)

Once your server-side handler intercepts the submitted form, fetch our API gateway to verify the authenticity of the client-side telemetry token:

### Endpoint Specifications
*   **Method**: `POST`
*   **Gateway URL**: `https://api.vitashield.sleepsomno.com/v1/verify`
*   **Headers**: `Content-Type: application/json`

### Request Body
```json
{
  "secret": "vms_sec_live_your_private_secret_key",
  "token": "base64_telemetry_token_submitted_by_form",
  "ip": "203.0.113.195"
}
```

### Response JSON (Risk Engine v2 Schema)
```json
{
  "success": true,
  "decision": "allow | challenge | block",
  "scores": {
    "risk_score": 12,
    "trust_score": 92,
    "reputation_score": 94
  },
  "detection_details": {
    "is_ai_agent": false,
    "agent_type": "none",
    "device_anomalies": [],
    "behavior_flags": [],
    "network_flags": []
  },
  "timestamp": "2026-06-29T08:35:00Z"
}
```

#### Decision Guidelines:
*   `allow` (Safe, low-friction entry): Proceed with transactions or user registration.
*   `challenge` (Suspicious kinetics): The client was directed to complete visual slider checks. Verify that `behavior.challengeSolved` equals true.
*   `block` (Bot/AI Scraper): Promptly terminate session requests to protect your endpoints.
