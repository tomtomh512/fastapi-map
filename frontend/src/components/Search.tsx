import "../styles/Search.css";
import React, {useEffect, useState} from "react";
import type { Location, UserLocation } from "../types/types";
import httpClient from "../httpClient.tsx";
import SearchIcon from "../assets/searchIcon.png";
import ExitIcon from "../assets/exitIcon.png";
import Listings from "./Listings.tsx";

interface SearchProps {
    setCurrentMarkers: React.Dispatch<React.SetStateAction<Location[]>>;
    userLocation: UserLocation;
    selectedLocation?: Location;
    setSelectedLocation: React.Dispatch<React.SetStateAction<Location | undefined>>;
    searchInput: string;
    setSearchInput: React.Dispatch<React.SetStateAction<string>>;
    searchResults: Location[];
    setSearchResults: React.Dispatch<React.SetStateAction<Location[]>>;
}

const Search: React.FC<SearchProps> = ({
                                           setCurrentMarkers,
                                           userLocation,
                                           selectedLocation,
                                           setSelectedLocation,
                                           searchInput,
                                           setSearchInput,
                                           searchResults,
                                           setSearchResults,
                                       }) => {

    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setSelectedLocation(undefined)
    }, [setSelectedLocation]);

    // Onload search page load markers
    useEffect(() => {
        setCurrentMarkers(searchResults);
    }, [searchResults, setCurrentMarkers]);

    // Calls API, takes coordinates and search query
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setLoading(true);

        if (searchInput == "") {
            setLoading(false);
            return;
        }

        try {
            const response = await httpClient.get(`${import.meta.env.VITE_SERVER_API_URL}/searchQuery`, {
                params: {
                    query: searchInput,
                    lat: userLocation.lat,
                    long: userLocation.long,
                },
            });

            setCurrentMarkers(response.data.results);
            setSearchResults(response.data.results);
            setSelectedLocation(undefined);

        } catch (error) {
            console.error("Error fetching search results:", error);

        } finally {
            setLoading(false);
        }
    };

    const clearSearchResults = (): void => {
        setCurrentMarkers([]);
        setSearchInput("");
        setSearchResults([]);
        setSelectedLocation(undefined);
    }

    // Lets 'Enter' act as submit button
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
        }
    };

    // Feedback message
    useEffect(() => {
        const timer = setTimeout(() => {
            setMessage("");
        }, 2000);

        return () => clearTimeout(timer);
    }, [message]);

    return (
        <div className="search-form-container main-content-element">
            <h1>Search</h1>
            <form onSubmit={handleSubmit} className="search-form">
                <input
                    type="text"
                    name="search"
                    value={searchInput}
                    placeholder="Search"
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />

                <button
                    type="button"
                    onClick={() => clearSearchResults()}
                >
                    <img src={ExitIcon} alt="X" />
                </button>

                <button type="submit">
                    <img src={SearchIcon} alt="Search" />
                </button>
            </form>

            {loading ? (
                <h3 className="results-message">Loading results...</h3>
            ) : searchResults.length === 0 ? (
                <h3 className="results-message">Nothing to display</h3>
            ) : (
                <>
                    <span>
                        {searchResults.length}{" "}
                        {searchResults.length === 1 ? "result" : "results"}
                    </span>
                    {message && <p className="feedback-message">{message}</p>}

                    <Listings
                        listings={searchResults}
                        selectedLocation={selectedLocation}
                        setSelectedLocation={setSelectedLocation}
                    />
                </>
            )}
        </div>
    );
};

export default Search;
