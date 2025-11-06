from app.models import User, List, Location, ListLocation

def test_add_location(client, db):
    client.post("/register", json={"username": "testuser", "password": "testpass"})
    loginResponse = client.post(
        "/token",
        data={"username": "testuser", "password": "testpass"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    access_token = loginResponse.json()["access_token"]

    listsResponse = client.get(
        "/lists/",
        headers={
            "Authorization": f"Bearer {access_token}"
        }
    )

    listsData = listsResponse.json()
    global favoritesId

    for l in listsData:
        if l["name"] == "Favorites":
            favoritesId = l["id"]

    location_data = {
        "name": "Test Location",
        "address": "123 Main St",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "place_id": "test123",
        "category": "restaurant"
    }

    response = client.post(
        f"/locations/{favoritesId}",
        json=location_data,
        headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 200
    assert response.json()["message"] == f"Location added to list 'Favorites'"

def test_add_existing_location(client, db):
    client.post("/register", json={"username": "testuser", "password": "testpass"})
    loginResponse = client.post(
        "/token",
        data={"username": "testuser", "password": "testpass"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    access_token = loginResponse.json()["access_token"]

    listsResponse = client.get(
        "/lists/",
        headers={
            "Authorization": f"Bearer {access_token}"
        }
    )

    listsData = listsResponse.json()
    global favoritesId

    for l in listsData:
        if l["name"] == "Favorites":
            favoritesId = l["id"]

    location_data = {
        "name": "Test Location",
        "address": "123 Main St",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "place_id": "test123",
        "category": "restaurant"
    }

    client.post(
        f"/locations/{favoritesId}",
        json=location_data,
        headers={"Authorization": f"Bearer {access_token}"}
    )

    location_data = {
        "name": "Test Location",
        "address": "123 Main St",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "place_id": "test123",
        "category": "restaurant"
    }

    response = client.post(
        f"/locations/{favoritesId}",
        json=location_data,
        headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Location already in list"

def test_remove_location(client, db):
    client.post("/register", json={"username": "testuser", "password": "testpass"})
    loginResponse = client.post(
        "/token",
        data={"username": "testuser", "password": "testpass"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    access_token = loginResponse.json()["access_token"]

    listsResponse = client.get(
        "/lists/",
        headers={
            "Authorization": f"Bearer {access_token}"
        }
    )

    listsData = listsResponse.json()
    global favoritesId

    for l in listsData:
        if l["name"] == "Favorites":
            favoritesId = l["id"]

    location_data = {
        "name": "Test Location",
        "address": "123 Main St",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "place_id": "test123",
        "category": "restaurant"
    }

    client.post(
        f"/locations/{favoritesId}",
        json=location_data,
        headers={"Authorization": f"Bearer {access_token}"}
    )

    response = client.delete(
        f"/locations/{favoritesId}/test123",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Location removed"

def test_remove_nonexistent_location(client, db):
    client.post("/register", json={"username": "testuser", "password": "testpass"})
    loginResponse = client.post(
        "/token",
        data={"username": "testuser", "password": "testpass"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    access_token = loginResponse.json()["access_token"]

    listsResponse = client.get(
        "/lists/",
        headers={
            "Authorization": f"Bearer {access_token}"
        }
    )

    listsData = listsResponse.json()
    global favoritesId

    for l in listsData:
        if l["name"] == "Favorites":
            favoritesId = l["id"]

    response = client.delete(
        f"/locations/{favoritesId}/test123",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Location not found"

def test_check_location(client, db):
    client.post("/register", json={"username": "testuser", "password": "testpass"})
    loginResponse = client.post(
        "/token",
        data={"username": "testuser", "password": "testpass"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    access_token = loginResponse.json()["access_token"]

    client.post(
        "/lists/",
        json={"name": "testlist1"},
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }
    )

    listsResponse = client.get(
        "/lists/",
        headers={
            "Authorization": f"Bearer {access_token}"
        }
    )

    listsData = listsResponse.json()
    global favoritesId
    global testListId

    for l in listsData:
        if l["name"] == "Favorites":
            favoritesId = l["id"]
        elif l["name"] == "testlist1":
            testListId = l["id"]

    location_data = {
        "name": "Test Location",
        "address": "123 Main St",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "place_id": "test123",
        "category": "restaurant"
    }

    client.post(
        f"/locations/{favoritesId}",
        json=location_data,
        headers={"Authorization": f"Bearer {access_token}"}
    )

    client.post(
        f"/locations/{testListId}",
        json=location_data,
        headers={"Authorization": f"Bearer {access_token}"}
    )

    response = client.get(
        f"/locations/check-location/test123",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 200

    data = response.json()

    expected = [
        {'added': True, 'id': 1, 'name': 'Favorites'},
        {'added': False, 'id': 2, 'name': 'Planned'},
        {'added': True, 'id': 3, 'name': 'testlist1'}
    ]

    assert data == expected