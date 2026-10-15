// ==================== COMPANY IMMUTABLE CONFIGURATION (TAMPER-PROOF) ====================
(function () {
  const companyData = Object.freeze({
    name: "AgriConnect Technologies",
    shortName: "AgriConnect",
    tagline: "The Voice of Smart Farming",
    udyamRegNo: "UDYAM-TS-31-0063048",
    location: "Maruthi Colony, Gopalpur, Hanamkonda, Telangana - 506370",
    copyrightYear: new Date().getFullYear(),
    appVersion: "v3.0.0",
    // బ్రాండింగ్ & లోగో వివరాలు
    branding: Object.freeze({
      headerLogo: "logo.png",
      icon192: "icon_192.png",
      icon512: "icon_512.png"
    })
  });

  Object.defineProperty(window, "COMPANY_CONFIG", {
    value: companyData,
    writable: false,
    configurable: false,
    enumerable: true
  });
})();

// HTML లో ఆటోమేటిక్‌గా అప్‌డేట్ అయ్యేలా చూసే ఫంక్షన్
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

    // Header Title & Logo ని dynamic గా సెట్ చేయడం
    const headerTitle = document.querySelector("header h1");
    if (headerTitle && window.COMPANY_CONFIG.branding?.headerLogo) {
      headerTitle.innerHTML = `<img src="${window.COMPANY_CONFIG.branding.headerLogo}" alt="${window.COMPANY_CONFIG.shortName}" class="app-logo"> ${window.COMPANY_CONFIG.shortName}`;
    }
    // Footer ని dynamic గా create చేసి add చేయడం
    let footer = document.querySelector("footer");
    if (!footer) {
      footer = document.createElement("footer");
      footer.className = "app-footer";
      document.body.appendChild(footer);
    }

       footer.innerHTML = `
      <p style="color: #4caf50; font-size: 13px; font-weight: 700; margin: 0 0 4px 0; letter-spacing: 0.5px;">${window.COMPANY_CONFIG.name}</p>
      <p style="margin: 3px 0; font-size: 11px; color: #e0e0e0; font-weight: 500;">Udyam Reg: <span style="color: #ffffff;">${window.COMPANY_CONFIG.udyamRegNo}</span></p>
      <p style="margin: 3px 0; font-size: 11px; color: #cfd8dc;">📍 ${window.COMPANY_CONFIG.location}</p>
      <p style="margin-top: 8px; color: #90a4ae; font-size: 10px;">© ${window.COMPANY_CONFIG.copyrightYear} ${window.COMPANY_CONFIG.name}. All rights reserved.</p>
    `;
        footer.style.cssText =
      "max-width: 420px; margin: 20px auto 10px auto; text-align: center; border-top: 1px solid #333; padding: 14px 10px; line-height: 1.5;";
  }

      // Header Tagline Setup (AgriConnect kinda chinnaga kurchovadaniki)
    const header = document.querySelector("header");
    if (header && !document.getElementById("header-tagline")) {
      const h1 = header.querySelector("h1");
      if (h1) {
        const textWrapper = document.createElement("div");
        textWrapper.style.cssText = "display: flex; flex-direction: column; justify-content: center; line-height: 1.1;";

        h1.parentNode.insertBefore(textWrapper, h1);
        h1.style.margin = "0";
        textWrapper.appendChild(h1);

        const p = document.createElement("p");
        p.id = "header-tagline";
        p.innerText = window.COMPANY_CONFIG?.tagline || "The Voice of Smart Farming";
        p.style.cssText = "margin: 2px 0 0 0; font-size: 10px; color: #e8f5e9; font-weight: 500; letter-spacing: 0.3px; opacity: 0.9;";
        textWrapper.appendChild(p);
      }
    }

document.addEventListener(
  "DOMContentLoaded",
  renderCompanyDetails
);

