// voice.js - Voice of Smart Farming Core Assistant

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognitionInstance = null;
let pendingVoiceSubmission = false;

// 1. Helper: Check if Auto Voice is ON
function isAutoVoiceEnabled() {
  const chk = document.getElementById("auto-voice-check");
  if (chk) return chk.checked;
  return window.AppState ? !!window.AppState.autoVoice : false;
}

// 2. తెలుగు టెక్స్ట్ టు స్పీచ్ (Text-to-Speech)
function speakTeluguText(msg, onEndCallback, forceSpeak = false) {
  if (!forceSpeak && !isAutoVoiceEnabled()) {
    return; // చెక్‌బాక్స్ ఆన్‌లో లేకపోతే మాట్లాడదు
  }

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.lang = "te-IN";
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const teluguVoice = voices.find(v => v.lang === "te-IN" || v.lang.startsWith("te"));
    if (teluguVoice) {
      utterance.voice = teluguVoice;
    }
    
    if (onEndCallback) {
      utterance.onend = onEndCallback;
    }
    
    window.speechSynthesis.speak(utterance);
  }
}

if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

// 3. ఆటో వాయిస్ టోగుల్ లాజిక్
window.toggleAutoVoice = function(isEnabled) {
  if (window.AppState) {
    window.AppState.autoVoice = isEnabled;
  }
  
  if (isEnabled) {
    speakTeluguText("ఆటో వాయిస్ గైడెన్స్ ఆన్ చేయబడింది.", null, true);

    setTimeout(() => {
      if (!window.AppState || !window.AppState.isLoggedIn) {
        speakTeluguText(
          "నమస్కారం! అగ్రి-కనెక్ట్‌కి స్వాగతం. మీరు కూలీ పనులకు వెళ్లేవారైతే కూలీ ఆప్షన్ ఎంచుకోండి. వ్యవసాయం చేసే రైతు సోదరులైతే రైతు ఆప్షన్ ఎంచుకొని లాగిన్ అవ్వండి.", null, true
        );
        return;
      }

      if (window.AppState.userType === "LABOUR_ONLY" || window.AppState.currentRole === "LABOUR") {
        speakTeluguText("కూలీ ఖాతాలోకి స్వాగతం. మీకు అందుబాటులో ఉన్న పనులు మరియు వాలెట్ వివరాలు ఇక్కడ కనిపిస్తాయి.", null, true);
        return;
      }

      if (window.AppState.currentRole === "FARMER") {
        speakTeluguText("రైతు డాష్‌బోర్డ్‌కి స్వాగతం. మీకు ఏ పంట పనికి కూలీలు కావాలో కింద ఉన్న మైక్ నొక్కి చెప్పండి.", null, true);
      }
    }, 1300);
  } else {
    speakTeluguText("ఆటోమేటిక్ వాయిస్ ఆఫ్ చేయబడింది.", null, true);
  }
};

// 4. వాయిస్ కమాండ్ల ప్రాసెసింగ్
function handleVoiceCommand(voiceText) {
  if (!voiceText) return;
  const input = voiceText.toLowerCase().trim();

  // సబ్మిట్ కన్ఫర్మేషన్
  if (pendingVoiceSubmission) {
    if (input.includes("సరే") || input.includes("చేయ్") || input.includes("పోస్ట్") || input.includes("submit") || input.includes("ఓకే") || input.includes("అవును")) {
      pendingVoiceSubmission = false;
      const submitBtn = document.querySelector("button[onclick*='postJob'], .btn-submit, #submit-job-btn") || 
                        document.querySelector("button:has(.fa-paper-plane)") || 
                        document.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.click();
        speakTeluguText("కూలీల కోసం పని విజయవంతంగా పోస్ట్ చేయబడింది.", null, true);
      }
      return;
    } else if (input.includes("వద్దు") || input.includes("ఆపు") || input.includes("కాదు")) {
      pendingVoiceSubmission = false;
      speakTeluguText("సరే, వివరాలు పోస్ట్ చేయలేదు.", null, true);
      return;
    }
  }

  // రైతు మోడ్: ఆటో-ఫిల్
  let crop = "";
  let workType = "";
  let count = "";
  let wage = "";

  const cropKeywords = ["వరి", "పత్తి", "మిర్చి", "మిరప", "మొక్కజొన్న", "పసుపు", "వేరుశనగ", "పల్లీ", "కంది", "పెసర", "మినుము", "మామిడి", "టమాటా"];
  for (let c of cropKeywords) {
    if (input.includes(c)) { crop = c; break; }
  }

  if (input.includes("కోత")) workType = "కోత";
  else if (input.includes("తీత") || input.includes("ఏరడం")) workType = "తీత";
  else if (input.includes("నాటు") || input.includes("నాట్లు")) workType = "నాట్లు";
  else if (input.includes("కలుపు")) workType = "కలుపు తీత";

  const countMatch = input.match(/(\d+)\s*(మంది|గురు|కూలీలు)?/);
  if (countMatch) count = countMatch[1];

  const wageMatch = input.match(/(\d{3,4})\s*(రూపాయలు|రూ)?/);
  if (wageMatch) wage = wageMatch[1];

  const cropInput = document.getElementById("job-crop") || document.getElementById("f-crop") || document.querySelector("input[placeholder*='పంట']");
  const workInput = document.getElementById("job-work") || document.getElementById("f-work") || document.querySelector("input[placeholder*='పని']");
  const countInput = document.getElementById("job-count") || document.getElementById("f-count") || document.querySelector("input[placeholder*='సంఖ్య']");
  const wageInput = document.getElementById("job-wage") || document.getElementById("f-wage") || document.querySelector("input[placeholder*='కూలీ']");

  if (crop && cropInput) cropInput.value = crop;
  if (workType && workInput) workInput.value = workType;
  if (count && countInput) countInput.value = count;
  if (wage && wageInput) wageInput.value = wage;

  if (crop || workType || count || wage) {
    pendingVoiceSubmission = true;
    let reply = "వివరాలు నమోదు చేశాను. ";
    if (crop) reply += crop + " ";
    if (workType) reply += workType + " పనికి ";
    if (count) reply += count + " మంది కూలీలు, ";
    if (wage) reply += "రోజుకు " + wage + " రూపాయలు. ";
    reply += "పోస్ట్ చేయమంటారా?";
    speakTeluguText(reply, () => startListening(), true);
    return;
  }

  if (input.includes("ఖాతా") || input.includes("వాలెట్")) {
    speakTeluguText("మీ వాలెట్ వివరాలు ఇక్కడ ఉన్నాయి.", null, true);
    document.getElementById("wallet-container")?.scrollIntoView({ behavior: "smooth" });
  } else if (input.includes("ధర") || input.includes("మార్కెట్") || input.includes("మండి")) {
    speakTeluguText("మార్కెట్ లైవ్ ధరల వివరాలు ఇక్కడ ఉన్నాయి.", null, true);
    document.getElementById("mandi-container")?.scrollIntoView({ behavior: "smooth" });
  } else {
    speakTeluguText("మీరు చెప్పింది అర్థం కాలేదు, దయచేసి మళ్లీ స్పష్టంగా చెప్పండి.", null, true);
  }
}

