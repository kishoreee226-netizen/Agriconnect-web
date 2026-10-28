let allMandiRecords = [];

const CROP_CATEGORIES = {
  "ధాన్యాలు (Cereals)": ["Paddy", "Maize", "Wheat", "Bajra", "Jowar", "Barley", "Ragi"],
  "నూనె గింజలు (Oilseeds)": ["Groundnut", "Soyabean", "Mustard", "Sesamum", "Sunflower", "Castor Seed"],
  "కూరగాయలు (Vegetables)": ["Tomato", "Onion", "Potato", "Brinjal", "Cabbage", "Cauliflower", "Green Chilli", "Ladies Finger", "Carrot"],
  "పప్పు ధాన్యాలు (Pulses)": ["Bengal Gram", "Red Gram", "Green Gram", "Black Gram", "Gram", "Lentil"],
  "వాణిజ్య పంటలు (Commercial)": ["Cotton", "Sugarcane", "Jute", "Tobacco"],
  "మసాలా దినుసులు (Spices)": ["Dry Chillies", "Chilli Red", "Turmeric", "Coriander", "Garlic", "Ginger", "Cumin"]
};

// Pure Dynamic Live Fetcher via Google Apps Script Gateway
async function fetchMandiData() {
  const liveApiUrl = "https://script.google.com/macros/s/AKfycbwMbSz4WVnSNsWpYqJ_FM8tyau90WL5ZUMnBzqICoDkeEsWrDvlZoukDW8KiyBkYbn4yw/exec";

  try {
    console.log("Fetching live data from Apps Script Gateway...");
    const res = await fetch(liveApiUrl, {
      method: "GET",
      mode: "cors"
    });

    if (res.ok) {
      let data = await res.json();
      
      // Handle nested string or parsed object
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.warn("String parse notice:", e);
        }
      }

      const records = data.records || (Array.isArray(data) ? data : []);
      if (records.length > 0) {
        console.log(`SUCCESS: Fetched ${records.length} authentic records!`);
        return records
          .map(r => ({
            state: (r.state || r.State || "").trim(),
            district: (r.district || r.District || "").trim(),
            market: (r.market || r.Market || "").trim(),
            commodity: (r.commodity || r.Commodity || "").trim(),
            modal_price: String(r.modal_price || r.Modal_Price || r.price || "0").trim()
          }))
          .filter(r => r.state && r.commodity && !r.market.toLowerCase().includes("national") && !r.state.toLowerCase().includes("all india"));
      }
    }
  } catch (err) {
    console.error("Live gateway fetch error:", err);
  }

  // Fallback to local snapshot if network is unavailable
  try {
    const localRes = await fetch("mandi_live.json?t=" + Date.now());
    if (localRes.ok) {
      const fallback = await localRes.json();
      return Array.isArray(fallback) ? fallback : (fallback.records || []);
    }
  } catch (e) {
    console.warn("Fallback notice:", e);
  }

  return [];
}

