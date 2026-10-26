// seeds.js - విత్తనాలు & ఎరువుల విడ్జెట్ (AgriDB Live Sync + 4 Advance Filters + Dedicated Live Crop Advisory Board)

// Central AgriDB నుండి వచ్చే లైవ్ విత్తనాల లిస్ట్
let seedsList = [];
let isSeedsListening = false;

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

// సెంట్రల్ AgriDB లైవ్ లిజనర్ ప్రారంభం
function startCentralSeedsSync() {
  if (isSeedsListening) return;

  if (window.AgriDB && typeof window.AgriDB.listenToServices === 'function') {
    isSeedsListening = true;
    window.AgriDB.listenToServices("seeds", (items) => {
      formatAndSetSeeds(items);
    });
  } else if (window.db) {
    isSeedsListening = true;
    window.db.collection("seeds").onSnapshot((snapshot) => {
      const items = [];
      snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      formatAndSetSeeds(items);
    }, (err) => {
      console.error("Seeds live sync error:", err);
    });
  }
}

function formatAndSetSeeds(rawItems) {
  seedsList = (rawItems || []).map(item => ({
    id: item.docId || item.id,
    name: item.seedName || item.name || "విత్తనాలు / ఎరువులు",
    category: item.category || "paddy",
    vendorType: item.vendorType || "govt",
    vendor: item.vendor || item.dealerName || "సమీప డీలర్",
    rate: item.rate || (item.price ? `₹${item.price}` : "ధర అందుబాటులో లేదు"),
    priceNum: Number(item.priceNum || item.price || 0),
    phone: item.phone || item.dealerPhone || "",
    loc: item.village || item.loc || "సమీప కేంద్రం",
    distanceKm: Number(item.distanceKm || 2.0),
    stock: item.stock || "అందుబాటులో ఉంది",
    inStock: item.inStock !== undefined ? item.inStock : true,
    advice: item.advice || ""
  }));

  if (typeof window.renderSeedsWidget === 'function') {
    window.renderSeedsWidget("farmer-pane-seeds");
  }
}

