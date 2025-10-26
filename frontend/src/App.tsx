import "./styles/app.css";
import React, {useCallback, useEffect, useState} from "react";
import type {Location, User, UserLocation} from "./types/types.ts";
import {getToken, removeToken} from "./utils/tokenUtils.ts";
import {type AxiosResponse} from "axios";
import httpClient from "./httpClient.tsx";
import Navbar from "./components/Navbar.tsx";
import Map from "./components/Map.tsx";
import Search from "./components/Search.tsx";
import {getAxiosErrorMessage} from "./utils/axiosError.ts";
import {Route, Routes} from "react-router-dom";
import Profile from "./components/Profile.tsx";
import Login from "./components/Login.tsx";
import Register from "./components/Register.tsx";

const App: React.FC = () => {

    // Keep track of page inputs
    const [searchInput, setSearchInput] = useState<string>("");
    const [searchResults, setSearchResults] = useState<Location[]>([]);

    // Current markers on map
    const [currentMarkers, setCurrentMarkers] = useState<Location[]>([]);
    // Selected location, for expanding location card and highlighting marker
    const [selectedLocation, setSelectedLocation] = useState<Location>();
    // Current coordinates of map view
    const [userLocation, setUserLocation] = useState<UserLocation>({
        lat: 40.730610,
        long: -73.935242,
    });

    // Panel toggle
    const [showPanel, setShowPanel] = useState<boolean>(true);
    const togglePanel = (): void => { setShowPanel(prev => !prev) }
    const togglePanelTrue = (): void => { setShowPanel(true) }

    // User info
    const [user, setUser] = useState<User | null>(null);

    // Token verification
    const verifyToken = useCallback(async() => {
        const token: string | null = getToken();

        if (!token) {
            setUser(null);
            return;
        }

        try {
            const response: AxiosResponse<User> = await httpClient.get(
                `${import.meta.env.VITE_SERVER_API_URL}/verify-token/${token}`
            );
            setUser({
                id: response.data.id,
                username: response.data.username,
            });

        } catch (error: unknown) {
            const message = getAxiosErrorMessage(error);
            console.error(message);
            removeToken();
            setUser(null);
        }

    }, []);

    useEffect(() => {
        (async () => {
            await verifyToken();
        })();
    }, [verifyToken]);

    return (
        <main className="main-container">
            <Navbar
                showPanel={showPanel}
                togglePanel={togglePanel}
                togglePanelTrue={togglePanelTrue}
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

                </Routes>
            }
        </main>
    );
}

export default App;