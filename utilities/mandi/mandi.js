// utilities/mandi/mandi.js
(function setupMandiLogic() {
  document.addEventListener('click', function (e) {
    // 1. Agmarknet 2.0 లైవ్ మార్కెట్ ధరలు (Working)
    if (e.target && e.target.id === 'mandiLiveBtn') {
      window.open('https://agmarknet.gov.in/', '_blank', 'noopener,noreferrer');
    }
    // 2. PM కిసాన్ మాన్‌ధన్ యోజన అధికారిక పోర్టల్
    if (e.target && e.target.id === 'mandiMandhanBtn') {
      window.open('https://maandhan.in/', '_blank', 'noopener,noreferrer');
    }
  });
})();
