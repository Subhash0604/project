"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { MapPin, Calendar, Users, Car } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { searchRides, bookARide } from "../../lib/api";
import useAuthStore from "../../store/useAuthStore";
import LocationInput, {
  LocationFeature,
} from "../../components/ui/LocationInput";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const MapPreview = dynamic(() => import("../../components/ui/MapPreview"), {
  ssr: false,
});

export default function RidesPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromCoordinates, setFromCoordinates] = useState<
    [number, number] | null
  >(null);
  const [toCoordinates, setToCoordinates] = useState<[number, number] | null>(
    null
  );
  const [date, setDate] = useState("");
  const [availableSeats, setAvailableSeats] = useState<number | null>(null);
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingRideId, setBookingRideId] = useState<string | null>(null);

  const { user } = useAuthStore();

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await searchRides({ from, to, date, availableSeats });
      setRides(response.success ? response.rides : []);
    } catch (error) {
      console.error("Error fetching rides:", error);
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = async (rideId: string) => {
    if (!availableSeats || availableSeats < 1) {
      toast.error("Please select a valid number of passengers.");
      return;
    }

    setBookingRideId(rideId);
    try {
      await bookARide(rideId, availableSeats);
      toast.success("Ride booked successfully!");
      handleSearch();
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.response?.data?.error || "Booking failed.");
    } finally {
      setBookingRideId(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Search Section */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
              <div className="pl-10">
                <LocationInput
                  value={from}
                  onSelect={(feature: LocationFeature) => {
                    setFrom(feature.place_name);
                    setFromCoordinates(feature.geometry.coordinates);
                  }}
                  placeholder="From"
                />
              </div>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
              <div className="pl-10">
                <LocationInput
                  value={to}
                  onSelect={(feature: LocationFeature) => {
                    setTo(feature.place_name);
                    setToCoordinates(feature.geometry.coordinates);
                  }}
                  placeholder="To"
                />
              </div>
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Users className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Select onValueChange={(val) => setAvailableSeats(Number(val))}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Passengers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Passenger</SelectItem>
                  <SelectItem value="2">2 Passengers</SelectItem>
                  <SelectItem value="3">3 Passengers</SelectItem>
                  <SelectItem value="4">4 Passengers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
      </div>

      {/* Map */}
      {fromCoordinates && toCoordinates && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <MapPreview
            from={{ geometry: { coordinates: fromCoordinates } }}
            to={{ geometry: { coordinates: toCoordinates } }}
          />
        </div>
      )}

      {/* Ride List */}
      <div className="max-w-7xl mx-auto p-6">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {rides.length === 0 ? (
      <p className="text-center text-muted-foreground text-lg">
        No rides found.
      </p>
    ) : (
      rides.map((ride) => {
        const isUserBooked = ride.Users?.some(
          (u: any) => u.uid === user?.uid
        );

        return (
          <Card
            key={ride._id}
            className="border bg-card rounded-xl shadow-sm hover:shadow-md transition"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {ride.from} → {ride.to}
                </CardTitle>

                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium
                    ${
                      ride.status === "available"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                >
                  {ride.status}
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
                  </span>{" "}
                  seats available
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  ${ride.pricePerSeat} per seat
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span>
                  {ride.carDetails?.make} {ride.carDetails?.model}
                </span>
              </div>

              {isUserBooked ? (
                <Button disabled className="w-full bg-gray-400 mt-2">
                  Booking Processing
                </Button>
              ) : (
                <Button
                  onClick={() => handleBookRide(ride._id)}
                  disabled={bookingRideId === ride._id}
                  className="w-full bg-white text-black hover:text-black  mt-2"
                >
                  {bookingRideId === ride._id ? "Booking..." : "Book Ride"}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })
    )}
  </div>
</div>

    </div>
  );
}
