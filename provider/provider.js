// provider/provider.js - Dedicated Provider Dashboard & Order Engine
window.ProviderModule = {
  selectedType: 'equipment',

  renderDashboard: function(container, type) {
    if (!container) return;
    this.selectedType = type || 'equipment';

    const tpl = document.getElementById('provider-dashboard-template');
    if (!tpl) return;

    container.replaceChildren();
    const clone = tpl.content.cloneNode(true);
    const card = clone.querySelector('.provider-dashboard-card');

    const configs = {
      equipment: { name: '🚜 పరికరాల నిర్వహణ డ్యాష్‌బోర్డ్', desc: 'మీ ట్రాక్టర్లు, హార్వెస్టర్లు మొదలైన పరికరాలను జోడించండి', theme: 'provider-theme-equipment' },
      transport: { name: '🚚 రవాణా వాహనాల డ్యాష్‌బోర్డ్', desc: 'మీ రవాణా వాహనాలు, ట్రాలీలు, ఆటోలను అద్దెకు చేర్చండి', theme: 'provider-theme-transport' },
      seeds: { name: '🌱 విత్తనాలు & ఎరువుల డీలర్ డ్యాష్‌బోర్డ్', desc: 'మీ వద్ద ఉన్న స్టాక్ మరియు ధరల వివరాలను నమోదు చేయండి', theme: 'provider-theme-seeds' }
    };
    const current = configs[this.selectedType] || configs.equipment;

    card.classList.remove('provider-theme-equipment', 'provider-theme-transport', 'provider-theme-seeds');
    card.classList.add(current.theme);
    clone.querySelector('.provider-dash-title').textContent = current.name;
    clone.querySelector('.provider-dash-desc').textContent = current.desc;

    clone.querySelector('.provider-add-service-btn').onclick = () => {
      window.ProviderModule.openAddModal(this.selectedType);
    };

    const itemsBox = clone.querySelector('.provider-items-box-wrapper');
    itemsBox.id = 'provider-items-list';

    const reqsBox = clone.querySelector('.provider-incoming-requests-wrapper');
    reqsBox.id = 'provider-incoming-requests';

    container.appendChild(clone);

    this.renderItemsList(this.selectedType);
    this.renderIncomingBookings('provider-incoming-requests');
  },

  openAddModal: function(type) {
    this.selectedType = type || 'equipment';
    const modal = document.getElementById('provider-item-modal');
    if (!modal) return console.warn("Provider modal DOM not loaded yet.");

    modal.classList.remove('provider-theme-equipment', 'provider-theme-transport', 'provider-theme-seeds');

    const titleEl = document.getElementById('pitem-modal-dynamic-title');
    const lbl1 = document.getElementById('pitem-lbl-1');
    const lbl2 = document.getElementById('pitem-lbl-2');
    const lbl3 = document.getElementById('pitem-lbl-3');
    const selectField = document.getElementById('item-field-3-select');
    const textField = document.getElementById('item-field-3-text');
    const form = document.getElementById('provider-add-item-form');

    if (form) form.reset();

    if (type === 'transport') {
      if (titleEl) titleEl.textContent = '🚚 రవాణా వాహనం వివరాలు జోడించండి';
      if (lbl1) lbl1.textContent = 'వాహనం రకం:';
      if (lbl2) lbl2.textContent = 'ఛార్జీ (కి.మీ / ట్రిప్ ₹):';
      if (lbl3) lbl3.textContent = 'మోసే బరువు సామర్థ్యం:';
      if (selectField) selectField.classList.add('hidden');
      if (textField) {
        textField.classList.remove('hidden');
        textField.placeholder = 'ఉదా: 2 టన్నులు / 50 బస్తాలు';
        textField.required = true;
      }
      modal.classList.add('provider-theme-transport');
    } else if (type === 'seeds') {
      if (titleEl) titleEl.textContent = '🌱 విత్తనాలు / ఎరువుల వివరాలు జోడించండి';
      if (lbl1) lbl1.textContent = 'పంట రకం & బ్రాండ్:';
      if (lbl2) lbl2.textContent = 'ధర (బ్యాగ్ / ప్యాకెట్ ₹):';
      if (lbl3) lbl3.textContent = 'స్టాక్ లభ్యత:';
      if (selectField) selectField.classList.add('hidden');
      if (textField) {
        textField.classList.remove('hidden');
        textField.placeholder = 'ఉదా: 100 బ్యాగులు అందుబాటులో ఉన్నాయి';
        textField.required = true;
      }
      modal.classList.add('provider-theme-seeds');
    } else {
      if (titleEl) titleEl.textContent = '🚜 పరికరం వివరాలు జోడించండి';
      if (lbl1) lbl1.textContent = 'పరికరం రకం / మోడల్:';
      if (lbl2) lbl2.textContent = 'అద్దె ధర (గంటకు ₹):';
      if (lbl3) lbl3.textContent = 'పని స్థితి (Availability):';
      if (textField) {
        textField.classList.add('hidden');
        textField.required = false;
      }
      if (selectField) selectField.classList.remove('hidden');
      modal.classList.add('provider-theme-equipment');
    }

    modal.classList.remove('hidden');
    modal.classList.add('visible-flex');
  },

  closeAddModal: function() {
    const modal = document.getElementById('provider-item-modal');
    if (modal) {
      modal.classList.remove('visible-flex');
      modal.classList.add('hidden');
    }
  },

  handleSaveItem: async function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const type = this.selectedType || 'equipment';
    const val1 = document.getElementById('item-field-1')?.value.trim();
    const val2 = document.getElementById('item-field-2')?.value.trim();
    const selectField = document.getElementById('item-field-3-select');
    const textField = document.getElementById('item-field-3-text');
    const val3 = (type === 'equipment' ? selectField?.value : textField?.value)?.trim();

    if (!val1 || !val2 || !val3) {
      alert("దయచేసి అన్ని వివరాలు నమోదు చేయండి.");
      return;
    }

    const profile = window.AppState?.userProfile || 
                    JSON.parse(localStorage.getItem('agri_user_profile')) || {};

    const ownerName = profile.name || profile.userName || 'యజమాని';
    const ownerPhone = profile.phone || profile.mobile || '';
    const ownerVillage = profile.village || '';

    if (!ownerPhone) {
      alert("దయచేసి ముందుగా సరైన మొబైల్ నంబర్‌తో లాగిన్ అవ్వండి.");
      return;
    }

    const newItem = {
      name: val1,
      rate: '₹' + val2 + ' / గంట',
      rawRate: val2,
      type: type || 'equipment',
      category: type || 'equipment',
      status: val3,
      owner: ownerName,
      phone: ownerPhone,
      village: ownerVillage,
      loc: ownerVillage ? `${ownerVillage} పరిధి` : 'స్థానిక పరిధి',
      createdAt: new Date().toISOString()
    };

    if (window.AgriDB) {
      try {
        await window.AgriDB.addProviderItem(newItem);
        alert("🎉 " + val1 + " విజయవంతంగా లైవ్ డేటాబేస్‌లో చేర్చబడింది!");
      } catch (error) {
        console.error("Save error:", error);
        alert("డేటాబేస్ లోపం: " + error.message);
      }
    }

    let items = JSON.parse(localStorage.getItem('agri_provider_items') || '[]');
    items.unshift(newItem);
    localStorage.setItem('agri_provider_items', JSON.stringify(items));

    this.closeAddModal();
    this.renderItemsList(type);
  },

  renderItemsList: async function(type) {
    const container = document.getElementById('provider-items-list');
    if (!container) return;

    const profile = window.AppState?.userProfile || JSON.parse(localStorage.getItem('agri_user_profile')) || {};
    const currentUserPhone = String(profile.phone || '').trim();
    const currentType = type || profile.providerType || 'equipment';

    container.replaceChildren();
    const loadingP = document.createElement('p');
    loadingP.className = 'pitem-loading-text';
    loadingP.textContent = 'వివరాలు లోడ్ అవుతున్నాయి...';
    container.appendChild(loadingP);

    try {
      let items = [];
      if (typeof db !== 'undefined' && db.collection && currentUserPhone) {
        const snapshot = await db.collection("provider_items")
          .where("phone", "==", currentUserPhone)
          .get();
        snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      }

      if (items.length === 0) {
        const local = JSON.parse(localStorage.getItem('agri_provider_items') || '[]');
        items = local.filter(it => !currentUserPhone || it.phone === currentUserPhone);
      }

      container.replaceChildren();

      if (items.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'pitem-empty-card';
        emptyDiv.textContent = `ఈ నంబర్ (${currentUserPhone || 'ప్రొఫైల్'}) పై ఇంకా ఏ వస్తువులు లేదా సేవలు జోడించలేదు.`;
        container.appendChild(emptyDiv);
        return;
      }

      const box = document.createElement('div');
      box.className = 'pitem-box';

      const header = document.createElement('div');
      header.className = 'pitem-header';
      
      const title = document.createElement('div');
      title.className = 'pitem-title-text';
      title.textContent = '🚜 మీరు జోడించిన వస్తువులు ';
      const badge = document.createElement('span');
      badge.className = 'pitem-count-badge';
      badge.textContent = items.length;
      title.appendChild(badge);

      const liveBadge = document.createElement('span');
      liveBadge.className = 'pitem-live-badge';
      const liveDot = document.createElement('span');
      liveDot.className = 'pitem-live-dot';
      liveBadge.appendChild(liveDot);
      liveBadge.appendChild(document.createTextNode(' LIVE'));

      header.appendChild(title);
      header.appendChild(liveBadge);
      box.appendChild(header);

      const scrollList = document.createElement('div');
      scrollList.className = 'pitem-scroll-list';

      const rowTpl = document.getElementById('provider-item-row-template');

      items.forEach(item => {
        if (!rowTpl) return;
        const row = rowTpl.content.cloneNode(true);
        row.querySelector('.pitem-card-title').textContent = item.name || item.title || 'పేరు లేదు';
        row.querySelector('.pitem-price-text').textContent = item.rate || item.price || 'N/A';
        row.querySelector('.pitem-status-text').textContent = item.status || 'అందుబాటులో ఉంది';
        row.querySelector('.pitem-delete-btn').onclick = () => {
          window.ProviderModule.deleteItem(item.id, currentType);
        };
        scrollList.appendChild(row);
      });

      box.appendChild(scrollList);
      container.appendChild(box);

    } catch (err) {
      console.error("Firestore Error:", err);
      container.replaceChildren();
      const errP = document.createElement('p');
      errP.className = 'pitem-error-text';
      errP.textContent = 'డేటా లోడ్ చేయడంలో సమస్య వచ్చింది.';
      container.appendChild(errP);
    }
  },

  deleteItem: async function(id, type) {
    if (!id || !confirm("ఈ పరికరాన్ని / సేవను ఖచ్చితంగా తొలగించాలనుకుంటున్నారా?")) return;

    try {
      if (typeof db !== 'undefined' && db.collection) {
        await db.collection("provider_items").doc(id).delete();
      }
      let localItems = JSON.parse(localStorage.getItem('agri_provider_items')) || [];
      localItems = localItems.filter(item => item.id !== id);
      localStorage.setItem('agri_provider_items', JSON.stringify(localItems));

      alert("విజయవంతంగా తొలగించబడింది!");
      this.renderItemsList(type);
    } catch (error) {
      console.error("Delete error:", error);
      alert("తొలగించడంలో లోపం వచ్చింది: " + error.message);
    }
  },

  renderIncomingBookings: function(containerId) {
    const box = document.getElementById(containerId);
    if (!box) return;

    const currentPhone = (typeof window.getActiveUserPhone === 'function')
      ? window.getActiveUserPhone()
      : (window.AppState?.userProfile?.phone || "");

    const renderUI = (raw) => {
      const bookings = (raw || []).filter(b => {
        const bPhone = String(b.providerPhone || b.targetPhone || b.ownerPhone || "").trim();
        return !bPhone || (currentPhone && bPhone === currentPhone);
      });

      box.replaceChildren();

      if (bookings.length === 0) {
        const noOrders = document.createElement('div');
        noOrders.className = 'porders-empty-card';
        noOrders.textContent = 'ప్రస్తుతం కొత్త ఆర్డర్‌లు లేవు.';
        box.appendChild(noOrders);
        return;
      }

      const pBox = document.createElement('div');
      pBox.className = 'porders-box';

      const header = document.createElement('div');
      header.className = 'porders-header';
      const title = document.createElement('div');
      title.className = 'porders-title';
      title.textContent = '🔔 రైతుల నుండి వచ్చిన రిక్వెస్ట్‌లు ';
      const badge = document.createElement('span');
      badge.className = 'porders-count-badge';
      badge.textContent = bookings.length;
      title.appendChild(badge);

      const liveBadge = document.createElement('span');
      liveBadge.className = 'pitem-live-badge';
      const dot = document.createElement('span');
      dot.className = 'pitem-live-dot';
      liveBadge.appendChild(dot);
      liveBadge.appendChild(document.createTextNode(' LIVE'));

      header.appendChild(title);
      header.appendChild(liveBadge);
      pBox.appendChild(header);

      const scrollList = document.createElement('div');
      scrollList.className = 'porders-scroll-list';

      const cardTpl = document.getElementById('provider-order-card-template');

      bookings.forEach(b => {
        if (!cardTpl) return;
        const row = cardTpl.content.cloneNode(true);
        const cardEl = row.querySelector('.porders-card');

        if (b.status === 'ACCEPTED') cardEl.classList.add('accepted');

        const tag = row.querySelector('.porders-type-tag');
        tag.classList.add(b.type === 'SPOT' ? 'spot' : 'advance');
        tag.textContent = b.type === 'SPOT' ? '⚡ SPOT (వెంటనే కావాలి)' : '📅 ADVANCE బుకింగ్';

        row.querySelector('.porders-time-text').textContent = b.createdAt || '';
        row.querySelector('.porders-veh-name').textContent = b.vehicleType || b.itemName || '';
        row.querySelector('.porders-work-size').textContent = b.workSize || '';
        row.querySelector('.porders-schedule').textContent = b.schedule || '';
        row.querySelector('.porders-farmer-name').textContent = b.farmerName || '';
        row.querySelector('.porders-village').textContent = b.village || '';

        const callBtn = row.querySelector('.porders-call-btn');
        callBtn.href = `tel:${b.farmerPhone || ''}`;

        const mapBtn = row.querySelector('.porders-map-btn');
        if (b.mapLink) {
          mapBtn.href = b.mapLink;
          mapBtn.classList.remove('hidden');
          mapBtn.classList.add('visible-inline-flex');
        }

        const acceptBtn = row.querySelector('.porders-accept-btn');
        const acceptedBadge = row.querySelector('.porders-accepted-badge');

        if (b.status === 'ACCEPTED') {
          acceptBtn.classList.add('hidden');
          acceptedBadge.classList.remove('hidden');
          acceptedBadge.classList.add('visible-inline-flex');
        } else {
          acceptBtn.onclick = () => window.ProviderModule.acceptOrder(b.id);
        }

        scrollList.appendChild(row);
      });

      pBox.appendChild(scrollList);
      box.appendChild(pBox);
    };

    if (window.AgriDB && typeof window.AgriDB.listenToBookings === 'function') {
      window.AgriDB.listenToBookings(renderUI);
    } else {
      const local = JSON.parse(localStorage.getItem('agri_active_bookings') || '[]');
      renderUI(local);
    }
  },

  acceptOrder: async function(bookingId) {
    if (!bookingId) return;
    const user = window.AppState?.userProfile || {};
    const pName = user.name || 'యజమాని';
    const pPhone = user.phone || (typeof window.getActiveUserPhone === 'function' ? window.getActiveUserPhone() : '');

    try {
      if (typeof db !== 'undefined' && db.collection) {
        await db.collection("bookings").doc(bookingId).update({
          status: 'ACCEPTED',
          acceptedBy: `${pName} (${pPhone})`,
          acceptedAt: new Date().toISOString()
        });
      }

      let local = JSON.parse(localStorage.getItem('agri_active_bookings') || '[]');
      const idx = local.findIndex(b => b.id === bookingId);
      if (idx !== -1) {
        local[idx].status = 'ACCEPTED';
        local[idx].acceptedBy = `${pName} (${pPhone})`;
        localStorage.setItem('agri_active_bookings', JSON.stringify(local));
      }

      alert("ఆర్డర్ విజయవంతంగా స్వీకరించబడింది!");
      this.renderIncomingBookings('provider-incoming-requests');
    } catch (e) {
      console.error(e);
      alert("ఆర్డర్ స్వీకరించడంలో సమస్య వచ్చింది: " + e.message);
    }
  }
};

