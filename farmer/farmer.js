// farmer/farmer.js - Dedicated Farmer Dashboard Engine
window.FarmerModule = {
  farmCoords: null,
  activeBookingItem: null,

  switchTab: function(tab) {
    const panes = ['labour', 'equipment', 'seeds', 'transport'];

    panes.forEach(t => {
      const pane = document.getElementById(`farmer-pane-${t}`);
      const btn = document.getElementById(`tab-btn-${t}`);
      if (pane) {
        if (t === tab) {
          pane.classList.remove('is-hidden');
        } else {
          pane.classList.add('is-hidden');
        }
      }
      if (btn) btn.classList.toggle('active', t === tab);
    });

    if (tab === 'equipment' && typeof window.renderEquipmentWidget === 'function') {
      window.renderEquipmentWidget('farmer-pane-equipment');
    } else if (tab === 'seeds' && typeof window.renderSeedsWidget === 'function') {
      window.renderSeedsWidget('farmer-pane-seeds');
    } else if (tab === 'transport' && typeof window.renderTransportWidget === 'function') {
      window.renderTransportWidget('farmer-pane-transport');
    }
  },

  render: function() {
    const container = document.getElementById("farmer-post-container");
    if (!container) return;

    const tpl = document.getElementById("farmer-dashboard-template");
    if (!tpl) return;

    container.replaceChildren();
    container.appendChild(tpl.content.cloneNode(true));

    this.renderForm();
    this.renderAcceptedAndSlotList();
    this.renderBookingRecords();
  },

  renderForm: function() {
    const wrapper = document.getElementById("farmer-labour-form-wrapper");
    const tpl = document.getElementById("farmer-labour-form-template");
    if (!wrapper || !tpl) return;

    wrapper.replaceChildren();
    const clone = tpl.content.cloneNode(true);

    const userVillage = window.AppState?.userProfile?.village || "స్థానిక పరిధి";
    const userProfile = window.AppState?.userProfile || {};

    const nameInput = clone.querySelector("#f-name");
    const phoneInput = clone.querySelector("#f-phone");
    const villageBtn = clone.querySelector("#f-village-btn");

    if (nameInput) nameInput.value = userProfile.name || "";
    if (phoneInput) phoneInput.value = userProfile.phone || "";
    if (villageBtn) villageBtn.textContent = `🏛️ ${userVillage}`;

    const locBtn = clone.querySelector("#loc-btn");
    locBtn.onclick = () => {
      const s = document.getElementById("loc-status");
      if (navigator.geolocation) {
        if (s) s.textContent = "GPS వెతుకుతోంది...";
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            window.FarmerModule.farmCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            if (s) s.textContent = `✅ GPS set అయింది (${window.FarmerModule.farmCoords.lat.toFixed(3)},${window.FarmerModule.farmCoords.lng.toFixed(3)})`;
          },
          () => { 
            if (s) s.textContent = "స్థానిక గ్రామం వర్తిస్తుంది."; 
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }
    };

    const form = clone.querySelector("#farmer-form");
    form.onsubmit = (e) => this.handleLabourPostSubmit(e);

    wrapper.appendChild(clone);
  },

  handleLabourPostSubmit: async function(e) {
    e.preventDefault();

    const villageText = document.getElementById("f-village-btn")?.textContent?.replace(/[🏛️🏘️\s]/g, '') || 
                        window.AppState?.userProfile?.village || "స్థానిక పరిధి";

    const fName = document.getElementById("f-name").value.trim();
    const fPhone = document.getElementById("f-phone").value.trim();
    const crop = document.getElementById("f-crop").value.trim();
    const work = document.getElementById("f-work").value.trim();
    const count = parseInt(document.getElementById("f-count").value) || 1;
    const wage = parseFloat(document.getElementById("f-wage").value) || 450;
    const dateVal = document.getElementById("f-date").value;

    const newJob = {
      id: "JOB-" + Date.now(),
      farmerName: fName,
      farmerPhone: fPhone,
      crop: crop,
      workType: work,
      count: count,
      totalRequired: count,
      confirmedLabours: [],
      wage: wage,
      date: dateVal,
      workDate: dateVal,
      village: villageText,
      lat: this.farmCoords ? this.farmCoords.lat : null,
      lng: this.farmCoords ? this.farmCoords.lng : null,
      status: "Open",
      labourName: "",
      labourPhone: "",
      transportNote: "రైతు రవాణా ఏర్పాటు చేస్తారు",
      createdAt: Date.now()
    };

    if (window.db) {
      try {
        await window.db.collection("farmer_posted_jobs").add(newJob);
      } catch (err) {
        console.warn("Cloud save error, fallback to local:", err);
      }
    }

    let farmerPostedList = JSON.parse(localStorage.getItem("agri_farmer_posted_jobs") || "[]");
    farmerPostedList.unshift(newJob);
    localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(farmerPostedList));

    let savedJobs = JSON.parse(localStorage.getItem("agri_jobs") || "[]");
    savedJobs.unshift(newJob);
    localStorage.setItem("agri_jobs", JSON.stringify(savedJobs));

    document.getElementById("f-crop").value = "";
    document.getElementById("f-work").value = "";
    document.getElementById("f-count").value = "";
    document.getElementById("f-wage").value = "";
    const dateInput = document.getElementById("f-date");
    if (dateInput) {
      dateInput.value = "";
      dateInput.type = "text";
    }

    this.renderAcceptedAndSlotList();

    if (typeof renderLabourWidget === "function") {
      renderLabourWidget();
    }

    alert("📢 పని కూలీల Dashboard లో live గా post చేయబడింది!");
  },

  renderAcceptedAndSlotList: function() {
    const wrapper = document.getElementById("farmer-accepted-section-wrapper");
    if (!wrapper) return;

    wrapper.replaceChildren();

    const container = document.createElement("div");
    container.className = "accepted-section";

    let postedJobs = JSON.parse(localStorage.getItem("agri_farmer_posted_jobs") || "[]");

    // 1. Live Slot Tracker Box
    if (postedJobs.length > 0) {
      const slotBox = document.createElement("div");
      slotBox.className = "slot-tracker-box";

      const title = document.createElement("h4");
      title.className = "slot-tracker-title";
      title.textContent = "📋 మీరు పోస్ట్ చేసిన పనులు (Live Slot Tracking):";
      slotBox.appendChild(title);

      const scrollDiv = document.createElement("div");
      scrollDiv.className = "slot-tracker-scroll custom-scroll";

      const slotTpl = document.getElementById("farmer-slot-card-template");

      postedJobs.forEach(j => {
        if (!slotTpl) return;
        const clone = slotTpl.content.cloneNode(true);
        const card = clone.querySelector(".slot-job-card");
        const confirmed = j.confirmedLabours || [];
        const reqCount = parseInt(j.totalRequired || j.count || 1);
        const isFull = confirmed.length >= reqCount;

        if (isFull) card.classList.add("is-full");

        clone.querySelector(".slot-job-title").textContent = `🌾 ${j.crop} - ${j.workType}`;
        const badge = clone.querySelector(".slot-status-badge");
        if (isFull) {
          badge.classList.add("is-full");
          badge.textContent = "✅ కోటా పూర్తయింది";
        } else {
          badge.textContent = "⏳ కూలీల కోసం చూస్తున్నారు";
        }

        clone.querySelector(".slot-job-details").textContent = 
          `📅 తేదీ: ${j.workDate || j.date || 'ఈ రోజు'} | కోటా: ${confirmed.length} / ${reqCount} మంది ఖరారయ్యారు | రేటు: ₹${j.wage}`;

        if (confirmed.length > 0) {
          const lWrap = clone.querySelector(".slot-labours-wrapper");
          lWrap.classList.remove("is-hidden");
          const lList = clone.querySelector(".slot-labours-list");

          confirmed.forEach(c => {
            const row = document.createElement("div");
            row.className = "slot-labour-row";

            const info = document.createElement("span");
            info.className = "slot-labour-info";
            info.innerHTML = `👷 <b>${c.name}</b> (${c.phone})`;

            const btnGrp = document.createElement("div");
            btnGrp.className = "slot-btn-group";

            const callA = document.createElement("a");
            callA.className = "slot-btn-call";
            callA.href = `tel:${c.phone}`;
            callA.textContent = "📞 కాల్";

            const waA = document.createElement("a");
            waA.className = "slot-btn-whatsapp";
            waA.target = "_blank";
            waA.href = `https://wa.me/91${c.phone}`;
            waA.textContent = "💬 వాట్సాప్";

            btnGrp.appendChild(callA);
            btnGrp.appendChild(waA);
            row.appendChild(info);
            row.appendChild(btnGrp);
            lList.appendChild(row);
          });
        }

        scrollDiv.appendChild(clone);
      });

      slotBox.appendChild(scrollDiv);
      container.appendChild(slotBox);
    }

    // 2. Standard Accepted Labours List
    const accHeader = document.createElement("div");
    accHeader.className = "accepted-header";
    const accTitle = document.createElement("h4");
    accTitle.textContent = "👥 Confirm అయిన కూలీలు:";
    accHeader.appendChild(accTitle);
    container.appendChild(accHeader);

    const accScroll = document.createElement("div");
    accScroll.className = "custom-scroll accepted-scroll-list";

    let allConfirmed = [];
    postedJobs.forEach(pj => {
      if (pj.confirmedLabours && Array.isArray(pj.confirmedLabours)) {
        pj.confirmedLabours.forEach(c => {
          allConfirmed.push({
            labourName: c.name || "కూలీ",
            labourPhone: c.phone || "",
            crop: pj.crop,
            workType: pj.workType,
            wage: pj.wage
          });
        });
      }
    });

    if (allConfirmed.length === 0) {
      const emptyMsg = document.createElement("div");
      emptyMsg.className = "empty-labour-msg";
      emptyMsg.textContent = "కూలీలు accept చేయగానే వారి వివరాలు ఇక్కడ కనిపిస్తాయి.";
      accScroll.appendChild(emptyMsg);
    } else {
      const labourTpl = document.getElementById("farmer-labour-item-template");
      allConfirmed.forEach(item => {
        if (!labourTpl) return;
        const clone = labourTpl.content.cloneNode(true);
        clone.querySelector(".labour-name-text").textContent = `👷 ${item.labourName}`;
        clone.querySelector(".labour-wage").textContent = `₹${item.wage}`;
        clone.querySelector(".labour-work-info").textContent = `పని: ${item.crop} (${item.workType})`;

        clone.querySelector(".link-call").href = `tel:${item.labourPhone}`;
        clone.querySelector(".link-sms").href = `sms:${item.labourPhone}?body=నమస్తే`;
        clone.querySelector(".link-whatsapp").href = `https://wa.me/91${item.labourPhone}`;

        accScroll.appendChild(clone);
      });
    }

    container.appendChild(accScroll);
    wrapper.appendChild(container);
  },

  openBookingModal: function(itemName, ownerName, rate, phone) {
    this.activeBookingItem = { itemName, ownerName, rate, phone };
    const modal = document.getElementById("booking-modal");
    if (!modal) return;

    document.getElementById("bm-item-name").textContent = itemName;
    document.getElementById("bm-item-rate").textContent = rate;
    document.getElementById("booking-request-form")?.reset();

    modal.classList.remove("is-hidden");
  },

  closeBookingModal: function() {
    const modal = document.getElementById("booking-modal");
    if (modal) modal.classList.add("is-hidden");
  },

  handleBookingSubmit: function(e) {
    e.preventDefault();
    if (!this.activeBookingItem) return;

    const dateVal = document.getElementById('book-date').value;
    const durVal = document.getElementById('book-duration').value;

    const newBooking = {
      id: "BK-" + Date.now(),
      itemName: this.activeBookingItem.itemName,
      ownerName: this.activeBookingItem.ownerName,
      rate: this.activeBookingItem.rate,
      phone: this.activeBookingItem.phone,
      date: dateVal,
      duration: durVal,
      status: "అభ్యర్థన పంపబడింది (Pending)",
      escrowLocked: false
    };

    let savedBookings = JSON.parse(localStorage.getItem("farmer_bookings") || "[]");
    savedBookings.unshift(newBooking);
    localStorage.setItem("farmer_bookings", JSON.stringify(savedBookings));

    this.closeBookingModal();
    alert(`✅ ${this.activeBookingItem.itemName} బుకింగ్ అభ్యర్థన విజయవంతంగా నమోదైంది!`);
    this.renderBookingRecords();
  },

  renderBookingRecords: function() {
    const container = document.getElementById("farmer-booking-records");
    if (!container) return;

    let bookings = JSON.parse(localStorage.getItem("farmer_bookings") || "[]");
    container.replaceChildren();
    if (bookings.length === 0) return;

    const section = document.createElement("div");
    section.className = "booking-records-section";

    const header = document.createElement("div");
    header.className = "booking-records-header";

    const title = document.createElement("h4");
    title.className = "booking-records-title";
    title.textContent = `📋 Naa Bookinglu (${bookings.length}):`;

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "btn-clear-bookings";
    clearBtn.textContent = "🗑️ Clear Cheyandi";
    clearBtn.onclick = () => this.clearBookings();

    header.appendChild(title);
    header.appendChild(clearBtn);
    section.appendChild(header);

    const scrollDiv = document.createElement("div");
    scrollDiv.className = "booking-records-scroll custom-scroll";

    const cardTpl = document.getElementById("farmer-booking-card-template");

    bookings.forEach(b => {
      if (!cardTpl) return;
      const clone = cardTpl.content.cloneNode(true);
      const isLocked = b.escrowLocked || (b.status && b.status.includes("Escrow"));

      clone.querySelector(".rec-item-title").textContent = `🚜 ${b.itemName}`;
      const statusTag = clone.querySelector(".rec-status-tag");
      statusTag.textContent = b.status;
      if (isLocked) statusTag.classList.add("is-locked");

      clone.querySelector(".rec-details-row").innerHTML = 
        `👤 Yajamaani: <b>${b.ownerName}</b> (${b.phone})<br>` +
        `📅 Theedhi: <b>${b.date}</b> | ⏱️ Parimaanam: <b>${b.duration}</b><br>` +
        `💰 Dhara: <b>${b.rate}</b>`;

      const bookingMsg = `Namaste ${b.ownerName} gaaru, nenu mee ${b.itemName} nu ${b.date} theedhina (${b.duration}) kosam book chesukunanu. Dayachesi vivaralu confirm cheyagalaru.`;
      clone.querySelector(".rec-btn-wa").href = `https://wa.me/91${b.phone}?text=${encodeURIComponent(bookingMsg)}`;
      clone.querySelector(".rec-btn-call").href = `tel:${b.phone}`;

      const escrowBadge = clone.querySelector(".rec-escrow-badge");
      const escrowBtn = clone.querySelector(".rec-btn-escrow");

      if (isLocked) {
        escrowBadge.classList.remove("is-hidden");
        escrowBtn.classList.add("is-hidden");
      } else {
        escrowBtn.onclick = () => this.lockEscrow(b.id, 500, b.itemName);
      }

      scrollDiv.appendChild(clone);
    });

    section.appendChild(scrollDiv);
    container.appendChild(section);
  },

  clearBookings: function() {
    if (confirm("బుకింగ్ రికార్డులన్నింటినీ తీసివేయాలా?")) {
      localStorage.removeItem("farmer_bookings");
      this.renderBookingRecords();
    }
  },

  lockEscrow: function(bookingId, amount, itemName) {
    let bookings = JSON.parse(localStorage.getItem("farmer_bookings") || "[]");
    const b = bookings.find(x => x.id === bookingId);
    if (b) {
      b.escrowLocked = true;
      b.status = `₹${amount} Escrow Lock Aindi (Secure)`;
      localStorage.setItem("farmer_bookings", JSON.stringify(bookings));
      this.renderBookingRecords();

      if (window.renderWalletWidget) {
        window.renderWalletWidget();
      }
      alert(`🔒 ₹${amount} ఎస్క్రో లాక్ చేయబడింది (${itemName})! పని పూర్తయిన తర్వాత విడుదల అవుతుంది.`);
    }
  },

  // --- Quick Job Post Modal Controllers ---
  openJobModal: function() {
    let modal = document.getElementById("farmerJobModal");
    if (!modal) {
      const tpl = document.getElementById("farmer-job-modal-template");
      if (tpl) {
        document.body.appendChild(tpl.content.cloneNode(true));
        modal = document.getElementById("farmerJobModal");
      }
    }
    if (!modal) return;

    // Auto Prefill
    const prof = window.AppState?.userProfile || {};
    const today = new Date().toISOString().split('T')[0];

    const nameInput = document.getElementById("fjm_name");
    const phoneInput = document.getElementById("fjm_phone");
    const villageInput = document.getElementById("fjm_village");
    const dateInput = document.getElementById("fjm_date");

    if (nameInput) nameInput.value = prof.name || "";
    if (phoneInput) phoneInput.value = prof.phone || "";
    if (villageInput) villageInput.value = prof.village || "";
    if (dateInput) {
      dateInput.value = today;
      dateInput.min = today;
    }

    modal.classList.remove("is-hidden");
    modal.style.display = "flex";
  },

  closeJobModal: function() {
    const modal = document.getElementById("farmerJobModal");
    if (modal) {
      modal.classList.add("is-hidden");
      modal.style.display = "none";
    }
  },

  handleJobModalSubmit: async function(e) {
    e.preventDefault();

    const farmerName = document.getElementById("fjm_name").value.trim();
    const farmerPhone = document.getElementById("fjm_phone").value.trim();
    const crop = document.getElementById("fjm_crop").value;
    const workType = document.getElementById("fjm_work").value;
    const totalRequired = parseInt(document.getElementById("fjm_required").value) || 1;
    const wage = parseFloat(document.getElementById("fjm_wage").value) || 450;
    const workDate = document.getElementById("fjm_date").value;
    const village = document.getElementById("fjm_village").value.trim();
    const trans = document.getElementById("fjm_trans").value;

    const newJob = {
      id: "JOB-" + Date.now(),
      farmerName,
      farmerPhone,
      crop,
      workType,
      count: totalRequired,
      totalRequired,
      confirmedLabours: [],
      wage,
      workDate,
      date: workDate,
      village,
      transportNote: trans === "own" ? "కూలీల సొంత బండి ఉండాలి" : "రైతు రవాణా ఏర్పాటు చేస్తారు",
      status: "Open",
      createdAt: Date.now()
    };

    if (window.db) {
      try {
        await window.db.collection("farmer_posted_jobs").add(newJob);
      } catch(err) {
        console.warn("Cloud save error, fallback to local:", err);
      }
    }

    let list = JSON.parse(localStorage.getItem("agri_farmer_posted_jobs") || "[]");
    list.unshift(newJob);
    localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(list));

    let savedJobs = JSON.parse(localStorage.getItem("agri_jobs") || "[]");
    savedJobs.unshift(newJob);
    localStorage.setItem("agri_jobs", JSON.stringify(savedJobs));

    this.closeJobModal();
    this.renderAcceptedAndSlotList();

    if (typeof renderLabourWidget === "function") renderLabourWidget();

    alert("🎉 పని పోస్ట్ చేయబడింది! సమీప కూలీలకు అలర్ట్ వెళ్ళింది.");
  }
};

