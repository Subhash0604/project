import { create } from 'zustand';

interface CarDetails {
  model: string;
  licensePlate: string;
  color: string;
}

interface RideData {
  from: string;
  to: string;
  date: string;
  time: string;
  availableSeats: number;
  pricePerSeat: number;
  carDetails: CarDetails;
}

interface OfferRideState {
  user: any;
  date: Date | null;
  loading: boolean;
  rideData: RideData;
  setUser: (user: any) => void;
  setDate: (date: Date | null) => void;
  setRideData: <K extends keyof RideData>(key: K, value: RideData[K]) => void;
  setCarDetails: (carDetails: Partial<CarDetails>) => void;
  setLoading: (loading: boolean) => void;
  resetRideData: () => void;
}

const useOfferRideStore = create<OfferRideState>((set) => ({
  user: null,
  date: null,
  loading: false,
  rideData: {
    from: '',
    to: '',
    date: '',
    time: '',
    availableSeats: 0,
    pricePerSeat: 0,
    carDetails: {
      model: '',
      licensePlate: '',
      color: '',
    },
  },
  setUser: (user) => set({ user }),
  setDate: (date) => set({ date }),
  setRideData: (key, value) =>
    set((state) => ({
      rideData: { ...state.rideData, [key]: value },
    })),
  setCarDetails: (carDetails) =>
    set((state) => ({
      rideData: {
        ...state.rideData,
        carDetails: { ...state.rideData.carDetails, ...carDetails },
      },
    })),
  setLoading: (loading) => set({ loading }),
  resetRideData: () =>
    set({
      date: null,
      rideData: {
        from: '',
        to: '',
        date: '',
        time: '',
        availableSeats: 0,
        pricePerSeat: 0,
        carDetails: {
          model: '',
          licensePlate: '',
          color: '',
        },
      },
    }),
}));

export default useOfferRideStore;
