// wallet.js - 2-in-1 Escrow Smart Wallet (Digital Lock & Release)

// Helper: Wallet data ni localStorage / AgriState nundi thecchukovadam
function getAgriWalletData() {
  const defaultWallet = {
    farmerBalance: 0,
    labourBalance: 0,
    lockedEscrow: []
  };

  try {
    const saved = localStorage.getItem("agri_wallet");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed.lockedEscrow)) parsed.lockedEscrow = [];
      return parsed;
    }
  } catch (e) {
    console.warn("Wallet read error:", e);
  }

  localStorage.setItem("agri_wallet", JSON.stringify(defaultWallet));
  return defaultWallet;
}

// Helper: Wallet data ni save cheyadam mariyu AgriState tho sync cheyadam
function saveAgriWalletData(data) {
  try {
    localStorage.setItem("agri_wallet", JSON.stringify(data));
    if (window.AgriState) {
      window.AgriState.wallet = data;
    }
  } catch (e) {
    console.warn("Wallet save error:", e);
  }
}

function renderWalletWidget() {
  const container = document.getElementById("wallet-container");
  if (!container) return;

  const walletData = getAgriWalletData();

  const lockedTotal = (walletData.lockedEscrow || [])
    .filter(item => item.status === "Locked")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  container.innerHTML = `
    <div class="wallet-card">
      
      <!-- Wallet Header -->
      <div class="wallet-card-header">
        <h3>💰 అగ్రీ Smart Wallet (2-in-1 Escrow Lock)</h3>
        <span class="badge-wallet-secured">100% Secured</span>
      </div>

      <div class="wallet-body">
        
        <!-- Summary Cards: Farmer Balance vs Labour Balance -->
        <div class="wallet-summary-row">
          <!-- Farmer Side -->
          <div class="balance-card balance-card-farmer">
            <div class="balance-title-farmer">👨‍🌾 రైతు ఖాతా balance</div>
            <div class="balance-amount-farmer">₹${walletData.farmerBalance}</div>
            <div class="balance-locked-text">🔒 Lock అయినది: ₹${lockedTotal}</div>
          </div>

          <!-- Labour Side -->
          <div class="balance-card balance-card-labour">
            <div class="balance-title-labour">👷 కూలీ main wallet</div>
            <div class="balance-amount-labour">₹${walletData.labourBalance}</div>
            <button onclick="handleWithdrawUPI()" class="btn-withdraw-upi">
              💸 UPI Withdraw
            </button>
          </div>
        </div>

        <!-- Escrow Active Transactions List -->
        <div class="escrow-section">
          <div class="escrow-title">
            🔐 Escrow లావాదేవీలు (కూలీకి గ్యారెంటీ లాక్):
          </div>

          <div class="escrow-list-container">
            ${walletData.lockedEscrow.length === 0 ? `
              <div class="escrow-empty-msg">
                ప్రస్తుతం ఏ లావాదేవీ lock అయి లేదు.
              </div>
            ` : walletData.lockedEscrow.map(esc => {
              const isLocked = esc.status === "Locked";
              return `
                <div class="escrow-item-card ${isLocked ? 'is-locked' : ''}">
                  <div class="escrow-item-top">
                    <span><b>${esc.jobTitle}</b> (${esc.labourName})</span>
                    <strong class="escrow-amount ${isLocked ? 'is-locked' : 'is-released'}">₹${esc.amount}</strong>
                  </div>
                  <div class="escrow-status-text">
                    పరిస్థితి: <b>${isLocked ? '🔒 lock అయింది (రైతు ఖాతాలో hold)' : '✅ Release అయింది (కూలీ ఖాతాకు చేరింది)'}</b>
                  </div>
                  
                  ${isLocked ? `
                    <div class="escrow-action-center">
                      <button onclick="handleReleasePayment('${esc.id}')" class="btn-release-payment">
                        🔓 పని అయింది - Release చేయండి (రైతు)
                      </button>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    </div>
  `;
}

// Function: కొత్త కూలీ పనిని Escrow లో లాక్ చేయడం
window.lockJobToEscrow = function(job, labourName) {
  if (!job) return;
  const wallet = getAgriWalletData();
  const amount = Number(job.wage || 0);

  const exists = wallet.lockedEscrow.find(e => e.jobId === job.id);
  if (exists) return;

  wallet.lockedEscrow.unshift({
    id: "ESC-" + Date.now(),
    jobId: job.id,
    jobTitle: `${job.crop || 'పంట'} (${job.workType || 'పని'})`,
    labourName: labourName || "కూలీ",
    amount: amount,
    status: "Locked",
    createdAt: Date.now()
  });

  saveAgriWalletData(wallet);
  renderWalletWidget();
};

window.handleReleasePayment = function(escrowId) {
  if (!confirm("కూలీ పని పూర్తిగా పూర్తయిందా? డబ్బును కూలీ వాలెట్‌కు release చేయమంటారా?")) {
    return;
  }

  const wallet = getAgriWalletData();
  const item = wallet.lockedEscrow.find(e => e.id === escrowId);

  if (item && item.status === "Locked") {
    const amt = Number(item.amount || 0);

    item.status = "Released";
    item.releasedAt = Date.now();

    wallet.farmerBalance = Math.max(0, wallet.farmerBalance - amt);
    wallet.labourBalance = Number(wallet.labourBalance || 0) + amt;

    saveAgriWalletData(wallet);
    renderWalletWidget();

    if (typeof speakTeluguText === "function") {
      speakTeluguText(`కూలీకి ${amt} రూపాయలు విజయవంతంగా విడుదల చేయబడ్డాయి.`);
    } else {
      alert(`🎉 ₹${amt} నిధులు కూలీ main వాలెట్‌కు విజయవంతంగా బదిలీ చేయబడ్డాయి!`);
    }
  }
};

window.handleWithdrawUPI = function() {
  const wallet = getAgriWalletData();
  const currentBalance = Number(wallet.labourBalance || 0);

  if (currentBalance <= 0) {
    alert("మీ వాలెట్‌లో withdrawal చేయడానికి balance లేదు!");
    return;
  }

  const amountStr = prompt(`మీ వద్ద మొత్తం ₹${currentBalance} ఉంది.\nఎంత amount withdraw చేయాలనుకుంటున్నారు?`, currentBalance);
  if (!amountStr) return;

  const withdrawAmount = Number(amountStr);

  if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
    alert("దయచేసి సరైన amount నమోదు చేయండి!");
    return;
  }

  if (withdrawAmount > currentBalance) {
    alert(`మీ వాలెట్‌లో అంత balance లేదు! గరిష్ట balance: ₹${currentBalance}`);
    return;
  }

  const upiId = prompt("మీ UPI ID నమోదు చేయండి (ఉదా: 9876543210@upi):", "");
  if (!upiId || !upiId.trim()) {
    alert("సరైన UPI ID నమోదు చేయండి!");
    return;
  }

  wallet.labourBalance = currentBalance - withdrawAmount;
  saveAgriWalletData(wallet);
  renderWalletWidget();

  alert(`✅ ₹${withdrawAmount} మీ UPI (${upiId.trim()}) కి విజయవంతంగా బదిలీ చేయబడింది!\nమిగిలిన balance: ₹${wallet.labourBalance}`);
};

