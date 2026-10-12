// ==========================================
// 1. Mandi Widget Configuration
// ==========================================
const MANDI_API_KEY = "579b464db66ecb3875b39ed9319231f2"; // <--- Ikkada mee API key unchandi
const GOVT_API_URL = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${MANDI_API_KEY}&format=json&filters[state]=Telangana`;

// ==========================================
// 2. Data Fetching with Smart Auto-Fallback
// ==========================================
async function fetchMandiData() {
  // 1st Priority: Live Govt API call
  try {
    const liveResponse = await fetch(GOVT_API_URL, { signal: AbortSignal.timeout(4000) });
    if (liveResponse.ok) {
      const liveData = await liveResponse.json();
      const records = liveData.records || [];
      if (records.length > 0) {
        return { source: "Live Govt Server", isLive: true, records: records };
      }
    }
  } catch (err) {
    console.warn("Govt API timeout leda CORS issue vachindi. Fallback json vaaduthunnam...", err);
  }

  // 2nd Priority (Fallback): Local mandi_live.json file
  try {
    const localResponse = await fetch("mandi_live.json?v=" + new Date().getTime());
    if (localResponse.ok) {
      const localData = await localResponse.json();
      const backupRecords = Array.isArray(localData) ? localData : (localData.records || []);
      return { source: "Saved Backup", isLive: false, records: backupRecords };
    }
  } catch (err) {
    console.error("Local mandi_live.json kooda fetch kaledhu:", err);
  }

  return { source: "None", isLive: false, records: [] };
}

// ==========================================
// 3. Render Widget (Standardised Naming)
// ==========================================
window.renderMandiWidget = async function() {
  const container = document.getElementById("mandi-container");
  if (!container) return;

  // Loading state
  container.innerHTML = `
    <div style="background: #ffffff; border: 1.5px solid #2e7d32; border-radius: 8px; padding: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.06);">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; color: #1b5e20; font-size: 14px; font-weight: 700;">🌾 మార్కెట్ / మండి లైవ్ ధరలు</h3>
        <span style="font-size: 10px; background: #fff3e0; color: #e65100; padding: 2px 6px; border-radius: 10px; font-weight: 600;">కనెక్ట్ అవుతోంది...</span>
      </div>
      <div style="font-size: 11px; color: #666; margin-top: 6px;">తాజా ధరల డేటా పరిశీలిస్తోంది...</div>
    </div>
  `;

  const result = await fetchMandiData();
  const records = result.records;

  if (records.length === 0) {
    container.innerHTML = `
      <div style="background: #ffffff; border: 1.5px solid #2e7d32; border-radius: 8px; padding: 10px;">
        <h3 style="margin: 0; color: #1b5e20; font-size: 14px;">🌾 మార్కెట్ / మండి లైవ్ ధరలు</h3>
        <p style="font-size: 11px; color: #c62828; margin-top: 6px;">ప్రస్తుతం ధరల సమాచారం అందుబాటులో లేదు. mandi_live.json చెక్ చేయండి.</p>
      </div>
    `;
    return;
  }

  // Rows mapping
  const rowsHtml = records.slice(0, 5).map(item => `
    <tr style="border-bottom: 1px solid #eee; font-size: 11px;">
      <td style="padding: 6px 4px; font-weight: 600; color: #333;">${item.commodity || item.Commodity || "పంట"}</td>
      <td style="padding: 6px 4px; color: #555;">${item.market || item.Market || "మార్కెట్"}</td>
      <td style="padding: 6px 4px; font-weight: 700; color: #2e7d32; text-align: right;">₹${item.modal_price || item.Modal_Price || item.price || "N/A"}</td>
    </tr>
  `).join("");

  const badgeColor = result.isLive ? "#2e7d32" : "#b78103";
  const badgeBg = result.isLive ? "#e8f5e9" : "#fffde7";
  const badgeText = result.isLive ? "🟢 Live Server" : "🟡 Saved Backup";

  container.innerHTML = `
    <div style="background: #ffffff; border: 1.5px solid #2e7d32; border-radius: 8px; padding: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.06);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h3 style="margin: 0; color: #1b5e20; font-size: 14px; font-weight: 700;">🌾 మార్కెట్ / మండి లైవ్ ధరలు</h3>
        <span style="font-size: 10px; background: ${badgeBg}; color: ${badgeColor}; padding: 2px 6px; border-radius: 10px; font-weight: 600;">${badgeText}</span>
      </div>

      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background: #f1f8e9; font-size: 11px; color: #1b5e20;">
            <th style="padding: 4px;">పంట</th>
            <th style="padding: 4px;">మార్కెట్</th>
            <th style="padding: 4px; text-align: right;">ధర (క్వింటాల్)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
};
