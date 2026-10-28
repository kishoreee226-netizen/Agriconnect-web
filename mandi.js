// Pure Dynamic Live Mandi Data Fetch
async function fetchMandiData() {
  const apiKey = "579b464db66ecb3875b39ed9319231f2";
  const resourceId = "9ef84268-d588-465a-a308-a864a43d0070";
  const targetGovUrl = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=1000`;

  // Multiple high-speed reliable CORS gateways to reach data.gov.in from browser
  const endpoints = [
    `https://corsproxy.io/?${encodeURIComponent(targetGovUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${targetGovUrl}`
  ];

  for (const ep of endpoints) {
    try {
      console.log("Fetching live data from:", ep);
      const res = await fetch(ep);
      if (res.ok) {
        const data = await res.json();
        const records = data.records || (Array.isArray(data) ? data : []);
        if (records.length > 0) {
          console.log(`Loaded ${records.length} authentic records!`);
          return records
            .map(r => ({
              state: (r.state || r.State || "").trim(),
              district: (r.district || r.District || "").trim(),
              market: (r.market || r.Market || "").trim(),
              commodity: (r.commodity || r.Commodity || "").trim(),
              modal_price: String(r.modal_price || r.Modal_Price || r.price || "0").trim()
            }))
            .filter(r => r.state && r.commodity && !r.market.toLowerCase().includes("national") && !r.state.toLowerCase().includes("all india"));
        }
      }
    } catch (err) {
      console.warn("Gateway error, switching to next:", err);
    }
  }

  // Backup fallback to repo file if available
  try {
    const localRes = await fetch("mandi_live.json?v=" + Date.now(), { cache: "no-store" });
    if (localRes.ok) {
      const localData = await localRes.json();
      return Array.isArray(localData) ? localData : (localData.records || []);
    }
  } catch (e) {
    console.error("Local file fetch failed:", e);
  }

  return [];
}
