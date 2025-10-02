"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      mapInstance.current = new maplibregl.Map({
        container: mapRef.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
        center: [77.59, 12.97],
        zoom: 12,
      });

      mapInstance.current.on("load", () => {
        mapInstance.current?.resize();
      });
    }

    const map = mapInstance.current;
    if (!map || !from || !to) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    const fromMarker = new maplibregl.Marker({ color: "green" })
      .setLngLat(from.geometry.coordinates)
      .addTo(map);
    const toMarker = new maplibregl.Marker({ color: "red" })
      .setLngLat(to.geometry.coordinates)
      .addTo(map);
    markersRef.current.push(fromMarker, toMarker);

    // Fit bounds around both markers
    const bounds = new maplibregl.LngLatBounds();
    bounds.extend(from.geometry.coordinates);
    bounds.extend(to.geometry.coordinates);

    map.fitBounds(bounds, {
      padding: 80,
      duration: 800,
      maxZoom: 14, // Prevent zooming too far out
    });
  }, [from, to]);

  return <div ref={mapRef} style={{ height: "400px", width: "100%" }} />;
};

export default MapPreview;
