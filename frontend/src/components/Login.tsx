import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import httpClient from "../httpClient";
import "../styles/Authentication.css";
import { getAxiosErrorMessage } from "../utils/axiosError.ts";
import type { User } from "../types/types.ts";

interface LoginProps { setUser: React.Dispatch<React.SetStateAction<User | null>>; }

const Login: React.FC<LoginProps> = ({ setUser }) => {
    const [form, setForm] = useState({ username: "", password: "" });
    const [alertMessage, setAlertMessage] = useState<string>("");
    const navigate = useNavigate();

    const handleChange = (e: { target: { name: string; value: string; }; }) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const logInUser = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        try {
            const response = await httpClient.post(`${import.meta.env.VITE_SERVER_API_URL}/auth/login`, {
                username: form.username,
                password: form.password,
            });

            setUser({ id: response.data.user.id, username: response.data.user.username });
            navigate("/profile");
        } catch (error: unknown) {
            setAlertMessage(getAxiosErrorMessage(error));
        }
    };

    return (
        <div className="login-register-container main-content-element">
            <h1>Login</h1>
            <form onSubmit={logInUser}>
                <label>Enter username</label>
                <input type="text" name="username" value={form.username} onChange={handleChange} required />
                <label>Enter password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required />
                {alertMessage && <p className="error-message">{alertMessage}</p>}
                <button type="submit" className="login-logout-button">Login</button>
            </form>
            <Link to="/profile" className="login-register-back-link">Back</Link>
        </div>
    );
};

export default Login;
