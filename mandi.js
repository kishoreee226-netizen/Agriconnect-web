// ================= REAL-TIME MANDI RATES MODULE (LIVE AGMARKNET) =================

async function fetchLiveMandiRates() {
  const tbody = document.getElementById("mandi-rates-body");
  const statusEl = document.getElementById("mandi-status-msg");
  if (!tbody) return;

  if (!navigator.onLine) {
    showMandiOfflineWarning(tbody, statusEl);
    return;
  }

  tbody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>⏳ <i>Live Agmarknet server nundi dharalu thesthunnam...</i></td></tr>";

  // Data.gov.in Telangana Mandi Endpoint
  const rawApiUrl = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=json&filters[state]=Telangana&limit=15";

  // Browser CORS block kaakunda proxy dwara request
  const proxyUrl = "https://api.allorigins.win/get?url=" + encodeURIComponent(rawApiUrl);

  try {
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error("Network response not ok");

    const wrapper = await res.json();
    const data = JSON.parse(wrapper.contents);

    if (data && data.records && data.records.length > 0) {
      let rowsHtml = "";
      data.records.forEach((r) => {
        rowsHtml += `
          <tr>
            <td><b>${r.commodity || "Panta"}</b></td>
            <td>${r.market || "Telangana"}</td>
            <td style="color:#1B5E20; font-weight:bold;">₹${r.modal_price || "-"}</td>
          </tr>
        `;
      });
      tbody.innerHTML = rowsHtml;
      if (statusEl) {
        statusEl.innerHTML = `<span style="color:#2e7d32; font-size:0.8rem;">🟢 Live Agmarknet (${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})</span>`;
      }
      return;
    } else {
      checkFirestoreBackup(tbody, statusEl);
    }
  } catch (err) {
    console.warn("Live API proxy call failed, checking Firestore:", err);
    checkFirestoreBackup(tbody, statusEl);
  }
}

function checkFirestoreBackup(tbody, statusEl) {
  if (!window.db) {
    showNoDataNotice(tbody, statusEl);
    return;
  }

  window.db.collection("mandi_rates").get().then((snapshot) => {
    if (snapshot.empty) {
      showNoDataNotice(tbody, statusEl);
      return;
    }

    let rowsHtml = "";
    snapshot.forEach((doc) => {
      const item = doc.data();
      rowsHtml += `
        <tr>
          <td><b>${item.crop || item.commodity || "-"}</b></td>
          <td>${item.market || "-"}</td>
          <td style="color:#1B5E20; font-weight:bold;">₹${item.price || item.modal_price || "-"}</td>
        </tr>
      `;
    });
    tbody.innerHTML = rowsHtml;
    if (statusEl) statusEl.innerHTML = "<small style='color:#2e7d32;'>🟢 Firebase Live</small>";
  }).catch(() => {
    showNoDataNotice(tbody, statusEl);
  });
}

function showNoDataNotice(tbody, statusEl) {
  tbody.innerHTML = `
    <tr>
      <td colspan="3" style="text-align:center; padding:15px; color:#555;">
        🌾 <b>Ee roju market dharalu inka update kaledu.</b><br>
        <small style="color:#777;">(Market selavu kaavachu leda server busy ga undi)</small>
      </td>
    </tr>
  `;
  if (statusEl) statusEl.innerHTML = "<small style='color:#e65100;'>Data ledu</small>";
}

function showMandiOfflineWarning(tbody, statusEl) {
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; padding:12px; color:#d32f2f;">
          ⚠️ <b>Internet ledu!</b><br>
          <small>Live dharala kosam connection check cheyandi.</small>
        </td>
      </tr>
    `;
  }
  if (statusEl) statusEl.innerHTML = `<span style="color:#d32f2f; font-size:0.8rem;">⚠️ Offline</span>`;
}

window.addEventListener("online", fetchLiveMandiRates);
window.addEventListener("offline", () => {
  const tbody = document.getElementById("mandi-rates-body");
  const statusEl = document.getElementById("mandi-status-msg");
  showMandiOfflineWarning(tbody, statusEl);
});

document.addEventListener("DOMContentLoaded", fetchLiveMandiRates);
