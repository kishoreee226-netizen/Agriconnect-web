(function setupMandiLogic() {
  document.addEventListener('click', function (e) {
    // 1. National Agriculture Market (e-NAM) Live Prices
    if (e.target && e.target.id === 'mandiLiveBtn') {
      window.open('https://enam.gov.in/web/dashboard/trade-data', '_blank', 'noopener,noreferrer');
    }
    // 2. Agmarknet Daily Wholesale Prices & Trends
    if (e.target && e.target.id === 'mandiAgmarkBtn') {
      window.open('https://agmarknet.gov.in/', '_blank', 'noopener,noreferrer');
    }
  });
})();
