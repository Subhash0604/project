"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { auth } from "@/app/firebase";
import { completeRide, getRideById, startRide } from "@/lib/api";
import io, { Socket } from "socket.io-client";
import { Phone, Mail, Armchair, Car, IdCard, Palette } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";

const SOCKET_SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000";

const COMPLETION_THRESHOLD = 75;

const getDistance = (
  [lon1, lat1]: [number, number],
  [lon2, lat2]: [number, number]
): number => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};
// --- END: Haversine Formula and Constants ---

// --- START: Interfaces (unchanged) ---

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface CarDetails {
  color: string;
  model: string;
  licensePlate: string;
}

export interface Driver {
  email: string;
  name: string;
  phone: string;
  picture: string;
  uid: string;
  _id: string;
}

export interface Passenger {
  name: string;
  email: string;
  phone: string;
  picture: string;
  seatsBooked: Number;
}

export interface Ride {
  _id: string;
  driver: Driver;
  from: string;
  to: string;
  fromCoordinates: GeoPoint;
  toCoordinates: GeoPoint;
  date: string;
  time: string;
  pricePerSeat: number;
  availableSeats: number;
  passengers: Passenger[];
  BookingUsers: string[];
  carDetails: CarDetails;
  status:
    | "available"
    | "full"
    | "ongoing"
    | "completed"
    | "cancelled"
    | "booked";
  createdAt: string;
  __v: number;
}

interface Props {
  rideId: string;
}

interface LocationData {
  lat: number;
  lng: number;
}
// --- END: Interfaces ---

const animateMarker = (
  marker: maplibregl.Marker,
  newLng: number,
  newLat: number
) => {
  const start = marker.getLngLat();
  const startTime = performance.now();
  const duration = 500;

  const frame = (time: number) => {
    const progress = Math.min(1, (time - startTime) / duration);
    marker.setLngLat([
      start.lng + (newLng - start.lng) * progress,
      start.lat + (newLat - start.lat) * progress,
    ]);
    if (progress < 1) requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
};

// Fetch route from OpenRouteService (unchanged)
const fetchOrsRoute = async (
  start: [number, number],
  end: [number, number]
) => {
  const orsKey = process.env.NEXT_PUBLIC_ORS_KEY;
  if (!orsKey) return null;

  try {
    const res = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        method: "POST",
        headers: {
          Authorization: orsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coordinates: [start, end] }),
      }
    );
    if (!res.ok) throw new Error("ORS request failed");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};

