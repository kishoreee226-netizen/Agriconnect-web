// mandi.js - Official Live Agmarknet Mandi Rates Service

const MANDI_CONFIG = {
  // కేంద్ర ప్రభుత్వ పోర్టల్ నుండి పొందిన వర్కింగ్ API Key & Resource ID
  apiKey: "579b464db66ec23bdd0000012873d6e8fa3847a564325d817ed2b023",
  resourceId: "9ef84268-d588-465a-a308-a864a43d0070",
  limit: 50
};

/**
 * 1. క్లయింట్-సైడ్ డైరెక్ట్ API కాల్ ఫంక్షన్
 * భవిష్యత్తులో మొబైల్ యాప్‌లో కూడా ఈ ఫంక్షన్‌ను నేరుగా వాడుకోవచ్చు.
 */
async function getLiveMandiPrices() {
    const targetUrl = `https://api.data.gov.in/resource/${MANDI_CONFIG.resourceId}?api-key=${MANDI_CONFIG.apiKey}&format=json&limit=${MANDI_CONFIG.limit}`;
      const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;


  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`సర్వర్ ఎర్రర్: HTTP ${response.status}`);
    }
    const data = await response.json();
    return {
      status: "success",
      records: data.records || []
    };
  } catch (error) {
    console.error("Mandi API Fetch Error:", error);
    return {
      status: "error",
      message: error.message,
      records: []
    };
  }
}

/**
 * 2. వెబ్‌సైట్ పేజీలో లైవ్ రేట్లను టేబుల్ రూపంలో డిస్‌ప్లే చేసే ఫంక్షన్
 * @param {string} containerId - డేటా కనిపించాల్సిన HTML div ఐడీ
 */
async function renderMandiTable(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // డేటా లోడ్ అవుతున్నప్పుడు యూజర్‌కు చూపే మెసేజ్
  container.innerHTML = `
    <div style="padding: 15px; font-family: sans-serif; color: #555;">
      ⏳ తాజా ప్రభుత్వ మార్కెట్ ధరలు లోడ్ అవుతున్నాయి...
    </div>
  `;

  const result = await getLiveMandiPrices();

  // ఒకవేళ డేటా రాకపోతే
  if (result.status === "error" || result.records.length === 0) {
    container.innerHTML = `
      <div style="padding: 15px; color: #d32f2f; font-family: sans-serif;">
        ⚠️ లైవ్ మార్కెట్ డేటా ప్రస్తుతానికి అందుబాటులో లేదు (${result.message || 'నో రికార్డ్స్'}). దయచేసి కాసేపటి తర్వాత ప్రయత్నించండి.
      </div>
    `;
    return;
  }

  // రికార్డులతో కూడిన టేబుల్ నిర్మాణం
  let tableHtml = `
    <div style="overflow-x: auto; font-family: sans-serif;">
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
        <thead>
          <tr style="background-color: #2e7d32; color: #ffffff;">
            <th style="padding: 10px; border: 1px solid #ddd;">రాష్ట్రం (State)</th>
            <th style="padding: 10px; border: 1px solid #ddd;">జిల్లా (District)</th>
            <th style="padding: 10px; border: 1px solid #ddd;">మార్కెట్ (Market)</th>
            <th style="padding: 10px; border: 1px solid #ddd;">పంట (Commodity)</th>
            <th style="padding: 10px; border: 1px solid #ddd;">రకం (Variety)</th>
            <th style="padding: 10px; border: 1px solid #ddd;">మోడల్ ధర (₹/క్వింటాల్)</th>
          </tr>
        </thead>
        <tbody>
  `;

  result.records.forEach((item, index) => {
    const rowBg = index % 2 === 0 ? "#ffffff" : "#f9f9f9";
    tableHtml += `
      <tr style="background-color: ${rowBg};">
        <td style="padding: 8px 10px; border: 1px solid #ddd;">${item.state || '-'}</td>
        <td style="padding: 8px 10px; border: 1px solid #ddd;">${item.district || '-'}</td>
        <td style="padding: 8px 10px; border: 1px solid #ddd;">${item.market || '-'}</td>
        <td style="padding: 8px 10px; border: 1px solid #ddd;"><strong>${item.commodity || '-'}</strong></td>
        <td style="padding: 8px 10px; border: 1px solid #ddd;">${item.variety || '-'}</td>
        <td style="padding: 8px 10px; border: 1px solid #ddd; color: #1b5e20;"><strong>₹${item.modal_price || '-'}</strong></td>
      </tr>
    `;
  });

  tableHtml += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = tableHtml;
}
// mandi.js ఫైల్ చివరలో ఇది పెడితే పేజీ ఓపెన్ అవ్వగానే ఆటోమేటిక్‌గా లోడ్ అవుతుంది
window.addEventListener("DOMContentLoaded", () => {
  renderMandiTable("mandi-box");
});
