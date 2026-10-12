// mandi.js - Ultra Compact Mini-Widget with Search, State & Panta Vibhagam

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

    // Ultra-Compact Box Wrapper (1/8th page footprint)
    container.innerHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 6px auto; padding: 6px; border: 1px solid #d0e7d2; border-radius: 8px; background: #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
        
        <!-- Search, State Box, and Panta Vibhagam in Compact Row -->
        <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 6px; align-items: center;">
          
          <!-- 1. Search Box -->
          <input 
            type="text" 
            id="mandi-search" 
            placeholder="🔍 Panta peru..." 
            style="flex: 2; min-width: 110px; padding: 5px 7px; border: 1px solid #b7dfb9; border-radius: 5px; font-size: 11px; outline: none;"
          />

          <!-- 2. State Filter Box -->
          <select 
            id="mandi-state-filter" 
            style="flex: 1; min-width: 95px; padding: 5px 4px; border: 1px solid #b7dfb9; border-radius: 5px; font-size: 11px; background: #fff; color: #2e7d32; font-weight: 600;"
          >
            <option value="all">🌐 All States</option>
            ${states.map(s => `<option value="${s}">${s}</option>`).join('')}
          </select>

          <!-- 3. Panta Vibhagam Box (Cereals, Pulses, etc.) -->
          <select 
            id="mandi-group-filter" 
            style="flex: 1; min-width: 95px; padding: 5px 4px; border: 1px solid #b7dfb9; border-radius: 5px; font-size: 11px; background: #fff; color: #333;"
          >
            <option value="all">🌾 Vibhagam (All)</option>
            ${groups.map(g => `<option value="${g}">${g}</option>`).join('')}
          </select>

        </div>

        <!-- 3 Rows Mini Table Container (~115px height) -->
        <div style="max-height: 115px; overflow-y: auto; overflow-x: auto; border: 1px solid #e1eee1; border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="position: sticky; top: 0; z-index: 2; background: #2e7d32; color: #ffffff;">
                <th style="padding: 5px 8px; font-size: 10px; font-weight: 600;">పంట (Crop)</th>
                <th style="padding: 5px 8px; font-size: 10px; font-weight: 600;">విభాగం</th>
                <th style="padding: 5px 8px; font-size: 10px; font-weight: 600;">MSP రకం</th>
                <th style="padding: 5px 8px; font-size: 10px; font-weight: 600;">ధర (₹/Q)</th>
              </tr>
            </thead>
            <tbody id="mandi-tbody"></tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 9px; color: #689f38; padding: 0 2px;">
          <span>Govt Agmarknet Live</span>
          <span>↕️ Scroll for more</span>
        </div>

      </div>
    `;

    renderTableRows(allRecords);

    // Event Listeners for Filters
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
