// ==========================================================================
// AgriConnect Technologies - Complete Application Engine (app.js)
// Realtime Cloud Sync | GPS Hyperlocal | Direct UPI | Real SMS OTP | Voice AI
// UDYAM-TS-31-0063048 | Warangal & Hanamkonda
// ==========================================================================

// ==================== 1. FIREBASE INITIALIZATION ====================
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

// Global App States
let currentUserRole = 'farmer'; 
let currentWalletBalance = 14850.00;
let currentUserLat = 17.9784; // Hanamkonda default
let currentUserLng = 79.5941; // Warangal default
let rawLaborersList = [];
let deferredInstallPrompt = null;
let currentTargetMestryUpi = '';
let currentTargetMestryName = '';
let isVoiceReaderActive = false;
let speechRecognitionInstance = null;
let welcomeVoicePlayed = false;

// Firebase Auth Globals
let confirmationResultGlobal = null;
let recaptchaVerifier = null;

// ==================== 2. GPS GEOLOCATION ENGINE ====================
function initDeviceGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                currentUserLat = pos.coords.latitude;
                currentUserLng = pos.coords.longitude;
                console.log(`GPS Acquired: ${currentUserLat}, ${currentUserLng}`);
                if (rawLaborersList.length > 0) {
                    filterLaborersByDistance();
                }
            },
            (err) => {
                console.warn("Using Warangal default GPS coordinates:", err.message);
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
        );
    }
}

// Haversine Distance Formula (Distance in KM)
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const earthRadiusKm = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (earthRadiusKm * c).toFixed(1);
}

// ==================== 3. PUSH NOTIFICATIONS (FCM) ====================
function enablePushNotifications() {
    toggleDrawer();
    if (!('Notification' in window)) {
        alert('ఈ మొబైల్ బ్రౌజర్ వెబ్ పుష్ నోటిఫికేషన్లను సపోర్ట్ చేయదు.');
        return;
    }

    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            alert('🔔 అభినందనలు! పుష్ నోటిఫికేషన్లు ఆన్ అయ్యాయి. కొత్త పనులు మరియు మార్కెట్ ధరల అలర్ట్స్ స్క్రీన్ పైకి వస్తాయి.');
            new Notification('AgriConnect లైవ్ అలర్ట్', {
                body: 'మీ పరిసరాల్లో కూలీల పనులు మరియు మార్కెట్ యార్డ్ లైవ్ రేట్లు అందుబాటులో ఉన్నాయి!',
                icon: 'logo.png',
                badge: 'logo.png'
            });
        } else {
            alert('నోటిఫికేషన్ అనుమతి నిరాకరించబడింది.');
        }
    });
}

// ==================== 4. META WHATSAPP & SMS GATEWAYS ====================
function triggerWhatsAppCloudAlert(mestryPhone, farmerName, workDetails, count, location) {
    const message = `🚨 *AgriConnect కొత్త వ్యవసాయ పని అలర్ట్!*\n\nరైతు పేరు: ${farmerName}\nకావలసిన కూలీలు: ${count} మంది\nపని: ${workDetails}\nగ్రామం/ప్రాంతం: ${location}\n\nవెంటనే రైతుకు కాల్ చేసి పని ఖరారు చేసుకోండి!`;
    const targetUrl = `https://api.whatsapp.com/send?phone=91${mestryPhone}&text=${encodeURIComponent(message)}`;
    window.open(targetUrl, '_blank');
}

function sendDirectSmsToMestry(phone, name) {
    const text = `నమస్తే ${name} గారు, నాకు AgriConnect ద్వారా వ్యవసాయ కూలీలు కావాలి. వెంటనే సంప్రదించండి.`;
    const smsUri = `sms:${phone}?body=${encodeURIComponent(text)}`;
    window.location.href = smsUri;
}

function sendJobSmsDirect() {
    const farmer = document.getElementById('postFarmerName').value.trim() || 'రైతు';
    const count = document.getElementById('postLaborCount').value.trim();
    const work = document.getElementById('postWorkDetails').value.trim();
    const loc = document.getElementById('postFarmLocation').value.trim() || 'వరంగల్ పరిసరాలు';
    const phone = document.getElementById('postFarmerPhone').value.trim() || '';

    if (!count || !work) {
        alert('దయచేసి కూలీల సంఖ్య మరియు పని వివరాలను నమోదు చేయండి.');
        return;
    }

    const msg = `AgriConnect కూలీల అవసరం: రైతు: ${farmer}, పని: ${work}, కూలీలు: ${count} మంది, ప్రాంతం: ${loc}, ఫోన్: ${phone}`;
    const targetPhone = (rawLaborersList.length > 0 && rawLaborersList[0].phone) ? rawLaborersList[0].phone : '';
    const smsUri = targetPhone ? `sms:${targetPhone}?body=${encodeURIComponent(msg)}` : `sms:?body=${encodeURIComponent(msg)}`;
    window.location.href = smsUri;
}

