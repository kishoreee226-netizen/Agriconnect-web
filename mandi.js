// ================= REAL-TIME MANDI RATES MODULE (GENUINE DATA ONLY) =================

async function fetchLiveMandiRates() {
  const tbody = document.getElementById("mandi-rates-body");
  const statusEl = document.getElementById("mandi-status-msg");
  if (!tbody) return;

  if (!navigator.onLine) {
    showMandiOfflineWarning(tbody, statusEl);
    return;
  }

  tbody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>⏳ <i>మార్కెట్ ధరలు లోడ్ అవుతున్నాయి...</i></td></tr>";

  // Agmarknet Government API (Telangana)
  const API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
  const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY}&format=json&filters[state]=Telangana&limit=15`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data && data.records && data.records.length > 0) {
      let rowsHtml = "";
      data.records.forEach((r) => {
        rowsHtml += `
          <tr>
            <td><b>${r.commodity || "పంట"}</b></td>
            <td>${r.market || "వరంగల్"}</td>
            <td style="color:#1B5E20; font-weight:bold;">₹${r.modal_price || "N/A"}</td>
          </tr>
        `;
      });
      tbody.innerHTML = rowsHtml;
      if (statusEl) {
        statusEl.innerHTML = `<span style="color:#2e7d32; font-size:0.8rem;">🟢 Live Govt Agmarknet (${new Date().toLocaleTimeString()})</span>`;
      }
      return;
    } else {
      // డేటా లేకపోతే Firebase లో అసలు ధరలు ఏవైనా ఉన్నాయేమో చూస్తుంది
      checkFirestoreRealRates(tbody, statusEl);
    }
  } catch (err) {
    console.warn("API direct fetch error, checking Firestore backup:", err);
    checkFirestoreRealRates(tbody, statusEl);
  }
}

// కేవలం Firestore లో మీరు/అధికారులు వేసిన అసలు డేటా మాత్రమే చూపిస్తుంది
function checkFirestoreRealRates(tbody, statusEl) {
  if (!window.db) {
    showNoDataMessage(tbody, statusEl);
    return;
  }

  window.db.collection("mandi_rates").get().then((snapshot) => {
    if (snapshot.empty) {
      showNoDataMessage(tbody, statusEl);
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
    if (statusEl) statusEl.innerHTML = "<small style='color:#2e7d32;'>🟢 లైవ్ డేటా</small>";
  }).catch((err) => {
    console.error("Firestore read error:", err);
    showNoDataMessage(tbody, statusEl);
  });
}

function showNoDataMessage(tbody, statusEl) {
  tbody.innerHTML = `
    <tr>
      <td colspan="3" style="text-align:center; padding:15px; color:#555;">
        🌾 <b>ఈ రోజు మార్కెట్ ధరలు ఇంకా అప్‌డేట్ కాలేదు.</b><br>
        <small style="color:#777;">(మార్కెట్ సెలవు కావచ్చు లేదా సర్వర్ నుండి డేటా రాలేదు)</small>
      </td>
    </tr>
  `;
  if (statusEl) statusEl.innerHTML = "<small style='color:#e65100;'>అందుబాటులో లేదు</small>";
}

function showMandiOfflineWarning(tbody, statusEl) {
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; padding:12px; color:#d32f2f;">
          ⚠️ <b>ఇంటర్నెట్ లేదు!</b><br>
          <small>లైవ్ ధరల కోసం నెట్‌వర్క్ చెక్ చేయండి.</small>
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
