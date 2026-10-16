// wallet.js - 2-in-1 Escrow Smart Wallet (Digital Lock & Release)

// Helper: Wallet data ni localStorage nundi thecchukovadam
function getAgriWalletData() {
  const defaultWallet = {
    farmerBalance: 2500,
    labourBalance: 0,
    lockedEscrow: [
      {
        id: "ESC-INIT-1",
        jobId: "INIT-1",
        jobTitle: "వరి కోత",
        labourName: "రాము",
        amount: 450,
        status: "Locked"
      }
    ]
  };

  try {
    const saved = localStorage.getItem("agri_wallet");
    if (saved) return JSON.parse(saved);
  } catch (e) {}

  localStorage.setItem("agri_wallet", JSON.stringify(defaultWallet));
  return defaultWallet;
}

// Helper: Wallet data ni save cheyadam
function saveAgriWalletData(data) {
  try {
    localStorage.setItem("agri_wallet", JSON.stringify(data));
  } catch (e) {}
}

function renderWalletWidget() {
  const container = document.getElementById("wallet-container");
  if (!container) return;

  const walletData = getAgriWalletData();

  const lockedTotal = walletData.lockedEscrow
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
            🔐 Escrow లావాదేవీలు (కూలీకి garanty lock):
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
                    status: <b>${isLocked ? '🔒 lock అయింది (రైతు ఖాతాలో hold)' : '✅ Release అయింది (కూలీ ఖాతాకు చేరింది)'}</b>
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

// Function: Kotha job accept chesinappudu automatic ga Escrow loki lock cheyadam
window.lockJobToEscrow = function(job, labourName) {
  const wallet = getAgriWalletData();
  const amount = Number(job.wage || 0);

  // Already lock ayyindo ledo check cheyadam
  const exists = wallet.lockedEscrow.find(e => e.jobId === job.id);
  if (exists) return;

  wallet.lockedEscrow.unshift({
    id: "ESC-" + Date.now(),
    jobId: job.id,
    jobTitle: `${job.crop} (${job.workType})`,
    labourName: labourName,
    amount: amount,
    status: "Locked"
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

    // 1. Status release ga marchadam
    item.status = "Released";

    // 2. Farmer balance nundi deduct chesi Labour wallet ki add cheyadam
    wallet.farmerBalance = Math.max(0, wallet.farmerBalance - amt);
    wallet.labourBalance = Number(wallet.labourBalance || 0) + amt;

    saveAgriWalletData(wallet);
    renderWalletWidget();

    // AgriState update (if available)
    if (window.AgriState && window.AgriState.wallet) {
      window.AgriState.wallet = wallet;
    }

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

  // 1. Amount adagadam
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

  // 2. UPI ID adagadam
  const upiId = prompt("మీ UPI ID నమోదు చేయండి (ఉదా: 9876543210@ybl):", "9876543211@upi");
  if (!upiId) return;

  // 3. Balance nundi deduct chesi migilinadhi save cheyadam
  wallet.labourBalance = currentBalance - withdrawAmount;
  saveAgriWalletData(wallet);
  renderWalletWidget();

  alert(`✅ ₹${withdrawAmount} మీ UPI (${upiId}) కి విజయవంతంగా బదిలీ చేయబడింది!\nమిగిలిన balance: ₹${wallet.labourBalance}`);
};
// --- బుకింగ్ కోసం Escrow Lock ఫంక్షన్ ---
window.lockBookingEscrow = function(bookingId, amount, itemName) {
  const wallet = getAgriWalletData();
  const currentBalance = Number(wallet.farmerBalance || 0);

  if (currentBalance < amount) {
    alert(`⚠️ రైతు వ్యాలెట్‌లో సరిపడా బ్యాలెన్స్ లేదు! కావలసినది: ₹${amount}, ఉన్నది: ₹${currentBalance}`);
    return false;
  }

  // రైతు బ్యాలెన్స్ నుండి అడ్వాన్స్ కట్ చేసి ఎస్క్రో లో లాక్ చేయడం
  wallet.farmerBalance = currentBalance - amount;
  if (!wallet.escrows) wallet.escrows = [];
  
  wallet.escrows.unshift({
    bookingId: bookingId,
    amount: amount,
    itemName: itemName,
    status: "Locked",
    date: new Date().toLocaleDateString('te-IN')
  });

  saveAgriWalletData(wallet);
  renderWalletWidget();

  if (window.AgriState) {
    window.AgriState.wallet = wallet;
  }

  // బుకింగ్ స్టేటస్ అప్‌డేట్ చేయడం
  try {
    let bookings = JSON.parse(localStorage.getItem("farmer_bookings") || "[]");
    bookings = bookings.map(b => {
      if (b.id === bookingId) {
        b.status = `🔒 ₹${amount} Escrow లో భద్రపరచబడింది`;
      }
      return b;
    });
    localStorage.setItem("farmer_bookings", JSON.stringify(bookings));
  } catch (err) {}

  if (typeof renderBookingRecords === "function") {
    renderBookingRecords();
  }

  alert(`🔒 ₹${amount} అడ్వాన్స్ మొత్తం Smart Wallet (Escrow) లో లాక్ చేయబడింది!`);
  return true;
};

