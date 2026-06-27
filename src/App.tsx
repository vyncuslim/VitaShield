import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LogsTable } from './components/LogsTable';
import { Integration } from './components/Integration';
import { Settings } from './components/Settings';
import { WidgetPlayground } from './components/WidgetPlayground';
import { SystemSpecs } from './components/SystemSpecs';
import { RulesEngine } from './components/RulesEngine';
import { AdminPortal } from './components/AdminPortal';
import { MLEngine } from './components/MLEngine';
import { AlertsManager } from './components/AlertsManager';
import { MarketingPortal } from './components/MarketingPortal';
import { AuthPortal } from './components/AuthPortal';
import type { ShieldConfig, VerificationLog } from './types';

// Initial dummy logs that feed the dashboard charts and tables
const INITIAL_LOGS: VerificationLog[] = [
  {
    id: 'req_vms_9a8f27c3',
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    ipAddress: '185.220.101.4',
    location: 'Germany (Berlin)',
    device: 'Linux Desktop',
    browser: 'Firefox 125',
    method: 'captcha_3d',
    status: 'passed',
    riskScore: 12
  },
  {
    id: 'req_vms_f8b1c4e9',
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    ipAddress: '103.149.162.25',
    location: 'China (Shenzhen)',
    device: 'Windows Desktop',
    browser: 'Chrome 126',
    method: 'behavioral_telemetry',
    status: 'blocked',
    riskScore: 98
  },
  {
    id: 'req_vms_c302d184',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    ipAddress: '72.210.45.182',
    location: 'United States (Seattle)',
    device: 'iPhone 15 Pro',
    browser: 'Safari Mobile',
    method: 'behavioral_telemetry',
    status: 'passed',
    riskScore: 3
  },
  {
    id: 'req_vms_7e2d93b1',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    ipAddress: '45.89.230.12',
    location: 'Russia (Moscow)',
    device: 'Windows Desktop',
    browser: 'Chrome 126 (Headless)',
    method: 'cryptographic_pow',
    status: 'blocked',
    riskScore: 95
  },
  {
    id: 'req_vms_09c8d1f2',
    timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
    ipAddress: '198.51.100.42',
    location: 'Canada (Toronto)',
    device: 'macOS Laptop',
    browser: 'Chrome 126',
    method: 'biometric_scan',
    status: 'passed',
    riskScore: 8
  },
  {
    id: 'req_vms_d48a1c90',
    timestamp: new Date(Date.now() - 55 * 60000).toISOString(),
    ipAddress: '172.56.21.90',
    location: 'United States (Chicago)',
    device: 'Android Phone',
    browser: 'Chrome Mobile',
    method: 'captcha_3d',
    status: 'flagged',
    riskScore: 54
  }
];

