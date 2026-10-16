// seeds.js - విత్తనాలు & ఎరువుల విడ్జెట్ (4 Advance Filters + Dedicated Live Crop Advisory Board)

const seedsList = [
  { 
    id: "sd1", 
    name: "BPT 5204 (సాంబ మసూరి)", 
    category: "paddy", 
    vendorType: "govt",
    vendor: "రైతు భరోసా కేంద్రం", 
    rate: "₹950 / 25 కేజీలు", 
    priceNum: 950,
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
    vendorType: "pvt",
    vendor: "శ్రీనివాస నర్సరీ", 
    rate: "₹1.20 / మొక్క", 
    priceNum: 300,
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
    vendorType: "govt",
    vendor: "PAC సొసైటీ", 
    rate: "₹1,350 / బస్తా", 
    priceNum: 1350,
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
    vendorType: "pvt",
    vendor: "లక్ష్మి ఆగ్రో ఏజెన్సీస్", 
    rate: "₹864 / ప్యాకెట్", 
    priceNum: 864,
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
    vendorType: "govt",
    vendor: "రైతు సేవా కేంద్రం", 
    rate: "₹1,200 / బస్తా", 
    priceNum: 1200,
    phone: "9876543217", 
    loc: "మండల కేంద్రం", 
    distanceKm: 8.5, 
    stock: "అందుబాటులో ఉంది", 
    inStock: true,
    advice: "🧪 దుక్కిలో ఎకరానికి ఒక బస్తా చొప్పున వేయడం వలన పంట దృఢంగా ఎదుగుతుంది"
  }
];

// పంటల వారీగా ప్రత్యేక సాగు సలహా డేటా (Sowing & Crop Advisory Data)
const cropAdvisoryGuide = {
  all: {
    title: "🌾 ప్రస్తుత సీజన్ సమగ్ర సాగు సలహా",
    points: [
      "విత్తన శుద్ధి తప్పనిసరిగా కార్బండజిమ్ లేదా ట్రైకోడెర్మా విరిడేతో చేయాలి.",
      "భూసార పరీక్ష ఆధారంగా మాత్రమే సిఫార్సు చేసిన మోతాదులో ఎరువులు వాడండి."
    ]
  },
  paddy: {
    title: "🌾 వరి సాగు సూచనలు & సలహాలు",
    points: [
      "ఎకరానికి విత్తన మోతాదు: 20–25 కేజీలు. నారుమడిని ఎండబెట్టకుండా సమృద్ధిగా నీరందించాలి.",
      "విత్తే లోతు: 2-3 సెం.మీ మించకూడదు. నాట్లకు 20-25 రోజుల ముదురు నారు వాడండి."
    ]
  },
  cotton: {
    title: "☁️ పత్తి సాగు సూచనలు & సలహాలు",
    points: [
      "ఎకరానికి 2 ప్యాకెట్లు సరిపోతాయి. సాళ్ల మధ్య 3 అడుగులు, మొక్కల మధ్య 1 అడుగు దూరం ఉంచండి.",
      "మొదటి 45 రోజులు గులాబీ రంగు పురుగు, రసం పీల్చే పురుగుల పట్ల అప్రమత్తంగా ఉండాలి."
    ]
  },
  chilli: {
    title: "🌶️ మిరప నారు & సాగు సూచనలు",
    points: [
      "ఎకరానికి 10,000 నుండి 11,000 నారు మొక్కలు అవసరం. బెడ్లపై ఎత్తుగా నాటుకోవాలి.",
      "వైరస్ మరియు తామర పురుగుల నివారణకు వేపనూనె లేదా తగిన మితమైన స్ప్రేయింగ్ చేపట్టండి."
    ]
  },
  fertilizer: {
    title: "🧪 ఎరువుల సమగ్ర యాజమాన్యం",
    points: [
      "దుక్కిలో భాస్వరం (DAP/Super Phosphate) మరియు పొటాష్ పూర్తి మోతాదు వేయాలి.",
      "నత్రజని (యూరియా) ని ఒకేసారి వేయకుండా 2-3 దఫాలుగా విభజించి పంటకు అందించండి."
    ]
  }
};

// గ్లోబల్ విత్తనాల ఫిల్టర్ స్టేట్స్
let activeSeedCrop = "all";
let activeSeedStock = "all";
let activeSeedVendor = "all";
let activeSeedPrice = "all";
let activeSeedRange = "all";

