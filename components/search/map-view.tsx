"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Listing } from "@/lib/supabase/types";
import { formatPrice } from "@/lib/constants";

interface MapViewProps {
  listings: Listing[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export function MapView({ listings, selectedId, onSelect }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: false,
    });

    // Zoom control bottom-right like Zillow
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Clean map tile (CartoDB Positron — light, minimal, Zillow-like)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds: L.LatLngTuple[] = [];

    listings.forEach((listing) => {
      if (!listing.latitude || !listing.longitude) return;

      const pos: L.LatLngTuple = [listing.latitude, listing.longitude];
      bounds.push(pos);

      const isSelected = selectedId === listing.id;
      const price = formatPrice(listing.price);

      // Zillow-style price pill marker
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          background: ${isSelected ? "#006AFF" : "#ffffff"};
          color: ${isSelected ? "#ffffff" : "#2A2A33"};
          padding: 3px 8px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          font-family: -apple-system, system-ui, sans-serif;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          border: 1px solid ${isSelected ? "#006AFF" : "rgba(0,0,0,0.08)"};
          white-space: nowrap;
          cursor: pointer;
          position: relative;
          display: inline-block;
          line-height: 1.4;
          letter-spacing: -0.2px;
          transform: translate(-50%, -50%);
          transition: all 0.15s ease;
        ">${price}</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker(pos, { icon }).addTo(map);

      marker.on("click", () => onSelect?.(listing.id));

      // Rich tooltip
      const coverImg = listing.media?.find((m) => m.is_cover)?.url || listing.media?.[0]?.url;
      marker.bindTooltip(
        `<div style="width:220px;padding:0;margin:0;">
          ${coverImg ? `<img src="${coverImg}" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;display:block;" />` : ""}
          <div style="padding:8px 10px;">
            <div style="font-size:14px;font-weight:700;color:#2A2A33;">${price}${listing.listing_type === "rent" ? "<span style='font-size:11px;font-weight:400;color:#869099'>/mo</span>" : ""}</div>
            <div style="font-size:11px;color:#585858;margin-top:2px;">
              ${listing.bedrooms ? listing.bedrooms + " bd" : ""} ${listing.bathrooms ? "| " + listing.bathrooms + " ba" : ""} ${listing.area_sqft ? "| " + listing.area_sqft.toLocaleString() + " sqft" : ""}
            </div>
            <div style="font-size:11px;color:#869099;margin-top:2px;">${listing.locality}, ${listing.city}</div>
          </div>
        </div>`,
        {
          direction: "top",
          offset: [0, -8],
          opacity: 1,
          className: "zameen-tooltip",
        }
      );

      markersRef.current.push(marker);
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 13);
    }
  }, [listings, selectedId, onSelect]);

  return (
    <>
      <style>{`
        .zameen-tooltip {
          padding: 0 !important;
          border: none !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
          border-radius: 10px !important;
          overflow: hidden;
        }
        .zameen-tooltip .leaflet-tooltip-content {
          margin: 0;
        }
        .leaflet-tooltip-top::before {
          border-top-color: white !important;
        }
      `}</style>
      <div ref={mapRef} className="h-full w-full" />
    </>
  );
}
