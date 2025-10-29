import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import httpClient from "../httpClient";
import "../styles/Authentication.css";
import {getAxiosErrorMessage} from "../utils/axiosError.ts";

interface RegisterForm {
    username: string;
    password: string;
    confirmPassword: string;
}

const Register: React.FC = () => {
    const [form, setForm] = useState<RegisterForm>({
        username: "",
        password: "",
        confirmPassword: "",
    });

    const [alertMessage, setAlertMessage] = useState<string>("");
    const navigate = useNavigate();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const registerUser = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            setAlertMessage("Passwords do not match");
            return;
        }

        try {
            await httpClient.post(`${import.meta.env.VITE_SERVER_API_URL}/register`, {
                username: form.username,
                password: form.password,
            });

            navigate("/profile");

        } catch (error: unknown) {
            const message = getAxiosErrorMessage(error);
            setAlertMessage(message);
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

                {alertMessage && <p className="error-message">{alertMessage}</p>}

                <button type="submit" className="login-logout-button">
                    Register
                </button>
            </form>

            <Link to="/profile" className="login-register-back-link">
                Back
            </Link>
        </div>
    );
};

export default Register;
