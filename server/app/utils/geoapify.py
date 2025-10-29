import requests
from fastapi import HTTPException
from app.core.config import API_KEY

def search_query(query: str, lat: str, long: str, limit: int):
    base_url = "https://api.geoapify.com/v1/geocode/search"
    params = {
        "text": query,
        "bias": f"proximity:{long},{lat}|circle:{long},{lat},5000",
        "format": "json",
        "limit": limit,
        "apiKey": API_KEY,
    }

    response = requests.get(base_url, params=params)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch data")

    data = response.json()
    results = []
    for feature in data.get("results", []):
        name = feature.get("name") or feature.get("address_line1") or "Unknown"
        address = feature.get("formatted")
        lat = feature.get("lat")
        lon = feature.get("lon")
        place_id = feature.get("place_id")
        category = feature.get("category")
        confidence = feature.get("rank", {}).get("confidence", 0)
        distance = feature.get("distance", 0)
        score = confidence - (distance / 1000) / ((distance / 1000) + 1)
        results.append({
            "name": name,
            "address": address,
            "latitude": lat,
            "longitude": lon,
            "place_id": place_id,
            "category": category,
            "score": score,
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results
