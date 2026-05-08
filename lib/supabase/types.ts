export type ListingStatus = "draft" | "active" | "pending_review" | "sold" | "expired" | "rejected";
export type ListingType = "sale" | "rent" | "lease" | "pg_coliving" | "auction";
export type PropertyType =
  | "apartment" | "house" | "villa" | "plot"
  | "commercial_shop" | "commercial_office" | "warehouse"
  | "farmland" | "business";
export type FurnishingType = "unfurnished" | "semi_furnished" | "fully_furnished";
export type ParkingType = "none" | "covered" | "open" | "both";
export type FacingType = "North" | "South" | "East" | "West" | "NE" | "NW" | "SE" | "SW";
export type UserRole = "individual" | "agent" | "builder" | "business_owner";
export type MediaType = "photo" | "video" | "floor_plan" | "tour_360";
export type PgGender = "male" | "female" | "any";
export type PgOccupancy = "single" | "double" | "triple";

export interface User {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  email: string;
  avatar_url: string | null;
  is_verified: boolean;
  company_name: string | null;
  rera_number: string | null;
  created_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  status: ListingStatus;
  listing_type: ListingType;
  property_type: PropertyType;
  title: string;
  description: string;
  price: number;
  price_negotiable: boolean;
  rent_deposit: number | null;
  maintenance_monthly: number | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  locality: string;
  latitude: number;
  longitude: number;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number;
  carpet_area_sqft: number | null;
  floor_number: number | null;
  total_floors: number | null;
  facing: FacingType | null;
  age_years: number | null;
  furnishing: FurnishingType | null;
  parking: ParkingType | null;
  amenities: string[];
  pg_gender: PgGender | null;
  pg_meals_included: boolean | null;
  pg_occupancy: PgOccupancy | null;
  auction_start: string | null;
  auction_end: string | null;
  auction_base_price: number | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  // Joined
  user?: User;
  media?: ListingMedia[];
  business_details?: BusinessDetails;
}

export interface BusinessDetails {
  listing_id: string;
  business_type: string;
  annual_revenue: number | null;
  employee_count: number | null;
  years_in_operation: number | null;
  reason_for_selling: string | null;
  assets_included: string | null;
  lease_details: string | null;
}

export interface ListingMedia {
  id: string;
  listing_id: string;
  type: MediaType;
  url: string;
  display_order: number;
  is_cover: boolean;
}

export interface Favorite {
  user_id: string;
  listing_id: string;
  created_at: string;
}