// 5. మైక్ లిజనింగ్
function startListening() {
  const micBtn = document.getElementById("global-voice-btn");
  if (recognitionInstance) {
    try {
      recognitionInstance.start();
      if (micBtn) micBtn.style.background = "#d32f2f";
    } catch (e) {}
  }
}

function initVoiceAssistant() {
  if (!document.getElementById("global-voice-btn")) {
    const micBtn = document.createElement("button");
    micBtn.id = "global-voice-btn";
    micBtn.innerHTML = "🎙️";
    micBtn.title = "మాట్లాడండి";
    micBtn.style.cssText = "position:fixed; bottom:20px; right:20px; width:52px; height:52px; border-radius:50%; background:#2e7d32; color:#fff; border:none; font-size:22px; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.3); z-index:9999;";
    document.body.appendChild(micBtn);

    if (SpeechRecognition) {
      recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = "te-IN";
      recognitionInstance.interimResults = false;
      let isListening = false;

      micBtn.addEventListener("click", () => {
        if (!isListening) {
          try {
            recognitionInstance.start();
            micBtn.style.background = "#d32f2f";
            isListening = true;
          } catch (err) {}
        } else {
          recognitionInstance.stop();
          micBtn.style.background = "#2e7d32";
          isListening = false;
        }
      });

      recognitionInstance.onresult = (event) => {
        micBtn.style.background = "#2e7d32";
        isListening = false;
        handleVoiceCommand(event.results[event.results.length - 1][0].transcript);
      };

      recognitionInstance.onend = () => {
        micBtn.style.background = "#2e7d32";
        isListening = false;
      };
      
      recognitionInstance.onerror = () => {
        micBtn.style.background = "#2e7d32";
        isListening = false;
      };
    }
  }
}

// 6. హెడర్ కింద ఆటో వాయిస్ బాక్స్‌ను చూపించడం
function ensureAutoVoiceCheckbox() {
  let chk = document.getElementById("auto-voice-check");
  if (!chk) {
    const container = document.createElement("div");
    container.id = "auto-voice-box-wrapper";
    container.style.cssText = "display: flex; justify-content: center; align-items: center; margin: 10px 0 6px 0; width: 100%; z-index: 99;";

    container.innerHTML = `
      <label style="cursor: pointer; display: flex; align-items: center; gap: 8px; background: #e8f5e9; border: 1.5px solid #81c784; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; color: #2e7d32; box-shadow: 0 2px 5px rgba(0,0,0,0.06);">
        <input type="checkbox" id="auto-voice-check" style="width: 17px; height: 17px; cursor: pointer; accent-color: #2e7d32;">
        🤖 ఆటో వాయిస్ గైడెన్స్ (Auto Voice)
      </label>
    `;

    // గ్రీన్ కలర్ హెడర్ కింద యాడ్ చేయడం
    const header = document.querySelector(".header") || 
                   document.querySelector("header") || 
                   Array.from(document.querySelectorAll("div")).find(d => 
                     d.textContent && d.textContent.trim().startsWith("AgriConnect") && !d.id
                   ) || document.body.firstElementChild;

    if (header && header.parentNode) {
      header.parentNode.insertBefore(container, header.nextSibling);
    } else {
      document.body.prepend(container);
    }
  }

  const activeChk = document.getElementById("auto-voice-check");
  if (activeChk) {
    activeChk.onchange = function() {
      window.toggleAutoVoice(this.checked);
    };
  }
}

window.speakTeluguText = speakTeluguText;
window.startListening = startListening;

// లోడ్ అవ్వగానే ఎగ్జిక్యూట్ చేయడం
function runVoiceInit() {
  initVoiceAssistant();
  ensureAutoVoiceCheckbox();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", runVoiceInit);
} else {
  runVoiceInit();
}
// UI డైనమిక్ మార్పుల కోసం మళ్లీ చెక్ చేయడం
setTimeout(ensureAutoVoiceCheckbox, 500);
setTimeout(ensureAutoVoiceCheckbox, 1500);
