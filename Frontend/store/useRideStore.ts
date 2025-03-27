import { create } from "zustand";
import { offerRide, getRidesByMe, getBookingByMe, searchRides, bookARide } from "../lib/api";

// Define types
interface Ride {
  _id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  availableSeats: number;
  pricePerSeat: number;
  status: string;
  carDetails?: {
    licensePlate: string;
    model: string;
    color: string;
  };
}

interface Booking {
  _id: string;
  ride: Ride;
  seatsBooked: number;
  status: string;
}

interface RideStore {
  ridesByMe: Ride[];
  bookingsByMe: Booking[];
  loading: boolean;

  fetchRidesByMe: () => Promise<void>;
  fetchBookingsByMe: () => Promise<void>;
  addRide: (rideData: any) => Promise<void>;
  searchAvailableRides: (params: { from: string; to: string; date: string; availableSeats: number | null }) => Promise<Ride[]>;
}

// Zustand store
export const useRideStore = create<RideStore>((set) => ({
  ridesByMe: [],
  bookingsByMe: [],
  loading: false,

  fetchRidesByMe: async () => {
    set({ loading: true });
    try {
      const response = await getRidesByMe();
      set({ ridesByMe: response.rides || [] });
    } catch (error) {
      console.error("Error fetching rides:", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchBookingsByMe: async () => {
    set({ loading: true });
    try {
      const response = await getBookingByMe();
      set({ bookingsByMe: response.bookings || [] });
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      set({ loading: false });
    }
  },

  addRide: async (rideData) => {
    set({ loading: true });
    try {
      await offerRide(rideData);
      await useRideStore.getState().fetchRidesByMe(); // Refresh ride list
    } catch (error) {
      console.error("Error offering ride:", error);
    } finally {
      set({ loading: false });
    }
  },

  searchAvailableRides: async (params) => {
    set({ loading: true });
    try {
      const response = await searchRides(params);
      return response.rides || [];
    } catch (error) {
      console.error("Error searching rides:", error);
      return [];
    } finally {
      set({ loading: false });
    }
  },
}));
