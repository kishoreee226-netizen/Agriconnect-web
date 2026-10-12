// mandi.js - Compact Widget with Trend Chart Symbol

let allRecords = [];

async function fetchMandiRates() {
  const response = await fetch(`./mandi_live.json?t=${Date.now()}`);
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
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
        <td colspan="4" style="padding: 10px; text-align: center; color: #888; font-size: 11px;">
          Records leavu
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = records.map((item, index) => {
    const bg = index % 2 === 0 ? "#ffffff" : "#fbfdfb";
    return `
      <tr style="background-color: ${bg}; border-bottom: 1px solid #edf2ed;">
        <td style="padding: 6px 8px; font-size: 11px; font-weight: 600; color: #2e7d32; white-space: nowrap;">${item.commodity || '-'}</td>
        <td style="padding: 6px 8px; font-size: 11px; color: #444; white-space: nowrap;">${item.district || '-'}</td>
        <td style="padding: 6px 8px; font-size: 10px; color: #666; white-space: nowrap;">${item.variety || '-'}</td>
        <td style="padding: 6px 8px; font-size: 11px; font-weight: 700; color: #1b5e20; white-space: nowrap;">₹${item.modal_price || '-'}</td>
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
    <div style="padding: 8px; text-align: center; font-size: 11px; color: #2e7d32;">
      ⏳ Loading Mandi Rates...
    </div>
  `;

  try {
    allRecords = await fetchMandiRates();
    const states = [...new Set(allRecords.map(r => r.state).filter(Boolean))];
    const groups = [...new Set(allRecords.map(r => r.district).filter(Boolean))];

    container.innerHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 10px 0 10px auto; border: 1.5px solid #2e7d32; border-radius: 10px; background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
        
        <!-- Integrated Top Header Title with Styled Trend Icon -->
        <div style="background: linear-gradient(135deg, #1b5e20, #2e7d32); color: #ffffff; padding: 7px 12px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: 700; letter-spacing: 0.3px; display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-flex; align-items: center; justify-content: center; background: rgba(255,215,0,0.2); border: 1px solid #ffd700; border-radius: 50%; width: 22px; height: 22px; font-size: 12px; box-shadow: 0 0 6px rgba(255,215,0,0.5);">📈</span>
            కేంద్ర ప్రభుత్వ Agmarknet తాజా ధరలు
          </span>
          <span style="font-size: 9px; background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; font-weight: 600;">Live Rates</span>
        </div>

        <div style="padding: 8px;">
          <!-- Controls: Search, State, Vibhagam -->
          <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 6px; align-items: center;">
            <input 
              type="text" 
              id="mandi-search" 
              placeholder="🔍 Panta peru..." 
              style="flex: 2; min-width: 105px; padding: 5px 7px; border: 1px solid #b7dfb9; border-radius: 5px; font-size: 11px; outline: none;"
            />

            <select 
              id="mandi-state-filter" 
              style="flex: 1; min-width: 90px; padding: 5px 4px; border: 1px solid #b7dfb9; border-radius: 5px; font-size: 11px; background: #fff; color: #2e7d32; font-weight: 600;"
            >
              <option value="all">🌐 All States</option>
              ${states.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>

            <select 
              id="mandi-group-filter" 
              style="flex: 1; min-width: 90px; padding: 5px 4px; border: 1px solid #b7dfb9; border-radius: 5px; font-size: 11px; background: #fff; color: #333;"
            >
              <option value="all">🌾 Vibhagam (All)</option>
              ${groups.map(g => `<option value="${g}">${g}</option>`).join('')}
            </select>
          </div>

          <!-- 3-Rows Scrollable Table -->
          <div style="max-height: 115px; overflow-y: auto; overflow-x: auto; border: 1px solid #e1eee1; border-radius: 6px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="position: sticky; top: 0; z-index: 2; background: #e8f5e9; color: #1b5e20; border-bottom: 1.5px solid #c8e6c9;">
                  <th style="padding: 5px 8px; font-size: 10px; font-weight: 700;">పంట (Crop)</th>
                  <th style="padding: 5px 8px; font-size: 10px; font-weight: 700;">విభాగం</th>
                  <th style="padding: 5px 8px; font-size: 10px; font-weight: 700;">MSP రకం</th>
                  <th style="padding: 5px 8px; font-size: 10px; font-weight: 700;">ధర (₹/Q)</th>
                </tr>
              </thead>
              <tbody id="mandi-tbody"></tbody>
            </table>
          </div>

          <!-- Footer status -->
          <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 9px; color: #689f38; padding: 0 2px;">
            <span>Official APMC Market Rates</span>
            <span>↕️ Scroll for more</span>
          </div>
        </div>

      </div>
    `;

    renderTableRows(allRecords);

    document.getElementById("mandi-search")?.addEventListener("input", filterRecords);
    document.getElementById("mandi-state-filter")?.addEventListener("change", filterRecords);
    document.getElementById("mandi-group-filter")?.addEventListener("change", filterRecords);

  } catch (error) {
    container.innerHTML = `
      <div style="padding: 6px; font-size: 11px; color: #c62828; background: #ffebee; border-radius: 5px;">
        ⚠️ Data load kaledhu (${error.message}).
      </div>
    `;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  renderMandiTable("mandi-box");
});
