import json
import requests
import datetime

# data.gov.in Agmarknet API URL
API_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
PARAMS = {
    "api-key": "579b464db66ec23bdd000001cdd3946e44ce4aad7209e40cd2323318",
    "format": "json",
    "limit": "500"
}

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*"
}

data = None

print("కేంద్ర ప్రభుత్వ సర్వర్ నుండి ఆల్-ఇండియా లైవ్ మార్కెట్ డేటా డౌన్‌లోడ్ అవుతోంది...")

try:
    response = requests.get(API_URL, params=PARAMS, headers=headers, timeout=25)
    print(f"HTTP Status Code: {response.status_code}")
    
    if response.status_code == 200:
        res_json = response.json()
        records = res_json.get("records", [])
        if records:
            data = {
                "updated_at": str(datetime.datetime.now()),
                "total": len(records),
                "records": records
            }
            print(f"విజయవంతంగా {len(records)} రికార్డులు డౌన్‌లోడ్ అయ్యాయి.")
        else:
            print("API రెస్పాన్స్ వచ్చింది కానీ రికార్డులు ఖాళీగా ఉన్నాయి:", res_json)
    else:
        print(f"API రెస్పాన్స్ ఫెయిల్ అయింది: {response.text[:200]}")
except Exception as e:
    print(f"కనెక్షన్ ఎర్రర్ వచ్చింది: {e}")

# డేటా రాకపోతే పాత డేటాను ఉంచే ప్రయత్నం
if not data:
    try:
        with open("mandi_live.json", "r", encoding="utf-8") as f:
            old = json.load(f)
            if old.get("records"):
                data = old
                print("పాత mandi_live.json డేటా బ్యాకప్‌గా కొనసాగించబడింది.")
    except Exception:
        pass

if not data:
    data = {
        "updated_at": str(datetime.datetime.now()),
        "records": [],
        "status": "temporary_error"
    }

with open("mandi_live.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("mandi_live.json ఫైల్ విజయవంతంగా రాయబడింది.")