function App() {
  const [viewMode, setViewMode] = useState<'marketing' | 'auth' | 'console'>('marketing');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [user, setUser] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('vms-auth-session');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  
  const [config, setConfig] = useState<ShieldConfig>({
    preset: 'general',
    strictness: 'medium',
    forcedMethod: 'auto',
    bypassIpList: ['127.0.0.1'],
    blockIpList: []
  });

  const [logs, setLogs] = useState<VerificationLog[]>([]);

  // Scopes logs and settings by logged-in user email (Each user sees their own)
  useEffect(() => {
    if (!user) {
      setLogs([]);
      setConfig({
        preset: 'general',
        strictness: 'medium',
        forcedMethod: 'auto',
        bypassIpList: ['127.0.0.1'],
        blockIpList: []
      });
      return;
    }
    const email = user.user?.email || user.email || 'guest';
    
    // Load scoped logs
    const cachedLogs = localStorage.getItem(`vms_logs_${email}`);
    if (cachedLogs) {
      try {
        setLogs(JSON.parse(cachedLogs));
      } catch {
        setLogs(INITIAL_LOGS);
      }
    } else {
      setLogs(INITIAL_LOGS);
      localStorage.setItem(`vms_logs_${email}`, JSON.stringify(INITIAL_LOGS));
    }

    // Load scoped config
    const cachedConfig = localStorage.getItem(`vms_config_${email}`);
    if (cachedConfig) {
      try {
        setConfig(JSON.parse(cachedConfig));
      } catch {}
    }
  }, [user]);

  // Hook to persist config updates to localStorage
  const handleUpdateConfig = (newConfig: ShieldConfig) => {
    setConfig(newConfig);
    if (user) {
      const email = user.user?.email || user.email || 'guest';
      localStorage.setItem(`vms_config_${email}`, JSON.stringify(newConfig));
    }
  };

  // Single Sign-On (SSO) & Shared Session handler for sleepsomno.com users
  useEffect(() => {
    // 1. Intercept URL redirect query parameters from sleepsomno.com
    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get('sso_token') || params.get('access_token');
    const ssoEmail = params.get('email') || params.get('user_email');

    if (ssoToken && ssoEmail) {
      const session = {
        accessToken: ssoToken,
        user: { email: ssoEmail },
        sso: true,
        source: 'sleepsomno.com redirect'
      };
      localStorage.setItem('vms-auth-session', JSON.stringify(session));
      setUser(session);
      setViewMode('console');
      setActiveTab('dashboard');

      // Strip credentials from address bar quietly to avoid token leaks
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
      return;
    }

    // 2. Read shared root domain session cookies (e.g. .sleepsomno.com)
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return undefined;
    };

    const sharedJwt = getCookie('sleepsomno_jwt') || getCookie('sb-access-token');
    if (sharedJwt && !user) {
      const session = {
        accessToken: sharedJwt,
        user: { email: 'member@sleepsomno.com' },
        sso: true,
        source: 'sleepsomno.com cookie'
      };
      localStorage.setItem('vms-auth-session', JSON.stringify(session));
      setUser(session);
      setViewMode('console');
      setActiveTab('dashboard');
    }
  }, [user]);

  // Appends verification telemetry dynamically from widget triggers
  const handleAddLog = (
    method: VerificationLog['method'],
    status: VerificationLog['status'],
    score: number
  ) => {
    const randomHex = (len: number) => Array.from({length: len}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const newLog: VerificationLog = {
      id: `req_vms_${randomHex(8)}`,
      timestamp: new Date().toISOString(),
      ipAddress: `${Math.floor(Math.random() * 220) + 10}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      location: ['United States (San Francisco)', 'United Kingdom (London)', 'Japan (Tokyo)', 'Australia (Sydney)', 'Singapore'][Math.floor(Math.random()*5)],
      device: ['iPhone 15', 'Android Mobile', 'Windows Desktop', 'macOS Laptop'][Math.floor(Math.random()*4)],
      browser: ['Chrome 126', 'Safari Mobile', 'Firefox 125', 'Edge 124'][Math.floor(Math.random()*4)],
      method,
      status,
      riskScore: score
    };

    setLogs((prev) => {
      const updated = [newLog, ...prev];
      if (user) {
        const email = user.user?.email || user.email || 'guest';
        localStorage.setItem(`vms_logs_${email}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard config={config} logs={logs} />;
      case 'playground':
        return <WidgetPlayground config={config} onAddLog={handleAddLog} />;
      case 'logs':
        return <LogsTable logs={logs} />;
      case 'integration':
        return <Integration />;
      case 'settings':
        return <Settings config={config} setConfig={handleUpdateConfig} />;
      case 'specs':
        return <SystemSpecs />;
      case 'rules':
        return <RulesEngine />;
      case 'admin':
        return <AdminPortal />;
      case 'ml_pipeline':
        return <MLEngine />;
      case 'alerts':
        return <AlertsManager />;
      default:
        return <Dashboard config={config} logs={logs} />;
    }
  };

  if (viewMode === 'marketing') {
    return (
      <MarketingPortal 
        onEnterConsole={() => {
          if (user) {
            setViewMode('console');
            setActiveTab('dashboard');
          } else {
            setViewMode('auth');
          }
        }} 
      />
    );
  }

  if (viewMode === 'auth') {
    return (
      <AuthPortal 
        onAuthSuccess={(session) => {
          localStorage.setItem('vms-auth-session', JSON.stringify(session));
          setUser(session);
          setViewMode('console');
          setActiveTab('dashboard');
        }}
        onBackToHome={() => setViewMode('marketing')}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Side Navigation panel */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onReturnHome={() => setViewMode('marketing')}
        onLogout={() => {
          localStorage.removeItem('vms-auth-session');
          setUser(null);
          setViewMode('marketing');
        }}
      />
      
      {/* Main viewport area */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
