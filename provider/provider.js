// provider/provider.js - 100% Pure Architecture & Real-Time Sync Controller

let selectedProviderType = 'equipment';

// 1. Landing Card Render (Guest View)
window.renderProviderLandingCard = function() {
  const mount = document.getElementById("provider-hub-container") || document.getElementById("provider-container");
  const tpl = document.getElementById("provider-landing-template");
  if (!mount || !tpl) return;

  mount.replaceChildren(tpl.content.cloneNode(true));
  mount.classList.remove("is-hidden");
};
window.injectProviderLandingCard = window.renderProviderLandingCard;

// 2. Main Dashboard View Renderer
window.renderProviderDashboardView = function(container, type) {
  const mount = container || document.getElementById("provider-hub-container") || document.getElementById("provider-container");
  const tpl = document.getElementById("provider-dashboard-template");
  if (!mount || !tpl) return;

  mount.replaceChildren(tpl.content.cloneNode(true));

  const pType = type || window.AppState?.providerType || 'equipment';
  selectedProviderType = pType;

  const titles = {
    equipment: { name: '🚜 పరికరాల నిర్వహణ డ్యాష్‌బోర్డ్', theme: 'theme-equipment', desc: 'మీ ట్రాక్టర్లు, హార్వెస్టర్లు మొదలైన పరికరాలను జోడించండి' },
    transport: { name: '🚚 రవాణా వాహనాల డ్యాష్‌బోర్డ్', theme: 'theme-transport', desc: 'మీ రవాణా వాహనాలు, ట్రాలీలు, ఆటోలను అద్దెకు చేర్చండి' },
    seeds: { name: '🌱 విత్తనాలు & ఎరువుల డీలర్ డ్యాష్‌బోర్డ్', theme: 'theme-seeds', desc: 'మీ వద్ద ఉన్న స్టాక్ మరియు ధరల వివరాలను నమోదు చేయండి' }
  };
  const conf = titles[pType] || titles.equipment;

  const cardBox = document.getElementById("provider-dash-card-box");
  if (cardBox) {
    cardBox.classList.remove('theme-equipment', 'theme-transport', 'theme-seeds');
    cardBox.classList.add(conf.theme);
  }

  const tEl = document.getElementById("p-dash-title");
  const dEl = document.getElementById("p-dash-desc");
  if (tEl) tEl.textContent = conf.name;
  if (dEl) dEl.textContent = conf.desc;

  // ⚡ అత్యవసర స్పాట్ అలర్ట్స్ రెండర్
  renderProviderSpotAlerts(pType);

  window.renderProviderItemsList(pType);
  window.renderIncomingBookingsForProvider('provider-incoming-requests');
};

// ⚡ రైతు పంపిన అత్యవసర స్పాట్ బుకింగ్‌లు
function renderProviderSpotAlerts(currentPType) {
  const wrapper = document.getElementById("provider-spot-alerts-container");
  const spotTpl = document.getElementById("provider-spot-card-template");
  if (!wrapper || !spotTpl) return;

  let allSpotAlerts = [];
  try {
    allSpotAlerts = JSON.parse(localStorage.getItem("agri_spot_alerts") || "[]");
  } catch (e) { allSpotAlerts = []; }

  const targetRole = currentPType === 'transport' ? 'TRANSPORT' : 'TRACTOR';
  const matchingSpots = allSpotAlerts.filter(a => a.roleTarget === targetRole && a.status === "URGENT_BROADCAST");

  if (matchingSpots.length === 0) {
    wrapper.classList.add("is-hidden");
    wrapper.replaceChildren();
    return;
  }

  wrapper.classList.remove("is-hidden");
  wrapper.replaceChildren();

  matchingSpots.forEach(spot => {
    const card = spotTpl.content.cloneNode(true);
    card.querySelector(".provider-spot-title").textContent = `⚡ అత్యవసర అవసరం: ${spot.quantity}`;
    card.querySelector(".provider-spot-farmer").textContent = `రైతు: ${spot.farmerName} (${spot.location}) | సమయం: ${spot.createdAt}`;
    card.querySelector(".provider-spot-wage").textContent = `₹${spot.wage}`;

    card.querySelector(".btn-spot-accept-provider").onclick = function() {
      spot.status = "ACCEPTED";
      localStorage.setItem("agri_spot_alerts", JSON.stringify(allSpotAlerts));
      alert(`🎉 మీరు రైతు ${spot.farmerName} అత్యవసర ఆర్డర్‌ను స్వీకరించారు!`);
      window.renderProviderDashboardView(null, currentPType);
    };

    wrapper.appendChild(card);
  });
}