// --- వాహనం / పరికరాల బుకింగ్ కోసం Escrow Lock ఫంక్షన్ ---
window.lockBookingEscrow = function(bookingId, amount, itemName) {
  const wallet = getAgriWalletData();
  const currentBalance = Number(wallet.farmerBalance || 0);
  const amt = Number(amount || 0);

  if (currentBalance < amt) {
    alert(`⚠️ రైతు వ్యాలెట్‌లో సరిపడా బ్యాలెన్స్ లేదు! కావలసినది: ₹${amt}, ఉన్నది: ₹${currentBalance}`);
    return false;
  }

  wallet.farmerBalance = currentBalance - amt;

  wallet.lockedEscrow.unshift({
    id: "ESC-BK-" + Date.now(),
    jobId: bookingId,
    jobTitle: itemName || "సేవ బుకింగ్",
    labourName: "సర్వీస్ ప్రొవైడర్",
    amount: amt,
    status: "Locked",
    createdAt: Date.now()
  });

  saveAgriWalletData(wallet);
  renderWalletWidget();

  // బుకింగ్ స్టేటస్ అప్‌డేట్ చేయడం
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

  if (typeof renderBookingRecords === "function") {
    renderBookingRecords();
  }

  alert(`🔒 ₹${amt} అడ్వాన్స్ మొత్తం Smart Wallet (Escrow) లో లాక్ చేయబడింది!`);
  return true;
};
