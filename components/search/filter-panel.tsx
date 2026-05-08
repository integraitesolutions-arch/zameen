"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { LISTING_TYPES, PROPERTY_TYPES, FURNISHING_OPTIONS, PARKING_OPTIONS } from "@/lib/constants";
import { SlidersHorizontal, X } from "lucide-react";

const PRICE_PRESETS = [
  { label: "Under 50L", min: 0, max: 5000000 },
  { label: "50L - 1Cr", min: 5000000, max: 10000000 },
  { label: "1 - 3Cr", min: 10000000, max: 30000000 },
  { label: "3Cr+", min: 30000000, max: 0 },
];

interface Filters {
  listing_type: string;
  property_type: string[];
  price_min: string;
  price_max: string;
  bedrooms: string;
  bathrooms: string;
  furnishing: string[];
  parking: string[];
  posted_by: string;
}

function FilterContent({
  filters,
  setFilters,
  onApply,
  onClear,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onApply: () => void;
  onClear: () => void;
}) {
  const toggleArray = (key: "property_type" | "furnishing" | "parking", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  return (
    <div className="space-y-5">
      {/* Listing Type */}
      <div>
        <Label className="mb-2 block text-sm font-semibold">Listing Type</Label>
        <div className="flex flex-wrap gap-1.5">
          {LISTING_TYPES.map((lt) => (
            <button
              key={lt.value}
              onClick={() => setFilters((p) => ({ ...p, listing_type: p.listing_type === lt.value ? "" : lt.value }))}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                filters.listing_type === lt.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {lt.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Property Type */}
      <div>
        <Label className="mb-2 block text-sm font-semibold">Property Type</Label>
        <div className="space-y-1.5">
          {PROPERTY_TYPES.map((pt) => (
            <div key={pt.value} className="flex items-center gap-2">
              <Checkbox
                id={`pt-${pt.value}`}
                checked={filters.property_type.includes(pt.value)}
                onCheckedChange={() => toggleArray("property_type", pt.value)}
              />
              <Label htmlFor={`pt-${pt.value}`} className="text-sm font-normal">{pt.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <Label className="mb-2 block text-sm font-semibold">Price Range</Label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {PRICE_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setFilters((prev) => ({ ...prev, price_min: String(p.min), price_max: p.max ? String(p.max) : "" }))}
              className="rounded-full border px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Min"
            type="number"
            value={filters.price_min}
            onChange={(e) => setFilters((p) => ({ ...p, price_min: e.target.value }))}
          />
          <span className="flex items-center text-gray-400">—</span>
          <Input
            placeholder="Max"
            type="number"
            value={filters.price_max}
            onChange={(e) => setFilters((p) => ({ ...p, price_max: e.target.value }))}
          />
        </div>
      </div>

      <Separator />

      {/* Bedrooms */}
      <div>
        <Label className="mb-2 block text-sm font-semibold">Bedrooms</Label>
        <div className="flex gap-1.5">
          {["1", "2", "3", "4", "5+"].map((b) => (
            <button
              key={b}
              onClick={() => setFilters((p) => ({ ...p, bedrooms: p.bedrooms === b ? "" : b }))}
              className={`rounded-full px-3 py-1 text-xs font-medium border ${
                filters.bedrooms === b ? "bg-blue-600 text-white border-blue-600" : "text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div>
        <Label className="mb-2 block text-sm font-semibold">Bathrooms</Label>
        <div className="flex gap-1.5">
          {["1", "2", "3", "4+"].map((b) => (
            <button
              key={b}
              onClick={() => setFilters((p) => ({ ...p, bathrooms: p.bathrooms === b ? "" : b }))}
              className={`rounded-full px-3 py-1 text-xs font-medium border ${
                filters.bathrooms === b ? "bg-blue-600 text-white border-blue-600" : "text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Furnishing */}
      <div>
        <Label className="mb-2 block text-sm font-semibold">Furnishing</Label>
        <div className="space-y-1.5">
          {FURNISHING_OPTIONS.map((f) => (
            <div key={f.value} className="flex items-center gap-2">
              <Checkbox
                id={`fur-${f.value}`}
                checked={filters.furnishing.includes(f.value)}
                onCheckedChange={() => toggleArray("furnishing", f.value)}
              />
              <Label htmlFor={`fur-${f.value}`} className="text-sm font-normal">{f.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Posted By */}
      <div>
        <Label className="mb-2 block text-sm font-semibold">Posted By</Label>
        <div className="flex gap-1.5">
          {["Owner", "Agent", "Builder"].map((p) => (
            <button
              key={p}
              onClick={() => setFilters((prev) => ({ ...prev, posted_by: prev.posted_by === p.toLowerCase() ? "" : p.toLowerCase() }))}
              className={`rounded-full px-3 py-1 text-xs font-medium border ${
                filters.posted_by === p.toLowerCase() ? "bg-blue-600 text-white border-blue-600" : "text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onClear}>Clear All</Button>
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={onApply}>Apply</Button>
      </div>
    </div>
  );
}

export function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    listing_type: searchParams.get("listing_type") || "",
    property_type: searchParams.get("property_type")?.split(",").filter(Boolean) || [],
    price_min: searchParams.get("price_min") || "",
    price_max: searchParams.get("price_max") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    bathrooms: searchParams.get("bathrooms") || "",
    furnishing: searchParams.get("furnishing")?.split(",").filter(Boolean) || [],
    parking: searchParams.get("parking")?.split(",").filter(Boolean) || [],
    posted_by: searchParams.get("posted_by") || "",
  });

  const buildQuery = () => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    if (filters.listing_type) params.set("listing_type", filters.listing_type);
    if (filters.property_type.length) params.set("property_type", filters.property_type.join(","));
    if (filters.price_min) params.set("price_min", filters.price_min);
    if (filters.price_max) params.set("price_max", filters.price_max);
    if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
    if (filters.bathrooms) params.set("bathrooms", filters.bathrooms);
    if (filters.furnishing.length) params.set("furnishing", filters.furnishing.join(","));
    if (filters.parking.length) params.set("parking", filters.parking.join(","));
    if (filters.posted_by) params.set("posted_by", filters.posted_by);
    return params.toString();
  };

  const onApply = () => {
    router.push(`/search?${buildQuery()}`);
    setOpen(false);
  };

  const onClear = () => {
    setFilters({
      listing_type: "", property_type: [], price_min: "", price_max: "",
      bedrooms: "", bathrooms: "", furnishing: [], parking: [], posted_by: "",
    });
  };

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-[280px] shrink-0 lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border bg-white p-4">
          <h3 className="mb-4 font-semibold text-gray-900">Filters</h3>
          <FilterContent filters={filters} setFilters={setFilters} onApply={onApply} onClear={onClear} />
        </div>
      </aside>

      {/* Mobile */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="inline-flex h-8 items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-gray-50 lg:hidden">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </SheetTrigger>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <FilterContent filters={filters} setFilters={setFilters} onApply={onApply} onClear={onClear} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
