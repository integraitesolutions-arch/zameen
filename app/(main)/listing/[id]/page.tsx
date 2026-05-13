import { MOCK_LISTINGS } from "@/lib/mock-data";
import { getListing, getListings } from "@/lib/supabase/actions";
import { ListingGallery } from "@/components/listing/listing-gallery";
import { ContactSeller } from "@/components/listing/contact-seller";
import { ListingCard } from "@/components/listing/listing-card";
import { EMICalculator } from "@/components/listing/emi-calculator";
import { NearbyAmenities } from "@/components/listing/nearby-amenities";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatArea } from "@/lib/constants";
import {
  MapPin, BedDouble, Bath, Maximize, Layers, Compass, Calendar,
  Armchair, Car, Check, Building2, Users, IndianRupee, Clock,
  FileText, Package, Phone,
} from "lucide-react";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Try real DB, fall back to mock
  let listing = await getListing(id);
  if (!listing) {
    listing = MOCK_LISTINGS.find((l) => l.id === id) || MOCK_LISTINGS[0];
  }
  let similar = await getListings({ limit: 4 });
  if (similar.length === 0) {
    similar = MOCK_LISTINGS.filter((l) => l.id !== listing.id).slice(0, 4);
  } else {
    similar = similar.filter((l: { id: string }) => l.id !== listing.id).slice(0, 4);
  }

  const details = [
    listing.bedrooms != null && { icon: BedDouble, label: "Bedrooms", value: listing.bedrooms },
    listing.bathrooms != null && { icon: Bath, label: "Bathrooms", value: listing.bathrooms },
    listing.area_sqft > 0 && { icon: Maximize, label: "Super Area", value: formatArea(listing.area_sqft) },
    listing.carpet_area_sqft && { icon: Maximize, label: "Carpet Area", value: formatArea(listing.carpet_area_sqft) },
    listing.floor_number != null && { icon: Layers, label: "Floor", value: `${listing.floor_number} of ${listing.total_floors}` },
    listing.facing && { icon: Compass, label: "Facing", value: listing.facing },
    listing.age_years != null && { icon: Calendar, label: "Property Age", value: `${listing.age_years} years` },
    listing.furnishing && { icon: Armchair, label: "Furnishing", value: listing.furnishing.replace("_", " ") },
    listing.parking && listing.parking !== "none" && { icon: Car, label: "Parking", value: listing.parking },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string | number }[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Gallery */}
      <ListingGallery media={listing.media || []} title={listing.title} />

      {/* Content */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main Content */}
        <div>
          {/* Header */}
          <div className="mb-6">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className="bg-blue-100 text-blue-700 capitalize">
                {listing.listing_type === "pg_coliving" ? "Paying Guest / Co-living" : listing.listing_type}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {listing.property_type.replace("_", " ")}
              </Badge>
              {listing.price_negotiable && (
                <Badge variant="secondary">Negotiable</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{listing.title}</h1>
            <p className="mt-1 flex items-center gap-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              {listing.address}, {listing.locality}, {listing.city}, {listing.state} — {listing.pincode}
            </p>
            <p className="mt-3 text-3xl font-bold text-blue-600">
              {formatPrice(listing.price)}
              {listing.listing_type === "rent" || listing.listing_type === "pg_coliving" ? (
                <span className="text-base font-normal text-gray-500"> /month</span>
              ) : null}
            </p>
            {listing.rent_deposit && (
              <p className="text-sm text-gray-500">Deposit: {formatPrice(listing.rent_deposit)}</p>
            )}
            {listing.maintenance_monthly && (
              <p className="text-sm text-gray-500">
                Maintenance: {formatPrice(listing.maintenance_monthly)}/month
              </p>
            )}
          </div>

          <Separator className="mb-6" />

          {/* Key Details Grid */}
          {details.length > 0 && (
            <>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Property Details</h2>
              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {details.map((detail) => (
                  <div key={detail.label} className="flex items-center gap-3 rounded-lg border p-3">
                    <detail.icon className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">{detail.label}</p>
                      <p className="text-sm font-medium capitalize text-gray-900">{detail.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="mb-6" />
            </>
          )}

          {/* PG Details */}
          {listing.listing_type === "pg_coliving" && (
            <>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">PG Details</h2>
              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                {listing.pg_gender && (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Available For</p>
                      <p className="text-sm font-medium capitalize">{listing.pg_gender === "any" ? "Boys & Girls" : listing.pg_gender === "male" ? "Boys" : "Girls"}</p>
                    </div>
                  </div>
                )}
                {listing.pg_occupancy && (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <BedDouble className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Occupancy</p>
                      <p className="text-sm font-medium capitalize">{listing.pg_occupancy}</p>
                    </div>
                  </div>
                )}
                {listing.pg_meals_included != null && (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <Package className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Meals</p>
                      <p className="text-sm font-medium">{listing.pg_meals_included ? "Included" : "Not Included"}</p>
                    </div>
                  </div>
                )}
              </div>
              <Separator className="mb-6" />
            </>
          )}

          {/* Description */}
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Description</h2>
          <p className="mb-6 whitespace-pre-line text-gray-700 leading-relaxed">
            {listing.description}
          </p>

          <Separator className="mb-6" />

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Amenities</h2>
              <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-3">
                {listing.amenities.map((amenity: string) => (
                  <div key={amenity} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-green-500" />
                    {amenity}
                  </div>
                ))}
              </div>
              <Separator className="mb-6" />
            </>
          )}

          {/* Business Details */}
          {listing.property_type === "business" && listing.business_details && (
            <>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Business Details</h2>
              <div className="mb-6 space-y-3">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {listing.business_details.business_type && (
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Building2 className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500">Business Type</p>
                        <p className="text-sm font-medium">{listing.business_details.business_type}</p>
                      </div>
                    </div>
                  )}
                  {listing.business_details.annual_revenue && (
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <IndianRupee className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500">Annual Revenue</p>
                        <p className="text-sm font-medium">{formatPrice(listing.business_details.annual_revenue)}</p>
                      </div>
                    </div>
                  )}
                  {listing.business_details.employee_count && (
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Users className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500">Employees</p>
                        <p className="text-sm font-medium">{listing.business_details.employee_count}</p>
                      </div>
                    </div>
                  )}
                  {listing.business_details.years_in_operation && (
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500">Years Operating</p>
                        <p className="text-sm font-medium">{listing.business_details.years_in_operation}</p>
                      </div>
                    </div>
                  )}
                </div>
                {listing.business_details.reason_for_selling && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-gray-500">Reason for Selling</p>
                    <p className="text-sm text-gray-700">{listing.business_details.reason_for_selling}</p>
                  </div>
                )}
                {listing.business_details.assets_included && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-gray-500">Assets Included</p>
                    <p className="text-sm text-gray-700">{listing.business_details.assets_included}</p>
                  </div>
                )}
                {listing.business_details.lease_details && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-gray-500">Lease Details</p>
                    <p className="text-sm text-gray-700">{listing.business_details.lease_details}</p>
                  </div>
                )}
              </div>
              <Separator className="mb-6" />
            </>
          )}

          {/* EMI Calculator */}
          {listing.listing_type === "sale" && listing.price > 100000 && (
            <>
              <EMICalculator propertyPrice={listing.price} />
              <Separator className="my-6" />
            </>
          )}

          {/* Nearby Amenities */}
          <NearbyAmenities locality={listing.locality} city={listing.city} />
          <Separator className="my-6" />

          {/* Similar Properties */}
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Similar Properties</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          {listing.user && <ContactSeller seller={listing.user} listingId={listing.id} />}
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white p-3 lg:hidden" style={{ borderTop: "1px solid #e8eaed", boxShadow: "0 -2px 10px rgba(0,0,0,0.05)" }}>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="font-heading text-lg font-bold" style={{ color: "#202124" }}>{formatPrice(listing.price)}</p>
            {listing.listing_type === "rent" && <p className="text-[10px]" style={{ color: "#727785" }}>per month</p>}
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold text-white" style={{ background: "#25d366" }}>
              <Phone className="h-3.5 w-3.5" /> WhatsApp
            </button>
            <button className="flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold text-white" style={{ background: "#1a73e8" }}>
              <Phone className="h-3.5 w-3.5" /> Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
