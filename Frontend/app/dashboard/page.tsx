'use client';

import { auth } from '../firebase';
import { getRidesByMe, getBookingByMe } from "../../lib/api";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { MapPin, Users, Car } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [ridesByMe, setRidesByMe] = useState<any[]>([]);
  const [bookingsByMe,setBookingsByMe] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const fetchRidesByMe = async () => {
      try {
        setLoading(true);
        const response = await getRidesByMe();

        if (response.success && Array.isArray(response.rides)) {
          const uniqueRides = Array.from(new Map(response.rides.map(ride => [ride._id, ride])).values());
          setRidesByMe(uniqueRides);
          console.log("My rides :",uniqueRides);
        } else {
          setRidesByMe([]);
        }
      } catch (error) {
        console.error("Error fetching rides:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRidesByMe();
  }, [user]);

  useEffect(() => {
    if(!user) return;
    const fetchBookingsByMe = async () => {
        try{
        setLoading(true);
        const response = await getBookingByMe();
          console.log("my bookings :",response);
        if (response.success) {
          setBookingsByMe(response.bookings);
        }else{
          setBookingsByMe([]);
        }
      }catch (error){
        console.error("error fetching bookings", error);
      }finally {
        setLoading(false);
      }
    }
    fetchBookingsByMe();

  }, [user]);

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
              <CardTitle className="text-sm font-medium">Distance Traveled</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 km</div>
              <p className="text-xs text-muted-foreground">+0 km from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
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
                <p className="text-gray-300 text-center text-lg">Loading rides...</p>
              ) : ridesByMe.length === 0 ? (
                <p className="text-gray-500 text-center text-lg">No rides found.</p>
              ) : (
                ridesByMe.map((ride) => (
                  <Card
                    key={ride._id}
                    className="p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-md hover:shadow-lg transition"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-white">
                        {ride.from} ➝ {ride.to}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        📅 {ride.date} at ⏰ {ride.time}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-gray-300 space-y-2">
                      <p>
                        <strong className="text-gray-400">🪑 Seats:</strong> {ride.availableSeats}
                      </p>
                      <p>
                        <strong className="text-gray-400">💰 Price:</strong> ₹{ride.pricePerSeat}
                      </p>
                      <p>
                        <strong className="text-gray-400">🚗 Car:</strong>{" "}
                        {ride.carDetails?.make} {ride.carDetails?.model} ({ride.carDetails?.color})
                      </p>
                      <p
                        className={`font-semibold ${
                          ride?.status === "available" ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        🔄 Status: {ride?.status}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

          {/* Booking by Me */}
          <TabsContent value="upcoming" className="space-y-4">
            {loading ? (
              <p className="text-gray-500 text-center text-lg">Loading bookings...</p>
            ) : bookingsByMe.length === 0 ? (
              <p className="text-gray-500 text-center text-lg">No bookings found.</p>
            ) : (
              bookingsByMe.map((booking) => (
                <Card key={booking._id} className="p-4 shadow-lg border border-gray-700 rounded-xl bg-gray-900 text-white">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-white">
                      {booking.ride ? (
                        <>
                          {booking.ride.from} ➝ {booking.ride.to}
                        </>
                      ) : (
                        "Ride details unavailable"
                      )}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                    {booking.ride ? `${booking.ride.date} at ${booking.ride.time}` : "N/A"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>
                      <strong className="text-slate-300">Seats Booked:</strong> {booking.seatsBooked}
                    </p>
                    <p>
                      <strong className="text-slate-300">Price:</strong> ₹ {booking.ride ? booking.ride.pricePerSeat * booking.seatsBooked : "N/A"}
                    </p>
                    <p>
                      <strong className="text-slate-300">Car:</strong>
                      {booking.ride?.carDetails ? `${booking.ride.carDetails.make} ${booking.ride.carDetails.model} (${booking.ride.carDetails.color})` : "N/A"}
                    </p>
                    <p>
                      <strong className="text-slate-300">Status:</strong> {booking.status}
                    </p>
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
