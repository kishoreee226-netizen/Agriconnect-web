// mandi.js - Official Live Agmarknet Mandi Rates Service (Powered by Mumbai Supabase Proxy)

const MANDI_CONFIG = {
  apiKey: "579b464db66ec23bdd0000012873d6e8fa3847a564325d817ed2b023",
  resourceId: "9ef84268-d588-465a-a308-a864a43d0070",
  limit: 50,
  // ముంబై సుపాబేస్ ప్రాక్సీ URL
  proxyUrl: "https://tmqzfgzmrcveadccjtaa.supabase.co/functions/v1/smart-action?url="
};

// 1. ముంబై సర్వర్ ప్రాక్సీ ద్వారా సురక్షితంగా డేటా తెచ్చే ఫంక్షన్
async function fetchMandiRates() {
  // data.gov.in నుండి నేరుగా JSON ఫార్మాట్ అభ్యర్థన
  const targetApi = `https://api.data.gov.in/resource/${MANDI_CONFIG.resourceId}?api-key=${MANDI_CONFIG.apiKey}&format=json&limit=${MANDI_CONFIG.limit}`;
  const finalUrl = MANDI_CONFIG.proxyUrl + encodeURIComponent(targetApi);

  const response = await fetch(finalUrl);
  if (!response.ok) {
    throw new Error(`సర్వర్ ఎర్రర్: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

// 2. లైవ్ డేటాను వెబ్‌సైట్‌లో టేబుల్ రూపంలో చూపించే ఫంక్షన్
async function renderMandiTable(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 15px; font-family: sans-serif; color: #555;">
      ⏳ తాజా ప్రభుత్వ మార్కెట్ ధరలు లోడ్ అవుతున్నాయి...
    </div>
  `;

  try {
    const data = await fetchMandiRates();
    const records = data.records || [];

    if (records.length === 0) {
      container.innerHTML = `
        <div style="padding: 15px; color: #d32f2f; font-family: sans-serif;">
          ⚠️ ప్రస్తుతం ఎలాంటి రికార్డులు లభించలేదు.
        </div>
      `;
      return;
    }

    let tableHtml = `
      <div style="overflow-x: auto; font-family: sans-serif; margin-top: 15px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
          <thead>
            <tr style="background-color: #2e7d32; color: #ffffff;">
              <th style="padding: 10px; border: 1px solid #ddd;">రాష్ట్రం (State)</th>
              <th style="padding: 10px; border: 1px solid #ddd;">జిల్లా (District)</th>
              <th style="padding: 10px; border: 1px solid #ddd;">మార్కెట్ (Market)</th>
              <th style="padding: 10px; border: 1px solid #ddd;">పంట (Commodity)</th>
              <th style="padding: 10px; border: 1px solid #ddd;">రకం (Variety)</th>
              <th style="padding: 10px; border: 1px solid #ddd;">ధర (₹/క్వింటాల్)</th>
            </tr>
          </thead>
          <tbody>
    `;

    records.forEach((item, index) => {
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
  } catch (error) {
    console.error("Mandi Load Error:", error);
    container.innerHTML = `
      <div style="padding: 15px; color: #d32f2f; font-family: sans-serif;">
        ⚠️ లైవ్ మార్కెట్ డేటా అందుబాటులో లేదు (${error.message}). దయచేసి కాసేపటి తర్వాత ప్రయత్నించండి.
      </div>
    `;
  }
}

// పేజీ లోడ్ అవ్వగానే ఆటోమేటిక్‌గా టేబుల్ చూపించడానికి
window.addEventListener("DOMContentLoaded", () => {
  renderMandiTable("mandi-box");
});
