"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Calendar, Car, DollarSign, MapPin, Users } from "lucide-react";
import { getRideById, bookARide } from "../../../lib/api";
import useAuthStore from "../../../store/useAuthStore";
import dynamic from "next/dynamic";
 
const MapPreview = dynamic(() => import("../../../components/ui/MapPreview"), {
  ssr: false,
});

interface Ride {
  _id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  pricePerSeat: number;
  availableSeats: number;
  carDetails: {
    make: string;
    model: string;
    licensePlate: string;
    color: string;
  };
  fromCoordinates: [number, number];
  toCoordinates: [number, number];
  status: string;
}

export default function RideDetailsPage() {
  const { id } = useParams();
  const { user } = useAuthStore();

  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchRide = async () => {
      try {
        const data = await getRideById(id as string);
        setRide(data.ride);
      } catch (err) {
        console.error("Error loading ride:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, [id]);

  const handleBooking = async () => {
    if (!ride) return;
    setBooking(true);
    try {
      await bookARide(ride._id, 1);
      alert("Ride booked successfully!");
      setRide((prev) =>
        prev ? { ...prev, availableSeats: prev.availableSeats - 1 } : prev
      );
    } catch (err: any) {
      alert(err?.response?.data?.error || "Booking failed");
      console.error(err);
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <p className="text-center p-6">Loading ride...</p>;
  if (!ride) return <p className="text-center text-red-500 p-6">Ride not found.</p>;

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-50">
              {ride.from} → {ride.to}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{ride.date} at {ride.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{ride.availableSeats} seat(s) available</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                <span>${ride.pricePerSeat} per seat</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                <span>
                  {ride.carDetails?.make} {ride.carDetails?.model}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="capitalize">Status: {ride.status}</span>
              </div>
            </div>

            {user && (
              <Button
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleBooking}
                disabled={booking || ride.availableSeats < 1 || ride.status !== "available"}
              >
                {booking
                  ? "Booking..."
                  : ride.availableSeats < 1
                  ? "No Seats Available"
                  : "Book this Ride"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Map Section */}
        {ride.fromCoordinates && ride.toCoordinates && (
          <div className="h-96 rounded-xl overflow-hidden border shadow-md">
            <MapPreview
              from={{
                geometry: { coordinates: ride.fromCoordinates },
              }}
              to={{
                geometry: { coordinates: ride.toCoordinates },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
