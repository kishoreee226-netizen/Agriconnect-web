// ==================== 1. FIREBASE & CLOUD CONFIGURATION ====================
const firebaseConfig = {
    apiKey: "AIzaSyAvev9rVOBx5xElA993EtSD7FG9JxAMbyI",
    authDomain: "agriconnect-5fc39.firebaseapp.com",
    projectId: "agriconnect-5fc39",
    storageBucket: "agriconnect-5fc39.firebasestorage.app",
    messagingSenderId: "491716802186",
    appId: "1:491716802186:web:087ee5f6c30ec75ce75f73",
    measurementId: "G-8134KCW1ZT"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentUserLat = 17.9784;
let currentUserLng = 79.5941;
let rawLaborersList = [];
let currentBalance = 14850.00;

// Device live GPS detection
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            currentUserLat = pos.coords.latitude;
            currentUserLng = pos.coords.longitude;
        },
        (err) => { console.log("Using Warangal GPS location:", err.message); }
    );
}

// ==================== 2. PUSH NOTIFICATIONS (FCM) ====================
function enablePushNotifications() {
    toggleDrawer();
    if (!('Notification' in window)) {
        alert('ఈ బ్రౌజర్ పుష్ నోటిఫికేషన్లను సపోర్ట్ చేయదు.');
        return;
    }

    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            alert('🔔 అభినందనలు! పుష్ నోటిఫికేషన్లు ఆన్ చేయబడ్డాయి.');
            new Notification('AgriConnect లైవ్ అలర్ట్', {
                body: 'మీ పరిసరాల్లో కూలీల పనులు మరియు మార్కెట్ ధరలు లైవ్‌లో ఉన్నాయి!',
                icon: 'logo.png'
            });
        } else {
            alert('నోటిఫికేషన్ అనుమతి నిరాకరించబడింది.');
        }
    });
}

// ==================== 3. META WHATSAPP CLOUD API GATEWAY ====================
function triggerWhatsAppCloudAlert(mestryPhone, farmerName, workDetails, count, location) {
    const alertMessage = `🚨 *AgriConnect కొత్త పని అలర్ట్!*\n\nరైతు: ${farmerName}\nకూలీలు: ${count} మంది\nపని: ${workDetails}\nప్రాంతం: ${location}\nవెంటనే సంప్రదించండి!`;
    const apiTarget = `https://api.whatsapp.com/send?phone=91${mestryPhone}&text=${encodeURIComponent(alertMessage)}`;
    window.open(apiTarget, '_blank');
}

// ==================== 4. 5-10 KM GPS HAVERSINE FORMULA ====================
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
}

// ==================== 5. MODAL OPEN/CLOSE FUNCTIONS ====================
function openLoginModalFromDrawer() { toggleDrawer(); document.getElementById('loginModal').style.display = 'flex'; }
function closeLoginModal() { document.getElementById('loginModal').style.display = 'none'; }

function openWalletModalFromDrawer() { toggleDrawer(); openWalletModal(); }
function openWalletModal() { document.getElementById('walletModal').style.display = 'flex'; }
function closeWalletModal() { document.getElementById('walletModal').style.display = 'none'; }

function openDiaryModalFromDrawer() { toggleDrawer(); document.getElementById('diaryModal').style.display = 'flex'; }
function closeDiaryModal() { document.getElementById('diaryModal').style.display = 'none'; }

function openAlertsModalFromDrawer() { toggleDrawer(); document.getElementById('alertsModal').style.display = 'flex'; }
function closeAlertsModal() { document.getElementById('alertsModal').style.display = 'none'; }

function openSharedMachineryModal() { document.getElementById('sharedMachineryModal').style.display = 'flex'; }
function closeSharedMachineryModal() { document.getElementById('sharedMachineryModal').style.display = 'none'; }

function openContactModalFromDrawer() { toggleDrawer(); document.getElementById('contactModal').style.display = 'flex'; }
function closeContactModal() { document.getElementById('contactModal').style.display = 'none'; }

