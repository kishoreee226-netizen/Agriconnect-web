// utilities/mandi/mandi.js
(function setupMandiLogic() {
  document.addEventListener('click', function (e) {
    // 1. కేంద్ర వ్యవసాయ & రైతు సంక్షేమ శాఖ అధికారిక పోర్టల్ (100% Working)
    if (e.target && e.target.id === 'mandiLiveBtn') {
      window.open('https://farmer.gov.in/', '_blank', 'noopener,noreferrer');
    }
    // 2. Agmarknet 2.0 లైవ్ మార్కెట్ ధరల శోధన (Working)
    if (e.target && e.target.id === 'mandiAgmarkBtn') {
      window.open('https://agmarknet.gov.in/', '_blank', 'noopener,noreferrer');
    }
  });
})();
