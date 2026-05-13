import { Suspense } from "react";
import { SearchBar } from "@/components/search/search-bar";
import { FilterPanel } from "@/components/search/filter-panel";
import { FilterChips } from "@/components/search/filter-chips";
import { SortBar } from "@/components/search/sort-bar";
import { ListingCardHorizontal } from "@/components/listing/listing-card-horizontal";
import { ListingCard } from "@/components/listing/listing-card";
import { getListings } from "@/lib/supabase/actions";
import { MOCK_LISTINGS } from "@/lib/mock-data";
import { Search } from "lucide-react";

export const metadata = { title: "Search Properties" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const city = params.city || "";
  const location = query || city || "India";
  const view = params.view || "list"; // list or grid

  const dbListings = await getListings({
    q: query || undefined,
    city: city || undefined,
    listing_type: params.listing_type,
    property_type: params.property_type,
    price_min: params.price_min,
    price_max: params.price_max,
    bedrooms: params.bedrooms,
    sort: params.sort || "newest",
  });

  // Merge with mock data so the site always looks populated
  let mockFiltered = [...MOCK_LISTINGS];
  if (params.listing_type) mockFiltered = mockFiltered.filter((l) => l.listing_type === params.listing_type);
  if (params.property_type) {
    const types = params.property_type.split(",");
    mockFiltered = mockFiltered.filter((l) => types.includes(l.property_type));
  }
  if (city) mockFiltered = mockFiltered.filter((l) => l.city.toLowerCase().includes(city.toLowerCase()));
  if (query) {
    const q = query.toLowerCase();
    mockFiltered = mockFiltered.filter((l) =>
      l.title.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) || l.locality.toLowerCase().includes(q)
    );
  }

  // DB listings first, then mock data (excluding duplicates)
  const dbIds = new Set(dbListings.map((l) => l.id));
  const listings = [...dbListings, ...mockFiltered.filter((l) => !dbIds.has(l.id))];

  return (
    <div className="mx-auto max-w-[1280px] overflow-x-hidden px-3 md:px-4 py-3">
      {/* Search bar */}
      <div className="mb-3 max-w-2xl">
        <Suspense><SearchBar defaultValue={query} /></Suspense>
      </div>

      {/* Breadcrumb — hidden on mobile */}
      <p className="mb-2 hidden text-xs md:block" style={{ color: "#727785" }}>
        Home &gt; Property in {location}
      </p>

      <div className="flex gap-6">
        {/* Filter sidebar — hidden on mobile, uses Sheet */}
        <Suspense><FilterPanel /></Suspense>

        {/* Results */}
        <div className="flex-1">
          {/* Results header */}
          <h1 className="mb-1 font-heading text-lg font-semibold" style={{ color: "#202124" }}>
            {listings.length} results | Property in {location}
          </h1>

          {/* Insights link */}
          <div className="mb-3 flex items-center gap-2 rounded-lg p-2.5" style={{ background: "#e8f0fe" }}>
            <span className="text-sm" style={{ color: "#414754" }}>
              Get to know more about <strong>{location}</strong>
            </span>
            <span className="text-xs font-semibold cursor-pointer" style={{ color: "#1a73e8" }}>View Insights &gt;</span>
          </div>

          {/* Filter chips */}
          <Suspense><FilterChips /></Suspense>

          {/* Sort */}
          <div className="mb-3">
            <Suspense><SortBar count={listings.length} location={location} /></Suspense>
          </div>

          {/* Listings - Horizontal (99acres style) */}
          {listings.length > 0 ? (
            <div className="space-y-4">
              {listings.map((listing) => (
                <ListingCardHorizontal key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 rounded-full p-6" style={{ background: "#f4f3f7" }}>
                <Search className="h-10 w-10" style={{ color: "#727785" }} />
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold" style={{ color: "#202124" }}>No properties found</h3>
              <p className="text-sm" style={{ color: "#727785" }}>Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
