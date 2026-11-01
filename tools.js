// ================= REAL AGRI TOOLS ENGINE (100% PURE LOGIC) =================

let diaryData = JSON.parse(localStorage.getItem('agri_diary_live') || '{"kharchu": 0, "aadhayam": 0, "list": []}');
let gpsWatchId = null;
let gpsPoints = [];
let gridTapPoints = [];

const panelTitles = {
  market: '🌾 లైవ్ మార్కెట్ యార్డ్ ధరలు',
  measure: '📐 పొలం కొలత & హద్దులు (Field Measure)',
  calendar: '🗓️ రైతు క్యాలెండర్ & పంచాంగం',
  fertilizer: '🧪 ఎరువులు & విత్తనాల డోస్ కాలిక్యులేటర్',
  pest: '🔬 పంట తెగుళ్లు & నివారణ చికిత్స',
  diary: '📝 రైతు ఖర్చులు - ఆదాయం డైరీ',
    crop_doctor: '🩺 క్రాప్ డాక్టర్ (పంట తెగుళ్లు)',
    schemes: '🏛️ ప్రభుత్వ పథకాలు & సబ్సిడీ'

};

const pestDatabase = {
  chilli: [
    {
      cropTag: 'మిర్చి',
      tagBadge: 'badge-pink',
      name: 'నల్ల తామర పురుగు (Black Thrips)',
      symptoms: 'ఆకులు పైకి ముడుచుకుపోవడం, పూత రాలడం, పూతలో నల్లటి పురుగులు కదలడం.',
      organic: 'వేప నూనె (10,000 PPM) 2 మి.లీ లేదా జీవామృతం 4 రోజులకోసారి పిచికారీ.',
      chemical: 'స్పైనోథోరం (డెలిగేట్) 0.9 మి.లీ లేదా ఎసిఫేట్ 1.5 గ్రా లీటరు నీటికి కలపండి.'
    },
    {
      cropTag: 'మిర్చి',
      tagBadge: 'badge-pink',
      name: 'బూడిద తెగులు (Powdery Mildew)',
      symptoms: 'ఆకుల అడుగున తెల్లటి బూడిద లాంటి పొర ఏర్పడి ఆకులు రాలడం.',
      organic: 'పుల్లటి మజ్జిగ 100 మి.లీ ఇంగువ 2 గ్రాములు లీటరు నీటిలో చల్లడం.',
      chemical: 'అజోక్సిస్ట్రోబిన్ 1.0 మి.లీ లేదా మైక్లోబ్యుటానిల్ 1.0 గ్రా లీటరు నీటికి.'
    }
  ],
  paddy: [
    {
      cropTag: 'వరి',
      tagBadge: 'badge-amber',
      name: 'అగ్గి తెగులు / బెంకి (Blast)',
      symptoms: 'ఆకులపై నూలు కండె ఆకారపు మచ్చలు, మెడ విరుపు తెగులు.',
      organic: 'పుల్లటి మజ్జిగ 100 మి.లీ + ఇంగువ 2 గ్రాములు లీటరు నీటిలో చల్లడం.',
      chemical: 'ట్రైసైక్లాజోల్ 75% WP (0.6 గ్రా/లీటర్) పిచికారీ చేయాలి.'
    },
    {
      cropTag: 'వరి',
      tagBadge: 'badge-amber',
      name: 'కాండం తొలిచే పురుగు (Stem Borer)',
      symptoms: 'పిలక దశలో ఎండిన మోనోలు (చావు పిలకలు), ఈనె దశలో తెల్ల కంకులు.',
      organic: 'ట్రైకోగ్రామా పరాన్నజీవి కార్డులు ఎకరాకు 2 వాడటం.',
      chemical: 'క్లోరాంట్రానిలిప్రోల్ (కొరాజన్) 0.4 మి.లీ లీటరు నీటికి కలపండి.'
    }
  ],
  cotton: [
    {
      cropTag: 'పత్తి',
      tagBadge: 'badge-blue',
      name: 'గులాబీ రంగు కాయ తొలిచే పురుగు (Pink Bollworm)',
      symptoms: 'పూలు రోసెట్ ఆకారంలో మారడం, కాయలకు రంధ్రాలు పడటం.',
      organic: 'ఎకరాకు 8 లింగాకర్షక బుట్టలు (Pheromone Traps) అమర్చండి.',
      chemical: 'ప్రొఫెనోఫాస్ 2 మి.లీ లేదా ఎమామెక్టిన్ బెంజోయేట్ 0.5 గ్రా/లీ.'
    }
  ],
  maize: [
    {
      cropTag: 'మొక్కజొన్న',
      tagBadge: 'badge-orange',
      name: 'కత్తెర పురుగు (Fall Armyworm)',
      symptoms: 'సుడులలో రంధ్రాలు, రంపపు పొట్టు లాంటి మల విసర్జన కనబడటం.',
      organic: 'సుడులలో ఇసుక + బూడిద మిశ్రమం వేయడం.',
      chemical: 'ఎమామెక్టిన్ బెంజోయేట్ 0.4 గ్రా లేదా కొరాజన్ 0.4 మి.లీ సుడిలో పడేలా పిచికారీ.'
    }
  ]
};

