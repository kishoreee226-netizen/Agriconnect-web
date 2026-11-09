// provider/provider.js - Complete Provider Dashboard & Service Controller

let selectedProviderType = 'equipment';

// 1. Landing Card Render (Guest View)
window.renderProviderLandingCard = function() {
  const mount = document.getElementById("provider-hub-container") || document.getElementById("provider-container");
  if (!mount) return;

  const tpl = document.getElementById("provider-landing-template");
  if (!tpl) return;

  mount.replaceChildren(tpl.content.cloneNode(true));
  mount.style.setProperty('display', 'block', 'important');
};
window.injectProviderLandingCard = window.renderProviderLandingCard;

// 2. Main Dashboard View Renderer
window.renderProviderDashboardView = function(container, type) {
  const mount = container || document.getElementById("provider-hub-container") || document.getElementById("provider-container");
  if (!mount) return;

  const tpl = document.getElementById("provider-dashboard-template");
  if (!tpl) return;

  mount.replaceChildren(tpl.content.cloneNode(true));

  const pType = type || window.AppState?.providerType || 'equipment';
  selectedProviderType = pType;

  const titles = {
    equipment: { name: '🚜 పరికరాల నిర్వహణ డ్యాష్‌బోర్డ్', color: '#f57c00', desc: 'మీ ట్రాక్టర్లు, హార్వెస్టర్లు మొదలైన పరికరాలను జోడించండి' },
    transport: { name: '🚚 రవాణా వాహనాల డ్యాష్‌బోర్డ్', color: '#7b1fa2', desc: 'మీ రవాణా వాహనాలు, ట్రాలీలు, ఆటోలను అద్దెకు చేర్చండి' },
    seeds: { name: '🌱 విత్తనాలు & ఎరువుల డీలర్ డ్యాష్‌బోర్డ్', color: '#2e7d32', desc: 'మీ వద్ద ఉన్న స్టాక్ మరియు ధరల వివరాలను నమోదు చేయండి' }
  };
  const conf = titles[pType] || titles.equipment;

  const cardBox = document.getElementById("provider-dash-card-box");
  if (cardBox) cardBox.style.setProperty('--provider-theme', conf.color);

  const tEl = document.getElementById("p-dash-title");
  const dEl = document.getElementById("p-dash-desc");
  if (tEl) tEl.textContent = conf.name;
  if (dEl) dEl.textContent = conf.desc;

  window.renderProviderItemsList(pType);
  window.renderIncomingBookingsForProvider('provider-incoming-requests');
};

// 3. Provider Auth Modal (3 Pill Tabs)
window.openProviderModal = function() {
  let modal = document.getElementById('provider-auth-modal');
  if (!modal) {
    const tpl = document.getElementById('provider-auth-modal-template');
    if (tpl) {
      document.body.appendChild(tpl.content.cloneNode(true));
      modal = document.getElementById('provider-auth-modal');
    }
  }
  selectedProviderType = 'equipment';
  window.selectProviderTab('equipment');
  if (modal) modal.style.display = 'flex';
};

window.closeProviderModal = function() {
  const modal = document.getElementById('provider-auth-modal');
  if (modal) modal.style.display = 'none';
};

window.selectProviderTab = function(type) {
  selectedProviderType = type;
  const eqBtn = document.getElementById('p-tab-equipment');
  const trBtn = document.getElementById('p-tab-transport');
  const sdBtn = document.getElementById('p-tab-seeds');
  const submitBtn = document.getElementById('prov-submit-btn');

  if (eqBtn) eqBtn.classList.remove('active');
  if (trBtn) trBtn.classList.remove('active');
  if (sdBtn) sdBtn.classList.remove('active');

  const configs = {
    equipment: { color: '#f57c00', text: '🚜 పరికరాల ఓనర్‌గా డాష్‌బోర్డ్‌కు వెళ్లండి ➔', btn: eqBtn },
    transport: { color: '#7b1fa2', text: '🚚 రవాణా ఓనర్‌గా డాష్‌బోర్డ్‌కు వెళ్లండి ➔', btn: trBtn },
    seeds: { color: '#2e7d32', text: '🌱 విత్తనాల డీలర్‌గా డాష్‌బోర్డ్‌కు వెళ్లండి ➔', btn: sdBtn }
  };

  const curr = configs[type] || configs.equipment;
  if (curr.btn) curr.btn.classList.add('active');
  if (submitBtn) {
    submitBtn.style.setProperty('--provider-theme', curr.color);
    submitBtn.textContent = curr.text;
  }
};

