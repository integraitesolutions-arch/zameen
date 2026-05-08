"use client";

import { useState } from "react";
import { GraduationCap, Hospital, Train, ShoppingBag, Landmark, Utensils } from "lucide-react";

interface NearbyAmenitiesProps {
  locality: string;
  city: string;
}

const CATEGORIES = [
  { key: "schools", label: "Schools", icon: GraduationCap, color: "#1a73e8" },
  { key: "hospitals", label: "Hospitals", icon: Hospital, color: "#ea4335" },
  { key: "transit", label: "Metro/Transit", icon: Train, color: "#34a853" },
  { key: "shopping", label: "Shopping", icon: ShoppingBag, color: "#fbbc04" },
  { key: "banks", label: "Banks/ATMs", icon: Landmark, color: "#414754" },
  { key: "dining", label: "Restaurants", icon: Utensils, color: "#e8956e" },
];

// Simulated nearby places (in production, use OpenStreetMap Overpass API)
const MOCK_NEARBY: Record<string, { name: string; distance: string }[]> = {
  schools: [
    { name: "Delhi Public School", distance: "0.8 km" },
    { name: "Ryan International", distance: "1.2 km" },
    { name: "St. Xavier's High School", distance: "1.5 km" },
  ],
  hospitals: [
    { name: "Apollo Hospital", distance: "1.0 km" },
    { name: "Fortis Healthcare", distance: "2.3 km" },
    { name: "Max Super Speciality", distance: "3.1 km" },
  ],
  transit: [
    { name: "Metro Station", distance: "0.5 km" },
    { name: "Bus Stop", distance: "0.2 km" },
    { name: "Railway Station", distance: "2.0 km" },
  ],
  shopping: [
    { name: "Phoenix Mall", distance: "1.8 km" },
    { name: "D-Mart", distance: "0.6 km" },
    { name: "Big Bazaar", distance: "1.4 km" },
  ],
  banks: [
    { name: "SBI Branch & ATM", distance: "0.3 km" },
    { name: "HDFC Bank", distance: "0.7 km" },
    { name: "ICICI Bank ATM", distance: "0.4 km" },
  ],
  dining: [
    { name: "Barbeque Nation", distance: "1.2 km" },
    { name: "Domino's Pizza", distance: "0.5 km" },
    { name: "Haldiram's", distance: "0.9 km" },
  ],
};

export function NearbyAmenities({ locality, city }: NearbyAmenitiesProps) {
  const [activeCategory, setActiveCategory] = useState("schools");

  const places = MOCK_NEARBY[activeCategory] || [];

  return (
    <div>
      <h2 className="mb-4 font-heading text-lg font-semibold" style={{ color: "#202124" }}>
        Nearby - {locality}, {city}
      </h2>

      {/* Category tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              background: activeCategory === cat.key ? "#e8f0fe" : "#f4f3f7",
              color: activeCategory === cat.key ? "#1a73e8" : "#414754",
              border: activeCategory === cat.key ? "1px solid #1a73e8" : "1px solid transparent",
            }}
          >
            <cat.icon className="h-3.5 w-3.5" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Places list */}
      <div className="space-y-2">
        {places.map((place, i) => {
          const cat = CATEGORIES.find((c) => c.key === activeCategory)!;
          return (
            <div key={i} className="flex items-center gap-3 rounded-lg p-3" style={{ background: "#f4f3f7" }}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "#e8f0fe" }}>
                <cat.icon className="h-4 w-4" style={{ color: cat.color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: "#202124" }}>{place.name}</p>
              </div>
              <span className="text-xs font-medium" style={{ color: "#727785" }}>{place.distance}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
