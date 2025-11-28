"use client";

import { useEffect, useState } from "react";
// import { getRideById } from "../../../lib/api";
import MapPreview from "@/components/ui/MapPreview";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Calendar,
  Users,
  DollarSign,
  Car,
  MapPin,
  IndianRupee,
} from "lucide-react";
import {
  acceptBooking,
  getBookingsOfRide,
  getRideById,
  rejectBooking,
} from "@/lib/api";
import { auth } from "@/app/firebase";
import { parseISO } from "date-fns";
import Image from "next/image";
import { Button } from "./ui/button";

export interface Ride {
  _id: string;
  driver: string;
  from: string;
  to: string;
  fromCoordinates: GeoPoint;
  toCoordinates: GeoPoint;
  date: string;
  time: string;
  pricePerSeat: number;
  availableSeats: number;
  passengers: string[];
  BookingUsers: string[];
  carDetails: CarDetails;
  status: "available" | "full" | "cancelled";
  createdAt: string;
  __v: number;
}

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface CarDetails {
  color: string;
  model: string;
  licensePlate: string;
}

export interface Booking {
  _id: string;
  ride: string; // Ride ID
  passenger: Passenger;
  seatsBooked: number;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Passenger {
  _id: string;
  uid: string;
  name: string;
  email: string;
  picture: string;
  __v: number;
}

export default function BookButton({ params }: { params: { id: string } }) {
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [Bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();

        const data = await getRideById(params.id, token);
        const data2 = await getBookingsOfRide(params.id, token);

        setRide(data.ride);
        console.log(data2.bookings);
        setBookings(data2.bookings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [params.id]);

  const handleAccept = async (bookingId: string) => {
    try {
      setBookings((prev) =>
        prev!.map((b) =>
          b._id === bookingId ? { ...b, status: "accepted" } : b
        )
      );

      await acceptBooking(bookingId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      setBookings((prev) =>
        prev!.map((b) =>
          b._id === bookingId ? { ...b, status: "accepted" } : b
        )
      );
      await rejectBooking(bookingId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="text-gray-200">Loading ride…</p>;
  if (!ride) return notFound();

  return (
    <div className="flex flex-col min-h-screen p-4 gap-4 mx-auto max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="">
          <Card className="h-full">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-50">
                {ride.from} → {ride.to}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {ride.date} at {ride.time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{ride.availableSeats} seat(s) available</span>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" />
                  <span>{ride.pricePerSeat} per seat</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  <span>{ride.carDetails.model}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="capitalize">Status: {ride.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="h-64 md:h-auto rounded-xl overflow-hidden shadow-lg">
          {ride.fromCoordinates?.coordinates &&
            ride.toCoordinates?.coordinates && (
              <MapPreview
                from={{
                  geometry: { coordinates: ride.fromCoordinates.coordinates },
                }}
                to={{
                  geometry: { coordinates: ride.toCoordinates.coordinates },
                }}
              />
            )}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-50 mt-2 p-1">
        Bookings ({Bookings?.length || 0})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
        {Bookings && Bookings.length > 0 ? (
          Bookings.map((booking) => (
            <Card
              key={booking._id}
              className="border bg-card rounded-xl shadow-sm hover:shadow-md transition"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="rounded-full overflow-hidden w-8 h-8">
                      <Image
                        src={`https://proxy.duckduckgo.com/iu/?u=${booking.passenger.picture}`}
                        width={30}
                        height={30}
                        alt="profile"
                        className="rounded-full object-cover"
                      />
                    </div>
                    <span className="text-sm">{booking.passenger.name}</span>
                  </div>

                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      booking.status === "accepted"
                        ? "bg-green-600 text-white"
                        : booking.status === "pending"
                        ? "bg-yellow-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {booking.status.toUpperCase()}
                  </span>
                </div>
                <CardDescription className="text-sm text-muted-foreground">
                  {booking.passenger.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <span className="font-medium text-foreground">
                        {booking.seatsBooked}
                      </span>{" "}
                      seats booked
                    </span>
                  </div>

                  <span className="font-medium text-muted-foreground">
                    {ride ? `${ride.date} • ${ride.time}` : "N/A"}
                  </span>
                </div>

                <div className="flex justify-end gap-1">
                  {booking.status === "accepted" ? (
                    // <Button
                    //   onClick={() => {
                    //     handleAccept(booking._id);
                    //   }}
                    //   disabled={booking.status === "accepted"}
                    // >
                    //   Cancel
                    // </Button>
                    <></>
                  ) : (
                    <div className="flex justify-end gap-1">
                      <Button
                        onClick={() => {
                          handleAccept(booking._id);
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => {
                          handleReject(booking._id);
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-gray-400">
            No bookings for this ride yet.
          </p>
        )}
      </div>
    </div>
  );
}
