// utilities/mandi/mandi.js
(function setupMandiLogic() {
  document.addEventListener('click', function (e) {
    // 1. Agmarknet 2.0 లైవ్ మార్కెట్ ధరల శోధన (100% Working)
    if (e.target && e.target.id === 'mandiLiveBtn') {
      window.open('https://agmarknet.gov.in/', '_blank', 'noopener,noreferrer');
    }
    // 2. కేంద్ర వ్యవసాయ & రైతు సంక్షేమ మంత్రిత్వ శాఖ (NIC Portal)
    if (e.target && e.target.id === 'mandiAgmarkBtn') {
      window.open('https://agricoop.nic.in/', '_blank', 'noopener,noreferrer');
    }
  });
})();
