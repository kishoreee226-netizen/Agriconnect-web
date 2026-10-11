import json
import urllib.request
import urllib.error
import ssl

API_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209e40cd2323318&format=json&limit=1000"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json"
}

data = None

print("కేంద్ర ప్రభుత్వ సర్వర్ నుండి ఆల్-ఇండియా లైవ్ మార్కెట్ డేటా డౌన్‌లోడ్ అవుతోంది...")

try:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(API_URL, headers=headers)
    with urllib.request.urlopen(req, context=ctx, timeout=30) as response:
        if response.status == 200:
            payload = json.loads(response.read().decode('utf-8'))
            records = payload.get("records", [])
            if records:
                data = {"updated_at": payload.get("updated_date", ""), "records": records}
                print(f"విజయవంతంగా {len(records)} రికార్డులు డౌన్‌లోడ్ అయ్యాయి.")
except Exception as e:
    print(f"API ఎర్రర్ వచ్చింది: {e}")

# ఫైల్ తప్పనిసరిగా ఉండాలి కాబట్టి ఎర్రర్ వచ్చినా లేదా డేటా వచ్చినా mandi_live.json ని రాస్తుంది
if not data:
    try:
        with open("mandi_live.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            print("పాత mandi_live.json డేటాను బ్యాకప్‌గా ఉంచడం జరిగింది.")
    except Exception:
        data = {"records": [], "status": "temporary_error"}

with open("mandi_live.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("mandi_live.json ఫైల్ విజయవంతంగా సేవ్ చేయబడింది.")
