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
    latitude: string | number,
    longitude: string | number,
    place_id: string,
    category_id: string,
    score: string | number,
}