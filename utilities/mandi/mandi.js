// utilities/mandi/mandi.js
(function setupMandiLogic() {
  document.addEventListener('click', function (e) {
    // 1. కేంద్ర ప్రభుత్వ నిత్యావసర & పంట ధరల పర్యవేక్షణ పోర్టల్ (Mobile Friendly)
    if (e.target && e.target.id === 'mandiLiveBtn') {
      window.open('https://consumeraffairs.nic.in/en/price-monitoring-cell', '_blank', 'noopener,noreferrer');
    }
    // 2. Agmarknet 2.0 Live Price Search Portal (Working)
    if (e.target && e.target.id === 'mandiAgmarkBtn') {
      window.open('https://agmarknet.gov.in/', '_blank', 'noopener,noreferrer');
    }
  });
})();
