// voice.js - Voice of Smart Farming Core Assistant

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognitionInstance = null;
let pendingVoiceSubmission = false;

// Helper: Check if Auto Voice checkbox is ON
function isAutoVoiceEnabled() {
  const chk = document.getElementById("auto-voice-check") || 
              document.querySelector("input[type='checkbox']");
  if (chk) return chk.checked;
  return window.AppState ? !!window.AppState.autoVoice : false;
}

// 1. Voice Command Processing Logic
function handleVoiceCommand(voiceText) {
  if (!voiceText) return;
  const input = voiceText.toLowerCase().trim();
  console.log("Processing Voice:", input);

  // A. Submit Confirmation
  if (pendingVoiceSubmission) {
    if (input.includes("సరే") || input.includes("చేయ్") || input.includes("పోస్ట్") || input.includes("submit") || input.includes("ఓకే") || input.includes("అవును")) {
      pendingVoiceSubmission = false;
      const submitBtn = document.querySelector("button[onclick*='postJob'], .btn-submit, #submit-job-btn") || 
                        document.querySelector("button:has(.fa-paper-plane)") || 
                        document.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.click();
        speakTeluguText("కూలీల కోసం పని విజయవంతంగా పోస్ట్ చేయబడింది.", null, true);
      } else {
        speakTeluguText("వివరాలు సబ్మిట్ చేయబడ్డాయి.", null, true);
      }
      return;
    } else if (input.includes("వద్దు") || input.includes("ఆపు") || input.includes("కాదు")) {
      pendingVoiceSubmission = false;
      speakTeluguText("సరే, వివరాలు పోస్ట్ చేయలేదు.", null, true);
      return;
    }
  }

  // B. Farmer Mode: Auto Fill Form
  if (!window.AppState || window.AppState.currentRole === "FARMER") {
    let crop = "";
    let workType = "";
    let count = "";
    let wage = "";

    const cropKeywords = [
      "వరి", "పత్తి", "మిర్చి", "మిరప", "మొక్కజొన్న", "పసుపు", 
      "వేరుశనగ", "పల్లీ", "కంది", "పెసర", "మినుము", "సోయాబీన్", 
      "మామిడి", "టమాటా", "కూరగాయలు"
    ];
    for (let c of cropKeywords) {
      if (input.includes(c)) {
        crop = c;
        break;
      }
    }
    if (!crop) {
      const genericMatch = input.match(/([^\s]+)\s*(పంట|తోట)/);
      if (genericMatch) crop = genericMatch[1];
    }

    if (input.includes("కోత")) workType = "కోత";
    else if (input.includes("తీత") || input.includes("ఏరడం")) workType = "తీత";
    else if (input.includes("నాటు") || input.includes("నాట్లు")) workType = "నాట్లు";
    else if (input.includes("కలుపు")) workType = "కలుపు తీత";

    const countMatch = input.match(/(\d+)\s*(మంది|గురు|కూలీలు)?/);
    if (countMatch) {
      count = countMatch[1];
    } else {
      if (input.includes("ఒక్కరు") || input.includes("ఒకరు")) count = "1";
      else if (input.includes("ఇద్దరు") || input.includes("రెండు")) count = "2";
      else if (input.includes("ముగ్గురు") || input.includes("మూడు")) count = "3";
      else if (input.includes("నలుగురు") || input.includes("నాలుగు")) count = "4";
      else if (input.includes("ఐదుగురు") || input.includes("ఐదు")) count = "5";
      else if (input.includes("ఆరుగురు") || input.includes("ఆరు")) count = "6";
    }

    const wageMatch = input.match(/(\d{3,4})\s*(రూపాయలు|రూ)?/);
    if (wageMatch) {
      wage = wageMatch[1];
    }

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
      
      speakTeluguText(reply, () => {
        startListening();
      }, true);
      return;
    }
  }

  // General Commands
  if (input.includes("ఖాతా") || input.includes("వాలెట్")) {
    speakTeluguText("మీ వాలెట్ వివరాలు ఇక్కడ ఉన్నాయి.", null, true);
    document.getElementById("wallet-container")?.scrollIntoView({ behavior: "smooth" });
  } else if (input.includes("ధర") || input.includes("మార్కెట్") || input.includes("మండి")) {
    speakTeluguText("మార్కెట్ లైవ్ ధరల వివరాలు ఇక్కడ ఉన్నాయి.", null, true);
    document.getElementById("mandi-container")?.scrollIntoView({ behavior: "smooth" });
  } else {
    speakTeluguText("మీరు చెప్పింది అర్థం కాలేదు, దయచేసి వివరాలు మళ్లీ స్పష్టంగా చెప్పండి.", null, true);
  }
}

