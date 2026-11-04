(function setupDharaniLogic() {
  function handleSearch() {
    const input = document.getElementById('dharaniSearchInput');
    const notice = document.getElementById('dharaniNotice');
    if (!input) return;

    const query = input.value.trim();
    if (!query) {
      if (notice) notice.innerText = 'దయచేసి సర్వే లేదా ఖాతా నంబరు నమోదు చేయండి';
      return;
    }

    if (notice) notice.innerText = '';
    // Official Dharani Portal launch
    window.open(`https://dharani.telangana.gov.in/knowLandStatus?query=${encodeURIComponent(query)}`, '_blank');
  }

  // Event Listeners (Event delegation to ensure elements are loaded)
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'dharaniSearchBtn') {
      handleSearch();
    }
  });

  document.addEventListener('keypress', function (e) {
    if (e.target && e.target.id === 'dharaniSearchInput' && e.key === 'Enter') {
      handleSearch();
    }
  });
})();
