const fs = require('fs');
const path = 'src/components/SystemSpecs.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Replace the compliance panel text
const oldCompliance = `            {/* Compliance Block */}
            <div style={styles.compliancePanel}>
              <div style={{ ...styles.blueprintHeader, color: 'var(--success)' }}>
                <span style={styles.blueprintNum}>05</span>
                <h4>Compliance & Privacy Specs (合规要求)</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                VitaShield 嚴格遵循全球最嚴格私隱法規，包括 <strong>GDPR (歐洲)</strong> 與 <strong>PDPA (馬來西亞)</strong>。
                系統採用「無 PII（個人識別資訊）」設計：動態 IP 地址在寫入數據庫前進行單向 Salted Hash 加密，且生物識別特徵僅於客戶端經由 Client SDK telemetries 生成哈希值比對，<strong>絕不上傳或保存任何用戶的原始人臉圖像或語音數據</strong>，保障最高規格的隱私合規性，同時滿足 <strong>SOC2</strong> 安全稽核要求。
              </p>
            </div>`;

const newCompliance = `            {/* Compliance Block */}
            <div style={styles.compliancePanel}>
              <div style={{ ...styles.blueprintHeader, color: 'var(--success)' }}>
                <span style={styles.blueprintNum}>05</span>
                <h4>Compliance & Privacy Specs</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                VitaShield strictly complies with global data privacy frameworks including <strong>GDPR (Europe)</strong> and <strong>PDPA (Malaysia)</strong>.
                The system is engineered with a Zero-PII architecture: dynamic IP addresses are cryptographically hashed (one-way salted hashes) prior to ingestion. Biometric heuristics are evaluated entirely on the client-side inside our sandboxed SDK, <strong>never uploading or saving raw facial images or voice cadences to our servers</strong>. This ensures compliance with enterprise security requirements, aligning with <strong>SOC2 Type II</strong> auditing standards.
              </p>
            </div>`;

if (content.includes('GDPR (歐洲)')) {
  // We locate the start and end of the block manually to be safe against spaces
  const start = content.indexOf('{/* Compliance Block */}');
  const end = content.indexOf('</div>', start + 100);
  const realEnd = content.indexOf('</div>', end + 50); // inner div and outer div
  const compliancePart = content.substring(start, realEnd + 6);
  content = content.replace(compliancePart, newCompliance);
  console.log('Compliance block replaced!');
} else {
  console.log('Compliance block already translated or not found!');
}

// 2. Replace the matrix header and description
const oldMatrixTitle = `<h2 style={styles.specHeaderTitle}>人机校验算法与防御方法矩阵 (Defense Methods Matrix)</h2>`;
const oldMatrixDesc = `VitaShield 汇集了全球安全行业已知的所有常规防范机制、偏门检测维度，以及我们原创设计的专属 kinetics 生理特征防御算法。`;

content = content.replace('人机校验算法与防御方法矩阵 (Defense Methods Matrix)', 'Defense Methods Matrix');
content = content.replace('VitaShield 汇集了全球安全行业已知的所有常规防范机制、偏门检测维度，以及我们原创设计的专属 kinetics 生理特征防御算法。', 'VitaShield aggregates all industry-standard verification mechanisms alongside our proprietary biological kinetics behavioral checks.');

fs.writeFileSync(path, content, 'utf8');
console.log('Finished updating SystemSpecs.tsx!');
