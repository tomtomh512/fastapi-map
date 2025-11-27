import pytest
from app.models import User, List

def test_register(client):
    response = client.post("/auth/register", json={"username": "testuser", "password": "testpass"})
    assert response.status_code == 200
    assert response.json()["message"] == "User registered"
    assert response.json()["user"]["username"] == "testuser"

def test_register_dup(client):
    client.post("/auth/register", json={"username": "testuser", "password": "testpass"})
    response2 = client.post("/auth/register", json={"username": "testuser", "password": "testpass"})
    assert response2.status_code == 400
    assert response2.json()["detail"] == "Username already taken"

def test_register_creates_default_lists(client, db):
    response = client.post("/auth/register", json={"username": "testuser", "password": "testpass"})
    user = db.query(User).filter(User.username == "testuser").first()
    lists = db.query(List).filter(List.user_id == user.id).all()

    assert response.status_code == 200
    assert len(lists) == 2
    assert {l.name for l in lists} == {"Favorites", "Planned"}
    assert all(l.is_default for l in lists)

def test_login_sets_cookies(client):
    client.post("/auth/register", json={"username": "testuser", "password": "testpass"})
    response = client.post("/auth/login", json={"username": "testuser", "password": "testpass"})

    assert response.status_code == 200
    assert "Logged in" in response.json()["message"]

    # Check that cookies are set
    cookies = response.cookies
    assert "access_token" in cookies
    assert "refresh_token" in cookies

def test_login_wrong_password(client):
    client.post("/auth/register", json={"username": "testuser", "password": "testpass"})
    response = client.post("/auth/login", json={"username": "testuser", "password": "wrongpass"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

def test_me_returns_user(client):
    client.post("/auth/register", json={"username": "testuser", "password": "testpass"})
    login_resp = client.post("/auth/login", json={"username": "testuser", "password": "testpass"})
    cookies = login_resp.cookies
    response = client.get("/auth/me", cookies=cookies)

    assert response.status_code == 200
    assert response.json()["username"] == "testuser"

def test_me_unauthenticated(client):
    response = client.get("/auth/me")

    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"

def test_refresh_token(client):
    client.post("/auth/register", json={"username": "testuser", "password": "testpass"})
    login_resp = client.post("/auth/login", json={"username": "testuser", "password": "testpass"})
    refresh_cookie = {"refresh_token": login_resp.cookies.get("refresh_token")}
    response = client.post("/auth/refresh", cookies=refresh_cookie)

    assert response.status_code == 200
    assert response.json()["message"] == "Token refreshed"
    # Should set new cookies
    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies

def test_logout_clears_cookies(client):
    response = client.post("/auth/logout")

    assert response.status_code == 200
    assert response.json()["message"] == "Logged out"
    # Check cookies cleared (set to empty string)
    assert "access_token" not in response.cookies
    assert "refresh_token" not in response.cookies