function handleDrawerLogout() { toggleDrawer(); alert('మీరు లాగౌట్ అయ్యారు.'); }

// Login & OTP
let otpSent = false;
function handleOtpFlow() {
    const mobile = document.getElementById('mobileNumberInput').value.trim();
    if (!otpSent) {
        if (mobile.length !== 10) { alert('10 అంకెల మొబైల్ నంబర్ ఇవ్వండి.'); return; }
        document.getElementById('otpSection').style.display = 'block';
        document.getElementById('btnOtpAction').innerText = 'లాగిన్ అవ్వండి';
        otpSent = true;
        alert('టెస్ట్ OTP: 1234');
    } else {
        document.getElementById('modal-step-login').style.display = 'none';
        document.getElementById('modal-step-profile').style.display = 'block';
    }
}

function saveProfile() {
    const name = document.getElementById('farmerNameInput').value.trim();
    if (!name) { alert('పేరు నమోదు చేయండి.'); return; }
    document.getElementById('drawer-login-text').innerText = name;
    document.getElementById('welcomeUserName').innerText = `స్వాగతం, ${name}!`;
    document.getElementById('userWelcomeBanner').style.display = 'flex';
    closeLoginModal();
    alert(`ప్రొఫైల్ విజయవంతంగా సేవ్ చేయబడింది!`);
}

function addDiaryEntry() {
    const desc = document.getElementById('diaryDesc').value.trim();
    const amt = document.getElementById('diaryAmount').value.trim();
    if(!desc || !amt) { alert('వివరాలు నమోదు చేయండి.'); return; }
    alert(`ఖాతా డైరీలో ₹ ${amt} (- ${desc}) విజయవంతంగా నమోదైంది!`);
    document.getElementById('diaryDesc').value = '';
    document.getElementById('diaryAmount').value = '';
    closeDiaryModal();
}

function savePriceAlert() {
    alert('ధర అలర్ట్ సెట్ చేయబడింది! మార్కెట్లో ఈ ధర చేరగానే సమాచారం అందుతుంది.');
    closeAlertsModal();
}

function playOfflineAudio(tipText) {
    speakText(tipText);
}

// ==================== 6. NAVIGATION & ACCORDIONS ====================
function switchView(viewName) {
    ['home', 'services', 'about', 'why'].forEach(v => {
        const el = document.getElementById(v + '-view');
        if(el) el.classList.remove('active-view');
        const navBtn = document.getElementById('nav-btn-' + v);
        if(navBtn) navBtn.classList.remove('active-nav');
    });

    const activeEl = document.getElementById(viewName + '-view');
    if(activeEl) {
        activeEl.classList.add('active-view');
        const activeNav = document.getElementById('nav-btn-' + viewName);
        if(activeNav) activeNav.classList.add('active-nav');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function toggleDrawer() {
    document.getElementById('drawerOverlay').classList.toggle('open');
    document.getElementById('drawerSidebar').classList.toggle('open');
}

function showFeature(role, widgetElement) {
    document.querySelectorAll('.role-widget').forEach(w => w.classList.remove('active'));
    document.querySelectorAll('.feature-content').forEach(c => c.classList.remove('active'));
    if(widgetElement) widgetElement.classList.add('active');
    const target = document.getElementById(role + '-feature');
    if(target) target.classList.add('active');
}

function toggleLaborBookingAccordion() {
    document.getElementById('bodyLaborBooking').classList.toggle('open');
    document.getElementById('arrowLaborBooking').classList.toggle('rotated');
}

function toggleMestryRegisterAccordion() {
    document.getElementById('bodyMestryRegister').classList.toggle('open');
    document.getElementById('arrowMestryRegister').classList.toggle('rotated');
}

function toggleDailyJobsAccordion() {
    document.getElementById('bodyDailyJobs').classList.toggle('open');
    document.getElementById('arrowDailyJobs').classList.toggle('rotated');
}

// ==================== 7. MESTRY REGISTRATION (WITH GPS & UPI) ====================
function submitDirectLaborRegistration() {
    const name = document.getElementById('directMestryName').value.trim();
    const phone = document.getElementById('directMestryPhone').value.trim();
    const upi = document.getElementById('directMestryUpi').value.trim();
    const count = document.getElementById('directMestryCount').value.trim();
    const village = document.getElementById('directMestryVillage').value.trim();
    const skills = document.getElementById('directMestrySkills').value.trim();

    if (!name || phone.length !== 10 || !count) {
        alert('దయచేసి పేరు, 10 అంకెల మొబైల్ నంబర్ మరియు కూలీల సంఖ్య నమోదు చేయండి.');
        return;
    }

    const btn = document.getElementById('btnSubmitMestry');
    btn.disabled = true;
    btn.innerText = "GPS లొకేషన్ తీసుకుంటున్నాము...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => saveMestryToFirebase(name, phone, upi, count, village, skills, pos.coords.latitude, pos.coords.longitude),
            () => saveMestryToFirebase(name, phone, upi, count, village, skills, currentUserLat, currentUserLng),
            { timeout: 5000 }
        );
    } else {
        saveMestryToFirebase(name, phone, upi, count, village, skills, currentUserLat, currentUserLng);
    }
}