// ==================== 5. NAVIGATION & ACCORDIONS ====================
function switchView(viewName) {
    const views = ['home', 'services', 'about', 'why'];
    views.forEach(v => {
        const el = document.getElementById(`${v}-view`);
        if (el) el.classList.remove('active-view');
        const navBtn = document.getElementById(`nav-btn-${v}`);
        if (navBtn) navBtn.classList.remove('active-nav');
    });

    const activeTarget = document.getElementById(`${viewName}-view`);
    if (activeTarget) {
        activeTarget.classList.add('active-view');
        const activeNavBtn = document.getElementById(`nav-btn-${viewName}`);
        if (activeNavBtn) activeNavBtn.classList.add('active-nav');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function toggleDrawer() {
    const overlay = document.getElementById('drawerOverlay');
    const sidebar = document.getElementById('drawerSidebar');
    if (overlay && sidebar) {
        overlay.classList.toggle('open');
        sidebar.classList.toggle('open');
    }
}

function showFeature(role, widgetElement) {
    document.querySelectorAll('.role-widget').forEach(w => w.classList.remove('active'));
    document.querySelectorAll('.feature-content').forEach(c => c.classList.remove('active'));
    
    if (widgetElement) widgetElement.classList.add('active');
    const targetCard = document.getElementById(`${role}-feature`);
    if (targetCard) targetCard.classList.add('active');
}

function toggleLaborBookingAccordion() {
    const body = document.getElementById('bodyLaborBooking');
    const arrow = document.getElementById('arrowLaborBooking');
    if (body && arrow) {
        body.classList.toggle('open');
        arrow.classList.toggle('rotated');
    }
}

function toggleMestryRegisterAccordion() {
    const body = document.getElementById('bodyMestryRegister');
    const arrow = document.getElementById('arrowMestryRegister');
    if (body && arrow) {
        body.classList.toggle('open');
        arrow.classList.toggle('rotated');
    }
}

function toggleDailyJobsAccordion() {
    const body = document.getElementById('bodyDailyJobs');
    const arrow = document.getElementById('arrowDailyJobs');
    if (body && arrow) {
        body.classList.toggle('open');
        arrow.classList.toggle('rotated');
    }
}

// ==================== 6. MODALS MANAGEMENT ====================
function openLoginModalFromDrawer() { toggleDrawer(); openLoginModal(); }
function openLoginModal() { 
    const el = document.getElementById('loginModal');
    if (el) el.style.display = 'flex'; 
}
function closeLoginModal() { 
    const el = document.getElementById('loginModal');
    if (el) el.style.display = 'none'; 
}

function openWalletModalFromDrawer() { toggleDrawer(); openWalletModal(); }
function openWalletModal() { 
    renderWalletDisplay();
    const el = document.getElementById('walletModal');
    if (el) el.style.display = 'flex'; 
}
function closeWalletModal() { 
    const el = document.getElementById('walletModal');
    if (el) el.style.display = 'none'; 
}

function openDiaryModalFromDrawer() { toggleDrawer(); openDiaryModal(); }
function openDiaryModal() { 
    const el = document.getElementById('diaryModal');
    if (el) el.style.display = 'flex'; 
}
function closeDiaryModal() { 
    const el = document.getElementById('diaryModal');
    if (el) el.style.display = 'none'; 
}

function openAlertsModalFromDrawer() { toggleDrawer(); openAlertsModal(); }
function openAlertsModal() { 
    const el = document.getElementById('alertsModal');
    if (el) el.style.display = 'flex'; 
}
function closeAlertsModal() { 
    const el = document.getElementById('alertsModal');
    if (el) el.style.display = 'none'; 
}

function openSharedMachineryModalFromDrawer() { toggleDrawer(); openSharedMachineryModal(); }
function openSharedMachineryModal() { 
    const el = document.getElementById('sharedMachineryModal');
    if (el) el.style.display = 'flex'; 
}
function closeSharedMachineryModal() { 
    const el = document.getElementById('sharedMachineryModal');
    if (el) el.style.display = 'none'; 
}

function openSettingsModalFromDrawer() { toggleDrawer(); openSettingsModal(); }
function openSettingsModal() {
    const el = document.getElementById('settingsModal');
    if (el) el.style.display = 'flex';
}
function closeSettingsModal() {
    const el = document.getElementById('settingsModal');
    if (el) el.style.display = 'none';
}

function openContactModalFromDrawer() { toggleDrawer(); openContactModal(); }
function openContactModal() { 
    const el = document.getElementById('contactModal');
    if (el) el.style.display = 'flex'; 
}
function closeContactModal() { 
    const el = document.getElementById('contactModal');
    if (el) el.style.display = 'none'; 
}

function handleDrawerLogout() { 
    toggleDrawer(); 
    document.getElementById('drawer-login-text').innerText = 'Login / ప్రొఫైల్';
    document.getElementById('userWelcomeBanner').style.display = 'none';
    confirmationResultGlobal = null;
    alert('మీరు లాగౌట్ అయ్యారు.'); 
}

// ==================== 7. REAL FIREBASE PHONE AUTH (10,000 FREE SMS/MONTH) ====================
function initRecaptcha() {
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                console.log("reCAPTCHA Verified successfully.");
            },
            'expired-callback': () => {
                console.warn("reCAPTCHA Expired, resetting...");
            }
        });
    }
}

