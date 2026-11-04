// utilities/chc/chc.js
(function setupChcLogic() {
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'chcFarmsBtn') {
      // Official Central Govt Farm Machinery & CHC portal
      window.open('https://agrimachinery.nic.in/', '_blank');
    }
  });
})();