// 3. Provider Auth Modal
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
  if (modal) modal.classList.remove('is-hidden');
};

window.closeProviderModal = function() {
  const modal = document.getElementById('provider-auth-modal');
  if (modal) modal.classList.add('is-hidden');
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
    equipment: { theme: 'theme-equipment', text: '🚜 పరికరాల ఓనర్‌గా డాష్‌బోర్డ్‌కు వెళ్లండి ➔', btn: eqBtn },
    transport: { theme: 'theme-transport', text: '🚚 రవాణా ఓనర్‌గా డాష్‌బోర్డ్‌కు వెళ్లండి ➔', btn: trBtn },
    seeds: { theme: 'theme-seeds', text: '🌱 విత్తనాల డీలర్‌గా డాష్‌బోర్డ్‌కు వెళ్లండి ➔', btn: sdBtn }
  };

  const curr = configs[type] || configs.equipment;
  if (curr.btn) curr.btn.classList.add('active');
  if (submitBtn) {
    submitBtn.classList.remove('theme-equipment', 'theme-transport', 'theme-seeds');
    submitBtn.classList.add(curr.theme);
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
  window.AppState.currentRole = 'PROVIDER';
  window.AppState.providerType = selectedProviderType;
  window.AppState.userProfile = profile;

  try {
    localStorage.setItem("agri_user_profile", JSON.stringify(profile));
    localStorage.setItem("agri_current_active_role", 'PROVIDER');
  } catch (err) {}

  window.closeProviderModal();
  if (window.RoleController && typeof window.RoleController.applyUserRoleView === 'function') {
    window.RoleController.applyUserRoleView();
  }
};

// 4. Add Service Item Modal (Pure Template Cloning)
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

  const titles = {
    equipment: '🚜 పరికరం వివరాలు జోడించండి',
    transport: '🚚 రవాణా వాహనం వివరాలు జోడించండి',
    seeds: '🌱 విత్తనాలు / ఎరువుల వివరాలు జోడించండి'
  };

  document.getElementById('pitem-modal-title').textContent = titles[type] || titles.equipment;

  const fieldsBox = document.getElementById('pitem-dynamic-fields');
  const fieldTpl = document.getElementById(`fields-${type}-template`);
  if (fieldsBox && fieldTpl) {
    fieldsBox.replaceChildren(fieldTpl.content.cloneNode(true));
  }

  const subBtn = modal.querySelector('.pitem-submit-btn');
  if (subBtn) {
    subBtn.classList.remove('theme-equipment', 'theme-transport', 'theme-seeds');
    subBtn.classList.add(`theme-${type}`);
  }

  modal.classList.remove('is-hidden');
};

window.closeAddServiceModal = function() {
  const modal = document.getElementById('provider-item-modal');
  if (modal) modal.classList.add('is-hidden');
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
  const autoId = "item_" + Date.now();
  const newItem = {
    id: autoId,
    name: val1,
    rate: val2.startsWith('₹') ? val2 : ('₹' + val2),
    rawRate: val2.replace(/[^\d.]/g, ''),
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
    window.db.collection("provider_items").doc(autoId).set(newItem).catch(err => console.warn("Firebase save error:", err));
  }

  let items = JSON.parse(localStorage.getItem('agri_provider_items') || '[]');
  items.unshift(newItem);
  localStorage.setItem('agri_provider_items', JSON.stringify(items));

  window.closeAddServiceModal();
  window.renderProviderItemsList(type);

  if (window.switchFarmerTab) {
    window.switchFarmerTab(type);
  }

  alert("🎉 విజయవంతంగా చేర్చబడింది!");
};

