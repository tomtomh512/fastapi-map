import "../styles/Listings.css";
import type {Location} from "../types/types.ts";
import React, {useEffect, useRef} from "react";
import ListDropdown from "./ListDropdown.tsx";

interface ListingsProps {
    listings: Location[];
    selectedLocation?: Location;
    setSelectedLocation: React.Dispatch<React.SetStateAction<Location | undefined>>;
    handleDeleteLocation?: (location: Location) => void;
    currentListId?: string;
    userLoggedIn?: boolean;
}

const Listings: React.FC<ListingsProps> = ({
                                               listings,
                                               selectedLocation,
                                               setSelectedLocation,
                                               handleDeleteLocation,
                                               currentListId,
                                               userLoggedIn = true,
                                           }) => {
    const currListId: string = currentListId ?? "Search";

    const listingRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        listingRefs.current[selectedLocation?.place_id ?? ""]?.scrollIntoView?.({
            behavior: "smooth",
            block: "nearest",
        });
    }, [selectedLocation]);

    const handleClick = (listing: Location): void => {
        setSelectedLocation(listing);
    };

    return (
        <section className="listings-container">
            {listings.map(listing => (
                <section
                    key={listing.place_id + "-listing"}
                    className={`listing-card ${selectedLocation?.place_id === listing.place_id ? "selected" : ""}`}
                    // ref={ref => {
                    //     if (ref) listingRefs.current[listing.place_id] = ref;
                    //     else delete listingRefs.current[listing.place_id];
                    // }}
                >
                    <div className="clickable" onClick={() => handleClick(listing)}>
                        <h3 className="listing-name">{listing.name}</h3>

                        {listing.category && (
                            <p className="listing-category">
                                {listing.category
                                    .split(".")
                                    .pop()
                                    ?.replaceAll("_", " ")
                                    .replace(/\b\w/g, c => c.toUpperCase())}
                            </p>
                        )}
                        <p className="listing-address">{listing.address}</p>

                        {userLoggedIn && (
                            <>
                                <hr />
                                <ListDropdown
                                    location={listing}
                                    handleDeleteLocation={handleDeleteLocation}
                                    currentListId={currListId}
                                />
                            </>
                        )}
                    </div>
                    <section className="button-container"></section>
                </section>
            ))}
        </section>
    );
};

export default Listings;
