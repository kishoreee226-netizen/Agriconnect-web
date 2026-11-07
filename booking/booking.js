// booking/booking.js - Dedicated Smart Vehicle Booking Engine
window.BookingModule = {
  mode: 'SPOT',
  userLiveCoords: null,

  openModal: function() {
    const modal = document.getElementById('farmer-booking-modal');
    if (!modal) {
      console.warn("Booking modal DOM not loaded yet.");
      return;
    }

    // ఫారం రీసెట్ & డీఫాల్ట్ SPOT మోడ్ సెట్ చేయడం
    const form = document.getElementById('farmer-booking-form');
    if (form) form.reset();
    this.setMode('SPOT');

    modal.style.display = 'flex';
    this.fetchGPS();
  },

  closeModal: function() {
    const modal = document.getElementById('farmer-booking-modal');
    if (modal) modal.style.display = 'none';
  },

  setMode: function(targetMode) {
    this.mode = targetMode;
    const spotBtn = document.getElementById('btn-mode-spot');
    const advBtn = document.getElementById('btn-mode-adv');
    const advFields = document.getElementById('advance-fields-container');
    const submitBtn = document.getElementById('book-submit-btn');

    if (targetMode === 'SPOT') {
      if (spotBtn) spotBtn.classList.add('active');
      if (advBtn) advBtn.classList.remove('active');
      if (advFields) advFields.style.display = 'none';
      if (submitBtn) {
        submitBtn.style.setProperty('--booking-theme', '#f57c00');
        submitBtn.innerHTML = '⚡ వెంటనే దగ్గరలోని వాహనాలకు రిక్వెస్ట్ పంపండి ➔';
      }
    } else {
      if (advBtn) advBtn.classList.add('active');
      if (spotBtn) spotBtn.classList.remove('active');
      if (advFields) advFields.style.display = 'block';
      if (submitBtn) {
        submitBtn.style.setProperty('--booking-theme', '#4338ca');
        submitBtn.innerHTML = '📅 అడ్వాన్స్ బుకింగ్ కన్ఫర్మ్ చేయండి ➔';
      }
    }
  },

  fetchGPS: function() {
    const txt = document.getElementById('gps-text');
    if (!navigator.geolocation) {
      if (txt) txt.innerText = "GPS అందుబాటులో లేదు";
      return;
    }
    if (txt) txt.innerText = "లొకేషన్ తీసుకుంటోంది...";

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userLiveCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        if (txt) txt.innerText = "ఖచ్చితమైన లొకేషన్ దొరికింది ✅";
      },
      () => {
        if (txt) txt.innerText = "GPS ఆఫ్ చేయబడింది (డిఫాల్ట్ గ్రామం వర్తిస్తుంది)";
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  },

  handleConfirmBooking: function(e) {
    e.preventDefault();
    const vehType = document.getElementById('book-veh-type').value;
    const workSize = document.getElementById('book-work-size').value.trim();
    const dateVal = document.getElementById('book-date')?.value || '';
    const timeVal = document.getElementById('book-time')?.value || '';

    const user = window.AppState?.userProfile || {};
    const farmerName = user.name || 'రైతు';
    const farmerPhone = user.phone || '';
    const village = user.village || '';

    if (!farmerPhone) {
      alert("దయచేసి మీ మొబైల్ నంబర్‌తో ముందుగా లాగిన్ అవ్వండి.");
      return;
    }

    const mapLink = this.userLiveCoords ? `https://www.google.com/maps?q=${this.userLiveCoords.lat},${this.userLiveCoords.lng}` : '';

    const newBooking = {
      id: 'REQ_' + Date.now(),
      type: this.mode,
      vehicleType: vehType,
      workSize: workSize,
      schedule: this.mode === 'SPOT' ? 'తక్షణమే (Spot)' : `${dateVal} సమయం: ${timeVal}`,
      farmerName: farmerName,
      farmerPhone: farmerPhone,
      village: village,
      mapLink: mapLink,
      status: 'PENDING',
      acceptedBy: null,
      createdAt: new Date().toLocaleTimeString()
    };

    let allBookings = JSON.parse(localStorage.getItem('agri_active_bookings') || '[]');
    allBookings.unshift(newBooking);
    localStorage.setItem('agri_active_bookings', JSON.stringify(allBookings));

    this.closeModal();

    const timingText = this.mode === 'SPOT' ? '⚡ తక్షణమే (Emergency Spot Booking)' : `📅 తేది: ${dateVal} సమయం: ${timeVal}`;
    const alertMsg = `🌾 *AgriConnect రైతు వాహన రిక్వెస్ట్:*\n` +
      `👤 రైతు పేరు: ${farmerName} (${village})\n` +
      `📞 ఫోన్: ${farmerPhone}\n` +
      `🚜 కావాల్సిన వాహనం: ${vehType}\n` +
      `📐 పని పరిమాణం: ${workSize}\n` +
      `⏰ సమయం: ${timingText}\n` +
      (mapLink ? `📍 పొలం లైవ్ గూగుల్ మ్యాప్: ${mapLink}\n` : '') +
      `\nఈ వాహనం మీకు అందుబాటులో ఉంటే వెంటనే రైతుకు కాల్ చేసి కన్ఫర్మ్ చేయండి!`;

    const waShare = `https://wa.me/?text=${encodeURIComponent(alertMsg)}`;
    window.open(waShare, '_blank');

    alert('మీ రిక్వెస్ట్ నమోదు చేయబడింది! దగ్గరలోని యజమానుల డ్యాష్‌బోర్డ్‌కు పంపబడింది.');
    if (typeof window.renderFarmerWidgetWithLiveProviders === 'function') {
      window.renderFarmerWidgetWithLiveProviders();
    }
  }
};

// Global Backwards Compatibility
window.openFarmerVehicleBookingModal = function() { window.BookingModule.openModal(); };
window.closeFarmerBookingModal = function() { window.BookingModule.closeModal(); };
window.setBookingMode = function(mode) { window.BookingModule.setMode(mode); };
window.fetchRhythuLiveGPS = function() { window.BookingModule.fetchGPS(); };
window.handleConfirmBookingRequest = function(e) { window.BookingModule.handleConfirmBooking(e); };
