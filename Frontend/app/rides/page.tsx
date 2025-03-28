"use client";

import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { MapPin, Calendar, Users, Car, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { searchRides, bookARide } from "../../lib/api";
import useAuthStore from "../../store/useAuthStore";

export default function RidesPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [availableSeats, setAvailableSeats] = useState<number | null>(null);
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingRideId, setBookingRideId] = useState<string | null>(null);

  const { user } = useAuthStore();

  const [requested, setRequested] = useState<boolean>(false);

  // Fetch rides based on search
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await searchRides({ from, to, date, availableSeats });
      console.log("🚗 Search Response:", response);

      if (response.success && Array.isArray(response.rides)) {
        setRides(response.rides);
      } else {
        setRides([]);
      }
    } catch (error) {
      console.error("Error fetching rides:", error);
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle booking a ride
  const handleBookRide = async (rideId: string) => {
    if (!availableSeats || availableSeats < 1) {
      alert("Please select a valid number of passengers.");
      return;
    }

    setBookingRideId(rideId);
    try {
      const response = await bookARide(rideId, availableSeats);
      alert("Ride booked successfully!");

      handleSearch();
    } catch (error) {
      console.error("Error booking ride:", error);
      alert(error.response?.data?.error || "Failed to book ride. Try again.");
    } finally {
      setBookingRideId(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Search Header */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="From"
                className="pl-10"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="To"
                className="pl-10"
              />
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
              <Select
                onValueChange={(value) => setAvailableSeats(Number(value))}
              >
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
            <Button
              className="w-full"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Rides List */}
          <div className="lg:col-span-3 space-y-6">
            {rides.length === 0 ? (
              <p className="text-gray-500 text-center text-lg">
                No rides found.
              </p>
            ) : (
              rides.map((ride) => {
                const isUserBooked = ride.Users?.some(
                  (bookingUser) => bookingUser.uid === user.uid
                );

                return (
                  <Card
                    key={ride._id}
                    className="shadow-md border rounded-lg hover:shadow-lg transition"
                  >
                    <CardContent className="p-6 space-y-2">
                      <h3 className="text-xl font-semibold text-gray-50">
                        {ride?.from} → {ride?.to}
                      </h3>
                      <p className="text-gray-300">
                        📅 Date:{" "}
                        <span className="font-medium">{ride?.date}</span> | ⏰
                        Time: <span className="font-medium">{ride?.time}</span>
                      </p>
                      <p className="text-gray-300">
                        🪑 Seats Available:{" "}
                        <span className="font-medium">
                          {ride?.availableSeats}
                        </span>
                      </p>
                      <p className="text-gray-300">
                        💰 Price per Seat:{" "}
                        <span className="font-medium">
                          ${ride?.pricePerSeat}
                        </span>
                      </p>
                      <p className="text-gray-300">
                        🚗 Car:{" "}
                        <span className="font-medium">
                          {ride?.carDetails?.make} {ride?.carDetails?.model}
                        </span>
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          ride?.status === "available"
                            ? "text-green-300"
                            : "text-red-300"
                        }`}
                      >
                        🔄 Status: {ride?.status}
                      </p>

                      {/* Conditional Button Rendering */}
                      {isUserBooked ? (
                        <Button
                          disabled
                          className="mt-4 w-full bg-gray-400 text-white font-semibold py-2 rounded-lg"
                        >
                          Booking Processing
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleBookRide(ride._id)}
                          disabled={bookingRideId === ride._id}
                          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                        >
                          {bookingRideId === ride._id
                            ? "Booking..."
                            : "Book Ride"}
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
    </div>
  );
}