window.handleProviderLogin = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const name = document.getElementById('prov-name')?.value.trim() || "";
  const phone = document.getElementById('prov-phone')?.value.trim() || "";
  const village = document.getElementById('prov-village')?.value.trim() || "";

  if (!/^[0-9]{10}$/.test(phone)) {
    alert("దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి!");
    return;
  }

  const profile = {
    name: name,
    phone: phone,
    village: village,
    roleType: 'PROVIDER',
    userType: 'PROVIDER',
    providerType: selectedProviderType
  };

  if (!window.AppState) window.AppState = {};
  window.AppState.isLoggedIn = true;
  window.AppState.userType = 'PROVIDER';
  window.AppState.providerType = selectedProviderType;
  window.AppState.userProfile = profile;

  try {
    localStorage.setItem("agri_user_profile", JSON.stringify(profile));
    localStorage.setItem("agri_last_user", JSON.stringify(profile));
  } catch (err) {}

  window.closeProviderModal();
  if (window.RoleController && typeof window.RoleController.applyUserRoleView === 'function') {
    window.RoleController.applyUserRoleView();
  }
};

// 4. Add Service Item Modal
window.openAddServiceModal = function() {
  const type = selectedProviderType || 'equipment';
  let modal = document.getElementById('provider-item-modal');
  if (!modal) {
    const tpl = document.getElementById('provider-item-modal-template');
    if (tpl) {
      document.body.appendChild(tpl.content.cloneNode(true));
      modal = document.getElementById('provider-item-modal');
    }
  }

  const configs = {
    equipment: {
      title: '🚜 పరికరం వివరాలు జోడించండి',
      color: '#f57c00',
      fields: `
        <div class="provider-form-group">
          <label class="provider-form-label">పరికరం రకం / మోడల్:</label>
          <input type="text" id="item-field-1" placeholder="ఉదా: మహీంద్రా 575 ట్రాక్టర్ / రోటవేటర్" required class="provider-form-input" />
        </div>
        <div class="provider-form-group">
          <label class="provider-form-label">అద్దె ధర (గంటకు ₹):</label>
          <input type="number" id="item-field-2" placeholder="ఉదా: 900" required class="provider-form-input" />
        </div>
        <div class="provider-form-group last">
          <label class="provider-form-label">పని స్థితి (Availability):</label>
          <select id="item-field-3" class="provider-form-input">
            <option value="అందుబాటులో ఉంది (Available)">అందుబాటులో ఉంది (Available)</option>
            <option value="బిజీగా ఉంది (Busy)">బిజీగా ఉంది (Busy)</option>
          </select>
        </div>
      `
    },
    transport: {
      title: '🚚 రవాణా వాహనం వివరాలు జోడించండి',
      color: '#7b1fa2',
      fields: `
        <div class="provider-form-group">
          <label class="provider-form-label">వాహనం రకం:</label>
          <input type="text" id="item-field-1" placeholder="ఉదా: బొలెరో పికప్ / 407 DCM" required class="provider-form-input" />
        </div>
        <div class="provider-form-group">
          <label class="provider-form-label">ఛార్జీ (కి.మీ / ట్రిప్ ₹):</label>
          <input type="text" id="item-field-2" placeholder="ఉదా: ₹35 / కి.మీ లేదా ₹1200 / ట్రిప్" required class="provider-form-input" />
        </div>
        <div class="provider-form-group last">
          <label class="provider-form-label">మోసే సామర్థ్యం:</label>
          <input type="text" id="item-field-3" placeholder="ఉదా: 2 టన్నులు / 50 బస్తాలు" required class="provider-form-input" />
        </div>
      `
    },
    seeds: {
      title: '🌱 విత్తనాలు / ఎరువుల వివరాలు జోడించండి',
      color: '#2e7d32',
      fields: `
        <div class="provider-form-group">
          <label class="provider-form-label">పంట రకం & బ్రాండ్:</label>
          <input type="text" id="item-field-1" placeholder="ఉదా: వరి BPT 5204 / కాటన్ సీడ్స్" required class="provider-form-input" />
        </div>
        <div class="provider-form-group">
          <label class="provider-form-label">ధర (బ్యాగ్ / ప్యాకెట్ ₹):</label>
          <input type="number" id="item-field-2" placeholder="ఉదా: 850" required class="provider-form-input" />
        </div>
        <div class="provider-form-group last">
          <label class="provider-form-label">స్టాక్ లభ్యత:</label>
          <input type="text" id="item-field-3" placeholder="ఉదా: 100 బ్యాగులు అందుబాటులో ఉన్నాయి" required class="provider-form-input" />
        </div>
      `
    }
  };

  const curr = configs[type] || configs.equipment;
  document.getElementById('pitem-modal-title').textContent = curr.title;
  document.getElementById('pitem-dynamic-fields').innerHTML = curr.fields;

  const subBtn = modal.querySelector('.pitem-submit-btn');
  if (subBtn) subBtn.style.setProperty('--provider-theme', curr.color);

  modal.style.display = 'flex';
};

