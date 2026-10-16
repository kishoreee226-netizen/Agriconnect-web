// seeds.js - విత్తనాలు & ఎరువుల విడ్జెట్

const seedsList = [
  { id: "sd1", name: "BPT 5204 (సాంబ మసూరి)", vendor: "రైతు భరోసా కేంద్రం", rate: "₹950 / 25 కేజీలు", phone: "9876543213", loc: "సమీప డీలర్" },
  { id: "sd2", name: "మిర్చి నారు (తేజ రకం)", vendor: "శ్రీనివాస నర్సరీ", rate: "₹1.20 / మొక్క", phone: "9876543214", loc: "హైబ్రిడ్ విత్తనాలు" },
  { id: "sd3", name: "యూరియా & DAP ఎరువులు", vendor: "PAC సొసైటీ", rate: "సబ్సిడీ ధరలు", phone: "9876543215", loc: "స్టాక్ అందుబాటులో ఉంది" }
];

window.renderSeedsWidget = function(targetContainerId = "farmer-pane-seeds") {
  const container = document.getElementById(targetContainerId);
  if (!container) return;

  container.innerHTML = `
    <div class="eq-list-wrap">
      ${seedsList.map(seed => `
        <div class="eq-item-card">
          <div class="eq-top-row">
            <div>
              <div class="eq-name">${seed.name}</div>
              <div class="eq-owner-meta">డీలర్/సొసైటీ: <b>${seed.vendor}</b> \vert{} 📍 ${seed.loc}</div>
            </div>
            <div class="eq-price-badge">${seed.rate}</div>
          </div>
          <div class="eq-actions-row">
            <a href="tel:${seed.phone}" class="eq-btn-link eq-btn-call">📞 కాల్ చేయండి</a>
            <a href="https://wa.me/91${seed.phone}" target="_blank" class="eq-btn-link eq-btn-wa">💬 వాట్సాప్</a>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};
