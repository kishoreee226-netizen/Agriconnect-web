// utilities/dealers/dealers.js
(function setupDealersLogic() {
  document.addEventListener('click', function (e) {
    // 1. Department of Fertilizers - Working Official Portal (.gov.in)
    if (e.target && e.target.id === 'dealersFindBtn') {
      window.open('https://fert.gov.in/', '_blank', 'noopener,noreferrer');
    }
    // 2. Public DBT Fertilizer Report & Stock Availability Dashboard
    if (e.target && e.target.id === 'dealersStockBtn') {
      window.open('https://urvarak.nic.in/opendata', '_blank', 'noopener,noreferrer');
    }
  });
})();
