# 🛡️ VitaShield: AI-Native Human Verification & Anti-Bot Infrastructure

[English](#english-version) | [中文版](#中文版本)

---

## 中文版本

**VitaShield** 是由 **VitaMind AI** 團隊研發的企業級、AI 原生人機驗證與反自動化爬蟲防禦系統。旨在為 B2B SaaS、Web3 應用以及 API 網關提供高效、零干擾、隱私友好的防禦方案，有效遏制憑證撞庫、接口惡意刷單、數據爬取以及高級 AI 代理 (AI Operators) 的濫用。

### 🌟 當前版本已實現功能 (Currently Implemented)

*   **行為生物遙測探針**：前端 SDK 靜默採集滑鼠移動坐標、打字延遲規律、退格修正動作、剪貼簿粘貼頻率，以及 WebGL GPU 驅動特徵等指紋特徵。
*   **多維風險引擎 (Risk Engine v2)**：後台模組化評分算法（包含軌跡直線度檢測、速度方差檢測、打字均勻度分析、提交停留時長檢測），輸出 0-100 的 Risk/Trust 分數。
*   **漸進式無感挑戰**：對正常人類實現 95% 以上零干擾隱身通過；僅在識別到可疑行為（如無滑鼠移動、常數打字間隔等）時，自動升級為前端滑塊 Captcha 挑戰。
*   **複製貼上後行為鏈檢測**：特徵化識別撞庫機器人「填充文字後瞬間（<350ms）提交且無滑鼠軌跡」的特徵，精準阻斷。
*   **操作猶豫期（Deceleration Pause）分析**：分析最後一次滑鼠移動與按鈕點擊間的生理減速停頓，攔截機器人無減速的模擬點擊。
*   **自定義 widget 主題配置**：支持通過 `data-theme-primary`、`data-theme-bg`、`data-theme-text` 屬性動態同步網頁配色；後台提供可視化色彩配置面板與代碼生成器。
*   **實時人機體驗沙盒 (Live Sandbox)**：Landing Page 提供實時對接沙盒，可直觀查看自身操作的直線度比率、按鍵標準差，以及觸發的行為 flag。
*   **自動化機器人模擬測試腳本 (`scripts/test-bot.js`)**：提供一鍵化測試指令，自動模擬真人曲線 vs WebDriver 機械動作與無頭 VM 爬蟲，以驗證引擎精度。

### 🗺️ 規劃中與未來路線圖 (Future Roadmap)

*   **動態 PoW 難度自動調校**：在高頻流量攻擊下，自動調整 Proof-of-Work 客戶端算力難度，增加機器人攻擊成本。
*   **WebAuthn 硬件安全密鑰集成**：對高風險操作引入 YubiKey/TouchID 等物理硬件級驗證。
*   **實時在線機器人學習與聚類分類 (Online Autoencoder)**：動態更新人機分類模型，自動學習新型自動化框架行為。
*   **反向檢測 API 陷阱與誘餌 (Honeypot Traps)**：在 DOM 中注入視覺隱形的蜜罐字段與誘餌 API，引誘爬蟲主動暴露特徵。

---

### 🚀 2分鐘快速集成指南

#### 1. 前端 SDK 接入 (Script Tag)
在您的 HTML 頁面中引入 VitaShield 防禦腳本，並在表單 (Form) 內放置對應的 Widget 容器：

```html
<!-- 1. 引入防禦 SDK -->
<script src="https://vitashield.sleepsomno.com/widget.js" defer></script>

<!-- 2. 在表單內放置驗證容器 -->
<form id="login-form" action="/login" method="POST">
  <input type="email" name="email" required />
  <input type="password" name="password" required />
  
  <!-- VitaShield 隱形防禦 Widget -->
  <div id="vitashield-widget" 
       data-sitekey="vms_pub_live_79a2b8e3df9102ca"
       data-theme-primary="#00f2fe"></div>
  
  <button type="submit">Sign In</button>
</form>
```
*SDK 將在表單提交時自動採集遙測數據，並注入隱藏輸入框 `<input type="hidden" name="vms-shield-token" />`。*

#### 2. 後端驗證 API (POST /api/verify)
當您的伺服器接收到表單請求時，將收到的 `vms-shield-token` 發送到 VitaShield API 進行二次校驗：

> **提示**：`/v1/verify` 也可作為別名使用，兩者等效。

*   **請求端點**：`POST https://vitashield.sleepsomno.com/api/verify`
*   **請求 Body**：
    ```json
    {
      "secret": "vms_sec_live_9c0f73b18274d8a21f7c",
      "token": "vmt_live_token_base64_telemetry_here",
      "ip": "203.0.113.195"
    }
    ```
*   **響應 JSON**：
    ```json
    {
      "success": true,
      "decision": "allow",
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
      }
    }
    ```

---

## English Version

**VitaShield** is an enterprise-grade, AI-native human verification and anti-bot defense infrastructure developed by **VitaMind AI**. Engineered for B2B SaaS, Web3 apps, and API gateways, VitaShield blocks automated script attacks, scraping networks, credential stuffing, and advanced AI Operators with invisible client telemetry.

### 🌟 Currently Implemented Features

*   **Invisible Telemetry Sensors**: Captures mouse curves, sub-pixel coordinate floats, keypress delays, text revision (backspaces), copy-paste timing offsets, and WebGL virtualized GPU profiles.
*   **Modular Risk Engine (Risk Engine v2)**: Evaluates kinetic gestures on the server side using `SignalAnalyzer` and `ScoreCalculator`, generating real-time Risk and Trust scores.
*   **Progressive Challenge Loops**: Triggers visual slider captures ONLY when suspicious bot kinetics are flagged. Seamless pass-through for 95%+ of human users.
*   **Credential Stuffing Paste-Submit Protection**: Detects automated stuffing scripts by checking if form submission occurs within 350ms of a copy-paste event with zero cursor motion.
*   **Hesitation Pause Evaluator**: Flags machine-speed click executions (less than 25ms delay after moving) that bypass biological muscle deceleration curves.
*   **Dynamic Theme Builder**: Exposes color-picking settings that output custom themes (`data-theme-primary`, `data-theme-bg`, `data-theme-text`) read directly by frontend widget runtimes.
*   **Live Landing Sandbox Console**: Includes an interactive demo form on the public landing page to inspect and output your own real-time gesture straightness, typing deviations, and scoring flags.
*   **Local Bot Simulator Script (`scripts/test-bot.js`)**: Executable simulation test suite evaluating human vs automated webdriver bot vs headless VM crawler profiles.

### 🗺️ Future Roadmap / In Progress

*   **Proof-of-Work Puzzle Scaling**: Automatic scaling of client-side PoW math challenges under high Edge CDN traffic volume.
*   **Hardware Token Validation**: WebAuthn biometric security and physical security key (YubiKey) gateway validations for high-threat operations.
*   **Real-time Online Machine Learning (Online Autoencoder)**: Dynamically cluster client telemetry packets on edge servers to detect novel browser automation packages.
*   **Active Honeypot Traps**: Invisible form parameters and decoy API targets to trick automated crawlers into identifying themselves.

---

### 🚀 Quick Start Integration

#### 1. Frontend SDK Embed
Include the defense script in your HTML and place the verification target div inside your form:

```html
<!-- Include SDK -->
<script src="https://vitashield.sleepsomno.com/widget.js" defer></script>

<!-- Place verification placeholder inside form -->
<form id="signup-form" action="/register" method="POST">
  <div id="vitashield-widget" 
       data-sitekey="vms_pub_live_79a2b8e3df9102ca"
       data-theme-primary="#00f2fe"></div>
  <button type="submit">Submit</button>
</form>
```

#### 2. Backend Verification (POST /api/verify)
Send the token submitted by the form (`vms-shield-token`) to the verification API:

*   **Endpoint**: `POST https://vitashield.sleepsomno.com/api/verify`
*   **Payload**:
    ```json
    {
      "secret": "vms_sec_live_your_private_secret_key",
      "token": "base64_telemetry_token_submitted_by_form",
      "ip": "203.0.113.195"
    }
    ```
*   **Response**:
    ```json
    {
      "success": true,
      "decision": "allow",
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
      }
    }
    ```

---

## 📂 Project Modules

*   `/api/verify.ts`: Serverless Node.js verify api parsing browser details and writing to database.
*   `/public/widget.js`: High-fidelity SDK script collecting coordinates and rendering sliders.
*   `/src/components/Dashboard.tsx`: Live multitenant console displaying logs and active metrics.
