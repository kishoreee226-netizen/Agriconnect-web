// services/transport/transport.js - Standalone Transport Service Engine
window.TransportService = {
  items: [],
  isListening: false,
  activeFilter: "all",

  init: async function() {
    // 1. CSS & HTML Templates లోడ్ చేయడం
    if (!document.getElementById("transport-service-style")) {
      const link = document.createElement("link");
      link.id = "transport-service-style";
      link.rel = "stylesheet";
      link.href = `services/transport/transport.css?v=${Date.now()}`;
      document.head.appendChild(link);
    }

    if (!document.getElementById("transport-consumer-shell-template")) {
      try {
        const res = await fetch(`services/transport/transport.html?v=${Date.now()}`);
        if (res.ok) {
          const html = await res.text();
          const mount = document.createElement("div");
          mount.id = "agri-transport-templates";
          mount.innerHTML = html;
          document.body.appendChild(mount);
        }
      } catch (e) {
        console.warn("Failed to load transport templates:", e);
      }
    }

    this.startLiveSync();
  },

  startLiveSync: function() {
    if (this.isListening) return;

    const onDataReceived = (rawItems) => {
      this.items = (rawItems || []).map(tr => ({
        id: tr.docId || tr.id,
        name: tr.vehicleType || tr.name || "రవాణా వాహనం",
        driver: tr.driverName || tr.driver || tr.ownerName || "డ్రైవర్",
        rate: tr.rate || (tr.price ? `₹${tr.price}` : "రేటు అందుబాటులో లేదు"),
        phone: tr.phone || tr.driverPhone || "",
        loc: tr.village || tr.loc || "స్థానిక పరిధి",
        distanceKm: Number(tr.distanceKm || 2.0),
        village: tr.villageMatch || "same",
        ...tr
      }));

      // రైతు స్క్రీన్‌పై రవాణా ట్యాబ్ ఓపెన్ అయి ఉంటే ఆటో అప్‌డేట్
      const farmerPane = document.getElementById("farmer-pane-transport");
      if (farmerPane && !farmerPane.classList.contains("is-hidden")) {
        this.renderConsumerView("farmer-pane-transport");
      }
    };

    if (window.AgriDB && typeof window.AgriDB.listenToServices === 'function') {
      this.isListening = true;
      window.AgriDB.listenToServices("transport", onDataReceived);
    } else if (window.db) {
      this.isListening = true;
      window.db.collection("transport").onSnapshot(snap => {
        const list = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        onDataReceived(list);
      }, err => console.warn("Transport Firestore sync:", err));
    } else {
      try {
        const local = localStorage.getItem("agri_transport_services");
        this.items = local ? JSON.parse(local) : [];
      } catch (e) {}
    }
  },

  // 1. Output: Render for Farmer (Consumer View)
  renderConsumerView: function(targetContainerId = "farmer-pane-transport") {
    const container = document.getElementById(targetContainerId);
    if (!container) return;

    const shellTpl = document.getElementById("transport-consumer-shell-template");
    const cardTpl = document.getElementById("transport-item-card-template");
    if (!shellTpl || !cardTpl) return;

    container.replaceChildren();
    const clone = shellTpl.content.cloneNode(true);

    const filterSelect = clone.querySelector("#tr-loc-filter");
    if (filterSelect) filterSelect.value = this.activeFilter;

    const filtered = this.items.filter(tr => {
      if (this.activeFilter === "village") return tr.village === "same" || tr.distanceKm <= 2;
      if (this.activeFilter === "5") return tr.distanceKm <= 5;
      if (this.activeFilter === "10") return tr.distanceKm <= 10;
      return true;
    });

    clone.querySelector("#transport-count-badge").textContent = `${filtered.length} లభ్యం`;
    const emptyBox = clone.querySelector("#transport-empty-state");
    const listWrap = clone.querySelector("#transport-items-list");

    if (filtered.length === 0) {
      emptyBox.classList.remove("is-hidden");
    } else {
      filtered.forEach(tr => {
        const c = cardTpl.content.cloneNode(true);
        c.querySelector(".transport-name").textContent = tr.name;
        c.querySelector(".transport-owner-meta").innerHTML = `డ్రైవర్/యజమాని: <b>${tr.driver}</b> | 📍 ${tr.loc} (${tr.distanceKm} కి.మీ)`;
        c.querySelector(".transport-price-badge").textContent = tr.rate;

        // Farmer Module Booking Modal Link
        c.querySelector(".transport-btn-book").onclick = () => {
          if (window.FarmerModule?.openBookingModal) {
            window.FarmerModule.openBookingModal(tr.name, tr.driver, tr.rate, tr.phone);
          } else if (typeof window.openBookingModal === "function") {
            window.openBookingModal(tr.name, tr.driver, tr.rate, tr.phone);
          }
        };

        c.querySelector(".transport-btn-call").href = `tel:${tr.phone}`;
        c.querySelector(".transport-btn-wa").href = `https://wa.me/91${tr.phone}`;

        listWrap.appendChild(c);
      });
    }

    container.appendChild(clone);
  },

  setFilter: function(val) {
    this.activeFilter = val;
    this.renderConsumerView("farmer-pane-transport");
  },

  // 2. Input: Render Driver Input Form (Inside Provider Hub)
  renderProviderInput: function(targetContainerId) {
    const container = document.getElementById(targetContainerId);
    if (!container) return;

    const formTpl = document.getElementById("transport-provider-form-template");
    if (!formTpl) return;

    container.replaceChildren();
    const clone = formTpl.content.cloneNode(true);

    const prof = window.AppState?.userProfile || {};
    const driverIn = clone.querySelector("#tr_reg_driver");
    const phoneIn = clone.querySelector("#tr_reg_phone");
    const villIn = clone.querySelector("#tr_reg_village");

    if (driverIn) driverIn.value = prof.name || "";
    if (phoneIn) phoneIn.value = prof.phone || "";
    if (villIn) villIn.value = prof.village || "";

    container.appendChild(clone);
  },

  handleDriverSubmit: async function(e) {
    e.preventDefault();

    const vehicleType = document.getElementById("tr_reg_type").value;
    const driverName = document.getElementById("tr_reg_driver").value.trim();
    const phone = document.getElementById("tr_reg_phone").value.trim();
    const rate = document.getElementById("tr_reg_rate").value.trim();
    const village = document.getElementById("tr_reg_village").value.trim();

    const newRecord = {
      id: "TR-" + Date.now(),
      vehicleType,
      name: vehicleType,
      driverName,
      driver: driverName,
      phone,
      rate,
      price: rate,
      village,
      loc: village,
      distanceKm: 2.0,
      createdAt: Date.now()
    };

    // Firebase Sync
    if (window.db) {
      try {
        await window.db.collection("transport").add(newRecord);
      } catch (err) {
        console.warn("Cloud save failed, local fallback:", err);
      }
    }

    let local = JSON.parse(localStorage.getItem("agri_transport_services") || "[]");
    local.unshift(newRecord);
    localStorage.setItem("agri_transport_services", JSON.stringify(local));

    alert("✅ రవాణా వాహనం విజయవంతంగా నమోదైంది! రైతులకు లైవ్‌లో కనిపిస్తుంది.");
    document.getElementById("transport-register-form")?.reset();
  }
};

// Global Bridge
window.renderTransportWidget = function(targetId) {
  window.TransportService.renderConsumerView(targetId);
};
window.filterTransportByRange = function(val) {
  window.TransportService.setFilter(val);
};

// Auto Init on script load
window.TransportService.init();
