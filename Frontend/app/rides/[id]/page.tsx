import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { Card, CardContent } from "../../../components/ui/card";
import { Calendar, Car, DollarSign, MapPin, Users } from "lucide-react";
import { getRideById } from "../../../lib/api";
import BookRide from "./BookRide"; // client-side booking button

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

export default async function RideDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const rideData = await getRideById(params.id);

  if (!rideData?.ride) return notFound();

  const ride: Ride = rideData.ride;

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
                <span>
                  {ride.date} at {ride.time}
                </span>
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
                  {ride.carDetails.make} {ride.carDetails.model}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="capitalize">Status: {ride.status}</span>
              </div>
            </div>

            {/* Client-side Booking Button */}
            <BookRide ride={ride} />
          </CardContent>
        </Card>

        {/* Map Section */}
        {ride.fromCoordinates && ride.toCoordinates && (
          <div className="h-96 rounded-xl overflow-hidden border shadow-md">
            <MapPreview
              from={{ geometry: { coordinates: ride.fromCoordinates } }}
              to={{ geometry: { coordinates: ride.toCoordinates } }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
