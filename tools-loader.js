(function initAgriToolsBridge() {
  // 1. tools.css ని ఆటోమేటిక్‌గా <head> లోకి చేరుస్తుంది
  const cssLink = document.createElement("link");
  cssLink.rel = "stylesheet";
  cssLink.href = "tools.css";
  document.head.appendChild(cssLink);

  // 2. tools.html ఉంచడానికి ఒక ఖాళీ Box ని తయారు చేస్తుంది
  const containerBox = document.createElement("div");
  containerBox.id = "agri-tools-box";
  
  // ఈ స్క్రిప్ట్ ఎక్కడ ఉందో సరిగ్గా అక్కడే బాక్స్‌ను పెడుతుంది
  const currentScript = document.currentScript;
  if (currentScript && currentScript.parentNode) {
    currentScript.parentNode.insertBefore(containerBox, currentScript);
  }

  // 3. tools.html ను తీసుకొచ్చి ఆ బాక్స్‌లో పెడుతుంది
  fetch("tools.html")
    .then(res => res.text())
    .then(html => {
      containerBox.innerHTML = html;

      // 4. డిజైన్ రాగానే ఫంక్షన్స్ కోసం tools.js ను లోడ్ చేస్తుంది
      const scriptTag = document.createElement("script");
      scriptTag.src = "tools.js";
      document.body.appendChild(scriptTag);
    })
    .catch(err => console.error("Tools Component Loading Error:", err));
})();