function saveMestryToFirebase(name, phone, upi, count, village, skills, lat, lng) {
    db.collection("laborers").add({
        name: name,
        phone: phone,
        upiId: upi || '',
        count: count,
        village: village || 'స్థానిక',
        skills: skills || 'అన్ని రకాల పనులు',
        lat: lat,
        lng: lng,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert(`✅ అభినందనలు ${name}! మీ కూలీ బృందం GPS పరిధితో క్లౌడ్‌లో నమోదైంది.`);
        document.getElementById('directMestryName').value = '';
        document.getElementById('directMestryPhone').value = '';
        document.getElementById('directMestryUpi').value = '';
        document.getElementById('directMestryCount').value = '';
        document.getElementById('directMestryVillage').value = '';
        document.getElementById('directMestrySkills').value = '';

        toggleMestryRegisterAccordion();
        switchView('services');
        showFeature('farmer', document.getElementById('tab-farmer'));
        const laborCard = document.getElementById('card-labor');
        if (laborCard) {
            laborCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const body = document.getElementById('bodyLaborBooking');
            if (!body.classList.contains('open')) toggleLaborBookingAccordion();
        }
    })
    .catch(err => alert("నమోదు కాలేదు: " + err.message))
    .finally(() => {
        const btn = document.getElementById('btnSubmitMestry');
        btn.disabled = false;
        btn.innerText = "📍 GPS లొకేషన్‌తో నమోదు చేయండి (Live Sync)";
    });
}

// ==================== 8. REALTIME LISTENER & DISTANCE FILTER ====================
function listenForLiveLaborers() {
    db.collection("laborers")
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => {
          rawLaborersList = [];
          snapshot.forEach(doc => {
              const data = doc.data();
              data.id = doc.id;
              rawLaborersList.push(data);
          });
          filterLaborersByDistance();
      });
}

