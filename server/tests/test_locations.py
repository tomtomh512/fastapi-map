import pytest
from app.models import User, List, Location, ListLocation

def login_and_get_cookies(client, username="testuser", password="testpass"):
    client.post("/auth/register", json={"username": username, "password": password})
    resp = client.post("/auth/login", json={"username": username, "password": password})
    return resp.cookies

def test_add_location(client, db):
    cookies = login_and_get_cookies(client)

    # Get Favorites list
    lists = client.get("/lists", cookies=cookies).json()
    favorites = next(l for l in lists if l["name"] == "Favorites")
    favorites_id = favorites["id"]

    location_data = {
        "name": "Test Location",
        "address": "123 Main St",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "place_id": "test123",
        "category": "restaurant"
    }

    response = client.post(f"/locations/{favorites_id}", json=location_data, cookies=cookies)

    assert response.status_code == 200
    assert response.json()["message"] == f"Location added to list 'Favorites'"

def test_add_existing_location(client, db):
    cookies = login_and_get_cookies(client)
    lists = client.get("/lists", cookies=cookies).json()
    favorites_id = next(l for l in lists if l["name"] == "Favorites")["id"]

    location_data = {
        "name": "Test Location",
        "address": "123 Main St",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "place_id": "test123",
        "category": "restaurant"
    }

    # Add location first time
    client.post(f"/locations/{favorites_id}", json=location_data, cookies=cookies)
    # Add location second time (should fail)
    response = client.post(f"/locations/{favorites_id}", json=location_data, cookies=cookies)

    assert response.status_code == 400
    assert response.json()["detail"] == "Location already in list"

def test_remove_location(client, db):
    cookies = login_and_get_cookies(client)
    favorites_id = next(l for l in client.get("/lists", cookies=cookies).json() if l["name"] == "Favorites")["id"]

    location_data = {
        "name": "Test Location",
        "address": "123 Main St",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "place_id": "test123",
        "category": "restaurant"
    }

    client.post(f"/locations/{favorites_id}", json=location_data, cookies=cookies)
    response = client.delete(f"/locations/{favorites_id}/test123", cookies=cookies)

    assert response.status_code == 200
    assert response.json()["message"] == "Location removed"

def test_remove_nonexistent_location(client, db):
    cookies = login_and_get_cookies(client)
    favorites_id = next(l for l in client.get("/lists", cookies=cookies).json() if l["name"] == "Favorites")["id"]
    response = client.delete(f"/locations/{favorites_id}/nonexistent", cookies=cookies)

    assert response.status_code == 404
    assert response.json()["detail"] in ["Location not found", "Location not in list"]

def test_check_location(client, db):
    cookies = login_and_get_cookies(client)

    # Create an extra list
    client.post("/lists", json={"name": "testlist1"}, cookies=cookies)
    lists = client.get("/lists", cookies=cookies).json()
    favorites_id = next(l["id"] for l in lists if l["name"] == "Favorites")
    testlist_id = next(l["id"] for l in lists if l["name"] == "testlist1")

    location_data = {
        "name": "Test Location",
        "address": "123 Main St",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "place_id": "test123",
        "category": "restaurant"
    }

    client.post(f"/locations/{favorites_id}", json=location_data, cookies=cookies)
    client.post(f"/locations/{testlist_id}", json=location_data, cookies=cookies)

    response = client.get("/locations/check-location/test123", cookies=cookies)
    assert response.status_code == 200
    data = response.json()

    # Expected results: Favorites and testlist1 have the location, Planned does not
    expected_names = {l["name"]: l["id"] for l in lists}
    results_dict = {r["name"]: r for r in data}

    assert results_dict["Favorites"]["added"] is True
    assert results_dict["Planned"]["added"] is False
    assert results_dict["testlist1"]["added"] is True
