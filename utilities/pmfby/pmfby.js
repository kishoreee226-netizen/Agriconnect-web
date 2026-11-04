(function setupPmfbyLogic() {
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'pmfbyCalcBtn') {
      // Official PMFBY Premium Calculator portal
      window.open('https://pmfby.gov.in/premiumCalculator', '_blank');
    }
    
    if (e.target && e.target.id === 'pmfbyClaimBtn') {
      // Official PMFBY Claim Status portal
      window.open('https://pmfby.gov.in/claimStatus', '_blank');
    }
  });
})();
