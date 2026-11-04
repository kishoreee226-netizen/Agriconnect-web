(function setupChcLogic() {
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'chcFarmsBtn') {
      // Official Central Govt FARMS Portal
      window.open('https://farms.dac.gov.in/', '_blank');
    }
  });
})();
