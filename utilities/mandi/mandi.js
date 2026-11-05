// utilities/mandi/mandi.js
(function setupMandiLogic() {
  document.addEventListener('click', function (e) {
    // 1. Agmarknet 2.0 లైవ్ మార్కెట్ ధరలు (Working)
    if (e.target && e.target.id === 'mandiLiveBtn') {
      window.open('https://agmarknet.gov.in/', '_blank', 'noopener,noreferrer');
    }
    // 2. భారత ప్రభుత్వ అధికారిక అగ్రికల్చర్ పోర్టల్ (India.gov.in - Guaranteed Working)
    if (e.target && e.target.id === 'mandiAgmarkBtn') {
      window.open('https://www.india.gov.in/topics/agriculture', '_blank', 'noopener,noreferrer');
    }
  });
})();
