import React, {useEffect, useState} from "react";
import "../styles/Search.css";
import SearchIcon from "../assets/searchIcon.png";
import ExitIcon from "../assets/exitIcon.png";
import Listings from "./Listings";
import httpClient from "../httpClient";

export default function Search(props) {
    const {
        user,
        setCurrentMarkers,
        userLocation,
        selectedLocation, setSelectedLocation,
        searchInput, setSearchInput,
        searchResults, setSearchResults
    } = props;

    useEffect(() => {
        setSelectedLocation({})
    }, [setSelectedLocation]);

    // Onload search page load markers
    useEffect(() => {
        setCurrentMarkers(searchResults);
    }, [searchResults, setCurrentMarkers]);

    // Calls API, takes coordinates and search query
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await httpClient.get(`${import.meta.env.VITE_SERVER_API_URL}/here/searchQuery`, {
                params: {
                    query: searchInput,
                    lat: userLocation.lat,
                    long: userLocation.long
                },
            });

            setCurrentMarkers(response.data.results);
            setSearchResults(response.data.results);

        } catch (error) {
            console.error("Error fetching search results:", error);
        }
    };

    // Lets 'Enter' act as submit button
    function handleKeyDown(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSubmit(event);
        }
    }

    // Feedback message
    const [message, setMessage] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setMessage(""); // Clear the message after 2 seconds
        }, 2000);

        return () => clearTimeout(timer);
    }, [message]);

    return (
        <div className="search-form-container main-content-element">
            <h1> Search </h1>
            <form onSubmit={handleSubmit} className="search-form">
                <input
                    type="text"
                    name="search"
                    value={searchInput}
                    placeholder="Search"
                    onChange={(e) => {setSearchInput(e.target.value)}}
                    onKeyDown={handleKeyDown}
                />

                <button onClick={() => {setSearchInput("")}}>
                    <img src={ExitIcon} alt="X"/>
                </button>

                <button type="submit">
                    <img src={SearchIcon} alt="Search"/>
                </button>
            </form>

            {searchResults.length === 0 ?
                // If no results, display message, else show num results and render listings
                <h3 className="no-results-message"> Nothing to display </h3>
                :
                <>
                    <span> {searchResults.length} {searchResults.length === 1 ? "result" : "results"} </span>
                    {message !== "" ? <p className="feedback-message"> {message} </p> : ""}
                    <Listings
                        user={user}
                        listings={searchResults}
                        setListings={setSearchResults}
                        selectedLocation={selectedLocation}
                        setSelectedLocation={setSelectedLocation}
                        setMessage={setMessage}
                    />
                </>
            }

        </div>
    );
}
