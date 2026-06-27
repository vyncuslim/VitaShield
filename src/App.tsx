import { useState } from 'react';
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
  const [viewMode, setViewMode] = useState<'marketing' | 'console'>('marketing');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  const [config, setConfig] = useState<ShieldConfig>({
    preset: 'general',
    strictness: 'medium',
    forcedMethod: 'auto',
    bypassIpList: ['127.0.0.1'],
    blockIpList: []
  });

  const [logs, setLogs] = useState<VerificationLog[]>(INITIAL_LOGS);

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

    setLogs((prev) => [newLog, ...prev]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard config={config} />;
      case 'playground':
        return <WidgetPlayground config={config} onAddLog={handleAddLog} />;
      case 'logs':
        return <LogsTable logs={logs} />;
      case 'integration':
        return <Integration />;
      case 'settings':
        return <Settings config={config} setConfig={setConfig} />;
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
        return <Dashboard config={config} />;
    }
  };

  if (viewMode === 'marketing') {
    return (
      <MarketingPortal 
        onEnterConsole={() => {
          setViewMode('console');
          setActiveTab('dashboard');
        }} 
      />
    );
  }

  return (
    <div className="app-container">
      {/* Side Navigation panel */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onReturnHome={() => setViewMode('marketing')} />
      
      {/* Main viewport area */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