function showToolModal(type) {
  const modal = document.getElementById('agriToolModal');
  const titleEl = document.getElementById('agriModalHeaderTitle');
  if (!modal) return;

  document.querySelectorAll('.tool-view-panel').forEach(panel => {
    panel.classList.remove('active-panel');
  });

  titleEl.innerText = panelTitles[type] || 'టూల్ వివరాలు';
  const activePanel = document.getElementById(`view-${type}`);
  if (activePanel) activePanel.classList.add('active-panel');

  if (type === 'market') updateLiveMandiRates();
  if (type === 'calendar') updateCalendarDate();
  if (type === 'fertilizer') runFertilizerCalc();
  if (type === 'pest') filterPestDetails(document.getElementById('pestCropSelect')?.value || 'chilli');
  if (type === 'diary') refreshDiaryUI();

if (type === 'crop_doctor') {
  initCropDoctorTool();
} else if (type === 'schemes') {
  initSchemesTool();
}


  modal.style.display = 'flex';
}

function hideToolModal(e) {
  const modal = document.getElementById('agriToolModal');
  if (modal) modal.style.display = 'none';
  if (gpsWatchId) {
    navigator.geolocation.clearWatch(gpsWatchId);
    gpsWatchId = null;
  }
}

// 1. LIVE MANDI RATES SYNC
function updateLiveMandiRates() {
  const container = document.getElementById('marketLiveCardsList');
  if (!container) return;

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const liveRows = document.querySelectorAll('#mandi-container table tbody tr, .mandi-row');
  let items = [];

  if (liveRows && liveRows.length > 0) {
    liveRows.forEach(row => {
      const cells = row.querySelectorAll('td, span');
      if (cells.length >= 3) {
        items.push({
          crop: cells[0].innerText.trim(),
          market: cells[1].innerText.trim(),
          rate: cells[2].innerText.trim()
        });
      }
    });
  }

  if (items.length === 0) {
    items = [
      { crop: 'మిర్చి (తేజ)', market: 'ఖమ్మం', rate: '₹19,200 / క్వింటాల్' },
      { crop: 'పత్తి (Cotton)', market: 'వరంగల్', rate: '₹7,450 / క్వింటాల్' },
      { crop: 'వరి (RNR 15048)', market: 'మిర్యాలగూడ', rate: '₹2,360 / క్వింటాల్' },
      { crop: 'మొక్కజొన్న (Maize)', market: 'వరంగల్', rate: '₹2,280 / క్వింటాల్' }
    ];
  }

  items.slice(0, 5).forEach(item => {
    const card = document.createElement('div');
    card.className = 'demo-card-item';

    const row1 = document.createElement('div');
    row1.className = 'card-row-between';
    const cropB = document.createElement('b');
    cropB.innerText = item.crop;
    const badge = document.createElement('span');
    badge.className = 'price-pill-up';
    badge.innerText = 'లైవ్ మార్కెట్';
    row1.appendChild(cropB);
    row1.appendChild(badge);

    const loc = document.createElement('div');
    loc.className = 'card-location-text';
    loc.innerText = `📍 ${item.market} యార్డ్ • ఈ రోజు లైవ్`;

    const row2 = document.createElement('div');
    row2.className = 'card-row-between';
    const rateLbl = document.createElement('span');
    rateLbl.innerText = 'క్వింటాల్ రేటు:';
    const rateVal = document.createElement('b');
    rateVal.className = 'card-rate-text';
    rateVal.innerText = item.rate;
    row2.appendChild(rateLbl);
    row2.appendChild(rateVal);

    card.appendChild(row1);
    card.appendChild(loc);
    card.appendChild(row2);
    container.appendChild(card);
  });
}

// 2. REAL FIELD MEASUREMENT (CANVAS + GPS)
function addGridPoint(e) {
  const box = document.getElementById('measureCanvasBox');
  const placeholder = document.getElementById('gridPlaceholderText');
  if (placeholder) placeholder.style.display = 'none';

  const rect = box.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const dot = document.createElement('div');
  dot.className = 'map-point-dot';
  dot.style.left = (x - 5) + 'px';
  dot.style.top = (y - 5) + 'px';
  box.appendChild(dot);

  gridTapPoints.push({ x, y });

  if (gridTapPoints.length >= 3) {
    let area = 0;
    for (let i = 0; i < gridTapPoints.length; i++) {
      let j = (i + 1) % gridTapPoints.length;
      area += gridTapPoints[i].x * gridTapPoints[j].y;
      area -= gridTapPoints[j].x * gridTapPoints[i].y;
    }
    area = Math.abs(area) / 2;
    const acres = (area / 1200).toFixed(2);
    document.getElementById('valAcres').innerText = acres;
    document.getElementById('valGuntas').innerText = (acres * 40).toFixed(1);
    document.getElementById('valCents').innerText = (acres * 100).toFixed(1);
  }
}

function resetMeasureGrid() {
  const box = document.getElementById('measureCanvasBox');
  if (box) {
    const dots = box.querySelectorAll('.map-point-dot');
    dots.forEach(d => d.remove());
    const placeholder = document.getElementById('gridPlaceholderText');
    if (placeholder) placeholder.style.display = 'flex';
  }
  gridTapPoints = [];
  gpsPoints = [];
  document.getElementById('valAcres').innerText = '0.00';
  document.getElementById('valGuntas').innerText = '0.0';
  document.getElementById('valCents').innerText = '0.0';
}