window.closeAddServiceModal = function() {
  const modal = document.getElementById('provider-item-modal');
  if (modal) modal.style.display = 'none';
};

window.handleSaveProviderItem = async function(e) {
  e.preventDefault();
  const val1 = document.getElementById('item-field-1').value.trim();
  const val2 = document.getElementById('item-field-2').value.trim();
  const val3 = document.getElementById('item-field-3').value.trim();

  const profile = window.AppState?.userProfile || {};
  const ownerPhone = profile.phone || '';

  if (!ownerPhone) {
    alert("దయచేసి సరైన మొబైల్ నంబర్‌తో లాగిన్ అవ్వండి.");
    return;
  }

  const type = selectedProviderType || 'equipment';
  const newItem = {
    id: "item_" + Date.now(),
    name: val1,
    rate: '₹' + val2,
    rawRate: val2,
    type: type,
    category: type,
    status: val3,
    owner: profile.name || 'యజమాని',
    phone: ownerPhone,
    village: profile.village || 'స్థానిక పరిధి',
    loc: profile.village || 'స్థానిక పరిధి',
    createdAt: new Date().toISOString()
  };

  if (window.db) {
    window.db.collection("provider_items").add(newItem).catch(err => console.warn(err));
  }

  let items = JSON.parse(localStorage.getItem('agri_provider_items') || '[]');
  items.unshift(newItem);
  localStorage.setItem('agri_provider_items', JSON.stringify(items));

  window.closeAddServiceModal();
  window.renderProviderItemsList(type);
  alert("🎉 విజయవంతంగా చేర్చబడింది!");
};

