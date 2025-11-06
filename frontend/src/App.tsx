import "./styles/app.css";
import React, {useCallback, useEffect, useState} from "react";
import type {List, Location, User, UserLocation} from "./types/types.ts";
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
import UserList from "./components/UserList.tsx";

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
        lat: 40.7685,
        long: -73.9822,
    });

    // Ask for location
    useEffect((): void => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position: GeolocationPosition) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({
                        lat: latitude,
                        long: longitude,
                    });
                }
            );
        } else {
            console.error("Geolocation not supported");
        }
    }, []);

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
            const response: AxiosResponse<User> = await httpClient.post(
                `${import.meta.env.VITE_SERVER_API_URL}/verify-token`,
                { token }
            );
            setUser({
                id: response.data.id,
                username: response.data.username,
            });

        } catch (error: unknown) {
            const message: string = getAxiosErrorMessage(error);
            console.error(message);
            removeToken();
            setUser(null);
        }

    }, []);

    // User's lists
    const [lists, setLists] = useState<List[]>([]);
    // Get the IDs of favorite and planned lists for navbar
    const [favoriteID, setFavoriteID] = React.useState<string>("");
    const [plannedID, setPlannedID] = React.useState<string>("");

    // Fetches lists
    const getLists = useCallback(async() => {
        const token: string | null = getToken();

        if (!token) {
            setUser(null);
            return;
        }

        try {
            const response: AxiosResponse<List[]> = await httpClient.get(
                `${import.meta.env.VITE_SERVER_API_URL}/lists`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            setLists(response.data);

            response.data.forEach((list: List) => {
                if (list.is_default) {
                    if (list.name == "Favorites") {
                        setFavoriteID(list.id);
                    } else if (list.name == "Planned") {
                        setPlannedID(list.id);
                    }
                }
            })

        } catch (error: unknown) {
            const message: string = getAxiosErrorMessage(error);
            console.error(message);
        }

    }, [])

    useEffect(() => {
        (async () => {
            await verifyToken();
        })();
    }, [verifyToken]);

    useEffect(() => {
        (async () => {
            await getLists();
        })();
    }, [getLists, user]);

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

            {showPanel &&
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

                    <Route path="/login" element={
                        <Login
                            setUser={setUser}
                        />
                    } />

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
            }
        </main>
    );
}

export default App;