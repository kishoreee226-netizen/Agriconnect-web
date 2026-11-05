// utilities/mandi/mandi.js
(function setupMandiLogic() {
  document.addEventListener('click', function (e) {
    // 1. National Agriculture Market (e-NAM) Official Portal
    if (e.target && e.target.id === 'mandiLiveBtn') {
      window.open('https://enam.gov.in/', '_blank', 'noopener,noreferrer');
    }
    // 2. Agmarknet 2.0 Live Price Search Portal
    if (e.target && e.target.id === 'mandiAgmarkBtn') {
      window.open('https://agmarknet.gov.in/', '_blank', 'noopener,noreferrer');
    }
  });
})();
