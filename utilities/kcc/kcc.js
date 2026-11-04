(function setupKccLogic() {
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'kccPortalBtn') {
      window.open('https://myscheme.gov.in/schemes/kcc', '_blank', 'noopener,noreferrer');
    }
    if (e.target && e.target.id === 'kccGuideBtn') {
      window.open('https://www.rbi.org.in/', '_blank', 'noopener,noreferrer');
    }
  });
})();
