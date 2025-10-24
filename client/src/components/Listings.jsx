import React, {useEffect, useRef} from "react";
import "../styles/Listings.css";
import httpClient from "../httpClient";
import {getToken} from "../utils/tokenUtils";

export default function Listings(props) {
    const {
        user,
        listings, setListings,
        selectedLocation, setSelectedLocation,
        setMessage
    } = props;

    // Create a ref to store each listing div
    const listingRefs = useRef({});

    useEffect(() => {
        if (selectedLocation && listingRefs.current[selectedLocation.location_id]) {
            listingRefs.current[selectedLocation.location_id].scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }
    }, [selectedLocation]); // Runs whenever selectedLocation changes

    const handleClick = async (listing) => {
        // If click search listing, get info from listing itself
        if (listing.listing_type === "search") {
            setSelectedLocation(listing);
            return;
        }

        // If click favorite or planned listing, get info from search by id api call
        try {
            const response = await httpClient.get(`${import.meta.env.VITE_SERVER_API_URL}/searchByID`, {
                params: {
                    id: listing.location_id
                },
            });

            setSelectedLocation(response.data.result);

        } catch (error) {
            console.error("Error fetching id:", error);
        }
    }

    const addUserListItem = async (listing, type) => {
        if (!user.id || !user.username) {
            alert(`Please log in to save to ${type}`);
            return;
        }

        try {
            await httpClient.post(
                `${import.meta.env.VITE_SERVER_API_URL}/userlist/`,
                {
                    location_id: listing.location_id,
                    location_name: listing.name,
                    address: listing.address,
                    categories: listing.categories,
                    lat: listing.lat,
                    long: listing.long,
                    type: type,
                },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                }
            );

            setMessage(`${listing.name} added to ${type.charAt(0).toUpperCase() + type.slice(1)}`);

        } catch (error) {
            setMessage(error.response?.data?.detail || error.message);
        }
    };

    const removeUserListItem = async (listing) => {
        if (!user.id || !user.username) {
            alert(`Please log in to remove from ${listing.listing_type}`);
            return;
        }

        try {
            await httpClient.delete(
                `${import.meta.env.VITE_SERVER_API_URL}/userlist/${listing.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                }
            );
            setListings((prevListings) => prevListings.filter(item => item.id !== listing.id));
            setMessage(`${listing.name} removed from ${listing.listing_type}`);

        } catch (error) {
            console.error(`Error removing from ${listing.listing_type}:`, error);
            alert(`Something went wrong while removing from ${listing.listing_type}.`);
        }
    };

    return (
        <section className="listings-container">
            {listings.map((listing) => (
                <div
                    key={listing.location_id + "-listing"}
                    className={`listing-card ${listing.location_id === selectedLocation.location_id ? "selected-listing" : ""}`}
                    ref={(el) => (listingRefs.current[listing.location_id] = el)} // Store ref
                >
                    <div
                        className="clickable"
                        onClick={() => handleClick(listing)}
                    >

                        <h3 className="listing-name">{listing.name}</h3>
                        <p className="listing-address">{listing.address}</p>

                        <hr/>

                        <section className="categories">
                            {listing.categories.map((category, index) => (
                                <span key={listing.location_id + category.id} className="category">
                                    {category.name}
                                    {/* Puts dot between each category */}
                                    {index < listing.categories.length - 1 && " • "}
                                </span>
                            ))}
                        </section>

                        {/* If the current listing is the selected listing to be expanded */}
                        {listing.location_id === selectedLocation.location_id ?
                            <>
                                {/* This code block displays contact info */}
                                <section className="listing-info">
                                    {/* If the current listing has contacts */}
                                    {selectedLocation.contacts.length > 0 && <h3> Contacts </h3>}
                                    {/* Map out contacts. If contact is a website, add a link */}
                                    {selectedLocation.contacts.map((contact, index) => (
                                        <ul key={selectedLocation.location_id + "contact" + index}>
                                            {Object.entries(contact).map(([key, values]) =>
                                                values.map((item, itemIndex) => (
                                                    key === "www" ? (
                                                        <li key={item.value + itemIndex}>
                                                            <a href={item.value} target="_blank" rel="noopener noreferrer">
                                                                {item.value}
                                                            </a>
                                                        </li>
                                                    ) : (
                                                        <li key={item.value + itemIndex}>
                                                            {item.value}
                                                        </li>
                                                    )
                                                ))
                                            )}
                                        </ul>
                                    ))}
                                </section>

                                {/* This code block displays hours */}
                                {selectedLocation.hours[0] && selectedLocation.hours[0].text ?
                                    <section className="listing-info">
                                        <h3> Hours
                                            <span
                                                className="isOpen-indicator"
                                                style={{color: selectedLocation.hours[0] && selectedLocation.hours[0].isOpen ? 'green' : 'red'}}
                                            >
                                                 &nbsp; {selectedLocation.hours[0] && selectedLocation.hours[0].isOpen ? "Open" : "Closed"}
                                            </span>
                                        </h3>
                                        <ul>
                                            {selectedLocation.hours[0].text.map((hour, index) => (
                                                <li key={index + "hour"}> {hour} </li>
                                            ))}
                                        </ul>

                                    </section>
                                    :
                                    ""
                                }
                            </>
                            :
                            ""
                        }

                    </div>

                    <section className="button-container">
                        {listing.listing_type === "search" ? (
                            <>
                                <button className="list-button" onClick={() => addUserListItem(listing, "Favorites")}> Favorite +</button>
                                <button className="list-button" onClick={() => addUserListItem(listing, "Planned")}> Planned +</button>
                            </>
                        ) : (
                            <>
                                {listing.listing_type === "Favorites" ? (
                                    <button className="list-button" onClick={() => removeUserListItem(listing)}> Favorite -</button>
                                ) : (
                                    <button className="list-button" onClick={() => addUserListItem(listing, "Favorites")}> Favorite +</button>
                                )}

                                {listing.listing_type === "Planned" ? (
                                    <button className="list-button" onClick={() => removeUserListItem(listing)}> Planned -</button>
                                ) : (
                                    <button className="list-button" onClick={() => addUserListItem(listing, "Planned")}> Planned +</button>
                                )}
                            </>
                        )}

                    </section>
                </div>
            ))}

            <br/>

        </section>
    );
}
