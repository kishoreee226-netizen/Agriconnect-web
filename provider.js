// ==========================================
// provider.js - Vehicles & Equipment Provider Module
// ==========================================

// 1. Landing Page lo 3rd Card ni Inject cheyadam
window.injectProviderLandingCard = function() {
  if (document.getElementById('provider-landing-card')) return;

  const targetParent = document.querySelector('.roles-container') || 
                       document.querySelector('.role-cards') || 
                       (document.getElementById('farmer-container') ? document.getElementById('farmer-container').parentElement : null);

  if (!targetParent) return;

  const card = document.createElement('div');
  card.id = 'provider-landing-card';
  card.className = 'role-card provider-landing-card';

  card.innerHTML = `
    <div class="provider-landing-icon">🚜</div>
    <div class="provider-landing-title">వాహనాలు & యంత్రాల యజమాని</div>
    <p class="provider-landing-desc">ట్రాక్టర్లు, హార్వెస్టర్లు, రవాణా వాహనాలు అద్దెకు ఇవ్వడానికి ఇక్కడ నమోదు చేసుకోండి</p>
    <button onclick="openProviderModal()" class="provider-landing-btn">
      యజమానిగా లాగిన్ / రిజిస్టర్ ➔
    </button>
  `;

  targetParent.appendChild(card);
};

// 2. DOM Load ayyagane card inject avvali
document.addEventListener("DOMContentLoaded", function() {
  if (typeof injectProviderLandingCard === "function") {
    injectProviderLandingCard();
  }
});
