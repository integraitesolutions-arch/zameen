"use client";

import Link from "next/link";
import { Heart, MapPin, BedDouble, Maximize, CheckCircle } from "lucide-react";
import { formatPrice, formatArea } from "@/lib/constants";
import type { Listing } from "@/lib/supabase/types";

interface ListingCardProps {
  listing: Listing;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

const PROPERTY_ICONS: Record<string, string> = {
  apartment: "🏢", house: "🏠", villa: "🏡", plot: "📐", farmland: "🌾",
  business: "💼", commercial_shop: "🏪", commercial_office: "🏬", warehouse: "🏭",
};

export function ListingCard({ listing, onFavorite, isFavorited }: ListingCardProps) {
  const coverImage = listing.media?.find((m) => m.is_cover)?.url || listing.media?.[0]?.url;
  const isVerified = listing.user?.is_verified;

  return (
    <Link href={`/listing/${listing.id}`} className="group block">
      <div className="card-elevation overflow-hidden rounded-lg bg-white">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-t-lg">
          {coverImage ? (
            <img
              src={coverImage}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center" style={{ background: "#f4f3f7" }}>
              <span className="text-4xl opacity-30">{PROPERTY_ICONS[listing.property_type] || "🏠"}</span>
            </div>
          )}

          {/* Price badge */}
          <div className="absolute left-3 top-3 rounded-md px-2.5 py-1 text-sm font-bold text-white" style={{ background: "rgba(26, 115, 232, 0.9)" }}>
            {formatPrice(listing.price)}
            {listing.listing_type === "rent" && <span className="text-xs font-normal opacity-80">/mo</span>}
          </div>

          {/* Favorite */}
          <button
            onClick={(e) => { e.preventDefault(); onFavorite?.(listing.id); }}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-all hover:scale-110"
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5">
          {/* Verified + status badges */}
          <div className="mb-1.5 flex items-center gap-1.5">
            {isVerified && (
              <span className="badge-verified"><CheckCircle className="h-3 w-3" /> Verified</span>
            )}
            <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase" style={{ background: "#e8f0fe", color: "#1a73e8" }}>
              {listing.listing_type === "pg_coliving" ? "PG" : listing.listing_type === "sale" ? "For Sale" : listing.listing_type === "rent" ? "For Rent" : listing.listing_type}
            </span>
          </div>

          <h3 className="mb-1 truncate font-heading text-sm font-semibold transition-colors group-hover:text-[#1a73e8]" style={{ color: "#202124" }}>
            {listing.title}
          </h3>

          <p className="mb-2 flex items-center gap-1 text-xs" style={{ color: "#727785" }}>
            <MapPin className="h-3 w-3" />
            {listing.locality}{listing.locality && listing.city ? ", " : ""}{listing.city}
          </p>

          {/* Details row */}
          <div className="flex items-center gap-3 text-xs" style={{ color: "#414754" }}>
            {listing.bedrooms && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" style={{ color: "#727785" }} /> {listing.bedrooms} BHK
              </span>
            )}
            {listing.area_sqft > 0 && (
              <span className="flex items-center gap-1">
                <Maximize className="h-3.5 w-3.5" style={{ color: "#727785" }} /> {formatArea(listing.area_sqft)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
