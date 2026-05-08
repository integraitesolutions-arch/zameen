"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Map, List } from "lucide-react";
import Link from "next/link";

interface SortBarProps {
  count: number;
  location?: string;
}

export function SortBar({ count, location }: SortBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const sort = searchParams.get("sort") || "newest";
  const isMapView = pathname.includes("/map");

  const handleSort = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleUrl = isMapView
    ? `/search?${searchParams.toString()}`
    : `/search/map?${searchParams.toString()}`;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm" style={{ color: "#585858" }}>
        <span className="font-semibold" style={{ color: "#2A2A33" }}>{count}</span> properties
        {location && <span> in {location}</span>}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={toggleUrl}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50"
          style={{ borderColor: "#e0e0e0", color: "#585858" }}
        >
          {isMapView ? <List className="h-3.5 w-3.5" /> : <Map className="h-3.5 w-3.5" />}
          {isMapView ? "List View" : "Map View"}
        </Link>
        <Select value={sort} onValueChange={handleSort}>
          <SelectTrigger className="w-40 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="area_desc">Area: Largest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
