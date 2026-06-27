import React, { useState } from 'react';

export const Integration: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'javascript' | 'nodejs' | 'python' | 'go' | 'java' | 'php' | 'curl' | 'supabase'>('javascript');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  const [keys, setKeys] = useState({
    publicKey: 'vms_pub_live_79a2b8e3df9102ca',
    secretKey: 'vms_sec_live_9c0f73b18274d8a21f7c'
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const regenerateKeys = () => {
    const randomHex = (len: number) => Array.from({length: len}, () => Math.floor(Math.random()*16).toString(16)).join('');
    setKeys({
      publicKey: `vms_pub_live_${randomHex(16)}`,
      secretKey: `vms_sec_live_${randomHex(20)}`
    });
  };

  // Code snippets generator based on current keys state
  const codeSnippets = {
    javascript: `<!-- Add the VitaShield SDK to your HTML header -->
<script src="https://cdn.vitashield.sleepsomno.com/shield/v1/widget.js" async defer></script>

<!-- Add this container inside your submission form -->
<form id="login-form" action="/login" method="POST">
  <input type="text" name="username" placeholder="Username" required />
  <input type="password" name="password" placeholder="Password" required />

  <!-- VitaShield Widget Container -->
  <div id="vitamind-shield-widget" data-sitekey="${keys.publicKey}"></div>

  <button type="submit">Submit Securely</button>
</form>

<script>
  // Optional: Listen for verification success
  document.getElementById('vitamind-shield-widget')
    .addEventListener('vms-verified', (event) => {
      console.log('Verification token generated:', event.detail.token);
    });
</script>`,

    nodejs: `const express = require('express');
const fetch = require('node-fetch'); // or native fetch in Node 18+
const app = express();

app.use(express.urlencoded({ extended: true }));

app.post('/login', async (req, res) => {
  const shieldToken = req.body['vms-shield-token'];
  const clientIp = req.ip;

  // Validate the token with VitaShield API
  const response = await fetch('https://api.vitashield.sleepsomno.com/v1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: '${keys.secretKey}',
      token: shieldToken,
      ip: clientIp
    })
  });

  const result = await response.json();

  if (result.success && result.risk_score < 0.7) {
    // Proceed with authentication login logic
    res.send({ status: 'Success', user: req.body.username });
  } else {
    // Bot suspected or check failed
    res.status(403).send({ error: 'Verification failed. Automated activity detected.' });
  }
});

app.listen(3000);`,

    python: `import requests

def verify_shield_token(token, client_ip):
    url = "https://api.vitashield.sleepsomno.com/v1/verify"
    payload = {
        "secret": "${keys.secretKey}",
        "token": token,
        "ip": client_ip
    }
    
    try:
        response = requests.post(url, json=payload, timeout=5)
        result = response.json()
        
        # Check pass status and risk score thresholds
        if result.get("success") and result.get("risk_score", 1.0) < 0.7:
            return True, result
        return False, result
    except requests.RequestException as e:
        # Fallback handling in case of API outages (Fail open / Fail closed policy)
        return False, {"error": str(e)}
`,

    go: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type VerifyRequest struct {
    Secret string \`json:"secret"\`
    Token  string \`json:"token"\`
    IP     string \`json:"ip"\`
}

type VerifyResponse struct {
    Success   bool    \`json:"success"\`
    RiskScore float64 \`json:"risk_score"\`
}

func verifyToken(token, ip string) (bool, error) {
    reqBody, _ := json.Marshal(VerifyRequest{
        Secret: "${keys.secretKey}",
        Token:  token,
        IP:     ip,
    })

    client := &http.Client{Timeout: 5 * time.Second}
    resp, err := client.Post("https://api.vitashield.sleepsomno.com/v1/verify", "application/json", bytes.NewBuffer(reqBody))
    if err != nil {
        return false, err
    }
    defer resp.Body.Close()

    var result VerifyResponse
    json.NewDecoder(resp.Body).Decode(&result)
    return result.Success && result.RiskScore < 0.7, nil
}`,

    java: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class ShieldVerifier {
    private static final String SECRET = "${keys.secretKey}";

    public static boolean verifyToken(String token, String ip) throws Exception {
        String json = String.format("{\\"secret\\":\\"%s\\",\\"token\\":\\"%s\\",\\"ip\\":\\"%s\\"}", SECRET, token, ip);
        
        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.vitashield.sleepsomno.com/v1/verify"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        return response.statusCode() == 200 && response.body().contains("\\"success\\":true");
    }
}`,

    php: `<?php
function verifyShieldToken($token, $ip) {
    $url = 'https://api.vitashield.sleepsomno.com/v1/verify';
    $data = [
        'secret' => '${keys.secretKey}',
        'token'  => $token,
        'ip'     => $ip
    ];

    $options = [
        'http' => [
            'header'  => "Content-type: application/json\\r\\n",
            'method'  => 'POST',
            'content' => json_encode($data),
            'timeout' => 5
        ]
    ];

    $context  = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    if ($result === FALSE) { return false; }

    $response = json_decode($result, true);
    return $response['success'] === true && $response['risk_score'] < 0.7;
}
?>`,

    curl: `curl -X POST https://api.vitashield.sleepsomno.com/v1/verify \\
  -H "Content-Type: application/json" \\
  -d '{
    "secret": "${keys.secretKey}",
    "token": "vmt_live_token_here",
    "ip": "203.0.113.195"
  }'`,

    supabase: `// Initialize Supabase Client ( ojcvvtyaebdodmegwqan.supabase.co )
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ojcvvtyaebdodmegwqan.supabase.co',
  'YOUR_SUPABASE_ANON_KEY'
)

// Trigger OAuth sign-in with custom VitaShield provider (vitamind-ai)
async function signInWithVitaShield() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'custom:vitamind-ai',
    options: {
      redirectTo: 'https://vitashield.sleepsomno.com/dashboard',
      scopes: 'openid email profile'
    }
  })
  
  if (error) {
    console.error('Custom OAuth login failed:', error.message);
  } else {
    console.log('Redirecting to custom VitaShield auth gateway...');
  }
}`
  };

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title} className="gradient-text">API & Integration Center</h1>
          <p style={styles.subtitle}>Obtain credentials and integrate our lightweight SDK to verify human requests seamlessly.</p>
        </div>
      </div>

      {/* Three Integration Methods Overview */}
      <div style={styles.methodsGrid}>
        <div className="glass-panel" style={styles.methodCard}>
          <div style={styles.methodCardHeader}>
            <span style={styles.methodBadge}>Method 1</span>
            <h4 style={styles.methodTitle}>Frontend SDK (Widget)</h4>
          </div>
          <p style={styles.methodDesc}>Best for Registration, Login, and Forms. Client SDK gathers browser fingerprint & behavior biometrics, then validates verification tokens on your backend.</p>
        </div>
        
        <div className="glass-panel" style={styles.methodCard}>
          <div style={styles.methodCardHeader}>
            <span style={{ ...styles.methodBadge, background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.2)' }}>Method 2</span>
            <h4 style={styles.methodTitle}>Backend API Protection</h4>
          </div>
          <p style={styles.methodDesc}>Best for direct API endpoints. Customer server dispatches client headers, IP reputation parameters, and active session details directly to our verification gateway.</p>
        </div>

        <div className="glass-panel" style={styles.methodCard}>
          <div style={styles.methodCardHeader}>
            <span style={{ ...styles.methodBadge, background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>Method 3</span>
            <h4 style={styles.methodTitle}>Edge / Proxy Gateway</h4>
          </div>
          <p style={styles.methodDesc}>Akamai & Cloudflare Workers routing. Inspects inbound traffic at the network edge before hitting origin servers, providing instant WAF scrubbing & DDoS protection.</p>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Credentials Box */}
        <div className="glass-panel" style={styles.credentialsPanel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Your API Credentials</h3>
            <button onClick={regenerateKeys} style={styles.regenerateBtn}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>Regenerate Credentials</span>
            </button>
          </div>

          <div style={styles.keyContainer}>
            <div style={styles.keyRow}>
              <div style={styles.keyInfo}>
                <span style={styles.keyLabel}>Site Key (Public)</span>
                <span style={styles.keyDesc}>Identify your site in the frontend widget code.</span>
              </div>
              <div style={styles.keyFieldWrapper}>
                <input readOnly value={keys.publicKey} style={styles.keyInput} />
                <button 
                  onClick={() => handleCopy(keys.publicKey, 'public')} 
                  style={{
                    ...styles.copyIconBtn,
                    borderColor: copiedKey === 'public' ? 'var(--success)' : 'var(--border-color)'
                  }}
                >
                  {copiedKey === 'public' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div style={styles.keyRow}>
              <div style={styles.keyInfo}>
                <span style={styles.keyLabel}>Secret Key (Private)</span>
                <span style={styles.keyDesc}>Keep this safe. Used for server-to-server validation.</span>
              </div>
              <div style={styles.keyFieldWrapper}>
                <input readOnly type="password" value={keys.secretKey} style={styles.keyInput} />
                <button 
                  onClick={() => handleCopy(keys.secretKey, 'secret')} 
                  style={{
                    ...styles.copyIconBtn,
                    borderColor: copiedKey === 'secret' ? 'var(--success)' : 'var(--border-color)'
                  }}
                >
                  {copiedKey === 'secret' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          <div style={styles.badgeBox}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span style={styles.badgeText}>
              All API requests are served over high-speed HTTPS endpoints. Data packets are encrypted in transit using TLS 1.3.
            </span>
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="glass-panel" style={styles.guidePanel}>
          <h3 style={styles.panelTitle}>SDK Implementation Guide</h3>
          <p style={styles.panelSubtitle}>Add security checks to form submission routes in less than 5 minutes.</p>

          <div className="code-panel" style={{ marginTop: '1.25rem' }}>
            <div className="code-header">
              <div className="code-tabs">
                {(['javascript', 'nodejs', 'python', 'go', 'java', 'php', 'curl', 'supabase'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    className={`code-tab ${activeCodeTab === tab ? 'active' : ''}`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => handleCopy(codeSnippets[activeCodeTab], 'snippet')} 
                className="code-copy-btn"
              >
                {copiedKey === 'snippet' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="code-body">
              <code>{codeSnippets[activeCodeTab]}</code>
            </pre>
          </div>

          <div style={styles.postmanBox}>
            <div style={styles.postmanInfo}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Download ready-to-test **Postman Collection v2.1 JSON** containing verify endpoints.</span>
            </div>
            <button 
              onClick={() => handleCopy('https://api.vitashield.sleepsomno.com/v1/postman_collection.json', 'postman')} 
              style={styles.postmanBtn}
            >
              {copiedKey === 'postman' ? 'Link Copied!' : 'Copy Postman Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.03em'
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.98rem',
    marginTop: '0.25rem'
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.5rem'
  },
  credentialsPanel: {
    padding: '1.75rem'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    paddingBottom: '1rem',
    marginBottom: '1.5rem'
  },
  panelTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.02em'
  },
  panelSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
  },
  regenerateBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    color: 'var(--text-main)',
    transition: 'all 0.2s ease'
  },
  keyContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  keyRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr',
    gap: '1.5rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  keyInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  keyLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff'
  },
  keyDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginTop: '0.2rem'
  },
  keyFieldWrapper: {
    display: 'flex',
    gap: '0.5rem'
  },
  keyInput: {
    flex: 1,
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.65rem 1rem',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--secondary)',
    outline: 'none'
  },
  copyIconBtn: {
    background: 'rgba(6, 182, 212, 0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0 1rem',
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  badgeBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(6, 182, 212, 0.03)',
    border: '1px solid rgba(6, 182, 212, 0.12)',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
    marginTop: '2rem'
  },
  badgeText: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4'
  },
  guidePanel: {
    padding: '1.75rem'
  },
  postmanBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(245, 158, 11, 0.02)',
    border: '1px dashed rgba(245, 158, 11, 0.15)',
    borderRadius: '10px',
    padding: '1rem',
    marginTop: '1.5rem',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  postmanInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.82rem',
    color: 'var(--text-muted)'
  },
  postmanBtn: {
    background: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    borderRadius: '8px',
    padding: '0.45rem 1rem',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: 'var(--warning)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  methodsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem',
    width: '100%'
  },
  methodCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    background: 'rgba(0, 0, 0, 0.2)'
  },
  methodCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  methodBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    background: 'rgba(6, 182, 212, 0.1)',
    color: 'var(--secondary)',
    border: '1px solid rgba(6, 182, 212, 0.2)'
  },
  methodTitle: {
    fontSize: '0.98rem',
    fontWeight: '700',
    color: '#fff'
  },
  methodDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: '1.45'
  }
};
