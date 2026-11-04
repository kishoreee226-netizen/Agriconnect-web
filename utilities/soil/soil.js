// utilities/soil/soil.js
(function setupSoilLogic() {
  document.addEventListener('click', function (e) {
    // 1. Soil Health Card Main Portal
    if (e.target && e.target.id === 'soilCardBtn') {
      window.open('https://soilhealth.dac.gov.in/', '_blank');
    }
    // 2. Working Official Dashboard / Services Link
    if (e.target && e.target.id === 'soilSampleBtn') {
      window.open('https://soilhealth.dac.gov.in/home', '_blank');
    }
  });
})();
