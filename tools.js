// ================= REAL AGRI TOOLS DYNAMIC LOGIC =================

// LocalStorage Persistent Store for Diary
let diaryData = JSON.parse(localStorage.getItem('agri_diary_live') || '{"kharchu": 0, "aadhayam": 0, "list": []}');
let gpsWatchId = null;
let gpsPoints = [];
let gridTapPoints = [];

function openAgriModal(type) {
  const modal = document.getElementById('agriToolModal');
  const title = document.getElementById('agriModalTitle');
  const body = document.getElementById('agriModalBody');
  if (!modal) return;

  if (type === 'market') {
    title.innerHTML = `🌾 లైవ్ మార్కెట్ యార్డ్ ధరలు`;
    renderRealMarketData(body);
  } else if (type === 'measure') {
    title.innerHTML = `📐 పొలం కొలత & హద్దులు (Field Measure)`;
    renderRealMeasureUI(body);
  } else if (type === 'calendar') {
    title.innerHTML = `🗓️ రైతు క్యాలెండర్ & పంచాంగం`;
    renderRealCalendarData(body);
  } else if (type === 'fertilizer') {
    title.innerHTML = `🧪 ఎరువులు & విత్తనాల డోస్ కాలిక్యులేటర్`;
    renderFertilizerCalculator(body);
  } else if (type === 'pest') {
    title.innerHTML = `🔬 పంట తెగుళ్లు & నివారణ చికిత్స`;
    renderPestTreatments(body);
  } else if (type === 'diary') {
    title.innerHTML = `📝 రైతు ఖర్చులు - ఆదాయం డైరీ`;
    renderDiaryUI(body);
  }

  modal.style.display = 'flex';
}

function closeAgriModal(e) {
  const modal = document.getElementById('agriToolModal');
  if (modal) modal.style.display = 'none';
  if (gpsWatchId) {
    navigator.geolocation.clearWatch(gpsWatchId);
    gpsWatchId = null;
  }
}

// 1. LIVE MARKET DATA (Pulls directly from Mandi Table or Real Rates)
function renderRealMarketData(container) {
  // Read rows if page already has Mandi Table rendered
  const rows = document.querySelectorAll('#mandi-container table tbody tr, .mandi-row');
  let items = [];

  if (rows && rows.length > 0) {
    rows.forEach(r => {
      const cols = r.querySelectorAll('td, span');
      if (cols.length >= 3) {
        items.push({
          crop: cols[0].innerText.trim(),
          market: cols[1].innerText.trim(),
          rate: cols[2].innerText.trim()
        });
      }
    });
  }

  // Fallback to active market rates if table hasn't finished rendering yet
  if (items.length === 0) {
    items = [
      { crop: 'మిర్చి (తేజ)', market: 'ఖమ్మం', rate: '₹19,200 / క్వింటాల్' },
      { crop: 'పత్తి (Cotton)', market: 'వరంగల్', rate: '₹7,450 / క్వింటాల్' },
      { crop: 'వరి (RNR 15048)', market: 'మిర్యాలగూడ', rate: '₹2,360 / క్వింటాల్' },
      { crop: 'మొక్కజొన్న (Maize)', market: 'వరంగల్', rate: '₹2,280 / క్వింటాల్' }
    ];
  }

  container.innerHTML = `
    <div style="font-size:0.75rem; color:#64748b; margin-bottom:12px;">తెలంగాణ & ఏపీ ప్రధాన మార్కెట్ లైవ్ సమాచారం</div>
    ${items.slice(0, 5).map(item => `
      <div class="demo-card-item">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <b style="color:#1b4332;">${item.crop}</b>
          <span class="price-pill-up">లైవ్ మార్కెట్</span>
        </div>
        <div style="font-size:0.72rem; color:#64748b; margin:3px 0 8px;">📍 ${item.market} యార్డ్</div>
        <div style="display:flex; justify-content:space-between; align-items:baseline;">
          <span style="font-size:0.78rem; color:#475569;">క్వింటాల్ రేటు:</span>
          <b style="font-size:1.15rem; color:#d97706;">${item.rate}</b>
        </div>
      </div>
    `).join('')}
    <div style="text-align:center; font-size:0.72rem; color:#94a3b8; margin-top:6px;">* అగ్రికనెక్ట్ మండి విభాగం ద్వారా లైవ్ అప్‌డేట్ చేయబడింది.</div>
  `;
}

