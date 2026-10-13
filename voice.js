// voice.js - Voice of Smart Farming Core Assistant

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function initVoiceAssistant() {
  if (document.getElementById("global-voice-btn")) return;

  const micBtn = document.createElement("button");
  micBtn.id = "global-voice-btn";
  micBtn.className = "floating-mic-btn";
  micBtn.innerHTML = "🎙️";
  micBtn.title = "మాట్లాడండి";
  document.body.appendChild(micBtn);

  if (!SpeechRecognition) {
    micBtn.addEventListener("click", () => {
      alert("మీ బ్రౌజర్‌లో Voice Speech API సపోర్ట్ లేదు. దయచేసి Google Chrome వాడండి.");
    });
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "te-IN";
  recognition.interimResults = false;
  let isListening = false;

  micBtn.addEventListener("click", () => {
    if (!isListening) {
      try {
        recognition.start();
        micBtn.classList.add("listening");
        isListening = true;
      } catch (err) {
        console.error("Mic start error:", err);
      }
    } else {
      recognition.stop();
      micBtn.classList.remove("listening");
      isListening = false;
    }
  });

  recognition.onresult = (event) => {
    micBtn.classList.remove("listening");
    isListening = false;
    const voiceText = event.results[0][0].transcript;
    console.log("యూజర్ మాట్లాడిన మాటలు:", voiceText);
    handleVoiceCommand(voiceText);
  };

  recognition.onerror = (event) => {
    micBtn.classList.remove("listening");
    isListening = false;
    console.error("Speech Error:", event.error);
  };

  recognition.onend = () => {
    micBtn.classList.remove("listening");
    isListening = false;
  };
}

function handleVoiceCommand(text) {
  const query = text.toLowerCase();
  console.log("Input maata:", query);

  // 1. Farmer Job Post Fill Logic
  if (query.includes("కూలీ") || query.includes("చేను") || query.includes("పని") || query.includes("మంది") || query.includes("రైతు")) {
    
    const cropInput = document.getElementById("f-crop");
    const workInput = document.getElementById("f-work");
    const countInput = document.getElementById("f-count");
    const wageInput = document.getElementById("f-wage");

    // పంట గుర్తింపు
    if (cropInput) {
      if (query.includes("వరి") || query.includes("వరిచేను")) cropInput.value = "వరి";
      else if (query.includes("పత్తి")) cropInput.value = "పత్తి";
      else if (query.includes("మిర్చి")) cropInput.value = "మిర్చి";
      else if (query.includes("మొక్కజొన్న")) cropInput.value = "మొక్కజొన్న";
    }

    // పని గుర్తింపు
    if (workInput) {
      if (query.includes("కోత")) workInput.value = "కోత";
      else if (query.includes("తీయడం") || query.includes("తీత") || query.includes("ఏరడం")) workInput.value = "తీత";
      else if (query.includes("నాటు") || query.includes("నాట్లు")) workInput.value = "నాట్లు";
      else workInput.value = "పని";
    }

    // కూలీల సంఖ్య & కూలీ రేటు
    const numbers = text.match(/\d+/g);
    if (numbers) {
      if (numbers.length >= 1 && countInput) countInput.value = numbers[0];
      if (numbers.length >= 2 && wageInput) wageInput.value = numbers[1];
    }

    speakTeluguText("రైతు ఫారంలో వివరాలు నమోదు చేశాము.");
    document.getElementById("farmer-post-container")?.scrollIntoView({ behavior: "smooth" });
  } 
  // 2. Wallet
  else if (query.includes("ఖాతా") || query.includes("పైసలు") || query.includes("డబ్బులు") || query.includes("వాలెట్")) {
    speakTeluguText("మీ వాలెట్ వివరాలు ఇక్కడ ఉన్నాయి.");
    document.getElementById("wallet-container")?.scrollIntoView({ behavior: "smooth" });
  } 
  // 3. Mandi
  else if (query.includes("ధర") || query.includes("రేటు") || query.includes("మార్కెట్") || query.includes("మండి")) {
    speakTeluguText("మార్కెట్ లైవ్ ధరల వివరాలు కింద ఉన్నాయి.");
    document.getElementById("mandi-container")?.scrollIntoView({ behavior: "smooth" });
  } 
  // 4. Default Labour jobs
  else {
    speakTeluguText("మీ మాట విన్నాము.");
    document.getElementById("labour-jobs-container")?.scrollIntoView({ behavior: "smooth" });
  }
}

// Telugu Audio Response (Text to Speech)
function speakTeluguText(msg) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.lang = "te-IN";
    window.speechSynthesis.speak(utterance);
  }
}

// Auto init on page load
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initVoiceAssistant);
} else {
  initVoiceAssistant();
}
// Auto Voice Toggle Function
window.toggleAutoVoice = function(isEnabled) {
  if (window.AppState) {
    window.AppState.autoVoice = isEnabled;
  }
  if (isEnabled && typeof speakTeluguText === "function") {
    speakTeluguText("ఆటోమేటిక్ వాయిస్ ఆన్ చేయబడింది. నేను ప్రతీదీ మీకు వివరించి అడుగుతాను.");
  } else if (!isEnabled && typeof speakTeluguText === "function") {
    speakTeluguText("ఆటోమేటిక్ వాయిస్ ఆఫ్ చేయబడింది.");
  }
};

// ఆటో వాయిస్ చెక్‌బాక్స్ బటన్‌ను స్క్రీన్‌పై చూపించడం (Auto Voice Toggle UI)
function renderAutoVoiceToggle() {
  if (document.getElementById("auto-voice-toggle-container")) return;

  const toggleDiv = document.createElement("div");
  toggleDiv.id = "auto-voice-toggle-container";
  toggleDiv.style.cssText = "display:flex; justify-content:center; align-items:center; gap:8px; font-size:13px; font-weight:bold; margin:8px 0; color:#2e7d32;";
  
  toggleDiv.innerHTML = `
    <label style="cursor:pointer; display:flex; align-items:center; gap:6px; background:#e8f5e9; padding:6px 14px; border-radius:16px; box-shadow:0 1px 4px rgba(0,0,0,0.1);">
      <input type="checkbox" id="auto-voice-check" onchange="toggleAutoVoice(this.checked)" style="width:16px; height:16px; cursor:pointer;">
      🤖 ఆటో వాయిస్ గైడెన్స్ (Auto Voice)
    </label>
  `;

  // రోల్ స్విచ్ బార్ కింద లేదా హెడర్ కింద ఇన్సర్ట్ చేయడం
  const roleBar = document.getElementById("role-switch-container");
  if (roleBar && roleBar.parentNode) {
    roleBar.parentNode.insertBefore(toggleDiv, roleBar.nextSibling);
  } else {
    document.body.prepend(toggleDiv);
  }
}

// పేజీ లోడ్ అయిన వెంటనే ఆటో వాయిస్ టోగుల్ కనిపిస్తుంది
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", renderAutoVoiceToggle);
} else {
  renderAutoVoiceToggle();
}
