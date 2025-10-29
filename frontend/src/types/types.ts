export type User = {
    id: string,
    username: string
}

export type UserLocation = {
    lat: number;
    long: number;
}

export type Location = {
    name: string,
    address: string,
    latitude: number,
    longitude: number,
    place_id: string,
    category?: string,
    score?: number,
}

export type List = {
    id: string,
    name: string,
    locations: Location[],
    is_default: boolean,
}

export interface ListStatus {
    id: string;
    name: string;
    added: boolean;
}