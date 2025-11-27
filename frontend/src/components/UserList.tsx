import "../styles/UserList.css";
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import httpClient from "../httpClient.tsx";
import {getAxiosErrorMessage} from "../utils/axiosError.ts";
import type {List, Location, User} from "../types/types";
import Listings from "./Listings.tsx";

interface UserListProps {
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    selectedLocation?: Location;
    setSelectedLocation: React.Dispatch<React.SetStateAction<Location | undefined>>;
    getLists: () => Promise<void>;
    setCurrentMarkers: React.Dispatch<React.SetStateAction<Location[]>>;
}

const UserList: React.FC<UserListProps> = ({
                                               setUser,
                                               selectedLocation,
                                               setSelectedLocation,
                                               getLists,
                                               setCurrentMarkers,
                                           }) => {
    const { listId } = useParams<{ listId: string }>();
    const [list, setList] = useState<List | null>(null);
    const navigate = useNavigate();

    useEffect(() => setSelectedLocation(undefined), [setSelectedLocation]);

    useEffect(() => {
        const fetchList = async () => {
            try {
                const res = await httpClient.get(`${import.meta.env.VITE_SERVER_API_URL}/lists/${listId}`);
                setList(res.data);
                setCurrentMarkers(res.data.locations);
            } catch (error: unknown) {
                console.error(getAxiosErrorMessage(error));
                navigate("/");
            }
        };

        if (listId) fetchList();
    }, [listId, navigate, setUser, setCurrentMarkers]);

    const handleDeleteList = async () => {
        if (!listId || !list) return;

        if (list.is_default) {
            alert("Cannot delete a default list");
            return;
        }

        try {
            await httpClient.delete(`${import.meta.env.VITE_SERVER_API_URL}/lists/${listId}`);
            await getLists();
            navigate("/profile");
        } catch (err) {
            console.error("Failed to delete list:", getAxiosErrorMessage(err));
        }
    };

    const handleDeleteLocation = (removedLocation: Location) => {
        if (!list) return;
        setList({
            ...list,
            locations: list.locations.filter(loc => loc.place_id !== removedLocation.place_id),
        });
    };

    return (
        <div className="userlist-container main-content-element">
            {list && (
                <>
                    <h1>{list.name}</h1>
                    {!list.is_default && (
                        <div>
                            <span className="remove-button" onClick={handleDeleteList}>
                                Delete list
                            </span>
                        </div>
                    )}
                    {list.locations.length === 0 ? (
                        <h3 className="results-message">Nothing to display</h3>
                    ) : (
                        <Listings
                            listings={list.locations}
                            selectedLocation={selectedLocation}
                            setSelectedLocation={setSelectedLocation}
                            handleDeleteLocation={handleDeleteLocation}
                            currentListId={listId}
                            userLoggedIn={true}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default UserList;
