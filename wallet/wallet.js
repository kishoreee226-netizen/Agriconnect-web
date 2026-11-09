// wallet/wallet.js - AgriConnect Smart Wallet & Escrow Engine
window.WalletModule = {
  getWalletData: function() {
    const defaultWallet = {
      farmerBalance: 2000, // టెస్టింగ్ కోసం ప్రారంభ నిల్వ
      labourBalance: 0,
      providerBalance: 0,
      lockedEscrow: [],
      history: []
    };

    try {
      const saved = localStorage.getItem("agri_wallet");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed.lockedEscrow)) parsed.lockedEscrow = [];
        if (!Array.isArray(parsed.history)) parsed.history = [];
        if (typeof parsed.providerBalance === "undefined") parsed.providerBalance = 0;
        return parsed;
      }
    } catch (e) {
      console.warn("Wallet read error:", e);
    }

    localStorage.setItem("agri_wallet", JSON.stringify(defaultWallet));
    return defaultWallet;
  },

  saveWalletData: function(data) {
    try {
      localStorage.setItem("agri_wallet", JSON.stringify(data));
      if (window.AgriState) {
        window.AgriState.wallet = data;
      }
    } catch (e) {
      console.warn("Wallet save error:", e);
    }
  },

  render: function() {
    const mount = document.getElementById("wallet-container");
    if (!mount) return;

    const tpl = document.getElementById("wallet-card-template");
    if (!tpl) return;

    const walletData = this.getWalletData();
    const currentRole = window.AppState?.currentRole || "FARMER";

    const lockedTotal = (walletData.lockedEscrow || [])
      .filter(item => item.status === "Locked")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    mount.replaceChildren();
    const card = tpl.content.cloneNode(true);

    // బ్యాలెన్స్ అప్‌డేట్
    card.querySelector(".balance-val-farmer").textContent = `₹${walletData.farmerBalance || 0}`;
    card.querySelector(".balance-val-locked").textContent = `₹${lockedTotal}`;
    card.querySelector(".balance-val-labour").textContent = `₹${walletData.labourBalance || 0}`;
    card.querySelector(".balance-val-provider").textContent = `₹${walletData.providerBalance || 0}`;

    // యాక్టివ్ రోల్ ఆధారంగా కార్డుల ప్రదర్శన
    const farmerCard = card.querySelector("#wallet-card-farmer-box");
    const labourCard = card.querySelector("#wallet-card-labour-box");
    const providerCard = card.querySelector("#wallet-card-provider-box");
    const actionsCard = card.querySelector("#wallet-card-actions-box");

    if (currentRole === "LABOUR") {
      if (farmerCard) farmerCard.style.display = "none";
      if (providerCard) providerCard.style.display = "none";
      if (actionsCard) actionsCard.style.display = "none";
      if (labourCard) labourCard.style.display = "flex";
    } else if (currentRole === "PROVIDER") {
      if (farmerCard) farmerCard.style.display = "none";
      if (labourCard) labourCard.style.display = "none";
      if (actionsCard) actionsCard.style.display = "none";
      if (providerCard) providerCard.style.display = "flex";
    } else {
      // రైతు మోడ్ లో ఉన్నప్పుడు 2x2 గ్రిడ్ లో 4 కార్డులూ కనిపిస్తాయి
      if (farmerCard) farmerCard.style.display = "flex";
      if (labourCard) labourCard.style.display = "flex";
      if (providerCard) providerCard.style.display = "flex";
      if (actionsCard) actionsCard.style.display = "flex";
    }

    // ఎస్క్రో లిస్ట్ రెండరింగ్
    const listContainer = card.querySelector("#escrow-items-list");
    const itemTpl = document.getElementById("escrow-item-template");

    if (walletData.lockedEscrow.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "escrow-empty-msg";
      emptyDiv.textContent = "ప్రస్తుతం ఏ లావాదేవీ hold అయి లేదు.";
      listContainer.appendChild(emptyDiv);
    } else {
      walletData.lockedEscrow.forEach(esc => {
        const itemNode = itemTpl.content.cloneNode(true);
        const itemCard = itemNode.querySelector(".escrow-item-card");
        const isLocked = esc.status === "Locked";

        itemCard.classList.add(isLocked ? "is-locked" : "is-released");
        itemCard.querySelector(".escrow-item-title").innerHTML = `<b>${esc.jobTitle}</b> (${esc.labourName || 'సర్వీస్'})`;

        const amtEl = itemCard.querySelector(".escrow-amount");
        amtEl.textContent = `₹${esc.amount}`;
        amtEl.classList.add(isLocked ? "is-locked" : "is-released");

        const statusLabel = itemCard.querySelector(".escrow-status-label");
        statusLabel.textContent = isLocked ? "🔒 Hold అయింది (రైతు ఖాతాలో భద్రం)" : "✅ Release అయింది (ఖాతాకు చేరింది)";

        const actionCenter = itemCard.querySelector(".escrow-action-center");
        // కేవలం రైతు మోడ్‌లో ఉన్నప్పుడు మాత్రమే రిలీజ్ బటన్ నొక్కే అధికారం ఉంటుంది
        if (isLocked && currentRole === "FARMER") {
          const btn = actionCenter.querySelector(".btn-release-payment");
          btn.onclick = () => window.WalletModule.handleReleasePayment(esc.id);
        } else {
          actionCenter.remove();
        }

        listContainer.appendChild(itemNode);
      });
    }

    mount.appendChild(card);
  },

  // రైతు వాలెట్‌లోకి డబ్బు జమ చేయడం (Add Money)
  handleAddMoneyFarmer: function() {
    const amountStr = prompt("రైతు వాలెట్‌లో ఎంత మొత్తం జమ చేయాలనుకుంటున్నారు (₹)?", "1000");
    if (!amountStr) return;
    const amt = Number(amountStr);
    if (isNaN(amt) || amt <= 0) {
      alert("సరైన మొత్తాన్ని నమోదు చేయండి!");
      return;
    }

    const wallet = this.getWalletData();
    wallet.farmerBalance = Number(wallet.farmerBalance || 0) + amt;

    // హిస్టరీ రికార్డ్ యాడ్ చేయడం
    if (!Array.isArray(wallet.history)) wallet.history = [];
    wallet.history.unshift({
      id: "DEP-" + Date.now(),
      type: 'DEPOSIT',
      role: 'రైతు',
      amount: amt,
      info: 'Self Deposit (UPI/Bank)',
      date: new Date().toLocaleDateString('te-IN')
    });

    this.saveWalletData(wallet);
    this.render();
    alert(`🎉 ₹${amt} విజయవంతంగా రైతు వాలెట్‌లో జమ చేయబడింది!`);
  },

  // ట్రాన్సాక్షన్ హిస్టరీ ప్రివ్యూ (History Button)
  showTransactionHistory: function() {
    const wallet = this.getWalletData();
    const history = wallet.history || [];

    if (history.length === 0) {
      alert("📜 ఇప్పటివరకు ఎలాంటి లావాదేవీలు లేవు.");
      return;
    }

    let msg = "📜 ఇటీవలి వాలెట్ లావాదేవీలు:\n-----------------------------\n";
    history.slice(0, 5).forEach((h, i) => {
      if (h.type === 'DEPOSIT') {
        msg += `${i + 1}. [${h.date}] 🟢 జమ: ₹${h.amount} (${h.role})\n`;
      } else {
        msg += `${i + 1}. [${h.date}] 🔴 విత్‌డ్రా: ₹${h.amount} -> ${h.upi || 'UPI'} (${h.role})\n`;
      }
    });
    alert(msg);
  },

  // కూలీ పనిని ఎస్క్రోలో లాక్ చేయడం
  lockJobToEscrow: function(job, labourName) {
    if (!job) return;
    const wallet = this.getWalletData();
    const amount = Number(job.wage || 0);

    const exists = wallet.lockedEscrow.find(e => e.jobId === job.id);
    if (exists) return;

    if (wallet.farmerBalance < amount) {
      alert(`⚠️ రైతు వాలెట్‌లో సరిపడా నిల్వ లేదు! కూలీ వేతనం: ₹${amount}, ఉన్నది: ₹${wallet.farmerBalance}`);
      return false;
    }

    // రైతు నిల్వ నుండి కట్ చేసి ఎస్క్రో లాక్ చేయడం
    wallet.farmerBalance -= amount;

    wallet.lockedEscrow.unshift({
      id: "ESC-" + Date.now(),
      jobId: job.id,
      jobTitle: `${job.crop || 'పంట'} (${job.workType || 'పని'})`,
      labourName: labourName || "కూలీ",
      recipientType: 'LABOUR',
      amount: amount,
      status: "Locked",
      createdAt: Date.now()
    });

    this.saveWalletData(wallet);
    this.render();
    return true;
  },

  // పరికరాలు / వాహనాల బుకింగ్ కోసం ఎస్క్రో లాక్
  lockBookingEscrow: function(bookingId, amount, itemName) {
    const wallet = this.getWalletData();
    const currentBalance = Number(wallet.farmerBalance || 0);
    const amt = Number(amount || 0);

    if (currentBalance < amt) {
      alert(`⚠️ రైతు వాలెట్‌లో సరిపడా బ్యాలెన్స్ లేదు! కావలసినది: ₹${amt}, ఉన్నది: ₹${currentBalance}`);
      return false;
    }

    wallet.farmerBalance = currentBalance - amt;

    wallet.lockedEscrow.unshift({
      id: "ESC-BK-" + Date.now(),
      jobId: bookingId,
      jobTitle: itemName || "సేవ బుకింగ్",
      labourName: "సర్వీస్ ప్రొవైడర్",
      recipientType: 'PROVIDER',
      amount: amt,
      status: "Locked",
      createdAt: Date.now()
    });

    this.saveWalletData(wallet);
    this.render();

    try {
      let bookings = JSON.parse(localStorage.getItem("farmer_bookings") || "[]");
      bookings = bookings.map(b => {
        if (b.id === bookingId) {
          b.status = `🔒 ₹${amt} Escrow లో భద్రపరచబడింది`;
        }
        return b;
      });
      localStorage.setItem("farmer_bookings", JSON.stringify(bookings));
    } catch (err) {}

    if (typeof window.renderBookingRecords === "function") {
      window.renderBookingRecords();
    }

    alert(`🔒 ₹${amt} అడ్వాన్స్ మొత్తం Smart Wallet (Escrow) లో లాక్ చేయబడింది!`);
    return true;
  },

  // ఎస్క్రో నిధులను కూలీకి లేదా ప్రొవైడర్‌కు విడుదల చేయడం (No Double-Deduction)
  handleReleasePayment: function(escrowId) {
    if (!confirm("పని/సేవ పూర్తిగా పూర్తయిందా? డబ్బును ఎదుటివారి వాలెట్‌కు విడుదల చేయమంటారా?")) {
      return;
    }

    const wallet = this.getWalletData();
    const item = wallet.lockedEscrow.find(e => e.id === escrowId);

    if (item && item.status === "Locked") {
      const amt = Number(item.amount || 0);
      item.status = "Released";
      item.releasedAt = Date.now();

      if (item.recipientType === 'PROVIDER') {
        wallet.providerBalance = Number(wallet.providerBalance || 0) + amt;
      } else {
        wallet.labourBalance = Number(wallet.labourBalance || 0) + amt;
      }

      this.saveWalletData(wallet);
      this.render();

      alert(`🎉 ₹${amt} నిధులు విజయవంతంగా బదిలీ చేయబడ్డాయి!`);
    }
  },

  // UPI విత్‌డ్రాయల్ (రైతు, కూలీ, ప్రొవైడర్ ముగ్గురికీ సపోర్ట్)
  handleWithdrawUPI: function(roleType = 'labour') {
    const wallet = this.getWalletData();
    let balanceKey = 'labourBalance';
    let roleLabel = 'కూలీ';

    if (roleType === 'farmer') {
      balanceKey = 'farmerBalance';
      roleLabel = 'రైతు';
    } else if (roleType === 'provider') {
      balanceKey = 'providerBalance';
      roleLabel = 'ప్రొవైడర్';
    }

    const currentBalance = Number(wallet[balanceKey] || 0);

    if (currentBalance <= 0) {
      alert(`మీ ${roleLabel} ఖాతాలో విత్‌డ్రా చేయడానికి తగిన బ్యాలెన్స్ లేదు!`);
      return;
    }

    const amountStr = prompt(`మీ ${roleLabel} ఖాతాలో ₹${currentBalance} ఉంది.\nఎంత మొత్తం విత్‌డ్రా చేయాలనుకుంటున్నారు?`, currentBalance);
    if (!amountStr) return;

    const withdrawAmount = Number(amountStr);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0 || withdrawAmount > currentBalance) {
      alert("దయచేసి సరైన మొత్తం నమోదు చేయండి!");
      return;
    }

    const upiId = prompt("మీ UPI ID నమోదు చేయండి (ఉదా: 9876543210@upi):", "");
    if (!upiId || !upiId.trim()) {
      alert("సరైన UPI ID నమోదు చేయండి!");
      return;
    }

    wallet[balanceKey] = currentBalance - withdrawAmount;

    // హిస్టరీ రికార్డ్ యాడ్ చేయడం
    if (!Array.isArray(wallet.history)) wallet.history = [];
    wallet.history.unshift({
      id: "WTH-" + Date.now(),
      type: 'WITHDRAW',
      role: roleLabel,
      amount: withdrawAmount,
      upi: upiId.trim(),
      date: new Date().toLocaleDateString('te-IN')
    });

    this.saveWalletData(wallet);
    this.render();

    alert(`✅ ₹${withdrawAmount} మీ UPI (${upiId.trim()}) కి విజయవంతంగా పంపబడింది!\nమిగిలిన బ్యాలెన్స్: ₹${wallet[balanceKey]}`);
  }
};

// Global Bridges
window.renderWalletWidget = () => window.WalletModule.render();
window.lockJobToEscrow = (job, name) => window.WalletModule.lockJobToEscrow(job, name);
window.lockBookingEscrow = (id, amt, name) => window.WalletModule.lockBookingEscrow(id, amt, name);
window.handleReleasePayment = (id) => window.WalletModule.handleReleasePayment(id);
window.handleWithdrawUPI = (role) => window.WalletModule.handleWithdrawUPI(role);
window.showTransactionHistory = () => window.WalletModule.showTransactionHistory();
