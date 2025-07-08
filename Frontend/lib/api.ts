import axios from "axios";
import { auth } from "../app/firebase";


const API_BASE_URL = "http://localhost:8000";

// firebase auth token
const getAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  return user ? await user.getIdToken() : null;
};

// axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// offer ride
export const offerRide = async (rideData: {
  from: string;
  to: string;
  date: string;
  time: string;
  availableSeats: number;
  pricePerSeat: number;
  carDetails: {
    model: string;
    licensePlate: string;
    color: string;
  };
  fromCoordinates: [number, number]; // [lng, lat]
  toCoordinates: [number, number];   // [lng, lat]
}) => {
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


// rides by me
export const getRidesByMe = async () => {
  try {
    const token = await getAuthToken();
    const response = await api.get("/api/rides/getRidesByMe",
        {
          headers : {Authorization : `Bearer ${token}`},
        });

    return response.data;
  } catch (error: any) {
    console.error("API Error:", error.response?.data);
    throw error;
  }
};

// search for rides
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

// book ride
export const bookARide = async (rideId: string, seats: number) => {
  const token = await getAuthToken(); // Get Firebase token
  if (!token) throw new Error("User not authenticated");

  try {
    const response = await api.post(
      `/api/rides/bookARide/${rideId}`,
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

// get Booking by me
export const getBookingByMe = async (rideId: string) => {
  const token = await getAuthToken();
  if (!token) throw new Error("user not authenticated");

  try{
    const response = await api.get(
        `/api/rides/getBookingsByUser`,
        {
          headers:{
          Authorization: `Bearer ${token}`,
          },
        }
    )
    return response.data;
  }catch(error: any) {
    console.error("fetching bookings failed:", error.response?.data);
    throw error;
  }
};

// cancel
export const cancelBooking = async (bookingId: string) => {
  const token = await getAuthToken();

  if (!token) throw new Error("user not authenticated");

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
// reject booking
export const rejectBooking = async (bookingId: string) => {
  return api.post(`/api/rides/rejectBooking/${bookingId}`);
};

// accept booking
export const acceptBooking = async (bookingId: string) => {
  return api.post(`/api/rides/acceptBooking/${bookingId}`);
};

export default api;
