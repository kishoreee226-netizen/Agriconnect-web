// mandi.js - Official Live Agmarknet Mandi Rates Service (CORS-free JSONP)

const MANDI_CONFIG = {
  apiKey: "579b464db66ec23bdd0000012873d6e8fa3847a564325d817ed2b023",
  resourceId: "9ef84268-d588-465a-a308-a864a43d0070",
  limit: 50
};

// 1. JSONP పద్ధతిలో గవర్నమెంట్ API నుండి నేరుగా డేటా తెచ్చే ఫంక్షన్
function fetchMandiJSONP() {
  return new Promise((resolve, reject) => {
    const callbackName = "handleMandiData_" + Math.round(100000 * Math.random());
    const script = document.createElement("script");

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("కనెక్షన్ టైమౌట్ అయింది. దయచేసి మళ్లీ ప్రయత్నించండి."));
    }, 15000);

    function cleanup() {
      if (window[callbackName]) delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
      clearTimeout(timer);
    }

    window[callbackName] = function(data) {
      cleanup();
      resolve(data);
    };

    script.src = `https://api.data.gov.in/resource/${MANDI_CONFIG.resourceId}?api-key=${MANDI_CONFIG.apiKey}&format=jsonp&callback=${callbackName}&limit=${MANDI_CONFIG.limit}`;
    script.onerror = function() {
      cleanup();
      reject(new Error("ప్రభుత్వ సర్వర్ నుండి డేటా లోడ్ కాలేదు."));
    };

    document.head.appendChild(script);
  });
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
    const data = await fetchMandiJSONP();
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
