// utilities/dealers/dealers.js
(function setupDealersLogic() {
  document.addEventListener('click', function (e) {
    // 1. Direct Dealer Directory (Kisan Suvidha Dealer Locator)
    if (e.target && e.target.id === 'dealersFindBtn') {
      window.open('https://kisansuvidha.gov.in/dealer.aspx', '_blank', 'noopener,noreferrer');
    }
    // 2. Official Fertilizer Booking (IFFCO Bazar)
    if (e.target && e.target.id === 'dealersStockBtn') {
      window.open('https://www.iffcobazar.in/', '_blank', 'noopener,noreferrer');
    }
  });
})();
