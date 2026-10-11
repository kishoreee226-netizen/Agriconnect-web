import json
import urllib.request
import urllib.parse

# కేంద్ర ప్రభుత్వ Agmarknet నేషనల్ లైవ్ రిసోర్స్
API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b"
RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"

# రాష్ట్రాల లిమిట్ లేకుండా ఆల్-ఇండియా లైవ్ రికార్డులు (గరిష్టంగా 5000 రికార్డులు)
url = f"https://api.data.gov.in/resource/{RESOURCE_ID}?api-key={API_KEY}&format=json&limit=5000"

print("కేంద్ర ప్రభుత్వ సర్వర్ నుండి ఆల్-ఇండియా లైవ్ మార్కెట్ డేటా డౌన్‌లోడ్ అవుతోంది...")

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
national_data = {}

try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        res = json.loads(resp.read().decode())
        records = res.get("records", [])
        print(f"మొత్తం భారతదేశం నుండి {len(records)} లైవ్ రికార్డులు వచ్చాయి!")

        # ప్రతి రాష్ట్రాన్ని ఆటోమేటిక్‌గా గుర్తించి వర్గీకరించడం
        for item in records:
            state_name = item.get("state", "").strip()
            if not state_name:
                continue
            
            # రాష్ట్రం ఇంకా లిస్ట్‌లో లేకపోతే కొత్త లిస్ట్ ప్రారంభించడం
            if state_name not in national_data:
                national_data[state_name] = []
            
            national_data[state_name].append({
                "commodity": item.get("commodity", "N/A"),
                "market": item.get("market", "N/A"),
                "district": item.get("district", "N/A"),
                "modal_price": item.get("modal_price", "--"),
                "min_price": item.get("min_price", "--"),
                "max_price": item.get("max_price", "--"),
                "arrival_date": item.get("arrival_date", "")
            })

    # అన్ని రాష్ట్రాల డేటాను mandi_live.json లో సేవ్ చేయడం
    with open("mandi_live.json", "w", encoding="utf-8") as f:
        json.dump(national_data, f, ensure_ascii=False, indent=2)

    print(f"విజయవంతంగా {len(national_data.keys())} రాష్ట్రాల డేటా mandi_live.json లో భద్రపరచబడింది!")

except Exception as e:
    print(f"ఎర్రర్ వచ్చింది: {e}")
