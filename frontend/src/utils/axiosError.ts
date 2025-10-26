import axios from "axios";

export function getAxiosErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.detail || "Request failed";
    }
    return "Unexpected error occurred";
}