// -------------------------------------------------------------
// Global Bridges & Backward Compatibility
// -------------------------------------------------------------
window.switchFarmerTab = function(t) { window.FarmerModule.switchTab(t); };
window.renderFarmerWidget = function() { window.FarmerModule.render(); };
window.renderFarmerLabourPane = window.renderFarmerWidget;
window.openBookingModal = function(i, o, r, p) { window.FarmerModule.openBookingModal(i, o, r, p); };
window.closeBookingModal = function() { window.FarmerModule.closeBookingModal(); };
window.renderBookingRecords = function() { window.FarmerModule.renderBookingRecords(); };
window.clearFarmerBookings = function() { window.FarmerModule.clearBookings(); };
window.lockBookingEscrow = function(id, a, n) { window.FarmerModule.lockEscrow(id, a, n); };

// Quick Job Modal Global Bridges
window.openFarmerJobModal = function() { window.FarmerModule.openJobModal(); };
window.closeFarmerJobModal = function() { window.FarmerModule.closeJobModal(); };
window.handleFarmerJobSubmit = function(e) { window.FarmerModule.handleJobModalSubmit(e); };

// Real-time Cloud Sync Listener
if (window.db) {
  try {
    window.db.collection("farmer_posted_jobs").orderBy("createdAt", "desc").limit(20)
      .onSnapshot((snapshot) => {
        let cloudJobs = [];
        snapshot.forEach((doc) => {
          cloudJobs.push({ id: doc.id, ...doc.data() });
        });

        if (cloudJobs.length > 0) {
          localStorage.setItem("agri_farmer_posted_jobs", JSON.stringify(cloudJobs));
          const paneLabour = document.getElementById("farmer-pane-labour");
          if (paneLabour && !paneLabour.classList.contains("is-hidden")) {
            window.FarmerModule.renderAcceptedAndSlotList();
          }
        }
      }, (err) => {
        console.warn("Real-time cloud sync notice:", err);
      });
  } catch (err) {
    console.warn("Firestore sync setup error:", err);
  }
}
