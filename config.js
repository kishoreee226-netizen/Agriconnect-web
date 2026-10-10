// ================= COMPANY IMMUTABLE CONFIGURATION (TAMPER-PROOF) =================
(function () {
  const companyData = Object.freeze({
    name: "AgriConnect Technologies",
    tagline: "The Voice of Smart Farming",
    udyamRegNo: "UDYAM-TS-31-0063048",
    location: "Maruthi Colony, Gopalpur, Hanamkonda, Telangana - 506370",
    copyrightYear: new Date().getFullYear(),
    appVersion: "v3.0.0"
  });

  // Global window object లో COMPANY_CONFIG ని పూర్తిగా లాక్ చేయడం
  // ఎవరూ COMPANY_CONFIG = {} అని మార్చలేరు లేదా డిలీట్ చేయలేరు
  Object.defineProperty(window, "COMPANY_CONFIG", {
    value: companyData,
    writable: false,      // మార్చడానికి వీల్లేదు
    configurable: false,  // డిలీట్ చేయడానికి వీల్లేదు
    enumerable: true
  });
})();

// HTML లో వివరాలు ఆటోమేటిక్‌గా అప్‌డేట్ అయ్యేలా చూసే ఫంక్షన్
function renderCompanyDetails() {
  const elName = document.getElementById("cmp-name");
  const elUdyam = document.getElementById("cmp-udyam");
  const elAddress = document.getElementById("cmp-address");
  const elCopyright = document.getElementById("cmp-copyright");

  if (window.COMPANY_CONFIG) {
    if (elName) elName.textContent = window.COMPANY_CONFIG.name;
    if (elUdyam) elUdyam.textContent = window.COMPANY_CONFIG.udyamRegNo;
    if (elAddress) elAddress.textContent = `📍 ${window.COMPANY_CONFIG.location}`;
    if (elCopyright) elCopyright.textContent = `© ${window.COMPANY_CONFIG.copyrightYear} ${window.COMPANY_CONFIG.name}. All rights reserved.`;
  }
}

document.addEventListener("DOMContentLoaded", renderCompanyDetails);