// 5. Render Provider Saved Items (Pure Template Cloning)
window.renderProviderItemsList = async function(type) {
  const container = document.getElementById('provider-items-list');
  const boxTpl = document.getElementById('provider-items-box-template');
  const rowTpl = document.getElementById('provider-item-row-template');
  if (!container || !boxTpl || !rowTpl) return;

  const profile = window.AppState?.userProfile || {};
  const currentUserPhone = String(profile.phone || '').trim();

  let items = [];
  if (window.db && currentUserPhone) {
    try {
      const snap = await window.db.collection("provider_items").where("phone", "==", currentUserPhone).get();
      if (!snap.empty) {
        snap.forEach(doc => {
          const d = doc.data();
          items.push({ ...d, id: d.id || doc.id });
        });
        localStorage.setItem('agri_provider_items', JSON.stringify(items));
      }
    } catch (e) {
      console.warn("Firebase fallback to local:", e);
    }
  }

  if (items.length === 0) {
    try {
      const local = JSON.parse(localStorage.getItem('agri_provider_items') || '[]');
      items = local.filter(it => !currentUserPhone || it.phone === currentUserPhone);
    } catch (err) {}
  }

  if (items.length === 0) {
    const emptyEl = document.createElement("div");
    emptyEl.className = "empty-provider-notice";
    emptyEl.textContent = "మీరు ఇంకా ఏ వస్తువులు లేదా సేవలు జోడించలేదు.";
    container.replaceChildren(emptyEl);
    return;
  }

  const boxNode = boxTpl.content.cloneNode(true);
  boxNode.querySelector("#pitem-badge-count").textContent = items.length;
  const listTarget = boxNode.querySelector("#pitem-scroll-target");

  items.forEach((item, idx) => {
    const row = rowTpl.content.cloneNode(true);
    const safeId = item.id || `idx_${idx}`;

    row.querySelector(".pitem-card-title").textContent = item.name;
    row.querySelector(".pitem-price-text").textContent = item.rate;
    row.querySelector(".pitem-status-text").textContent = item.status || 'లభ్యం';

    row.querySelector(".pitem-delete-btn").onclick = function() {
      window.deleteProviderItem(safeId, type, item.name);
    };

    listTarget.appendChild(row);
  });

  container.replaceChildren(boxNode);
};

// 6. Delete Provider Item
window.deleteProviderItem = async function(id, type, itemName) {
  if (!confirm("ఖచ్చితంగా తొలగించాలనుకుంటున్నారా?")) return;

  if (window.db && id && !id.startsWith("idx_")) {
    try {
      await window.db.collection("provider_items").doc(id).delete();
    } catch (err) {}
  }

  let localItems = JSON.parse(localStorage.getItem('agri_provider_items') || '[]');
  localItems = localItems.filter(item => {
    if (item.id && id && !id.startsWith("idx_")) return item.id !== id;
    return item.name !== itemName;
  });

  localStorage.setItem('agri_provider_items', JSON.stringify(localItems));
  window.renderProviderItemsList(type);
};

// 7. Incoming Orders Inbox (Pure Template Based - No innerHTML)
window.renderIncomingBookingsForProvider = function(containerId) {
  const box = document.getElementById(containerId);
  const boxTpl = document.getElementById('provider-orders-box-template');
  const cardTpl = document.getElementById('provider-order-card-template');
  if (!box || !boxTpl || !cardTpl) return;

  const currentPhone = window.AppState?.userProfile?.phone || "";

  function renderUI(raw) {
    const bookings = (raw || []).filter(b => {
      const bPhone = String(b.providerPhone || b.targetPhone || "").trim();
      return !bPhone || (currentPhone && bPhone === currentPhone);
    });

    if (bookings.length === 0) {
      const emptyEl = document.createElement("p");
      emptyEl.className = "empty-provider-notice";
      emptyEl.textContent = "ప్రస్తుతం కొత్త ఆర్డర్‌లు లేవు.";
      box.replaceChildren(emptyEl);
      return;
    }

    const boxNode = boxTpl.content.cloneNode(true);
    boxNode.querySelector("#porders-badge-count").textContent = bookings.length;
    const scrollTarget = boxNode.querySelector("#porders-scroll-target");

    bookings.forEach(b => {
      const card = cardTpl.content.cloneNode(true);
      const isAccepted = b.status === 'ACCEPTED';
      const rootCard = card.querySelector(".porders-card");
      if (isAccepted) rootCard.classList.add("accepted");

      const typeTag = card.querySelector(".porders-type-tag");
      typeTag.textContent = b.type === 'SPOT' ? '⚡ SPOT (వెంటనే)' : '📅 ADVANCE బుకింగ్';
      typeTag.classList.add(b.type === 'SPOT' ? 'spot' : 'advance');

      card.querySelector(".porders-time-text").textContent = b.createdAt || '';
      card.querySelector(".porders-veh-name").textContent = b.vehicleType || b.itemName || '';
      
      // Pure Text Binding
      card.querySelector(".porders-work-val").textContent = b.workSize || b.duration || '';
      card.querySelector(".porders-time-val").textContent = b.schedule || b.date || '';
      card.querySelector(".porders-farmer-val").textContent = b.farmerName || '';
      card.querySelector(".porders-village-val").textContent = b.village || '';

      const callBtn = card.querySelector(".porders-call-btn");
      callBtn.href = `tel:${b.farmerPhone || b.phone || ''}`;

      const acceptBtn = card.querySelector(".porders-accept-btn");
      const acceptedBadge = card.querySelector(".porders-accepted-badge");

      if (isAccepted) {
        acceptBtn.remove();
        acceptedBadge.classList.remove("is-hidden");
      } else {
        acceptBtn.onclick = function() {
          window.acceptBookingOrder(b.id);
        };
      }

      scrollTarget.appendChild(card);
    });

    box.replaceChildren(boxNode);
  }

  if (window.db && currentPhone) {
    window.db.collection("farmer_bookings").where("providerPhone", "==", currentPhone).onSnapshot(snap => {
      let bList = [];
      snap.forEach(doc => bList.push({ ...doc.data(), id: doc.id }));
      renderUI(bList.length > 0 ? bList : JSON.parse(localStorage.getItem('agri_active_bookings') || '[]'));
    }, () => {
      renderUI(JSON.parse(localStorage.getItem('agri_active_bookings') || '[]'));
    });
  } else {
    renderUI(JSON.parse(localStorage.getItem('agri_active_bookings') || '[]'));
  }
};

