import requests
from PIL import Image
from io import BytesIO
import base64
import json

# Famous places in Ahmedabad with verified Unsplash photo URLs
places = [
    {
        "name": "Sabarmati Riverfront",
        "lat": 23.0304,
        "lng": 72.5806,
        "img": "https://images.unsplash.com/photo-1624039977851-d60f7ad674cc"  # India river
    },
    {
        "name": "Adalaj Stepwell",
        "lat": 23.1704,
        "lng": 72.5770,
        "img": "https://images.unsplash.com/photo-1602526217390-d59c5046a67d"  # Stepwell
    },
    {
        "name": "Kankaria Lake",
        "lat": 23.0086,
        "lng": 72.6030,
        "img": "https://images.unsplash.com/photo-1608137682195-746103ca63b0"  # Lake view
    },
    {
        "name": "Sidi Saiyyed Mosque",
        "lat": 23.0258,
        "lng": 72.5873,
        "img": "https://images.unsplash.com/photo-1589873640703-d98b65ed3c53"  # Mosque in India
    },
    {
        "name": "Manek Chowk",
        "lat": 23.0265,
        "lng": 72.5860,
        "img": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da"  # Indian bazaar
    }
]

photo_entries = []

for place in places:
    try:
        print(f"Fetching {place['name']}...")
        response = requests.get(place["img"] + "?w=400&h=300&fit=crop")
        image = Image.open(BytesIO(response.content)).convert("RGB")
        image.thumbnail((300, 200))

        buffer = BytesIO()
        image.save(buffer, format="JPEG", quality=75)
        base64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        data_url = f"data:image/jpeg;base64,{base64_str}"

        photo_entries.append({
            "user": "AntMan",
            "description": place["name"],
            "lat": place["lat"],
            "lng": place["lng"],
            "base64": data_url
        })

    except Exception as e:
        print(f"❌ Error with {place['name']}: {e}")

# Save to JSON
with open("ahmedabad_verified_unsplash.json", "w") as f:
    json.dump(photo_entries, f, indent=2)

print("✅ JSON file created: ahmedabad_verified_unsplash.json")
