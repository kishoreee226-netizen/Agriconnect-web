// ==========================================
// 1. Mandi Widget Configuration
// ==========================================
const MANDI_API_KEY = "579b464db66ecb3875b39ed9319231f2";
const GOVT_API_URL = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${MANDI_API_KEY}&format=json&filters[state]=Telangana`;

let allMandiRecords = [];

// ==========================================
// 2. Data Fetching Logic (Live + Fallback)
// ==========================================
async function fetchMandiData() {
  try {
    const liveResponse = await fetch(GOVT_API_URL, { signal: AbortSignal.timeout(4000) });
    if (liveResponse.ok) {
      const liveData = await liveResponse.json();
      const records = liveData.records || [];
      if (records.length > 0) {
        return { source: "Live Server", isLive: true, records: records };
      }
    }
  } catch (err) {
    console.warn("Govt API timeout/CORS error. Fallback json loading...", err);
  }

  try {
    const localResponse = await fetch("mandi_live.json?v=" + new Date().getTime());
    if (localResponse.ok) {
      const localData = await localResponse.json();
      const backupRecords = Array.isArray(localData) ? localData : (localData.records || []);
      return { source: "Saved Backup", isLive: false, records: backupRecords };
    }
  } catch (err) {
    console.error("Local backup loading failed:", err);
  }

  return { source: "None", isLive: false, records: [] };
}

// ==========================================
// 3. Render Table Rows (Filtered)
// ==========================================
function renderFilteredTable(records) {
  const tableBody = document.getElementById("mandi-table-body");
  if (!tableBody) return;

  if (records.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="3" style="padding: 10px; text-align: center; color: #888; font-size: 11px;">
          ఎలాంటి సమాచారం దొరకలేదు.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = records.slice(0, 6).map(item => `
    <tr style="border-bottom: 1px solid #dcedc8; font-size: 11px;">
      <td style="padding: 6px 4px; font-weight: 600; color: #2e7d32;">${item.commodity || item.Commodity || "పంట"}</td>
      <td style="padding: 6px 4px; color: #444;">${item.market || item.Market || "మార్కెట్"}</td>
      <td style="padding: 6px 4px; font-weight: 700; color: #1b5e20; text-align: right;">₹${item.modal_price || item.Modal_Price || item.price || "N/A"}</td>
    </tr>
  `).join("");
}

// ==========================================
// 4. Filtering Logic for the 3 Search Bars
// ==========================================
function filterMandiRecords() {
  const stateVal = document.getElementById("mandi-state-filter")?.value.toLowerCase().trim() || "";
  const marketVal = document.getElementById("mandi-market-filter")?.value.toLowerCase().trim() || "";
  const cropVal = document.getElementById("mandi-crop-filter")?.value.toLowerCase().trim() || "";

  const filtered = allMandiRecords.filter(item => {
    const itemState = (item.state || item.State || "Telangana").toLowerCase();
    const itemMarket = (item.market || item.Market || "").toLowerCase();
    const itemCrop = (item.commodity || item.Commodity || "").toLowerCase();

    const matchesState = !stateVal || itemState.includes(stateVal);
    const matchesMarket = !marketVal || itemMarket.includes(marketVal);
    const matchesCrop = !cropVal || itemCrop.includes(cropVal);

    return matchesState && matchesMarket && matchesCrop;
  });

  renderFilteredTable(filtered);
}

// ==========================================
// 5. Main Render Function (Widget UI)
// ==========================================
window.renderMandiWidget = async function() {
  const container = document.getElementById("mandi-container");
  if (!container) return;

  // Background Theme: Soft Agri Green background (#f4f9f1) with neat border
  container.innerHTML = `
    <div style="background: #f4f9f1; border: 1.5px solid #81c784; border-radius: 10px; padding: 12px; box-shadow: 0 2px 5px rgba(46,125,50,0.08);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h3 style="margin: 0; color: #1b5e20; font-size: 14px; font-weight: 700;">🌾 మార్కెట్ / మండి లైవ్ ధరలు</h3>
        <span style="font-size: 10px; background: #fff3e0; color: #e65100; padding: 2px 7px; border-radius: 10px; font-weight: 600;">కనెక్ట్ అవుతోంది...</span>
      </div>
      <div style="font-size: 11px; color: #555;">తాజా ధరల డేటా లోడ్ అవుతోంది...</div>
    </div>
  `;

  const result = await fetchMandiData();
  allMandiRecords = result.records;

  const isLive = result.isLive;
  const badgeColor = isLive ? "#2e7d32" : "#b78103";
  const badgeBg = isLive ? "#e8f5e9" : "#fffde7";
  const badgeText = isLive ? "🟢 Live Server" : "🟡 Saved Backup";

  // Full Widget with Agri Green Background & 3 Search Bars
  container.innerHTML = `
    <div style="background: #f4f9f1; border: 1.5px solid #81c784; border-radius: 10px; padding: 12px; box-shadow: 0 2px 5px rgba(46,125,50,0.08);">
      
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="margin: 0; color: #1b5e20; font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 5px;">
          🌾 మార్కెట్ / మండి లైవ్ ధరలు
        </h3>
        <span style="font-size: 10px; background: ${badgeBg}; color: ${badgeColor}; padding: 2px 7px; border-radius: 10px; font-weight: 600; border: 1px solid ${badgeColor}33;">
          ${badgeText}
        </span>
      </div>

      <!-- 3 Search / Filter Bars -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 10px;">
        <div>
          <input type="text" id="mandi-state-filter" placeholder="రాష్ట్రం (State)" 
            style="width: 100%; font-size: 11px; padding: 5px 6px; border: 1px solid #a5d6a7; border-radius: 5px; outline: none; background: #ffffff;" />
        </div>
        <div>
          <input type="text" id="mandi-market-filter" placeholder="మార్కెట్ (Mandi)" 
            style="width: 100%; font-size: 11px; padding: 5px 6px; border: 1px solid #a5d6a7; border-radius: 5px; outline: none; background: #ffffff;" />
        </div>
        <div>
          <input type="text" id="mandi-crop-filter" placeholder="పంట (Crop)" 
            style="width: 100%; font-size: 11px; padding: 5px 6px; border: 1px solid #a5d6a7; border-radius: 5px; outline: none; background: #ffffff;" />
        </div>
      </div>

      <!-- Table Section -->
      <div style="background: #ffffff; border-radius: 6px; border: 1px solid #c8e6c9; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background: #e8f5e9; font-size: 11px; color: #1b5e20; border-bottom: 1px solid #c8e6c9;">
              <th style="padding: 6px 4px;">పంట</th>
              <th style="padding: 6px 4px;">మార్కెట్</th>
              <th style="padding: 6px 4px; text-align: right;">ధర (క్వింటాల్)</th>
            </tr>
          </thead>
          <tbody id="mandi-table-body">
            <!-- Rows rendered dynamically -->
          </tbody>
        </table>
      </div>

    </div>
  `;

  // Filter input events
  document.getElementById("mandi-state-filter").addEventListener("input", filterMandiRecords);
  document.getElementById("mandi-market-filter").addEventListener("input", filterMandiRecords);
  document.getElementById("mandi-crop-filter").addEventListener("input", filterMandiRecords);

  // Initial table render
  renderFilteredTable(allMandiRecords);
};
