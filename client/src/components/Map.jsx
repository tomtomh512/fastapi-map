import React, { useEffect, useRef } from "react";
import 'leaflet/dist/leaflet.css';
import "../styles/Map.css";
import { MapContainer, TileLayer, Marker, useMap, ZoomControl, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import httpClient from "../httpClient";

import pinBlue from "../assets/pin-blue.png";
import pinRed from "../assets/pin-red.png";

export default function Map(props) {
    const {
        markers,
        userLocation,
        onViewChange,
        selectedLocation, setSelectedLocation,
        togglePanelTrue
    } = props;

    const markerRefs = useRef({});

    const handleClick = async (listing) => {
        togglePanelTrue();

        if (listing.listing_type === "search") {
            setSelectedLocation(listing);
            return;
        }

        try {
            const response = await httpClient.get(`${import.meta.env.VITE_SERVER_API_URL}/searchByID`, {
                params: { id: listing.location_id },
            });
            setSelectedLocation(response.data.result);
        } catch (error) {
            console.error("Error fetching id:", error);
        }
    };

    useEffect(() => {
        if (selectedLocation?.location_id && markerRefs.current[selectedLocation.location_id]) {
            markerRefs.current[selectedLocation.location_id].openPopup();
        }
    }, [selectedLocation]);

    const customIcon = new Icon({
        iconUrl: pinBlue,
        iconSize: [38, 38],
    });

    const customHighlightedIcon = new Icon({
        iconUrl: pinRed,
        iconSize: [38, 38],
    });

    function ChangeView({ center }) {
        const map = useMap();

        useEffect(() => {
            map.setView(center, map.getZoom());
            const handleMoveEnd = () => {
                const newCenter = map.getCenter();
                onViewChange({ lat: newCenter.lat, long: newCenter.lng });
            };

            map.on("moveend", handleMoveEnd);
            return () => map.off("moveend", handleMoveEnd);
        }, [center, map]);

        return null;
    }

    return (
        <div className="map-container">
            <MapContainer center={[userLocation.lat, userLocation.long]} zoom={12} zoomControl={false}>
                <ZoomControl position="bottomright" />
                <ChangeView center={[userLocation.lat, userLocation.long]} />
                <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {markers.map(marker => (
                    <Marker
                        ref={(ref) => {
                            if (ref) markerRefs.current[marker.location_id] = ref;
                        }}
                        position={[marker.lat, marker.long]}
                        icon={marker.location_id === selectedLocation.location_id ? customHighlightedIcon : customIcon}
                        key={marker.location_id + "-marker"}
                        zIndexOffset={marker.location_id === selectedLocation.location_id ? 1000 : 0}
                        eventHandlers={{
                            click: () => handleClick(marker),
                        }}
                    >
                        <Popup>
                            <h3>{marker.name}</h3>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