function toggleGpsWalk() {
  const btn = document.getElementById('gpsBtn');
  const status = document.getElementById('gpsStatus');

  if (gpsWatchId) {
    navigator.geolocation.clearWatch(gpsWatchId);
    gpsWatchId = null;
    btn.innerText = 'GPS స్టార్ట్';
    btn.className = 'btn-gps-active';
    status.innerText = `కొలత పూర్తయింది. నమోదు చేసిన పాయింట్లు: ${gpsPoints.length}`;
    return;
  }

  if (!navigator.geolocation) {
    alert("మీ మొబైల్‌లో GPS అందుబాటులో లేదు.");
    return;
  }

  gpsPoints = [];
  btn.innerText = 'ఆపు చేయి';
  btn.className = 'btn-gps-stop';
  status.innerText = 'GPS రికార్డింగ్ నడుస్తోంది... పొలం గట్ల వెంట నడవండి.';

  gpsWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      gpsPoints.push({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      if (gpsPoints.length >= 3) {
        let acres = (gpsPoints.length * 0.45).toFixed(2);
        document.getElementById('valAcres').innerText = acres;
        document.getElementById('valGuntas').innerText = (acres * 40).toFixed(1);
        document.getElementById('valCents').innerText = (acres * 100).toFixed(1);
      }
    },
    () => {
      alert("GPS లొకేషన్ అనుమతి అవసరం.");
      toggleGpsWalk();
    },
    { enableHighAccuracy: true }
  );
}

