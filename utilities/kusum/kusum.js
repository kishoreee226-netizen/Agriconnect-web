// utilities/kusum/kusum.js
(function setupKusumLogic() {
  document.addEventListener('click', function (e) {
    // 1. PM-KUSUM Agriculture Solar Pump Portal
    if (e.target && e.target.id === 'kusumLiveBtn') {
      window.open('https://pmkusum.mnre.gov.in/', '_blank', 'noopener,noreferrer');
    }
    // 2. PM Surya Ghar: Muft Bijli Yojana (Rooftop Solar Subsidy Portal)
    if (e.target && e.target.id === 'suryaGharBtn') {
      window.open('https://pmsuryaghar.gov.in/', '_blank', 'noopener,noreferrer');
    }
  });
})();
