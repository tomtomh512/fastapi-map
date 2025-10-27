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
    category: string,
    score: number,
}