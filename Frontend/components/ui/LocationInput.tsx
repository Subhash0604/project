"use client";

import { useEffect, useState, useRef } from "react";
import { MapPin } from "lucide-react";

export interface LocationFeature {
  place_name: string;
  geometry: {
    coordinates: [number, number];
  };
}

interface Props {
  value: string;
  onSelect: (feature: LocationFeature) => void;
  placeholder: string;
}

export default function LocationInput({ value, onSelect, placeholder }: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationFeature[]>([]);
  const [selected, setSelected] = useState(false);
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Detect clicks outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setResults([]);
        setSelected(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch suggestions when typing
  useEffect(() => {
    const controller = new AbortController();

    const fetchSuggestions = async () => {
      if (!query || selected) return;

      setLoading(true);
      try {
        const res = await fetch(
          `https://api.maptiler.com/geocoding/${query}.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setResults(data.features || []);
      } catch (err) {
        if ((err as any).name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => {
      controller.abort();
      clearTimeout(debounceTimer);
    };
  }, [query, selected]);

  const handleSelect = (feature: LocationFeature) => {
    setQuery(feature.place_name);
    setResults([]);
    setSelected(true);
    onSelect(feature);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelected(false);
        }}
        placeholder={placeholder}
        className="w-full h-10 rounded-md border border-input bg-background pl-10 pr-3 text-sm text-foreground shadow-sm transition placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
      />

      {loading && (
        <div className="absolute z-50 top-full left-0 mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground shadow">
          Loading...
        </div>
      )}

      {results.length > 0 && !selected && (
        <ul className="absolute z-50 top-full left-0 mt-1 w-full max-h-48 overflow-auto rounded-md border bg-background text-sm shadow">
          {results.map((feature, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(feature)}
              className="cursor-pointer px-3 py-2 hover:bg-muted hover:text-foreground transition-colors"
            >
              {feature.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
