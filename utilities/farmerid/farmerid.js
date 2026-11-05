(function setupFarmerIdLogic() {
  document.addEventListener('click', function (e) {
    // 1. AgriStack / Digital Farmer Registry New Registration
    if (e.target && e.target.id === 'farmeridRegBtn') {
      window.open('https://agristack.gov.in/', '_blank', 'noopener,noreferrer');
    }
    // 2. Farmer ID Status Check / Card Download Portal
    if (e.target && e.target.id === 'farmeridStatusBtn') {
      window.open('https://pmkisan.gov.in/', '_blank', 'noopener,noreferrer');
    }
  });
})();