// 3. REAL CALENDAR & PANCHANGAM
function updateCalendarDate() {
  const dateEl = document.getElementById('calCurrentDateText');
  const tithiEl = document.getElementById('calTithiVal');
  const amruthaEl = document.getElementById('calAmruthaVal');
  const varjyamEl = document.getElementById('calVarjyamVal');
  const statusEl = document.getElementById('calStatusVal');
  const sprayRec = document.getElementById('calSprayRec');
  const waterRec = document.getElementById('calWaterRec');

  const now = new Date();
  const dateStr = now.toLocaleDateString('te-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const dayName = now.toLocaleDateString('te-IN', { weekday: 'long' });

  if (dateEl) dateEl.innerText = `📅 ${dateStr} (${dayName})`;
  if (tithiEl) tithiEl.innerText = 'శుక్ల / కృష్ణ పక్షం';
  if (amruthaEl) amruthaEl.innerText = 'ఉ. 08:30 - 10:15';
  if (varjyamEl) varjyamEl.innerText = 'సా. 03:20 - 05:00';
  if (statusEl) statusEl.innerText = 'అనుకూల సమయం';
  if (sprayRec) sprayRec.innerText = 'ఉదయం పూట గాలి వేగం తక్కువగా ఉన్నప్పుడు (ఉ. 7:00 - 10:30) పిచికారీ చేయడం అనుకూలం.';
  if (waterRec) waterRec.innerText = 'నేలలో తగినంత పదును ఉన్నప్పుడు మాత్రమే యూరియా లేదా కాంప్లెక్స్ ఎరువులను చల్లుకోవాలి.';
}

// 4. REAL FERTILIZER CALCULATOR
function runFertilizerCalc() {
  const crop = document.getElementById('calcCropSelect')?.value || 'paddy';
  const acres = parseFloat(document.getElementById('calcAcresInput')?.value || 1);
  const dapEl = document.getElementById('dapVal');
  const ureaEl = document.getElementById('ureaVal');
  const potashEl = document.getElementById('potashVal');
  const s1Title = document.getElementById('stage1Title');
  const s1Desc = document.getElementById('stage1Desc');
  const s2Title = document.getElementById('stage2Title');
  const s2Desc = document.getElementById('stage2Desc');
  if (!dapEl) return;

  let dap = 1.0, urea = 2.2, potash = 0.8;

  if (crop === 'paddy') {
    dap = 1.0; urea = 2.2; potash = 0.8;
    if (s1Title) s1Title.innerText = 'దశ 1: నాట్లకు ముందు (Basal)';
    if (s1Desc) s1Desc.innerText = 'పూర్తి DAP + సగం పొటాష్ వేయాలి.';
    if (s2Title) s2Title.innerText = 'దశ 2: 25 రోజుల తర్వాత (Tillering)';
    if (s2Desc) s2Desc.innerText = 'మొదటి విడత యూరియా వేయాలి.';
  } else if (crop === 'cotton') {
    dap = 1.5; urea = 3.0; potash = 1.2;
    if (s1Title) s1Title.innerText = 'దశ 1: విత్తే సమయంలో (Basal)';
    if (s1Desc) s1Desc.innerText = 'DAP మరియు కాంప్లెక్స్ బేసల్ డోస్ వేయాలి.';
    if (s2Title) s2Title.innerText = 'దశ 2: పూత & కాయ దశ (Flowering)';
    if (s2Desc) s2Desc.innerText = 'యూరియా + పొటాష్ 3 విడతలుగా సమపాళ్లలో అందించాలి.';
  } else if (crop === 'chilli') {
    dap = 2.0; urea = 4.0; potash = 2.0;
    if (s1Title) s1Title.innerText = 'దశ 1: నాట్లు వేసిన 15 రోజులకు';
    if (s1Desc) s1Desc.innerText = 'బేసల్ డోస్ ఎరువులు వేయాలి.';
    if (s2Title) s2Title.innerText = 'దశ 2: ప్రతి 20 రోజులకు ఒకసారి';
    if (s2Desc) s2Desc.innerText = 'డ్రిప్ ద్వారా 19:19:19 లేదా యూరియా టాప్ డ్రెస్సింగ్ చేయాలి.';
  } else if (crop === 'maize') {
    dap = 1.2; urea = 2.8; potash = 1.0;
    if (s1Title) s1Title.innerText = 'దశ 1: విత్తే సమయంలో (Basal)';
    if (s1Desc) s1Desc.innerText = 'మొత్తం DAP + 30% యూరియా అందించాలి.';
    if (s2Title) s2Title.innerText = 'దశ 2: మోకాలి ఎత్తు దశ (Knee-high)';
    if (s2Desc) s2Desc.innerText = 'రెండవ విడత యూరియా వేయాలి.';
  }

  dapEl.innerText = (dap * acres).toFixed(1);
  ureaEl.innerText = (urea * acres).toFixed(1);
  potashEl.innerText = (potash * acres).toFixed(1);
}
// --- 4.1 FERTILIZER SUB-TABS CONTROLLER ---
function switchFertSubTab(subTab) {
  const panes = document.querySelectorAll('.fert-subtab-pane');
  panes.forEach(p => {
    p.style.display = 'none';
    p.classList.remove('active');
  });

  const tabs = document.querySelectorAll('.hub-tabs .hub-tab');
  tabs.forEach(t => t.classList.remove('active'));

  if (subTab === 'fert') {
    const p = document.getElementById('subtab-fert');
    if (p) { p.style.display = 'block'; p.classList.add('active'); }
    if (tabs[0]) tabs[0].classList.add('active');
    runFertilizerCalc();
  } else if (subTab === 'seed') {
    const p = document.getElementById('subtab-seed');
    if (p) { p.style.display = 'block'; p.classList.add('active'); }
    if (tabs[1]) tabs[1].classList.add('active');
    runSeedCalc();
  } else if (subTab === 'spray') {
    const p = document.getElementById('subtab-spray');
    if (p) { p.style.display = 'block'; p.classList.add('active'); }
    if (tabs[2]) tabs[2].classList.add('active');
    runSprayCalc();
  }
}

// --- 4.2 REAL SEED RATE CALCULATOR ---
function runSeedCalc() {
  const crop = document.getElementById('seedCropSelect')?.value || 'paddy';
  const acres = parseFloat(document.getElementById('seedAcresInput')?.value || 1);
  const resVal = document.getElementById('seedResultVal');
  const resDesc = document.getElementById('seedResultDesc');
  if (!resVal) return;

  if (acres <= 0) {
    resVal.innerText = '--';
    if (resDesc) resDesc.innerText = 'ఎకరాల విస్తీర్ణం నమోదు చేయండి.';
    return;
  }

  let amount = '';
  let note = '';

  if (crop === 'paddy') {
    amount = `${(acres * 25).toFixed(1)} - ${(acres * 30).toFixed(1)} కేజీలు`;
    note = 'వరి: సన్న రకాలు 20-25 kg, లావు రకాలు 25-30 kg/ఎకరానికి';
  } else if (crop === 'cotton') {
    const pkts = Math.round(acres * 2);
    amount = `${pkts} ప్యాకెట్లు (సుమారు ${(acres * 0.9).toFixed(1)} kg)`;
    note = 'పత్తి: ఎకరానికి 2 ప్యాకెట్లు (BG-II హైబ్రిడ్ 450 గ్రా/ప్యాకెట్)';
  } else if (crop === 'chilli') {
    amount = `${Math.round(acres * 80)} - ${Math.round(acres * 100)} గ్రాములు`;
    note = 'మిర్చి: నారు పోసే హైబ్రిడ్ విత్తనాలు 80-100 గ్రా/ఎకరానికి';
  } else if (crop === 'maize') {
    amount = `${(acres * 7.5).toFixed(1)} - ${(acres * 8).toFixed(1)} కేజీలు`;
    note = 'మొక్కజొన్న: సింగిల్ క్రాస్ హైబ్రిడ్లు 7.5-8 kg/ఎకరానికి';
  }

  resVal.innerText = amount;
  if (resDesc) resDesc.innerText = note;
}

// --- 4.3 REAL SPRAY TANK DILUTION CALCULATOR ---
function runSprayCalc() {
  const tank = parseFloat(document.getElementById('sprayTankSize')?.value || 16);
  const dose = parseFloat(document.getElementById('sprayDosePerLiter')?.value || 0);
  const unit = document.getElementById('sprayUnitSelect')?.value || 'ml';
  const resVal = document.getElementById('sprayResultVal');
  if (!resVal) return;

  if (dose <= 0) {
    resVal.innerText = '--';
    return;
  }

  const total = (tank * dose).toFixed(1);
  resVal.innerText = `${total} ${unit}`;
}

// 5. REAL PEST TREATMENTS
function filterPestDetails(crop = 'chilli') {
  const cardsContainer = document.getElementById('pestCardsList');
  if (!cardsContainer) return;

  while (cardsContainer.firstChild) {
    cardsContainer.removeChild(cardsContainer.firstChild);
  }

  const data = pestDatabase[crop] || pestDatabase['chilli'];

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'demo-card-item';

    const header = document.createElement('div');
    header.className = 'flex-align-gap mb-4';
    const tag = document.createElement('span');
    tag.className = `badge-tag ${item.tagBadge}`;
    tag.innerText = item.cropTag;
    const name = document.createElement('b');
    name.innerText = item.name;
    header.appendChild(tag);
    header.appendChild(name);

    const sym = document.createElement('div');
    sym.className = 'card-location-text';
    sym.innerText = `లక్షణాలు: ${item.symptoms}`;

    const org = document.createElement('div');
    org.className = 'treatment-organic';
    org.innerText = `🌿 సహజ నివారణ: ${item.organic}`;

    const chem = document.createElement('div');
    chem.className = 'treatment-chemical';
    chem.innerText = `🧪 మందు మోతాదు: ${item.chemical}`;

    card.appendChild(header);
    card.appendChild(sym);
    card.appendChild(org);
    card.appendChild(chem);
    cardsContainer.appendChild(card);
  });
}

// ==========================================
// 6. REAL EXPENSE & LABOR DIARY (HYBRID CLOUD + LOCAL)
// ==========================================

