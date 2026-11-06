// tools/crop-doctor/crop-doctor-loader.js
(async function initCropDoctorSubModule() {
  const dir = 'tools/crop-doctor/';

  if (!document.getElementById('crop-doctor-style')) {
    const link = document.createElement('link');
    link.id = 'crop-doctor-style';
    link.rel = 'stylesheet';
    link.href = `${dir}crop-doctor.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  try {
    const res = await fetch(`${dir}crop-doctor.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlText;

      const cardSlot = document.getElementById('slot-tool-crop-doctor');
      const cardContent = tempDiv.querySelector('.crop-doctor-card-content');
      if (cardSlot && cardContent) {
        cardSlot.innerHTML = '';
        cardSlot.appendChild(cardContent);
      }

      const modalSlot = document.getElementById('view-crop_doctor');
      const panelContent = tempDiv.querySelector('.crop-doctor-modal-panel');
      if (modalSlot && panelContent) {
        modalSlot.innerHTML = '';
        modalSlot.appendChild(panelContent);
      }

      const script = document.createElement('script');
      script.src = `${dir}crop-doctor.js?v=${Date.now()}`;
      document.body.appendChild(script);
    }
  } catch (err) {
    console.error('Crop Doctor tool component load failed:', err);
  }
})();
