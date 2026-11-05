// utilities/organic/organic.js
(function setupOrganicLogic() {
  document.addEventListener('click', function (e) {
    // 1. కేంద్ర ప్రభుత్వ జైవిక్ ఖేతీ అధికారిక ఈ-కామర్స్ & ఆర్గానిక్ పోర్టల్
    if (e.target && e.target.id === 'jaivikKhetiBtn') {
      window.open('https://www.jaivikkheti.in/', '_blank', 'noopener,noreferrer');
    }
    // 2. నేషనల్ మిషన్ ఆన్ నేచురల్ ఫార్మింగ్ అధికారిక పోర్టల్
    if (e.target && e.target.id === 'naturalFarmingBtn') {
      window.open('https://naturalfarming.dac.gov.in/', '_blank', 'noopener,noreferrer');
    }
  });
})();