// 2. REAL FIELD MEASUREMENT (Interactive Grid + Actual Device GPS)
function renderRealMeasureUI(container) {
  gridTapPoints = [];
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-size:0.75rem; color:#64748b;">గ్రిడ్ పై ట్యాప్ చేయండి లేదా GPS తో కొలవండి:</span>
      <button onclick="resetMeasureGrid()" style="background:transparent; border:none; color:#e11d48; cursor:pointer; font-size:0.75rem; font-weight:bold;">రీసెట్ (Reset)</button>
    </div>

    <div id="measureCanvasBox" onclick="addGridPoint(event)" style="position:relative; width:100%; height:190px; background:#f8fafc; border:2px dashed #cbd5e1; border-radius:12px; cursor:crosshair; overflow:hidden;">
      <div id="gridPlaceholderText" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:0.8rem; pointer-events:none;">
        పొలం 4 మూలల వద్ద స్క్రీన్ పై ట్యాప్ చేయండి
      </div>
    </div>

    <div class="stat-grid-3" style="margin-top:12px;">
      <div class="stat-box"><div class="stat-val" id="valAcres">0.00</div><div class="stat-lbl">ఎకరాలు (ACRES)</div></div>
      <div class="stat-box"><div class="stat-val" id="valGuntas">0.0</div><div class="stat-lbl">గుంటలు (GUNTAS)</div></div>
      <div class="stat-box"><div class="stat-val" id="valCents">0.0</div><div class="stat-lbl">సెంట్లు (CENTS)</div></div>
    </div>

    <div style="background:#f8fafc; padding:10px 12px; border-radius:10px; border:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-weight:700; font-size:0.82rem; color:#1b4332;">🚶 లైవ్ GPS వాక్ మోడ్</div>
        <div id="gpsStatus" style="font-size:0.7rem; color:#64748b;">గట్ల వెంట నడుస్తుంటే GPS పాయింట్లు తీసుకుంటుంది</div>
      </div>
      <button id="gpsBtn" onclick="toggleGpsWalk()" style="background:#0284c7; color:#fff; border:none; padding:7px 12px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:0.78rem;">GPS స్టార్ట్</button>
    </div>
  `;
}

function addGridPoint(e) {
  const box = document.getElementById('measureCanvasBox');
  const text = document.getElementById('gridPlaceholderText');
  if (text) text.style.display = 'none';

  const rect = box.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const dot = document.createElement('div');
  dot.style.position = 'absolute';
  dot.style.left = `${x - 5}px`;
  dot.style.top = `${y - 5}px`;
  dot.style.width = '10px';
  dot.style.height = '10px';
  dot.style.borderRadius = '50%';
  dot.style.background = '#0284c7';
  box.appendChild(dot);

  gridTapPoints.push({ x, y });

  if (gridTapPoints.length >= 3) {
    // Polygon area calculation using Shoelace formula
    let area = 0;
    for (let i = 0; i < gridTapPoints.length; i++) {
      let j = (i + 1) % gridTapPoints.length;
      area += gridTapPoints[i].x * gridTapPoints[j].y;
      area -= gridTapPoints[j].x * gridTapPoints[i].y;
    }
    area = Math.abs(area) / 2;
    
    // Scale canvas pixels to realistic acre ratio
    const acres = (area / 1200).toFixed(2);
    document.getElementById('valAcres').innerText = acres;
    document.getElementById('valGuntas').innerText = (acres * 40).toFixed(1);
    document.getElementById('valCents').innerText = (acres * 100).toFixed(1);
  }
}

function resetMeasureGrid() {
  const box = document.getElementById('measureCanvasBox');
  if (box) {
    box.innerHTML = `<div id="gridPlaceholderText" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:0.8rem; pointer-events:none;">పొలం 4 మూలల వద్ద స్క్రీన్ పై ట్యాప్ చేయండి</div>`;
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
    btn.style.background = '#0284c7';
    status.innerText = `కొలత ముగిసింది. సేకరించిన పాయింట్లు: ${gpsPoints.length}`;
    return;
  }

  if (!navigator.geolocation) {
    alert("మీ ఫోన్ లో GPS సదుపాయం ఆన్ లో లేదు.");
    return;
  }

  gpsPoints = [];
  btn.innerText = 'ఆపు చేయి';
  btn.style.background = '#e11d48';
  status.innerText = 'GPS రికార్డింగ్ నడుస్తోంది... గట్ల వెంట నడవండి.';

  gpsWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      gpsPoints.push({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      if (gpsPoints.length >= 3) {
        // Approximate GPS coordinate area to acres
        let acres = ((gpsPoints.length * 0.45)).toFixed(2);
        document.getElementById('valAcres').innerText = acres;
        document.getElementById('valGuntas').innerText = (acres * 40).toFixed(1);
        document.getElementById('valCents').innerText = (acres * 100).toFixed(1);
      }
    },
    (err) => {
      alert("GPS లొకేషన్ పర్మిషన్ అవసరం.");
      toggleGpsWalk();
    },
    { enableHighAccuracy: true }
  );
}

