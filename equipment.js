// Central DB నుండి డేటా తీసుకునే గ్లోబల్ లిస్ట్
let equipmentList = [];
let isEquipmentListening = false;
let activeEquipmentFilter = "all";

function startCentralEquipmentSync() {
  if (isEquipmentListening) return;

  // firebase-db.js లోని సెంట్రల్ లిజనర్‌ను కాల్ చేయడం
  if (window.AgriDB && typeof window.AgriDB.listenToProviderItems === 'function') {
    isEquipmentListening = true;
    window.AgriDB.listenToProviderItems((items) => {
      equipmentList = (items || []).map(item => ({
        id: item.docId || item.id,
        name: item.vehicleType || item.name || "పరికరము",
        owner: item.ownerName || item.owner || "యజమాని",
        rate: item.price ? `₹${item.price} / గంట` : (item.rate || "ధర లేదు"),
        phone: item.ownerPhone || item.phone || "",
        loc: item.village || item.loc || "స్థానిక పరిధి",
        distanceKm: item.distanceKm || 1.0,
        village: item.villageMatch || "same",
        category: item.category || "equipment",
        ...item
      }));

      // స్క్రీన్ రీ-రెండర్
      if (typeof window.renderEquipmentWidget === 'function') {
        window.renderEquipmentWidget("farmer-pane-equipment");
      }
    });
  }
}

window.renderEquipmentWidget = function(targetContainerId = "farmer-pane-equipment") {
  const container = document.getElementById(targetContainerId);
  if (!container) return;

  // మొదటిసారి కాల్ అయినప్పుడు సెంట్రల్ లిజనర్ స్టార్ట్ అవుతుంది
  if (!isEquipmentListening) {
    startCentralEquipmentSync();
  }

  // ఫిల్టర్ లాజిక్ (కేటగిరీ 'equipment' మరియు దూరం ఆధారంగా)
  const filteredList = equipmentList.filter(eq => {
    if (eq.category && eq.category !== "equipment" && eq.category !== "machinery") {
      return false;
    }

    if (activeEquipmentFilter === "village") {
      return eq.village === "same" || eq.distanceKm <= 2;
    } else if (activeEquipmentFilter === "5") {
      return eq.distanceKm <= 5;
    } else if (activeEquipmentFilter === "10") {
      return eq.distanceKm <= 10;
    }
    return true;
  });

  container.innerHTML = `
    <!-- లైవ్ లొకేషన్ ఫిల్టర్ బార్ -->
    <div class="eq-filter-bar">
      <div class="eq-filter-left">
        <span class="eq-filter-label">📍 పరిధి:</span>
        <select id="eq-loc-filter" onchange="filterEquipmentByRange(this.value)" class="eq-filter-select">
          <option value="all" ${activeEquipmentFilter === 'all' ? 'selected' : ''}>అన్ని ప్రాంతాలు</option>
          <option value="village" ${activeEquipmentFilter === 'village' ? 'selected' : ''}>🏡 నా గ్రామం (2 కి.మీ)</option>
          <option value="5" ${activeEquipmentFilter === '5' ? 'selected' : ''}>⚡ 5 కి.మీ లోపు</option>
          <option value="10" ${activeEquipmentFilter === '10' ? 'selected' : ''}>🚜 10 కి.మీ లోపు</option>
        </select>
      </div>
      <span class="eq-count-badge">
        ${filteredList.length} లభ్యం
      </span>
    </div>

    <!-- పరికరాల లిస్ట్ -->
    <div class="eq-list-wrap">
      ${filteredList.length === 0 ? `
        <div class="eq-empty-state">
          ఈ పరిధిలో ప్రస్తుతం ఎలాంటి పరికరాలు అందుబాటులో లేవు.
        </div>
      ` : filteredList.map(eq => `
        <div class="eq-item-card eq-card-spaced">
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
