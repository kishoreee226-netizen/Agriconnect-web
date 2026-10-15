// ==========================================
// 1. Mandi Widget Configuration
// ==========================================
const MANDI_API_KEY = "579b464db66ecb3875b39ed9319231f2";
const GOVT_API_URL = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${MANDI_API_KEY}&format=json&filters[state]=Telangana`;

let allMandiRecords = [];

// Crop Categories Map
const CROP_CATEGORIES = {
  "ధాన్యాలు (Cereals)": ["Paddy(Common)", "Paddy", "Maize", "Wheat", "Bajra", "Jowar"],
  "నూనె గింజలు (Oilseeds)": ["Groundnut", "Soyabean", "Mustard", "Sesamum", "Sunflower", "Castor Seed"],
  "కూరగాయలు (Vegetables)": ["Tomato", "Onion", "Potato", "Brinjal", "Cabbage", "Cauliflower", "Green Chilli"],
  "పప్పు ధాన్యాలు (Pulses)": ["Bengal Gram", "Red Gram", "Green Gram", "Black Gram"],
  "వాణిజ్య పంటలు (Commercial)": ["Cotton", "Sugarcane", "Jute", "Tobacco"],
  "మసాలా దినుసులు (Spices)": ["Dry Chillies", "Turmeric", "Coriander", "Garlic", "Ginger"]
};

// ==========================================
// 2. Data Fetching Logic (Live + Backup)
// ==========================================
async function fetchMandiData() {
  try {
    const liveResponse = await fetch(GOVT_API_URL, { signal: AbortSignal.timeout(4000) });
    if (liveResponse.ok) {
      const liveData = await liveResponse.json();
      const records = liveData.records || [];
      if (records.length > 0) {
        return { source: "Live Server", isLive: true, records: records };
      }
    }
  } catch (err) {
    console.warn("Govt API timeout / CORS issue. Backup json load avthondi...", err);
  }

  try {
    const localResponse = await fetch("mandi_live.json?v=" + new Date().getTime());
    if (localResponse.ok) {
      const localData = await localResponse.json();
      const backupRecords = Array.isArray(localData) ? localData : (localData.records || []);
      return { source: "Saved Backup", isLive: false, records: backupRecords };
    }
  } catch (err) {
    console.error("Local mandi_live.json load kaledhu:", err);
  }

  return { source: "None", isLive: false, records: [] };
}

// ==========================================
// 3. Render Table Rows (Scrollable - All Records)
// ==========================================
function renderFilteredTable(records) {
  const tableBody = document.getElementById("mandi-table-body");
  if (!tableBody) return;

  if (!records || records.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="3" style="padding: 12px; text-align: center; color: #888; font-size: 11px;">
          ఎలాంటి పంటల సమాచారం దొరకలేదు.
        </td>
      </tr>
    `;
    return;
  }

    // records.slice limit theesivesi mottham records chupisthunnam
  tableBody.innerHTML = records.map(item => `
    <tr class="mandi-row">
      <td class="mandi-col-crop">${item.commodity || item.Commodity || "పంట"}</td>
      <td class="mandi-col-market">${item.market || item.Market || "National APMC"}</td>
      <td class="mandi-col-price">₹${item.modal_price || item.Modal_Price || item.price || "N/A"}</td>
    </tr>
  `).join("");
}

// ==========================================
// 4. Filtering Logic
// ==========================================
function filterMandiRecords() {
  const selectedCategory = document.getElementById("mandi-category-filter")?.value || "";
  const selectedState = document.getElementById("mandi-state-filter")?.value.toLowerCase().trim() || "";
  const selectedCrop = document.getElementById("mandi-crop-filter")?.value.toLowerCase().trim() || "";

  const allowedCrops = selectedCategory ? (CROP_CATEGORIES[selectedCategory] || []).map(c => c.toLowerCase()) : null;

  const filtered = allMandiRecords.filter(item => {
    const itemCrop = (item.commodity || item.Commodity || "").toLowerCase();
    const itemState = (item.state || item.State || "Telangana").toLowerCase();

    const matchesCategory = !allowedCrops || allowedCrops.some(c => itemCrop.includes(c) || c.includes(itemCrop));
    const matchesState = !selectedState || itemState.includes(selectedState);
    const matchesCrop = !selectedCrop || itemCrop.includes(selectedCrop);

    return matchesCategory && matchesState && matchesCrop;
  });

  renderFilteredTable(filtered);
}

