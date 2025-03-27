'use client';

import { auth } from '../firebase';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { MapPin, Users, Car } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';

export default function DashboardPage() {
  const {
    user, setUser,
    ridesByMe, fetchRidesByMe,
    bookingsByMe, fetchBookingsByMe,
    loading
  } = useDashboardStore();

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchRidesByMe();
        fetchBookingsByMe();
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router, setUser, fetchRidesByMe, fetchBookingsByMe]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading user...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Welcome back, {user.displayName}</h1>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ridesByMe.length}</div>
              <p className="text-xs text-muted-foreground">from beginning</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vehicles</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 km</div>
              <p className="text-xs text-muted-foreground">+0 km from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Travel Preferences</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 kg</div>
              <p className="text-xs text-muted-foreground">+0 kg from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Rides */}
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="past">Rides By Me</TabsTrigger>
            <TabsTrigger value="upcoming">Bookings By Me</TabsTrigger>
          </TabsList>

          {/* Rides By Me */}
          <TabsContent value="past" className="space-y-4">
            {loading ? (
              <p className="text-gray-400 text-center text-lg animate-pulse">Loading rides...</p>
            ) : ridesByMe.length === 0 ? (
              <p className="text-gray-500 text-center text-lg">No rides found.</p>
            ) : (
              ridesByMe.map((ride) => (
                <Card key={ride._id} className="p-5 bg-gray-950 border border-gray-700 rounded-xl shadow-md hover:shadow-2xl transition duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-white">
                      {ride.from} ➝ {ride.to}
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-sm">
                      📅 {ride.date} at ⏰ {ride.time}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-gray-300 space-y-3">
                    <p><strong className="text-indigo-400">🪑 Seats:</strong> {ride.availableSeats}</p>
                    <p><strong className="text-indigo-400">💰 Price:</strong> ₹{ride.pricePerSeat}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Booking by Me */}
          <TabsContent value="upcoming" className="space-y-4">
            {loading ? (
              <p className="text-gray-400 text-center text-lg animate-pulse">Loading bookings...</p>
            ) : bookingsByMe.length === 0 ? (
              <p className="text-gray-500 text-center text-lg">No bookings found.</p>
            ) : (
              bookingsByMe.map((booking) => (
                <Card key={booking._id} className="p-5 shadow-lg border border-gray-700 rounded-xl bg-gray-950 text-white hover:shadow-xl transition duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-white">
                      {booking.ride ? (
                        <>
                          {booking.ride.from} ➝ {booking.ride.to}
                        </>
                      ) : (
                        "Ride details unavailable"
                      )}
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-sm">
                      {booking.ride ? `${booking.ride.date} at ${booking.ride.time}` : "N/A"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-gray-300">
                    <p><strong className="text-indigo-400">Seats Booked:</strong> {booking.seatsBooked}</p>
                    <p><strong className="text-indigo-400">Price:</strong> ₹ {booking.ride ? booking.ride.pricePerSeat * booking.seatsBooked : "N/A"}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
