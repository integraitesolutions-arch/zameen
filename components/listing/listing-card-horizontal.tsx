"use client";

import Link from "next/link";
import { Heart, MapPin, BedDouble, Bath, Maximize, Phone, MessageCircle, CheckCircle, Users, Camera } from "lucide-react";
import { formatPrice, formatArea } from "@/lib/constants";
import type { Listing } from "@/lib/supabase/types";

interface Props {
  listing: Listing;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

export function ListingCardHorizontal({ listing, onFavorite, isFavorited }: Props) {
  const coverImage = listing.media?.find((m) => m.is_cover)?.url || listing.media?.[0]?.url;
  const photoCount = listing.media?.filter((m) => m.type === "photo").length || 0;
  const isVerified = listing.user?.is_verified;
  const pricePerSqft = listing.area_sqft > 0 ? Math.round(listing.price / listing.area_sqft) : null;
  const contactCount = Math.floor(Math.random() * 12) + 2;
  const roleLabel = listing.user?.role === "agent" ? "Agent" : listing.user?.role === "builder" ? "Builder" : "Owner";

  return (
    <div className="card-elevation overflow-hidden rounded-lg bg-white" style={{ border: "1px solid #e8eaed", maxWidth: "100%" }}>
      {/* Horizontal on desktop, vertical on mobile */}
      <div className="flex flex-col md:flex-row overflow-hidden">
        {/* Image */}
        <Link href={`/listing/${listing.id}`} className="relative w-full md:w-[280px] flex-shrink-0 overflow-hidden">
          {coverImage ? (
            <img src={coverImage} alt={listing.title} className="h-48 w-full md:h-full object-cover transition-transform duration-500 hover:scale-105" style={{ minHeight: "200px" }} />
          ) : (
            <div className="flex h-48 md:h-full min-h-[200px] w-full items-center justify-center" style={{ background: "#f4f3f7" }}>
              <span className="text-4xl opacity-30">🏠</span>
            </div>
          )}

          {/* Price overlay */}
          <div className="absolute left-3 top-3 rounded-md px-2.5 py-1 text-sm font-bold text-white" style={{ background: "rgba(26, 115, 232, 0.9)" }}>
            {formatPrice(listing.price)}
          </div>

          {/* Photo count */}
          {photoCount > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
              <Camera className="h-3 w-3" /> +{photoCount}
            </div>
          )}

          {/* Favorite */}
          <button
            onClick={(e) => { e.preventDefault(); onFavorite?.(listing.id); }}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm hover:scale-110 transition-all"
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
          </button>

          {/* Social proof */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">
            <Users className="h-3 w-3" style={{ color: "#fbbc04" }} /> {contactCount} contacted this week
          </div>
        </Link>

        {/* Details */}
        <div className="flex flex-1 flex-col justify-between p-3 md:p-4 overflow-hidden">
          <div>
            {/* Badges */}
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              {isVerified && <span className="badge-verified"><CheckCircle className="h-3 w-3" /> VERIFIED</span>}
              <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase" style={{ background: "#e8f0fe", color: "#1a73e8" }}>
                {listing.listing_type === "sale" ? "RESALE" : listing.listing_type === "rent" ? "FOR RENT" : listing.listing_type === "pg_coliving" ? "PG" : listing.listing_type === "lease" ? "LEASE" : listing.listing_type.toUpperCase()}
              </span>
            </div>

            {/* Title */}
            <Link href={`/listing/${listing.id}`}>
              <h3 className="font-heading text-base font-semibold hover:text-[#1a73e8] transition-colors" style={{ color: "#202124" }}>
                {listing.title}
              </h3>
            </Link>

            <p className="mt-0.5 flex items-center gap-1 text-sm" style={{ color: "#727785" }}>
              <MapPin className="h-3.5 w-3.5" /> {listing.locality}, {listing.city}
            </p>

            {/* Price + Specs */}
            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-lg md:text-xl font-bold" style={{ color: "#202124" }}>
                  {formatPrice(listing.price)}
                </span>
                {listing.listing_type === "rent" && <span className="text-xs" style={{ color: "#727785" }}>/month</span>}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs" style={{ color: "#414754" }}>
                {pricePerSqft && <span style={{ color: "#727785" }}>₹{pricePerSqft.toLocaleString("en-IN")}/sqft</span>}
                {listing.area_sqft > 0 && <span className="font-semibold">{formatArea(listing.area_sqft)}</span>}
                {listing.carpet_area_sqft && <span style={{ color: "#727785" }}>({formatArea(listing.carpet_area_sqft)} carpet)</span>}
                {listing.bedrooms && <span className="font-semibold">{listing.bedrooms} BHK</span>}
                {listing.bathrooms && <span style={{ color: "#727785" }}>({listing.bathrooms} Baths)</span>}
              </div>
            </div>

            {/* Amenity chips */}
            <div className="mt-2 flex flex-wrap gap-1">
              {listing.facing && <span className="amenity-chip text-[10px]">{listing.facing} Facing</span>}
              {listing.parking && listing.parking !== "none" && <span className="amenity-chip text-[10px]">Parking</span>}
              {listing.amenities?.slice(0, 3).map((a) => <span key={a} className="amenity-chip text-[10px]">{a}</span>)}
            </div>
          </div>

          {/* Bottom: Agent + Contact */}
          <div className="mt-3 border-t pt-3" style={{ borderColor: "#e8eaed" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white flex-shrink-0" style={{ background: "#1a73e8" }}>
                {listing.user?.full_name?.charAt(0) || "?"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "#202124" }}>{listing.user?.full_name}</p>
                <p className="text-[10px]" style={{ color: "#727785" }}>{roleLabel}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold" style={{ background: "#25d366", color: "#ffffff" }}>
                <MessageCircle className="h-3 w-3" /> WhatsApp
              </button>
              <button className="flex flex-1 items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-[11px] font-semibold" style={{ borderColor: "#1a73e8", color: "#1a73e8" }}>
                <Phone className="h-3 w-3" /> View Number
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
