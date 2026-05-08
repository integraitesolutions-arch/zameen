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

  let listings = await getListings({
    q: query || undefined,
    city: city || undefined,
    listing_type: params.listing_type,
    property_type: params.property_type,
    price_min: params.price_min,
    price_max: params.price_max,
    bedrooms: params.bedrooms,
    sort: params.sort || "newest",
  });

  if (listings.length === 0) {
    listings = [...MOCK_LISTINGS];
    if (params.listing_type) {
      listings = listings.filter((l) => l.listing_type === params.listing_type);
    }
    if (params.property_type) {
      const types = params.property_type.split(",");
      listings = listings.filter((l) => types.includes(l.property_type));
    }
  }

  return <MapSearchPage listings={listings} query={query} location={location} />;
}
