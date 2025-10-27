import "../styles/Listings.css";
import type {Location} from "../types/types.ts";
import React, {useEffect, useRef} from "react";

interface ListingsProps {
    listings: Location[];
    selectedLocation?: Location;
    setSelectedLocation: React.Dispatch<React.SetStateAction<Location | undefined>>;
}

const Listings: React.FC<ListingsProps> = ({
                                               listings,
                                               selectedLocation,
                                               setSelectedLocation,
                                           }) => {

    const listingRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        listingRefs.current[selectedLocation?.place_id ?? ""]?.scrollIntoView?.({
            behavior: "smooth",
            block: "nearest",
        });
    }, [selectedLocation]);

    const handleClick = async (listing: Location) => {
        setSelectedLocation(listing);
    }

    return (
        <section className="listings-container">
            {listings.map((listing: Location, index: number) => (
                <section
                    key={index}
                    className="listing-card"
                    ref={(ref: HTMLDivElement | null) => {
                        if (ref) listingRefs.current[listing.place_id] = ref;
                        else delete listingRefs.current[listing.place_id];
                    }}
                >
                    <div
                        className="clickable"
                        onClick={() => handleClick(listing)}
                    >
                        <h3 className="listing-name">{listing.name}</h3>

                        {listing.category && (
                            <p className="listing-category">
                                {listing.category
                                    ?.split('.')
                                    ?.pop()
                                    ?.replaceAll('_', ' ')
                                    ?.replace(/\b\w/g, c => c.toUpperCase())}
                            </p>
                        )}
                        <p className="listing-address">{listing.address}</p>

                        <hr />

                    </div>
                    <section className="button-container">

                    </section>
                </section>
            ))}
        </section>
    )
}

export default Listings;