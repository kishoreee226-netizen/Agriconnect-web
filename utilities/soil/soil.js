// utilities/soil/soil.js
(function setupSoilLogic() {
  document.addEventListener('click', function (e) {
    // 1. Official Soil Health Card Portal (Farmer Login & Downloads)
    if (e.target && e.target.id === 'soilCardBtn') {
      window.open('https://soilhealth.dac.gov.in', '_blank', 'noopener,noreferrer');
    }
    // 2. National Agriculture Portal - Soil Health & Lab Services
    if (e.target && e.target.id === 'soilSampleBtn') {
      window.open('https://www.india.gov.in/spotlight/soil-health-card#tab=tab-1', '_blank', 'noopener,noreferrer');
    }
  });
})();
