import json
import requests
import datetime

# Official Data.gov.in Agmarknet Resource URL & Live API Key
API_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
API_KEY = "579b464db66ec23bdd0000012873d6e8fa3847a564325d817ed2b023"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json"
}

params = {
    "api-key": API_KEY,
    "format": "json",
    "limit": "100"
}

today_str = datetime.datetime.now().strftime("%d/%m/%Y")
data = None

print("కేంద్ర ప్రభుత్వ సర్వర్ నుండి లైవ్ మండి డేటా తెస్తున్నాము...")

try:
    response = requests.get(API_URL, params=params, headers=headers, timeout=25)
    print(f"Server response code: {response.status_code}")
    
    if response.status_code == 200:
        res_json = response.json()
        records = res_json.get("records", [])
        if records:
            data = {
                "updated_at": today_str,
                "status": "live",
                "total": len(records),
                "records": records
            }
            print(f"సక్సెస్! {len(records)} లైవ్ రికార్డులు వచ్చాయి.")
        else:
            print("API రెస్పాన్స్ వచ్చింది కానీ రికార్డులు ఖాళీగా ఉన్నాయి.")
    else:
        print(f"API రెస్పాన్స్ ఫెయిల్ అయింది: {response.status_code} - {response.text[:200]}")
except Exception as err:
    print(f"కనెక్షన్ సమస్య: {err}")

# ఒకవేళ సర్వర్ రెస్పాన్స్ రాలేకపోతే పాత డేటా పోకుండా భద్రపరచడం
if not data:
    try:
        with open("mandi_live.json", "r", encoding="utf-8") as f:
            old = json.load(f)
            if old.get("records"):
                data = old
                print("పాత mandi_live.json డేటా భద్రపరచబడింది.")
    except Exception:
        pass

if not data:
    data = {
        "updated_at": today_str,
        "records": [],
        "status": "temporary_error"
    }

with open("mandi_live.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("mandi_live.json ఫైల్ విజయవంతంగా సేవ్ చేయబడింది.")
