// seeds.js - విత్తనాలు & ఎరువుల విడ్జెట్ (Crop Filter, Live Stock, Sowing Advice & Booking)

const seedsList = [
  { 
    id: "sd1", 
    name: "BPT 5204 (సాంబ మసూరి)", 
    category: "paddy", 
    vendor: "రైతు భరోసా కేంద్రం", 
    rate: "₹950 / 25 కేజీలు", 
    phone: "9876543213", 
    loc: "సమీప సొసైటీ", 
    distanceKm: 2.0, 
    stock: "అందుబాటులో ఉంది (45 బస్తాలు)", 
    inStock: true,
    advice: "🌱 ఎకరానికి 20-25 కేజీలు అవసరం | జూన్-జులై నాట్లకు అనుకూలం | లోతు: 2-3 సెం.మీ"
  },
  { 
    id: "sd2", 
    name: "మిర్చి నారు (తేజ రకం)", 
    category: "chilli", 
    vendor: "శ్రీనివాస నర్సరీ", 
    rate: "₹1.20 / మొక్క", 
    phone: "9876543214", 
    loc: "హైబ్రిడ్ విత్తనాలు", 
    distanceKm: 4.5, 
    stock: "లభ్యం (12,000 మొక్కలు)", 
    inStock: true,
    advice: "🌶️ ఎకరానికి 10,000-11,000 నారు మొక్కలు | వరుసల దూరం: 2.5 అడుగులు"
  },
  { 
    id: "sd3", 
    name: "యూరియా & DAP ఎరువులు", 
    category: "fertilizer", 
    vendor: "PAC సొసైటీ", 
    rate: "సబ్సిడీ ధరలు", 
    phone: "9876543215", 
    loc: "సొసైటీ గోదాము", 
    distanceKm: 3.0, 
    stock: "పరిమిత స్టాక్ (Limited)", 
    inStock: true,
    advice: "🧪 మొదటి దఫా నాట్ల సమయంలో DAP, 25 రోజుల తర్వాత యూరియా వేయండి"
  },
  { 
    id: "sd4", 
    name: "రాశి 659 పత్తి విత్తనాలు (BG-II)", 
    category: "cotton", 
    vendor: "లక్ష్మి ఆగ్రో ఏజెన్సీస్", 
    rate: "₹864 / ప్యాకెట్", 
    phone: "9876543216", 
    loc: "మార్కెట్ యార్డ్ ఎదురుగా", 
    distanceKm: 6.0, 
    stock: "అందుబాటులో ఉంది", 
    inStock: true,
    advice: "☁️ ఎకరానికి 2 ప్యాకెట్లు | సాళ్ల మధ్య 3 అడుగులు, మొక్కల మధ్య 1 అడుగు దూరం"
  },
  { 
    id: "sd5", 
    name: "పొటాష్ & 20:20:0:13 ఎరువులు", 
    category: "fertilizer", 
    vendor: "రైతు సేవా కేంద్రం", 
    rate: "ప్రభుత్వ ధర", 
    phone: "9876543217", 
    loc: "మండల కేంద్రం", 
    distanceKm: 8.5, 
    stock: "అందుబాటులో ఉంది", 
    inStock: true,
    advice: "🧪 దుక్కిలో ఎకరానికి ఒక బస్తా చొప్పున వేయడం వలన పంట దృఢంగా ఎదుగుతుంది"
  }
];

// గ్లోబల్ విత్తనాల ఫిల్టర్ స్టేట్స్
let activeSeedCategory = "all";
let activeSeedRange = "all";

