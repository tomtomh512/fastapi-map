import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "../styles/Map.css";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    ZoomControl,
    Popup,
} from "react-leaflet";
import { Icon, Marker as LeafletMarker } from "leaflet";
import httpClient from "../httpClient";
import pinBlue from "../assets/pin-blue.png";
import pinRed from "../assets/pin-red.png";
import type { Location, UserLocation } from "../types/types";

interface MapProps {
    markers: Location[];
    userLocation: UserLocation;
    onViewChange: (newLocation: UserLocation) => void;
    selectedLocation?: Location;
    setSelectedLocation: (location?: Location) => void;
    togglePanelTrue: () => void;
}

const Map: React.FC<MapProps> = ({
                                     markers,
                                     userLocation,
                                     onViewChange,
                                     selectedLocation,
                                     setSelectedLocation,
                                     togglePanelTrue,
                                 }) => {

    const ChangeView: React.FC<{ center: [number, number] }> = ({ center }) => {
        const map = useMap();

        useEffect(() => {
            map.setView(center, map.getZoom());

            const handleMoveEnd = () => {
                const newCenter = map.getCenter();
                onViewChange({ lat: newCenter.lat, long: newCenter.lng });
            };

            map.on("moveend", handleMoveEnd);
            return () => {
                map.off("moveend", handleMoveEnd);
            };
        }, [center, map]);

        return null;
    };

    return (
        <div className="map-container">
            <MapContainer
                center={[userLocation.lat, userLocation.long]}
                zoom={12}
                zoomControl={false}
            >
                <ZoomControl position="bottomright" />
                <ChangeView center={[userLocation.lat, userLocation.long]} />
                <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

            </MapContainer>
        </div>
    );
};

export default Map;
