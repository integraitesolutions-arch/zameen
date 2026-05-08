"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const PILLS = [
  { label: "Buy", param: "listing_type", value: "sale" },
  { label: "Rent", param: "listing_type", value: "rent" },
  { label: "Paying Guest", param: "listing_type", value: "pg_coliving" },
  { label: "Commercial", param: "property_type", value: "commercial_shop,commercial_office" },
  { label: "Land", param: "property_type", value: "plot,farmland" },
  { label: "Business", param: "property_type", value: "business" },
];

export function FilterPills() {
  const searchParams = useSearchParams();
  const activeType = searchParams.get("listing_type") || searchParams.get("property_type");

  return (
    <div className="flex justify-center gap-2 overflow-x-auto pb-1">
      {PILLS.map((pill) => {
        const isActive = activeType === pill.value;
        return (
          <Link
            key={pill.label}
            href={`/search?${pill.param}=${pill.value}`}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              isActive
                ? "bg-white text-[#006AFF] shadow-md"
                : "text-white/70 border border-white/20 hover:bg-white/10 hover:text-white"
            }`}
          >
            {pill.label}
          </Link>
        );
      })}
    </div>
  );
}
