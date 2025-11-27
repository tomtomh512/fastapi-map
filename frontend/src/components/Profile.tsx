import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Profile.css';
import type { User, Location, List } from "../types/types.ts";
import AddIcon from "../assets/add.png";
import httpClient from "../httpClient.tsx";
import { getAxiosErrorMessage } from "../utils/axiosError.ts";

interface ProfileProps {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setCurrentMarkers: React.Dispatch<React.SetStateAction<Location[]>>;
    lists: List[];
    setLists: React.Dispatch<React.SetStateAction<List[]>>;
    getLists: () => Promise<void>;
}

const Profile: React.FC<ProfileProps> = ({ user, setUser, setCurrentMarkers, lists, setLists, getLists }) => {
    useEffect(() => { setCurrentMarkers([]); }, [setCurrentMarkers]);

    const [addListInput, setAddListInput] = useState<string>("");

    const logoutUser = async (): Promise<void> => {
        try { await httpClient.post(`${import.meta.env.VITE_SERVER_API_URL}/auth/logout`); }
        catch (error) { console.error(getAxiosErrorMessage(error)); }
        finally { setUser(null); setLists([]); }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!addListInput.trim() || !user) return;

        try {
            await httpClient.post(`${import.meta.env.VITE_SERVER_API_URL}/lists`, { name: addListInput });
            await getLists();
            setAddListInput("");
        } catch (error) { console.error(getAxiosErrorMessage(error)); }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
        }
    };

    return (
        <div className="profile-container main-content-element">
            <h1>Profile</h1>
            {user ? (
                <>
                    <h2>Welcome, {user.username}</h2>
                    <form onSubmit={handleSubmit} className="list-form">
                        <input type="text" value={addListInput} placeholder="Add List" maxLength={15}
                               onChange={(e) => setAddListInput(e.target.value)} onKeyDown={handleKeyDown} />
                        <button type="submit"><img src={AddIcon} alt="Add" /></button>
                    </form>
                    <section className="view-lists">
                        {lists.map(list => (
                            <Link key={list.id} to={`/list/${list.id}`} className="view-lists-button">{list.name}</Link>
                        ))}
                    </section>
                    <button onClick={logoutUser} className="login-logout-button">Log Out</button>
                </>
            ) : (
                <>
                    <h2>You are not logged in</h2>
                    <Link to="/login" className="login-logout-button">Login</Link>
                    <Link to="/register" className="login-register-back-link">Register</Link>
                </>
            )}
        </div>
    );
};

export default Profile;
