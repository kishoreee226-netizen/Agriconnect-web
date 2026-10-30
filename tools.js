// ================= 6-GRID AGRI TOOLS LOGIC =================
function openAgriModal(type) {
  const modal = document.getElementById('agriToolModal');
  const title = document.getElementById('agriModalTitle');
  const body = document.getElementById('agriModalBody');
  if (!modal) return;

  if (type === 'market') {
    title.innerHTML = "🌾 లైవ్ మార్కెట్ యార్డ్ ధరలు";
    body.innerHTML = `
      <div style="background:#e8f5e9; padding:8px; border-radius:8px; margin-bottom:10px; font-weight:bold; color:#1b4332;">
        ఖమ్మం & వరంగల్ ప్రధాన ధరలు
      </div>
      <p style="margin:6px 0;">🔴 <b>మిర్చి (తేజ):</b> ₹19,200 / క్వింటాల్ (ఖమ్మం)</p>
      <p style="margin:6px 0;">⚪ <b>పత్తి:</b> ₹7,450 / క్వింటాల్ (వరంగల్)</p>
      <p style="margin:6px 0;">🌾 <b>వరి (RNR 15048):</b> ₹2,350 / క్వింటాల్</p>
      <p style="margin:6px 0;">🌽 <b>మొక్కజొన్న:</b> ₹2,100 / క్వింటాల్</p>
      <small style="color:#666;">పూర్తి వివరాల కోసం కింద ఉన్న మండి టేబుల్ చూడండి.</small>
    `;
  } else if (type === 'measure') {
    title.innerHTML = "📐 పొలం కొలత (Field Area)";
    body.innerHTML = `
      <div style="background:#e1f5fe; padding:10px; border-radius:8px; text-align:center;">
        <p style="margin:0; color:#0277bd; font-weight:600;">GPS పొలం వాకింగ్ కొలత</p>
        <p style="font-size:0.8rem; color:#555; margin:6px 0 12px 0;">మీ పొలం గట్ల వెంట నడుస్తూ 4 మూలల వద్ద పాయింట్లు మార్క్ చేయండి.</p>
        <button style="background:#0288d1; color:#fff; border:none; padding:8px 16px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="alert('GPS వాక్ కొలత ప్రారంభించబడింది...')">🚶 నడక ప్రారంభించండి</button>
      </div>
    `;
  } else if (type === 'calendar') {
    title.innerHTML = "🗓️ రైతు వ్యవసాయ క్యాలెండర్";
    body.innerHTML = `
      <p><b>నేటి తిథి:</b> శుక్ల పక్షం</p>
      <p><b>నక్షత్రం:</b> హస్త</p>
      <p><b>అమృత ఘడియలు:</b> 08:30 AM - 10:15 AM (మందుల పిచికారీకి అనుకూలం)</p>
      <p><b>వర్జ్యం:</b> 03:20 PM - 05:00 PM</p>
    `;
  } else if (type === 'fertilizer') {
    title.innerHTML = "🧪 ఎరువుల డోస్ లెక్క";
    body.innerHTML = `
      <label><b>పంటను ఎంచుకోండి:</b></label>
      <select id="calcCrop" style="width:100%; padding:8px; margin:6px 0 10px 0; border-radius:6px; border:1px solid #ccc;">
        <option>వరి (Paddy)</option>
        <option>పత్తి (Cotton)</option>
        <option>మిర్చి (Chilli)</option>
        <option>మొక్కజొన్న (Maize)</option>
      </select>
      <label><b>ఎకరాలు:</b></label>
      <input type="number" id="calcAcres" value="1" min="0.5" step="0.5" style="width:100%; padding:8px; margin:6px 0 12px 0; border-radius:6px; border:1px solid #ccc;">
      <div style="background:#fce4ec; padding:8px; border-radius:6px; color:#880e4f; font-size:0.85rem;">
        <b>సిఫారసు (1 ఎకరానికి):</b><br>• బేసల్ డోస్: 1 బస్తా DAP + 25 kg పొటాష్<br>• 25 రోజుల తర్వాత: 1 బస్తా యూరియా
      </div>
    `;
  } else if (type === 'pest') {
    title.innerHTML = "🔬 పంట తెగుళ్ల నివారణ";
    body.innerHTML = `
      <div style="border-bottom:1px solid #eee; padding-bottom:8px; margin-bottom:8px;">
        <b style="color:#d84315;">తామర పురుగు (Thrips)</b>
        <p style="margin:4px 0; font-size:0.8rem; color:#555;">లక్షణం: ఆకులు పైకి ముడుచుకుపోవడం.</p>
        <p style="margin:4px 0; font-size:0.8rem;"><b>మందు:</b> ఫిప్రోనిల్ 5% SC (2 ml/లీటర్) లేదా వేప నూనె (10,000 PPM).</p>
      </div>
      <div>
        <b style="color:#d84315;">బెంకి తెగులు (Blast)</b>
        <p style="margin:4px 0; font-size:0.8rem; color:#555;">లక్షణం: ఆకులపై నూలు కండె ఆకారపు మచ్చలు.</p>
        <p style="margin:4px 0; font-size:0.8rem;"><b>మందు:</b> ట్రైసైక్లాజోల్ 75% WP (0.6 గ్రా/లీటర్).</p>
      </div>
    `;
  } else if (type === 'diary') {
    title.innerHTML = "📝 రైతు ఖర్చుల డైరీ";
    body.innerHTML = `
      <div style="display:flex; justify-content:space-between; background:#ede7f6; padding:8px; border-radius:6px; margin-bottom:10px;">
        <span><b>మొత్తం ఖర్చు:</b> ₹12,500</span>
        <span><b>ఆదాయం:</b> ₹45,000</span>
      </div>
      <input type="text" placeholder="ఖర్చు వివరాలు (ఉదా: విత్తనాలు)" style="width:100%; padding:6px; margin-bottom:6px; border:1px solid #ccc; border-radius:4px;">
      <input type="number" placeholder="మొత్తం (₹)" style="width:100%; padding:6px; margin-bottom:10px; border:1px solid #ccc; border-radius:4px;">
      <button style="width:100%; background:#6a1b9a; color:#fff; border:none; padding:8px; border-radius:6px; font-weight:bold; cursor:pointer;">+ ఖర్చు నమోదు చేయండి</button>
    `;
  }

  modal.style.display = 'flex';
}

function closeAgriModal(e) {
  const modal = document.getElementById('agriToolModal');
  if (modal) modal.style.display = 'none';
}
