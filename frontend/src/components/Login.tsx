import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import httpClient from "../httpClient";
import { setToken } from "../utils/tokenUtils";
import "../styles/Authentication.css";
import {getAxiosErrorMessage} from "../utils/axiosError.ts";
import type {User} from "../types/types.ts";
import type {AxiosResponse} from "axios";

interface LoginForm {
    username: string;
    password: string;
}

interface LoginProps {
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

interface LoginResponse {
    id: string;
    username: string;
    access_token: string;
}

const Login: React.FC<LoginProps> = ({setUser}) => {
    const [form, setForm] = useState<LoginForm>({ username: "", password: "" });
    const [alertMessage, setAlertMessage] = useState<string>("");
    const navigate = useNavigate();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const logInUser = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const formDetails = new URLSearchParams();
            formDetails.append("username", form.username);
            formDetails.append("password", form.password);

            const response: AxiosResponse<LoginResponse> = await httpClient.post(
                `${import.meta.env.VITE_SERVER_API_URL}/token`,
                formDetails,
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );

            setToken(response.data.access_token);

            setUser({
                id: response.data.id,
                username: response.data.username,
            });

            navigate("/profile");

        } catch (error: unknown) {
            const message = getAxiosErrorMessage(error);
            setAlertMessage(message);
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

                {alertMessage && <p className="error-message">{alertMessage}</p>}

                <button type="submit" className="login-logout-button">
                    Login
                </button>
            </form>

            <Link to="/profile" className="login-register-back-link">
                Back
            </Link>
        </div>
    );
};

export default Login;
