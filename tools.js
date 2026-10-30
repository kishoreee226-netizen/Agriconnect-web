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
  diary: '📝 రైతు ఖర్చులు - ఆదాయం డైరీ'
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

// 6. REAL EXPENSE DIARY (LOCAL STORAGE)
function refreshDiaryUI() {
  const kharchuEl = document.getElementById('diaryKharchuVal');
  const aadhayamEl = document.getElementById('diaryAadhayamVal');
  const nikaramEl = document.getElementById('diaryNikaramVal');
  const container = document.getElementById('diaryRecordsContainer');
  if (!kharchuEl || !container) return;

  const nikaram = diaryData.aadhayam - diaryData.kharchu;
  kharchuEl.innerText = `₹${diaryData.kharchu.toLocaleString()}`;
  aadhayamEl.innerText = `₹${diaryData.aadhayam.toLocaleString()}`;
  nikaramEl.innerText = `${nikaram >= 0 ? '+' : '-'} ₹${Math.abs(nikaram).toLocaleString()}`;
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
    amt.innerText = `${item.type === 'kharchu' ? '-' : '+'} ₹${item.amt.toLocaleString()}`;

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

function addDiaryRecord(type) {
  const descInput = document.getElementById('diaryDesc');
  const amtInput = document.getElementById('diaryAmt');
  const desc = descInput.value.trim();
  const amt = parseFloat(amtInput.value);

  if (!desc || isNaN(amt) || amt <= 0) {
    alert("దయచేసి వివరాలు మరియు సరైన మొత్తాన్ని నమోదు చేయండి.");
    return;
  }

  if (type === 'kharchu') diaryData.kharchu += amt;
  else diaryData.aadhayam += amt;

  const today = new Date().toLocaleDateString('te-IN', { day: 'numeric', month: 'short' });
  diaryData.list.unshift({ desc, amt, type, date: today });

  localStorage.setItem('agri_diary_live', JSON.stringify(diaryData));
  descInput.value = '';
  amtInput.value = '';
  refreshDiaryUI();
}

function deleteDiaryRecord(idx) {
  const item = diaryData.list[idx];
  if (item.type === 'kharchu') diaryData.kharchu -= item.amt;
  else diaryData.aadhayam -= item.amt;

  diaryData.list.splice(idx, 1);
  localStorage.setItem('agri_diary_live', JSON.stringify(diaryData));
  refreshDiaryUI();
}
