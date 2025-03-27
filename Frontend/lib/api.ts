import axios from "axios";
import { auth } from "../app/firebase";

// Base URL
const API_BASE_URL = "http://localhost:8000";

// Firebase Auth Token
const getAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  return user ? await user.getIdToken() : null;
};

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Offer ride
export const offerRide = async (rideData: any) => {
  const response = await api.post("/api/rides/offerRide", rideData);
  return response.data;
};

// Get rides by me
export const getRidesByMe = async () => {
  const response = await api.get("/api/rides/getRidesByMe");
  return response.data;
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
  const params = new URLSearchParams({ from, to, date });
  if (availableSeats) params.append("availableSeats", availableSeats.toString());

  const response = await api.get(`/api/rides/searchRides?${params.toString()}`);
  return response.data;
};

// Book a ride
export const bookARide = async (rideId: string, seats: number) => {
  const response = await api.post(`/api/rides/bookARide/${rideId}`, { seats });
  return response.data;
};

// Get bookings by me
export const getBookingByMe = async () => {
  const response = await api.get(`/api/rides/getBookingsByUser`);
  return response.data;
};

// Cancel a booking
export const cancelBooking = async (bookingId: string) => {
  const response = await api.post(`/cancelBooking/${bookingId}`);
  return response.data;
};

// Reject booking
export const rejectBooking = async (bookingId: string) => {
  return api.post(`/api/rides/rejectBooking/${bookingId}`);
};

// Accept booking
export const acceptBooking = async (bookingId: string) => {
  return api.post(`/api/rides/acceptBooking/${bookingId}`);
};

export default api;
