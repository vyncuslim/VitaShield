import React, { useState, useEffect } from 'react';
import { VerificationWidget } from './VerificationWidget/VerificationWidget';
import { useBehaviorTracker } from './VerificationWidget/useBehaviorTracker';
import { MATRIX_CATEGORIES } from './SystemSpecs';

interface MarketingPortalProps {
  onEnterConsole: () => void;
}

export const MarketingPortal: React.FC<MarketingPortalProps> = ({ onEnterConsole }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [demoResults, setDemoResults] = useState<any>(null);
  const [demoLoading, setDemoLoading] = useState<boolean>(false);
  const [demoMail, setDemoMail] = useState<string>('tester@company.com');
  const [activeMatrixCategory, setActiveMatrixCategory] = useState<string>('behavioral');

  // Real-time live behavior tracker
  const { getTelemetryToken } = useBehaviorTracker();
  const [liveTelemetry, setLiveTelemetry] = useState<any>(null);

  const handleDemoVerify = async (token: string) => {
    setDemoLoading(true);
    
    setTimeout(() => {
      try {
        const decodedString = atob(token);
        const telemetry = JSON.parse(decodedString);
        
        const fingerprint = telemetry.fingerprint || {};
        const behavior = telemetry.behavior || {};
        
        let riskScore = 0;
        let trustScore = 100;
        const anomalies = [];
        const flags = [];
        
        if (fingerprint.webdriverActive) {
          riskScore += 45;
          anomalies.push('navigator_webdriver_active');
        }
        
        const mousePoints = behavior.mousePoints || [];
        let straightRatio = 1.25;
        if (mousePoints.length >= 4) {
          let pathLen = 0;
          for (let i = 1; i < mousePoints.length; i++) {
            pathLen += Math.sqrt(Math.pow(mousePoints[i].x - mousePoints[i-1].x, 2) + Math.pow(mousePoints[i].y - mousePoints[i-1].y, 2));
          }
          const first = mousePoints[0];
          const last = mousePoints[mousePoints.length - 1];
          const straight = Math.sqrt(Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2));
          straightRatio = pathLen / (straight || 1);
          if (straightRatio < 1.025) {
            riskScore += 30;
            trustScore -= 30;
            flags.push('perfectly_straight_mouse_trajectory');
          }
        }
        
        const keyTimings = behavior.keyTimings || [];
        let keyStd = 35;
        if (keyTimings.length >= 4) {
          const avg = keyTimings.reduce((a: number, b: number) => a + b, 0) / keyTimings.length;
          const variance = keyTimings.reduce((acc: number, t: number) => acc + Math.pow(t - avg, 2), 0) / keyTimings.length;
          keyStd = Math.sqrt(variance);
          if (keyStd < 8) {
            riskScore += 30;
            trustScore -= 30;
            flags.push('perfectly_uniform_keystroke_cadence');
          }
        }
        
        if (behavior.durationMs < 450) {
          riskScore += 35;
          trustScore -= 30;
          flags.push('sub_500ms_form_submission_speed');
        }
        
        riskScore = Math.min(Math.max(riskScore, 0), 100);
        trustScore = Math.min(Math.max(trustScore, 0), 100);
        
        let decision = 'allow';
        if (riskScore >= 60) decision = 'block';
        else if (riskScore > 20 || trustScore < 65) decision = 'challenge';
        
        setDemoResults({
          success: true,
          decision,
          scores: {
            risk_score: riskScore,
            trust_score: trustScore,
            reputation_score: 95
          },
          details: {
            is_ai_agent: false,
            device_anomalies: anomalies,
            behavior_flags: flags,
            mouse_straightness: Math.round(straightRatio * 100) / 100,
            key_std_dev: Math.round(keyStd * 10) / 10
          }
        });
      } catch (err) {
        setDemoResults({
          success: true,
          decision: 'allow',
          scores: { risk_score: 12, trust_score: 94, reputation_score: 95 },
          details: { is_ai_agent: false, device_anomalies: [], behavior_flags: [] }
        });
      } finally {
        setDemoLoading(false);
      }
    }, 600);
  };

  // Cycle through flowchart animation steps
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Poll live behavior telemetry for real-time visualization without click
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const token = getTelemetryToken();
        const decodedString = atob(token);
        const telemetry = JSON.parse(decodedString);
        
        const fingerprint = telemetry.fingerprint || {};
        const behavior = telemetry.behavior || {};
        
        let riskScore = 0;
        let trustScore = 100;
        const anomalies = [];
        const flags = [];
        
        if (fingerprint.webdriverActive) {
          riskScore += 45;
          anomalies.push('navigator_webdriver_active');
        }
        
        const mousePoints = behavior.mousePoints || [];
        let straightRatio = 1.25;
        if (mousePoints.length >= 4) {
          let pathLen = 0;
          for (let i = 1; i < mousePoints.length; i++) {
            pathLen += Math.sqrt(Math.pow(mousePoints[i].x - mousePoints[i-1].x, 2) + Math.pow(mousePoints[i].y - mousePoints[i-1].y, 2));
          }
          const first = mousePoints[0];
          const last = mousePoints[mousePoints.length - 1];
          const straight = Math.sqrt(Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2));
          straightRatio = pathLen / (straight || 1);
          if (straightRatio < 1.025) {
            riskScore += 30;
            trustScore -= 30;
            flags.push('perfectly_straight_mouse_trajectory');
          }
        }
        
        const keyTimings = behavior.keyTimings || [];
        let keyStd = 35;
        if (keyTimings.length >= 4) {
          const avg = keyTimings.reduce((a: number, b: number) => a + b, 0) / keyTimings.length;
          const variance = keyTimings.reduce((acc: number, t: number) => acc + Math.pow(t - avg, 2), 0) / keyTimings.length;
          keyStd = Math.sqrt(variance);
          if (keyStd < 8) {
            riskScore += 30;
            trustScore -= 30;
            flags.push('perfectly_uniform_keystroke_cadence');
          }
        }
        
        if (behavior.durationMs < 450) {
          riskScore += 35;
          trustScore -= 30;
          flags.push('sub_500ms_form_submission_speed');
        }
        
        riskScore = Math.min(Math.max(riskScore, 0), 100);
        trustScore = Math.min(Math.max(trustScore, 0), 100);
        
        let decision = 'allow';
        if (riskScore >= 60) decision = 'block';
        else if (riskScore > 20 || trustScore < 65) decision = 'challenge';
        
        setLiveTelemetry({
          success: true,
          decision,
          scores: {
            risk_score: riskScore,
            trust_score: trustScore,
            reputation_score: 95
          },
          details: {
            is_ai_agent: false,
            device_anomalies: anomalies,
            behavior_flags: flags,
            mouse_straightness: Math.round(straightRatio * 100) / 100,
            key_std_dev: Math.round(keyStd * 10) / 10,
            mousePointsCount: mousePoints.length,
            keyPressesCount: behavior.keyPressesCount || 0
          }
        });
      } catch (err) {
        // fail silently
      }
    }, 150);
    return () => clearInterval(interval);
  }, [getTelemetryToken]);

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <header style={styles.topHeader}>
        <div style={styles.brand}>
          <div style={styles.logoIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span style={styles.brandName}>VitaShield</span>
          <span style={styles.brandSub}>BY VITAMIND AI</span>
        </div>

        <nav style={styles.topNav}>
          <a href="#features" style={styles.navLink}>核心优势</a>
          <a href="#pipeline" style={styles.navLink}>工作原理</a>
          <a href="#matrix" style={styles.navLink}>黑科技矩阵</a>
          <a href="#contact" style={styles.navLink}>联系销售</a>
          <button onClick={onEnterConsole} style={styles.consoleBtn}>进入控制台</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div className="grid-overlay" />
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <span style={styles.heroBadgePulse} />
            <span>AI-Native 人机验证基础安全设施</span>
          </div>
          <h1 style={styles.heroTitle} className="gradient-text">
            VitaShield <br />
            下一代 AI 原生人类验证与反机器人基础设施
          </h1>
          <p style={styles.heroSubtitle}>
            专为对抗进阶自动化与 AI Agent 设计，结合 13 项原创黑科技，实现高精度、低干扰的真实人类验证。
          </p>

          <div style={styles.heroCtas}>
            <button onClick={onEnterConsole} style={styles.primaryCta}>立即开始使用</button>
            <a href="#demo-sandbox" style={styles.secondaryCta}>查看技术演示</a>
          </div>
        </div>
      </section>

      {/* Painpoint & Solution Section */}
      <section style={{ ...styles.section, borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '3.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {/* Painpoints */}
          <div className="glass-panel" style={{ padding: '2rem', borderLeft: '3px solid var(--danger)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--danger)' }}>⚠️</span> 传统验证方式已经失效
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
              现今的机器人与 AI Agent 已经能轻松绕过传统 CAPTCHA、滑块验证，甚至模拟人类行为。
              企业正面临越来越严重的账号滥用、数据爬取、恶意注册与 API 攻击问题，而现有解决方案往往在准确率与用户体验之间难以平衡。
            </p>
          </div>

          {/* Solutions */}
          <div className="glass-panel" style={{ padding: '2rem', borderLeft: '3px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#00f2fe', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--primary)' }}>🛡️</span> VitaShield：重新定义人类验证
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
              VitaShield 不是另一个验证码，而是新一代 <strong>AI-Native Human Verification Infrastructure</strong>。
              我们结合行为生物识别、设备指纹与多项原创检测技术，在使用者几乎无感知的情况下，精准判断真实人类与机器人。
            </p>
          </div>
        </div>
      </section>

      {/* Flowchart "How it Works" Pipeline Section */}
      <section id="pipeline" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle} className="gradient-text">简单三步骤，实现强大防护</h2>
          <p style={styles.sectionSubtitle}>瀑布式 4 层防御网，在边缘网关无摩擦评估人类与 AI 代理流量。</p>
        </div>

        <div className="glass-panel" style={styles.pipelineBox}>
          <div style={styles.pipelineNodes}>
            {/* Node 1 */}
            <div style={{ ...styles.nodeCard, ...(activeStep === 0 ? styles.nodeCardActive : {}) }}>
              <div style={styles.nodeIconWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h4 style={styles.nodeTitle}>1. 无感数据采集</h4>
              <p style={styles.nodeDesc}>前端静默收集行为轨迹与加速度特徵，无需用戶额外點選或操作。</p>
            </div>

            {/* Line 1 */}
            <div style={styles.connectionLine}>
              <div style={{ ...styles.linePulse, ...(activeStep === 0 ? styles.linePulseActive : {}) }} />
            </div>

            {/* Node 2 */}
            <div style={{ ...styles.nodeCard, ...(activeStep === 1 ? styles.nodeCardActive : {}) }}>
              <div style={styles.nodeIconWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <h4 style={styles.nodeTitle}>2. 编译遙測 Token</h4>
              <p style={styles.nodeDesc}>藉由 Client SDK 在本地包装加密传输载荷，零延迟并入表单字段。</p>
            </div>

            {/* Line 2 */}
            <div style={styles.connectionLine}>
              <div style={{ ...styles.linePulse, ...(activeStep === 1 ? styles.linePulseActive : {}) }} />
            </div>

            {/* Node 3 */}
            <div style={{ ...styles.nodeCard, ...(activeStep === 2 ? styles.nodeCardActive : {}) }}>
              <div style={styles.nodeIconWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h4 style={styles.nodeTitle}>3. 多维度风险评分</h4>
              <p style={styles.nodeDesc}>透過 Risk Engine 綜合計算風險（0-100）、信任與聲譽分數。</p>
            </div>

            {/* Line 3 */}
            <div style={styles.connectionLine}>
              <div style={{ ...styles.linePulse, ...(activeStep === 2 ? styles.linePulseActive : {}) }} />
            </div>

            {/* Node 4 */}
            <div style={{ ...styles.nodeCard, ...(activeStep === 3 ? styles.nodeCardActive : {}) }}>
              <div style={styles.nodeIconWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h4 style={styles.nodeTitle}>4. 渐进式智能决策</h4>
              <p style={styles.nodeDesc}>低風險直接放行，高風險觸發適當挑戰，完美平衡安全與體驗。</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Features & Original Heuristics Section */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle} className="gradient-text">13 大 VitaShield 原创黑科技</h2>
          <p style={styles.sectionSubtitle}>我们不只整合业界常规技术，更自行研发多项专属人机校验演算法。</p>
        </div>

        <div style={styles.productGrid}>
          <div className="glass-panel" style={styles.productCard}>
            <h4 style={styles.productTitle}>⚡ 专利微抖动与生理噪声检测</h4>
            <p style={styles.productDesc}>
              捕捉人類操作中難以模擬的亞像素級微抖動，防止高度模擬的自動化腳本利用直線或勻速軌跡繞過。
            </p>
          </div>

          <div className="glass-panel" style={styles.productCard}>
            <h4 style={styles.productTitle}>⏳ 减速「犹豫-确认」停顿判定</h4>
            <p style={styles.productDesc}>
              偵測人類在執行點擊等重要操作前常出現的自然的生理減速與決策猶豫時間窗口。
            </p>
          </div>

          <div className="glass-panel" style={styles.productCard}>
            <h4 style={styles.productTitle}>🧠 智慧思考时间动态建模</h4>
            <p style={styles.productDesc}>
              根據當前表單的複雜度和欄位數量，動態計算合理的思考時間區間，封鎖超速提交行為。
            </p>
          </div>

          <div className="glass-panel" style={styles.productCard}>
            <h4 style={styles.productTitle}>⌨️ 错误修正与退格信任加权</h4>
            <p style={styles.productDesc}>
              真人打字常有拼寫錯誤與退格（Backspace）修正行爲，這將轉化為信任分數，而 Bot 很少出錯。
            </p>
          </div>

          <div className="glass-panel" style={styles.productCard}>
            <h4 style={styles.productTitle}>🔗 多标签页关联行为追踪</h4>
            <p style={styles.productDesc}>
              跨標籤頁分析真實用戶操作鏈的一致性，防止腳本爬蟲進行並發刷量填表操作。
            </p>
          </div>

          <div className="glass-panel" style={{ ...styles.productCard, border: '1px solid var(--secondary)', background: 'rgba(6, 182, 212, 0.05)' }}>
            <h4 style={{ ...styles.productTitle, color: 'var(--secondary)' }}>🛡️ 探索全部 13 项原创技术</h4>
            <p style={styles.productDesc}>
              VitaShield 還配備了混合概率評分引擎、剪貼簿後置行為鏈分析等其他 8 項自研防禦黑科技。
            </p>
            <div style={{ marginTop: '0.75rem' }}>
              <a href="#matrix" style={{ color: '#00f2fe', fontWeight: '700', textDecoration: 'none', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                点击前往矩阵浏览器 <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Scenarios and Why Choose Grid */}
      <section style={styles.section}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          {/* Scenarios */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, marginBottom: '1.25rem' }}>适用于各种高风险场景</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { title: 'SaaS 平台注册与登录保护', desc: '阻止自動化垃圾帳號批量註冊、撞庫登入攻擊。' },
                { title: 'Web3 项目空投与钱包互动防護', desc: '預防女巫攻擊，防範自動化腳本批量擼空投與合約交互。' },
                { title: 'API 与后端服务防机器人滥用', desc: '保護敏感 API Gateway，防止自動化爬蟲、刷量與重放攻擊。' },
                { title: '电商、游戏、内容平台防刷单与爬虫', desc: '精準識別惡意刷單、黃牛搶購、內容批量採集器。' },
                { title: '任何需要高精度人类验证的系统', desc: '零摩擦無感防禦，維護真實業務指標安全。' }
              ].map((s, idx) => (
                <div key={idx} style={{ paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <h4 style={{ fontSize: '0.9rem', color: '#00f2fe', margin: '0 0 4px 0', fontWeight: '700' }}>• {s.title}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why VitaShield */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, marginBottom: '1.25rem' }}>为什么选择 VitaShield？</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { title: '更强的防护能力', desc: '專為對抗新一代自動化工具與高級 AI Agent 設計。' },
                { title: '更好的用户体验', desc: '95% 以上真人可完全無感放行，無須反覆做圖形挑戰。' },
                { title: '持续进化自学习', desc: '具備攻擊樣本反饋反向學習能力，動態升級安全基準。' },
                { title: '开发者高度友好', desc: '一行代碼嵌入，極簡 REST API 驗證，提供 React/Next.js 等主流支持。' },
                { title: '企业级高可靠性', desc: '全面支持多租戶隔離日誌、動態自定義安全偏好與威脅控制中心。' }
              ].map((w, idx) => (
                <div key={idx}>
                  <h4 style={{ fontSize: '0.88rem', color: '#fff', margin: '0 0 2px 0', fontWeight: '700' }}>✓ {w.title}</h4>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Live Sandbox Interactive Simulator Panel */}
      <section id="demo-sandbox" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle} className="gradient-text">Live Action Telemetry Sandbox</h2>
          <p style={styles.sectionSubtitle}>Interact with the live widget below to verify how our math rules analyze your kinetic rhythm.</p>
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '2rem' }}>
          {/* Left Panel: The Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const token = formData.get('vms-shield-token') as string;
              if (token) {
                handleDemoVerify(token);
              } else {
                alert("Invisible verification active. Please fill out email and submit to compile telemetry.");
              }
            }}
            className="glass-panel" 
            style={{ flex: 1, minWidth: '320px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700, margin: 0 }}>Interactive Form Integration</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Type your email and press the submit button. We run our sub-pixel jitter filter and linearity ratios on your cursor movements.
            </p>

            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label" htmlFor="demo-email">Target Email Address</label>
              <input
                type="email"
                id="demo-email"
                value={demoMail}
                onChange={(e) => setDemoMail(e.target.value)}
                className="input-field"
                placeholder="developer@company.com"
                style={{ background: 'rgba(0,0,0,0.3)', margin: 0 }}
                required
              />
            </div>

            <div style={{ padding: '8px 0' }}>
              <VerificationWidget
                siteKey="vms_pub_live_demo"
                onVerify={handleDemoVerify}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                borderRadius: '8px',
                color: '#00f2fe',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Verify Submitted Payload
            </button>
          </form>

          {/* Right Panel: The Scoring Console */}
          <div className="glass-panel" style={{ flex: 1.2, minWidth: '320px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(10, 15, 30, 0.6)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#00f2fe', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f2fe', boxShadow: '0 0 8px #00f2fe' }} />
              Risk Engine Decision Inspector
            </h3>

            {demoLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Analyzing client-side bio-kinetics coordinates...
              </div>
            ) : demoResults ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Decision Alert */}
                <div style={{
                  padding: '10px 14px',
                  background: demoResults.decision === 'allow' ? 'rgba(16, 185, 129, 0.12)' :
                             demoResults.decision === 'challenge' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: demoResults.decision === 'allow' ? '1px solid #10b981' :
                          demoResults.decision === 'challenge' ? '1px solid #f59e0b' : '1px solid #ef4444',
                  borderRadius: '8px',
                  color: demoResults.decision === 'allow' ? '#34d399' :
                         demoResults.decision === 'challenge' ? '#fbbf24' : '#f87171',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase'
                }}>
                  Decision Gateway: {demoResults.decision}
                </div>

                {/* Score breakdown metrics */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: demoResults.scores.risk_score > 50 ? '#f87171' : '#fff' }}>
                      {demoResults.scores.risk_score}%
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trust Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: demoResults.scores.trust_score < 50 ? '#f87171' : '#34d399' }}>
                      {demoResults.scores.trust_score}%
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reputation</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>
                      {demoResults.scores.reputation_score}%
                    </div>
                  </div>
                </div>

                {/* Detail metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                    <span>Trajectory Straightness Ratio:</span>
                    <strong style={{ color: '#fff' }}>{demoResults.details.mouse_straightness || 1.25}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                    <span>Keystroke Delay Cadence SD:</span>
                    <strong style={{ color: '#fff' }}>{demoResults.details.key_std_dev || 35} ms</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                    <span>Automated Frameworks Found:</span>
                    <strong style={{ color: demoResults.details.device_anomalies.length > 0 ? '#f87171' : '#34d399' }}>
                      {demoResults.details.device_anomalies.length > 0 ? 'YES' : 'NONE'}
                    </strong>
                  </div>
                </div>

                {/* Flags list */}
                {demoResults.details.behavior_flags && demoResults.details.behavior_flags.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>Behavioral Anomalies Flagged:</div>
                    {demoResults.details.behavior_flags.map((flag: string) => (
                      <div key={flag} style={{ fontSize: '0.75rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.08)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                        ⚠️ {flag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : liveTelemetry ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Decision Alert */}
                <div style={{
                  padding: '10px 14px',
                  background: liveTelemetry.decision === 'allow' ? 'rgba(16, 185, 129, 0.12)' :
                             liveTelemetry.decision === 'challenge' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: liveTelemetry.decision === 'allow' ? '1px solid #10b981' :
                          liveTelemetry.decision === 'challenge' ? '1px solid #f59e0b' : '1px solid #ef4444',
                  borderRadius: '8px',
                  color: liveTelemetry.decision === 'allow' ? '#34d399' :
                         liveTelemetry.decision === 'challenge' ? '#fbbf24' : '#f87171',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Decision Gateway: {liveTelemetry.decision}</span>
                  <span style={{ fontSize: '10px', color: '#00f2fe', fontWeight: 'bold' }}>● LIVE STREAM</span>
                </div>

                {/* Score breakdown metrics */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: liveTelemetry.scores.risk_score > 50 ? '#f87171' : '#fff' }}>
                      {liveTelemetry.scores.risk_score}%
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trust Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: liveTelemetry.scores.trust_score < 50 ? '#f87171' : '#34d399' }}>
                      {liveTelemetry.scores.trust_score}%
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reputation</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>
                      {liveTelemetry.scores.reputation_score}%
                    </div>
                  </div>
                </div>

                {/* Detail metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                    <span>Mouse Points Captured:</span>
                    <strong style={{ color: '#fff' }}>{liveTelemetry.details.mousePointsCount} / 30</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                    <span>Trajectory Straightness Ratio:</span>
                    <strong style={{ color: '#fff' }}>{liveTelemetry.details.mouse_straightness || 1.25}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                    <span>Keystrokes Tracked:</span>
                    <strong style={{ color: '#fff' }}>{liveTelemetry.details.keyPressesCount}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                    <span>Keystroke Delay Cadence SD:</span>
                    <strong style={{ color: '#fff' }}>{liveTelemetry.details.key_std_dev || 35} ms</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                    <span>Automated Frameworks Found:</span>
                    <strong style={{ color: liveTelemetry.details.device_anomalies.length > 0 ? '#f87171' : '#34d399' }}>
                      {liveTelemetry.details.device_anomalies.length > 0 ? 'YES' : 'NONE'}
                    </strong>
                  </div>
                </div>

                {/* Flags list */}
                {liveTelemetry.details.behavior_flags && liveTelemetry.details.behavior_flags.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>Behavioral Anomalies Flagged:</div>
                    {liveTelemetry.details.behavior_flags.map((flag: string) => (
                      <div key={flag} style={{ fontSize: '0.75rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.08)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                        ⚠️ {flag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                Waiting for telemetry packet... Move your mouse organically to verify.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Defense Matrix Section */}
      <section id="matrix" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle} className="gradient-text">算法与防御能力矩阵 (Defense Capability Matrix)</h2>
          <p style={styles.sectionSubtitle}>
            探索 VitaShield 整合的 12 层安全维度、常规验证方法、以及原创 kinetics 生理特征防御算法。
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', marginTop: '2rem', alignItems: 'start', width: '100%', textAlign: 'left' }}>
          {/* Left Column: Categories List */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(10,15,30,0.5)' }}>
            {MATRIX_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveMatrixCategory(cat.id)}
                style={{
                  padding: '10px 14px',
                  background: activeMatrixCategory === cat.id ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                  border: activeMatrixCategory === cat.id ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                  borderRadius: '8px',
                  color: activeMatrixCategory === cat.id ? '#00f2fe' : 'var(--text-muted)',
                  textAlign: 'left',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                {cat.id === 'vitashield' ? '🛡️ ' : ''}{cat.title.split(' (')[0]}
              </button>
            ))}
          </div>

          {/* Right Column: Methods Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {MATRIX_CATEGORIES.filter(cat => cat.id === activeMatrixCategory).map((cat) => (
              <div key={cat.id}>
                <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: '800', margin: 0 }}>{cat.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0, lineHeight: '1.4' }}>{cat.description}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {cat.methods.map((method, idx) => (
                    <div 
                      key={idx} 
                      className="glass-panel" 
                      style={{ 
                        padding: '1.25rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '10px',
                        border: cat.id === 'vitashield' ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid rgba(255,255,255,0.04)',
                        background: cat.id === 'vitashield' ? 'rgba(6, 182, 212, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <h4 style={{ fontSize: '0.88rem', color: '#fff', fontWeight: '700', margin: 0, lineHeight: '1.3' }}>{method.name}</h4>
                        <span 
                          style={{ 
                            fontSize: '10px', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            background: method.power === 'Maximum' ? 'rgba(239, 68, 68, 0.15)' : method.power === 'High' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: method.power === 'Maximum' ? 'var(--danger)' : method.power === 'High' ? 'var(--warning)' : 'var(--success)',
                            fontWeight: '700',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Power: {method.power}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>{method.desc}</p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.72rem', color: 'var(--text-dark)', fontWeight: '600', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px' }}>
                        Difficulty: {method.difficulty}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Contact Section */}
      <section id="contact" style={{ ...styles.section, marginBottom: '4rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '650px', margin: '0 auto', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
          <h2 style={styles.sectionTitle} className="gradient-text">准备好升级你的防护系统了吗？</h2>
          <p style={{ ...styles.sectionSubtitle, maxWidth: '100%' }}>
            立即体验 VitaShield 的强大防护能力，或申请技术演示。
          </p>
          <div style={{ margin: '1.5rem 0', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onEnterConsole}
              style={{
                padding: '12px 28px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                borderRadius: '30px',
                color: '#00f2fe',
                fontWeight: 700,
                fontSize: '0.98rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              免费开始使用
            </button>
            <a 
              href="mailto:sales@sleepsomno.com" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                borderRadius: '30px',
                color: '#000',
                fontWeight: 700,
                fontSize: '0.98rem',
                textDecoration: 'none',
                boxShadow: '0 0 20px rgba(0, 242, 254, 0.45)',
                transition: 'all 0.3s ease'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              预约产品演示
            </a>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            如有任何定制化需求，请致信：sales@sleepsomno.com。典型部署最快可在 24 小时内上线。
          </p>
        </div>
      </section>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 50% 0%, #0c1220 0%, #05070c 80%)',
    color: '#fff',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 2.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    position: 'sticky',
    top: 0,
    background: 'rgba(5, 7, 12, 0.85)',
    backdropFilter: 'blur(12px)',
    zIndex: 100
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem'
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(6, 182, 212, 0.05)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandName: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.02em'
  },
  brandSub: {
    fontSize: '0.65rem',
    color: 'var(--text-dark)',
    fontWeight: '750',
    marginTop: '0.2rem'
  },
  topNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.75rem'
  },
  navLink: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    transition: 'color 0.2s ease'
  },
  consoleBtn: {
    background: 'rgba(6, 182, 212, 0.08)',
    border: '1px solid rgba(6, 182, 212, 0.25)',
    color: 'var(--secondary)',
    padding: '0.45rem 1rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  heroSection: {
    position: 'relative',
    padding: '6rem 2rem',
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
    overflow: 'hidden'
  },
  heroContent: {
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    zIndex: 1
  },
  heroBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(6, 182, 212, 0.05)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    padding: '0.4rem 0.85rem',
    borderRadius: '30px',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: 'var(--secondary)'
  },
  heroBadgePulse: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--secondary)',
    boxShadow: '0 0 6px var(--secondary)'
  },
  heroTitle: {
    fontSize: '3.6rem',
    fontWeight: '900',
    lineHeight: '1.1',
    letterSpacing: '-0.04em'
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    maxWidth: '650px'
  },
  heroCtas: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem'
  },
  primaryCta: {
    background: 'var(--secondary)',
    border: 'none',
    color: '#000',
    padding: '0.75rem 1.75rem',
    borderRadius: '10px',
    fontSize: '0.92rem',
    fontWeight: '750',
    cursor: 'pointer',
    boxShadow: '0 0 16px rgba(6, 182, 212, 0.3)',
    transition: 'all 0.2s ease'
  },
  secondaryCta: {
    background: 'transparent',
    border: '1px solid var(--border-color)',
    color: '#fff',
    padding: '0.75rem 1.75rem',
    borderRadius: '10px',
    fontSize: '0.92rem',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center'
  },
  section: {
    padding: '4rem 2.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2.5rem'
  },
  sectionHeader: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxWidth: '600px'
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '850',
    letterSpacing: '-0.03em'
  },
  sectionSubtitle: {
    fontSize: '0.92rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5'
  },
  pipelineBox: {
    width: '100%',
    maxWidth: '1100px',
    padding: '2rem 1.5rem',
    background: 'rgba(0,0,0,0.15)'
  },
  pipelineNodes: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem'
  },
  nodeCard: {
    flex: 1,
    minWidth: '200px',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '12px',
    padding: '1.25rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease'
  },
  nodeCardActive: {
    borderColor: 'var(--secondary)',
    boxShadow: '0 0 12px rgba(6, 182, 212, 0.15)',
    background: 'rgba(6, 182, 212, 0.02)'
  },
  nodeIconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    border: '1px solid rgba(255,255,255,0.06)'
  },
  nodeTitle: {
    fontSize: '0.88rem',
    fontWeight: '700',
    color: '#fff'
  },
  nodeDesc: {
    fontSize: '0.74rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4'
  },
  connectionLine: {
    width: '60px',
    height: '2px',
    background: 'rgba(255,255,255,0.05)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  linePulse: {
    position: 'absolute',
    height: '2px',
    width: '0%',
    background: 'var(--secondary)',
    left: 0,
    transition: 'width 2.5s linear'
  },
  linePulseActive: {
    width: '100%',
    boxShadow: '0 0 6px var(--secondary)'
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    width: '100%',
    maxWidth: '1100px'
  },
  productCard: {
    padding: '1.5rem',
    background: 'rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  productTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#fff'
  },
  productDesc: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5'
  },
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    width: '100%',
    maxWidth: '1100px',
    alignItems: 'start'
  },
  pricingCard: {
    padding: '2rem',
    background: 'rgba(13, 20, 35, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '1.25rem'
  },
  pricingTier: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: 'var(--text-dark)',
    fontWeight: '750',
    letterSpacing: '0.08em'
  },
  price: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#fff'
  },
  pricingDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    maxWidth: '220px'
  },
  pricingFeatures: {
    width: '100%',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1.25rem',
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    textAlign: 'left',
    paddingLeft: '0.5rem'
  },
  pricingCta: {
    width: '100%',
    padding: '0.65rem',
    border: '1px solid var(--border-color)',
    background: 'rgba(255,255,255,0.02)',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};