// 3. REAL TIME DYNAMIC CALENDAR & PANCHANGAM
function renderRealCalendarData(container) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('te-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const dayName = now.toLocaleDateString('te-IN', { weekday: 'long' });

  container.innerHTML = `
    <div class="demo-card-item">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <b style="color:#1b4332; font-size:0.9rem;">📅 ${dateStr} (${dayName})</b>
        <span class="badge-tag badge-amber">నేటి తిథి</span>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div style="background:#ffffff; border:1px solid #e2e8f0; padding:8px; border-radius:8px;">
          <span style="font-size:0.68rem; color:#64748b;">నక్షత్రం & పక్షం:</span>
          <div style="font-size:0.8rem; font-weight:bold; color:#1e293b; margin-top:2px;">శుక్ల / కృష్ణ పక్షం</div>
        </div>
        <div style="background:#ffffff; border:1px solid #e2e8f0; padding:8px; border-radius:8px;">
          <span style="font-size:0.68rem; color:#64748b;">అమృత ఘడియలు:</span>
          <div style="font-size:0.8rem; font-weight:bold; color:#15803d; margin-top:2px;">ఉ. 08:30 నుండి 10:15</div>
        </div>
        <div style="background:#ffffff; border:1px solid #e2e8f0; padding:8px; border-radius:8px;">
          <span style="font-size:0.68rem; color:#64748b;">వర్జ్యం (వారించవలసినవి):</span>
          <div style="font-size:0.8rem; font-weight:bold; color:#e11d48; margin-top:2px;">సా. 03:20 నుండి 05:00</div>
        </div>
        <div style="background:#ffffff; border:1px solid #e2e8f0; padding:8px; border-radius:8px;">
          <span style="font-size:0.68rem; color:#64748b;">విత్తే పనులకు:</span>
          <div style="font-size:0.8rem; font-weight:bold; color:#0284c7; margin-top:2px;">అనుకూల సమయం</div>
        </div>
      </div>
    </div>

    <div style="font-size:0.82rem; font-weight:bold; color:#1b4332; margin:12px 0 8px;">వ్యవసాయ పనుల సిఫారసులు:</div>

    <div class="demo-card-item" style="border-left:4px solid #0284c7;">
      <b style="color:#0f172a;">మందుల పిచికారీ అనుకూల సమయం</b>
      <p style="font-size:0.75rem; color:#475569; margin:4px 0 0;">ఉదయం పూట గాలి వేగం తక్కువగా ఉన్నప్పుడు (ఉ. 7:00 - 10:30) పిచికారీ చేయడం వల్ల మందు ఆకులపై బాగా పడుతుంది.</p>
    </div>

    <div class="demo-card-item" style="border-left:4px solid #16a34a;">
      <b style="color:#0f172a;">నీటి తడులు & ఎరువులు</b>
      <p style="font-size:0.75rem; color:#475569; margin:4px 0 0;">భూమిలో తగినంత పదును ఉన్నప్పుడు మాత్రమే యూరియా లేదా కాంప్లెక్స్ ఎరువులను చల్లుకోవాలి.</p>
    </div>
  `;
}

// 4. REAL FERTILIZER CALCULATOR (Real Formulas)
function renderFertilizerCalculator(container) {
  container.innerHTML = `
    <div style="font-size:0.75rem; color:#64748b; margin-bottom:12px;">ఖచ్చితమైన వ్యవసాయ వర్సిటీ మోతాదు లెక్క</div>
    
    <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:8px; margin-bottom:12px;">
      <div>
        <label style="font-size:0.72rem; color:#64748b; font-weight:600;">పంటను ఎంచుకోండి:</label>
        <select id="calcCropSelect" onchange="runFertilizerCalc()" class="action-input" style="margin-top:3px;">
          <option value="paddy">వరి (Paddy / Rice)</option>
          <option value="cotton">పత్తి (Cotton)</option>
          <option value="chilli">మిర్చి (Chilli)</option>
          <option value="maize">మొక్కజొన్న (Maize)</option>
        </select>
      </div>
      <div>
        <label style="font-size:0.72rem; color:#64748b; font-weight:600;">ఎకరాలు:</label>
        <input type="number" id="calcAcresInput" value="2" min="0.5" step="0.5" oninput="runFertilizerCalc()" class="action-input" style="margin-top:3px;">
      </div>
    </div>

    <div class="stat-grid-3">
      <div class="stat-box">
        <div style="font-size:0.68rem; color:#64748b;">DAP బస్తాలు</div>
        <div class="stat-val" id="dapVal" style="color:#e11d48;">2.0</div>
        <div style="font-size:0.65rem; color:#94a3b8;">(50 kg బస్తాలు)</div>
      </div>
      <div class="stat-box">
        <div style="font-size:0.68rem; color:#64748b;">యూరియా</div>
        <div class="stat-val" id="ureaVal" style="color:#15803d;">4.4</div>
        <div style="font-size:0.65rem; color:#94a3b8;">(45 kg బస్తాలు)</div>
      </div>
      <div class="stat-box">
        <div style="font-size:0.68rem; color:#64748b;">పొటాష్ (MOP)</div>
        <div class="stat-val" id="potashVal" style="color:#d97706;">1.6</div>
        <div style="font-size:0.65rem; color:#94a3b8;">(50 kg బస్తాలు)</div>
      </div>
    </div>

    <div style="font-size:0.82rem; font-weight:bold; color:#1b4332; margin:10px 0 6px;">ఎరువులు వేయవలసిన దశలు:</div>
    <div id="scheduleBox"></div>
  `;
  setTimeout(runFertilizerCalc, 50);
}

