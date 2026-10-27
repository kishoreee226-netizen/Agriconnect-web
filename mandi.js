// ==========================================
// 1. Mandi Widget Configuration (New Active Live Endpoint)
// ==========================================
const GOOGLE_APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxKqvw6mvLWY5UgBBWeLbCjurCRllYP2bGESrOaKdMZkiG758qsgQqRzIJgXeQ2bY1dgA/exec";

let allMandiRecords = [];

// పంటల వర్గీకరణ
const CROP_CATEGORIES = {
  "ధాన్యాలు (Cereals)": ["Paddy", "Maize", "Wheat", "Bajra", "Jowar", "Barley", "Ragi"],
  "నూనె గింజలు (Oilseeds)": ["Groundnut", "Soyabean", "Mustard", "Sesamum", "Sunflower", "Castor Seed"],
  "కూరగాయలు (Vegetables)": ["Tomato", "Onion", "Potato", "Brinjal", "Cabbage", "Cauliflower", "Green Chilli", "Ladies Finger", "Carrot"],
  "పప్పు ధాన్యాలు (Pulses)": ["Bengal Gram", "Red Gram", "Green Gram", "Black Gram", "Gram", "Lentil"],
  "వాణిజ్య పంటలు (Commercial)": ["Cotton", "Sugarcane", "Jute", "Tobacco"],
  "మసాలా దినుసులు (Spices)": ["Dry Chillies", "Chilli Red", "Turmeric", "Coriander", "Garlic", "Ginger", "Cumin"]
};

// ==========================================
// 2. Data Fetching Logic (Google Live Endpoint + Local Fallback)
// ==========================================
async function fetchMandiData() {
  try {
    const res = await fetch(GOOGLE_APP_SCRIPT_URL, {
      method: "GET",
      redirect: "follow"
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.records && data.records.length > 0) {
        return { source: "Live Agmarknet", isLive: true, records: data.records };
      }
    }
  } catch (err) {
    console.warn("Live API fetch skipped, trying backup...", err);
  }

  // Backup fallback
  try {
    const localRes = await fetch("mandi_live.json?v=" + Date.now());
    if (localRes.ok) {
      const localData = await localRes.json();
      const records = Array.isArray(localData) ? localData : (localData.records || []);
      if (records.length > 0) {
        return { source: "Saved Backup", isLive: false, records: records };
      }
    }
  } catch (err) {
    console.error("Local backup failed:", err);
  }

  return { source: "None", isLive: false, records: [] };
}