function renderFilteredTable(records) {
  const tableBody = document.getElementById("mandi-table-body");
  if (!tableBody) return;

  if (!records || records.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; padding: 25px; color:#64748b;">
          ఎంచుకున్న పంట / మార్కెట్‌కు సమాచారం అందుబాటులో లేదు.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = records.map(item => {
    const cropName = item.commodity || "పంట";
    const marketName = item.market || item.district || "మార్కెట్";
    const rawPrice = item.modal_price || "0";
    
    let formattedPrice = rawPrice;
    if (!isNaN(rawPrice) && Number(rawPrice) > 0) {
      formattedPrice = Math.round(Number(rawPrice)).toLocaleString("en-IN");
    }

    return `
      <tr class="mandi-row">
        <td class="mandi-col-crop"><strong>${cropName}</strong></td>
        <td class="mandi-col-market">${marketName}</td>
        <td class="mandi-col-price" style="font-weight:700; color:#1b5e20;">₹${formattedPrice}</td>
      </tr>
    `;
  }).join("");
}

function filterMandiRecords() {
  const selectedCategory = document.getElementById("mandi-category-filter")?.value || "";
  const selectedState = (document.getElementById("mandi-state-filter")?.value || "").toLowerCase().trim();
  const selectedCrop = (document.getElementById("mandi-crop-filter")?.value || "").toLowerCase().trim();

  const allowedCrops = selectedCategory ? (CROP_CATEGORIES[selectedCategory] || []).map(c => c.toLowerCase()) : null;

  const filtered = allMandiRecords.filter(item => {
    const itemCrop = (item.commodity || "").toLowerCase();
    const itemState = (item.state || "").toLowerCase();

    const matchesCategory = !allowedCrops || allowedCrops.some(c => itemCrop.includes(c) || c.includes(itemCrop));
    const matchesState = !selectedState || itemState === selectedState || itemState.includes(selectedState);
    const matchesCrop = !selectedCrop || itemCrop === selectedCrop || itemCrop.includes(selectedCrop);

    return matchesCategory && matchesState && matchesCrop;
  });

  renderFilteredTable(filtered);
}

function updateCropDropdown() {
  const selectedCategory = document.getElementById("mandi-category-filter")?.value;
  const selectedState = (document.getElementById("mandi-state-filter")?.value || "").toLowerCase().trim();
  const cropSelect = document.getElementById("mandi-crop-filter");
  if (!cropSelect) return;

  cropSelect.innerHTML = `<option value="">అన్ని పంటలు</option>`;

  let stateRecords = allMandiRecords;
  if (selectedState) {
    stateRecords = allMandiRecords.filter(item => (item.state || "").toLowerCase().includes(selectedState));
  }

  if (selectedCategory && CROP_CATEGORIES[selectedCategory]) {
    CROP_CATEGORIES[selectedCategory].forEach(crop => {
      cropSelect.innerHTML += `<option value="${crop}">${crop}</option>`;
    });
  } else {
    const uniqueCrops = [...new Set(stateRecords.map(item => item.commodity).filter(Boolean))].sort();
    uniqueCrops.forEach(crop => {
      cropSelect.innerHTML += `<option value="${crop}">${crop}</option>`;
    });
  }

  filterMandiRecords();
}

function onStateChange() {
  updateCropDropdown();
  filterMandiRecords();
}

window.renderMandiWidget = async function() {
  const container = document.getElementById("mandi-container");
  if (!container) return;

  container.innerHTML = `
    <div class="mandi-card">
      <div class="mandi-card-header">
        <h3>📈 మండి / Market Live ధరలు</h3>
        <span class="mandi-badge live">🟢 Live Agmarknet</span>
      </div>
      <div class="mandi-body" style="text-align:center; padding:30px; color:#475569;">
        అధికారిక Agmarknet లైవ్ డేటా లోడ్ అవుతోంది...
      </div>
    </div>
  `;

  allMandiRecords = await fetchMandiData();

  let states = [...new Set(allMandiRecords.map(item => item.state).filter(Boolean))].sort();
  states = states.filter(s => !s.toLowerCase().includes("all india") && !s.toLowerCase().includes("national"));

  const hasTS = states.some(s => s.toLowerCase() === "telangana");
  if (hasTS) {
    states = states.filter(s => s.toLowerCase() !== "telangana");
    states.unshift("Telangana");
  }

  container.innerHTML = `
    <div class="mandi-card">
      <div class="mandi-card-header">
        <h3>📈 మండి / Market Live ధరలు</h3>
        <span class="mandi-badge live">🟢 Live Agmarknet</span>
      </div>

      <div class="mandi-body">
        <div class="mandi-filters-grid">
          <div>
            <select id="mandi-category-filter" class="mandi-select">
              <option value="">పంట విభాగం</option>
              ${Object.keys(CROP_CATEGORIES).map(cat => `<option value="${cat}">${cat}</option>`).join("")}
            </select>
          </div>

          <div>
            <select id="mandi-state-filter" class="mandi-select">
              <option value="">రాష్ట్రం ఎంచుకోండి</option>
              ${states.map(s => `<option value="${s}" ${s.toLowerCase() === "telangana" ? "selected" : ""}>${s}</option>`).join("")}
            </select>
          </div>

          <div>
            <select id="mandi-crop-filter" class="mandi-select">
              <option value="">అన్ని పంటలు</option>
            </select>
          </div>
        </div>

        <div class="mandi-table-wrapper">
          <table class="mandi-table">
            <thead>
              <tr class="mandi-table-head-row">
                <th class="mandi-th-crop">పంట</th>
                <th class="mandi-th-market">మార్కెట్</th>
                <th class="mandi-th-price">ధర (క్వింటాల్)</th>
              </tr>
            </thead>
          </table>
          
          <div class="mandi-scroll">
            <table class="mandi-table">
              <tbody id="mandi-table-body"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("mandi-category-filter")?.addEventListener("change", updateCropDropdown);
  document.getElementById("mandi-state-filter")?.addEventListener("change", onStateChange);
  document.getElementById("mandi-crop-filter")?.addEventListener("change", filterMandiRecords);

  updateCropDropdown();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.renderMandiWidget);
} else {
  window.renderMandiWidget();
}