// Mic On Cheyadam
function startListening() {
  const micBtn = document.getElementById("global-voice-btn");
  if (recognitionInstance) {
    try {
      recognitionInstance.start();
      if (micBtn) micBtn.classList.add("listening");
    } catch (e) {}
  }
}

// 2. Voice Assistant Initialization
function initVoiceAssistant() {
  if (document.getElementById("global-voice-btn")) return;

  const micBtn = document.createElement("button");
  micBtn.id = "global-voice-btn";
  micBtn.className = "floating-mic-btn";
  micBtn.innerHTML = "🎙️";
  micBtn.title = "మాట్లాడండి";
  micBtn.style.cssText = "position:fixed; bottom:20px; right:20px; width:52px; height:52px; border-radius:50%; background:#2e7d32; color:#fff; border:none; font-size:22px; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.3); z-index:9999;";
  document.body.appendChild(micBtn);

  if (!SpeechRecognition) {
    micBtn.addEventListener("click", () => {
      alert("మీ బ్రౌజర్‌లో Voice Speech API సపోర్ట్ లేదు. దయచేసి Google Chrome వాడండి.");
    });
    return;
  }

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
      } catch (err) {
        console.error("Mic start error:", err);
      }
    } else {
      recognitionInstance.stop();
      micBtn.style.background = "#2e7d32";
      isListening = false;
    }
  });

  recognitionInstance.onresult = function(event) {
    micBtn.style.background = "#2e7d32";
    isListening = false;
    const transcript = event.results[event.results.length - 1][0].transcript;
    console.log("Transcribed text:", transcript);
    handleVoiceCommand(transcript);
  };

  recognitionInstance.onerror = (event) => {
    micBtn.style.background = "#2e7d32";
    isListening = false;
    console.error("Speech Error:", event.error);
  };

  recognitionInstance.onend = () => {
    micBtn.style.background = "#2e7d32";
    isListening = false;
  };
}

// 3. Telugu Text to Speech (TTS)
function speakTeluguText(msg, onEndCallback, forceSpeak = false) {
  if (!forceSpeak && !isAutoVoiceEnabled()) {
    return; // Auto Voice checkbox OFF lo unte matladadhu
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

// 4. Auto Voice Toggle Logic
window.toggleAutoVoice = function(isEnabled) {
  if (window.AppState) {
    window.AppState.autoVoice = isEnabled;
  }
  
  if (isEnabled) {
    speakTeluguText("ఆటో వాయిస్ గైడెన్స్ ఆన్ చేయబడింది.", null, true);

    setTimeout(() => {
      if (!window.AppState || !window.AppState.isLoggedIn) {
        speakTeluguText(
          "నమస్కారం! అగ్రి-కనెక్ట్‌కి స్వాగతం. మీరు కూలీ పనులకు వెళ్లేవారైతే కూలీ ఆప్షన్, వ్యవసాయం చేసే రైతు సోదరులైతే రైతు ఆప్షన్ ఎంచుకోండి.", null, true
        );
        return;
      }

      if (window.AppState.userType === "LABOUR_ONLY") {
        speakTeluguText("కూలీ ఖాతాలోకి స్వాగతం. ఇక్కడ మీకు అందుబాటులో ఉన్న పనులు మరియు మీ వాలెట్ వివరాలు కనిపిస్తాయి.", null, true);
        return;
      }

      if (window.AppState.userType === "FARMER") {
        if (window.AppState.currentRole === "LABOUR") {
          speakTeluguText("రైతు సోదరా, మీరు ప్రస్తుతం కూలీ మోడ్‌లో ఉన్నారు. పనుల వివరాలు కనిపిస్తున్నాయి.", null, true);
        } else {
          speakTeluguText("రైతు డాష్‌బోర్డ్‌కి స్వాగతం. మీకు ఏ పంట పనికి కూలీలు కావాలో మైక్ నొక్కి చెప్పండి.", null, true);
        }
      }
    }, 1200);
  } else {
    speakTeluguText("ఆటోమేటిక్ వాయిస్ ఆఫ్ చేయబడింది.", null, true);
  }
};

// 5. Checkbox Sync Event
function setupCheckboxListener() {
  const existingCheck = document.getElementById("auto-voice-check") || 
                        document.querySelector("input[type='checkbox']");
  if (existingCheck) {
    existingCheck.id = "auto-voice-check";
    existingCheck.onchange = function() {
      window.toggleAutoVoice(this.checked);
    };
  }
}

// Global functions setup
window.speakTeluguText = speakTeluguText;
window.startListening = startListening;

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", () => {
    initVoiceAssistant();
    setupCheckboxListener();
  });
} else {
  initVoiceAssistant();
  setupCheckboxListener();
}
