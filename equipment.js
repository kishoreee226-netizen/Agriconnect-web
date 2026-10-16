// Equipment Dummy Data with Distance & Village Coordinates
const equipmentList = [
  { id: "eq1", name: "ట్రాక్టర్ (Mahindra 575)", owner: "రామయ్య", rate: "₹800 / గంట", phone: "9876543210", loc: "గ్రామం సమీపం", distanceKm: 1.5, village: "same" },
  { id: "eq2", name: "వరి కోత మిషన్ (Harvester)", owner: "వెంకటేష్", rate: "₹2,200 / గంట", phone: "9876543211", loc: "4.5 కి.మీ పరిధి", distanceKm: 4.5, village: "near" },
  { id: "eq3", name: "డ్రోన్ స్ప్రేయర్ (పురుగు మందులు)", owner: "కిరణ్ అగ్రిటెక్", rate: "₹450 / ఎకరా", phone: "9876543212", loc: "8 కి.మీ పరిధి", distanceKm: 8.0, village: "near" },
  { id: "eq4", name: "రోటావేటర్ (Rotavator)", owner: "శ్రీనివాస్", rate: "₹900 / గంట", phone: "9876543214", loc: "12 కి.మీ పరిధి", distanceKm: 12.0, village: "far" }
];

// గ్లోబల్ ఫిల్టర్ స్టేట్
let activeEquipmentFilter = "all";

window.renderEquipmentWidget = function(targetContainerId = "farmer-pane-equipment") {
  const container = document.getElementById(targetContainerId);
  if (!container) return;

  // ఎంచుకున్న ఫిల్టర్ ప్రకారం లిస్ట్ ఫిల్టర్ చేయడం
  const filteredList = equipmentList.filter(eq => {
    if (activeEquipmentFilter === "village") {
      return eq.village === "same" || eq.distanceKm <= 2;
    } else if (activeEquipmentFilter === "5") {
      return eq.distanceKm <= 5;
    } else if (activeEquipmentFilter === "10") {
      return eq.distanceKm <= 10;
    }
    return true; // 'all' అయితే అన్నీ చూపిస్తుంది
  });

  container.innerHTML = `
    <!-- లైవ్ లొకేషన్ ఫిల్టర్ బార్ -->
    <div class="location-filter-bar" style="display:flex; justify-content:space-between; align-items:center; background:#e8f5e9; padding:8px 12px; border-radius:8px; margin-bottom:12px; border:1px solid #c8e6c9;">
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="font-size:13px; font-weight:bold; color:#1b5e20;">📍 పరిధి:</span>
        <select id="eq-loc-filter" onchange="filterEquipmentByRange(this.value)" style="padding:4px 8px; border-radius:6px; border:1px solid #81c784; font-size:12px; background:#fff; font-weight:600; color:#2e7d32; outline:none;">
          <option value="all" ${activeEquipmentFilter === 'all' ? 'selected' : ''}>అన్ని ప్రాంతాలు</option>
          <option value="village" ${activeEquipmentFilter === 'village' ? 'selected' : ''}>🏡 నా గ్రామం (2 కి.మీ)</option>
          <option value="5" ${activeEquipmentFilter === '5' ? 'selected' : ''}>⚡ 5 కి.మీ లోపు</option>
          <option value="10" ${activeEquipmentFilter === '10' ? 'selected' : ''}>🚜 10 కి.మీ లోపు</option>
        </select>
      </div>
      <span style="font-size:11px; background:#2e7d32; color:#fff; padding:3px 8px; border-radius:12px; font-weight:600;">
        ${filteredList.length} లభ్యం
      </span>
    </div>

    <!-- పరికరాల లిస్ట్ -->
    <div class="eq-list-wrap">
      ${filteredList.length === 0 ? `
        <div style="text-align:center; padding:20px; color:#666; font-size:13px; background:#fff; border-radius:8px; border:1px dashed #ccc;">
          ఈ పరిధిలో ప్రస్తుతం ఎలాంటి పరికరాలు అందుబాటులో లేవు.
        </div>
      ` : filteredList.map(eq => `
        <div class="eq-item-card" style="margin-bottom:10px;">
          <div class="eq-top-row">
            <div>
              <div class="eq-name">${eq.name}</div>
              <div class="eq-owner-meta">యజమాని: <b>${eq.owner}</b> | 📍 ${eq.loc} (${eq.distanceKm} కి.మీ)</div>
            </div>
            <div class="eq-price-badge">${eq.rate}</div>
          </div>
          <div class="eq-actions-row">
            <button type="button" class="eq-btn-link eq-btn-book" onclick="openBookingModal('${eq.name}', '${eq.owner}', '${eq.rate}', '${eq.phone}')">📅 బుక్ చేయండి</button>
            <a href="tel:${eq.phone}" class="eq-btn-link eq-btn-call">📞 కాల్</a>
            <a href="https://wa.me/91${eq.phone}" target="_blank" class="eq-btn-link eq-btn-wa">💬 వాట్సాప్</a>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

// ఫిల్టర్ మారినప్పుడు కాల్ అయ్యే ఫంక్షన్
window.filterEquipmentByRange = function(rangeValue) {
  activeEquipmentFilter = rangeValue;
  renderEquipmentWidget("farmer-pane-equipment");
};
