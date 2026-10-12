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
    <tr style="border-bottom: 1px solid #f8bbd0; font-size: 11px;">
      <td style="padding: 7px 6px; font-weight: 600; color: #880e4f;">${item.commodity || item.Commodity || "పంట"}</td>
      <td style="padding: 7px 6px; color: #4a148c;">${item.market || item.Market || "National APMC"}</td>
      <td style="padding: 7px 6px; font-weight: 700; color: #c2185b; text-align: right;">₹${item.modal_price || item.Modal_Price || item.price || "N/A"}</td>
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
// 5. Main Render Function (Light Pink Theme)
// ==========================================
window.renderMandiWidget = async function() {
  const container = document.getElementById("mandi-container");
  if (!container) return;

  const result = await fetchMandiData();
  allMandiRecords = result.records;

  const isLive = result.isLive;
  const badgeColor = isLive ? "#ad1457" : "#b78103";
  const badgeBg = isLive ? "#fce4ec" : "#fffde7";
  const badgeText = isLive ? "🟢 Live Server" : "🟡 Saved Backup";

  const states = [...new Set(allMandiRecords.map(item => item.state || item.State).filter(Boolean))];
  if (!states.includes("Telangana")) states.unshift("Telangana");
  if (!states.includes("Andhra Pradesh")) states.push("Andhra Pradesh");

  // Mothaniki Light Pink Card Background (#fff0f5) mariyu Header (#fce4ec)
  container.innerHTML = `
    <div style="background: #fff0f5; border: 1.5px solid #f48fb1; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 5px rgba(233,30,99,0.08);">
      
      <!-- Top Title Header Strip (Pink Background) -->
      <div style="background: #fce4ec; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8bbd0;">
        <h3 style="margin: 0; color: #880e4f; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 6px;">
          📈 మార్కెట్ / మండి లైవ్ ధరలు
        </h3>
        <span style="font-size: 10px; background: ${badgeBg}; color: ${badgeColor}; padding: 2px 7px; border-radius: 10px; font-weight: 600; border: 1px solid ${badgeColor}33;">
          ${badgeText}
        </span>
      </div>

      <div style="padding: 10px; background: #fff5f8;">
        <!-- 3 Filter Dropdowns -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 10px;">
          
          <!-- 1. Category -->
          <div>
            <select id="mandi-category-filter" style="width: 100%; font-size: 11px; padding: 6px 4px; border: 1px solid #f48fb1; border-radius: 6px; background: #ffffff; color: #4a148c; outline: none;">
              <option value="">పంట విభాగం (Category)</option>
              ${Object.keys(CROP_CATEGORIES).map(cat => `<option value="${cat}">${cat}</option>`).join("")}
            </select>
          </div>

          <!-- 2. State -->
          <div>
            <select id="mandi-state-filter" style="width: 100%; font-size: 11px; padding: 6px 4px; border: 1px solid #f48fb1; border-radius: 6px; background: #ffffff; color: #4a148c; outline: none;">
              <option value="">రాష్ట్రం (State)</option>
              ${states.map(s => `<option value="${s}">${s}</option>`).join("")}
            </select>
          </div>

          <!-- 3. Crop Type -->
          <div>
            <select id="mandi-crop-filter" style="width: 100%; font-size: 11px; padding: 6px 4px; border: 1px solid #f48fb1; border-radius: 6px; background: #ffffff; color: #4a148c; outline: none;">
              <option value="">పంట (Crop)</option>
            </select>
          </div>

        </div>

        <!-- Scrollable Table Section (Max Height for 3-4 rows with overflow scroll) -->
        <div style="background: #ffffff; border-radius: 6px; border: 1px solid #f8bbd0; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: #fce4ec; font-size: 11px; color: #880e4f; border-bottom: 1px solid #f8bbd0;">
                <th style="padding: 7px 6px;">పంట</th>
                <th style="padding: 7px 6px;">మార్కెట్</th>
                <th style="padding: 7px 6px; text-align: right;">ధర (క్వింటాల్)</th>
              </tr>
            </thead>
          </table>
          
          <div style="max-height: 140px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
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
