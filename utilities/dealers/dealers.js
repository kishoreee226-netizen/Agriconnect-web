(function setupDealersLogic() {
  document.addEventListener('click', function (e) {
    // 1. Official Authorized Dealers Directory
    if (e.target && e.target.id === 'dealersFindBtn') {
      window.open('https://fert.nic.in/', '_blank', 'noopener,noreferrer');
    }
    // 2. Integrated Fertilizer Management System (Stock, DBT & Online Quota)
    if (e.target && e.target.id === 'dealersStockBtn') {
      window.open('https://urvarak.nic.in/', '_blank', 'noopener,noreferrer');
    }
  });
})();
