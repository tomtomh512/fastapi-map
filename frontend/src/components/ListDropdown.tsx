import React, {useState} from "react";
import type {Location, ListStatus} from "../types/types.ts";
import httpClient from "../httpClient.tsx";
import {getAxiosErrorMessage} from "../utils/axiosError.ts";
import type {AxiosResponse} from "axios";
import "../styles/ListDropDown.css";

interface ListDropdownProps {
    location: Location;
    handleDeleteLocation?: (location: Location) => void;
    currentListId: string;
}

const ListDropdown: React.FC<ListDropdownProps> = ({
                                                       location,
                                                       handleDeleteLocation,
                                                       currentListId,
                                                   }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [listsStatus, setListsStatus] = useState<ListStatus[]>([]);

    const toggleDropdown = async () => {
        setIsOpen(prev => !prev);

        try {
            const response: AxiosResponse<ListStatus[]> = await httpClient.get(
                `${import.meta.env.VITE_SERVER_API_URL}/locations/check-location/${location.place_id}`
            );
            setListsStatus(response.data);
        } catch (error) {
            console.error(getAxiosErrorMessage(error));
        }
    };

    const handleCheckboxChange = async (listId: string, added: boolean) => {
        try {
            if (added) {
                await httpClient.delete(
                    `${import.meta.env.VITE_SERVER_API_URL}/locations/${listId}/${location.place_id}`
                );
            } else {
                await httpClient.post(
                    `${import.meta.env.VITE_SERVER_API_URL}/locations/${listId}`,
                    location
                );
            }

            // Update state
            setListsStatus(prev =>
                prev.map(ls => (ls.id === listId ? { ...ls, added: !added } : ls))
            );

            const a = parseInt(String(listId), 10);
            const b = parseInt(String(currentListId), 10);

            if (added && handleDeleteLocation && a === b) {
                handleDeleteLocation(location);
            }
        } catch (error) {
            console.error(getAxiosErrorMessage(error));
        }
    };

    return (
        <div className="dropdown-container">
            <button onClick={toggleDropdown} className="dropdown-button">
                {isOpen ? "Hide lists" : "Show lists"}
            </button>

            {isOpen && (
                <section className="list-containers">
                    {listsStatus.map(list => (
                        <label key={list.id} className="dropdown-item">
                            <input
                                type="checkbox"
                                checked={list.added}
                                onChange={() => handleCheckboxChange(list.id, list.added)}
                            />
                            {list.name}
                        </label>
                    ))}
                </section>
            )}
        </div>
    );
};

export default ListDropdown;
