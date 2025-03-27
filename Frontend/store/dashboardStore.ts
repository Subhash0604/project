import { create } from 'zustand';
import { getRidesByMe, getBookingByMe } from '../lib/api';

interface DashboardState {
  user: any;
  setUser: (user: any) => void;
  ridesByMe: any[];
  bookingsByMe: any[];
  loading: boolean;
  fetchRidesByMe: () => Promise<void>;
  fetchBookingsByMe: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  ridesByMe: [],
  bookingsByMe: [],
  loading: false,

  fetchRidesByMe: async () => {
    set({ loading: true });
    const response = await getRidesByMe();
    set({ ridesByMe: response.success ? response.rides : [], loading: false });
  },

  fetchBookingsByMe: async () => {
    set({ loading: true });
    const response = await getBookingByMe();
    set({ bookingsByMe: response.success ? response.bookings : [], loading: false });
  }
}));
