"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, User, CheckCircle, Building2, Home, Camera, ArrowRight } from "lucide-react";

const CHIPS = [
  { label: "NEW LAUNCH", key: "new_launch", icon: Sparkles, color: "#34a853", bg: "#e6f4ea" },
  { label: "Owner", key: "posted_by", value: "individual", icon: User, color: "#414754", bg: "#f4f3f7" },
  { label: "Verified", key: "verified", icon: CheckCircle, color: "#fbbc04", bg: "#fef7e0" },
  { label: "Under Construction", key: "construction", value: "under", icon: Building2, color: "#414754", bg: "#f4f3f7" },
  { label: "Ready To Move", key: "ready", icon: Home, color: "#414754", bg: "#f4f3f7" },
  { label: "With Photos", key: "has_photos", icon: Camera, color: "#414754", bg: "#f4f3f7" },
];

export function FilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const toggleChip = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.has(key)) {
      params.delete(key);
    } else {
      params.set(key, value || "true");
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2">
      {/* Filters button */}
      <button
        className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold text-white"
        style={{ background: "#1a73e8" }}
      >
        Filters
      </button>

      {CHIPS.map((chip) => {
        const isActive = searchParams.has(chip.key);
        return (
          <button
            key={chip.key}
            onClick={() => toggleChip(chip.key, chip.value)}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              borderColor: isActive ? chip.color : "#e8eaed",
              background: isActive ? chip.bg : "#ffffff",
              color: isActive ? chip.color : "#414754",
            }}
          >
            <chip.icon className="h-3 w-3" />
            {chip.label}
          </button>
        );
      })}

      <button className="flex items-center gap-1 whitespace-nowrap text-xs font-medium" style={{ color: "#727785" }}>
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}
