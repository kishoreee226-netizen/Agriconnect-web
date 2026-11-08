// services/seeds/seeds.js - Standalone Seeds & Fertilizers Service Engine
window.SeedsService = {
  items: [],
  isListening: false,

  // Global Filter States
  activeCrop: "all",
  activeStock: "all",
  activeVendor: "all",
  activePrice: "all",
  activeRange: "all",

  advisoryGuide: {
    all: {
      title: "🌾 ప్రస్తుత సీజన్ సమగ్ర సాగు సలహా",
      points: [
        "విత్తన శుద్ధి తప్పనిసరిగా కార్బండజిమ్ లేదా ట్రైకోడెర్మా విరిడేతో చేయాలి.",
        "భూసార పరీక్ష ఆధారంగా మాత్రమే సిఫార్సు చేసిన మోతాదులో ఎరువులు వాడండి."
      ]
    },
    paddy: {
      title: "🌾 వరి సాగు సూచనలు & సలహాలు",
      points: [
        "ఎకరానికి విత్తన మోతాదు: 20–25 కేజీలు. నారుమడిని ఎండబెట్టకుండా సమృద్ధిగా నీరందించాలి.",
        "విత్తే లోతు: 2-3 సెం.మీ మించకూడదు. నాట్లకు 20-25 రోజుల ముదురు నారు వాడండి."
      ]
    },
    cotton: {
      title: "☁️ పత్తి సాగు సూచనలు & సలహాలు",
      points: [
        "ఎకరానికి 2 ప్యాకెట్లు సరిపోతాయి. సాళ్ల మధ్య 3 అడుగులు, మొక్కల మధ్య 1 అడుగు దూరం ఉంచండి.",
        "మొదటి 45 రోజులు గులాబీ రంగు పురుగు, రసం పీల్చే పురుగుల పట్ల అప్రమత్తంగా ఉండాలి."
      ]
    },
    chilli: {
      title: "🌶️ మిరప నారు & సాగు సూచనలు",
      points: [
        "ఎకరానికి 10,000 నుండి 11,000 నారు మొక్కలు అవసరం. బెడ్లపై ఎత్తుగా నాటుకోవాలి.",
        "వైరస్ మరియు తామర పురుగుల నివారణకు వేపనూనె లేదా తగిన మితమైన స్ప్రేయింగ్ చేపట్టండి."
      ]
    },
    fertilizer: {
      title: "🧪 ఎరువుల సమగ్ర యాజమాన్యం",
      points: [
        "దుక్కిలో భాస్వరం (DAP/Super Phosphate) మరియు పొటాష్ పూర్తి మోతాదు వేయాలి.",
        "నత్రజని (యూరియా) ని ఒకేసారి వేయకుండా 2-3 దఫాలుగా విభజించి పంటకు అందించండి."
      ]
    }
  },

  init: async function() {
    // 1. CSS & HTML Templates లోడ్ చేయడం
    if (!document.getElementById("seeds-service-style")) {
      const link = document.createElement("link");
      link.id = "seeds-service-style";
      link.rel = "stylesheet";
      link.href = `services/seeds/seeds.css?v=${Date.now()}`;
      document.head.appendChild(link);
    }

    if (!document.getElementById("seeds-consumer-shell-template")) {
      try {
        const res = await fetch(`services/seeds/seeds.html?v=${Date.now()}`);
        if (res.ok) {
          const html = await res.text();
          const mount = document.createElement("div");
          mount.id = "agri-seeds-templates";
          mount.innerHTML = html;
          document.body.appendChild(mount);
        }
      } catch (e) {
        console.warn("Failed to load seeds templates:", e);
      }
    }

    this.startLiveSync();
  },

  startLiveSync: function() {
    if (this.isListening) return;

    const onDataReceived = (rawItems) => {
      this.items = (rawItems || []).map(item => ({
        id: item.docId || item.id,
        name: item.seedName || item.name || "విత్తనాలు / ఎరువులు",
        category: item.category || "paddy",
        vendorType: item.vendorType || "govt",
        vendor: item.vendor || item.dealerName || "సమీప డీలర్",
        rate: item.rate || (item.price ? `₹${item.price}` : "ధర అందుబాటులో లేదు"),
        priceNum: Number(item.priceNum || item.price || 0),
        phone: item.phone || item.dealerPhone || "",
        loc: item.village || item.loc || "సమీప కేంద్రం",
        distanceKm: Number(item.distanceKm || 2.0),
        stock: item.stock || "అందుబాటులో ఉంది",
        inStock: item.inStock !== undefined ? item.inStock : true
      }));

      // రైతు స్క్రీన్‌పై విత్తనాల ట్యాబ్ ఓపెన్ అయి ఉంటే ఆటో అప్‌డేట్
      const farmerPane = document.getElementById("farmer-pane-seeds");
      if (farmerPane && !farmerPane.classList.contains("is-hidden")) {
        this.renderConsumerView("farmer-pane-seeds");
      }
    };

    if (window.AgriDB && typeof window.AgriDB.listenToServices === 'function') {
      this.isListening = true;
      window.AgriDB.listenToServices("seeds", onDataReceived);
    } else if (window.db) {
      this.isListening = true;
      window.db.collection("seeds").onSnapshot(snap => {
        const list = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        onDataReceived(list);
      }, err => console.warn("Seeds Firestore sync:", err));
    } else {
      try {
        const local = localStorage.getItem("agri_seeds_services");
        this.items = local ? JSON.parse(local) : [];
      } catch (e) {}
    }
  },

  // 1. Output: Render for Farmer (Consumer View)
  renderConsumerView: function(targetContainerId = "farmer-pane-seeds") {
    const container = document.getElementById(targetContainerId);
    if (!container) return;

    const shellTpl = document.getElementById("seeds-consumer-shell-template");
    const cardTpl = document.getElementById("seed-item-card-template");
    if (!shellTpl || !cardTpl) return;

    container.replaceChildren();
    const clone = shellTpl.content.cloneNode(true);

    // Sync Dropdown Values
    clone.querySelector("#seeds-select-range").value = this.activeRange;
    clone.querySelector("#seeds-filter-crop").value = this.activeCrop;
    clone.querySelector("#seeds-filter-stock").value = this.activeStock;
    clone.querySelector("#seeds-filter-vendor").value = this.activeVendor;
    clone.querySelector("#seeds-filter-price").value = this.activePrice;

    // Filter Logic
    const filtered = this.items.filter(item => {
      let cropMatch = (this.activeCrop === "all") || (item.category === this.activeCrop);
      let stockMatch = (this.activeStock === "all") || (item.inStock === true);
      let vendorMatch = (this.activeVendor === "all") || (item.vendorType === this.activeVendor);

      let priceMatch = true;
      const p = item.priceNum || 0;
      if (this.activePrice === "low") priceMatch = p <= 500;
      else if (this.activePrice === "mid") priceMatch = p > 500 && p <= 1000;
      else if (this.activePrice === "high") priceMatch = p > 1000;

      let rangeMatch = true;
      if (this.activeRange === "village") rangeMatch = item.distanceKm <= 2.5;
      else if (this.activeRange === "5") rangeMatch = item.distanceKm <= 5.0;
      else if (this.activeRange === "10") rangeMatch = item.distanceKm <= 10.0;

      return cropMatch && stockMatch && vendorMatch && priceMatch && rangeMatch;
    });

    clone.querySelector("#seeds-count-badge").textContent = `${filtered.length} లభ్యం`;

    // Advisory Guidance Board Render
    const advisory = this.advisoryGuide[this.activeCrop] || this.advisoryGuide.all;
    clone.querySelector("#crop-guidance-title").innerHTML = `<span>💡</span> ${advisory.title}`;
    const advList = clone.querySelector("#crop-guidance-list");
    advList.innerHTML = advisory.points.map(pt => `<li>${pt}</li>`).join('');

    const emptyBox = clone.querySelector("#seeds-empty-card");
    const listWrap = clone.querySelector("#seeds-items-list");

    if (filtered.length === 0) {
      emptyBox.classList.remove("is-hidden");
    } else {
      filtered.forEach(seed => {
        const c = cardTpl.content.cloneNode(true);
        c.querySelector(".seed-item-title").textContent = seed.name;
        c.querySelector(".seed-owner-meta").innerHTML = `డీలర్/సొసైటీ: <b>${seed.vendor}</b> | 📍 ${seed.loc} (${seed.distanceKm} కి.మీ)`;
        c.querySelector(".seed-stock-badge").textContent = `📦 స్టాక్: ${seed.stock}`;
        c.querySelector(".seed-price-badge").textContent = seed.rate;

        // Farmer Module Booking Modal Link
        c.querySelector(".seed-btn-book").onclick = () => {
          if (window.FarmerModule?.openBookingModal) {
            window.FarmerModule.openBookingModal(seed.name, seed.vendor, seed.rate, seed.phone);
          } else if (typeof window.openBookingModal === "function") {
            window.openBookingModal(seed.name, seed.vendor, seed.rate, seed.phone);
          }
        };

        c.querySelector(".seed-btn-call").href = `tel:${seed.phone}`;
        c.querySelector(".seed-btn-wa").href = `https://wa.me/91${seed.phone}`;

        listWrap.appendChild(c);
      });
    }

    container.appendChild(clone);
  },

  applyFilter: function(type, val) {
    if (type === 'crop') this.activeCrop = val;
    if (type === 'stock') this.activeStock = val;
    if (type === 'vendor') this.activeVendor = val;
    if (type === 'price') this.activePrice = val;
    if (type === 'range') this.activeRange = val;
    this.renderConsumerView("farmer-pane-seeds");
  },

  // 2. Input: Render Dealer Input Form (Inside Provider Hub)
  renderProviderInput: function(targetContainerId) {
    const container = document.getElementById(targetContainerId);
    if (!container) return;

    const formTpl = document.getElementById("seeds-provider-form-template");
    if (!formTpl) return;

    container.replaceChildren();
    const clone = formTpl.content.cloneNode(true);

    const prof = window.AppState?.userProfile || {};
    const vendorIn = clone.querySelector("#seed_reg_vendor");
    const phoneIn = clone.querySelector("#seed_reg_phone");
    const villIn = clone.querySelector("#seed_reg_village");

    if (vendorIn) vendorIn.value = prof.name || "";
    if (phoneIn) phoneIn.value = prof.phone || "";
    if (villIn) villIn.value = prof.village || "";

    container.appendChild(clone);
  },

  handleDealerSubmit: async function(e) {
    e.preventDefault();

    const name = document.getElementById("seed_reg_name").value.trim();
    const category = document.getElementById("seed_reg_cat").value;
    const vendorType = document.getElementById("seed_reg_vendor_type").value;
    const vendor = document.getElementById("seed_reg_vendor").value.trim();
    const phone = document.getElementById("seed_reg_phone").value.trim();
    const priceNum = parseFloat(document.getElementById("seed_reg_price").value) || 0;
    const stock = document.getElementById("seed_reg_stock").value.trim();
    const village = document.getElementById("seed_reg_village").value.trim();

    const newRecord = {
      id: "SEED-" + Date.now(),
      seedName: name,
      name: name,
      category,
      vendorType,
      vendor,
      phone,
      price: priceNum,
      priceNum: priceNum,
      rate: `₹${priceNum}`,
      stock,
      inStock: true,
      village,
      loc: village,
      distanceKm: 2.0,
      createdAt: Date.now()
    };

    // Firebase Sync
    if (window.db) {
      try {
        await window.db.collection("seeds").add(newRecord);
      } catch (err) {
        console.warn("Cloud save failed, local fallback:", err);
      }
    }

    let local = JSON.parse(localStorage.getItem("agri_seeds_services") || "[]");
    local.unshift(newRecord);
    localStorage.setItem("agri_seeds_services", JSON.stringify(local));

    alert("✅ విత్తనాలు / ఎరువుల స్టాక్ నమోదైంది! రైతులకు లైవ్‌లో కనిపిస్తుంది.");
    document.getElementById("seeds-register-form")?.reset();
  }
};

// Global Bridge
window.renderSeedsWidget = function(targetId) {
  window.SeedsService.renderConsumerView(targetId);
};
window.applyAdvSeedFilter = function(t, v) {
  window.SeedsService.applyFilter(t, v);
};

// Auto Init on script load
window.SeedsService.init();
// Register Seeds with Central Plug & Play Registry
window.AgriServicesRegistry?.register({
  id: "seeds",
  label: "🌱 విత్తనాలు",
  renderConsumer: (containerId) => window.SeedsService.renderConsumerView(containerId),
  renderProvider: (containerId) => window.SeedsService.renderProviderInput(containerId)
});
