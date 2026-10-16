// transport.js - Ravanaa (Vehicles & Auto/Trolley/Lorry) Widget

const transportList = [
  { id: "tr1", name: "Tata Ace (Chota Hathi)", driver: "రమేష్", rate: "₹18 / కి.మీ", phone: "9876543220", loc: "గ్రామం & మండలం పరిధి" },
  { id: "tr2", name: "ట్రాక్టర్ ట్రాలీ (ధాన్యం రవాణా)", driver: "శంకర్", rate: "₹1,200 / ట్రిప్పు", phone: "9876543221", loc: "మార్కెట్ యార్డ్ రూట్" },
  { id: "tr3", name: "10-టైర్ లారీ (భారీ సరుకు)", driver: "బాలాజీ ట్రాన్స్‌పోర్ట్", rate: "దూరాన్ని బట్టి రేటు", phone: "9876543222", loc: "రాష్ట్రవ్యాప్తంగా" }
];

window.renderTransportWidget = function(targetContainerId = "farmer-pane-transport") {
  const container = document.getElementById(targetContainerId);
  if (!container) return;

  container.innerHTML = `
    <div class="eq-list-wrap">
      ${transportList.map(tr => `
        <div class="eq-item-card">
          <div class="eq-top-row">
            <div>
              <div class="eq-name">${tr.name}</div>
              <div class="eq-owner-meta">డ్రైవర్/యజమాని: <b>${tr.driver}</b> | 📍 ${tr.loc}</div>
            </div>
            <div class="eq-price-badge">${tr.rate}</div>
          </div>
          <div class="eq-actions-row">
            <a href="tel:${tr.phone}" class="eq-btn-link eq-btn-call">📞 కాల్ చేయండి</a>
            <a href="https://wa.me/91${tr.phone}" target="_blank" class="eq-btn-link eq-btn-wa">💬 వాట్సాప్</a>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};
