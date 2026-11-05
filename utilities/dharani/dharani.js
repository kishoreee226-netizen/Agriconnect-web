(function setupDharaniLogic() {
  document.addEventListener('click', function (e) {
    // 1. Telangana Land Records (CCLA Official Portal)
    if (e.target && e.target.id === 'dharaniTelanganaBtn') {
      window.open('https://ccla.telangana.gov.in/', '_blank', 'noopener,noreferrer');
    }
    // 2. All India Central Land Records Directory (Digital India Land Records)
    if (e.target && e.target.id === 'dharaniAllStatesBtn') {
      window.open('https://dilrmp.gov.in/', '_blank', 'noopener,noreferrer');
    }
  });
})();
