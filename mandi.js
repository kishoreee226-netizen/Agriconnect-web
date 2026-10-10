// ================= REAL-TIME MANDI RATES MODULE =================

function listenLiveMandiRates() {
  const tbody = document.getElementById("mandi-rates-body");
  const statusEl = document.getElementById("mandi-status-msg");
  if (!tbody) return;

  if (!navigator.onLine) {
    showMandiOfflineWarning(tbody, statusEl);
    return;
  }

  if (!window.db) {
    console.error("Firebase db initialize kaledu.");
    return;
  }

  tbody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>⏳ <i>Live dharalu load avthunnayi...</i></td></tr>";

  window.db.collection("mandi_rates").onSnapshot((snapshot) => {
    if (snapshot.empty) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align:center; padding:12px; color:#555;">
            🌾 <i>Mandi dharalu inka enter cheyaledu.</i>
          </td>
        </tr>
      `;
      if (statusEl) statusEl.innerHTML = "<small style='color:#e65100;'>Data ledu</small>";
      return;
    }

    let rowsHtml = "";
    snapshot.forEach((doc) => {
      const item = doc.data();
      rowsHtml += `
        <tr>
          <td><b>${item.crop || "Panta"}</b></td>
          <td>${item.market || "Warangal"}</td>
          <td style="color:#1B5E20; font-weight:bold;">₹${item.price || "0"}</td>
        </tr>
      `;
    });
    tbody.innerHTML = rowsHtml;

    if (statusEl) {
      statusEl.innerHTML = `<span style="color:#2e7d32; font-size:0.8rem;">🟢 Live (${new Date().toLocaleTimeString()})</span>`;
    }
  }, (error) => {
    console.error("Mandi Firestore error:", error);
    showMandiOfflineWarning(tbody, statusEl);
  });
}

function showMandiOfflineWarning(tbody, statusEl) {
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; padding:15px; color:#d32f2f;">
          ⚠️ <b>Internet Sambandham Ledu!</b><br>
          <small style="color:#555;">Live Mandi dharala kosam internet on cheyandi.</small>
        </td>
      </tr>
    `;
  }
  if (statusEl) {
    statusEl.innerHTML = `<span style="color:#d32f2f; font-size:0.8rem;">⚠️ Offline</span>`;
  }
}

window.addEventListener("online", listenLiveMandiRates);
window.addEventListener("offline", () => {
  const tbody = document.getElementById("mandi-rates-body");
  const statusEl = document.getElementById("mandi-status-msg");
  showMandiOfflineWarning(tbody, statusEl);
});

document.addEventListener("DOMContentLoaded", () => {
  listenLiveMandiRates();
});
