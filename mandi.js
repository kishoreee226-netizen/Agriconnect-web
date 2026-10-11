// mandi.js - Real Live Mandi Rates from mandi_live.json

async function fetchMandiRates() {
  const response = await fetch(`./mandi_live.json?t=${Date.now()}`);
  if (!response.ok) {
    throw new Error(`Data file read error: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

async function renderMandiTable(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 15px; font-family: sans-serif; color: #2e7d32;">
      ⏳ Kendriya Prabhutva Agmarknet nundi taja live dharalu load avthunnayi...
    </div>
  `;

  try {
    const data = await fetchMandiRates();
    const records = data.records || [];

    if (records.length === 0) {
      container.innerHTML = `
        <div style="padding: 15px; color: #d32f2f; font-family: sans-serif;">
          ⚠️ Prastutam records emi dorakaledhu.
        </div>
      `;
      return;
    }

    let tableHtml = `
      <div style="overflow-x: auto; font-family: sans-serif; margin-top: 15px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
          <thead>
            <tr style="background-color: #2e7d32; color: #ffffff;">
              <th style="padding: 10px; border: 1px solid #ddd;">State</th>
              <th style="padding: 10px; border: 1px solid #ddd;">District</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Market</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Commodity</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Variety</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Modal Price (₹/Q)</th>
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
    container.innerHTML = `
      <div style="padding: 15px; color: #d32f2f; font-family: sans-serif;">
        ⚠️ Live market data load kaaledhu (${error.message}).
      </div>
    `;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  renderMandiTable("mandi-box");
});
