import axios from "axios";
import { auth } from "../app/firebase"; // Firebase authentication

// Correct Base URL
const API_BASE_URL = "http://localhost:8000";

// Function to get Firebase Auth Token
const getAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  return user ? await user.getIdToken() : null;
};

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios Interceptor to attach the Bearer Token to every request
api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Offer a Ride
export const offerRide = async (rideData: any) => {
  try {
    const token = await getAuthToken();
    const response = await api.post("/api/rides/offerRide", rideData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("API Error:", error.response?.data);
    throw error;
  }
};

// Get Rides Offered by Me
export const getRidesByMe = async () => {
  try {
    const token = await getAuthToken();
    const response = await api.get("/api/rides/getRidesByMe",
        {
          headers : {Authorization : `Bearer ${token}`},
        });
    getRidesByMe().then((data) => console.log("Rides by me:", data));

    return response.data;
  } catch (error: any) {
    console.error("API Error:", error.response?.data);
    throw error;
  }
};

// Search for rides
export const searchRides = async ({
  from,
  to,
  date,
  availableSeats,
}: {
  from: string;
  to: string;
  date: string;
  availableSeats: number | null;
}) => {
  try {
    const params = new URLSearchParams({ from, to, date });
    if (availableSeats) params.append("availableSeats", availableSeats.toString());

    const response = await api.get(`api/rides/searchRides?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error("Search Error:", error.response?.data);
    throw error;
  }
};

// 🏁 Book a ride
export const bookARide = async (rideId: string, seats: number) => {
  const token = await getAuthToken(); // Get Firebase token
  if (!token) throw new Error("User not authenticated");

  try {
    const response = await api.post(
      `/api/rides/bookARide/${rideId}`,  // Ensure this matches backend route
      { seats },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Booking Failed:", error.response?.data);
    throw error;
  }
};


// Cancel a Booking
export const cancelBooking = async (bookingId: string) => {
  const token = await getAuthToken();

  if (!token) throw new Error("User not authenticated");

  try {
    const response = await api.post(
      `/cancelBooking/${bookingId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Cancel Booking Failed:", error.response?.data || error.message);
    throw error;
  }
};
// Reject a Booking
export const rejectBooking = async (bookingId: string) => {
  return api.post(`/api/rides/rejectBooking/${bookingId}`);
};

// Accept a Booking
export const acceptBooking = async (bookingId: string) => {
  return api.post(`/api/rides/acceptBooking/${bookingId}`);
};

export default api;
