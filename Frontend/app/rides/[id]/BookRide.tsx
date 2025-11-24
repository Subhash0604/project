"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { bookARide } from "../../../lib/api";

interface Ride {
  _id: string;
  availableSeats: number;
  status: string;
}

export default function BookButton({ ride }: { ride: Ride }) {
  const [booking, setBooking] = useState(false);
  const [availableSeats, setAvailableSeats] = useState(ride.availableSeats);

  const handleBooking = async () => {
    setBooking(true);
    try {
      await bookARide(ride._id, 1);
      alert("Ride booked successfully!");
      setAvailableSeats((prev) => prev - 1);
    } catch (err: any) {
      alert(err?.response?.data?.error || "Booking failed");
      console.error(err);
    } finally {
      setBooking(false);
    }
  };

  if (ride.status !== "available" || availableSeats < 1) {
    return (
      <Button className="mt-4 w-full bg-gray-500" disabled>
        {availableSeats < 1 ? "No Seats Available" : "Ride Not Available"}
      </Button>
    );
  }

  return (
    <Button
      className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
      onClick={handleBooking}
      disabled={booking}
    >
      {booking ? "Booking..." : "Book this Ride"}
    </Button>
  );
}
