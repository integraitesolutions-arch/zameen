"use server";

import { createClient } from "./server";
import { redirect } from "next/navigation";

// ============== LISTINGS ==============

export async function createListing(formData: {
  listing_type: string;
  property_type: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  locality: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqft: number;
  carpet_area_sqft?: number;
  floor_number?: number;
  total_floors?: number;
  facing?: string;
  age_years?: number;
  furnishing?: string;
  parking?: string;
  amenities: string[];
  pg_gender?: string;
  pg_meals_included?: boolean;
  pg_occupancy?: string;
  price: number;
  price_negotiable: boolean;
  rent_deposit?: number;
  maintenance_monthly?: number;
  auction_base_price?: number;
  // Business
  business_type?: string;
  annual_revenue?: number;
  employee_count?: number;
  years_in_operation?: number;
  reason_for_selling?: string;
  assets_included?: string;
  lease_details?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const {
    business_type, annual_revenue, employee_count, years_in_operation,
    reason_for_selling, assets_included, lease_details,
    ...listingData
  } = formData;

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      ...listingData,
      user_id: user.id,
      status: "active", // auto-approve for MVP
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Insert business details if applicable
  if (formData.property_type === "business" && listing) {
    await supabase.from("business_details").insert({
      listing_id: listing.id,
      business_type: business_type || "",
      annual_revenue,
      employee_count,
      years_in_operation,
      reason_for_selling,
      assets_included,
      lease_details,
    });
  }

  return { data: listing };
}

export async function updateListing(id: string, updates: Record<string, unknown>) {
  const supabase = await createClient();
  const { error } = await supabase.from("listings").update(updates).eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteListing(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

// ============== MEDIA ==============

export async function uploadListingMedia(listingId: string, file: File, type: string, isCover: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const bucket = type === "photo" ? "listing-photos"
    : type === "video" ? "listing-videos"
    : type === "floor_plan" ? "listing-floorplans"
    : "listing-360";

  const ext = file.name.split(".").pop();
  const path = `${user.id}/${listingId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file);

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);

  const { data: media, error: insertError } = await supabase
    .from("listing_media")
    .insert({
      listing_id: listingId,
      type,
      url: publicUrl,
      is_cover: isCover,
      display_order: 0,
    })
    .select()
    .single();

  if (insertError) return { error: insertError.message };
  return { data: media };
}

// ============== FAVORITES ==============

export async function toggleFavorite(listingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select()
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .single();

  if (existing) {
    await supabase.from("favorites").delete()
      .eq("user_id", user.id)
      .eq("listing_id", listingId);
    return { favorited: false };
  } else {
    await supabase.from("favorites").insert({
      user_id: user.id,
      listing_id: listingId,
    });
    return { favorited: true };
  }
}

export async function getFavorites() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("favorites")
    .select("listing_id, listings(*,  user:users(*), media:listing_media(*))")
    .eq("user_id", user.id);

  return data?.map((f: Record<string, unknown>) => f.listings) || [];
}

// ============== QUERIES ==============

export async function getListings(params: {
  q?: string;
  city?: string;
  listing_type?: string;
  property_type?: string;
  price_min?: string;
  price_max?: string;
  bedrooms?: string;
  sort?: string;
  limit?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select("*, user:users(*), media:listing_media(*)")
    .eq("status", "active");

  if (params.listing_type) {
    query = query.eq("listing_type", params.listing_type);
  }
  if (params.property_type) {
    const types = params.property_type.split(",");
    query = query.in("property_type", types);
  }
  if (params.city) {
    query = query.ilike("city", `%${params.city}%`);
  }
  if (params.q) {
    query = query.textSearch("fts", params.q, { type: "websearch" });
  }
  if (params.price_min) {
    query = query.gte("price", parseInt(params.price_min));
  }
  if (params.price_max) {
    query = query.lte("price", parseInt(params.price_max));
  }
  if (params.bedrooms) {
    const beds = params.bedrooms.replace("+", "");
    query = query.gte("bedrooms", parseInt(beds));
  }

  // Sort
  if (params.sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (params.sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else if (params.sort === "area_desc") {
    query = query.order("area_sqft", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

export async function getListing(id: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("listings")
    .select("*, user:users(*), media:listing_media(*), business_details(*)")
    .eq("id", id)
    .single();

  return data;
}

export async function getMyListings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("listings")
    .select("*, media:listing_media(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function getFeaturedListings() {
  return getListings({ limit: 8, sort: "newest" });
}
