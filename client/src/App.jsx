import React, {useCallback, useEffect, useState} from 'react';
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Profile from "./components/Profile";
import Search from "./components/Search";
import Map from "./components/Map";
import Login from "./components/Login";
import Register from "./components/Register";
import "./styles/app.css";
import {getToken, removeToken} from "./utils/tokenUtils";
import httpClient from "./httpClient";
import UserList from "./components/UserList";

export default function App() {
    // Keep track of page inputs
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    // Current markers on map
    const [currentMarkers, setCurrentMarkers] = useState([]);
    // Selected location, for expanding location card and highlighting marker
    const [selectedLocation, setSelectedLocation] = useState({});
    // Current coordinates of map view
    const [userLocation, setUserLocation] = useState({
        "lat": 40.730610,
        "long": -73.935242,
    });

    // Toggles panel
    const [showPanel, setShowPanel] = useState(true);
    const togglePanel = () => { setShowPanel(prev => !prev) }
    const togglePanelTrue = () => { setShowPanel(true) }

    // User info
    const [user, setUser] = useState({
        "id": null,
        "username": null
    })

    // Verify user token
    const verifyToken = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setUser({ id: null, username: null });
            return;
        }
        try {
            const response = await httpClient.get(
                `${process.env.REACT_APP_SERVER_API_URL}/auth/verify-token/${token}`
            );
            setUser({ id: response.data.id, username: response.data.username });
        } catch {
            removeToken();
            setUser({ id: null, username: null });
        }
    }, []);

    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    return (
        <main className="main-container">
            <Navbar
                togglePanel={togglePanel}
                togglePanelTrue={togglePanelTrue}
                showPanel={showPanel}
            />

            <Map
                markers={currentMarkers}
                userLocation={userLocation}
                onViewChange={setUserLocation}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                togglePanelTrue={togglePanelTrue}
            />

            {showPanel &&
                <Routes>
                    <Route path="/" element={
                        <Search
                            user={user}
                            setCurrentMarkers={setCurrentMarkers}
                            userLocation={userLocation}
                            selectedLocation={selectedLocation}
                            setSelectedLocation={setSelectedLocation}
                            searchInput={searchInput}
                            setSearchInput={setSearchInput}
                            searchResults={searchResults}
                            setSearchResults={setSearchResults}
                        />
                    } />

                    <Route path="/profile" element={
                        <Profile
                            user={user}
                            setUser={setUser}
                            setCurrentMarkers={setCurrentMarkers}
                            verifyToken={verifyToken}
                        />
                    } />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route
                        path="/favorites"
                        element={
                            <UserList
                                user={user}
                                setCurrentMarkers={setCurrentMarkers}
                                selectedLocation={selectedLocation}
                                setSelectedLocation={setSelectedLocation}
                                type="Favorites"
                            />
                        }
                    />

                    <Route
                        path="/planned"
                        element={
                            <UserList
                                user={user}
                                setCurrentMarkers={setCurrentMarkers}
                                selectedLocation={selectedLocation}
                                setSelectedLocation={setSelectedLocation}
                                type="Planned"
                            />
                        }
                    />
                </Routes>
            }

        </main>
    );
}