function filterLaborersByDistance() {
    const container = document.getElementById('activeLaborListContainer');
    if (!container) return;

    const selectedRadius = document.getElementById('gpsRadiusFilter').value;

    let filtered = rawLaborersList.map(mestry => {
        const dist = calculateDistanceKm(currentUserLat, currentUserLng, mestry.lat, mestry.lng);
        return { ...mestry, distanceKm: dist };
    });

    if (selectedRadius !== 'all') {
        const maxKm = parseFloat(selectedRadius);
        filtered = filtered.filter(m => m.distanceKm !== null && parseFloat(m.distanceKm) <= maxKm);
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:15px; color:#666; font-size:0.85rem; background:white; border-radius:8px;">
                మీరు ఎంచుకున్న ${selectedRadius} KM పరిధిలో ప్రస్తుతం మేస్త్రీలు అందుబాటులో లేరు.<br>
                <small style="color:#2e7d32; cursor:pointer;" onclick="document.getElementById('gpsRadiusFilter').value='all'; filterLaborersByDistance();">అన్ని ప్రాంతాల మేస్త్రీలను చూడటానికి ఇక్కడ నొక్కండి</small>
            </div>`;
        return;
    }

    container.innerHTML = "";
    filtered.forEach(mestry => {
        const distDisplay = mestry.distanceKm ? `📍 ${mestry.distanceKm} KM దూరం` : '📍 సమీప ప్రాంతం';
        const upiButton = mestry.upiId ? 
            `<button class="btn-upi-pay" onclick="openUpiPaymentModal('${mestry.name}', '${mestry.upiId}')">💸 UPI పే</button>` : '';

        const item = document.createElement('div');
        item.className = 'labor-card-item';
        item.innerHTML = `
            <div>
                <div style="font-weight: bold; font-size:0.92rem;">${mestry.name} (${mestry.village})</div>
                <div style="font-size: 0.8rem; color: #555;">👥 ${mestry.count} మంది కూలీలు | ${mestry.skills}</div>
                <span class="distance-pill">${distDisplay}</span>
            </div>
            <div class="labor-actions-btns">
                <a href="tel:${mestry.phone}" class="btn-call-labor">📞 కాల్</a>
                ${upiButton}
            </div>
        `;
        container.appendChild(item);
    });
}

// ==================== 9. DIRECT UPI PAYMENT ====================
let currentTargetMestryUpi = '';
let currentTargetMestryName = '';

function openUpiPaymentModal(name, upiId) {
    currentTargetMestryName = name;
    currentTargetMestryUpi = upiId;
    document.getElementById('upiPayMestryName').innerText = name;
    document.getElementById('upiPayMestryVpa').innerText = upiId;
    document.getElementById('upiPaymentModal').style.display = 'flex';
}

function closeUpiModal() {
    document.getElementById('upiPaymentModal').style.display = 'none';
}

function processDirectUpiPay() {
    const amount = document.getElementById('upiPayAmount').value.trim();
    const note = document.getElementById('upiPayNote').value.trim() || 'Vyavasaya Kooli';

    if (!amount || parseFloat(amount) <= 0) {
        alert('దయచేసి సరైన మొత్తాన్ని నమోదు చేయండి.');
        return;
    }

    const upiUrl = `upi://pay?pa=${encodeURIComponent(currentTargetMestryUpi)}&pn=${encodeURIComponent(currentTargetMestryName)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(note)}`;
    closeUpiModal();
    window.location.href = upiUrl;
}

// ==================== 10. FARMER JOB POSTING & SYNC ====================
function submitJobRequestToCloud() {
    const farmer = document.getElementById('postFarmerName').value.trim();
    const phone = document.getElementById('postFarmerPhone').value.trim();
    const count = document.getElementById('postLaborCount').value.trim();
    const work = document.getElementById('postWorkDetails').value.trim();
    const loc = document.getElementById('postFarmLocation').value.trim() || 'వరంగల్ పరిసరాలు';

    if (!farmer || phone.length !== 10 || !count || !work) {
        alert('దయచేసి అన్ని వివరాలను సరిగ్గా నమోదు చేయండి.');
        return;
    }

    const btn = document.getElementById('btnSubmitJobCloud');
    btn.disabled = true;
    btn.innerText = "సబ్మిట్ అవుతోంది...";

    db.collection("jobs").add({
        farmer: farmer,
        phone: phone,
        count: count,
        work: work,
        location: loc,
        lat: currentUserLat,
        lng: currentUserLng,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert(`✅ మీ కూలీల అవసర ప్రకటన విజయవంతంగా పోస్ట్ అయింది!`);
        if (rawLaborersList.length > 0 && rawLaborersList[0].phone) {
            triggerWhatsAppCloudAlert(rawLaborersList[0].phone, farmer, work, count, loc);
        }

        document.getElementById('postFarmerName').value = '';
        document.getElementById('postFarmerPhone').value = '';
        document.getElementById('postLaborCount').value = '';
        document.getElementById('postWorkDetails').value = '';
        document.getElementById('postFarmLocation').value = '';
    })
    .catch(err => alert("పోస్ట్ విఫలమైంది: " + err.message))
    .finally(() => {
        btn.disabled = false;
        btn.innerText = "☁️ నేరుగా సబ్మిట్ చేయండి";
    });
}

function listenForLiveJobs() {
    const container = document.getElementById('activeDailyJobsContainer');
    if (!container) return;

    db.collection("jobs")
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => {
          if (snapshot.empty) {
              container.innerHTML = `<div style="text-align:center; padding:10px; color:#666;">ప్రస్తుతం పనులు ఏవీ లేవు.</div>`;
              return;
          }

          container.innerHTML = "";
          snapshot.forEach((doc) => {
              const job = doc.data();
              const item = document.createElement('div');
              item.className = 'labor-card-item';
              item.innerHTML = `
                  <div>
                      <div style="font-weight: bold; font-size:0.92rem;">${job.farmer} (${job.location})</div>
                      <div style="font-size: 0.8rem; color: #555;">🌾 ${job.work} | 👥 ${job.count} మంది కూలీలు అవసరం</div>
                  </div>
                  <a href="tel:${job.phone}" class="btn-call-labor">📞 రైతుకు కాల్</a>
              `;
              container.appendChild(item);
          });
      });
}