function updateCropDropdown() {
  const selectedCategory = document.getElementById("mandi-category-filter")?.value;
  const cropSelect = document.getElementById("mandi-crop-filter");
  if (!cropSelect) return;

  cropSelect.innerHTML = `<option value="">అన్ని పంటలు (All Crops)</option>`;

  if (selectedCategory && CROP_CATEGORIES[selectedCategory]) {
    CROP_CATEGORIES[selectedCategory].forEach(crop => {
      cropSelect.innerHTML += `<option value="${crop}">${crop}</option>`;
    });
  } else {
    const uniqueCrops = [...new Set(allMandiRecords.map(item => item.commodity || item.Commodity).filter(Boolean))];
    uniqueCrops.forEach(crop => {
      cropSelect.innerHTML += `<option value="${crop}">${crop}</option>`;
    });
  }

  filterMandiRecords();
}

// ==========================================
// 5. Main Render Function (Clean Template)
// ==========================================
window.renderMandiWidget = async function() {
  const container = document.getElementById("mandi-container");
  if (!container) return;

  const result = await fetchMandiData();
  allMandiRecords = result.records;

  const isLive = result.isLive;
  const badgeClass = isLive ? "live" : "backup";
  const badgeText = isLive ? "🟢 Live Server" : "🟡 Saved Backup";

  const states = [...new Set(allMandiRecords.map(item => item.state || item.State).filter(Boolean))];
  if (!states.includes("Telangana")) states.unshift("Telangana");
  if (!states.includes("Andhra Pradesh")) states.push("Andhra Pradesh");

  container.innerHTML = `
    <div class="mandi-card">
      
      <!-- Top Title Header Strip -->
      <div class="mandi-card-header">
        <h3>📈 మండి / Market live ధరలు</h3>
        <span class="mandi-badge ${badgeClass}">${badgeText}</span>
      </div>

      <div class="mandi-body">
        <!-- 3 Filter Dropdowns -->
        <div class="mandi-filters-grid">
          <div>
            <select id="mandi-category-filter" class="mandi-select">
              <option value="">పంట విభాగం (Category)</option>
              ${Object.keys(CROP_CATEGORIES).map(cat => `<option value="${cat}">${cat}</option>`).join("")}
            </select>
          </div>

          <div>
            <select id="mandi-state-filter" class="mandi-select">
              <option value="">రాష్ట్రం (State)</option>
              ${states.map(s => `<option value="${s}">${s}</option>`).join("")}
            </select>
          </div>

          <div>
            <select id="mandi-crop-filter" class="mandi-select">
              <option value="">పంట (Crop)</option>
            </select>
          </div>
        </div>

        <!-- Scrollable Table Section -->
        <div class="mandi-table-wrapper">
          <table class="mandi-table">
            <thead>
              <tr class="mandi-table-head-row">
                <th>పంట</th>
                <th>మార్కెట్</th>
                <th style="text-align: right;">ధర (క్వింటాల్)</th>
              </tr>
            </thead>
          </table>
          
          <div class="mandi-scroll">
            <table class="mandi-table">
              <tbody id="mandi-table-body">
                <!-- Records render ikkada avuthayi -->
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  `;


  // Event Listeners
  document.getElementById("mandi-category-filter").addEventListener("change", updateCropDropdown);
  document.getElementById("mandi-state-filter").addEventListener("change", filterMandiRecords);
  document.getElementById("mandi-crop-filter").addEventListener("change", filterMandiRecords);

  // Initialize dropdown & table
  updateCropDropdown();
};
