// Equipment Dummy Data & State
const equipmentList = [
  { id: "eq1", name: "ట్రాక్టర్ (Mahindra 575)", owner: "రామయ్య", rate: "₹800 / గంట", phone: "9876543210", loc: "గ్రామం సమీపం" },
  { id: "eq2", name: "వరి కోత మిషన్ (Harvester)", owner: "వెంకటేష్", rate: "₹2,200 / గంట", phone: "9876543211", loc: "5 కి.మీ పరిధి" },
  { id: "eq3", name: "డ్రోన్ స్ప్రేయర్ (పురుగు మందులు)", owner: "కిరణ్ అగ్రిటెక్", rate: "₹450 / ఎకరా", phone: "9876543212", loc: "ఆర్డర్‌పై లభ్యం" }
];

window.renderEquipmentWidget = function(targetContainerId = "farmer-pane-equipment") {
  const container = document.getElementById(targetContainerId);
  if (!container) return;

  container.innerHTML = `
    <div class="eq-list-wrap">
      ${equipmentList.map(eq => `
        <div class="eq-item-card">
          <div class="eq-top-row">
            <div>
              <div class="eq-name">${eq.name}</div>
              <div class="eq-owner-meta">యజమాని: <b>${eq.owner}</b> | 📍 ${eq.loc}</div>
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
