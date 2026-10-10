// ================= REAL-TIME GOVT MANDI RATES (DATA.GOV.IN / AGMARKNET) =================

async function fetchLiveGovtMandiRates() {
  const tbody = document.getElementById("mandi-rates-body");
  const statusEl = document.getElementById("mandi-status-msg");
  if (!tbody) return;

  if (!navigator.onLine) {
    showMandiOfflineWarning(tbody, statusEl);
    return;
  }

  tbody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>⏳ <i>Live market server nundi dharalu load avthunnayi...</i></td></tr>";

  // Agmarknet API (Telangana & local market commodities)
  const API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
  const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY}&format=json&filters[state]=Telangana&limit=10`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.records || data.records.length === 0) {
      fallbackToFirestore(tbody, statusEl);
      return;
    }

    let rowsHtml = "";
    data.records.forEach((record) => {
      rowsHtml += `
        <tr>
          <td><b>${record.commodity || "Panta"}</b></td>
          <td>${record.market || "Warangal"}</td>
          <td style="color:#1B5E20; font-weight:bold;">₹${record.modal_price || "N/A"}</td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:#2e7d32; font-size:0.8rem;">🟢 Live Agmarknet (${new Date().toLocaleTimeString()})</span>`;
    }
  } catch (err) {
    console.warn("Govt API fetch error, switching to Firestore fallback:", err);
    fallbackToFirestore(tbody, statusEl);
  }
}

function fallbackToFirestore(tbody, statusEl) {
  if (!window.db) {
    tbody.innerHTML = "<tr><td colspan='3' style='text-align:center; color:#777;'>🌾 Market dharala server busy ga undi.</td></tr>";
    return;
  }

  window.db.collection("mandi_rates").get().then((snapshot) => {
    if (snapshot.empty) {
      tbody.innerHTML = "<tr><td colspan='3' style='text-align:center; color:#777;'>🌾 Market server busy ga undi. Thvaralo update avthundi.</td></tr>";
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
      statusEl.innerHTML = "<small style='color:#777;'>Backup data</small>";
    }
  }).catch(() => {
    tbody.innerHTML = "<tr><td colspan='3' style='text-align:center; color:#d32f2f;'>Dharalu thevalekapoyam.</td></tr>";
  });
}

function showMandiOfflineWarning(tbody, statusEl) {
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; padding:12px; color:#d32f2f;">
          ⚠️ <b>Internet sambandham ledu!</b><br>
          <small>Live dharala kosam internet check cheyandi.</small>
        </td>
      </tr>
    `;
  }
  if (statusEl) {
    statusEl.innerHTML = `<span style="color:#d32f2f; font-size:0.8rem;">⚠️ Offline</span>`;
  }
}

window.addEventListener("online", fetchLiveGovtMandiRates);
window.addEventListener("offline", () => {
  const tbody = document.getElementById("mandi-rates-body");
  const statusEl = document.getElementById("mandi-status-msg");
  showMandiOfflineWarning(tbody, statusEl);
});

document.addEventListener("DOMContentLoaded", fetchLiveGovtMandiRates);