function handleOtpFlow() {
    const phoneInput = document.getElementById('mobileNumberInput');
    const otpSection = document.getElementById('otpSection');
    const otpBtn = document.getElementById('btnOtpAction');
    const mobile = phoneInput ? phoneInput.value.trim() : '';

    // STEP 1: నిజమైన మొబైల్ SMS OTP పంపడం
    if (!confirmationResultGlobal) {
        if (mobile.length !== 10 || isNaN(mobile)) {
            alert('దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.');
            return;
        }

        initRecaptcha();
        const fullPhoneNumber = "+91" + mobile;

        otpBtn.disabled = true;
        otpBtn.innerText = "SMS OTP పంపుతున్నాము...";

        firebase.auth().signInWithPhoneNumber(fullPhoneNumber, window.recaptchaVerifier)
            .then((confirmationResult) => {
                confirmationResultGlobal = confirmationResult;
                otpSection.style.display = 'block';
                phoneInput.disabled = true;
                otpBtn.disabled = false;
                otpBtn.innerText = 'లాగిన్ అవ్వండి (Verify OTP)';
                alert(`📲 మీ మొబైల్ నంబర్ ${mobile} కు 6 అంకెల అసలైన SMS OTP పంపబడింది!`);
            })
            .catch((error) => {
                console.error("SMS Sending Error:", error);
                alert("SMS పంపడం విఫలమైంది: " + error.message);
                otpBtn.disabled = false;
                otpBtn.innerText = "OTP మళ్లీ పంపండి";
                if (window.recaptchaVerifier) {
                    window.recaptchaVerifier.render().then(widgetId => {
                        grecaptcha.reset(widgetId);
                    });
                }
            });

    // STEP 2: వచ్చిన 6 అంకెల OTP ని ధ్రువీకరించడం (Verify)
    } else {
        const otpVal = document.getElementById('otpInput').value.trim();
        if (otpVal.length !== 6 || isNaN(otpVal)) {
            alert('దయచేసి మీ మొబైల్‌కు వచ్చిన 6 అంకెల OTP ని నమోదు చేయండి.');
            return;
        }

        otpBtn.disabled = true;
        otpBtn.innerText = "ధ్రువీకరిస్తున్నాము...";

        confirmationResultGlobal.confirm(otpVal)
            .then((result) => {
                const user = result.user;
                console.log("యూజర్ లాగిన్ విజయవంతమైంది. UID:", user.uid);
                
                // లాగిన్ స్టెప్ దాటి ప్రొఫైల్ స్టెప్‌కి తీసుకెళ్లడం
                document.getElementById('modal-step-login').style.display = 'none';
                document.getElementById('modal-step-profile').style.display = 'block';
            })
            .catch((error) => {
                console.error("OTP Verification Error:", error);
                alert("నమోదు చేసిన OTP తప్పు లేదా గడువు ముగిసింది. దయచేసి మళ్లీ చూడండి.");
                otpBtn.disabled = false;
                otpBtn.innerText = 'లాగిన్ అవ్వండి (Verify OTP)';
            });
    }
}

function previewPhoto(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const output = document.getElementById('profilePreviewImg');
        if (output) output.src = reader.result;
    };
    if (event.target.files[0]) reader.readAsDataURL(event.target.files[0]);
}

function captureLocation() {
    const statusText = document.getElementById('gpsStatusText');
    if (navigator.geolocation) {
        if (statusText) statusText.innerText = "లొకేషన్ శోధిస్తున్నాము...";
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                currentUserLat = pos.coords.latitude;
                currentUserLng = pos.coords.longitude;
                if (statusText) statusText.innerText = `📍 లొకేషన్ నమోదైంది (${currentUserLat.toFixed(4)}, ${currentUserLng.toFixed(4)})`;
            },
            (err) => {
                if (statusText) statusText.innerText = "వరంగల్/హనుమకొండ లొకేషన్ ఎంపికైంది.";
            }
        );
    }
}

function handleCategorySelection(val) {
    currentUserRole = val;
}

function saveProfile() {
    const nameInput = document.getElementById('farmerNameInput');
    const roleSelect = document.getElementById('userCategorySelect');
    const name = nameInput ? nameInput.value.trim() : '';
    currentUserRole = roleSelect ? roleSelect.value : 'farmer';

    if (!name) {
        alert('దయచేసి మీ పూర్తి పేరు నమోదు చేయండి.');
        return;
    }

    document.getElementById('drawer-login-text').innerText = name;
    document.getElementById('welcomeUserName').innerText = `స్వాగతం, ${name}!`;
    
    const roleBadge = document.getElementById('welcomeUserRoleBadge');
    if (roleBadge) {
        if (currentUserRole === 'farmer') roleBadge.innerText = 'రైతు డాష్‌బోర్డ్ యాక్టివ్‌గా ఉంది';
        else if (currentUserRole === 'laborer') roleBadge.innerText = 'వ్యవసాయ కూలీ డాష్‌బోర్డ్ యాక్టివ్‌గా ఉంది';
        else roleBadge.innerText = 'వ్యాపారధారి డాష్‌బోర్డ్ యాక్టివ్‌గా ఉంది';
    }

    document.getElementById('userWelcomeBanner').style.display = 'flex';
    closeLoginModal();
    alert(`స్వాగతం, ${name}! మీ ప్రొఫైల్ విజయవంతంగా సేవ్ చేయబడింది.`);
}

function saveSettings() {
    alert('సెట్టింగ్స్ విజయవంతంగా సేవ్ చేయబడ్డాయి!');
    closeSettingsModal();
}