window.renderSeedsWidget = function(targetContainerId = "farmer-pane-seeds") {
  const container = document.getElementById(targetContainerId);
  if (!container) return;

  // పంట రకం మరియు పరిధి ఆధారంగా ఫిల్టర్
  const filteredSeeds = seedsList.filter(item => {
    let catMatch = true;
    if (activeSeedCategory !== "all") {
      catMatch = item.category === activeSeedCategory;
    }

    let rangeMatch = true;
    if (activeSeedRange === "village") {
      rangeMatch = item.distanceKm <= 2.5;
    } else if (activeSeedRange === "5") {
      rangeMatch = item.distanceKm <= 5.0;
    } else if (activeSeedRange === "10") {
      rangeMatch = item.distanceKm <= 10.0;
    }

    return catMatch && rangeMatch;
  });

  container.innerHTML = `
    <!-- విత్తనాలు & ఎరువుల లైవ్ ఫిల్టర్ బార్ -->
    <div class="seeds-filter-bar" style="background:#f1f8e9; padding:10px; border-radius:8px; margin-bottom:12px; border:1px solid #dcedc8;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-size:12px; font-weight:bold; color:#2e7d32;">🌱 విత్తనాలు & ఎరువుల ఫిల్టర్:</span>
        <span style="font-size:11px; background:#2e7d32; color:#fff; padding:3px 8px; border-radius:12px; font-weight:bold;">
          ${filteredSeeds.length} రకాలు లభ్యం
        </span>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
        <!-- 1. పంట రకం డ్రాప్‌డౌన్ -->
        <select onchange="applySeedFilter('category', this.value)" style="padding:5px 6px; border-radius:6px; border:1px solid #aed581; font-size:11px; background:#fff; font-weight:600; color:#2e7d32; outline:none;">
          <option value="all" ${activeSeedCategory === 'all' ? 'selected' : ''}>🌾 అన్ని రకాలు (All Items)</option>
          <option value="paddy" ${activeSeedCategory === 'paddy' ? 'selected' : ''}>🌾 వరి విత్తనాలు (Paddy)</option>
          <option value="cotton" ${activeSeedCategory === 'cotton' ? 'selected' : ''}>☁️ పత్తి విత్తనాలు (Cotton)</option>
          <option value="chilli" ${activeSeedCategory === 'chilli' ? 'selected' : ''}>🌶️ మిర్చి నారు / విత్తనాలు</option>
          <option value="fertilizer" ${activeSeedCategory === 'fertilizer' ? 'selected' : ''}>🧪 ఎరువులు & మందులు (Fertilizers)</option>
        </select>

        <!-- 2. పరిధి / దూరం డ్రాప్‌డౌన్ -->
        <select onchange="applySeedFilter('range', this.value)" style="padding:5px 6px; border-radius:6px; border:1px solid #aed581; font-size:11px; background:#fff; font-weight:600; color:#2e7d32; outline:none;">
          <option value="all" ${activeSeedRange === 'all' ? 'selected' : ''}>📍 పరిధి (అన్ని డీలర్లు)</option>
          <option value="village" ${activeSeedRange === 'village' ? 'selected' : ''}>🏡 నా గ్రామం (2.5 కి.మీ)</option>
          <option value="5" ${activeSeedRange === '5' ? 'selected' : ''}>⚡ 5 కి.మీ లోపు</option>
          <option value="10" ${activeSeedRange === '10' ? 'selected' : ''}>🏬 10 కి.మీ లోపు</option>
        </select>
      </div>
    </div>

    <!-- విత్తనాలు & ఎరువుల జాబితా -->
    <div class="eq-list-wrap">
      ${filteredSeeds.length === 0 ? `
        <div style="text-align:center; padding:18px; color:#555; font-size:13px; background:#fff; border-radius:8px; border:1px dashed #c5e1a5;">
          📢 ఈ రకం విత్తనాలు లేదా ఎరువులు ప్రస్తుతం అందుబాటులో లేవు.
        </div>
      ` : filteredSeeds.map(seed => `
        <div class="eq-item-card" style="margin-bottom:10px;">
          <div class="eq-top-row">
            <div>
              <div class="eq-name" style="color:#1b5e20;">${seed.name}</div>
              <div class="eq-owner-meta">డీలర్/సొసైటీ: <b>${seed.vendor}</b> | 📍 ${seed.loc} (${seed.distanceKm} కి.మీ)</div>
              <div style="margin-top:4px;">
                <span style="font-size:10px; background:#e8f5e9; color:#2e7d32; padding:2px 6px; border-radius:4px; font-weight:bold; border:1px solid #c8e6c9;">
                  📦 స్టాక్: ${seed.stock}
                </span>
              </div>
            </div>
            <div class="eq-price-badge">${seed.rate}</div>
          </div>

          <!-- గైడెన్స్ కార్డ్ (Sowing / Usage Advice) -->
          <div style="background:#f9fbe7; border-left:3px solid #8bc34a; padding:6px 8px; margin:8px 0; border-radius:4px; font-size:11px; color:#33691e; line-height:1.4;">
            <b>💡 సాగు సూచన:</b> ${seed.advice}
          </div>

          <div class="eq-actions-row">
            <button type="button" class="eq-btn-link eq-btn-book" onclick="openBookingModal('${seed.name}', '${seed.vendor}', '${seed.rate}', '${seed.phone}')">📅 రిజర్వ్ / బుక్</button>
            <a href="tel:${seed.phone}" class="eq-btn-link eq-btn-call">📞 కాల్ చేయండి</a>
            <a href="https://wa.me/91${seed.phone}" target="_blank" class="eq-btn-link eq-btn-wa">💬 వాట్సాప్</a>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

// ఫిల్టర్ ఈవెంట్ హ్యాండ్లర్
window.applySeedFilter = function(type, val) {
  if (type === 'category') activeSeedCategory = val;
  if (type === 'range') activeSeedRange = val;
  renderSeedsWidget();
};