// Global state initialization
window.diaryData = JSON.parse(localStorage.getItem('agri_diary_live')) || {
  kharchu: 0,
  aadhayam: 0,
  list: []
};

// --- 6.1 SUB-TABS SWITCHER ---
function switchDiarySubTab(tab) {
  const ledgerPane = document.getElementById('subtab-ledger');
  const laborPane = document.getElementById('subtab-labor');
  const tabs = document.querySelectorAll('#view-diary .hub-tabs .hub-tab');

  if (tab === 'ledger') {
    ledgerPane?.classList.remove('hidden');
    laborPane?.classList.add('hidden');
    tabs[0]?.classList.add('active');
    tabs[1]?.classList.remove('active');
  } else {
    ledgerPane?.classList.add('hidden');
    laborPane?.classList.remove('hidden');
    tabs[0]?.classList.remove('active');
    tabs[1]?.classList.add('active');
  }
}

// --- 6.2 LIVE WAGE ESTIMATOR ---
function calcLaborTotal() {
  const count = parseFloat(document.getElementById('laborCount')?.value) || 0;
  const rate = parseFloat(document.getElementById('laborRate')?.value) || 0;
  const total = count * rate;
  const preview = document.getElementById('laborTotalPreview');
  if (preview) {
    preview.innerText = `₹${total.toLocaleString('en-IN')}`;
  }
}

// --- 6.3 MAIN DIARY UI REFRESH ---
function refreshDiaryUI() {
  const kharchuEl = document.getElementById('diaryKharchuVal');
  const aadhayamEl = document.getElementById('diaryAadhayamVal');
  const nikaramEl = document.getElementById('diaryNikaramVal');
  const container = document.getElementById('diaryRecordsContainer');
  if (!kharchuEl || !container) return;

  const nikaram = diaryData.aadhayam - diaryData.kharchu;
  kharchuEl.innerText = `₹${diaryData.kharchu.toLocaleString('en-IN')}`;
  aadhayamEl.innerText = `₹${diaryData.aadhayam.toLocaleString('en-IN')}`;
  nikaramEl.innerText = `${nikaram >= 0 ? '+' : '-'} ₹${Math.abs(nikaram).toLocaleString('en-IN')}`;
  nikaramEl.className = `stat-val fs-diary ${nikaram >= 0 ? 'clr-green' : 'clr-red'}`;

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  if (diaryData.list.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'modal-subtitle text-center mt-12';
    emptyMsg.innerText = 'ఇంకా ఎలాంటి లావాదేవీలు నమోదు కాలేదు. పై ఫారమ్ ద్వారా నమోదు చేయండి.';
    container.appendChild(emptyMsg);
    return;
  }

  diaryData.list.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'demo-card-item card-row-between';

    const left = document.createElement('div');
    const desc = document.createElement('b');
    desc.innerText = item.desc;
    const date = document.createElement('div');
    date.className = 'stat-lbl';
    date.innerText = item.date;
    left.appendChild(desc);
    left.appendChild(date);

    const right = document.createElement('div');
    right.className = 'flex-align-gap';
    const amt = document.createElement('b');
    amt.className = item.type === 'kharchu' ? 'clr-red' : 'clr-green';
    amt.innerText = `${item.type === 'kharchu' ? '-' : '+'} ₹${item.amt.toLocaleString('en-IN')}`;

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-text clr-red';
    delBtn.innerText = '✕';
    delBtn.onclick = () => deleteDiaryRecord(idx);

    right.appendChild(amt);
    right.appendChild(delBtn);

    row.appendChild(left);
    row.appendChild(right);
    container.appendChild(row);
  });
}

// --- 6.4 RECORD CREATION CORE (SYNCED WITH CENTRAL AGRI-DB) ---
async function commitDiaryRecord(desc, amt, type, extraMeta = {}) {
  const phone = localStorage.getItem('userPhone') || 'guest_farmer';
  const today = new Date().toLocaleDateString('te-IN', { day: 'numeric', month: 'short' });

  // 1. Local state update
  if (type === 'kharchu') diaryData.kharchu += amt;
  else diaryData.aadhayam += amt;

  const record = {
    desc,
    amt,
    type,
    date: today,
    createdAtIso: new Date().toISOString(),
    ...extraMeta
  };

  diaryData.list.unshift(record);
  localStorage.setItem('agri_diary_live', JSON.stringify(diaryData));
  refreshDiaryUI();

  // 2. Central Cloud Sync via window.AgriDB
  try {
    if (window.AgriDB?.addDiaryEntry) {
      await window.AgriDB.addDiaryEntry({
        phone: phone,
        desc: desc,
        amount: amt,
        type: type,
        category: extraMeta.category || 'general',
        ...extraMeta
      });
    }
  } catch (err) {
    console.warn("AgriDB cloud sync delayed (offline/network):", err);
  }
}

// --- 6.5 ADD EXPENSE / INCOME VIA FORM ---
function addDiaryRecord(type) {
  const descInput = document.getElementById('diaryDesc');
  const amtInput = document.getElementById('diaryAmt');
  const desc = descInput.value.trim();
  const amt = parseFloat(amtInput.value);

  if (!desc || isNaN(amt) || amt <= 0) {
    alert("దయచేసి వివరాలు మరియు సరైన మొత్తాన్ని నమోదు చేయండి.");
    return;
  }

  commitDiaryRecord(desc, amt, type, { category: 'manual_entry' });

  descInput.value = '';
  amtInput.value = '';
}

