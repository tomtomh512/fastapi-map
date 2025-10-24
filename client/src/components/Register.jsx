import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import httpClient from "../httpClient";
import { setToken } from "../utils/tokenUtils";
import "../styles/Authentication.css";

export default function Register() {
    const [form, setForm] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    });
    const [alertMessage, setAlertMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const registerUser = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            setAlertMessage("Passwords do not match");
            return;
        }

        try {
            await httpClient.post(`${import.meta.env.VITE_SERVER_API_URL}/auth/register`, {
                username: form.username,
                password: form.password,
            });

            // Log in immediately after registering
            const loginData = new URLSearchParams();
            loginData.append("username", form.username);
            loginData.append("password", form.password);

            const loginResponse = await httpClient.post(
                `${import.meta.env.VITE_SERVER_API_URL}/auth/login`,
                loginData,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            setToken(loginResponse.data.access_token);
            navigate("/profile");
        } catch (error) {
            console.log("Error registering");
        }
    };

    return (
        <div className="login-register-container main-content-element">
            <h1>Register</h1>

            <form onSubmit={registerUser}>
                <label>Enter username</label>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    required
                />
                <br />

                <label>Enter password</label>
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
                <br />

                <label>Confirm password</label>
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                />
                <br />

                <button type="submit" className="login-logout-button">
                    Register
                </button>
            </form>

            {alertMessage && <p className="error-message">{alertMessage}</p>}

            <Link to="/profile" className="login-register-back-link">
                Back
            </Link>
        </div>
    );
}
