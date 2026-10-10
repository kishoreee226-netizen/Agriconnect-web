// ================= COMPANY IMMUTABLE CONFIGURATION =================
const COMPANY_CONFIG = Object.freeze({
  name: "AgriConnect Technologies",
  tagline: "The Voice of Smart Farming",
  udyamRegNo: "UDYAM-TS-31-0063048",
  location: "Maruthi Colony, Gopalpur, Hanamkonda, Telangana - 506370",
  copyrightYear: new Date().getFullYear(),
  supportEmail: "support@agriconnect.in", // మీ అఫీషియల్ ఈమెయిల్
  appVersion: "v3.0.0"
});

// HTML లోని ప్లేస్‌హోల్డర్స్‌లోకి వివరాలను ఆటోమేటిక్‌గా నింపే ఫంక్షన్
function renderCompanyDetails() {
  const elName = document.getElementById("cmp-name");
  const elUdyam = document.getElementById("cmp-udyam");
  const elAddress = document.getElementById("cmp-address");
  const elCopyright = document.getElementById("cmp-copyright");

  if (elName) elName.textContent = COMPANY_CONFIG.name;
  if (elUdyam) elUdyam.textContent = COMPANY_CONFIG.udyamRegNo;
  if (elAddress) elAddress.textContent = `📍 ${COMPANY_CONFIG.location}`;
  if (elCopyright) elCopyright.textContent = `© ${COMPANY_CONFIG.copyrightYear} ${COMPANY_CONFIG.name}. All rights reserved.`;
}

// పేజీ లోడ్ అవ్వగానే వివరాలు ఆటోమేటిక్‌గా డిస్‌ప్లే అవుతాయి
document.addEventListener("DOMContentLoaded", renderCompanyDetails);