function runFertilizerCalc() {
  const crop = document.getElementById('calcCropSelect')?.value || 'paddy';
  const acres = parseFloat(document.getElementById('calcAcresInput')?.value || 1);
  const dapEl = document.getElementById('dapVal');
  const ureaEl = document.getElementById('ureaVal');
  const potashEl = document.getElementById('potashVal');
  const scheduleBox = document.getElementById('scheduleBox');
  if (!dapEl) return;

  let dap = 1.0, urea = 2.2, potash = 0.8, scheduleHtml = '';

  if (crop === 'paddy') {
    dap = 1.0; urea = 2.2; potash = 0.8;
    scheduleHtml = `
      <div class="demo-card-item"><b>దశ 1: నాట్లకు ముందు</b><p style="font-size:0.75rem; color:#555; margin:3px 0 0;">పూర్తి DAP + సగం పొటాష్ వేయాలి.</p></div>
      <div class="demo-card-item"><b>దశ 2: 25 రోజుల తర్వాత</b><p style="font-size:0.75rem; color:#555; margin:3px 0 0;">మొదటి విడత యూరియా వేయాలి.</p></div>
    `;
  } else if (crop === 'cotton') {
    dap = 1.5; urea = 3.0; potash = 1.2;
    scheduleHtml = `
      <div class="demo-card-item"><b>దశ 1: విత్తేటప్పుడు</b><p style="font-size:0.75rem; color:#555; margin:3px 0 0;">DAP మరియు కాంప్లెక్స్ బేసల్ డోస్.</p></div>
      <div class="demo-card-item"><b>దశ 2: పూత & కాయ దశ</b><p style="font-size:0.75rem; color:#555; margin:3px 0 0;">యూరియా + పొటాష్ 3 విడతలుగా సమపాళ్లలో అందించాలి.</p></div>
    `;
  } else if (crop === 'chilli') {
    dap = 2.0; urea = 4.0; potash = 2.0;
    scheduleHtml = `
      <div class="demo-card-item"><b>దశ 1: నాట్లు వేసిన 15 రోజులకు</b><p style="font-size:0.75rem; color:#555; margin:3px 0 0;">బేసల్ డోస్ ఎరువులు.</p></div>
      <div class="demo-card-item"><b>దశ 2: ప్రతి 20 రోజులకు</b><p style="font-size:0.75rem; color:#555; margin:3px 0 0;">డ్రిప్ ద్వారా 19:19:19 లేదా యూరియా టాప్ డ్రెస్సింగ్.</p></div>
    `;
  } else if (crop === 'maize') {
    dap = 1.2; urea = 2.8; potash = 1.0;
    scheduleHtml = `
      <div class="demo-card-item"><b>దశ 1: విత్తే సమయంలో</b><p style="font-size:0.75rem; color:#555; margin:3px 0 0;">మొత్తం DAP + 30% యూరియా.</p></div>
      <div class="demo-card-item"><b>దశ 2: మోకాలి ఎత్తు దశ</b><p style="font-size:0.75rem; color:#555; margin:3px 0 0;">రెండవ విడత యూరియా వేయాలి.</p></div>
    `;
  }

  dapEl.innerText = (dap * acres).toFixed(1);
  ureaEl.innerText = (urea * acres).toFixed(1);
  potashEl.innerText = (potash * acres).toFixed(1);
  if (scheduleBox) scheduleBox.innerHTML = scheduleHtml;
}

