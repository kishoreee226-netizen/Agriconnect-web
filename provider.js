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
  card.className = 'role-card';
  card.style.cssText = 'background: #fff; border: 2px solid #f57c00; border-radius: 14px; padding: 14px; margin: 10px auto; max-width: 440px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); text-align: center; cursor: pointer;';
  
  card.innerHTML = `
    <div style="font-size: 28px; margin-bottom: 4px;">🚜</div>
    <div style="font-size: 16px; font-weight: bold; color: #e65100;">వాహనాలు & యంత్రాల యజమాని</div>
    <p style="font-size: 12px; color: #666; margin: 6px 0 10px 0;">ట్రాక్టర్లు, హార్వెస్టర్లు, రవాణా వాహనాలు అద్దెకు ఇవ్వడానికి ఇక్కడ నమోదు చేసుకోండి</p>
    <button onclick="openProviderModal()" style="background: #f57c00; color: #fff; border: none; padding: 8px 18px; border-radius: 20px; font-size: 13px; font-weight: bold; cursor: pointer;">
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