const CurrentRide = ({ rideId }: Props) => {
  const mapRef = useRef<Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const driverMarker = useRef<maplibregl.Marker | null>(null);
  const passengerMarker = useRef<maplibregl.Marker | null>(null);
  const destinationMarker = useRef<maplibregl.Marker | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);

  const [ride, setRide] = useState<Ride | null>(null);
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(
    null
  );
  const [passengerLocation, setPassengerLocation] = useState<
    [number, number] | null
  >(null);

  const [isNearPickup, setIsNearPickup] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const [isNearDestination, setIsNearDestination] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const passengerPosition =
    passengerLocation ?? ride?.fromCoordinates.coordinates ?? null;

  const handleStartRide = async () => {
    if (!ride || isStarting) return;

    setIsStarting(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated.");

      await startRide(ride._id);
      setRide((prev) => (prev ? { ...prev, status: "ongoing" } : null));

      alert("Ride started! You are now heading to the destination.");
    } catch (error) {
      console.error("Failed to start ride:", error);
      alert("Error starting ride. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleCompleteRide = async () => {
    if (!ride || isFinishing) return;

    setIsFinishing(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated.");

      await completeRide(ride._id);

      setRide((prev) => (prev ? { ...prev, status: "completed" } : null));
      if (socketRef.current) socketRef.current.disconnect();

      alert("Ride completed successfully!");
    } catch (error) {
      console.error("Failed to complete ride:", error);
      setIsFinishing(false);
      alert("Error completing ride. Please try again.");
    }
  };

  const updateRoute1 = useCallback(
    async (
      driverCoords: [number, number],
      passengerCoords: [number, number]
    ) => {
      if (!mapRef.current) return;
      const r1 = await fetchOrsRoute(driverCoords, passengerCoords);
      if (r1 && mapRef.current.getSource("route-driver-passenger")) {
        (
          mapRef.current.getSource(
            "route-driver-passenger"
          ) as maplibregl.GeoJSONSource
        ).setData(r1);
      }
    },
    []
  );

  const updateRoute2 = useCallback(
    async (
      passengerCoords: [number, number],
      destinationCoords: [number, number]
    ) => {
      if (!mapRef.current) return;
      const r2 = await fetchOrsRoute(passengerCoords, destinationCoords);
      if (r2 && mapRef.current.getSource("route-passenger-destination")) {
        (
          mapRef.current.getSource(
            "route-passenger-destination"
          ) as maplibregl.GeoJSONSource
        ).setData(r2);
      }
    },
    []
  );

  useEffect(() => {
    const fetchRide = async () => {
      const user = await new Promise<any>((res) =>
        auth.onAuthStateChanged(res)
      );
      if (!user) return;

      const token = await user.getIdToken();
      const data = await getRideById(rideId, token);

      console.log("Ride fetched:", data.ride);
      setRide(data.ride);
      setPassengers(data.ride.passengers);
    };
    fetchRide();
  }, [rideId]);

  useEffect(() => {
    if (ride && ride.status === "completed") return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [
          pos.coords.longitude,
          pos.coords.latitude,
        ];
        setDriverLocation(coords);

        if (socketRef.current) {
          socketRef.current.emit("driver-location", {
            rideId,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        }
      },
      (err) => console.warn(err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [rideId, ride?.status]);

  // Socket setup (unchanged)
  useEffect(() => {
    if (!rideId || (ride && ride.status === "completed")) return;

    const socket = io(SOCKET_SERVER_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join-ride-room", rideId);
    });

    socket.on("passenger-location-update", (data: LocationData) => {
      setPassengerLocation([data.lng, data.lat]);
    });

    socket.on("disconnect", () => console.log("Socket disconnected"));

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-ride-room", rideId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [rideId, ride?.status]);

  // Map Initialization (unchanged)
  useEffect(() => {
    if (!ride || !driverLocation || !passengerPosition || mapRef.current)
      return;

    const [dLng, dLat] = driverLocation;
    const [pLng, pLat] = passengerPosition;
    const [toLng, toLat] = ride.toCoordinates.coordinates;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current!,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
      center: [dLng, dLat],
      zoom: 14,
    });

    mapRef.current.on("load", async () => {
      const createMarker = (emoji: string) => {
        const el = document.createElement("div");
        el.style.fontSize = "32px";
        el.innerText = emoji;
        return el;
      };

      driverMarker.current = new maplibregl.Marker({
        element: createMarker("🚗"),
      })
        .setLngLat([dLng, dLat])
        .addTo(mapRef.current!);

      passengerMarker.current = new maplibregl.Marker({
        element: createMarker("🧍"),
      })
        .setLngLat([pLng, pLat])
        .addTo(mapRef.current!);

      destinationMarker.current = new maplibregl.Marker({
        element: createMarker("📍"),
      })
        .setLngLat([toLng, toLat])
        .addTo(mapRef.current!);

      // Routes (unchanged)
      mapRef.current.addSource("route-driver-passenger", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      mapRef.current.addLayer({
        id: "route-line-dp",
        type: "line",
        source: "route-driver-passenger",
        paint: { "line-color": "#0074D9", "line-width": 4 },
      });
      updateRoute1([dLng, dLat], [pLng, pLat]);

      mapRef.current.addSource("route-passenger-destination", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      mapRef.current.addLayer({
        id: "route-line-pd",
        type: "line",
        source: "route-passenger-destination",
        paint: { "line-color": "#2ECC40", "line-width": 4 },
      });
      updateRoute2([pLng, pLat], [toLng, toLat]);

      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([dLng, dLat]);
      bounds.extend([pLng, pLat]);
      bounds.extend([toLng, toLat]);
      mapRef.current.fitBounds(bounds, { padding: 80 });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [ride]);

  useEffect(() => {
    if (!mapRef.current || !driverLocation || !passengerPosition || !ride)
      return;

    const [dLng, dLat] = driverLocation;
    const driverCoords: [number, number] = [dLng, dLat];

    const [fromLng, fromLat] = ride.fromCoordinates.coordinates;
    const pickupCoords: [number, number] = [fromLng, fromLat];
    const distanceToPickup = getDistance(driverCoords, pickupCoords);

    if (distanceToPickup <= COMPLETION_THRESHOLD && ride.status === "booked") {
      setIsNearPickup(true);
    } else {
      setIsNearPickup(false);
    }

    const [toLng, toLat] = ride.toCoordinates.coordinates;
    const destinationCoords: [number, number] = [toLng, toLat];
    const distanceToDropoff = getDistance(driverCoords, destinationCoords);

    if (
      distanceToDropoff <= COMPLETION_THRESHOLD &&
      ride.status === "ongoing"
    ) {
      setIsNearDestination(true);
    } else {
      setIsNearDestination(false);
    }
    const [pLng, pLat] = passengerPosition;
    if (driverMarker.current) animateMarker(driverMarker.current, dLng, dLat);
    if (passengerMarker.current)
      animateMarker(passengerMarker.current, pLng, pLat);

    updateRoute1([dLng, dLat], [pLng, pLat]);
    updateRoute2([pLng, pLat], [toLng, toLat]);
  }, [driverLocation, passengerPosition, ride, updateRoute1, updateRoute2]);

  const [IsDriver, setIsDriver] = useState<boolean | null>(null);

  useEffect(() => {
    if (!ride) return;

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setIsDriver(null);
        return;
      }

      const uid = user.uid;

      if (uid === ride.driver.uid) {
        setIsDriver(true);
      } else {
        setIsDriver(false);
      }
    });

    return () => unsubscribe();
  }, [ride]);

  if (!ride) return <p>Loading ride details...</p>;

  // Calculate distance for display purposes only
  const distanceForDisplay = driverLocation
    ? getDistance(
        driverLocation,
        ride.status === "booked"
          ? ride.fromCoordinates.coordinates
          : ride.toCoordinates.coordinates
      )
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 p-3 gap-2 h-screen">
      <div
        ref={mapContainerRef}
        className="mx-auto"
        style={{
          height: "60%",
          width: "100%",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      />
      <div>
        {IsDriver ? (
          <div className="flex flex-col h-full">
            {/* --- CONDITIONAL RIDE BUTTONS/STATUS --- */}
            {ride.status === "completed" ? (
              <div className="p-4 bg-green-600/20 text-green-400 rounded-lg text-center font-semibold">
                Trip COMPLETED! Thank you for driving.
              </div>
            ) : ride.status === "booked" ? (
              /* --- PICKUP BUTTON --- */
              <Button
                onClick={handleStartRide}
                disabled={!isNearPickup || isStarting}
                className={`w-full py-4 text-lg font-bold transition ${
                  isNearPickup && !isStarting
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-500 cursor-not-allowed"
                }`}
              >
                {isStarting
                  ? "Starting Ride..."
                  : isNearPickup
                  ? "Confirm Pickup (Start Ride)"
                  : `Move Closer (${
                      Math.round(distanceForDisplay) / 1000
                    }km) to Pickup`}
              </Button>
            ) : ride.status === "ongoing" ? (
              /* --- DROPOFF BUTTON --- */
              <Button
                onClick={handleCompleteRide}
                disabled={!isNearDestination || isFinishing}
                className={`w-full py-4 text-lg font-bold transition ${
                  isNearDestination && !isFinishing
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-500 cursor-not-allowed"
                }`}
              >
                {isFinishing
                  ? "Finishing..."
                  : isNearDestination
                  ? "End Ride (Confirm Drop-off)"
                  : `Move Closer (${
                      Math.round(distanceForDisplay) / 1000
                    }km) to Finish`}
              </Button>
            ) : (
              <div className="p-4 bg-yellow-600/20 text-yellow-400 rounded-lg text-center font-semibold">
                Ride Status: {ride.status}
              </div>
            )}
            {/* -------------------------------------- */}

            <div className="flex flex-wrap overflow-y-auto">
              {passengers.map((passenger, index) => (
                <Card
                  key={passenger.email || index}
                  className="flex-1 min-w-[280px] m-1"
                >
                  <CardHeader>
                    <div className="flex gap-1 items-center">
                      <Image
                        src={`https://proxy.duckduckgo.com/iu/?u=${passenger.picture}`}
                        width={36}
                        height={36}
                        alt="profile"
                        className="rounded-full object-cover"
                      />
                      <span className="font-thin">{passenger.name}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>
                      <a
                        href={`tel:${passenger.phone}`}
                        className="flex items-center gap-2 text-white px-3 py-1 rounded-full hover:bg-white/10 transition"
                      >
                        <Phone className="w-5 h-5" />
                        {passenger.phone}
                      </a>
                    </p>
                    <p className="flex gap-2 items-center px-3 py-1">
                      <Armchair className="w-5 h-5" />
                      <p>{String(passenger.seatsBooked)} seats</p>
                    </p>
                    <p>
                      <a
                        href={`mailto:${passenger.email}`}
                        className="flex items-center gap-2 text-white px-3 py-1 rounded-full hover:bg-white/10 transition"
                      >
                        <Mail className="w-5 h-5" />
                        {passenger.email}
                      </a>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <Card className="flex-1">
              <CardHeader>
                <div className="flex gap-1 items-center">
                  <Image
                    src={`https://proxy.duckduckgo.com/iu/?u=${ride.driver.picture}`}
                    width={36}
                    height={36}
                    alt="profile"
                    className="rounded-full object-cover"
                  />
                  <span className="font-thin">{ride.driver.name}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  <a
                    href={`tel:${ride.driver.phone}`}
                    className="flex items-center gap-2 text-white px-3 py-1 rounded-full hover:bg-white/10 transition"
                  >
                    <Phone className="w-5 h-5" />
                    {ride.driver.phone}
                  </a>
                </p>
                <p>
                  <a
                    href={`mailto:${ride.driver.email}`}
                    className="flex items-center gap-2 text-white px-3 py-1 rounded-full hover:bg-white/10 transition"
                  >
                    <Mail className="w-5 h-5" />
                    {ride.driver.email}
                  </a>
                </p>
                <p className="flex gap-2 items-center px-3 py-1">
                  <Palette className="w-5 h-5" />
                  <span>{ride.carDetails.color}</span>
                </p>
                <p className="flex gap-2 items-center px-3 py-1">
                  <IdCard className="w-5 h-5" />
                  <span>{ride.carDetails.licensePlate}</span>
                </p>
                <p className="flex gap-2 items-center px-3 py-1">
                  <Car className="w-5 h-5" />
                  <span>{ride.carDetails.model}</span>
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentRide;
