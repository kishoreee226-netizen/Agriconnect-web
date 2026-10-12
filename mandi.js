// mandi.js - Enhanced Interactive Mandi Rates Table

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
        <td colspan="6" style="padding: 20px; text-align: center; color: #888;">
          🔍 ఎటువంటి రికార్డులు దొరకలేదు.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = records.map((item, index) => {
    const bg = index % 2 === 0 ? "#ffffff" : "#f8faf8";
    return `
      <tr style="background-color: ${bg}; border-bottom: 1px solid #e0e0e0; transition: background 0.2s;">
        <td style="padding: 10px 12px; font-size: 13px; color: #555;">${item.state || '-'}</td>
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
  const group = document.getElementById("mandi-group-filter")?.value || "all";

  const filtered = allRecords.filter(item => {
    const matchesSearch = 
      (item.commodity && item.commodity.toLowerCase().includes(query)) ||
      (item.district && item.district.toLowerCase().includes(query)) ||
      (item.variety && item.variety.toLowerCase().includes(query));

    const matchesGroup = (group === "all") || (item.district === group);

    return matchesSearch && matchesGroup;
  });

  renderTableRows(filtered);
}

async function renderMandiTable(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif; color: #2e7d32;">
      ⏳ కేంద్ర ప్రభుత్వ Agmarknet నుండి తాజా మార్కెట్ రేట్లు లోడ్ అవుతున్నాయి...
    </div>
  `;

  try {
    allRecords = await fetchMandiRates();

    // విభాగాలు (Categories) సేకరించడం
    const groups = [...new Set(allRecords.map(r => r.district).filter(Boolean))];

    container.innerHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 15px 0;">
        
        <!-- Search & Filter Controls -->
        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; align-items: center;">
          <input 
            type="text" 
            id="mandi-search" 
            placeholder="🔍 పంట పేరుతో వెతకండి (e.g. Cotton, Paddy)..." 
            style="flex: 1; min-width: 200px; padding: 9px 12px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 14px; outline: none;"
          />
          
          <select 
            id="mandi-group-filter" 
            style="padding: 9px 12px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 14px; background: #fff; cursor: pointer;"
          >
            <option value="all">అన్ని పంట విభాగాలు (All)</option>
            ${groups.map(g => `<option value="${g}">${g}</option>`).join('')}
          </select>
        </div>

        <!-- Responsive Table -->
        <div style="overflow-x: auto; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
          <table style="width: 100%; border-collapse: collapse; text-align: left; background: #fff; min-width: 550px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #2e7d32, #388e3c); color: #ffffff;">
                <th style="padding: 12px; font-size: 13px; font-weight: 600;">State</th>
                <th style="padding: 12px; font-size: 13px; font-weight: 600;">Group</th>
                <th style="padding: 12px; font-size: 13px; font-weight: 600;">Market</th>
                <th style="padding: 12px; font-size: 13px; font-weight: 600;">Commodity</th>
                <th style="padding: 12px; font-size: 13px; font-weight: 600;">Variety / MSP</th>
                <th style="padding: 12px; font-size: 13px; font-weight: 600;">Modal Price (₹/Q)</th>
              </tr>
            </thead>
            <tbody id="mandi-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    renderTableRows(allRecords);

    // Filter Listeners
    document.getElementById("mandi-search")?.addEventListener("input", filterRecords);
    document.getElementById("mandi-group-filter")?.addEventListener("change", filterRecords);

  } catch (error) {
    container.innerHTML = `
      <div style="padding: 15px; color: #d32f2f; font-family: sans-serif; background: #ffebee; border-radius: 6px;">
        ⚠️ లైవ్ మార్కెట్ డేటా లోడ్ కాలేదు (${error.message}).
      </div>
    `;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  renderMandiTable("mandi-box");
});
