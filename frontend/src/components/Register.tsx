import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import httpClient from "../httpClient";
import "../styles/Authentication.css";
import { getAxiosErrorMessage } from "../utils/axiosError.ts";

const Register: React.FC = () => {
    const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" });
    const [alertMessage, setAlertMessage] = useState<string>("");
    const navigate = useNavigate();

    const handleChange = (e: { target: { name: string; value: string; }; }) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const registerUser = async (e: { preventDefault: () => void; }) => {
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
            navigate("/login");
        } catch (error: unknown) {
            setAlertMessage(getAxiosErrorMessage(error));
        }
    };

    return (
        <div className="login-register-container main-content-element">
            <h1>Register</h1>
            <form onSubmit={registerUser}>
                <label>Username</label>
                <input type="text" name="username" value={form.username} onChange={handleChange} required />
                <label>Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required />
                <label>Confirm Password</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
                {alertMessage && <p className="error-message">{alertMessage}</p>}
                <button type="submit" className="login-logout-button">Register</button>
            </form>
            <Link to="/profile" className="login-register-back-link">Back</Link>
        </div>
    );
};

export default Register;
