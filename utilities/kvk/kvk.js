// utilities/kvk/kvk.js
(function setupKvkLogic() {
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'kvkPortalBtn') {
      // ICAR Krishi Vigyan Kendra Portal
      window.open('https://icar.org.in/krishi-vigyan-kendras', '_blank');
    }
  });
})();