// ==========================================
// 3. Render Table Rows
// ==========================================
function renderFilteredTable(records) {
  const tableBody = document.getElementById("mandi-table-body");
  if (!tableBody) return;

  if (!records || records.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="3" class="mandi-empty-cell" style="text-align:center; padding: 24px; color:#64748b;">
          ఎంచుకున్న ఫిల్టర్‌కు సంబంధించిన సమాచారం అందుబాటులో లేదు.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = records.map(item => {
    const cropName = item.commodity || item.Commodity || "పంట";
    const marketName = item.market || item.Market || item.district || "APMC";
    const rawPrice = item.modal_price || item.Modal_Price || item.price || item.max_price || "N/A";
    
    const formattedPrice = !isNaN(rawPrice) && rawPrice !== "N/A" 
      ? Number(rawPrice).toLocaleString("en-IN") 
      : rawPrice;

    return `
      <tr class="mandi-row">
        <td class="mandi-col-crop"><strong>${cropName}</strong></td>
        <td class="mandi-col-market">${marketName}</td>
        <td class="mandi-col-price" style="font-weight:700; color:#1b5e20;">₹${formattedPrice}</td>
      </tr>
    `;
  }).join("");
}

// ==========================================
// 4. Filtering Logic (Dynamic State, Category & Crop)
// ==========================================
function filterMandiRecords() {
  const selectedCategory = document.getElementById("mandi-category-filter")?.value || "";
  const selectedState = (document.getElementById("mandi-state-filter")?.value || "").toLowerCase().trim();
  const selectedCrop = (document.getElementById("mandi-crop-filter")?.value || "").toLowerCase().trim();

  const allowedCrops = selectedCategory ? (CROP_CATEGORIES[selectedCategory] || []).map(c => c.toLowerCase()) : null;

  const filtered = allMandiRecords.filter(item => {
    const itemCrop = (item.commodity || item.Commodity || "").toLowerCase();
    const itemState = (item.state || item.State || "").toLowerCase();

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

  cropSelect.innerHTML = `<option value="">అన్ని పంటలు (All Crops)</option>`;

  let stateRecords = allMandiRecords;
  if (selectedState) {
    stateRecords = allMandiRecords.filter(item => (item.state || item.State || "").toLowerCase().includes(selectedState));
  }

  if (selectedCategory && CROP_CATEGORIES[selectedCategory]) {
    const validCrops = CROP_CATEGORIES[selectedCategory];
    validCrops.forEach(crop => {
      cropSelect.innerHTML += `<option value="${crop}">${crop}</option>`;
    });
  } else {
    const uniqueCrops = [...new Set(stateRecords.map(item => item.commodity || item.Commodity).filter(Boolean))].sort();
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

// ==========================================
// 5. Main Render Function
// ==========================================
window.renderMandiWidget = async function() {
  const container = document.getElementById("mandi-container");
  if (!container) return;

  container.innerHTML = `
    <div class="mandi-card">
      <div class="mandi-card-header">
        <h3>📈 మండి / Market Live ధరలు</h3>
        <span class="mandi-badge" style="background:#e2e8f0; color:#475569;">⏳ లైవ్ సింక్ అవుతోంది...</span>
      </div>
      <div style="padding: 24px; text-align: center; color: #64748b; font-size: 13px;">
        ప్రభుత్వ మార్కెట్ (Agmarknet) లైవ్ డేటాను సేకరిస్తోంది...
      </div>
    </div>
  `;

  const result = await fetchMandiData();
  allMandiRecords = result.records;

  const isLive = result.isLive;
  const badgeClass = isLive ? "live" : "backup";
  const badgeText = isLive ? "🟢 Live Agmarknet" : "🟡 Saved Backup";

  // డేటాలో ఉన్న అన్ని రాష్ట్రాల పేర్లను సంగ్రహించడం
  let states = [...new Set(allMandiRecords.map(item => item.state || item.State).filter(Boolean))].sort();
  
  // తెలంగాణ ప్రాధాన్యత కోసం ముందు ఉంచడం
  const hasTS = states.some(s => s.toLowerCase() === "telangana");
  states = states.filter(s => s.toLowerCase() !== "telangana");
  if (hasTS) states.unshift("Telangana");

  container.innerHTML = `
    <div class="mandi-card">
      
      <!-- Card Header -->
      <div class="mandi-card-header">
        <h3>📈 మండి / Market Live ధరలు</h3>
        <span class="mandi-badge ${badgeClass}">${badgeText}</span>
      </div>

      <div class="mandi-body">
        <!-- Filters Grid -->
        <div class="mandi-filters-grid">
          <div>
            <select id="mandi-category-filter" class="mandi-select">
              <option value="">పంట విభాగం (Category)</option>
              ${Object.keys(CROP_CATEGORIES).map(cat => `<option value="${cat}">${cat}</option>`).join("")}
            </select>
          </div>

          <div>
            <select id="mandi-state-filter" class="mandi-select">
              <option value="">రాష్ట్రం ఎంచుకోండి (State)</option>
              ${states.map(s => `<option value="${s}" ${s.toLowerCase() === "telangana" ? "selected" : ""}>${s}</option>`).join("")}
            </select>
          </div>

          <div>
            <select id="mandi-crop-filter" class="mandi-select">
              <option value="">అన్ని పంటలు (All Crops)</option>
            </select>
          </div>
        </div>

        <!-- Table Display -->
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
              <tbody id="mandi-table-body">
                <!-- Records will render here -->
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  `;

  // Event Listeners
  document.getElementById("mandi-category-filter")?.addEventListener("change", updateCropDropdown);
  document.getElementById("mandi-state-filter")?.addEventListener("change", onStateChange);
  document.getElementById("mandi-crop-filter")?.addEventListener("change", filterMandiRecords);

  // Initial table display
  updateCropDropdown();
};

// Auto Initialization
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.renderMandiWidget);
} else {
  window.renderMandiWidget();
}
