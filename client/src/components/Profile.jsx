import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Profile.css';
import {removeToken} from "../utils/tokenUtils";

export default function Profile(props) {
    const { user, setUser, setCurrentMarkers, verifyToken } = props;

    // Clear markers when user is on profile page
    useEffect(() => {
        setCurrentMarkers([]);
    }, [setCurrentMarkers]);

    // Verify user token
    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    // Log out user
    const logoutUser = () => {
        removeToken();
        setUser({ id: null, username: null });
    };

    return (
        <div className="profile-container main-content-element">
            <h1>Profile</h1>

            {user.id && user.username ? (
                <>
                    <h2>Welcome, {user.username}</h2>

                    <section className="view-lists">
                        <Link to="/favorites" className="view-lists-button">
                            View Favorites
                        </Link>
                        <Link to="/planned" className="view-lists-button">
                            View Planned
                        </Link>
                    </section>

                    <button onClick={logoutUser} className="login-logout-button">
                        Log Out
                    </button>
                </>
            ) : (
                <>
                    <h2>You are not logged in</h2>
                    <Link to="/login" className="login-logout-button">
                        Login
                    </Link>
                    <Link to="/register" className="login-register-back-link">
                        Register
                    </Link>
                </>
            )}
        </div>
    );
}
