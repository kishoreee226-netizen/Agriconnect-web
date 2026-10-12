// wallet.js - 2-in-1 Escrow Smart Wallet (Digital Lock & Release)

function renderWalletWidget() {
  const container = document.getElementById("wallet-container");
  if (!container) return;

  const state = window.AgriState;
  const walletData = state ? state.getWallet() : { farmerBalance: 2000, labourBalance: 0, lockedEscrow: [] };

  const lockedTotal = walletData.lockedEscrow
    .filter(item => item.status === "Locked")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  container.innerHTML = `
    <div style="background: #ffffff; border: 1.5px solid #ffb300; border-radius: 10px; overflow: hidden; box-shadow: 0 3px 8px rgba(0,0,0,0.06);">
      
      <!-- Wallet Header -->
      <div style="background: #fff8e1; border-bottom: 1.5px solid #ffe082; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; color: #b78103; font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 5px;">
          👛 అగ్రీ స్మార్ట్ వాలెట్ (2-in-1 Escrow Lock)
        </h3>
        <span style="font-size: 10px; background: #ffe082; color: #b78103; padding: 2px 7px; border-radius: 4px; font-weight: 700;">100% Secured</span>
      </div>

      <div style="padding: 12px; display: flex; flex-direction: column; gap: 10px;">
        
        <!-- Summary Cards: Farmer Balance vs Labour Balance -->
        <div style="display: flex; gap: 8px;">
          <!-- Farmer Side -->
          <div style="flex: 1; background: #f1f8e9; border: 1px solid #c8e6c9; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 11px; color: #2e7d32; font-weight: 600;">👨‍🌾 రైతు ఖాతా బ్యాలెన్స్</div>
            <div style="font-size: 15px; font-weight: 800; color: #1b5e20; margin: 2px 0;">₹${walletData.farmerBalance}</div>
            <div style="font-size: 10px; color: #d84315;">🔒 లాక్ అయినది: ₹${lockedTotal}</div>
          </div>

          <!-- Labour Side -->
          <div style="flex: 1; background: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 11px; color: #1565c0; font-weight: 600;">👷 కూలీ మెయిన్ వాలెట్</div>
            <div style="font-size: 15px; font-weight: 800; color: #0d47a1; margin: 2px 0;">₹${walletData.labourBalance}</div>
            <button onclick="handleWithdrawUPI()" style="background: #1976d2; color: #ffffff; border: none; border-radius: 4px; padding: 3px 8px; font-size: 10px; font-weight: 700; cursor: pointer; margin-top: 2px;">
              💸 UPI Withdraw
            </button>
          </div>
        </div>

        <!-- Escrow Active Transactions List -->
        <div style="border-top: 1.5px dashed #ffe082; padding-top: 8px;">
          <div style="font-size: 12px; font-weight: 700; color: #5d4037; margin-bottom: 6px;">
            🔐 ఎస్క్రో లావాదేవీలు (కూలీకి గ్యారంటీ లాక్):
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${walletData.lockedEscrow.length === 0 ? `
              <div style="font-size: 11px; color: #888; text-align: center; padding: 6px; background: #fffde7; border-radius: 6px;">
                ప్రస్తుతం ఏ లావాదేవీ లాక్ అయి లేదు.
              </div>
            ` : walletData.lockedEscrow.map(esc => {
              const isLocked = esc.status === "Locked";
              return `
                <div style="border: 1px solid ${isLocked ? '#ffe082' : '#c8e6c9'}; background: ${isLocked ? '#fffde7' : '#f9fbf9'}; border-radius: 6px; padding: 8px;">
                  <div style="display: flex; justify-content: space-between; font-size: 12px;">
                    <span><b>${esc.jobTitle}</b> (${esc.labourName})</span>
                    <strong style="color: ${isLocked ? '#e65100' : '#2e7d32'};">₹${esc.amount}</strong>
                  </div>
                  <div style="font-size: 10px; color: #555; margin-top: 2px;">
                    స్టేటస్: <b>${isLocked ? '🔒 లాక్ అయింది (రైతు ఖాతాలో హోల్డ్)' : '✅ రిలీజ్ అయింది (కూలీ ఖాతాకు చేరింది)'}</b>
                  </div>
                  
                  ${isLocked ? `
                    <div style="display: flex; gap: 6px; margin-top: 6px;">
                      <button onclick="handleReleasePayment('${esc.id}')" style="flex: 1; background: #2e7d32; color: #ffffff; border: none; border-radius: 4px; padding: 5px; font-size: 11px; font-weight: 700; cursor: pointer;">
                        🔓 పని అయింది - రిలీజ్ చేయండి (రైతు)
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

window.handleReleasePayment = function(escrowId) {
  if (confirm("కూలీ పని పూర్తిగా పూర్తయిందా? డబ్బును కూలీ వాలెట్‌కు రిలీజ్ చేయమంటారా?")) {
    if (window.AgriState) {
      window.AgriState.releaseEscrow(escrowId);
      renderWalletWidget();
      alert("🎉 ₹ నిధులు కూలీ మెయిన్ వాలెట్‌కు విజయవంతంగా బదిలీ చేయబడ్డాయి!");
    }
  }
};

window.handleWithdrawUPI = function() {
  const state = window.AgriState;
  const balance = state ? state.wallet.labourBalance : 0;
  if (balance <= 0) {
    alert("మీ వాలెట్‌లో విత్‌డ్రా చేయడానికి బ్యాలెన్స్ లేదు!");
    return;
  }
  const upiId = prompt("మీ UPI ID నమోదు చేయండి (उदा: 9876543210@ybl):", "9876543211@upi");
  if (upiId) {
    alert(`✅ ₹${balance} మీ UPI (${upiId}) కి బదిలీ అభ్యర్థన విజయవంతమైంది!`);
    state.wallet.labourBalance = 0;
    renderWalletWidget();
  }
};

window.renderWalletWidget = renderWalletWidget;
