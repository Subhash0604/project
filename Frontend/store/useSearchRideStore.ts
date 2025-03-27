import { create } from 'zustand';

interface Ride {
  _id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  availableSeats: number;
  pricePerSeat: number;
  carDetails: {
    make: string;
    model: string;
  };
  status: string;
}

interface SearchRideState {
  from: string;
  to: string;
  date: string;
  availableSeats: number | null;
  rides: Ride[];
  loading: boolean;
  bookingRideId: string | null;
  setFrom: (from: string) => void;
  setTo: (to: string) => void;
  setDate: (date: string) => void;
  setAvailableSeats: (seats: number | null) => void;
  setRides: (rides: Ride[]) => void;
  setLoading: (loading: boolean) => void;
  setBookingRideId: (id: string | null) => void;
  resetSearch: () => void;
}

const useSearchRideStore = create<SearchRideState>((set) => ({
  from: '',
  to: '',
  date: '',
  availableSeats: null,
  rides: [],
  loading: false,
  bookingRideId: null,
  setFrom: (from) => set({ from }),
  setTo: (to) => set({ to }),
  setDate: (date) => set({ date }),
  setAvailableSeats: (seats) => set({ availableSeats: seats }),
  setRides: (rides) => set({ rides }),
  setLoading: (loading) => set({ loading }),
  setBookingRideId: (id) => set({ bookingRideId: id }),
  resetSearch: () =>
    set({
      from: '',
      to: '',
      date: '',
      availableSeats: null,
      rides: [],
      loading: false,
      bookingRideId: null,
    }),
}));

export default useSearchRideStore;