window.renderSeedsWidget = function(targetContainerId = "farmer-pane-seeds") {
  const container = document.getElementById(targetContainerId);
  if (!container) return;

  // అడ్వాన్స్ ఫిల్టరింగ్ లాజిక్
  const filteredSeeds = seedsList.filter(item => {
    // 1. పంట రకం
    let cropMatch = true;
    if (activeSeedCrop !== "all") {
      cropMatch = item.category === activeSeedCrop;
    }

    // 2. స్టాక్ స్థితి
    let stockMatch = true;
    if (activeSeedStock === "available") {
      stockMatch = item.inStock === true;
    }

    // 3. డీలర్ రకం (PACS / ప్రైవేట్)
    let vendorMatch = true;
    if (activeSeedVendor !== "all") {
      vendorMatch = item.vendorType === activeSeedVendor;
    }

    // 4. ధర పరిధి
    let priceMatch = true;
    const p = item.priceNum || 0;
    if (activeSeedPrice === "low") {
      priceMatch = p <= 500;
    } else if (activeSeedPrice === "mid") {
      priceMatch = p > 500 && p <= 1000;
    } else if (activeSeedPrice === "high") {
      priceMatch = p > 1000;
    }

    // 5. పరిధి (దూరం)
    let rangeMatch = true;
    if (activeSeedRange === "village") {
      rangeMatch = item.distanceKm <= 2.5;
    } else if (activeSeedRange === "5") {
      rangeMatch = item.distanceKm <= 5.0;
    } else if (activeSeedRange === "10") {
      rangeMatch = item.distanceKm <= 10.0;
    }

    return cropMatch && stockMatch && vendorMatch && priceMatch && rangeMatch;
  });

  // ప్రస్తుత పంట ఎంపిక ఆధారంగా లైవ్ గైడెన్స్ టెక్స్ట్
  const currentAdvisory = cropAdvisoryGuide[activeSeedCrop] || cropAdvisoryGuide.all;

  container.innerHTML = `
    <!-- విత్తనాలు & ఎరువుల అడ్వాన్స్ ఫిల్టర్ల బార్ -->
    <div class="seeds-filter-bar" style="background:#f1f8e9; padding:10px; border-radius:8px; margin-bottom:10px; border:1px solid #dcedc8; box-sizing:border-box;">
      
      <!-- టాప్ రో: హెడ్డింగ్ + పరిధి డ్రాప్‌డౌన్ + కౌంట్ బ్యాడ్జ్ -->
      <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-bottom:8px;">
        <span style="font-size:12px; font-weight:bold; color:#2e7d32; white-space:nowrap;">🌱 అడ్వాన్స్ ఫిల్టర్లు:</span>
        
        <div style="display:flex; align-items:center; gap:6px;">
          <select onchange="applyAdvSeedFilter('range', this.value)" style="padding:4px 6px; border-radius:6px; border:1px solid #aed581; font-size:11px; background:#fff; font-weight:600; color:#2e7d32; outline:none; max-width:130px;">
            <option value="all" ${activeSeedRange === 'all' ? 'selected' : ''}>📍 పరిధి (అన్నీ)</option>
            <option value="village" ${activeSeedRange === 'village' ? 'selected' : ''}>🏡 నా గ్రామం (2.5km)</option>
            <option value="5" ${activeSeedRange === '5' ? 'selected' : ''}>⚡ 5 కి.మీ లోపు</option>
            <option value="10" ${activeSeedRange === '10' ? 'selected' : ''}>🏬 10 కి.మీ లోపు</option>
          </select>

          <span style="font-size:11px; background:#2e7d32; color:#fff; padding:3px 8px; border-radius:12px; font-weight:bold; white-space:nowrap;">
            ${filteredSeeds.length} లభ్యం
          </span>
        </div>
      </div>

      <!-- 4 అడ్వాన్స్ ఫిల్టర్లు (2x2 Grid) -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
        <!-- 1. పంట రకం -->
        <select onchange="applyAdvSeedFilter('crop', this.value)" style="padding:4px 6px; border-radius:6px; border:1px solid #aed581; font-size:11px; background:#fff; font-weight:600; color:#2e7d32; outline:none;">
          <option value="all" ${activeSeedCrop === 'all' ? 'selected' : ''}>🌾 అన్ని పంటలు</option>
          <option value="paddy" ${activeSeedCrop === 'paddy' ? 'selected' : ''}>🌾 వరి (Paddy)</option>
          <option value="cotton" ${activeSeedCrop === 'cotton' ? 'selected' : ''}>☁️ పత్తి (Cotton)</option>
          <option value="chilli" ${activeSeedCrop === 'chilli' ? 'selected' : ''}>🌶️ మిర్చి (Chilli)</option>
          <option value="fertilizer" ${activeSeedCrop === 'fertilizer' ? 'selected' : ''}>🧪 ఎరువులు/DAP</option>
        </select>

        <!-- 2. స్టాక్ లభ్యత -->
        <select onchange="applyAdvSeedFilter('stock', this.value)" style="padding:4px 6px; border-radius:6px; border:1px solid #aed581; font-size:11px; background:#fff; font-weight:600; color:#2e7d32; outline:none;">
          <option value="all" ${activeSeedStock === 'all' ? 'selected' : ''}>📦 స్టాక్ (అన్నీ)</option>
          <option value="available" ${activeSeedStock === 'available' ? 'selected' : ''}>✅ తక్షణ లభ్యం ఉన్నవి</option>
        </select>

        <!-- 3. డీలర్ / సొసైటీ రకం -->
        <select onchange="applyAdvSeedFilter('vendor', this.value)" style="padding:4px 6px; border-radius:6px; border:1px solid #aed581; font-size:11px; background:#fff; font-weight:600; color:#2e7d32; outline:none;">
          <option value="all" ${activeSeedVendor === 'all' ? 'selected' : ''}>🏛️ విక్రేత (అన్నీ)</option>
          <option value="govt" ${activeSeedVendor === 'govt' ? 'selected' : ''}>🏛️ PACS / రైతు భరోసా</option>
          <option value="pvt" ${activeSeedVendor === 'pvt' ? 'selected' : ''}>🏪 ప్రైవేట్ డీలర్లు</option>
        </select>

        <!-- 4. ధర బడ్జెట్ -->
        <select onchange="applyAdvSeedFilter('price', this.value)" style="padding:4px 6px; border-radius:6px; border:1px solid #aed581; font-size:11px; background:#fff; font-weight:600; color:#2e7d32; outline:none;">
          <option value="all" ${activeSeedPrice === 'all' ? 'selected' : ''}>💰 ధర (అన్నీ)</option>
          <option value="low" ${activeSeedPrice === 'low' ? 'selected' : ''}>₹500 లోపు</option>
          <option value="mid" ${activeSeedPrice === 'mid' ? 'selected' : ''}>₹500 - ₹1000</option>
          <option value="high" ${activeSeedPrice === 'high' ? 'selected' : ''}>₹1000 పైబడి</option>
        </select>
      </div>
    </div>

    <!-- 💡 ప్రత్యేక సాగు సలహా బోర్డు (Dedicated Crop Guidance & Advisory Board) -->
    <div class="crop-guidance-board" style="background:#fffde7; border:1px solid #fff59d; border-left:4px solid #fbc02d; border-radius:8px; padding:10px; margin-bottom:12px;">
      <div style="font-size:12px; font-weight:bold; color:#f57f17; margin-bottom:4px; display:flex; align-items:center; gap:5px;">
        <span>💡</span> ${currentAdvisory.title}
      </div>
      <ul style="margin:0; padding-left:16px; font-size:11px; color:#5d4037; line-height:1.4;">
        ${currentAdvisory.points.map(pt => `<li>${pt}</li>`).join('')}
      </ul>
    </div>

    <!-- విత్తనాలు & ఎరువుల జాబితా -->
    <div class="eq-list-wrap">
      ${filteredSeeds.length === 0 ? `
        <div style="text-align:center; padding:18px; color:#555; font-size:13px; background:#fff; border-radius:8px; border:1px dashed #c5e1a5;">
          📢 మీరు ఎంచుకున్న ఫిల్టర్లకు సరిపడే విత్తనాలు లేదా ఎరువులు ప్రస్తుతం అందుబాటులో లేవు.
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

          <div class="eq-actions-row" style="margin-top:8px;">
            <button type="button" class="eq-btn-link eq-btn-book" onclick="openBookingModal('${seed.name}', '${seed.vendor}', '${seed.rate}', '${seed.phone}')">📅 రిజర్వ్ / బుక్</button>
            <a href="tel:${seed.phone}" class="eq-btn-link eq-btn-call">📞 కాల్ చేయండి</a>
            <a href="https://wa.me/91${seed.phone}" target="_blank" class="eq-btn-link eq-btn-wa">💬 వాట్సాప్</a>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

// అడ్వాన్స్ ఫిల్టర్ల హ్యాండ్లర్
window.applyAdvSeedFilter = function(type, val) {
  if (type === 'crop') activeSeedCrop = val;
  if (type === 'stock') activeSeedStock = val;
  if (type === 'vendor') activeSeedVendor = val;
  if (type === 'price') activeSeedPrice = val;
  if (type === 'range') activeSeedRange = val;
  renderSeedsWidget();
};