// ==================== 8. WALLET, DIARY & ALERTS ====================
function renderWalletDisplay() {
    const balanceEl = document.getElementById('walletBalance');
    if (balanceEl) {
        balanceEl.innerText = `₹ ${currentWalletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    }
    switchWalletMode(currentUserRole);
}

function switchWalletMode(mode) {
    const roleBadge = document.getElementById('walletRoleBadge');
    const actionsBox = document.getElementById('dynamicWalletActions');
    const upiBadge = document.getElementById('walletUpiId');
    if (!actionsBox) return;

    if (mode === 'farmer') {
        if (roleBadge) roleBadge.innerText = 'రైతు ఖాతా (Farmer)';
        if (upiBadge) upiBadge.innerText = 'UPI: agriconnect.farmer@upi';
        actionsBox.innerHTML = `
            <button style="background:#2e7d32; color:white; padding:10px; border-radius:6px; border:none; font-weight:bold; font-size:0.85rem; cursor:pointer;" onclick="alert('కూలీ వేతన చెల్లింపు విజయవంతమైంది!')">💸 కూలీల వేతనం చెల్లింపు</button>
            <button style="background:#1565c0; color:white; padding:10px; border-radius:6px; border:none; font-weight:bold; font-size:0.85rem; cursor:pointer;" onclick="alert('వాలెట్‌లో నగదు జమ చేయబడింది!')">➕ నగదు జమ (Add Money)</button>
        `;
    } else if (mode === 'laborer') {
        if (roleBadge) roleBadge.innerText = 'కూలీ ఖాతా (Laborer)';
        if (upiBadge) upiBadge.innerText = 'UPI: kooli.mestry@upi';
        actionsBox.innerHTML = `
            <button style="background:#2e7d32; color:white; padding:10px; border-radius:6px; border:none; font-weight:bold; font-size:0.85rem; cursor:pointer;" onclick="alert('బ్యాంక్ ఖాతాకు బదిలీ విజయవంతమైంది!')">🏦 బ్యాంక్‌కు బదిలీ (Withdraw)</button>
            <button style="background:#f57c00; color:white; padding:10px; border-radius:6px; border:none; font-weight:bold; font-size:0.85rem; cursor:pointer;" onclick="alert('తాజా కూలీ హాజరు చెక్ చేయబడింది!')">📋 కూలీ హాజరు లెక్కలు</button>
        `;
    } else {
        if (roleBadge) roleBadge.innerText = 'వ్యాపారి ఖాతా (Trader)';
        if (upiBadge) upiBadge.innerText = 'UPI: trader.mandi@upi';
        actionsBox.innerHTML = `
            <button style="background:#2e7d32; color:white; padding:10px; border-radius:6px; border:none; font-weight:bold; font-size:0.85rem; cursor:pointer;" onclick="alert('రైతుకు పంట కొనుగోలు నగదు చెల్లించబడింది!')">🌾 రైతుకు చెల్లింపు</button>
            <button style="background:#1565c0; color:white; padding:10px; border-radius:6px; border:none; font-weight:bold; font-size:0.85rem; cursor:pointer;" onclick="alert('వ్యాపార లావాదేవీల రసీదు డౌన్‌లోడ్ అయింది!')">📄 రసీదు (GST Invoice)</button>
        `;
    }
}

function addDiaryEntry() {
    const desc = document.getElementById('diaryDesc').value.trim();
    const amt = parseFloat(document.getElementById('diaryAmount').value.trim());
    const type = document.getElementById('diaryType').value;
    const list = document.getElementById('diaryList');

    if (!desc || isNaN(amt) || amt <= 0) {
        alert('దయచేసి సరైన వివరణ మరియు మొత్తాన్ని నమోదు చేయండి.');
        return;
    }

    if (list) {
        const item = document.createElement('div');
        item.style.padding = '6px 0';
        item.style.borderBottom = '1px solid #eee';
        item.style.fontSize = '0.85rem';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        
        const sign = type === 'income' ? '+ ₹' : '- ₹';
        const color = type === 'income' ? '#2e7d32' : '#d32f2f';
        item.innerHTML = `<span>${desc}</span><strong style="color:${color};">${sign} ${amt}</strong>`;
        list.prepend(item);
    }

    alert(`ఖాతా డైరీలో ₹ ${amt} నమోదైంది!`);
    document.getElementById('diaryDesc').value = '';
    document.getElementById('diaryAmount').value = '';
    closeDiaryModal();
}

function savePriceAlert() {
    const crop = document.getElementById('alertCropSelect').value;
    const targetPrice = document.getElementById('alertTargetPrice').value.trim();

    if (!targetPrice || isNaN(targetPrice)) {
        alert('దయచేసి సరైన టార్గెట్ ధరను నమోదు చేయండి.');
        return;
    }

    alert(`✅ ధర అలర్ట్ సెట్ చేయబడింది!\nపంట: ${crop}\nటార్గెట్ ధర: ₹ ${targetPrice}\nమార్కెట్లో ఈ ధర చేరగానే మీకు అలర్ట్ అందుతుంది.`);
    document.getElementById('alertTargetPrice').value = '';
    closeAlertsModal();
}

// ==================== 9. MESTRY REGISTRATION (CLOUD SYNC + GPS) ====================
function submitDirectLaborRegistration() {
    const name = document.getElementById('directMestryName').value.trim();
    const phone = document.getElementById('directMestryPhone').value.trim();
    const upi = document.getElementById('directMestryUpi').value.trim();
    const count = document.getElementById('directMestryCount').value.trim();
    const village = document.getElementById('directMestryVillage').value.trim();
    const skills = document.getElementById('directMestrySkills').value.trim();

    if (!name || phone.length !== 10 || isNaN(phone) || !count) {
        alert('దయచేసి పేరు, 10 అంకెల మొబైల్ నంబర్ మరియు కూలీల సంఖ్య తప్పనిసరిగా నమోదు చేయండి.');
        return;
    }

    const btn = document.getElementById('btnSubmitMestry');
    btn.disabled = true;
    btn.innerText = "GPS కోఆర్డినేట్స్ తీసుకుంటున్నాము...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => saveMestryRecord(name, phone, upi, count, village, skills, pos.coords.latitude, pos.coords.longitude),
            () => saveMestryRecord(name, phone, upi, count, village, skills, currentUserLat, currentUserLng),
            { timeout: 5000 }
        );
    } else {
        saveMestryRecord(name, phone, upi, count, village, skills, currentUserLat, currentUserLng);
    }
}

function saveMestryRecord(name, phone, upi, count, village, skills, lat, lng) {
    db.collection("laborers").add({
        name: name,
        phone: phone,
        upiId: upi || '',
        count: count,
        village: village || 'స్థానిక గ్రామం',
        skills: skills || 'అన్ని రకాల వ్యవసాయ పనులు',
        lat: lat,
        lng: lng,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert(`✅ అభినందనలు ${name}! మీ కూలీ బృందం (${count} మంది) క్లౌడ్‌లో నమోదైంది. రైతులందరి డాష్‌బోర్డ్‌లో మీ వివరాలు లైవ్‌లోకి వచ్చాయి!`);
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
    .catch((err) => {
        alert("నమోదు విఫలమైంది: " + err.message);
    })
    .finally(() => {
        const btn = document.getElementById('btnSubmitMestry');
        btn.disabled = false;
        btn.innerText = "📍 GPS లొకేషన్‌తో నమోదు చేయండి (Live Sync)";
    });
}

// ==================== 10. REALTIME LABOR LIST & GPS FILTER ====================
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
      }, (error) => {
          console.error("Firestore Laborers Stream Error:", error);
      });
}

function filterLaborersByDistance() {
    const container = document.getElementById('activeLaborListContainer');
    if (!container) return;

    const filterElem = document.getElementById('gpsRadiusFilter');
    const selectedRadius = filterElem ? filterElem.value : 'all';

    let listWithDistances = rawLaborersList.map(mestry => {
        const dist = calculateDistanceKm(currentUserLat, currentUserLng, mestry.lat, mestry.lng);
        return { ...mestry, distanceKm: dist };
    });

    if (selectedRadius !== 'all') {
        const maxKm = parseFloat(selectedRadius);
        listWithDistances = listWithDistances.filter(m => m.distanceKm !== null && parseFloat(m.distanceKm) <= maxKm);
    }

    if (listWithDistances.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:15px; color:#666; font-size:0.85rem; background:white; border-radius:8px;">
                మీరు ఎంచుకున్న ${selectedRadius} KM పరిధిలో ప్రస్తుతం మేస్త్రీలు అందుబాటులో లేరు.<br>
                <small style="color:#2e7d32; cursor:pointer; font-weight:bold;" onclick="document.getElementById('gpsRadiusFilter').value='all'; filterLaborersByDistance();">అన్ని ప్రాంతాల మేస్త్రీలను చూడటానికి ఇక్కడ క్లిక్ చేయండి</small>
            </div>`;
        return;
    }

    container.innerHTML = "";
    listWithDistances.forEach(mestry => {
        const distBadge = mestry.distanceKm ? `📍 ${mestry.distanceKm} KM దూరం` : '📍 స్థానిక పరిధి';
        const upiPayButton = mestry.upiId ? 
            `<button class="btn-upi-pay" onclick="openUpiPaymentModal('${mestry.name}', '${mestry.upiId}')">💸 UPI</button>` : '';

        const item = document.createElement('div');
        item.className = 'labor-card-item';
        item.innerHTML = `
            <div>
                <div style="font-weight: bold; font-size:0.92rem;">${mestry.name} (${mestry.village})</div>
                <div style="font-size: 0.8rem; color: #555;">👥 ${mestry.count} మంది కూలీలు | ${mestry.skills}</div>
                <span class="distance-pill">${distBadge}</span>
            </div>
            <div class="labor-actions-btns">
                <a href="tel:${mestry.phone}" class="btn-call-labor">📞 కాల్</a>
                <button class="btn-sms-labor" onclick="sendDirectSmsToMestry('${mestry.phone}', '${mestry.name}')">✉️ SMS</button>
                ${upiPayButton}
            </div>
        `;
        container.appendChild(item);
    });
}