window.acceptBookingOrder = async function(bookingId) {
  let bookings = JSON.parse(localStorage.getItem('agri_active_bookings') || '[]');
  const idx = bookings.findIndex(b => b.id === bookingId);
  if (idx !== -1) {
    bookings[idx].status = 'ACCEPTED';
    localStorage.setItem('agri_active_bookings', JSON.stringify(bookings));
  }

  if (window.db && bookingId) {
    try {
      await window.db.collection("farmer_bookings").doc(bookingId).update({ status: 'ACCEPTED' });
    } catch (e) {}
  }

  window.renderIncomingBookingsForProvider('provider-incoming-requests');
  alert("ఆర్డర్ కన్ఫర్మ్ చేయబడింది!");
};

// 8. 🚜 🌱 🚚 రైతు ట్యాబ్‌లలో ప్రొవైడర్ ఐటమ్స్ రెండరింగ్ (Pure Template)
function renderFarmerCategoryWidget(containerId, categoryType) {
  const mount = document.getElementById(containerId);
  const itemTpl = document.getElementById("farmer-category-item-template");
  if (!mount || !itemTpl) return;

  let allItems = [];
  try {
    allItems = JSON.parse(localStorage.getItem('agri_provider_items') || '[]');
  } catch (e) { allItems = []; }

  const filtered = allItems.filter(it => it.type === categoryType || it.category === categoryType);

  if (filtered.length === 0) {
    return;
  }

  mount.replaceChildren();

  filtered.forEach(item => {
    const card = itemTpl.content.cloneNode(true);
    card.querySelector(".market-item-name").textContent = item.name;
    card.querySelector(".market-item-owner").textContent = `👤 యజమాని: ${item.owner} (${item.village || 'సమీప ప్రాంతం'})`;
    card.querySelector(".market-item-meta").textContent = `లభ్యత: ${item.status || 'అందుబాటులో ఉంది'}`;
    card.querySelector(".market-item-rate").textContent = item.rate;

    card.querySelector(".market-btn-call").href = `tel:${item.phone}`;
    card.querySelector(".market-btn-wa").href = `https://wa.me/91${item.phone}`;

    card.querySelector(".market-btn-book").onclick = function() {
      if (typeof window.openBookingModal === 'function') {
        window.openBookingModal(item.name, item.owner, item.rate, item.phone);
      }
    };

    mount.appendChild(card);
  });
}

window.renderEquipmentWidget = function(paneId) {
  renderFarmerCategoryWidget(paneId, 'equipment');
};
window.renderSeedsWidget = function(paneId) {
  renderFarmerCategoryWidget(paneId, 'seeds');
};
window.renderTransportWidget = function(paneId) {
  renderFarmerCategoryWidget(paneId, 'transport');
};
