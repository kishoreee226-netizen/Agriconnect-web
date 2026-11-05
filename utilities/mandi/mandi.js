// utilities/mandi/mandi.js
(function setupMandiLogic() {
  document.addEventListener('click', function (e) {
    // 1. Direct Working e-NAM Live Commodity Price Portal
    if (e.target && e.target.id === 'mandiLiveBtn') {
      window.open('https://enam.gov.in/web/dashboard/trade-data', '_blank', 'noopener,noreferrer');
    }
    // 2. Agmarknet Daily Wholesale Prices & Trends
    if (e.target && e.target.id === 'mandiAgmarkBtn') {
      window.open('https://agmarknet.gov.in/', '_blank', 'noopener,noreferrer');
    }
  });
})();