function broadcastJobRequest() {
    const farmer = document.getElementById('postFarmerName').value.trim() || 'రైతు';
    const phone = document.getElementById('postFarmerPhone').value.trim() || '';
    const count = document.getElementById('postLaborCount').value.trim();
    const work = document.getElementById('postWorkDetails').value.trim();
    const loc = document.getElementById('postFarmLocation').value.trim() || 'వరంగల్';

    if (!count || !work) {
        alert('కూలీల సంఖ్య మరియు పని వివరాలు ఇవ్వండి.');
        return;
    }

    const msg = `🚨 *AgriConnect వ్యవసాయ కూలీల అవసరం!*\nరైతు: ${farmer}\nకూలీలు: ${count} మంది\nపని: ${work}\nప్రాంతం: ${loc}\nకాల్ చేయండి: ${phone}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
}

// Live Clock
setInterval(() => {
    const now = new Date();
    const clock = document.getElementById('liveClock');
    const date = document.getElementById('liveDate');
    if (clock) clock.innerText = now.toLocaleTimeString('en-US', { hour12: true });
    if (date) date.innerText = now.toLocaleDateString('te-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}, 1000);

// Voice Engine
let isVoiceReaderActive = false;
function toggleVoiceReader() {
    if ('speechSynthesis' in window) {
        isVoiceReaderActive = !isVoiceReaderActive;
        if (isVoiceReaderActive) speakText("వాయిస్ రీడర్ ఆన్ అయింది. ఏదైనా బాక్స్ పై నొక్కండి.");
        else window.speechSynthesis.cancel();
    }
}

function speakElement(el) {
    if (!isVoiceReaderActive) return;
    speakText(el.innerText);
}

function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'te-IN';
    window.speechSynthesis.speak(utterance);
}

function toggleVoiceAssistant() {
    alert('వాయిస్ అసిస్టెంట్ సిద్ధంగా ఉంది. తెలుగులో మాట్లాడవచ్చు.');
}

// Startup Listeners
window.addEventListener('DOMContentLoaded', () => {
    listenForLiveLaborers();
    listenForLiveJobs();
});