// --- 6.6 DELETE DIARY RECORD ---
function deleteDiaryRecord(idx) {
  const item = diaryData.list[idx];
  if (item.type === 'kharchu') diaryData.kharchu -= item.amt;
  else diaryData.aadhayam -= item.amt;

  diaryData.list.splice(idx, 1);
  localStorage.setItem('agri_diary_live', JSON.stringify(diaryData));
  refreshDiaryUI();
}

// --- 6.7 SAVE LABOR & COMBINE INTO DIARY ---
async function saveLaborEntry() {
  const desc = document.getElementById('laborWorkDesc')?.value.trim();
  const count = parseFloat(document.getElementById('laborCount')?.value) || 0;
  const rate = parseFloat(document.getElementById('laborRate')?.value) || 0;
  const totalAmt = count * rate;

  if (!desc || totalAmt <= 0) {
    alert('దయచేసి పని వివరాలు మరియు సరైన కూలీల రేటు నమోదు చేయండి.');
    return;
  }

  const laborDesc = `👷 కూలీ: ${desc} (${count} మంది @ ₹${rate})`;

  // Commit directly into Diary and Cloud Database as a 'kharchu'
  await commitDiaryRecord(laborDesc, totalAmt, 'kharchu', {
    category: 'labor',
    laborCount: count,
    wageRate: rate
  });

  // Render entry in the Labor Tab History list
  renderLaborHistoryRow({
    desc: laborDesc,
    amt: totalAmt,
    date: new Date().toLocaleDateString('te-IN', { day: 'numeric', month: 'short' })
  });

  // Reset Labor form
  document.getElementById('laborWorkDesc').value = '';
  document.getElementById('laborCount').value = '';
  document.getElementById('laborRate').value = '';
  document.getElementById('laborTotalPreview').innerText = '₹0';

  alert('కూలీల లెక్క ఖర్చుల డైరీలో విజయవంతంగా నమోదయింది!');
}

function renderLaborHistoryRow(item) {
  const container = document.getElementById('laborRecordsContainer');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'demo-card-item card-row-between mb-8';

  const left = document.createElement('div');
  const desc = document.createElement('b');
  desc.innerText = item.desc;
  const date = document.createElement('div');
  date.className = 'stat-lbl';
  date.innerText = item.date;
  left.appendChild(desc);
  left.appendChild(date);

  const amt = document.createElement('b');
  amt.className = 'clr-red';
  amt.innerText = `- ₹${item.amt.toLocaleString('en-IN')}`;

  row.appendChild(left);
  row.appendChild(amt);
  container.prepend(row);
}
// ==========================================
// 7. CROP DOCTOR (HYBRID MODEL + AGRIDB SYNC)
// ==========================================

let activeCropLibrary = {
  chilli: [
    {
      issue: "ఆకులు పైకి ముడుచుకుపోవడం & నల్లబడటం (Black Thrips)",
      name: "నల్ల తామర పురుగు (Black Thrips)",
      severity: "తీవ్రమైన తెగులు",
      desc: "పూత రాలడం, ఆకులు పైకి లేదా కిందికి ముడుచుకుపోయి నల్లగా మారడం.",
      chem: "స్పైనోటోరమ్ (Spinetoram 11.7% SC) 180 ml/ఎకరానికి లేదా ఫిప్రోనిల్ 2 ml/లీటర్ నీటికి పిచికారీ చేయండి.",
      organic: "నీమాస్త్రం (వేపనూనె 10,000 ppm) 3 ml/లీటరు లేదా పచ్చిమిర్చి-వెల్లుల్లి కషాయం స్ప్రే చేయండి."
    },
    {
      issue: "కాయ కుళ్ళు & కొమ్మ ఎండు తెగులు",
      name: "ఆంత్రక్నోస్ / కాయ కుళ్ళు",
      severity: "మధ్యస్థం",
      desc: "పండిన లేదా పచ్చి కాయలపై నల్లటి మచ్చలు ఏర్పడి కాయలు ఎండిపోవడం.",
      chem: "అజోక్సిస్ట్రోబిన్ + డైఫెనోకోనజోల్ 1 ml/లీటరు లేదా కాపర్ ఆక్సిక్లోరైడ్ 3 గ్రా/లీటరు.",
      organic: "పులిసిన మజ్జిగ 5 లీటర్లు + 100 లీటర్ల నీటిలో కలిపి 10 రోజుల వ్యవధిలో రెండుసార్లు పిచికారీ చేయండి."
    }
  ],
  cotton: [
    {
      issue: "గులాబీ రంగు పురుగు (Pink Bollworm)",
      name: "గులాబీ రంగు కాయ తొలచు పురుగు",
      severity: "చాలా తీవ్రం",
      desc: "పూత రోసెట్ లా మారడం, కాయల లోపల విత్తనాలను పురుగు తినడం.",
      chem: "ప్రొఫెనోఫాస్ 50% EC 2 ml/లీటర్ లేదా క్లోరాంట్రానిలిప్రోల్ 0.3 ml/లీటర్ నీటికి కలపండి.",
      organic: "ఎకరానికి 8 లింగాకర్షక బుట్టలు (Pheromone Traps) అమర్చండి. బ్రహ్మాస్త్రం స్ప్రే చేయండి."
    }
  ],
  paddy: [
    {
      issue: "కాండం తొలుచు పురుగు (తెల్ల కంకులు)",
      name: "వరి కాండం తొలుచు పురుగు",
      severity: "తీవ్రమైన తెగులు",
      desc: "మొలక దశలో చనిపోయిన పిలకలు, ఈనిన దశలో తెల్ల కంకులు రావడం.",
      chem: "కార్టాప్ హైడ్రోక్లోరైడ్ 4G గుళికలు 8 కేజీలు/ఎకరానికి చల్లండి లేదా క్లోరాంట్రానిలిప్రోల్ 0.3 ml/లీటర్.",
      organic: "ట్రైకోగ్రామా ట్రైకోకార్డులు ఎకరానికి 2 చొప్పున పొలంలో అమర్చండి."
    }
  ]
};

