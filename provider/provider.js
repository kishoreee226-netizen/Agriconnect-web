// provider/provider.js - Dedicated Provider Dashboard & Order Engine
window.ProviderModule = {
  selectedType: 'equipment',

  renderDashboard: function(container, type) {
    if (!container) return;
    this.selectedType = type || 'equipment';

    const titles = {
      equipment: { name: '🚜 పరికరాల నిర్వహణ డ్యాష్‌బోర్డ్', color: '#f57c00', desc: 'మీ ట్రాక్టర్లు, హార్వెస్టర్లు మొదలైన పరికరాలను జోడించండి' },
      transport: { name: '🚚 రవాణా వాహనాల డ్యాష్‌బోర్డ్', color: '#7b1fa2', desc: 'మీ రవాణా వాహనాలు, ట్రాలీలు, ఆటోలను అద్దెకు చేర్చండి' },
      seeds: { name: '🌱 విత్తనాలు & ఎరువుల డీలర్ డ్యాష్‌బోర్డ్', color: '#2e7d32', desc: 'మీ వద్ద ఉన్న స్టాక్ మరియు ధరల వివరాలను నమోదు చేయండి' }
    };
    const current = titles[this.selectedType] || titles.equipment;

    container.innerHTML = `
      <div class="provider-dashboard-card" style="--provider-theme: ${current.color};">
        <h3 class="provider-dash-title">${current.name}</h3>
        <p class="provider-dash-desc">${current.desc}</p>
        
        <div onclick="window.ProviderModule.openAddModal('${this.selectedType}')" class="provider-add-service-btn">
          <span class="provider-add-service-text">➕ కొత్త వస్తువును / సేవను జోడించండి</span>
          <p class="provider-add-service-subtext">వివరాలు నమోదు చేయడానికి ఇక్కడ నొక్కండి</p>
        </div>

        <div id="provider-items-list" style="margin-top:16px;"></div>
        <div id="provider-incoming-requests"></div>
      </div>
    `;

    this.renderItemsList(this.selectedType);
    this.renderIncomingBookings('provider-incoming-requests');
  },

  openAddModal: function(type) {
    let modal = document.getElementById('provider-item-modal');
    if (modal) modal.remove();

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
            <input type="text" id="item-field-1" placeholder="ఉదా: బొలెరో పికప్ / 407 DCM / ట్రాక్టర్ ట్రాలీ" required class="provider-form-input" />
          </div>
          <div class="provider-form-group">
            <label class="provider-form-label">ఛార్జీ (కి.మీ / ట్రిప్ ₹):</label>
            <input type="text" id="item-field-2" placeholder="ఉదా: ₹35 / కి.మీ లేదా ₹1200 / ట్రిప్" required class="provider-form-input" />
          </div>
          <div class="provider-form-group last">
            <label class="provider-form-label">మోసే బరువు సామర్థ్యం:</label>
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

    const conf = configs[type] || configs.equipment;
    modal = document.createElement('div');
    modal.id = 'provider-item-modal';
    modal.className = 'pitem-modal-overlay';
    modal.style.setProperty('--pitem-color', conf.color);

    modal.innerHTML = `
      <div class="pitem-modal-card">
        <button onclick="window.ProviderModule.closeAddModal()" class="provider-close-btn">✕</button>
        <h3 class="pitem-modal-title">${conf.title}</h3>
        <form onsubmit="window.ProviderModule.handleSaveItem(event, '${type}')">
          ${conf.fields}
          <button type="submit" class="pitem-submit-btn">లిస్టింగ్‌ను సేవ్ చేయండి ➔</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  },

  closeAddModal: function() {
    const modal = document.getElementById('provider-item-modal');
    if (modal) modal.remove();
  },

  handleSaveItem: async function(e, type) {
    e.preventDefault();
    const val1 = document.getElementById('item-field-1').value.trim();
    const val2 = document.getElementById('item-field-2').value.trim();
    const val3 = document.getElementById('item-field-3').value.trim();

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

    container.innerHTML = `<p class="pitem-loading-text">వివరాలు లోడ్ అవుతున్నాయి...</p>`;

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

      if (items.length === 0) {
        container.innerHTML = `
          <div class="pitem-empty-card" style="padding:14px; text-align:center; color:#64748b; font-size:13px; background:#fff; border-radius:10px;">
            ఈ నంబర్ (${currentUserPhone || 'ప్రొఫైల్'}) పై ఇంకా ఏ వస్తువులు లేదా సేవలు జోడించలేదు.
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="pitem-box">
          <div class="pitem-header">
            <div class="pitem-title-text">
              🚜 మీరు జోడించిన వస్తువులు <span class="pitem-count-badge">${items.length}</span>
            </div>
            <span class="pitem-live-badge"><span class="pitem-live-dot"></span> LIVE</span>
          </div>

          <div class="pitem-scroll-list">
            ${items.map(item => `
              <div class="pitem-card-row">
                <div>
                  <div class="pitem-card-title">${item.name || item.title || 'పేరు లేదు'}</div>
                  <div class="pitem-card-details">
                    ధర / అద్దె: <b class="pitem-price-text">${item.rate || item.price || 'N/A'}</b> | <span>${item.status || 'అందుబాటులో ఉంది'}</span>
                  </div>
                </div>
                <button onclick="window.ProviderModule.deleteItem('${item.id}', '${currentType}')" class="pitem-delete-btn">తీసివేయి</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } catch (err) {
      console.error("Firestore Error:", err);
      container.innerHTML = `<p class="pitem-error-text">డేటా లోడ్ చేయడంలో సమస్య వచ్చింది.</p>`;
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

      if (bookings.length === 0) {
        box.innerHTML = `<div style="padding:14px; text-align:center; color:#64748b; font-size:13px; background:#fff; border-radius:10px; margin-top:14px;">ప్రస్తుతం కొత్త ఆర్డర్‌లు లేవు.</div>`;
        return;
      }

      box.innerHTML = `
        <div class="porders-box">
          <div class="porders-header">
            <div class="porders-title">🔔 రైతుల నుండి వచ్చిన రిక్వెస్ట్‌లు <span class="porders-count-badge">${bookings.length}</span></div>
            <span class="pitem-live-badge"><span class="pitem-live-dot"></span> LIVE</span>
          </div>

          <div class="porders-scroll-list">
            ${bookings.map(b => `
              <div class="porders-card ${b.status === 'ACCEPTED' ? 'accepted' : ''}">
                <div class="porders-card-top">
                  <span class="porders-type-tag ${b.type === 'SPOT' ? 'spot' : 'advance'}">
                    ${b.type === 'SPOT' ? '⚡ SPOT (వెంటనే కావాలి)' : '📅 ADVANCE బుకింగ్'}
                  </span>
                  <span style="font-size:11px; color:#64748b;">${b.createdAt || ''}</span>
                </div>
                <div class="porders-veh-name">${b.vehicleType || b.itemName || ''}</div>
                <div class="porders-work-details">
                  <div>పని: <b>${b.workSize || ''}</b> &nbsp;|&nbsp; సమయం: <b>${b.schedule || ''}</b></div>
                  <div>రైతు: <b>${b.farmerName || ''}</b>, గ్రామం: <b>${b.village || ''}</b></div>
                </div>
                <div class="porders-btn-row">
                  <a href="tel:${b.farmerPhone || ''}" class="porders-action-btn porders-call-btn">📞 రైతుకు కాల్</a>
                  ${b.mapLink ? `<a href="${b.mapLink}" target="_blank" class="porders-action-btn porders-map-btn">🗺️ పొలం మ్యాప్</a>` : ''}
                  ${b.status !== 'ACCEPTED' 
                    ? `<button onclick="window.ProviderModule.acceptOrder('${b.id}')" class="porders-action-btn porders-accept-btn">✅ ఒప్పుకోండి (Accept)</button>`
                    : `<span class="porders-accepted-badge">ఆర్డర్ స్వీకరించబడింది</span>`
                  }
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
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

// Global Backwards Compatibility (పాత కాల్స్ ఎక్కడున్నా ఆగకుండా ఉండటానికి)
window.renderProviderDashboardView = function(container, type) {
  window.ProviderModule.renderDashboard(container, type);
};
window.openAddServiceModal = function(type) { window.ProviderModule.openAddModal(type); };
window.closeAddServiceModal = function() { window.ProviderModule.closeAddModal(); };
window.handleSaveProviderItem = function(e, type) { window.ProviderModule.handleSaveItem(e, type); };
window.renderProviderItemsList = function(type) { window.ProviderModule.renderItemsList(type); };
window.deleteProviderItem = function(id, type) { window.ProviderModule.deleteItem(id, type); };
window.renderIncomingBookingsForProvider = function(cId) { window.ProviderModule.renderIncomingBookings(cId); };
window.acceptBookingOrder = function(bId) { window.ProviderModule.acceptOrder(bId); };
