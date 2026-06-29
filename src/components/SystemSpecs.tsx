import React, { useState } from 'react';

const MATRIX_CATEGORIES = [
  {
    id: 'behavioral',
    title: '1. 行为生物识别类 (Behavioral Biometrics)',
    description: '通过分析人手部肌肉的微小抖動及操作節奏，精準區分真實人類與自動化腳本。',
    methods: [
      { name: '鼠标轨迹直线度、曲率、加速度变化', desc: '檢測滑鼠運動路徑是否呈現過於完美的直線或規律的加減速特徵。', power: 'High', difficulty: 'Medium' },
      { name: '鼠标速度方差与加速度方差', desc: '真人操作具備自然的生理噪聲與不規律性，機械操作速度方差極低。', power: 'High', difficulty: 'Medium' },
      { name: '点击位置分布、点击间隔、点击后停留时间', desc: '分析滑鼠點擊是否精準落在按鈕幾何中心，以及點擊鬆開的微秒級間隔。', power: 'Medium', difficulty: 'Low' },
      { name: '键盘输入节奏 (Dwell/Flight Time + 错误修正)', desc: '計算按鍵壓下時長（Dwell）與按鍵切換間隔（Flight），建構輸入特徵模型。', power: 'High', difficulty: 'High' },
      { name: '滚动速度、停顿、回滚行为', desc: '分析閱讀頁面時的滾動停頓點、回看滾動幅度與加速度曲線。', power: 'Medium', difficulty: 'Medium' },
      { name: '焦点切换模式与切换速度', desc: '檢測瀏覽器窗口、輸入框焦點切換的邏輯順序與反應時間。', power: 'High', difficulty: 'Medium' },
      { name: '悬停 (Hover) 时间与微小移动', desc: '滑鼠懸停在元素上方時，分析是否存在人類特有的生理微震顫。', power: 'Medium', difficulty: 'Medium' },
      { name: '页面内多元素交互顺序', desc: '真人瀏覽通常有自上而下、焦點偏移等認知邏輯，Bot 多為直奔目標。', power: 'High', difficulty: 'Medium' },
      { name: '整体操作流程的“犹豫-行动”模式', desc: '評估用戶在進行關鍵點擊前是否存在思考停頓與軌跡減速。', power: 'High', difficulty: 'Medium' },
      { name: '多标签页 / 多窗口切换行为', desc: '追蹤同個客戶端在多個分頁、視窗間的高頻並發切換特徵。', power: 'High', difficulty: 'High' }
    ]
  },
  {
    id: 'fingerprint',
    title: '2. 设备与环境指纹类 (Device & Environment)',
    description: '深度檢測客戶端 JavaScript 執行環境、硬體圖形渲染能力與底層系統特徵。',
    methods: [
      { name: 'WebDriver / 自动化框架特征检测', desc: '掃描 navigator.webdriver、chrome.runtime 等自動化驅動變量。', power: 'Maximum', difficulty: 'Low' },
      { name: 'Canvas、WebGL、WebGPU 指纹', desc: '利用 GPU 渲染微小差異，提取硬體特定的圖形渲染特徵碼。', power: 'High', difficulty: 'Medium' },
      { name: '字体、插件、扩展指纹', desc: '枚舉系統字體列表、瀏覽器插件與已安裝的擴展特徵。', power: 'Medium', difficulty: 'Medium' },
      { name: '音频指纹 (AudioContext + Oscillator)', desc: '藉由音頻合成器產生無聲正弦波，分析音效卡與解碼器的渲染噪聲。', power: 'Medium', difficulty: 'High' },
      { name: '传感器指纹 (加速度、陀螺仪、触摸压力)', desc: '在移動端收集螢幕觸控面積、滑動壓力、以及陀螺儀的三維傾角變化。', power: 'High', difficulty: 'High' },
      { name: 'TLS/JA3/JA4 指纹', desc: '在 TCP 握手階段分析客戶端發送的密碼套件順序，識別隱藏的 Curl/HTTP 庫。', power: 'Maximum', difficulty: 'High' },
      { name: 'HTTP/2 指纹 + 请求头指纹', desc: '比對 HTTP/2 連接參數、窗口大小以及 Request Header 的大小寫順序。', power: 'High', difficulty: 'High' },
      { name: 'WebRTC 泄露与行为', desc: '透過 WebRTC 接口探測真實內網 IP 及媒體輸入輸出設備清單。', power: 'Medium', difficulty: 'Medium' },
      { name: '电池状态、充电状态 (移动端)', desc: '獲取電池剩餘電量、是否正在充電，輔助判斷是否為實體手機牆。', power: 'Medium', difficulty: 'Low' },
      { name: '屏幕刷新率、颜色配置文件', desc: '讀取螢幕物理刷新率（如 60Hz, 120Hz）與色彩空間（sRGB/P3）。', power: 'Medium', difficulty: 'Low' },
      { name: 'JavaScript 引擎性能指纹', desc: '執行基準算法測試，評估 JS 引擎在特定 CPU 下的浮點運算耗時。', power: 'High', difficulty: 'High' },
      { name: 'WebAssembly 执行特征', desc: '檢測 WASM 支持度、編譯速度以及執行複雜運算時的線程行為。', power: 'High', difficulty: 'Medium' }
    ]
  },
  {
    id: 'temporal',
    title: '3. 时间与模式分析类 (Temporal & Patterns)',
    description: '分析請求發送的時間戳分佈，捕捉機器人高頻、規律性的排程提交。',
    methods: [
      { name: '极短时间表单提交', desc: '攔截頁面加載後瞬間（如 <500ms）即提交表單的超人類行為。', power: 'Maximum', difficulty: 'Low' },
      { name: '操作间隔的规律性 (方差分析)', desc: '計算多次請求間隔的標準差，精準識別定時觸發的自動化任務。', power: 'High', difficulty: 'Medium' },
      { name: '思考时间 / 犹豫时间检测', desc: '比對用戶輸入密碼、閱讀條款時應有的邏輯停頓時長。', power: 'Medium', difficulty: 'Medium' },
      { name: '夜间异常高频操作', desc: '結合本時區昼夜作息規律，對凌晨高頻率爆發的動作進行提權校驗。', power: 'Medium', difficulty: 'Low' },
      { name: '连续动作的时间分布熵 (Entropy)', desc: '計算動作序列的時間熵值，規律性越高的 Bot 時間熵越接近零。', power: 'High', difficulty: 'High' },
      { name: '页面停留时间与行为匹配度', desc: '比對頁面總停留時長與產生的滾動、點擊次數是否相符。', power: 'High', difficulty: 'Medium' }
    ]
  },
  {
    id: 'challenge',
    title: '4. 挑战响应类 (Challenge Response)',
    description: '在風險升高時主動下發動態挑戰，驗證客戶端交互的真實性。',
    methods: [
      { name: '传统 CAPTCHA (图片、文字、音频)', desc: '基本的扭曲字符識別、九宮格圖片選擇等二代交互驗證。', power: 'Medium', difficulty: 'Low' },
      { name: '滑块、拖拽、拼图验证', desc: '要求拖動拼圖塊對齊缺口，後端同步驗證拖拽的曲率與速度抖動。', power: 'High', difficulty: 'Medium' },
      { name: 'Proof of Work (客户端算力证明)', desc: '在背景要求瀏覽器執行 SHA-256 等難度哈希計算，增加自動化刷量成本。', power: 'Maximum', difficulty: 'High' },
      { name: '语义验证 (图像选择、文字理解)', desc: '例如「請選出所有含有交通號誌的圖片」或進行邏輯問答。', power: 'High', difficulty: 'Medium' },
      { name: '游戏化验证', desc: '融入趣味微小遊戲（如旋轉物品角度、接水管）以增加機器人破解難度。', power: 'High', difficulty: 'High' },
      { name: '动态难度挑战 (根据风险调整)', desc: '基於 IP 與行為信譽分，動態將挑戰從無感調整為算力計算或滑塊。', power: 'Maximum', difficulty: 'High' },
      { name: '行为连续性挑战', desc: '要求用戶連續完成一連串特定手勢（如畫圈、雙擊）方可通過網關。', power: 'High', difficulty: 'Medium' }
    ]
  },
  {
    id: 'network',
    title: '5. 网络与代理检测类 (Network & Proxy)',
    description: '在傳輸層與網絡層識別代理中轉、住宅 IP 租用及匿名路由。',
    methods: [
      { name: 'IP 信誉库 + 数据中心 IP 检测', desc: '實時比對全球主機商 ASN 號段，過濾來自 AWS、阿里雲等機房的流量。', power: 'High', difficulty: 'Low' },
      { name: '代理协议指纹 (SOCKS5/VLESS/gRPC)', desc: '分析 TCP 連接指紋，識別客戶端是否使用特定的代理通訊協定。', power: 'Maximum', difficulty: 'Medium' },
      { name: 'VPN / 住宅代理检测', desc: '計算 TCP 延遲（RTT）與地理位置的偏差，揪出中轉的住宅 IP 爬蟲。', power: 'High', difficulty: 'High' },
      { name: 'Tor 出口节点检测', desc: '實時同步洋蔥路由（Tor）出口節點名單，自動對隱私代理實施降級攔截。', power: 'Maximum', difficulty: 'Low' },
      { name: 'ASN 行为分析', desc: '監控特定自主系統（ASN）號段下的並發異常，防止分佈式刷量。', power: 'High', difficulty: 'Medium' },
      { name: '请求来源一致性 (IP+地理+行为)', desc: '驗證 IP 所在地、系統語系、時區與本地網絡延遲是否具備物理合理性。', power: 'High', difficulty: 'Medium' }
    ]
  },
  {
    id: 'semantic',
    title: '6. 内容与语义分析类 (Content & Semantics)',
    description: '審查提交文本與內容特徵，過濾大模型生成的垃圾內容或自動化黏貼。',
    methods: [
      { name: '大模型生成内容 (LLM) 判别', desc: '分析文本的字詞機率分佈特徵，判斷是否為 GPT-4/LLM 批量洗稿內容。', power: 'High', difficulty: 'High' },
      { name: '重复内容 / 模板内容检测', desc: '比對全網歷史提交庫，攔截僅修改模板參數的自動化洗評論行為。', power: 'Medium', difficulty: 'Low' },
      { name: '语义连贯性与逻辑性分析', desc: '識別隨機拼湊的無意義單詞與SEO關鍵字堆砌爬蟲。', power: 'High', difficulty: 'High' },
      { name: '链接与图片使用模式', desc: '監控輸入內容中超連結、引用的比例，預防論壇群發廣告 Bot。', power: 'Medium', difficulty: 'Low' },
      { name: '复制粘贴后的行为链检测', desc: '判定「黏貼文本 -> 提交表單」的時間差是否低於 350ms，捕捉無人工審查的提交。', power: 'High', difficulty: 'Low' }
    ]
  },
  {
    id: 'reputation',
    title: '7. 声誉与历史类 (Reputation & History)',
    description: '建立長期信任帳本，在確保安全的同時讓良性用戶享有最流暢的體驗。',
    methods: [
      { name: '设备历史可信评分', desc: '為通過多次強檢驗的瀏覽器註冊安全憑證，後續交互直接放行。', power: 'High', difficulty: 'Medium' },
      { name: 'IP/账号行为历史', desc: '累計特定 IP 或帳號在網關的驗證成功率，調降良性 IP 的挑戰概率。', power: 'High', difficulty: 'Medium' },
      { name: '跨平台行为一致性', desc: '在同一個網絡聯盟內，共用客戶端特徵以加速未知威脅判斷。', power: 'High', difficulty: 'High' },
      { name: '新设备/新 IP 的严格验证', desc: '對首次訪問的設備、高風險網段 IP 進行嚴格的一階段靜默遙測。', power: 'Medium', difficulty: 'Low' },
      { name: '黑白名单 + 关联图谱', desc: '追蹤 IP、Cookie、設備指紋間的網狀關聯，對協同作案的設備進行批量拉黑。', power: 'Maximum', difficulty: 'High' }
    ]
  },
  {
    id: 'ml',
    title: '8. 机器学习与高级分析类 (Machine Learning)',
    description: '使用統計與 AI 推理模型，對未知威脅進行主動分類與預測。',
    methods: [
      { name: '异常检测模型 (Isolation Forest/Autoencoder)', desc: '訓練無監督學習模型，在不需要特定特徵的情況下識別變異的機器人。', power: 'High', difficulty: 'High' },
      { name: '行为聚类与分类模型', desc: '將鼠標運動軌跡轉化為特徵向量，分類判斷是否符合已知 Selenium 指紋。', power: 'High', difficulty: 'High' },
      { name: '对抗样本检测', desc: '識別惡意仿造人類生理雜訊的對抗性軌跡，防範二代人機對抗。', power: 'Maximum', difficulty: 'High' },
      { name: '实时在线学习 (Online Learning)', desc: '在邊緣節點實時訓練輕量級神經網絡，自適應適應新爆發的爬蟲特徵。', power: 'Maximum', difficulty: 'High' },
      { name: '多模型集成 + 投票机制', desc: '運行規則引擎、孤立森林、指紋匹配等多維度子模型，綜合投票決策。', power: 'High', difficulty: 'High' },
      { name: '攻击样本库自动更新规则', desc: '被阻斷的異常流量封包自動提取特徵，自動重新生成網關篩選黑名單。', power: 'Maximum', difficulty: 'High' }
    ]
  },
  {
    id: 'honeypot',
    title: '9. 蜜罐与陷阱类 (Honeypot & Traps)',
    description: '向網頁注入專門引誘自動化爬蟲的陷阱，實施主動防禦。',
    methods: [
      { name: '隐藏表单字段 (Honeypot)', desc: '在 HTML 中加入隨機名稱且 CSS 隱藏的輸入框，Bot 自動填入即暴露。', power: 'Maximum', difficulty: 'Low' },
      { name: '隐藏链接 / 隐藏按钮', desc: '佈置隱蔽的超連結或提交按鈕，自動化蜘蛛程序解析並請求時直接封鎖。', power: 'Maximum', difficulty: 'Low' },
      { name: '陷阱 API 接口', desc: '在網頁代碼註釋或隱蔽腳本中宣告偽造的敏感接口，收集惡意掃描源。', power: 'High', difficulty: 'Medium' },
      { name: 'CSS 隐藏输入框', desc: '動態改變隱藏輸入框的位置，防止腳本爬蟲通過坐標檢測跳過。', power: 'Medium', difficulty: 'Low' },
      { name: '虚假错误提示', desc: '向疑似客戶端發送假錯誤，觀察自動化工具是否會繞過瀏覽器正常邏輯提交。', power: 'High', difficulty: 'Medium' }
    ]
  },
  {
    id: 'protocol',
    title: '10. 请求与协议分析类 (Request & Protocol)',
    description: '在傳輸層剖析 TCP/IP 數據包參數，保障請求協議一致性。',
    methods: [
      { name: '请求头完整性与顺序', desc: '核對客戶端發送的 Header 排序是否與其 User-Agent 聲明的瀏覽器 100% 吻合。', power: 'High', difficulty: 'Medium' },
      { name: '请求频率模式 (Leaky Bucket)', desc: '實施滾動窗口流控，精準計算單一 IP 對特定 API 的高頻微爆發。', power: 'High', difficulty: 'Low' },
      { name: 'Cookie / Storage 行为一致性', desc: '校驗客戶端 Cookie 的生命週期與 LocalStorage 變量的持久化讀寫。', power: 'Medium', difficulty: 'Low' },
      { name: 'Referer 与来源匹配', desc: '檢查 Referer 鏈路與 Origin 頭部的跳轉邏輯，預防 CSRF 與跨域群發。', power: 'Medium', difficulty: 'Low' },
      { name: '请求体结构异常检测', desc: '對 POST Payload 進行 JSON 鍵值排序與非標字符分析。', power: 'High', difficulty: 'Medium' }
    ]
  },
  {
    id: 'other',
    title: '11. 其他已知方法 (Other Advanced)',
    description: '業界最新防禦標準、Attestation 硬體驗證與瀏覽器底層 API 保護。',
    methods: [
      { name: '浏览器完整性检查 (Browser Integrity API)', desc: '調用 Chrome / Safari 的硬體安全證明 API，核實瀏覽器二進制文件未被修改。', power: 'High', difficulty: 'High' },
      { name: 'JavaScript 环境完整性检测', desc: '檢測 Object.prototype 等原生構造函數是否被 Proxy 代理重寫。', power: 'High', difficulty: 'High' },
      { name: '内存占用与性能指纹', desc: '檢測 JS 執行過程中的垃圾回收頻率與物理內存佔用抖動。', power: 'Medium', difficulty: 'High' },
      { name: 'CSS 动画行为分析', desc: '利用 requestAnimationFrame 校驗 CSS 動畫在可見視窗內的物理執行時長。', power: 'Medium', difficulty: 'Medium' },
      { name: 'SVG 渲染差异', desc: '繪製複雜 SVG 二維圖形，採集不同 OS 渲染引擎產生的細微像素偏差。', power: 'High', difficulty: 'Medium' },
      { name: 'Private Click Measurement 滥用检测', desc: '防範廣告歸因 API 被腳本機器人大量模擬點擊刷量。', power: 'Medium', difficulty: 'High' },
      { name: 'Federated Learning 信号 (联邦学习)', desc: '去中心化地聚合多端威脅模型，在不洩漏用戶隱私的前提下優化網關。', power: 'High', difficulty: 'High' },
      { name: '硬件安全密钥 (WebAuthn)', desc: '對高敏感度表單，調用物理 FaceID/TouchID 或 FIDO 安全鑰匙驗證。', power: 'Maximum', difficulty: 'High' }
    ]
  },
  {
    id: 'vitashield',
    title: '🛡️ VitaShield 专属创新方法 (Proprietary Innovations)',
    description: 'VitaShield 原創的差異化人機識別黑科技，專門阻擊高度擬真的人類鼠標與鍵盤輸入。',
    methods: [
      { name: '微抖动与人类噪声注入检测', desc: '實時採集坐標的小數點精度，識別並阻斷不含生理微抖動的完美 Bot 軌跡。', power: 'Maximum', difficulty: 'Medium' },
      { name: '操作“犹豫-确认”模式分析', desc: '追蹤「鼠標最後一次移動到點擊按鈕」的生理減速與停頓間隔，Bot 通常點擊無減速。', power: 'Maximum', difficulty: 'Medium' },
      { name: '多设备/多标签页关联行为检测', desc: '在不同標籤頁間追蹤同一客戶端行為鏈，捕獲並發填表作弊。', power: 'High', difficulty: 'High' },
      { name: '复制粘贴后的行为链检测', desc: '當複製粘貼後 < 350ms 即爆發提交且缺乏鼠標修正時，判定為機器人批量發帖。', power: 'High', difficulty: 'Low' },
      { name: '错误修正频率与模式 (Backspace Bonus)', desc: '真人輸入通常伴隨拼寫錯誤與 Backspace 退格修正，給予修錯行為安全加分。', power: 'Medium', difficulty: 'Low' },
      { name: '页面元素关注顺序熵分析', desc: '計算用戶點擊、懸停頁面各個元素（如 Text, Banner, Form）的焦線熵值。', power: 'High', difficulty: 'Medium' },
      { name: '时间节律分析 (昼夜节律)', desc: '建模分析用戶個體的晝夜活躍度曲線，檢測出偏離日常作息的突發操作。', power: 'Medium', difficulty: 'Medium' },
      { name: '“思考时间”动态建模', desc: '依據表單欄位數量與複雜度，動態建立物理合理的「填寫思考時間下限」。', power: 'High', difficulty: 'High' },
      { name: '行为与内容语义匹配度', desc: '檢測輸入長度與鼠標移動複雜度的比值，防止僅用腳本注入超長文本。', power: 'High', difficulty: 'High' },
      { name: '渐进式信任积累系统', desc: '新 IP/新設備需要透過連續多次良性提交，逐步在網關積累安全白名單等級。', power: 'High', difficulty: 'Medium' },
      { name: '攻击样本反向学习机制', desc: '捕獲被滑塊攔截的機器人特徵封包，反向自動優化 Risk Engine 的檢測閥值。', power: 'Maximum', difficulty: 'High' },
      { name: '混合人类-AI 验证', desc: '結合動態 AI 識別與多種冷門物理學 kinetics，保障數據通道安全。', power: 'High', difficulty: 'High' },
      { name: '微交互压力测试', desc: '對評估分處於臨界值（如 50-60 分）的用戶，實施隱形微交互考驗（如微幅劃動）。', power: 'Maximum', difficulty: 'Medium' }
    ]
  }
];

