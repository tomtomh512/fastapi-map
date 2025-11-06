from app.models import User, List

def test_register(client):
    response = client.post("/register", json={"username": "testuser", "password": "testpass"})

    assert response.status_code == 200
    assert response.json()["message"] == "User registered successfully"

def test_register_dup(client):
    client.post("/register", json={"username": "testuser", "password": "testpass"})

    response2 = client.post("/register", json={"username": "testuser", "password": "testpass"})

    assert response2.status_code == 400
    assert response2.json()["detail"] == "Username already registered"


def test_login(client):
    client.post("/register", json={"username": "testuser", "password": "testpass"})

    response = client.post(
        "/token",
        data={"username": "testuser", "password": "testpass"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["username"] == "testuser"
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client):
    client.post("/register", json={"username": "testuser", "password": "testpass"})

    response = client.post(
        "/token",
        data={"username": "testuser", "password": "testpass123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password"

def test_verify_token(client):
    client.post("/register", json={"username": "testuser", "password": "testpass"})

    response = client.post(
        "/token",
        data={"username": "testuser", "password": "testpass"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    data = response.json()
    token = data["access_token"]

    response = client.post("/verify-token", json={"token": token})
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["message"] == "Token is valid"

def test_verify_token_invalid(client):
    response = client.post("/verify-token", json={"token": "11122333"})
    assert response.status_code == 403
    assert response.json()["detail"] == "Token invalid or expired"

def test_register_creates_default_lists(client, db):
    response = client.post("/register", json={"username": "testuser", "password": "testpass"})

    user = db.query(User).filter(User.username == "testuser").first()
    lists = db.query(List).filter(List.user_id == user.id).all()

    assert response.status_code == 200
    assert len(lists) == 2
    assert {l.name for l in lists} == {"Favorites", "Planned"}
    assert all(l.is_default for l in lists)