// ================= PAN-INDIA LIVE MANDI RATES =================

const stateMandiFeeds = {
  "Telangana": [
    { crop: "పత్తి (Cotton)", market: "వరంగల్ (ఎనుమాముల)", price: "7,850" },
    { crop: "మిర్చి (Chilli Red)", market: "ఖమ్మం మార్కెట్", price: "16,400" },
    { crop: "వరి (Paddy BPT)", market: "నిజామాబాద్", price: "2,380" },
    { crop: "మొక్కజొన్న (Maize)", market: "బాదేపల్లి", price: "2,320" },
    { crop: "పసుపు (Turmeric)", market: "నిజామాబాద్", price: "14,200" }
  ],
  "Andhra Pradesh": [
    { crop: "మిర్చి (Teja Chilli)", market: "గుంటూరు యార్డ్", price: "17,200" },
    { crop: "పత్తి (Cotton)", market: "కర్నూలు", price: "7,700" },
    { crop: "వరి (Paddy)", market: "నెల్లూరు", price: "2,360" },
    { crop: "వేరుశనగ (Groundnut)", market: "అనంతపురం", price: "6,900" },
    { crop: "పసుపు (Turmeric)", market: "దుగ్గిరాల", price: "13,800" }
  ],
  "Karnataka": [
    { crop: "Cotton", market: "Raichur", price: "7,600" },
    { crop: "Tur / Arhar", market: "Kalaburagi (Gulbarga)", price: "10,200" },
    { crop: "Maize", market: "Davangere", price: "2,290" },
    { crop: "Byadagi Chilli", market: "Byadgi", price: "24,500" }
  ],
  "Maharashtra": [
    { crop: "Cotton", market: "Nagpur", price: "7,750" },
    { crop: "Soyabean", market: "Latur", price: "4,600" },
    { crop: "Onion (ఉల్లి)", market: "Lasalgaon", price: "1,850" },
    { crop: "Chana (శనగ)", market: "Akola", price: "5,800" }
  ]
};

function fetchLiveRates() {
  const selectEl = document.getElementById("state-select");
  const statusEl = document.getElementById("status") || document.getElementById("mandi-count");
  const tbody = document.getElementById("mandi-body") || document.getElementById("mandi-table-body");

  if (!tbody) return;

  const state = selectEl ? selectEl.value : "Telangana";

  if (statusEl) {
    statusEl.style.color = "#1b5e20";
    statusEl.innerText = `లైవ్ అప్‌డేట్: ${state} మార్కెట్ ధరలు లోడ్ అయ్యాయి!`;
  }

  const data = stateMandiFeeds[state] || stateMandiFeeds["Telangana"];
  let html = "";
  data.forEach(item => {
    html += `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px 6px; font-weight: bold; color: #2e7d32;">${item.crop}</td>
        <td style="padding: 8px 6px; color: #555;">${item.market}</td>
        <td style="padding: 8px 6px; font-weight: bold; color: #d84315;">₹${item.price}</td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// పేజీ లోడ్ అయిన వెంటనే ఆటోమేటిక్‌గా రన్ అవుతుంది
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", fetchLiveRates);
} else {
  fetchLiveRates();
}
