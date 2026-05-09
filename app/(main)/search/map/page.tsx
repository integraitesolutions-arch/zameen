import { getListings } from "@/lib/supabase/actions";
import { MOCK_LISTINGS } from "@/lib/mock-data";
import { MapSearchPage } from "@/components/search/map-search-page";

export const metadata = {
  title: "Map Search",
};

export default async function MapSearchPageRoute({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const city = params.city || "";
  const location = query || city || "India";

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

  let mockFiltered = [...MOCK_LISTINGS];
  if (params.listing_type) mockFiltered = mockFiltered.filter((l) => l.listing_type === params.listing_type);
  if (params.property_type) {
    const types = params.property_type.split(",");
    mockFiltered = mockFiltered.filter((l) => types.includes(l.property_type));
  }

  const dbIds = new Set(dbListings.map((l) => l.id));
  const listings = [...dbListings, ...mockFiltered.filter((l) => !dbIds.has(l.id))];

  return <MapSearchPage listings={listings} query={query} location={location} />;
}