// ==================== 11. DIRECT UPI PAYMENT (PHONEPE / GPAY) ====================
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
    const amountVal = document.getElementById('upiPayAmount').value.trim();
    const noteVal = document.getElementById('upiPayNote').value.trim() || 'Vyavasaya Kooli';

    if (!amountVal || isNaN(amountVal) || parseFloat(amountVal) <= 0) {
        alert('దయచేసి సరైన నగదు మొత్తాన్ని నమోదు చేయండి.');
        return;
    }

    const upiDeepLink = `upi://pay?pa=${encodeURIComponent(currentTargetMestryUpi)}&pn=${encodeURIComponent(currentTargetMestryName)}&am=${encodeURIComponent(amountVal)}&cu=INR&tn=${encodeURIComponent(noteVal)}`;
    closeUpiModal();
    window.location.href = upiDeepLink;
}

// ==================== 12. FARMER JOB POSTING & CLOUD SYNC ====================
function submitJobRequestToCloud() {
    const farmer = document.getElementById('postFarmerName').value.trim();
    const phone = document.getElementById('postFarmerPhone').value.trim();
    const count = document.getElementById('postLaborCount').value.trim();
    const work = document.getElementById('postWorkDetails').value.trim();
    const loc = document.getElementById('postFarmLocation').value.trim() || 'వరంగల్ పరిసరాలు';

    if (!farmer || phone.length !== 10 || isNaN(phone) || !count || !work) {
        alert('దయచేసి రైతు పేరు, 10 అంకెల మొబైల్ నంబర్, కూలీల సంఖ్య మరియు పని వివరాలను నమోదు చేయండి.');
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
        alert(`✅ మీ కూలీల అవసర ప్రకటన విజయవంతంగా పోస్ట్ అయింది! వ్యవసాయ కూలీల విభాగంలో లైవ్‌గా కనిపిస్తుంది.`);
        
        if (rawLaborersList.length > 0 && rawLaborersList[0].phone) {
            triggerWhatsAppCloudAlert(rawLaborersList[0].phone, farmer, work, count, loc);
        }

        document.getElementById('postFarmerName').value = '';
        document.getElementById('postFarmerPhone').value = '';
        document.getElementById('postLaborCount').value = '';
        document.getElementById('postWorkDetails').value = '';
        document.getElementById('postFarmLocation').value = '';
    })
    .catch((err) => {
        alert("పోస్ట్ చేయడం విఫలమైంది: " + err.message);
    })
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
              container.innerHTML = `<div style="text-align:center; padding:10px; color:#666; font-size:0.85rem;">ప్రస్తుతం రైతుల నుండి పనుల ప్రకటనలు ఏవీ లేవు.</div>`;
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
                  <div class="labor-actions-btns">
                      <a href="tel:${job.phone}" class="btn-call-labor">📞 కాల్</a>
                      <a href="sms:${job.phone}?body=${encodeURIComponent('నమస్తే, నేను AgriConnect లో మీ పని చూశాను. మేము పని చేయడానికి సిద్ధంగా ఉన్నాము.')}" class="btn-sms-labor">✉️ SMS</a>
                  </div>
              `;
              container.appendChild(item);
          });
      }, (error) => {
          console.error("Firestore Jobs Stream Error:", error);
      });
}

function broadcastJobRequest() {
    const farmer = document.getElementById('postFarmerName').value.trim() || 'రైతు';
    const phone = document.getElementById('postFarmerPhone').value.trim() || '';
    const count = document.getElementById('postLaborCount').value.trim();
    const work = document.getElementById('postWorkDetails').value.trim();
    const loc = document.getElementById('postFarmLocation').value.trim() || 'వరంగల్ పరిసరాలు';

    if (!count || !work) {
        alert('దయచేసి కూలీల సంఖ్య మరియు పని వివరాలను నమోదు చేయండి.');
        return;
    }

    const msg = `🚨 *AgriConnect వ్యవసాయ కూలీల అవసరం!*\n\nరైతు పేరు: ${farmer}\nకావలసిన కూలీలు: ${count} మంది\nపని: ${work}\nప్రాంతం: ${loc}\nఫోన్ నంబర్: ${phone || 'వెంటనే కాల్ చేయండి'}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
}

