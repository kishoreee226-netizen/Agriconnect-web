// ==========================================
// 1. Mandi Widget Configuration (Pure Dynamic Data)
// ==========================================
let allMandiRecords = [];

const CROP_CATEGORIES = {
  "ధాన్యాలు (Cereals)": ["Paddy", "Maize", "Wheat", "Bajra", "Jowar", "Barley", "Ragi"],
  "నూనె గింజలు (Oilseeds)": ["Groundnut", "Soyabean", "Mustard", "Sesamum", "Sunflower", "Castor Seed"],
  "కూరగాయలు (Vegetables)": ["Tomato", "Onion", "Potato", "Brinjal", "Cabbage", "Cauliflower", "Green Chilli", "Ladies Finger", "Carrot"],
  "పప్పు ధాన్యాలు (Pulses)": ["Bengal Gram", "Red Gram", "Green Gram", "Black Gram", "Gram", "Lentil"],
  "వాణిజ్య పంటలు (Commercial)": ["Cotton", "Sugarcane", "Jute", "Tobacco"],
  "మసాలా దినుసులు (Spices)": ["Dry Chillies", "Chilli Red", "Turmeric", "Coriander", "Garlic", "Ginger", "Cumin"]
};

// ==========================================
// 2. Fetch Live Mandi JSON Data
// ==========================================
async function fetchMandiData() {
  try {
    const res = await fetch("mandi_live.json?v=" + Date.now(), { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const records = Array.isArray(data) ? data : (data.records || []);
      return records;
    }
  } catch (err) {
    console.error("Mandi data fetch error:", err);
  }
  return [];
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
    const cropName = item.commodity || "పంట";
    const marketName = item.market || item.district || "మార్కెట్";
    const rawPrice = item.modal_price || "N/A";
    
    let formattedPrice = rawPrice;
    if (!isNaN(rawPrice) && rawPrice !== "N/A") {
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

// ==========================================
// 4. Dynamic Filtering (State, Market, Category, Crop)
// ==========================================
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
    const validCrops = CROP_CATEGORIES[selectedCategory];
    validCrops.forEach(crop => {
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

// ==========================================
// 5. Main Render Function
// ==========================================
window.renderMandiWidget = async function() {
  const container = document.getElementById("mandi-container");
  if (!container) return;

  allMandiRecords = await fetchMandiData();

  // JSON లో ఉన్న రాష్ట్రాలను ఆటోమేటిక్‌గా యూనిక్‌గా వేరుచేయడం
  let uniqueStates = [...new Set(allMandiRecords.map(item => item.state).filter(Boolean))].sort();

  // తెలంగాణ ఉంటే మొదటి ఆప్షన్‌గా చూపించడం
  const hasTS = uniqueStates.some(s => s.toLowerCase() === "telangana");
  if (hasTS) {
    uniqueStates = uniqueStates.filter(s => s.toLowerCase() !== "telangana");
    uniqueStates.unshift("Telangana");
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
              ${uniqueStates.map(s => `<option value="${s}" ${s.toLowerCase() === "telangana" ? "selected" : ""}>${s}</option>`).join("")}
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
