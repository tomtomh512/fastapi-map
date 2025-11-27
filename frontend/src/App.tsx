import "./styles/app.css";
import React, { useCallback, useEffect, useState } from "react";
import type { List, Location, User, UserLocation } from "./types/types.ts";
import { type AxiosResponse } from "axios";
import httpClient from "./httpClient.tsx";
import Navbar from "./components/Navbar.tsx";
import Map from "./components/Map.tsx";
import Search from "./components/Search.tsx";
import { getAxiosErrorMessage } from "./utils/axiosError.ts";
import { Route, Routes } from "react-router-dom";
import Profile from "./components/Profile.tsx";
import Login from "./components/Login.tsx";
import Register from "./components/Register.tsx";
import UserList from "./components/UserList.tsx";

const App: React.FC = () => {
    const [searchInput, setSearchInput] = useState<string>("");
    const [searchResults, setSearchResults] = useState<Location[]>([]);
    const [currentMarkers, setCurrentMarkers] = useState<Location[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<Location>();
    const [userLocation, setUserLocation] = useState<UserLocation>({ lat: 40.7685, long: -73.9822 });

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position: GeolocationPosition) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        long: position.coords.longitude,
                    });
                }
            );
        }
    }, []);

    const [showPanel, setShowPanel] = useState<boolean>(true);
    const togglePanel = (): void => setShowPanel(prev => !prev);
    const togglePanelTrue = (): void => setShowPanel(true);

    const [user, setUser] = useState<User | null>(null);

    // Verify current user
    const verifyUser = useCallback(async () => {
        try {
            const response: AxiosResponse<User> = await httpClient.get(`${import.meta.env.VITE_SERVER_API_URL}/auth/me`);
            setUser({ id: response.data.id, username: response.data.username });
        } catch {
            setUser(null);
        }
    }, []);

    const [lists, setLists] = useState<List[]>([]);
    const [favoriteID, setFavoriteID] = useState<string>("");
    const [plannedID, setPlannedID] = useState<string>("");

    const getLists = useCallback(async () => {
        if (!user) return;

        try {
            const response: AxiosResponse<List[]> = await httpClient.get(`${import.meta.env.VITE_SERVER_API_URL}/lists`);
            setLists(response.data);

            response.data.forEach((list: List) => {
                if (list.is_default) {
                    if (list.name === "Favorites") setFavoriteID(list.id);
                    else if (list.name === "Planned") setPlannedID(list.id);
                }
            });
        } catch (error: unknown) {
            console.error(getAxiosErrorMessage(error));
        }
    }, [user]);

    useEffect(() => { verifyUser(); }, [verifyUser]);
    useEffect(() => { getLists(); }, [getLists, user]);

    return (
        <main className="main-container">
            <Navbar
                showPanel={showPanel}
                togglePanel={togglePanel}
                togglePanelTrue={togglePanelTrue}
                favoriteID={favoriteID}
                plannedID={plannedID}
            />

            <Map
                markers={currentMarkers}
                userLocation={userLocation}
                onViewChange={setUserLocation}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                togglePanelTrue={togglePanelTrue}
            />

            {showPanel && (
                <Routes>
                    <Route path="/" element={
                        <Search
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
                            lists={lists}
                            setLists={setLists}
                            getLists={getLists}
                        />
                    } />

                    <Route path="/login" element={<Login setUser={setUser} />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/list/:listId" element={
                        <UserList
                            setUser={setUser}
                            selectedLocation={selectedLocation}
                            setSelectedLocation={setSelectedLocation}
                            getLists={getLists}
                            setCurrentMarkers={setCurrentMarkers}
                        />
                    } />
                </Routes>
            )}
        </main>
    );
};

export default App;
