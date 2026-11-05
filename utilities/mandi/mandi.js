// utilities/mandi/mandi.js
(function setupMandiLogic() {
  document.addEventListener('click', function (e) {
    // 1. తెలంగాణ లైవ్ మార్కెట్ యార్డ్ ధరలు (TS Agricultural Marketing Department)
    if (e.target && e.target.id === 'mandiLiveBtn') {
      window.open('https://tsmarketing.telangana.gov.in/', '_blank', 'noopener,noreferrer');
    }
    // 2. కేంద్ర ప్రభుత్వ అగ్రిమార్కెట్ నివేదిక (Agmarknet 2.0)
    if (e.target && e.target.id === 'mandiAgmarkBtn') {
      window.open('https://agmarknet.gov.in/', '_blank', 'noopener,noreferrer');
    }
  });
})();
