(function setupSoilLogic() {
  document.addEventListener('click', function (e) {
    // Official Soil Health Card Farmer Corner
    if (e.target && e.target.id === 'soilCardBtn') {
      window.open('https://soilhealth.dac.gov.in/farmer-corner', '_blank');
    }
    // Track Sample Status / Lab search
    if (e.target && e.target.id === 'soilSampleBtn') {
      window.open('https://soilhealth.dac.gov.in/track-sample', '_blank');
    }
  });
})();
