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
    <p className="text-muted-foreground text-center text-lg">Loading rides...</p>
  ) : ridesByMe.length === 0 ? (
    <p className="text-muted-foreground text-center text-lg">No rides found.</p>
  ) : (
    ridesByMe.map((ride) => (
      <Card
        key={ride._id}
        className="border bg-card rounded-xl shadow-sm hover:shadow-md transition"
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {ride.from} → {ride.to}
            </CardTitle>

            {/* Status Badge */}
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium
                ${
                  ride?.status === 'available'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
            >
              {ride?.status}
            </span>
          </div>

          <CardDescription className="text-sm text-muted-foreground">
            {ride.date} • {ride.time}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              <span className="font-medium text-foreground">
                {ride.availableSeats}
              </span>{' '}
              seats available
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">
              ₹{ride.pricePerSeat}
            </span>
            <span>/ seat</span>
          </div>

          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span>
              {ride.carDetails?.make} {ride.carDetails?.model}{' '}
              ({ride.carDetails?.color})
            </span>
          </div>
        </CardContent>
      </Card>
    ))
  )}
</TabsContent>


          {/* Booking by Me */}
          <TabsContent value="upcoming" className="space-y-4">
  {loading ? (
    <p className="text-muted-foreground text-center text-lg">
      Loading bookings...
    </p>
  ) : bookingsByMe.length === 0 ? (
    <p className="text-muted-foreground text-center text-lg">
      No bookings found.
    </p>
  ) : (
    bookingsByMe.map((booking) => {
      const ride = booking.ride;

      return (
        <Card
          key={booking._id}
          className="border bg-card rounded-xl shadow-sm hover:shadow-md transition"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {ride ? `${ride.from} → ${ride.to}` : "Ride details unavailable"}
              </CardTitle>

              {/* Status Badge */}
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium
                  ${
                    booking.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : booking.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
              >
                {booking.status}
              </span>
            </div>

            <CardDescription className="text-sm text-muted-foreground">
              {ride ? `${ride.date} • ${ride.time}` : "N/A"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="font-medium text-foreground">
                  {booking.seatsBooked}
                </span>{" "}
                seats booked
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span>
                {ride?.carDetails
                  ? `${ride.carDetails.make} ${ride.carDetails.model} (${ride.carDetails.color})`
                  : "Car info unavailable"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                ₹ {ride ? ride.pricePerSeat * booking.seatsBooked : "N/A"}
              </span>
              <span className="text-muted-foreground">total</span>
            </div>
          </CardContent>
        </Card>
      );
    })
  )}
</TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
