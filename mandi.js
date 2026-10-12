// mandi.js - Interactive Mandi Rates with Search, State Filter & Category Filter

let allRecords = [];

async function fetchMandiRates() {
  const response = await fetch(`./mandi_live.json?t=${Date.now()}`);
  if (!response.ok) {
    throw new Error(`డేటా లోడ్ కాలేదు: ${response.status}`);
  }
  const data = await response.json();
  return data.records || [];
}

function renderTableRows(records) {
  const tbody = document.getElementById("mandi-tbody");
  if (!tbody) return;

  if (records.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="padding: 24px; text-align: center; color: #777; font-size: 14px;">
          🔍 ఎటువంటి రికార్డులు దొరకలేదు. దయచేసి వేరే పేరు లేదా ఫిల్టర్ ఎంచుకోండి.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = records.map((item, index) => {
    const bg = index % 2 === 0 ? "#ffffff" : "#f8faf8";
    return `
      <tr style="background-color: ${bg}; border-bottom: 1px solid #e0e0e0; transition: background 0.15s ease;">
        <td style="padding: 10px 12px; font-size: 13px; color: #333; font-weight: 500;">${item.state || '-'}</td>
        <td style="padding: 10px 12px; font-size: 13px; color: #555;">${item.district || '-'}</td>
        <td style="padding: 10px 12px; font-size: 13px; color: #555;">${item.market || '-'}</td>
        <td style="padding: 10px 12px; font-size: 14px; font-weight: 600; color: #2e7d32;">${item.commodity || '-'}</td>
        <td style="padding: 10px 12px; font-size: 13px; color: #666;">${item.variety || '-'}</td>
        <td style="padding: 10px 12px; font-size: 14px; font-weight: 700; color: #1b5e20;">₹${item.modal_price || '-'}</td>
      </tr>
    `;
  }).join('');
}

function filterRecords() {
  const query = document.getElementById("mandi-search")?.value.toLowerCase().trim() || "";
  const selectedState = document.getElementById("mandi-state-filter")?.value || "all";
  const selectedGroup = document.getElementById("mandi-group-filter")?.value || "all";

  const filtered = allRecords.filter(item => {
    const matchesSearch = 
      (item.commodity && item.commodity.toLowerCase().includes(query)) ||
      (item.district && item.district.toLowerCase().includes(query)) ||
      (item.market && item.market.toLowerCase().includes(query)) ||
      (item.variety && item.variety.toLowerCase().includes(query));

    const matchesState = (selectedState === "all") || (item.state === selectedState);
    const matchesGroup = (selectedGroup === "all") || (item.district === selectedGroup);

    return matchesSearch && matchesState && matchesGroup;
  });

  renderTableRows(filtered);
}

async function renderMandiTable(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 25px; text-align: center; font-family: sans-serif; color: #2e7d32; font-weight: 500;">
      ⏳ కేంద్ర ప్రభుత్వ Agmarknet నుండి తాజా మార్కెట్ రేట్లు లోడ్ అవుతున్నాయి...
    </div>
  `;

  try {
    allRecords = await fetchMandiRates();

    // Unique States & Categories Collect Cheyadam
    const states = [...new Set(allRecords.map(r => r.state).filter(Boolean))];
    const groups = [...new Set(allRecords.map(r => r.district).filter(Boolean))];

    container.innerHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 15px 0;">
        
        <!-- Search, State Filter & Category Filter Bar -->
        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; align-items: center;">
          
          <!-- 1. Live Search Input -->
          <input 
            type="text" 
            id="mandi-search" 
            placeholder="🔍 పంట పేరుతో వెతకండి (e.g. Cotton, Paddy, Onion)..." 
            style="flex: 2; min-width: 220px; padding: 10px 14px; border: 1.5px solid #a5d6a7; border-radius: 8px; font-size: 14px; outline: none; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);"
          />

          <!-- 2. State Filter Box (రాష్ట్రాల ఎంపిక) -->
          <select 
            id="mandi-state-filter" 
            style="flex: 1; min-width: 160px; padding: 10px 12px; border: 1.5px solid #a5d6a7; border-radius: 8px; font-size: 14px; background: #ffffff; cursor: pointer; color: #2e7d32; font-weight: 600;"
          >
            <option value="all">🌐 అన్ని రాష్ట్రాలు (All States)</option>
            ${states.map(s => `<option value="${s}">${s}</option>`).join('')}
          </select>

          <!-- 3. Category Filter Box (పంటల విభాగం) -->
          <select 
            id="mandi-group-filter" 
            style="flex: 1; min-width: 160px; padding: 10px 12px; border: 1.5px solid #a5d6a7; border-radius: 8px; font-size: 14px; background: #ffffff; cursor: pointer; color: #333;"
          >
            <option value="all">🌾 అన్ని పంట విభాగాలు (All)</option>
            ${groups.map(g => `<option value="${g}">${g}</option>`).join('')}
          </select>

        </div>

        <!-- Responsive Table Container -->
        <div style="overflow-x: auto; border: 1px solid #c8e6c9; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <table style="width: 100%; border-collapse: collapse; text-align: left; background: #ffffff; min-width: 600px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #2e7d32, #388e3c); color: #ffffff;">
                <th style="padding: 12px 14px; font-size: 13px; font-weight: 600;">రాష్ట్రం (State)</th>
                <th style="padding: 12px 14px; font-size: 13px; font-weight: 600;">విభాగం (Group)</th>
                <th style="padding: 12px 14px; font-size: 13px; font-weight: 600;">మార్కెట్ (Market)</th>
                <th style="padding: 12px 14px; font-size: 13px; font-weight: 600;">పంట (Commodity)</th>
                <th style="padding: 12px 14px; font-size: 13px; font-weight: 600;">రకం / MSP</th>
                <th style="padding: 12px 14px; font-size: 13px; font-weight: 600;">సగటు ధర (₹/క్వింటా)</th>
              </tr>
            </thead>
            <tbody id="mandi-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    renderTableRows(allRecords);

    // Event Listeners for Instant Filtering
    document.getElementById("mandi-search")?.addEventListener("input", filterRecords);
    document.getElementById("mandi-state-filter")?.addEventListener("change", filterRecords);
    document.getElementById("mandi-group-filter")?.addEventListener("change", filterRecords);

  } catch (error) {
    container.innerHTML = `
      <div style="padding: 16px; color: #d32f2f; font-family: sans-serif; background: #ffebee; border-radius: 8px; border: 1px solid #ffcdd2;">
        ⚠️ లైవ్ మార్కెట్ డేటా లోడ్ కాలేదు (${error.message}).
      </div>
    `;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  renderMandiTable("mandi-box");
});
