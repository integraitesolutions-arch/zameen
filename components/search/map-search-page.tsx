"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { ListingCard } from "@/components/listing/listing-card";
import { SearchBar } from "./search-bar";
import { ChevronDown, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/supabase/types";
import { useRouter, useSearchParams } from "next/navigation";
import { LISTING_TYPES, PROPERTY_TYPES, FURNISHING_OPTIONS } from "@/lib/constants";

const MapView = dynamic(() => import("./map-view").then((m) => m.MapView), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse" style={{ background: "#f0f0f0" }} />,
});

interface MapSearchPageProps {
  listings: Listing[];
  query: string;
  location: string;
}

function FilterDropdown({
  label,
  isOpen,
  onToggle,
  children,
  hasActive,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  hasActive?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && isOpen) {
        onToggle();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onToggle]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-gray-50"
        style={{
          borderColor: isOpen || hasActive ? "#006AFF" : "#d4d4d4",
          color: isOpen || hasActive ? "#006AFF" : "#2A2A33",
          background: isOpen ? "#f0f7ff" : "white",
        }}
      >
        {label}
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} style={{ opacity: 0.5 }} />
      </button>
      {isOpen && (
        <div
          className="absolute left-0 top-full z-50 mt-1 rounded-xl bg-white p-4 shadow-xl"
          style={{ border: "1px solid #e0e0e0", minWidth: "240px" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function MapSearchPage({ listings: initialListings, query, location }: MapSearchPageProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [hoveredId, setHoveredId] = useState<string | undefined>();
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state
  const [listingType, setListingType] = useState(searchParams.get("listing_type") || "");
  const [priceMin, setPriceMin] = useState(searchParams.get("price_min") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("price_max") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [bathrooms, setBathrooms] = useState(searchParams.get("bathrooms") || "");
  const [propertyTypes, setPropertyTypes] = useState<string[]>(
    searchParams.get("property_type")?.split(",").filter(Boolean) || []
  );

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (listingType) params.set("listing_type", listingType);
    if (priceMin) params.set("price_min", priceMin);
    if (priceMax) params.set("price_max", priceMax);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (bathrooms) params.set("bathrooms", bathrooms);
    if (propertyTypes.length) params.set("property_type", propertyTypes.join(","));
    router.push(`/search/map?${params.toString()}`);
    setOpenFilter(null);
  };

  const togglePropertyType = (value: string) => {
    setPropertyTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const listingTypeLabel = LISTING_TYPES.find((t) => t.value === listingType)?.label || "For Sale";

  // Client-side filtering on mock data
  let listings = initialListings;
  if (listingType) listings = listings.filter((l) => l.listing_type === listingType);
  if (propertyTypes.length) listings = listings.filter((l) => propertyTypes.includes(l.property_type));
  if (priceMin) listings = listings.filter((l) => l.price >= parseInt(priceMin));
  if (priceMax) listings = listings.filter((l) => l.price <= parseInt(priceMax));
  if (bedrooms) listings = listings.filter((l) => l.bedrooms && l.bedrooms >= parseInt(bedrooms));

  const scrollToListing = (id: string) => {
    setSelectedId(id);
    const el = document.getElementById(`listing-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      {/* Top filter bar */}
      <div className="flex items-center gap-2 border-b px-4 py-2" style={{ borderColor: "#e0e0e0", background: "#ffffff" }}>
        <div className="w-64 flex-shrink-0">
          <SearchBar defaultValue={query} />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {/* For Sale */}
          <FilterDropdown
            label={listingTypeLabel}
            isOpen={openFilter === "listing_type"}
            onToggle={() => setOpenFilter(openFilter === "listing_type" ? null : "listing_type")}
            hasActive={!!listingType}
          >
            <div className="space-y-1.5">
              {LISTING_TYPES.map((lt) => (
                <button
                  key={lt.value}
                  onClick={() => { setListingType(lt.value === listingType ? "" : lt.value); }}
                  className="flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-50"
                  style={{
                    background: listingType === lt.value ? "#f0f7ff" : "transparent",
                    color: listingType === lt.value ? "#006AFF" : "#2A2A33",
                    fontWeight: listingType === lt.value ? 600 : 400,
                  }}
                >
                  {lt.label}
                </button>
              ))}
            </div>
            <Button size="sm" className="mt-3 w-full text-white" style={{ background: "#006AFF" }} onClick={applyFilters}>
              Apply
            </Button>
          </FilterDropdown>

          {/* Price */}
          <FilterDropdown
            label={priceMin || priceMax ? `₹${priceMin || "0"} - ₹${priceMax || "Any"}` : "Price"}
            isOpen={openFilter === "price"}
            onToggle={() => setOpenFilter(openFilter === "price" ? null : "price")}
            hasActive={!!(priceMin || priceMax)}
          >
            <div className="space-y-3">
              <p className="text-xs font-semibold" style={{ color: "#2A2A33" }}>Price Range</p>
              <div className="flex gap-2">
                <div>
                  <Label className="text-[10px]">Min (₹)</Label>
                  <Input placeholder="No min" type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="text-xs" />
                </div>
                <div>
                  <Label className="text-[10px]">Max (₹)</Label>
                  <Input placeholder="No max" type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="text-xs" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {[
                  { label: "Under 50L", min: "0", max: "5000000" },
                  { label: "50L - 1Cr", min: "5000000", max: "10000000" },
                  { label: "1 - 3Cr", min: "10000000", max: "30000000" },
                  { label: "3Cr+", min: "30000000", max: "" },
                ].map((p) => (
                  <button
                    key={p.label}
                    onClick={() => { setPriceMin(p.min); setPriceMax(p.max); }}
                    className="rounded-md border px-2 py-1 text-[10px] hover:bg-gray-50"
                    style={{ borderColor: "#e0e0e0", color: "#585858" }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <Button size="sm" className="w-full text-white" style={{ background: "#006AFF" }} onClick={applyFilters}>
                Apply
              </Button>
            </div>
          </FilterDropdown>

          {/* Beds & Baths */}
          <FilterDropdown
            label={bedrooms ? `${bedrooms}+ Beds` : "Beds & Baths"}
            isOpen={openFilter === "beds"}
            onToggle={() => setOpenFilter(openFilter === "beds" ? null : "beds")}
            hasActive={!!(bedrooms || bathrooms)}
          >
            <div className="space-y-3">
              <div>
                <p className="mb-2 text-xs font-semibold" style={{ color: "#2A2A33" }}>Bedrooms</p>
                <div className="flex gap-1">
                  {["", "1", "2", "3", "4", "5"].map((b) => (
                    <button
                      key={b}
                      onClick={() => setBedrooms(b)}
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium"
                      style={{
                        background: bedrooms === b ? "#006AFF" : "white",
                        color: bedrooms === b ? "white" : "#585858",
                        borderColor: bedrooms === b ? "#006AFF" : "#e0e0e0",
                      }}
                    >
                      {b || "Any"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold" style={{ color: "#2A2A33" }}>Bathrooms</p>
                <div className="flex gap-1">
                  {["", "1", "2", "3", "4"].map((b) => (
                    <button
                      key={b}
                      onClick={() => setBathrooms(b)}
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium"
                      style={{
                        background: bathrooms === b ? "#006AFF" : "white",
                        color: bathrooms === b ? "white" : "#585858",
                        borderColor: bathrooms === b ? "#006AFF" : "#e0e0e0",
                      }}
                    >
                      {b ? `${b}+` : "Any"}
                    </button>
                  ))}
                </div>
              </div>
              <Button size="sm" className="w-full text-white" style={{ background: "#006AFF" }} onClick={applyFilters}>
                Apply
              </Button>
            </div>
          </FilterDropdown>

          {/* Property Type */}
          <FilterDropdown
            label={propertyTypes.length ? `${propertyTypes.length} Types` : "Property Type"}
            isOpen={openFilter === "property_type"}
            onToggle={() => setOpenFilter(openFilter === "property_type" ? null : "property_type")}
            hasActive={propertyTypes.length > 0}
          >
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {PROPERTY_TYPES.map((pt) => (
                <div key={pt.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`map-pt-${pt.value}`}
                    checked={propertyTypes.includes(pt.value)}
                    onCheckedChange={() => togglePropertyType(pt.value)}
                  />
                  <Label htmlFor={`map-pt-${pt.value}`} className="text-sm font-normal cursor-pointer">
                    {pt.icon} {pt.label}
                  </Label>
                </div>
              ))}
            </div>
            <Button size="sm" className="mt-3 w-full text-white" style={{ background: "#006AFF" }} onClick={applyFilters}>
              Apply
            </Button>
          </FilterDropdown>

          {/* Clear all */}
          {(listingType || priceMin || priceMax || bedrooms || bathrooms || propertyTypes.length > 0) && (
            <button
              onClick={() => {
                setListingType(""); setPriceMin(""); setPriceMax(""); setBedrooms(""); setBathrooms(""); setPropertyTypes([]);
                router.push("/search/map");
              }}
              className="flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium transition-colors hover:bg-red-50"
              style={{ color: "#E65C5C" }}
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        <button
          className="ml-auto whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-blue-50"
          style={{ color: "#006AFF" }}
        >
          Save Search
        </button>
      </div>

      {/* Main split — Map LEFT, Listings RIGHT */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="relative flex-1">
          <MapView
            listings={listings}
            selectedId={hoveredId || selectedId}
            onSelect={scrollToListing}
          />
          <div
            className="absolute left-3 top-3 z-[400] rounded-lg px-3 py-1.5 text-xs font-semibold shadow-md"
            style={{ background: "#2A2A33", color: "#ffffff" }}
          >
            {listings.length} results
          </div>
        </div>

        {/* Listings */}
        <div className="w-[520px] flex-shrink-0 overflow-y-auto border-l" style={{ borderColor: "#e0e0e0" }}>
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3" style={{ borderColor: "#e0e0e0" }}>
            <div>
              <h2 className="text-sm font-bold" style={{ color: "#2A2A33" }}>
                Real Estate &amp; Homes in {location}
              </h2>
              <p className="text-xs" style={{ color: "#869099" }}>{listings.length} results</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                id={`listing-${listing.id}`}
                onMouseEnter={() => setHoveredId(listing.id)}
                onMouseLeave={() => setHoveredId(undefined)}
                className="transition-shadow"
                style={{
                  borderRadius: "12px",
                  boxShadow: (hoveredId === listing.id || selectedId === listing.id)
                    ? "0 0 0 2px #006AFF" : "none",
                }}
              >
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>

          {listings.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-sm" style={{ color: "#869099" }}>No properties match your filters</p>
              <button
                onClick={() => {
                  setListingType(""); setPriceMin(""); setPriceMax(""); setBedrooms(""); setBathrooms(""); setPropertyTypes([]);
                }}
                className="mt-2 text-xs font-medium" style={{ color: "#006AFF" }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
