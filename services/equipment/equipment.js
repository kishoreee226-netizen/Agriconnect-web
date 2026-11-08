// services/equipment/equipment.js - Standalone Equipment Service Engine
window.EquipmentService = {
  items: [],
  isListening: false,
  activeFilter: "all",

  init: async function() {
    // 1. CSS & HTML Templates లోడ్ చేయడం
    if (!document.getElementById("eq-service-style")) {
      const link = document.createElement("link");
      link.id = "eq-service-style";
      link.rel = "stylesheet";
      link.href = `services/equipment/equipment.css?v=${Date.now()}`;
      document.head.appendChild(link);
    }

    if (!document.getElementById("equipment-consumer-shell-template")) {
      try {
        const res = await fetch(`services/equipment/equipment.html?v=${Date.now()}`);
        if (res.ok) {
          const html = await res.text();
          const mount = document.createElement("div");
          mount.id = "agri-equipment-templates";
          mount.innerHTML = html;
          document.body.appendChild(mount);
        }
      } catch (e) {
        console.warn("Failed to load equipment templates:", e);
      }
    }

    this.startLiveSync();
  },

  startLiveSync: function() {
    if (this.isListening) return;

    const onDataReceived = (rawItems) => {
      this.items = (rawItems || []).map(item => ({
        id: item.docId || item.id,
        name: item.vehicleType || item.name || "పరికరము",
        owner: item.ownerName || item.owner || "యజమాని",
        rate: item.price ? `₹${item.price} / గంట` : (item.rate || "ధర లేదు"),
        price: item.price || 0,
        phone: item.ownerPhone || item.phone || "",
        loc: item.village || item.loc || "స్థానిక పరిధి",
        distanceKm: item.distanceKm || 1.0,
        village: item.villageMatch || "same",
        category: item.category || "equipment",
        ...item
      }));

      // రైతు స్క్రీన్‌పై ఉంటే ఆటో అప్‌డేట్
      const farmerPane = document.getElementById("farmer-pane-equipment");
      if (farmerPane && !farmerPane.classList.contains("is-hidden")) {
        this.renderConsumerView("farmer-pane-equipment");
      }
    };

    if (window.AgriDB && typeof window.AgriDB.listenToProviderItems === 'function') {
      this.isListening = true;
      window.AgriDB.listenToProviderItems(onDataReceived);
    } else if (window.db) {
      this.isListening = true;
      window.db.collection("provider_services").where("category", "==", "equipment")
        .onSnapshot(snap => {
          const list = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() }));
          onDataReceived(list);
        }, err => console.warn("Equipment Firestore sync:", err));
    } else {
      // Local Fallback
      try {
        const local = localStorage.getItem("agri_equipment_services");
        this.items = local ? JSON.parse(local) : [];
      } catch (e) {}
    }
  },

  // 1. Output: Render for Farmer (Consumer View)
  renderConsumerView: function(targetContainerId = "farmer-pane-equipment") {
    const container = document.getElementById(targetContainerId);
    if (!container) return;

    const shellTpl = document.getElementById("equipment-consumer-shell-template");
    const cardTpl = document.getElementById("equipment-item-card-template");
    if (!shellTpl || !cardTpl) return;

    container.replaceChildren();
    const clone = shellTpl.content.cloneNode(true);

    const filterSelect = clone.querySelector("#eq-loc-filter");
    if (filterSelect) filterSelect.value = this.activeFilter;

    const filtered = this.items.filter(eq => {
      if (eq.category && eq.category !== "equipment" && eq.category !== "machinery") return false;
      if (this.activeFilter === "village") return eq.village === "same" || eq.distanceKm <= 2;
      if (this.activeFilter === "5") return eq.distanceKm <= 5;
      if (this.activeFilter === "10") return eq.distanceKm <= 10;
      return true;
    });

    clone.querySelector("#eq-count-badge").textContent = `${filtered.length} లభ్యం`;
    const emptyBox = clone.querySelector("#eq-empty-state");
    const listWrap = clone.querySelector("#eq-items-list");

    if (filtered.length === 0) {
      emptyBox.classList.remove("is-hidden");
    } else {
      filtered.forEach(eq => {
        const c = cardTpl.content.cloneNode(true);
        c.querySelector(".eq-name").textContent = eq.name;
        c.querySelector(".eq-owner-meta").innerHTML = `యజమాని: <b>${eq.owner}</b> | 📍 ${eq.loc} (${eq.distanceKm} కి.మీ)`;
        c.querySelector(".eq-price-badge").textContent = eq.rate;

        // Farmer Module లోని Booking Modal కి లింక్ చేయడం
        c.querySelector(".eq-btn-book").onclick = () => {
          if (window.FarmerModule?.openBookingModal) {
            window.FarmerModule.openBookingModal(eq.name, eq.owner, eq.rate, eq.phone);
          } else if (typeof window.openBookingModal === "function") {
            window.openBookingModal(eq.name, eq.owner, eq.rate, eq.phone);
          }
        };

        c.querySelector(".eq-btn-call").href = `tel:${eq.phone}`;
        c.querySelector(".eq-btn-wa").href = `https://wa.me/91${eq.phone}`;
        listWrap.appendChild(c);
      });
    }

    container.appendChild(clone);
  },

  setFilter: function(val) {
    this.activeFilter = val;
    this.renderConsumerView("farmer-pane-equipment");
  },

  // 2. Input: Render Owner Input Form (Inside Provider Hub)
  renderProviderInput: function(targetContainerId) {
    const container = document.getElementById(targetContainerId);
    if (!container) return;

    const formTpl = document.getElementById("equipment-provider-form-template");
    if (!formTpl) return;

    container.replaceChildren();
    const clone = formTpl.content.cloneNode(true);

    // Auto Prefill with Logged-in User Profile
    const prof = window.AppState?.userProfile || {};
    const nameIn = clone.querySelector("#eq_reg_owner");
    const phoneIn = clone.querySelector("#eq_reg_phone");
    const villIn = clone.querySelector("#eq_reg_village");

    if (nameIn) nameIn.value = prof.name || "";
    if (phoneIn) phoneIn.value = prof.phone || "";
    if (villIn) villIn.value = prof.village || "";

    container.appendChild(clone);
  },

  handleOwnerSubmit: async function(e) {
    e.preventDefault();

    const vehicleType = document.getElementById("eq_reg_type").value;
    const ownerName = document.getElementById("eq_reg_owner").value.trim();
    const ownerPhone = document.getElementById("eq_reg_phone").value.trim();
    const price = parseFloat(document.getElementById("eq_reg_price").value) || 500;
    const village = document.getElementById("eq_reg_village").value.trim();

    const newRecord = {
      id: "EQ-" + Date.now(),
      category: "equipment",
      vehicleType,
      name: vehicleType,
      ownerName,
      ownerPhone,
      price,
      rate: `₹${price} / గంట`,
      village,
      distanceKm: 1.0,
      createdAt: Date.now()
    };

    // Firebase Sync
    if (window.db) {
      try {
        await window.db.collection("provider_services").add(newRecord);
      } catch (err) {
        console.warn("Cloud save failed, local fallback:", err);
      }
    }

    let local = JSON.parse(localStorage.getItem("agri_equipment_services") || "[]");
    local.unshift(newRecord);
    localStorage.setItem("agri_equipment_services", JSON.stringify(local));

    alert("✅ మీ పరికరం విజయవంతంగా నమోదైంది! రైతులకు లైవ్‌లో కనిపిస్తుంది.");
    document.getElementById("equipment-register-form")?.reset();
  }
};

// Global Bridge
window.renderEquipmentWidget = function(targetId) {
  window.EquipmentService.renderConsumerView(targetId);
};
window.filterEquipmentByRange = function(val) {
  window.EquipmentService.setFilter(val);
};

// Auto Init on script load
window.EquipmentService.init();
// Register Equipment with Central Plug & Play Registry
window.AgriServicesRegistry?.register({
  id: "equipment",
  label: "🚜 పరికరాలు",
  renderConsumer: (containerId) => window.EquipmentService.renderConsumerView(containerId),
  renderProvider: (containerId) => window.EquipmentService.renderProviderInput(containerId)
});

