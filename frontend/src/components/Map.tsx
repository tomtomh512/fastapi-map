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

    const markerRefs = useRef<Record<string, LeafletMarker>>( {} );

    useEffect(() => {
        if (selectedLocation?.place_id && markerRefs.current[selectedLocation.place_id]) {
            markerRefs.current[selectedLocation.place_id].openPopup();
        }
    }, [selectedLocation]);

    const handleClick = async (listing: Location) => {
        togglePanelTrue();

        setSelectedLocation(listing);
    };

    const customIcon = new Icon({
        iconUrl: pinBlue,
        iconSize: [38, 38],
    });

    const customHighlightedIcon = new Icon({
        iconUrl: pinRed,
        iconSize: [38, 38],
    });

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
        <div>
            <MapContainer
                center={[userLocation.lat, userLocation.long]}
                zoom={12}
                zoomControl={false}
            >
                <ZoomControl position="bottomright" />
                <ChangeView center={[userLocation.lat, userLocation.long]} />
                <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {markers.map((marker: Location) => (
                    <Marker
                        key={marker.place_id + "-icon"}
                        position={[marker.latitude, marker.longitude]}
                        icon={(selectedLocation && marker.place_id === selectedLocation.place_id) ? customHighlightedIcon : customIcon}
                        zIndexOffset={(selectedLocation && marker.place_id === selectedLocation.place_id) ? 1000 : 0 }
                        eventHandlers={{
                            click: () => handleClick(marker),
                        }}
                        ref={(ref) => {
                            if (ref) markerRefs.current[marker.place_id] = ref;
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
};

export default Map;
