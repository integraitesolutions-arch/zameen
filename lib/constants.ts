export const LISTING_TYPES = [
  { value: "sale", label: "Buy" },
  { value: "rent", label: "Rent" },
  { value: "lease", label: "Lease" },
  { value: "pg_coliving", label: "Paying Guest / Co-living" },
  { value: "auction", label: "Auction" },
] as const;

export const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment", icon: "🏢" },
  { value: "house", label: "House", icon: "🏠" },
  { value: "villa", label: "Villa", icon: "🏡" },
  { value: "plot", label: "Plot / Land", icon: "📐" },
  { value: "commercial_shop", label: "Shop", icon: "🏪" },
  { value: "commercial_office", label: "Office", icon: "🏬" },
  { value: "warehouse", label: "Warehouse", icon: "🏭" },
  { value: "farmland", label: "Farmland", icon: "🌾" },
  { value: "business", label: "Business", icon: "💼" },
] as const;

export const FURNISHING_OPTIONS = [
  { value: "unfurnished", label: "Unfurnished" },
  { value: "semi_furnished", label: "Semi-Furnished" },
  { value: "fully_furnished", label: "Fully Furnished" },
] as const;

export const FACING_OPTIONS = [
  "North", "South", "East", "West", "NE", "NW", "SE", "SW",
] as const;

export const PARKING_OPTIONS = [
  { value: "none", label: "No Parking" },
  { value: "covered", label: "Covered" },
  { value: "open", label: "Open" },
  { value: "both", label: "Covered + Open" },
] as const;

export const AMENITIES = [
  "Gym", "Swimming Pool", "Garden", "Lift", "Security", "Power Backup",
  "Water Supply", "Club House", "Children's Play Area", "Car Parking",
  "Visitor Parking", "Rain Water Harvesting", "Intercom", "Gas Pipeline",
  "Fire Safety", "CCTV", "Waste Management", "EV Charging", "Jogging Track",
  "Indoor Games", "Badminton Court", "Tennis Court", "Basketball Court",
] as const;

export const PG_GENDER_OPTIONS = [
  { value: "male", label: "Boys" },
  { value: "female", label: "Girls" },
  { value: "any", label: "Any" },
] as const;

export const PG_OCCUPANCY_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "triple", label: "Triple" },
] as const;

export const USER_ROLES = [
  { value: "individual", label: "Individual / Owner" },
  { value: "agent", label: "Agent / Broker" },
  { value: "builder", label: "Builder / Developer" },
  { value: "business_owner", label: "Business Owner" },
] as const;

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh", "Puducherry", "Jammu and Kashmir", "Ladakh",
] as const;

export function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  }
  if (price >= 1000) {
    return `₹${(price / 1000).toFixed(1)}K`;
  }
  return `₹${price}`;
}

export function formatArea(sqft: number): string {
  return `${sqft.toLocaleString("en-IN")} sq.ft`;
}

export type ListingType = (typeof LISTING_TYPES)[number]["value"];
export type PropertyType = (typeof PROPERTY_TYPES)[number]["value"];
export type FurnishingType = (typeof FURNISHING_OPTIONS)[number]["value"];
export type ParkingType = (typeof PARKING_OPTIONS)[number]["value"];
export type UserRole = (typeof USER_ROLES)[number]["value"];
