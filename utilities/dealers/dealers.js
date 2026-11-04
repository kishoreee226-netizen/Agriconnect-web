(function setupDealersLogic() {
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'dealersFindBtn') {
      window.open('https://fert.nic.in/', '_blank', 'noopener,noreferrer');
    }
    if (e.target && e.target.id === 'dealersMrpBtn') {
      window.open('https://urvarak.nic.in/', '_blank', 'noopener,noreferrer');
    }
  });
})();
