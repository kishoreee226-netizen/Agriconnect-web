(function setupPmkisanLogic() {
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'pmkisanStatusBtn') {
      window.open('https://pmkisan.gov.in/BeneficiaryStatus_New.aspx', '_blank', 'noopener,noreferrer');
    }
    if (e.target && e.target.id === 'pmkisanKycBtn') {
      window.open('https://exlink.pmkisan.gov.in/aadharekyc.aspx', '_blank', 'noopener,noreferrer');
    }
  });
})();
