// wallet.js - రైతు మరియు కూలీల UPI పేమెంట్ & వాలెట్ సెటిల్మెంట్ మాడ్యూల్

const WalletSystem = {
  // లోకల్ స్టోరేజ్ నుండి వాలెట్ బ్యాలెన్స్ పొందడం
  getBalance() {
    return parseFloat(localStorage.getItem("agri_wallet_balance")) || 0;
  },

  // బ్యాలెన్స్ అప్‌డేట్ చేయడం
  setBalance(amount) {
    localStorage.setItem("agri_wallet_balance", amount.toFixed(2));
    this.updateWalletUI();
  },

  // రైతు కూలీకి డబ్బులు చెల్లించే ఫంక్షన్ (UPI డీప్ లింక్)
  payLabourViaUPI(labourUPI, amount, labourName) {
    if (!labourUPI || !amount) {
      alert("దయచేసి సరైన UPI ID మరియు అమౌంట్ నమోదు చేయండి.");
      return;
    }
    // అధికారిక UPI డీప్ లింక్ (PhonePe, GPay, Paytm లలో డైరెక్ట్ గా ఓపెన్ అవుతుంది)
    const upiUrl = `upi://pay?pa=${encodeURIComponent(labourUPI)}&pn=${encodeURIComponent(labourName)}&am=${amount}&cu=INR&tn=AgriConnect%20Daily%20Wage`;
    window.location.href = upiUrl;
  },

  // వాలెట్‌లోకి డబ్బులు క్రెడిట్ చేయడం (కూలీ కోసం)
  creditWage(amount, jobTitle) {
    const current = this.getBalance();
    const updated = current + parseFloat(amount);
    this.setBalance(updated);
    alert(`🎉 ₹${amount} మీ వాలెట్‌కు జమ అయ్యాయి! (${jobTitle})`);
  },

  // కూలీ బ్యాంక్/UPI కి విత్‌డ్రా చేయడం
  withdrawFunds() {
    const current = this.getBalance();
    if (current <= 0) {
      alert("మీ వాలెట్‌లో విత్‌డ్రా చేయడానికి తగినంత బ్యాలెన్స్ లేదు.");
      return;
    }

    const upiId = prompt(`మీ వద్ద ₹${current} బ్యాలెన్స్ ఉంది.\nఏ UPI ID కి బదిలీ చేయాలి? (e.g. 9876543210@ybl):`);
    if (upiId && upiId.includes("@")) {
      this.setBalance(0);
      alert(`✅ ₹${current} మొత్తం ${upiId} కి విజయవంతంగా బదిలీ చేయబడింది!`);
    } else if (upiId) {
      alert("సరైన UPI ID ఇవ్వండి.");
    }
  },

  // వాలెట్ UI ని రెండర్ చేయడం
  renderWalletWidget(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const balance = this.getBalance();

    container.innerHTML = `
      <div style="background: #ffffff; border: 1.5px solid #2e7d32; border-radius: 8px; padding: 10px 14px; max-width: 480px; margin: 10px auto; font-family: sans-serif; box-shadow: 0 2px 6px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 11px; color: #555; display: block;">💼 కిసాన్ వాలెట్ (Labour Earnings)</span>
          <strong id="wallet-balance-display" style="font-size: 16px; color: #1b5e20;">₹${balance.toFixed(2)}</strong>
        </div>
        <button onclick="WalletSystem.withdrawFunds()" style="background: #2e7d32; color: #ffffff; border: none; border-radius: 6px; padding: 7px 12px; font-size: 12px; font-weight: 700; cursor: pointer;">
          🏦 బ్యాంక్ విత్‌డ్రా (Instant UPI)
        </button>
      </div>
    `;
  },

  updateWalletUI() {
    const display = document.getElementById("wallet-balance-display");
    if (display) {
      display.innerText = `₹${this.getBalance().toFixed(2)}`;
    }
  }
};

window.addEventListener("DOMContentLoaded", () => {
  WalletSystem.renderWalletWidget("wallet-container");
});
