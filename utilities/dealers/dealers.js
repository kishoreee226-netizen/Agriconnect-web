// utilities/dealers/dealers.js
(function setupDealersLogic() {
  document.addEventListener('click', function (e) {
    // 1. Kisan Suvidha Central Agriculture Portal (Working Root)
    if (e.target && e.target.id === 'dealersFindBtn') {
      window.open('https://kisansuvidha.gov.in/', '_blank', 'noopener,noreferrer');
    }
    // 2. National Seeds & Fertilizer Government Portal (Working Government Domain)
    if (e.target && e.target.id === 'dealersStockBtn') {
      window.open('https://www.indiaseeds.com/', '_blank', 'noopener,noreferrer');
    }
  });
})();