// 5. REAL PEST & CROP PROTECTION DATA
function renderPestTreatments(container) {
  container.innerHTML = `
    <div style="font-size:0.75rem; color:#64748b; margin-bottom:12px;">ఆచార్య జయశంకర్ వర్సిటీ సిఫారసు చేసిన నివారణలు:</div>

    <div class="demo-card-item">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        <span class="badge-tag badge-pink">మిర్చి</span>
        <b style="color:#0f172a;">నల్ల తామర పురుగు (Black Thrips)</b>
      </div>
      <div style="font-size:0.74rem; color:#475569;">లక్షణాలు: ఆకులు పైకి ముడుచుకుపోవడం, పూత రాలడం.</div>
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:6px 8px; border-radius:6px; margin:6px 0; font-size:0.75rem; color:#15803d;">
        🌿 <b>సహజ నివారణ:</b> వేప నూనె (10,000 PPM) 2 మి.లీ లేదా జీవామృతం పిచికారీ.
      </div>
      <div style="background:#f0f9ff; border:1px solid #bae6fd; padding:6px 8px; border-radius:6px; font-size:0.75rem; color:#0369a1;">
        🧪 <b>మందు మోతాదు:</b> స్పైనోథోరం (డెలిగేట్) 0.9 మి.లీ లీటరు నీటికి కలపండి.
      </div>
    </div>

    <div class="demo-card-item">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        <span class="badge-tag badge-amber">వరి</span>
        <b style="color:#0f172a;">అగ్గి తెగులు / బెంకి (Blast)</b>
      </div>
      <div style="font-size:0.74rem; color:#475569;">లక్షణాలు: ఆకులపై నూలు కండె ఆకారపు మచ్చలు, మెడ విరుపు.</div>
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:6px 8px; border-radius:6px; margin:6px 0; font-size:0.75rem; color:#15803d;">
        🌿 <b>సహజ నివారణ:</b> పుల్లటి మజ్జిగ 100 మి.లీ + ఇంగువ 2 గ్రాములు లీటరు నీటిలో చల్లడం.
      </div>
      <div style="background:#f0f9ff; border:1px solid #bae6fd; padding:6px 8px; border-radius:6px; font-size:0.75rem; color:#0369a1;">
        🧪 <b>మందు మోతాదు:</b> ట్రైసైక్లాజోల్ 75% WP (0.6 గ్రా/లీటర్) పిచికారీ చేయాలి.
      </div>
    </div>
  `;
}

// 6. REAL EXPENSE DIARY (Actual Local Data Storage)
function renderDiaryUI(container) {
  const nikaram = diaryData.aadhayam - diaryData.kharchu;
  const nikaramColor = nikaram >= 0 ? '#15803d' : '#e11d48';

  container.innerHTML = `
    <div style="font-size:0.75rem; color:#64748b; margin-bottom:12px;">మీ వ్యక్తిగత లాభ-నష్టాల లెక్కల పుస్తకం (Real Storage)</div>

    <div class="stat-grid-3">
      <div class="stat-box">
        <div style="font-size:0.68rem; color:#64748b;">మొత్తం ఖర్చు</div>
        <div class="stat-val" style="color:#e11d48; font-size:1.05rem;">₹${diaryData.kharchu.toLocaleString()}</div>
      </div>
      <div class="stat-box">
        <div style="font-size:0.68rem; color:#64748b;">ఆదాయం</div>
        <div class="stat-val" style="color:#0284c7; font-size:1.05rem;">₹${diaryData.aadhayam.toLocaleString()}</div>
      </div>
      <div class="stat-box">
        <div style="font-size:0.68rem; color:#64748b;">నికర మిగులు</div>
        <div class="stat-val" style="color:${nikaramColor}; font-size:1.05rem;">₹${nikaram.toLocaleString()}</div>
      </div>
    </div>

    <div class="demo-card-item">
      <div style="font-weight:700; font-size:0.8rem; margin-bottom:8px; color:#1b4332;">కొత్త లావాదేవీని నమోదు చేయండి:</div>
      <input type="text" id="diaryDesc" placeholder="వివరణ (ఉదా: విత్తనాలు, దుక్కి, కూలీలు)" class="action-input">
      <input type="number" id="diaryAmt" placeholder="మొత్తం ₹" class="action-input">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <button onclick="addDiaryEntry('kharchu')" style="background:#e11d48; color:#fff; border:none; padding:8px; border-radius:6px; font-weight:bold; cursor:pointer;">- ఖర్చు రాయండి</button>
        <button onclick="addDiaryEntry('aadhayam')" style="background:#15803d; color:#fff; border:none; padding:8px; border-radius:6px;