// 5. Render Provider Saved Items
window.renderProviderItemsList = async function(type) {
  const container = document.getElementById('provider-items-list');
  if (!container) return;

  const profile = window.AppState?.userProfile || {};
  const currentUserPhone = String(profile.phone || '').trim();

  let items = [];
  try {
    const local = JSON.parse(localStorage.getItem('agri_provider_items') || '[]');
    items = local.filter(it => !currentUserPhone || it.phone === currentUserPhone);
  } catch (err) {}

  if (items.length === 0) {
    container.innerHTML = `
      <div style="font-size:12px; color:#64748b; padding:8px; text-align:center;">
        మీరు ఇంకా ఏ వస్తువులు లేదా సేవలు జోడించలేదు.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="pitem-box">
      <div class="pitem-header">
        <div class="pitem-title-text">మీరు జోడించినవి <span class="pitem-count-badge">${items.length}</span></div>
      </div>
      <div class="pitem-scroll-list">
        ${items.map(item => `
          <div class="pitem-card-row">
            <div>
              <div class="pitem-card-title">${item.name}</div>
              <div class="pitem-card-details">ధర: <b class="pitem-price-text">${item.rate}</b> | ${item.status || 'లభ్యం'}</div>
            </div>
            <button onclick="window.deleteProviderItem('${item.id}', '${type}')" class="pitem-delete-btn">తీసివేయి</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

window.deleteProviderItem = function(id, type) {
  if (!confirm("ఖచ్చితంగా తొలగించాలనుకుంటున్నారా?")) return;

  let localItems = JSON.parse(localStorage.getItem('agri_provider_items') || '[]');
  localItems = localItems.filter(item => item.id !== id);
  localStorage.setItem('agri_provider_items', JSON.stringify(localItems));

  window.renderProviderItemsList(type);
};

// 6. Incoming Orders Inbox (With Phone Isolation)
window.renderIncomingBookingsForProvider = function(containerId) {
  const box = document.getElementById(containerId);
  if (!box) return;

  const currentPhone = window.AppState?.userProfile?.phone || "";

  function renderUI(raw) {
    const bookings = (raw || []).filter(b => {
      const bPhone = String(b.providerPhone || b.targetPhone || "").trim();
      return !bPhone || (currentPhone && bPhone === currentPhone);
    });

    if (bookings.length === 0) {
      box.innerHTML = `<p style="font-size:12px; color:#64748b; text-align:center; padding:10px;">ప్రస్తుతం కొత్త ఆర్డర్‌లు లేవు.</p>`;
      return;
    }

    box.innerHTML = `
      <div class="porders-box">
        <div class="porders-header">
          <div class="porders-title">🔔 రైతుల నుండి వచ్చిన రిక్వెస్ట్‌లు <span class="porders-count-badge">${bookings.length}</span></div>
        </div>
        <div class="porders-scroll-list">
          ${bookings.map(b => `
            <div class="porders-card ${b.status === 'ACCEPTED' ? 'accepted' : ''}">
              <div class="porders-card-top">
                <span class="porders-type-tag ${b.type === 'SPOT' ? 'spot' : 'advance'}">
                  ${b.type === 'SPOT' ? '⚡ SPOT (వెంటనే)' : '📅 ADVANCE బుకింగ్'}
                </span>
                <span style="font-size:11px; color:#64748b;">${b.createdAt || ''}</span>
              </div>
              <div class="porders-veh-name">${b.vehicleType || b.itemName || ''}</div>
              <div class="porders-work-details">
                పని: <b>${b.workSize || ''}</b> | సమయం: <b>${b.schedule || ''}</b><br>
                రైతు: <b>${b.farmerName || ''}</b> (${b.village || ''})
              </div>
              <div class="porders-btn-row">
                <a href="tel:${b.farmerPhone || ''}" class="porders-action-btn porders-call-btn">📞 కాల్</a>
                ${b.status !== 'ACCEPTED' ? `
                  <button onclick="window.acceptBookingOrder('${b.id}')" class="porders-action-btn porders-accept-btn">✅ ఒప్పుకోండి</button>
                ` : `<span class="porders-accepted-badge">✅ కన్ఫర్మ్ అయింది</span>`}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  const local = JSON.parse(localStorage.getItem('agri_active_bookings') || '[]');
  renderUI(local);
};

window.acceptBookingOrder = function(bookingId) {
  let bookings = JSON.parse(localStorage.getItem('agri_active_bookings') || '[]');
  const idx = bookings.findIndex(b => b.id === bookingId);
  if (idx !== -1) {
    bookings[idx].status = 'ACCEPTED';
    localStorage.setItem('agri_active_bookings', JSON.stringify(bookings));
  }
  window.renderIncomingBookingsForProvider('provider-incoming-requests');
  alert("ఆర్డర్ కన్ఫర్మ్ చేయబడింది!");
};
