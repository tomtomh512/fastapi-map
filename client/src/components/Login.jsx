import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import httpClient from "../httpClient";
import { setToken } from "../utils/tokenUtils";
import "../styles/Authentication.css";

export default function Login() {
    const [form, setForm] = useState({ username: "", password: "" });
    const [alertMessage, setAlertMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const logInUser = async (e) => {
        e.preventDefault();
        try {
            const formDetails = new URLSearchParams(form);
            const response = await httpClient.post(
                `${import.meta.env.VITE_SERVER_API_URL}/auth/login`,
                formDetails,
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );
            setToken(response.data.access_token);
            navigate("/profile");
        } catch (error) {
            console.log("Error logging in")
        }
    };

    return (
        <div className="login-register-container main-content-element">
            <h1>Login</h1>
            <form onSubmit={logInUser}>
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
                <button type="submit" className="login-logout-button">Login</button>
            </form>
            {alertMessage && <p className="error-message">{alertMessage}</p>}
            <Link to="/profile" className="login-register-back-link">Back</Link>
        </div>
    );
}
