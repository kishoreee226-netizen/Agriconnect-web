(function setupWarehouseLogic() {
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'cwcStorageBtn') {
      // Central Warehousing Corporation Locator
      window.open('https://cewacor.nic.in/', '_blank');
    }

    if (e.target && e.target.id === 'wdraStorageBtn') {
      // WDRA Registered Warehouses Portal
      window.open('https://wdra.gov.in/', '_blank');
    }
  });
})();