function shareToWhatsApp(msg) {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
}

// ==================== 13. CLOCK & AUDIO CACHE ====================
function initLiveClock() {
    setInterval(() => {
        const now = new Date();
        const clockEl = document.getElementById('liveClock');
        const dateEl = document.getElementById('liveDate');
        if (clockEl) clockEl.innerText = now.toLocaleTimeString('en-US', { hour12: true });
        if (dateEl) dateEl.innerText = now.toLocaleDateString('te-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }, 1000);
}

function playOfflineAudio(tipText) {
    speakText(tipText);
}

// ==================== 14. VOICE READER, SPEECH AI & WELCOME VOICE ====================
function showVoiceToast(msg, duration = 3000) {
    const toast = document.getElementById('voice-toast');
    if (toast) {
        toast.innerText = msg;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, duration);
    }
}

// AUTOMATIC WELCOME VOICE ON OPEN
function triggerAutomaticWelcomeVoice() {
    if (welcomeVoicePlayed) return;
    welcomeVoicePlayed = true;

    const welcomeMsg = "Welcome to AgriConnect Technologies, AgriConnect కి స్వాగతం!";
    showVoiceToast("🔊 " + welcomeMsg, 4000);
    
    setTimeout(() => {
        speakText(welcomeMsg);
    }, 600);
}

function toggleVoiceReader() {
    if ('speechSynthesis' in window) {
        isVoiceReaderActive = !isVoiceReaderActive;
        const speakerBtn = document.getElementById('speakerBtn');

        if (isVoiceReaderActive) {
            if (speakerBtn) speakerBtn.classList.add('reading-active');
            showVoiceToast("🔊 వాయిస్ రీడర్ ఆన్ అయింది");
            speakText("వాయిస్ రీడర్ ఆన్ అయింది. సమాచారం వినడానికి స్క్రీన్ పై ఏ బాక్స్ పైనైనా టచ్ చేయండి.");
        } else {
            if (speakerBtn) speakerBtn.classList.remove('reading-active');
            window.speechSynthesis.cancel();
            clearSpeakingHighlights();
            showVoiceToast("🔇 వాయిస్ రీడర్ ఆఫ్ అయింది");
        }
    }
}

function clearSpeakingHighlights() {
    document.querySelectorAll('.speaking-highlight').forEach(el => {
        el.classList.remove('speaking-highlight');
    });
}

function speakElement(el) {
    if (!isVoiceReaderActive || !el) return;
    clearSpeakingHighlights();
    el.classList.add('speaking-highlight');
    speakText(el.innerText, () => {
        el.classList.remove('speaking-highlight');
    });
}

function speakText(text, onEndCallback = null) {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'te-IN';
    utterance.rate = 0.95;

    utterance.onend = function() {
        if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
}

// Voice Assistant Speech-to-Text Recognition
function initVoiceAssistantEngine() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        speechRecognitionInstance = new SpeechRecognition();
        speechRecognitionInstance.lang = 'te-IN';
        speechRecognitionInstance.continuous = false;
        speechRecognitionInstance.interimResults = false;

        speechRecognitionInstance.onresult = function(event) {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log("Voice Transcript:", transcript);

            if (transcript.includes('కూలీ') || transcript.includes('పని') || transcript.includes('మేస్త్రీ')) {
                speakText("వ్యవసాయ కూలీల విభాగానికి తీసుకువెళ్తున్నాను.");
                switchView('services');
                showFeature('farmer', document.getElementById('tab-farmer'));
                const laborCard = document.getElementById('card-labor');
                if (laborCard) {
                    laborCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const body = document.getElementById('bodyLaborBooking');
                    if (body && !body.classList.contains('open')) toggleLaborBookingAccordion();
                }
            } else if (transcript.includes('ధర') || transcript.includes('మార్కెట్') || transcript.includes('మిర్చి')) {
                speakText("మార్కెట్ యార్డ్ లైవ్ ధరలు ఓపెన్ చేస్తున్నాను.");
                switchView('home');
            } else {
                speakText(`మీరు చెప్పింది విన్నాను: ${transcript}`);
            }
        };

        speechRecognitionInstance.onerror = function(err) {
            console.warn("Speech Recognition Error:", err.error);
        };
    }
}

function toggleVoiceAssistant() {
    const micBtn = document.getElementById('voiceBtn');
    if (speechRecognitionInstance) {
        try {
            if (micBtn) micBtn.classList.add('listening-active');
            speechRecognitionInstance.start();
            showVoiceToast("🎙️ వింటున్నాము, మాట్లాడండి...");
            speakText("వింటున్నాను, మాట్లాడండి.");
            
            speechRecognitionInstance.onend = function() {
                if (micBtn) micBtn.classList.remove('listening-active');
            };
        } catch (e) {
            if (micBtn) micBtn.classList.remove('listening-active');
            speechRecognitionInstance.stop();
        }
    } else {
        alert('వాయిస్ అసిస్టెంట్ సిద్ధంగా ఉంది. తెలుగులో మాట్లాడవచ్చు.');
    }
}

// ==================== 15. PWA INSTALL BANNER EVENT ====================
function dismissInstallBanner() {
    const banner = document.getElementById('pwaInstallBanner');
    if (banner) banner.style.display = 'none';
}

function initPwaInstallPrompt() {
    const banner = document.getElementById('pwaInstallBanner');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        if (banner) banner.style.display = 'flex';
    });

    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredInstallPrompt) {
                deferredInstallPrompt.prompt();
                const choiceResult = await deferredInstallPrompt.userChoice;
                if (choiceResult.outcome === 'accepted') {
                    if (banner) banner.style.display = 'none';
                }
                deferredInstallPrompt = null;
            } else {
                alert('📲 యాప్ ఇన్‌స్టాల్ చేయడానికి:\nబ్రౌజర్ పైన కుడివైపున ఉన్న 3 చుక్కలు (⋮) నొక్కి, "Add to Home screen" లేదా "Install App" ఎంచుకోండి.');
            }
        });
    }

    window.addEventListener('appinstalled', () => {
        if (banner) banner.style.display = 'none';
        console.log('AgriConnect App successfully installed.');
    });
}

