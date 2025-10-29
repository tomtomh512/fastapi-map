import React, {useState} from "react";
import type {Location, ListStatus} from "../types/types.ts";
import httpClient from "../httpClient.tsx";
import {getToken} from "../utils/tokenUtils.ts";
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

        const token: string | null = getToken();

        try {

            const response: AxiosResponse<ListStatus[]> = await httpClient.get<ListStatus[]>(
                `${import.meta.env.VITE_SERVER_API_URL}/check-location/${location.place_id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setListsStatus(response.data);

        } catch (error) {
            const message: string = getAxiosErrorMessage(error);
            console.error(message);
        }
    };

    const handleCheckboxChange = async (listId: string, added: boolean) => {
        const token: string | null = getToken();

        try {
            if (added) {
                // remove location from list
                await httpClient.delete(
                    `${import.meta.env.VITE_SERVER_API_URL}/lists/${listId}/locations/${location.place_id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

            } else {
                // add location to list
                await httpClient.post(
                    `${import.meta.env.VITE_SERVER_API_URL}/lists/${listId}/locations`,
                    location,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            }

            // update local state
            setListsStatus((prev: ListStatus[]) =>
                prev.map((listStatus: ListStatus) =>
                    listStatus.id === listId ? { ...listStatus, added: !added } : listStatus
                )
            );

            // if list deleting from is the same as current list, don't render changes
            if (added && handleDeleteLocation && listId === currentListId) {
                handleDeleteLocation(location);
            }

        } catch (error) {
            const message: string = getAxiosErrorMessage(error);
            console.error(message);
        }
    };

    return (
        <div className="dropdown-container">
            <button onClick={toggleDropdown} className="dropdown-button">
                {isOpen ? "Hide lists" : "Show lists"}
            </button>

            <section className="list-containers">
                {isOpen && listsStatus.map(list => (
                    <label key={list.id} className="dropdown-item">
                        <input
                            type="checkbox"
                            checked={list.added}
                            onChange={() =>
                                handleCheckboxChange(list.id, list.added)
                            }
                        />
                        {list.name}
                    </label>
                ))}
            </section>

        </div>
    );
};

export default ListDropdown;