export const SystemSpecs: React.FC = () => {
  const [activeSpecTab, setActiveSpecTab] = useState<'blueprint' | 'supabase' | 'api' | 'matrix'>('blueprint');
  const [activeMatrixCategory, setActiveMatrixCategory] = useState<string>('behavioral');

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title} className="gradient-text">System Specifications & Architecture</h1>
          <p style={styles.subtitle}>VitaShield platform blueprints, database models, and commercial roadmap.</p>
        </div>
      </div>

      {/* Tabs Panel */}
      <div className="glass-panel" style={styles.tabsPanel}>
        <div style={styles.tabsWrapper}>
          <button 
            onClick={() => setActiveSpecTab('blueprint')} 
            style={{ ...styles.tabBtn, ...(activeSpecTab === 'blueprint' ? styles.tabBtnActive : {}) }}
          >
            5-Block Blueprint & Roadmap
          </button>
          <button 
            onClick={() => setActiveSpecTab('supabase')} 
            style={{ ...styles.tabBtn, ...(activeSpecTab === 'supabase' ? styles.tabBtnActive : {}) }}
          >
            Supabase Schemas
          </button>
          <button 
            onClick={() => setActiveSpecTab('api')} 
            style={{ ...styles.tabBtn, ...(activeSpecTab === 'api' ? styles.tabBtnActive : {}) }}
          >
            API & Trust Payload
          </button>
          <button 
            onClick={() => setActiveSpecTab('matrix')} 
            style={{ ...styles.tabBtn, ...(activeSpecTab === 'matrix' ? styles.tabBtnActive : {}) }}
          >
            Defense Methods Matrix
          </button>
        </div>

        {/* Tab 1: 5-Block Blueprint & Roadmap */}
        {activeSpecTab === 'blueprint' && (
          <div style={styles.specBody}>
            <h2 style={styles.specHeaderTitle}>Multi-Layer AI-Native Security Architecture</h2>
            <p style={styles.specDesc}>VitaShield separates security criteria across Product, Tech, Detection, Security, and Compliance.</p>

            <div style={styles.blueprintGrid}>
              <div style={styles.blueprintCard}>
                <div style={{ ...styles.blueprintHeader, color: 'var(--secondary)' }}>
                  <span style={styles.blueprintNum}>01</span>
                  <h4>Product Specs</h4>
                </div>
                <ul style={styles.specList}>
                  <li>Real-time Human/Bot/AI Agent detection</li>
                  <li>Real-Time Trust & Reputation Scoring</li>
                  <li>Allow / Challenge / Block gateway routing</li>
                  <li>Vanilla JS, React & Next.js SDKs</li>
                </ul>
              </div>

              <div style={styles.blueprintCard}>
                <div style={{ ...styles.blueprintHeader, color: 'var(--primary)' }}>
                  <span style={styles.blueprintNum}>02</span>
                  <h4>Technical Specs</h4>
                </div>
                <ul style={styles.specList}>
                  <li>API Gateway response latency &lt; 200ms</li>
                  <li>99.99% uptime guarantee (Status Page metrics)</li>
                  <li>Edge auto-scaling via Cloudflare Workers</li>
                  <li>Supabase multi-tenant DB replication</li>
                </ul>
              </div>

              <div style={styles.blueprintCard}>
                <div style={{ ...styles.blueprintHeader, color: 'var(--warning)' }}>
                  <span style={styles.blueprintNum}>03</span>
                  <h4>Detection Specs</h4>
                </div>
                <ul style={styles.specList}>
                  <li>Device Trust (browser, GPU, WebGL signatures)</li>
                  <li>Behavior Scan (mouse kinematics, typing cadence)</li>
                  <li>Network Rep (Proxy/VPN/Tor/ASN lookup)</li>
                  <li>AI Agent Detection (e.g. OpenAI Operator)</li>
                </ul>
              </div>

              <div style={styles.blueprintCard}>
                <div style={{ ...styles.blueprintHeader, color: 'var(--danger)' }}>
                  <span style={styles.blueprintNum}>04</span>
                  <h4>Security Specs</h4>
                </div>
                <ul style={styles.specList}>
                  <li>Cloudflare WAF rate-limiting filters</li>
                  <li>JWT Bearer token API authorization</li>
                  <li>Federated Fraud threat network feeds</li>
                  <li>Secure HTTPS TLS 1.3 socket paths</li>
                </ul>
              </div>
            </div>

            {/* Compliance Block */}
            <div style={styles.compliancePanel}>
              <div style={{ ...styles.blueprintHeader, color: 'var(--success)' }}>
                <span style={styles.blueprintNum}>05</span>
                <h4>Compliance & Privacy Specs (合规要求)</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                VitaShield 嚴格遵循全球最嚴格私隱法規，包括 <strong>GDPR (歐洲)</strong> 與 <strong>PDPA (馬來西亞)</strong>。
                系統採用「無 PII（個人識別資訊）」設計：動態 IP 地址在寫入數據庫前進行單向 Salted Hash 加密，且生物識別特徵僅於客戶端經由 Client SDK telemetries 生成哈希值比對，<strong>絕不上傳或保存任何用戶的原始人臉圖像或語音數據</strong>，保障最高規格的隱私合規性，同時滿足 <strong>SOC2</strong> 安全稽核要求。
              </p>
            </div>

            {/* Implementation Roadmap */}
            <div style={styles.roadmapBox}>
              <h3 style={styles.sectionTitle}>VitaShield Development Roadmap</h3>
              <div style={styles.roadmapGrid}>
                <div style={styles.roadmapCol}>
                  <div style={styles.roadmapHeader}>Phase 1 - MVP</div>
                  <ul style={styles.roadmapList}>
                    <li style={{ color: 'var(--success)' }}>✓ Verification API</li>
                    <li style={{ color: 'var(--success)' }}>✓ Security Dashboard</li>
                    <li style={{ color: 'var(--success)' }}>✓ Risk Engine 0-100</li>
                  </ul>
                </div>
                <div style={styles.roadmapCol}>
                  <div style={styles.roadmapHeader}>Phase 2 - Growth</div>
                  <ul style={styles.roadmapList}>
                    <li style={{ color: 'var(--secondary)' }}>→ JS/React/Next SDKs</li>
                    <li style={{ color: 'var(--secondary)' }}>→ Granular Filter Console</li>
                    <li style={{ color: 'var(--secondary)' }}>→ Analytics Logs Inspect</li>
                  </ul>
                </div>
                <div style={styles.roadmapCol}>
                  <div style={styles.roadmapHeader}>Phase 3 - Enterprise</div>
                  <ul style={styles.roadmapList}>
                    <li>✦ Rules Customization Engine</li>
                    <li>✦ Federated Threat Network</li>
                    <li>✦ OpenAI Operator Agent Detection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Supabase Schema Details */}
        {activeSpecTab === 'supabase' && (
          <div style={styles.specBody}>
            <h2 style={styles.specHeaderTitle}>Supabase Relational Database Engine Schemas</h2>
            <p style={styles.specDesc}>Multi-tenant relational database structure for storing active sessions, audits, and threat heuristics in Supabase.</p>

            <div style={styles.dbGrid}>
              <div style={styles.dbTableCard}>
                <h4 style={styles.dbTableName}>Table: <code>sessions</code></h4>
                <p style={styles.dbTableDesc}>Stores transaction session headers and overall challenge resolution status.</p>
                <table style={styles.schemaTable}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Column</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Attributes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={styles.tdCode}>id</td>
                      <td style={styles.td}>UUID</td>
                      <td style={styles.tdMuted}>PRIMARY KEY</td>
                    </tr>
                    <tr>
                      <td style={styles.tdCode}>tenant_id</td>
                      <td style={styles.td}>UUID</td>
                      <td style={styles.tdMuted}>FOREIGN KEY (Multi-tenant)</td>
                    </tr>
                    <tr>
                      <td style={styles.tdCode}>created_at</td>
                      <td style={styles.td}>TIMESTAMP</td>
                      <td style={styles.tdMuted}>DEFAULT NOW()</td>
                    </tr>
                    <tr>
                      <td style={styles.tdCode}>status</td>
                      <td style={styles.td}>VARCHAR</td>
                      <td style={styles.tdMuted}>active / solved / blocked</td>
                    </tr>
                    <tr>
                      <td style={styles.tdCode}>client_ip</td>
                      <td style={styles.td}>VARCHAR</td>
                      <td style={styles.tdMuted}>Salted Hashed IP (GDPR)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={styles.dbTableCard}>
                <h4 style={styles.dbTableName}>Table: <code>telemetry_logs</code></h4>
                <p style={styles.dbTableDesc}>Stores detailed hardware device fingerprints and behavior kinetic variables.</p>
                <table style={styles.schemaTable}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Column</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Attributes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={styles.tdCode}>id</td>
                      <td style={styles.td}>UUID</td>
                      <td style={styles.tdMuted}>PRIMARY KEY</td>
                    </tr>
                    <tr>
                      <td style={styles.tdCode}>session_id</td>
                      <td style={styles.td}>UUID</td>
                      <td style={styles.tdMuted}>FOREIGN KEY REFERENCES sessions</td>
                    </tr>
                    <tr>
                      <td style={styles.tdCode}>risk_score</td>
                      <td style={styles.td}>INT</td>
                      <td style={styles.tdMuted}>0 - 100 Scoring Index</td>
                    </tr>
                    <tr>
                      <td style={styles.tdCode}>device_fingerprint</td>
                      <td style={styles.td}>JSONB</td>
                      <td style={styles.tdMuted}>GPU, Canvas, Screen details</td>
                    </tr>
                    <tr>
                      <td style={styles.tdCode}>behavior_metrics</td>
                      <td style={styles.td}>JSONB</td>
                      <td style={styles.tdMuted}>Mouse coords, click intervals</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: API & Trust Payload */}
        {activeSpecTab === 'api' && (
          <div style={styles.specBody}>
            <h2 style={styles.specHeaderTitle}>Edge Gateway API & Advanced Trust Payload Schema</h2>
            <p style={styles.specDesc}>Developers verify verification tokens via backend server calls. Response includes our advanced **Trust & Reputation Layer** and **AI Agent Detection** metrics.</p>

            <div style={styles.apiBox}>
              <div style={styles.apiEndpointRow}>
                <span style={styles.apiMethod}>POST</span>
                <span style={styles.apiPath}>/v1/verify</span>
                <span style={styles.apiLabel}>Verify Transaction Token</span>
              </div>
              <div style={styles.apiCodeBlock}>
                <strong>Request Headers:</strong>
                <pre style={styles.preCode}>
{`Authorization: Bearer vms_sec_live_9c0f73b...
Content-Type: application/json`}
                </pre>
                <strong>JSON Response Payload:</strong>
                <pre style={styles.preCode}>
{`{
  "success": true,
  "human_score": 92,
  "risk_level": "low",
  "decision": "allow",
  
  "trust_and_reputation": {
    "trust_score": 94,
    "reputation": "excellent",
    "device_integrity": "verified_device"
  },
  
  "ai_agent_detection": {
    "is_ai_agent": false,
    "agent_type": "none",
    "automation_likelihood": 0.02,
    "signatures": {
      "openai_operator_detected": false,
      "headless_browser_flagged": false
    }
  },
  
  "verified_at": "${new Date().toISOString()}"
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Defense Methods Matrix */}
        {activeSpecTab === 'matrix' && (
          <div style={styles.specBody}>
            <h2 style={styles.specHeaderTitle}>人机校验算法与防御方法矩阵 (Defense Methods Matrix)</h2>
            <p style={styles.specDesc}>
              VitaShield 汇集了全球安全行业已知的所有常规防范机制、偏门检测维度，以及我们原创设计的专属 kinetics 生理特征防御算法。
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', marginTop: '1.5rem', alignItems: 'start' }}>
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
          </div>
        )}
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
  tabsPanel: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem'
  },
  tabsWrapper: {
    display: 'flex',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    gap: '0.5rem',
    overflowX: 'auto'
  },
  tabBtn: {
    padding: '0.85rem 1.25rem',
    background: 'transparent',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    borderBottom: '2.5px solid transparent',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  },
  tabBtnActive: {
    color: 'var(--secondary)',
    borderBottomColor: 'var(--secondary)',
    background: 'rgba(6, 182, 212, 0.03)'
  },
  specBody: {
    animation: 'slide-up 0.3s ease'
  },
  specHeaderTitle: {
    fontSize: '1.25rem',
    fontWeight: '750',
    color: '#fff',
    letterSpacing: '-0.02em',
    marginBottom: '0.25rem'
  },
  specDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginBottom: '1.5rem'
  },
  blueprintGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
    marginBottom: '1.5rem'
  },
  blueprintCard: {
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  blueprintHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    paddingBottom: '0.65rem'
  },
  blueprintNum: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9rem',
    fontWeight: '750',
    opacity: 0.6
  },
  specList: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    paddingLeft: '0.25rem'
  },
  compliancePanel: {
    background: 'rgba(16, 185, 129, 0.02)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1rem'
  },
  roadmapBox: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginTop: '1.5rem'
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '1rem'
  },
  roadmapGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.25rem'
  },
  roadmapCol: {
    background: 'rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    padding: '1rem'
  },
  roadmapHeader: {
    fontSize: '0.88rem',
    fontWeight: '700',
    color: 'var(--secondary)',
    marginBottom: '0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    paddingBottom: '0.4rem'
  },
  roadmapList: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: 'var(--text-muted)'
  },
  dbGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    alignItems: 'start'
  },
  dbTableCard: {
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.5rem'
  },
  dbTableName: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--secondary)'
  },
  dbTableDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginTop: '0.2rem',
    marginBottom: '1.25rem'
  },
  schemaTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.82rem',
    textAlign: 'left'
  },
  th: {
    padding: '0.5rem 0.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-dark)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  td: {
    padding: '0.65rem 0.25rem',
    color: 'var(--text-main)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
  },
  tdCode: {
    padding: '0.65rem 0.25rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--primary)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
  },
  tdMuted: {
    padding: '0.65rem 0.25rem',
    color: 'var(--text-dark)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
  },
  apiBox: {
    background: '#04060b',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  apiEndpointRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.85rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
  },
  apiMethod: {
    fontSize: '0.72rem',
    fontWeight: '800',
    background: 'var(--secondary)',
    color: '#000',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px'
  },
  apiPath: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    color: '#fff',
    fontWeight: '600'
  },
  apiLabel: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginLeft: 'auto'
  },
  apiCodeBlock: {
    padding: '1.25rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.78rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  preCode: {
    color: '#e2e8f0',
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.02)',
    overflowX: 'auto',
    marginBottom: '0.75rem'
  },
  calcContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    alignItems: 'center'
  },
  calcLeftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    marginTop: '0.5rem'
  },
  volumeDisplay: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.92rem',
    fontWeight: '700',
    color: 'var(--secondary)',
    width: '130px',
    textAlign: 'right'
  },
  presetButtonsRow: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
    flexWrap: 'wrap'
  },
  calcIndustryBtn: {
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border-color)',
    padding: '0.55rem 0.85rem',
    fontSize: '0.78rem',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    transition: 'all 0.2s ease'
  },
  calcIndustryBtnActive: {
    background: 'var(--secondary-glow)',
    borderColor: 'var(--secondary)',
    color: '#fff'
  },
  calcRightCol: {},
  quoteCard: {
    background: 'radial-gradient(circle at 100% 0%, rgba(6, 182, 212, 0.08) 0%, transparent 60%), rgba(13, 20, 35, 0.5)',
    border: '1px solid var(--border-color-glow)',
    boxShadow: 'var(--glow-shadow)',
    borderRadius: '16px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  quoteSub: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: 'var(--text-dark)',
    fontWeight: '750',
    letterSpacing: '0.08em'
  },
  quoteTierTitle: {
    fontSize: '1.5rem',
    color: '#fff',
    marginTop: '0.25rem',
    marginBottom: '0.75rem'
  },
  quotePrice: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    color: 'var(--secondary)',
    marginBottom: '1rem'
  },
  currencySymbol: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginTop: '0.25rem',
    marginRight: '0.1rem'
  },
  priceNum: {
    fontSize: '3rem',
    fontWeight: '800',
    lineHeight: '1',
    letterSpacing: '-0.04em'
  },
  pricePeriod: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    marginLeft: '0.25rem',
    alignSelf: 'flex-end',
    marginBottom: '0.25rem'
  },
  quoteDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: '1.45',
    marginBottom: '1.5rem',
    maxWidth: '280px'
  },
  quoteSlaBox: {
    width: '100%',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.78rem'
  },
  slaItem: {
    display: 'flex',
    justifyContent: 'space-between',
    color: 'var(--text-muted)'
  }
};