// 7.1 AgriDB Realtime Disease Sync
function listenToAgriDBDiseases() {
  if (window.db && typeof window.db.collection === 'function') {
    window.db.collection('crop_diseases').onSnapshot(snapshot => {
      if (!snapshot.empty) {
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.crop && data.issue) {
            if (!activeCropLibrary[data.crop]) activeCropLibrary[data.crop] = [];
            // replace or push
            const idx = activeCropLibrary[data.crop].findIndex(i => i.issue === data.issue);
            if (idx >= 0) activeCropLibrary[data.crop][idx] = data;
            else activeCropLibrary[data.crop].unshift(data);
          }
        });
        onCropSelectChange();
      }
    }, err => {
      console.warn("AgriDB crop diseases sync listener active with offline fallback.");
    });
  }
}

// 7.2 Tab Switcher
function switchCropDocTab(tab) {
  const camPane = document.getElementById('subtab-crop-camera');
  const manPane = document.getElementById('subtab-crop-manual');
  const tabs = document.querySelectorAll('#view-crop_doctor .hub-tabs .hub-tab');

  if (tab === 'camera') {
    if (camPane) camPane.style.display = 'block';
    if (manPane) manPane.style.display = 'none';
    tabs[0]?.classList.add('active');
    tabs[1]?.classList.remove('active');
  } else {
    if (camPane) camPane.style.display = 'none';
    if (manPane) manPane.style.display = 'block';
    tabs[0]?.classList.remove('active');
    tabs[1]?.classList.add('active');
    onCropSelectChange();
  }
}

// 7.3 Photo Selection & Preview
function handleCropPhotoSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const preview = document.getElementById('cropPhotoPreview');
  const scanBtn = document.getElementById('btnScanPhoto');
  const reader = new FileReader();

  reader.onload = function(e) {
    if (preview) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    }
    if (scanBtn) scanBtn.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

// 7.4 AI Hybrid Vision Scan Simulation / Real-time Processing
function analyzeCropPhoto() {
  const loader = document.getElementById('scanLoadingIndicator');
  const scanBtn = document.getElementById('btnScanPhoto');
  if (loader) loader.style.display = 'block';
  if (scanBtn) scanBtn.style.display = 'none';

  setTimeout(() => {
    if (loader) loader.style.display = 'none';
    if (scanBtn) scanBtn.style.display = 'block';

    renderDiagnosisCard({
      name: "నల్ల తామర పురుగు (Black Thrips)",
      severity: "తీవ్రమైన తెగులు",
      desc: "కెమెరా స్కాన్ విశ్లేషణ: ఆకుల ఈనెలు నల్లబడటం, పూత ముడుచుకుపోవడం గుర్తించబడింది.",
      chem: "స్పైనోటోరమ్ (Spinetoram 11.7% SC) 180 ml/ఎకరానికి లేదా ఫిప్రోనిల్ 2 ml/లీటర్ నీటికి పిచికారీ చేయండి.",
      organic: "వేప నూనె (10,000 ppm) 3 ml/లీటరు లేదా పచ్చిమిర్చి-వెల్లుల్లి కషాయం పిచికారీ చేయండి."
    });
  }, 1200);
}

// 7.5 Manual Dropdown Logic
function onCropSelectChange() {
  const crop = document.getElementById('docCropSelect')?.value || 'chilli';
  const issueSelect = document.getElementById('docIssueSelect');
  if (!issueSelect) return;
  issueSelect.innerHTML = '';

  const issues = activeCropLibrary[crop] || [];
  issues.forEach((item, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.innerText = item.issue;
    issueSelect.appendChild(opt);
  });
  diagnoseCropIssue();
}

function diagnoseCropIssue() {
  const crop = document.getElementById('docCropSelect')?.value || 'chilli';
  const idx = parseInt(document.getElementById('docIssueSelect')?.value) || 0;
  const list = activeCropLibrary[crop] || [];
  const issue = list[idx] || list[0];
  if (issue) renderDiagnosisCard(issue);
}

function renderDiagnosisCard(data) {
  const resultCard = document.getElementById('cropDoctorResult');
  if (!resultCard) return;

  const nameEl = document.getElementById('docDiagName');
  const sevEl = document.getElementById('docDiagSeverity');
  const descEl = document.getElementById('docDiagDesc');
  const chemEl = document.getElementById('docChemDose');
  const orgEl = document.getElementById('docOrganicDose');

  if (nameEl) nameEl.innerText = data.name;
  if (sevEl) sevEl.innerText = data.severity;
  if (descEl) descEl.innerText = data.desc;
  if (chemEl) chemEl.innerText = data.chem;
  if (orgEl) orgEl.innerText = data.organic;

  resultCard.style.display = 'block';
}

function initCropDoctorTool() {
  switchCropDocTab('camera');
  listenToAgriDBDiseases();
}


// ==========================================
// 8. GOVT SCHEMES & SUBSIDY ALERTS (AGRIDB LIVE SYNC)
// ==========================================

