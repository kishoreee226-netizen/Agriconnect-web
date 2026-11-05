// utilities/mandi/mandi.js
(function setupMandiLogic() {
  document.addEventListener('click', function (e) {
    // 1. Direct Agmarknet Live Commodity Price Bulletin (No Loading Freeze)
    if (e.target && e.target.id === 'mandiLiveBtn') {
      window.open('https://agmarknet.gov.in/PriceTrends/SA_Pri_Month.aspx', '_blank', 'noopener,noreferrer');
    }
    // 2. Agmarknet 2.0 Daily Wholesale Prices & Trends
    if (e.target && e.target.id === 'mandiAgmarkBtn') {
      window.open('https://agmarknet.gov.in/', '_blank', 'noopener,noreferrer');
    }
  });
})();
