import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Profile.css';
import { removeToken } from "../utils/tokenUtils";
import type {User, Location} from "../types/types.ts";

interface ProfileProps {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setCurrentMarkers: React.Dispatch<React.SetStateAction<Location[]>>;
    verifyToken: () => void;
}

const Profile: React.FC<ProfileProps> = ({
                                             user,
                                             setUser,
                                             setCurrentMarkers,
                                             verifyToken
                                         }) => {

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
        setUser(null);
    };

    return (
        <div className="profile-container main-content-element">
            <h1>Profile</h1>

            {user && user.id && user.username ? (
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
};

export default Profile;
