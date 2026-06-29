# 🛡️ VitaShield: AI-Native Human Verification & Anti-Bot Infrastructure

[English](#english-version) | [中文版](#中文版本)

---

## 中文版本

**VitaShield** 是由 **VitaMind AI** 團隊研發的企業級、AI 原生人機驗證與反自動化爬蟲防禦系統。旨在為 B2B SaaS、Web3 應用以及 API 網關提供高效、零干擾、隱私友好的防禦方案，有效遏制憑證撞庫、接口惡意刷單、數據爬取以及高級 AI 代理 (AI Operators) 的濫用。

### 🌟 核心設計理念與差異化優勢

*   **無感行為遙測 (Invisible Telemetry)**：預設情況下完全不打擾正常人類。在後台靜默分析設備特徵與操作速度，無需用戶進行任何點選或圖片對齊，實現 95% 以上人類零等待通過。
*   **漸進式挑戰驗證 (Progressive Challenges)**：只有當後端評估到異常（如直線軌跡、常數速度打字、提交速度小於 450ms）時，才會在前端動態升級為滑塊 (Slider) 或 Proof-of-Work (PoW) 算力碰撞挑戰。
*   **AI 代理特定識別 (AI Agent Detection)**：專門針對 Puppeteer, Playwright, Selenium 以及 OpenAI Operator 等高級自動化 AI 代理進行行為與特徵交叉指紋校驗，精準識別機器人。
*   **開發者優先 (Developer DX)**：極簡對接。前端一行程式碼嵌入，後端一個 API 即可完成校驗，內建多租戶帳號隔離與對 sleepsomno.com 的統一 SSO 登入支持。

---

### ⚙️ 核心數學與安全檢測演算法 (Risk Engine v2)

VitaShield 的後端評分引擎 (`/api/verify.ts`) 使用三維度（Risk、Trust、Reputation）算法進行綜合打分：

1.  **滑鼠直線軌跡分析 (Linearity Checks)**：計算實際滑鼠軌跡長度與兩點間直線距離的比值。比值低於 `1.025` 則判定為完美的機械直線軌跡，標記為 `perfectly_straight_mouse_trajectory`。
2.  **加速度變異數分析 (Velocity Variance Checks)**：正常人類操作滑鼠有加速和減速的生理規律，而 Bot 腳本多為勻速前進。如果速度方差 `< 0.015` 且有速度，標記為 `zero_mouse_acceleration_variance`。
3.  **打字節奏方差分析 (Keystroke Cadence Variance)**：收集相鄰按鍵時間差，如果標準差 `< 8ms`，標記為 `perfectly_uniform_keystroke_cadence`（判定為腳本定時模擬打字）。
4.  **超速提交限流 (Speed Limit)**：頁面載入到表單提交時間小於 `450ms` 時，標記為 `sub_500ms_form_submission_speed` 並強制阻斷。

---

### 🚀 2分鐘快速集成指南

#### 1. 前端 SDK 接入 (Script Tag)
在您的 HTML 頁面中引入 VitaShield 防禦腳本，並在表單 (Form) 內放置對應的 Widget 容器：

```html
<!-- 1. 引入防禦 SDK -->
<script src="https://cdn.vitashield.sleepsomno.com/widget.js" defer></script>

<!-- 2. 在表單內放置驗證容器 -->
<form id="login-form" action="/login" method="POST">
  <input type="email" name="email" required />
  <input type="password" name="password" required />
  
  <!-- VitaShield 隱形防禦 Widget -->
  <div id="vitashield-widget" data-sitekey="vms_pub_live_79a2b8e3df9102ca"></div>
  
  <button type="submit">Sign In</button>
</form>
```
*SDK 將在表單提交時自動採集遙測數據，並注入隱藏輸入框 `<input type="hidden" name="vms-shield-token" />`。*

#### 2. 後端驗證 API (POST /v1/verify)
當您的伺服器接收到表單請求時，將收到的 `vms-shield-token` 發送到 VitaShield API 進行二次校驗：

*   **請求端點**：`POST https://api.vitashield.sleepsomno.com/v1/verify`
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

### 🌟 Core Differentiation

*   **Invisible Telemetry**: Completely unobtrusive. Analyzes kinetic gestures and hardware signatures silently in the background. Over 95% of real humans pass instantly without clicking anything.
*   **Progressive Challenge Loops**: Triggers interactive slider puzzles or client-side cryptographic Proof-of-Work (PoW) computation ONLY when suspicious bot-like behavior is mathematically flagged.
*   **AI Agent & Automation Profiling**: Advanced browser-runtime checking to detect Puppeteer, Playwright, Selenium, and OpenAI Operator agents.
*   **SSO Ready**: Built-in support for single sign-on (SSO) and shared root-domain sessions mapped to the `sleepsomno.com` ecosystem.

---

### 🚀 Quick Start Integration

#### 1. Frontend SDK Embed
Include the defense script in your HTML and place the verification target div inside your form:

```html
<!-- Include SDK -->
<script src="https://cdn.vitashield.sleepsomno.com/widget.js" defer></script>

<!-- Place verification placeholder inside form -->
<form id="signup-form" action="/register" method="POST">
  <div id="vitashield-widget" data-sitekey="vms_pub_live_79a2b8e3df9102ca"></div>
  <button type="submit">Submit</button>
</form>
```

#### 2. Backend Verification (POST /v1/verify)
Send the token submitted by the form (`vms-shield-token`) to the verification API:

*   **Endpoint**: `POST https://api.vitashield.sleepsomno.com/v1/verify`
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