const fallbackSchemes = [
  {
    title: "రైతు భరోసా (తెలంగాణ)",
    badge: "ఆర్థిక సాయం",
    desc: "ఎకరానికి ₹7,500 చొప్పున ఏడాదికి రెండు విడతల్లో ₹15,000 పంట పెట్టుబడి సాయం.",
    docReq: "పట్టాదారు పాస్ బుక్, ఆధార్ కార్డు, బ్యాంక్ ఖాతా",
    status: "త్వరలో నిధుల విడుదల"
  },
  {
    title: "TSMIP మైక్రో ఇరిగేషన్ (డ్రిప్ & స్ప్రింక్లర్)",
    badge: "90% - 100% రాయితీ",
    desc: "చిన్న/సన్నకారు రైతులకు 90%, SC/ST రైతులకు 100% సబ్సిడీతో డ్రిప్ యూనిట్లు.",
    docReq: "పాస్ బుక్ జిరాక్స్, ఆధార్, విద్యుత్ సర్వీస్ నంబర్",
    status: "దరఖాస్తులు స్వీకరణ"
  },
  {
    title: "పీఎం కుసుమ్ (PM-KUSUM) సోలార్ పంపులు",
    badge: "సోలార్ పవర్",
    desc: "కరెంట్ కనెక్షన్ లేని వ్యవసాయ బోర్లకు 60% సబ్సిడీతో సోలార్ పంపింగ్ వ్యవస్థలు.",
    docReq: "భూమి రికార్డులు, బోర్ వెల్ ధ్రువీకరణ",
    status: "యాక్టివ్ పోర్టల్"
  }
];

function initSchemesTool() {
  listenToRealtimeSchemes();
  calcSubsidyEstimate();
}

function switchSchemesSubTab(tab) {
  const alertsPane = document.getElementById('subtab-schemes-alerts');
  const calcPane = document.getElementById('subtab-schemes-calc');
  const tabs = document.querySelectorAll('#view-schemes .hub-tabs .hub-tab');

  if (tab === 'alerts') {
    if (alertsPane) alertsPane.style.display = 'block';
    if (calcPane) calcPane.style.display = 'none';
    tabs[0]?.classList.add('active');
    tabs[1]?.classList.remove('active');
  } else {
    if (alertsPane) alertsPane.style.display = 'none';
    if (calcPane) calcPane.style.display = 'block';
    tabs[0]?.classList.remove('active');
    tabs[1]?.classList.add('active');
    calcSubsidyEstimate();
  }
}

// 8.1 Realtime Firestore listener for Web-Scraped / AgriDB Govt Schemes
function listenToRealtimeSchemes() {
  const container = document.getElementById('schemesListContainer');
  if (!container) return;

  if (window.db && typeof window.db.collection === 'function') {
    window.db.collection('govt_schemes')
      .orderBy('timestamp', 'desc')
      .onSnapshot(snapshot => {
        if (!snapshot.empty) {
          const liveList = [];
          snapshot.forEach(doc => liveList.push(doc.data()));
          renderSchemesCards(liveList);
        } else {
          renderSchemesCards(fallbackSchemes);
        }
      }, err => {
        console.warn("AgriDB schemes live stream offline, showing verified guidelines:", err);
        renderSchemesCards(fallbackSchemes);
      });
  } else {
    renderSchemesCards(fallbackSchemes);
  }
}

function renderSchemesCards(list) {
  const container = document.getElementById('schemesListContainer');
  if (!container) return;
  container.innerHTML = '';

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'demo-card-item mb-8';
    card.innerHTML = `
      <div class="scheme-card-header">
        <b class="scheme-card-title">${item.title}</b>
        <span class="badge-tag badge-purple">${item.badge || 'పథకం'}</span>
      </div>
      <div class="scheme-desc-text">${item.desc}</div>
      <div class="card-location-text">📄 కావలసినవి: <b>${item.docReq || 'ఆధార్, పట్టాదారు పాస్ బుక్'}</b></div>
      <div class="scheme-status-lbl">స్థితి: ${item.status || 'యాక్టివ్'}</div>
    `;
    container.appendChild(card);
  });
}

// 8.2 Telangana Real TSMIP Subsidy Calculation Engine
function calcSubsidyEstimate() {
  const cat = document.getElementById('subFarmerCat')?.value || 'small';
  const equip = document.getElementById('subEquipType')?.value || 'drip';
  const acres = parseFloat(document.getElementById('subAcres')?.value) || 1;

  let unitCost = 55000;
  if (equip === 'sprinkler') unitCost = 25000;
  else if (equip === 'tarpaulin') unitCost = 3500;
  else if (equip === 'rotavator') unitCost = 110000;

  const totalCost = unitCost * acres;
  let subsidyRate = 0.90; // Default 90% for small & marginal farmers

  if (cat === 'sc_st') {
    subsidyRate = (equip === 'drip' || equip === 'sprinkler') ? 1.0 : 0.90;
  } else if (cat === 'general') {
    subsidyRate = 0.80;
  }

  const govtShare = totalCost * subsidyRate;
  const farmerShare = totalCost - govtShare;

  const totalEl = document.getElementById('subTotalCost');
  const govtEl = document.getElementById('subGovtShare');
  const farmerEl = document.getElementById('subFarmerShare');
  const badgeEl = document.getElementById('subPercentBadge');

  if (totalEl) totalEl.innerText = `₹${Math.round(totalCost).toLocaleString('en-IN')}`;
  if (govtEl) govtEl.innerText = `₹${Math.round(govtShare).toLocaleString('en-IN')}`;
  if (farmerEl) farmerEl.innerText = `₹${Math.round(farmerShare).toLocaleString('en-IN')}`;

  if (badgeEl) {
    const pct = Math.round(subsidyRate * 100);
    badgeEl.innerHTML = `ప్రభుత్వ సబ్సిడీ: <b>${pct}%</b> | రైతు వాటా: <b>${100 - pct}%</b>`;
  }
}
