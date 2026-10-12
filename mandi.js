// mandi.js - Compact Scrollable Table (3 Rows Visible) with Search & Filters

let allRecords = [];

async function fetchMandiRates() {
  const response = await fetch(`./mandi_live.json?t=${Date.now()}`);
  if (!response.ok) {
    throw new Error(`Data load kaledhu: ${response.status}`);
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
        <td colspan="6" style="padding: 20px; text-align: center; color: #777; font-size: 13px;">
          🔍 Ee peruto records levu. Vere peru type cheyandi.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = records.map((item, index) => {
    const bg = index % 2 === 0 ? "#ffffff" : "#f9fbf9";
    return `
      <tr style="background-color: ${bg}; border-bottom: 1px solid #e8ede8;">
        <td style="padding: 11px 12px; font-size: 13px; color: #333;">${item.state || '-'}</td>
        <td style="padding: 11px 12px; font-size: 13px; color: #555;">${item.district || '-'}</td>
        <td style="padding: 11px 12px; font-size: 13px; color: #555;">${item.market || '-'}</td>
        <td style="padding: 11px 12px; font-size: 13px; font-weight: 600; color: #2e7d32;">${item.commodity || '-'}</td>
        <td style="padding: 11px 12px; font-size: 13px; color: #666;">${item.variety || '-'}</td>
        <td style="padding: 11px 12px; font-size: 14px; font-weight: 700; color: #1b5e20;">₹${item.modal_price || '-'}</td>
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
    <div style="padding: 20px; text-align: center; font-family: sans-serif; color: #2e7d32;">
      ⏳ Live mandi rates load avuthunnayi...
    </div>
  `;

  try {
    allRecords = await fetchMandiRates();

    const states = [...new Set(allRecords.map(r => r.state).filter(Boolean))];
    const groups = [...new Set(allRecords.map(r => r.district).filter(Boolean))];

    container.innerHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 15px 0;">
        
        <!-- Controls: Search & Filters -->
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; align-items: center;">
          
          <input 
            type="text" 
            id="mandi-search" 
            placeholder="🔍 Panta peru tho vethakandi..." 
            style="flex: 2; min-width: 200px; padding: 9px 12px; border: 1.5px solid #a5d6a7; border-radius: 8px; font-size: 13px; outline: none;"
          />

          <select 
            id="mandi-state-filter" 
            style="flex: 1; min-width: 150px; padding: 9px 10px; border: 1.5px solid #a5d6a7; border-radius: 8px; font-size: 13px; background: #fff; cursor: pointer; color: #2e7d32; font-weight: 600;"
          >
            <option value="all">🌐 All States</option>
            ${states.map(s => `<option value="${s}">${s}</option>`).join('')}
          </select>

          <select 
            id="mandi-group-filter" 
            style="flex: 1; min-width: 150px; padding: 9px 10px; border: 1.5px solid #a5d6a7; border-radius: 8px; font-size: 13px; background: #fff; cursor: pointer; color: #333;"
          >
            <option value="all">🌾 All Categories</option>
            ${groups.map(g => `<option value="${g}">${g}</option>`).join('')}
          </select>

        </div>

        <!-- 3-Row Scrollable Box -->
        <div style="border: 1px solid #c8e6c9; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.04); overflow: hidden; background: #ffffff;">
          
          <!-- Vertical & Horizontal Scroll Container (approx 3 rows visible = ~145px) -->
          <div style="max-height: 190px; overflow-y: auto; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 580px;">
              <thead>
                <tr style="position: sticky; top: 0; z-index: 2; background: linear-gradient(135deg, #2e7d32, #388e3c); color: #ffffff;">
                  <th style="padding: 10px 12px; font-size: 12px; font-weight: 600;">State</th>
                  <th style="padding: 10px 12px; font-size: 12px; font-weight: 600;">Group</th>
                  <th style="padding: 10px 12px; font-size: 12px; font-weight: 600;">Market</th>
                  <th style="padding: 10px 12px; font-size: 12px; font-weight: 600;">Commodity</th>
                  <th style="padding: 10px 12px; font-size: 12px; font-weight: 600;">Variety / MSP</th>
                  <th style="padding: 10px 12px; font-size: 12px; font-weight: 600;">Modal Price (₹/Q)</th>
                </tr>
              </thead>
              <tbody id="mandi-tbody"></tbody>
            </table>
          </div>

          <div style="padding: 6px 12px; background: #f1f8e9; font-size: 11px; color: #558b2f; text-align: right; border-top: 1px solid #e0e0e0;">
            ↕️ Migatha pantala kosam paiki/kindhiki scroll cheyandi
          </div>

        </div>
      </div>
    `;

    renderTableRows(allRecords);

    // Filter listeners
    document.getElementById("mandi-search")?.addEventListener("input", filterRecords);
    document.getElementById("mandi-state-filter")?.addEventListener("change", filterRecords);
    document.getElementById("mandi-group-filter")?.addEventListener("change", filterRecords);

  } catch (error) {
    container.innerHTML = `
      <div style="padding: 15px; color: #d32f2f; font-family: sans-serif; background: #ffebee; border-radius: 8px;">
        ⚠️ Market data load kaledhu (${error.message}).
      </div>
    `;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  renderMandiTable("mandi-box");
});
