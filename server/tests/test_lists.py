import pytest
from app.models import User, List

def login_and_get_cookies(client, username="testuser", password="testpass"):
    client.post("/auth/register", json={"username": username, "password": password})
    resp = client.post("/auth/login", json={"username": username, "password": password})
    return resp.cookies

def test_create_and_get_lists(client, db):
    cookies = login_and_get_cookies(client)

    client.post("/lists", json={"name": "testlist1"}, cookies=cookies)
    client.post("/lists", json={"name": "testlist2"}, cookies=cookies)

    user = db.query(User).filter(User.username == "testuser").first()
    lists = db.query(List).filter(List.user_id == user.id).all()

    assert len(lists) == 4
    assert {l.name for l in lists} == {"Favorites", "Planned", "testlist1", "testlist2"}

    response = client.get("/lists", cookies=cookies)
    data = response.json()
    expected_names = {l.name for l in lists}

    assert response.status_code == 200
    assert {l["name"] for l in data} == expected_names

def test_get_specific_list(client, db):
    cookies = login_and_get_cookies(client)
    response = client.get("/lists", cookies=cookies)
    lists = response.json()
    favorites = next(l for l in lists if l["name"] == "Favorites")
    favorites_id = favorites["id"]

    response = client.get(f"/lists/{favorites_id}", cookies=cookies)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == favorites_id
    assert data["name"] == "Favorites"
    assert data["is_default"] is True
    assert data["locations"] == []

def test_get_nonexistent_list(client):
    cookies = login_and_get_cookies(client)
    response = client.get("/lists/9999", cookies=cookies)

    assert response.status_code == 404
    assert response.json()["detail"] == "List not found"

def test_delete_list(client):
    cookies = login_and_get_cookies(client)
    client.post("/lists", json={"name": "testlist1"}, cookies=cookies)

    response = client.get("/lists", cookies=cookies)
    lists = response.json()
    testlist = next(l for l in lists if l["name"] == "testlist1")
    testlist_id = testlist["id"]

    response = client.delete(f"/lists/{testlist_id}", cookies=cookies)

    assert response.status_code == 200
    assert response.json()["message"] == f"List '{testlist['name']}' deleted successfully"

def test_delete_default_list(client):
    cookies = login_and_get_cookies(client)

    response = client.get("/lists", cookies=cookies)
    favorites = next(l for l in response.json() if l["name"] == "Favorites")
    favorites_id = favorites["id"]

    response = client.delete(f"/lists/{favorites_id}", cookies=cookies)

    assert response.status_code == 403
    assert response.json()["detail"] == "Default lists cannot be deleted"

def test_delete_nonexistent_list(client):
    cookies = login_and_get_cookies(client)
    response = client.delete("/lists/9999", cookies=cookies)

    assert response.status_code == 404
    assert response.json()["detail"] == "List not found"
