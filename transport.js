// transport.js - Ravanaa (Vehicles & Auto/Trolley/Lorry) Widget with Central AgriDB Live Sync

// Central AgriDB నుండి వచ్చే లైవ్ వాహనాల లిస్ట్
let transportList = [];
let isTransportListening = false;

// గ్లోబల్ ట్రాన్స్‌పోర్ట్ ఫిల్టర్ స్టేట్
let activeTransportFilter = "all";

// Central AgriDB / Firestore లైవ్ లిజనర్
function startCentralTransportSync() {
  if (isTransportListening) return;

  if (window.AgriDB && typeof window.AgriDB.listenToServices === 'function') {
    isTransportListening = true;
    window.AgriDB.listenToServices("transport", (items) => {
      formatAndSetTransport(items);
    });
  } else if (window.db) {
    isTransportListening = true;
    window.db.collection("transport").onSnapshot((snapshot) => {
      const items = [];
      snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      formatAndSetTransport(items);
    }, (err) => {
      console.error("Transport live sync error:", err);
    });
  }
}

function formatAndSetTransport(rawItems) {
  transportList = (rawItems || []).map(tr => ({
    id: tr.docId || tr.id,
    name: tr.vehicleType || tr.name || "రవాణా వాహనం",
    driver: tr.driverName || tr.driver || tr.ownerName || "డ్రైవర్",
    rate: tr.rate || (tr.price ? `₹${tr.price}` : "రేటు అందుబాటులో లేదు"),
    phone: tr.phone || tr.driverPhone || "",
    loc: tr.village || tr.loc || "స్థానిక పరిధి",
    distanceKm: Number(tr.distanceKm || 2.0),
    village: tr.villageMatch || "same",
    ...tr
  }));

  if (typeof window.renderTransportWidget === 'function') {
    window.renderTransportWidget("farmer-pane-transport");
  }
}

window.renderTransportWidget = function(targetContainerId = "farmer-pane-transport") {
  const container = document.getElementById(targetContainerId);
  if (!container) return;

  if (!isTransportListening) {
    startCentralTransportSync();
  }

  // ఫిల్టర్ ఆధారంగా వాహనాల జాబితా ఎంపిక
  const filteredList = transportList.filter(tr => {
    if (activeTransportFilter === "village") {
      return tr.village === "same" || tr.distanceKm <= 2;
    } else if (activeTransportFilter === "5") {
      return tr.distanceKm <= 5;
    } else if (activeTransportFilter === "10") {
      return tr.distanceKm <= 10;
    }
    return true;
  });

  container.innerHTML = `
    <!-- రవాణా లొకేషన్ ఫిల్టర్ బార్ -->
    <div class="transport-filter-bar">
      <div class="transport-filter-left">
        <span class="transport-filter-label">📍 పరిధి:</span>
        <select id="tr-loc-filter" onchange="filterTransportByRange(this.value)" class="transport-filter-select">
          <option value="all" ${activeTransportFilter === 'all' ? 'selected' : ''}>అన్ని వాహనాలు</option>
          <option value="village" ${activeTransportFilter === 'village' ? 'selected' : ''}>🏡 నా గ్రామం (2 కి.మీ)</option>
          <option value="5" ${activeTransportFilter === '5' ? 'selected' : ''}>⚡ 5 కి.మీ లోపు</option>
          <option value="10" ${activeTransportFilter === '10' ? 'selected' : ''}>🚛 10 కి.మీ లోపు</option>
        </select>
      </div>
      <span class="transport-count-badge">
        ${filteredList.length} లభ్యం
      </span>
    </div>

    <!-- వాహనాల జాబితా -->
    <div class="eq-list-wrap">
      ${filteredList.length === 0 ? `
        <div class="transport-empty-state">
          ఈ పరిధిలో ప్రస్తుతం రవాణా వాహనాలు అందుబాటులో లేవు.
        </div>
      ` : filteredList.map(tr => `
        <div class="eq-item-card transport-card-item">
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