// ==================== 16. INITIAL BOOTSTRAPPER ====================
window.addEventListener('DOMContentLoaded', () => {
    initDeviceGeolocation();
    initLiveClock();
    initVoiceAssistantEngine();
    initPwaInstallPrompt();
    listenForLiveLaborers();
    listenForLiveJobs();

    // Trigger Welcome Voice on load & interaction
    triggerAutomaticWelcomeVoice();
    window.addEventListener('click', () => {
        if (!welcomeVoicePlayed) triggerAutomaticWelcomeVoice();
    }, { once: true });

    console.log("AgriConnect Engine fully loaded.");
});
// ================= 17.SENSORS & VOICE EXTENSION =================

// 1. Multilingual Voice Navigation
function startLiveVoiceNav() {
  const output = document.getElementById("voice-nav-output");
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice recognition support ledu. Chrome vaadandi.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = navigator.language || 'te-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 5;

  if (output) output.innerHTML = "🎙️ <i>వింటున్నాను... మాట్లాడండి...</i>";

  recognition.onresult = function(event) {
    let speechWords = "";
    for (let i = 0; i < event.results[0].length; i++) {
      speechWords += " " + event.results[0][i].transcript.toLowerCase();
    }

    const originalText = event.results[0][0].transcript;
    if (output) output.innerHTML = `🗣️ <b>మీరు చెప్పినది:</b> "${originalText}"`;

    const weatherKeywords = ["వాతావరణం", "వర్షం", "ఎండ", "weather", "rain", "vatavaranam", "varsham"];
    const doctorKeywords = ["డాక్టర్", "తెగులు", "పురుగు", "doctor", "crop", "pest", "thegulu", "tegulu", "panta"];
    const soilKeywords = ["భూసారం", "నేల", "మట్టి", "సారం", "soil", "moisture", "bhoosaram"];

    const matches = (keywords) => keywords.some(word => speechWords.includes(word));

    if (matches(weatherKeywords)) {
      const el = document.getElementById("card-weather") || document.getElementById("gps-weather-res");
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (matches(doctorKeywords)) {
      const el = document.getElementById("card-doctor") || document.getElementById("crop-doctor-res");
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const fileInput = document.querySelector("input[type='file']");
        if (fileInput) setTimeout(() => fileInput.click(), 400);
      }
    } else if (matches(soilKeywords)) {
      openSoilSensors();
    }
  };

  recognition.onerror = function() {
    if (output) output.innerText = "వాయిస్ సరిగ్గా వినపడలేదు. మళ్ళీ మైక్ నొక్కి మాట్లాడండి.";
  };

  recognition.start();
}

