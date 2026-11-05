// utilities/dealers/dealers.js
(function setupDealersLogic() {
  document.addEventListener('click', function (e) {
    // 1. Kisan Suvidha Central Agriculture Portal (Working Root)
    if (e.target && e.target.id === 'dealersFindBtn') {
      window.open('https://kisansuvidha.gov.in/', '_blank', 'noopener,noreferrer');
    }
    // 2. IFFCO Bazar Official Farmer Portal (Without www)
    if (e.target && e.target.id === 'dealersStockBtn') {
      window.open('https://iffcobazar.in/', '_blank', 'noopener,noreferrer');
    }
  });
})();
