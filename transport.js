// transport.js - Ravanaa (Vehicles & Auto/Trolley/Lorry) Widget with Distance & Radius Filter

const transportList = [
  { id: "tr1", name: "ట్రాక్టర్ ట్రాలీ (ధాన్యం రవాణా)", driver: "శంకర్", rate: "₹1,200 / ట్రిప్పు", phone: "9876543221", loc: "మార్కెట్ యార్డ్ రూట్", distanceKm: 2.0, village: "same" },
  { id: "tr2", name: "Tata Ace (Chota Hathi)", driver: "రమేష్", rate: "₹18 / కి.మీ", phone: "9876543220", loc: "మండలం పరిధి", distanceKm: 4.0, village: "near" },
  { id: "tr3", name: "బోలెరో పికప్ (Bolero Pickup)", driver: "సురేష్", rate: "₹22 / కి.మీ", phone: "9876543223", loc: "8 కి.మీ పరిధి", distanceKm: 8.0, village: "near" },
  { id: "tr4", name: "10-టైర్ లారీ (భారీ సరుకు)", driver: "బాలాజీ ట్రాన్స్‌పోర్ట్", rate: "దూరాన్ని బట్టి రేటు", phone: "9876543222", loc: "రాష్ట్రవ్యాప్తంగా", distanceKm: 18.0, village: "far" }
];

// గ్లోబల్ ట్రాన్స్‌పోర్ట్ ఫిల్టర్ స్టేట్
let activeTransportFilter = "all";

window.renderTransportWidget = function(targetContainerId = "farmer-pane-transport") {
  const container = document.getElementById(targetContainerId);
  if (!container) return;

  // ఫిల్టర్ ఆధారంగా వాహనాల జాబితా ఎంపిక
  const filteredList = transportList.filter(tr => {
    if (activeTransportFilter === "village") {
      return tr.village === "same" || tr.distanceKm <= 2;
    } else if (activeTransportFilter === "5") {
      return tr.distanceKm <= 5;
    } else if (activeTransportFilter === "10") {
      return tr.distanceKm <= 10;
    }
    return true; // 'all' అయితే అన్నీ కనిపిస్తాయి
  });

  container.innerHTML = `
    <!-- రవాణా లొకేషన్ ఫిల్టర్ బార్ -->
    <div class="location-filter-bar" style="display:flex; justify-content:space-between; align-items:center; background:#e8f5e9; padding:8px 12px; border-radius:8px; margin-bottom:12px; border:1px solid #c8e6c9;">
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="font-size:13px; font-weight:bold; color:#1b5e20;">📍 పరిధి:</span>
        <select id="tr-loc-filter" onchange="filterTransportByRange(this.value)" style="padding:4px 8px; border-radius:6px; border:1px solid #81c784; font-size:12px; background:#fff; font-weight:600; color:#2e7d32; outline:none;">
          <option value="all" ${activeTransportFilter === 'all' ? 'selected' : ''}>అన్ని వాహనాలు</option>
          <option value="village" ${activeTransportFilter === 'village' ? 'selected' : ''}>🏡 నా గ్రామం (2 కి.మీ)</option>
          <option value="5" ${activeTransportFilter === '5' ? 'selected' : ''}>⚡ 5 కి.మీ లోపు</option>
          <option value="10" ${activeTransportFilter === '10' ? 'selected' : ''}>🚛 10 కి.మీ లోపు</option>
        </select>
      </div>
      <span style="font-size:11px; background:#2e7d32; color:#fff; padding:3px 8px; border-radius:12px; font-weight:600;">
        ${filteredList.length} లభ్యం
      </span>
    </div>

    <!-- వాహనాల జాబితా -->
    <div class="eq-list-wrap">
      ${filteredList.length === 0 ? `
        <div style="text-align:center; padding:20px; color:#666; font-size:13px; background:#fff; border-radius:8px; border:1px dashed #ccc;">
          ఈ పరిధిలో ప్రస్తుతం రవాణా వాహనాలు అందుబాటులో లేవు.
        </div>
      ` : filteredList.map(tr => `
        <div class="eq-item-card" style="margin-bottom:10px;">
          <div class="eq-top-row">
            <div>
              <div class="eq-name">${tr.name}</div>
              <div class="eq-owner-meta">డ్రైవర్/యజమాని: <b>${tr.driver}</b> | 📍 ${tr.loc} (${tr.distanceKm} కి.మీ)</div>
            </div>
            <div class="eq-price-badge">${tr.rate}</div>
          </div>
          <div class="eq-actions-row">
            <button type="button" class="eq-btn-link eq-btn-book" onclick="openBookingModal('${tr.name}', '${tr.driver}', '${tr.rate}', '${tr.phone}')">📅 బుక్ చేయండి</button>
            <a href="tel:${tr.phone}" class="eq-btn-link eq-btn-call">📞 కాల్</a>
            <a href="https://wa.me/91${tr.phone}" target="_blank" class="eq-btn-link eq-btn-wa">💬 వాట్సాప్</a>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

// రవాణా ఫిల్టర్ మార్చినప్పుడు ట్రిగ్గర్ అయ్యే ఫంక్షన్
window.filterTransportByRange = function(rangeValue) {
  activeTransportFilter = rangeValue;
  renderTransportWidget("farmer-pane-transport");
};