// Global Backwards Compatibility
window.renderProviderDashboardView = function(container, type) { window.ProviderModule.renderDashboard(container, type); };
window.openAddServiceModal = function(type) { window.ProviderModule.openAddModal(type); };
window.closeAddServiceModal = function() { window.ProviderModule.closeAddModal(); };
window.handleSaveProviderItem = function(e, type) { window.ProviderModule.handleSaveItem(e, type); };
window.renderProviderItemsList = function(type) { window.ProviderModule.renderItemsList(type); };
window.deleteProviderItem = function(id, type) { window.ProviderModule.deleteItem(id, type); };
window.renderIncomingBookingsForProvider = function(cId) { window.ProviderModule.renderIncomingBookings(cId); };
window.acceptBookingOrder = function(bId) { window.ProviderModule.acceptOrder(bId); };

// ===================================================
// Provider Landing Card Clone Logic
// ===================================================
window.injectProviderLandingCard = function() {
  const container = document.getElementById('provider-container') || document.getElementById('provider-hub-container');
  const tpl = document.getElementById('provider-landing-template');
  if (!container || !tpl) return;

  if (!window.AppState || !window.AppState.isLoggedIn) {
    container.replaceChildren();
    const clone = tpl.content.cloneNode(true);
    container.appendChild(clone);
    container.classList.remove('hidden');
    container.classList.add('visible-block');
  }
};

document.addEventListener("DOMContentLoaded", function() {
  if (typeof window.injectProviderLandingCard === "function") {
    window.injectProviderLandingCard();
  }
});
