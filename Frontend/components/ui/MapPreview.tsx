"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export interface LocationFeature {
  geometry: {
    coordinates: [number, number];
  };
}

interface Props {
  from: LocationFeature | null;
  to: LocationFeature | null;
}

const MapPreview: React.FC<Props> = ({ from, to }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);

  useEffect(() => {
    if (!mapRef.current || !from || !to) return;

    // Initialize map
    if (!mapInstance.current) {
      mapInstance.current = new maplibregl.Map({
        container: mapRef.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
        center: from.geometry.coordinates,
        zoom: 12,
      });

      mapInstance.current.on("load", () => mapInstance.current?.resize());
    }

    const map = mapInstance.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add markers
    const fromMarker = new maplibregl.Marker({ color: "green" })
      .setLngLat(from.geometry.coordinates)
      .addTo(map);
    const toMarker = new maplibregl.Marker({ color: "red" })
      .setLngLat(to.geometry.coordinates)
      .addTo(map);
    markersRef.current.push(fromMarker, toMarker);

    // Fit bounds
    const bounds = new maplibregl.LngLatBounds();
    bounds.extend(from.geometry.coordinates);
    bounds.extend(to.geometry.coordinates);
    map.fitBounds(bounds, { padding: 80, maxZoom: 14 });

    // Fetch route from OpenRouteService
    const fetchRoute = async () => {
      const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_KEY;
      const url =
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: ORS_API_KEY!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coordinates: [from.geometry.coordinates, to.geometry.coordinates],
          }),
        });

        const data = await response.json();

        // Remove old route if exists
        if (map.getSource("route")) {
          map.removeLayer("route");
          map.removeSource("route");
        }

        // Add route LineString
        map.addSource("route", {
          type: "geojson",
          data: data,
        });

        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#1E90FF", "line-width": 5 },
        });

        // Distance & duration
        const route = data.features[0];
        const distance = route.properties.summary.distance; // meters
        const duration = route.properties.summary.duration * 2; // seconds
        setRouteInfo({ distance, duration });
      } catch (err) {
        console.error("Failed to fetch route:", err);
      }
    };

    fetchRoute();
  }, [from, to]);

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-[400px] rounded-md" />
      {routeInfo && (
        <div className="absolute top-2 left-2 bg-white text-black px-3 py-1 rounded-md shadow-md text-sm font-medium z-10">
          Distance: {(routeInfo.distance / 1000).toFixed(2)} km | Duration:{" "}
          {(routeInfo.duration / 60).toFixed(0)} min
        </div>
      )}
    </div>
  );
};

export default MapPreview;
