from app.models import User, List

def test_create_and_get_lists(client, db):
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

    client.post(
        "/lists/",
        json={"name": "testlist2"},
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }
    )

    user = db.query(User).filter(User.username == "testuser").first()
    lists = db.query(List).filter(List.user_id == user.id).all()

    assert len(lists) == 4
    assert {l.name for l in lists} == {"Favorites", "Planned", "testlist1", "testlist2"}

    response = client.get(
        "/lists/",
        headers={
            "Authorization": f"Bearer {access_token}"
        }
    )

    data = response.json()

    assert response.status_code == 200
    assert len(data) == 4

    for l in data:
        assert "id" in l
        assert "name" in l
        assert "is_default" in l

def test_get_specific_list(client, db):
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

    response = client.get(
        f"/lists/{favoritesId}/",
        headers={
            "Authorization": f"Bearer {access_token}"
        }
    )

    assert response.status_code == 200

    data = response.json()
    assert "id" in data
    assert "name" in data
    assert "locations" in data
    assert "is_default" in data

def test_get_nonexistent_list(client, db):
    client.post("/register", json={"username": "testuser", "password": "testpass"})

    loginResponse = client.post(
        "/token",
        data={"username": "testuser", "password": "testpass"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    access_token = loginResponse.json()["access_token"]

    response = client.get(
        f"/lists/{favoritesId + 100}/",
        headers={
            "Authorization": f"Bearer {access_token}"
        }
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "List not found"

def test_delete_list(client, db):
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
    global testListId

    for l in listsData:
        if l["name"] == "testlist1":
            testListId = l["id"]

    response = client.delete(
        f"/lists/{testListId}/",
        headers={
            "Authorization": f"Bearer {access_token}"
        }
    )

    assert response.status_code == 200

    data = response.json()
    assert data["message"] == "List testlist1 deleted successfully"

def test_delete_default_list(client, db):
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
        f"/lists/{favoritesId}/",
        headers={
            "Authorization": f"Bearer {access_token}"
        }
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Default lists cannot be deleted"

def test_delete_nonexistent_list(client, db):
    client.post("/register", json={"username": "testuser", "password": "testpass"})

    loginResponse = client.post(
        "/token",
        data={"username": "testuser", "password": "testpass"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    access_token = loginResponse.json()["access_token"]

    response = client.delete(
        f"/lists/{favoritesId + 100}/",
        headers={
            "Authorization": f"Bearer {access_token}"
        }
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "List not found"
