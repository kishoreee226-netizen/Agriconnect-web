// utilities/organic/organic.js
(function setupOrganicLogic() {
  document.addEventListener('click', function (e) {
    // 1. APEDA అధికారిక ఆర్గానిక్ సర్టిఫికేషన్ పోర్టల్ (Valid SSL)
    if (e.target && e.target.id === 'jaivikKhetiBtn') {
      window.open('https://apeda.gov.in/', '_blank', 'noopener,noreferrer');
    }
    // 2. నేషనల్ మిషన్ ఆన్ నేచురల్ ఫార్మింగ్ అధికారిక పోర్టల్
    if (e.target && e.target.id === 'naturalFarmingBtn') {
      window.open('https://naturalfarming.dac.gov.in/', '_blank', 'noopener,noreferrer');
    }
  });
})();
