// ================= REAL-TIME MANDI RATES & LABOR MODULE =================

// 1. Real-time Mandi Rates (Firestore Live)
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
      tbody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>Dharalu inka update kaledu.</td></tr>";
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
      statusEl.innerHTML = `<span style="color:#2e7d32; font-size:0.8rem;">🟢 Live Rates (${new Date().toLocaleTimeString()})</span>`;
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

// 2. Real-time Coolilu / Labor List (Directly from 'laborers')
function listenLiveLaborList() {
  const listEl = document.getElementById("labor-list");
  if (!listEl || !window.db) return;

  // Actual 'laborers' collection listener
  window.db.collection("laborers").onSnapshot((snapshot) => {
    if (snapshot.empty) {
      listEl.innerHTML = "<i>Coolilu evaru inka register kaledu.</i>";
      return;
    }

    let html = "<ul style='padding-left:18px; line-height:1.6;'>";
    snapshot.forEach((doc) => {
      const l = doc.data();
      html += `
        <li style="margin-bottom:8px;">
          <b>${l.name || "Peru ledu"}</b> - ${l.workType || "Vyavasaya Panulu"} (${l.village || "Gramam"})<br>
          📞 <a href="tel:${l.phone}" style="color:#1B5E20; text-decoration:none; font-weight:bold;">${l.phone || "No phone"}</a>
        </li>
      `;
    });
    html += "</ul>";
    listEl.innerHTML = html;
  }, (error) => {
    console.error("Laborers fetch error:", error);
    listEl.innerHTML = "<small style='color:#d32f2f;'>Coolila data thevalekapoyam.</small>";
  });
}
:8px;">
          <b>${l.name || "Peru"}</b> - ${l.workType || "Panulu"} (${l.village || "Gramam"})<br>
          📞 <a href="tel:${l.phone}" style="color:#1B5E20; text-decoration:none;">${l.phone || "No phone"}</a>
        </li>
      `;
    });
    html += "</ul>";
    listEl.innerHTML = html;
  });
}

// Network events & Auto-load
window.addEventListener("online", listenLiveMandiRates);
window.addEventListener("offline", () => {
  const tbody = document.getElementById("mandi-rates-body");
  const statusEl = document.getElementById("mandi-status-msg");
  showMandiOfflineWarning(tbody, statusEl);
});

document.addEventListener("DOMContentLoaded", () => {
  listenLiveMandiRates();
  listenLiveLaborList();
});
