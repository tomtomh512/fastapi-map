def test_register_user(client):
    response = client.post(
        "/register",
        json={"username": "testuser", "password": "testpass"}
    )

    assert response.status_code == 200
    assert response.json()["message"] == "User registered successfully"


def test_login_user(client):
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