window.renderSeedsWidget = function(targetContainerId = "farmer-pane-seeds") {
  const container = document.getElementById(targetContainerId);
  if (!container) return;

  if (!isSeedsListening) {
    startCentralSeedsSync();
  }

  // అడ్వాన్స్ ఫిల్టరింగ్ లాజిక్
  const filteredSeeds = seedsList.filter(item => {
    let cropMatch = (activeSeedCrop === "all") || (item.category === activeSeedCrop);
    let stockMatch = (activeSeedStock === "all") || (item.inStock === true);
    let vendorMatch = (activeSeedVendor === "all") || (item.vendorType === activeSeedVendor);

    let priceMatch = true;
    const p = item.priceNum || 0;
    if (activeSeedPrice === "low") priceMatch = p <= 500;
    else if (activeSeedPrice === "mid") priceMatch = p > 500 && p <= 1000;
    else if (activeSeedPrice === "high") priceMatch = p > 1000;

    let rangeMatch = true;
    if (activeSeedRange === "village") rangeMatch = item.distanceKm <= 2.5;
    else if (activeSeedRange === "5") rangeMatch = item.distanceKm <= 5.0;
    else if (activeSeedRange === "10") rangeMatch = item.distanceKm <= 10.0;

    return cropMatch && stockMatch && vendorMatch && priceMatch && rangeMatch;
  });

  const currentAdvisory = cropAdvisoryGuide[activeSeedCrop] || cropAdvisoryGuide.all;

  container.innerHTML = `
    <!-- విత్తనాలు & ఎరువుల అడ్వాన్స్ ఫిల్టర్ల బార్ -->
    <div class="seeds-filter-bar">
      
      <!-- టాప్ రో: హెడ్డింగ్ + పరిధి డ్రాప్‌డౌన్ + కౌంట్ బ్యాడ్జ్ -->
      <div class="seeds-filter-top">
        <span class="seeds-filter-heading">🌱 అడ్వాన్స్ ఫిల్టర్లు:</span>
        
        <div class="seeds-filter-top-right">
          <select onchange="applyAdvSeedFilter('range', this.value)" class="seeds-select-range">
            <option value="all" ${activeSeedRange === 'all' ? 'selected' : ''}>📍 పరిధి (అన్నీ)</option>
            <option value="village" ${activeSeedRange === 'village' ? 'selected' : ''}>🏡 నా గ్రామం (2.5km)</option>
            <option value="5" ${activeSeedRange === '5' ? 'selected' : ''}>⚡ 5 కి.మీ లోపు</option>
            <option value="10" ${activeSeedRange === '10' ? 'selected' : ''}>🏬 10 కి.మీ లోపు</option>
          </select>

          <span class="seeds-count-badge">
            ${filteredSeeds.length} లభ్యం
          </span>
        </div>
      </div>

      <!-- 4 అడ్వాన్స్ ఫిల్టర్లు (2x2 Grid) -->
      <div class="seeds-filter-grid">
        <!-- 1. పంట రకం -->
        <select onchange="applyAdvSeedFilter('crop', this.value)" class="seeds-filter-select">
          <option value="all" ${activeSeedCrop === 'all' ? 'selected' : ''}>🌾 అన్ని పంటలు</option>
          <option value="paddy" ${activeSeedCrop === 'paddy' ? 'selected' : ''}>🌾 వరి (Paddy)</option>
          <option value="cotton" ${activeSeedCrop === 'cotton' ? 'selected' : ''}>☁️ పత్తి (Cotton)</option>
          <option value="chilli" ${activeSeedCrop === 'chilli' ? 'selected' : ''}>🌶️ మిర్చి (Chilli)</option>
          <option value="fertilizer" ${activeSeedCrop === 'fertilizer' ? 'selected' : ''}>🧪 ఎరువులు/DAP</option>
        </select>

        <!-- 2. స్టాక్ లభ్యత -->
        <select onchange="applyAdvSeedFilter('stock', this.value)" class="seeds-filter-select">
          <option value="all" ${activeSeedStock === 'all' ? 'selected' : ''}>📦 స్టాక్ (అన్నీ)</option>
          <option value="available" ${activeSeedStock === 'available' ? 'selected' : ''}>✅ తక్షణ లభ్యం ఉన్నవి</option>
        </select>

        <!-- 3. డీలర్ / సొసైటీ రకం -->
        <select onchange="applyAdvSeedFilter('vendor', this.value)" class="seeds-filter-select">
          <option value="all" ${activeSeedVendor === 'all' ? 'selected' : ''}>🏛️ విక్రేత (అన్నీ)</option>
          <option value="govt" ${activeSeedVendor === 'govt' ? 'selected' : ''}>🏛️ PACS / రైతు భరోసా</option>
          <option value="pvt" ${activeSeedVendor === 'pvt' ? 'selected' : ''}>🏪 ప్రైవేట్ డీలర్లు</option>
        </select>

        <!-- 4. ధర బడ్జెట్ -->
        <select onchange="applyAdvSeedFilter('price', this.value)" class="seeds-filter-select">
          <option value="all" ${activeSeedPrice === 'all' ? 'selected' : ''}>💰 ధర (అన్నీ)</option>
          <option value="low" ${activeSeedPrice === 'low' ? 'selected' : ''}>₹500 లోపు</option>
          <option value="mid" ${activeSeedPrice === 'mid' ? 'selected' : ''}>₹500 - ₹1000</option>
          <option value="high" ${activeSeedPrice === 'high' ? 'selected' : ''}>₹1000 పైబడి</option>
        </select>
      </div>
    </div>

    <!-- 💡 ప్రత్యేక సాగు సలహా బోర్డు -->
    <div class="crop-guidance-board">
      <div class="crop-guidance-title">
        <span>💡</span> ${currentAdvisory.title}
      </div>
      <ul class="crop-guidance-list">
        ${currentAdvisory.points.map(pt => `<li>${pt}</li>`).join('')}
      </ul>
    </div>

    <!-- విత్తనాలు & ఎరువుల జాబితా -->
    <div class="eq-list-wrap">
      ${filteredSeeds.length === 0 ? `
        <div class="seeds-empty-card">
          📢 మీరు ఎంచుకున్న ఫిల్టర్లకు సరిపడే విత్తనాలు లేదా ఎరువులు ప్రస్తుతం అందుబాటులో లేవు.
        </div>
      ` : filteredSeeds.map(seed => `
        <div class="eq-item-card seed-card-item">
          <div class="eq-top-row">
            <div>
              <div class="eq-name seed-item-title">${seed.name}</div>
              <div class="eq-owner-meta">డీలర్/సొసైటీ: <b>${seed.vendor}</b> | 📍 ${seed.loc} (${seed.distanceKm} కి.మీ)</div>
              <div class="seed-stock-row">
                <span class="seed-stock-badge">
                  📦 స్టాక్: ${seed.stock}
                </span>
              </div>
            </div>
            <div class="eq-price-badge">${seed.rate}</div>
          </div>

          <div class="eq-actions-row seed-actions-row">
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
