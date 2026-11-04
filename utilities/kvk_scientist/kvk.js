(function setupKvkLogic() {
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'kvkPortalBtn') {
      // Official ICAR KVK Portal
      window.open('https://kvk.icar.gov.in/', '_blank');
    }
  });
})();