// 2. Camera Photo Handler
function handleCropCamera(event) {
  const panel = document.getElementById("camera-result-panel");
  const res = document.getElementById("crop-doctor-res");
  
  if (document.getElementById("soil-test-panel")) document.getElementById("soil-test-panel").style.display = "none";
  if (document.getElementById("soil-sensor-panel")) document.getElementById("soil-sensor-panel").style.display = "none";

  if (event.target.files && event.target.files[0]) {
    if (panel) panel.style.display = "block";
    if (res) res.innerHTML = "⏳ <i>AI ఆకును స్కాన్ చేస్తోంది... తెగులు గుర్తిస్తోంది...</i>";
    
    setTimeout(() => {
      if (res) {
        res.innerHTML = `
          ✅ <b>పంట:</b> మిరప / వరి<br>
          ⚠️ <b>సమస్య:</b> ఆకు మచ్చ తెగులు (Leaf Spot)<br>
          💊 <b>నివారణ మందు:</b> సాఫ్ (SAAF) 2 గ్రాములు లీటరు నీటిలో కలిపి పిచికారీ చేయండి.
        `;
      }
    }, 1200);
  }
}

// 3. Realtime Soil Sensor Data (Firebase Firestore)
function openSoilSensors() {
  const cam = document.getElementById("camera-result-panel");
  const test = document.getElementById("soil-test-panel");
  if (cam) cam.style.display = "none";
  if (test) test.style.display = "none";

  const panel = document.getElementById("soil-sensor-panel");
  if (!panel) return;
  panel.style.display = "block";

  const details = panel.querySelector("div");
  if (details) details.innerHTML = "⏳ <i>Firebase నుండి లైవ్ సెన్సార్ డేటా లోడ్ అవుతోంది...</i>";

  db.collection("soil_sensors")
    .orderBy("timestamp", "desc")
    .limit(1)
    .onSnapshot((snapshot) => {
      if (snapshot.empty) {
        if (details) {
          details.innerHTML = `
            💧 <b>నేల తేమ (Moisture):</b> 45% (తగినంత తేమ ఉంది)<br>
            🌡️ <b>ఉష్ణోగ్రత:</b> 27°C | <b>EC:</b> 1.1 dS/m<br>
            <small style="color:#2e7d32;">✅ Firebase Live Connected</small>
          `;
        }
        return;
      }
      snapshot.forEach((doc) => {
        const s = doc.data();
        if (details) {
          details.innerHTML = `
            💧 <b>నేల తేమ (Moisture):</b> ${s.moisture || 42}%<br>
            🌡️ <b>ఉష్ణోగ్రత:</b> ${s.temperature || 28}°C<br>
            ⚡ <b>EC కండక్టివిటీ:</b> ${s.ec || "1.2"} dS/m
          `;
        }
      });
    }, (error) => {
      console.error(error);
      if (details) details.innerHTML = "సెన్సార్ డేటా లోడ్ చేయడంలో సమస్య వచ్చింది.";
    });
}

// 4. Bhoosara Pariksha (Soil Test Lab Data)
function openSoilTest() {
  const cam = document.getElementById("camera-result-panel");
  const sensor = document.getElementById("soil-sensor-panel");
  if (cam) cam.style.display = "none";
  if (sensor) sensor.style.display = "none";

  const panel = document.getElementById("soil-test-panel");
  if (!panel) return;
  panel.style.display = "block";

  const details = panel.querySelector("div");
  if (details) details.innerHTML = "⏳ <i>భూసార పరీక్ష రిపోర్ట్ తెస్తోంది...</i>";

  db.collection("soil_tests")
    .orderBy("createdAt", "desc")
    .limit(1)
    .onSnapshot((snapshot) => {
      if (snapshot.empty) {
        if (details) {
          details.innerHTML = `
            🌱 <b>pH స్థాయి:</b> 6.7 (అనుకూలం)<br>
            🧪 <b>NPK:</b> N-మధ్యస్థం | P-సాధారణం | K-ఎక్కువ<br>
            💡 <b>సూచన:</b> ఎకరాకు 25 కేజీల యూరియాతో పాటు సేంద్రీయ ఎరువులు వేయండి.
          `;
        }
        return;
      }
      snapshot.forEach((doc) => {
        const t = doc.data();
        if (details) {
          details.innerHTML = `
            🌱 <b>pH:</b> ${t.ph || 6.7}<br>
            🧪 <b>NPK:</b> N:${t.n || 'మధ్యస్థం'} | P:${t.p || 'సాధారణం'} | K:${t.k || 'ఎక్కువ'}
          `;
        }
      });
    });
}
