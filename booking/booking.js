// booking/booking.js - Dedicated Smart Vehicle Booking Engine
window.BookingModule = {
  mode: 'SPOT',
  userLiveCoords: null,

  openModal: function() {
    let modal = document.getElementById('farmer-booking-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'farmer-booking-modal';
    modal.className = 'booking-modal-overlay';

    modal.innerHTML = `
      <div class="booking-modal-card">
        <button onclick="window.BookingModule.closeModal()" class="booking-close-btn">✕</button>
        
        <div class="booking-modal-header">
          <h3 class="booking-modal-title">🚜 వాహనం / యంత్రం బుకింగ్</h3>
          <p class="booking-modal-subtitle">మీ పొలం వద్దకే నేరుగా వాహనాన్ని రప్పించుకోండి</p>
        </div>

        <div class="booking-mode-toggle">
          <button id="btn-mode-spot" type="button" onclick="window.BookingModule.setMode('SPOT')" class="booking-mode-btn active">
            ⚡ వెంటనే కావాలి (Spot)
          </button>
          <button id="btn-mode-adv" type="button" onclick="window.BookingModule.setMode('ADVANCE')" class="booking-mode-btn">
            📅 అడ్వాన్స్ బుకింగ్ (Advance)
          </button>
        </div>

        <div id="gps-status-box" class="gps-status-box">
          <span>📍 లైవ్ లొకేషన్: <b id="gps-text">గుర్తిస్తోంది...</b></span>
          <button type="button" onclick="window.BookingModule.fetchGPS()" class="gps-refresh-btn">రీఫ్రెష్</button>
        </div>

        <form onsubmit="window.BookingModule.handleConfirmBooking(event)">
          <div class="provider-form-group">
            <label class="provider-form-label">వాహనం / పరికరం ఎంచుకోండి:</label>
            <select id="book-veh-type" required class="provider-form-input">
              <option value="ట్రాక్టర్ (దుక్కి / రోటవేటర్)">ట్రాక్టర్ (దుక్కి / రోటవేటర్ / కల్టివేటర్)</option>
              <option value="హార్వెస్టర్ (వరి / మొక్కజొన్న కోత)">హార్వెస్టర్ (వరి / మొక్కజొన్న కోత మిషన్)</option>
              <option value="బొలెరో / DCM రవాణా వాహనం">బొలెరో / DCM రవాణా వాహనం</option>
              <option value="ట్రాక్టర్ ట్రాలీ (ధాన్యం రవాణా)">ట్రాక్టర్ ట్రాలీ (ధాన్యం రవాణా)</option>
              <option value="ఆటో ట్రాలీ (చిన్న లోడ్లు)">ఆటో ట్రాలీ (చిన్న లోడ్లు)</option>
              <option value="డ్రోన్ స్ప్రేయర్ (పురుగు మందుల పిచికారీ)">డ్రోన్ స్ప్రేయర్ (పురుగు మందుల పిచికారీ)</option>
            </select>
          </div>

          <div class="provider-form-group">
            <label class="provider-form-label">పని పరిమాణం (ఎకరాలు / ట్రిప్పులు / బస్తాలు):</label>
            <input type="text" id="book-work-size" placeholder="ఉదా: 2 ఎకరాలు దుక్కి లేదా 50 బస్తాల లోడ్" required class="provider-form-input" />
          </div>

          <div id="advance-fields-container" class="advance-fields-box">
            <div class="advance-field-group">
              <label class="advance-label">ఏ రోజున కావాలి (తేదీ):</label>
              <input type="date" id="book-date" class="advance-input" />
            </div>
            <div class="advance-field-group last">
              <label class="advance-label">సమయం (Time):</label>
              <input type="time" id="book-time" class="advance-input" />
            </div>
          </div>

          <button id="book-submit-btn" type="submit" class="booking-submit-btn">
            ⚡ వెంటనే దగ్గరలోని వాహనాలకు రిక్వెస్ట్ పంపండి ➔
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    this.fetchGPS();
  },

  closeModal: function() {
    const modal = document.getElementById('farmer-booking-modal');
    if (modal) modal.remove();
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
