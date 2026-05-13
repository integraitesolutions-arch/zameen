import { SearchBar } from "@/components/search/search-bar";
import { ListingCard } from "@/components/listing/listing-card";
import { MOCK_LISTINGS, CITY_IMAGES } from "@/lib/mock-data";
import { Suspense } from "react";
import Link from "next/link";
import { Shield, Search, IndianRupee, ArrowRight, CheckCircle, Star } from "lucide-react";
import { getFeaturedListings } from "@/lib/supabase/actions";

const TOP_CITIES = [
  { name: "Mumbai", tagline: "City of Dreams" },
  { name: "Delhi", tagline: "Capital Territory" },
  { name: "Bangalore", tagline: "Silicon Valley" },
  { name: "Hyderabad", tagline: "Pearl City" },
  { name: "Chennai", tagline: "Gateway to South" },
  { name: "Pune", tagline: "Oxford of the East" },
];

const PROMISES = [
  { icon: Shield, title: "100% Verified Listings", description: "Every property is inspected and verified by our team. RERA-compliant agents only." },
  { icon: Search, title: "Local Neighbourhood Experts", description: "Get insights from agents who know every street, school, and market in your area." },
  { icon: IndianRupee, title: "Transparent Pricing", description: "No hidden charges. See real prices, maintenance costs, and complete deal breakdowns." },
];

export default async function HomePage() {
  let featuredListings = await getFeaturedListings();
  // Always show 8 listings — real DB first, fill with mock data
  const dbIds = new Set(featuredListings.map((l) => l.id));
  const mockFill = MOCK_LISTINGS.filter((l) => !dbIds.has(l.id));
  featuredListings = [...featuredListings, ...mockFill].slice(0, 8);

  return (
    <div>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden px-4 pb-10 pt-8 md:pb-20 md:pt-16" style={{ background: "linear-gradient(180deg, #f8f9fa 0%, #e8f0fe 100%)" }}>
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #1a73e8 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="relative mx-auto max-w-[1280px]">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading text-2xl font-semibold leading-tight md:text-5xl" style={{ color: "#202124" }}>
              Discover a place you&apos;ll love to live
            </h1>
            <p className="mt-2 text-sm md:text-base" style={{ color: "#414754" }}>
              India&apos;s most trusted platform for buying, renting, and selling properties
            </p>
          </div>

          {/* Segmented Search Bar — BharatAbode style */}
          <div className="mx-auto mt-6 max-w-3xl">
            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto rounded-t-xl bg-white px-2 pt-2" style={{ borderTop: "1px solid #e8eaed", borderLeft: "1px solid #e8eaed", borderRight: "1px solid #e8eaed" }}>
              {["Buy", "Rent", "PG", "Commercial", "Land"].map((tab, i) => (
                <Link
                  key={tab}
                  href={`/search?listing_type=${tab === "Buy" ? "sale" : tab === "Rent" ? "rent" : tab === "PG" ? "pg_coliving" : tab === "Commercial" ? "sale" : "sale"}&property_type=${tab === "Commercial" ? "commercial_shop,commercial_office" : tab === "Land" ? "plot,farmland" : ""}`}
                  className="rounded-t-lg px-5 py-2.5 text-sm font-semibold transition-colors"
                  style={{
                    background: i === 0 ? "#1a73e8" : "transparent",
                    color: i === 0 ? "#ffffff" : "#414754",
                  }}
                >
                  {tab}
                </Link>
              ))}
            </div>
            {/* Search inputs */}
            <div className="flex items-center gap-0 rounded-b-xl bg-white p-2 shadow-lg" style={{ border: "1px solid #e8eaed" }}>
              <div className="flex-1">
                <Suspense>
                  <SearchBar large />
                </Suspense>
              </div>
              <Link href="/search">
                <button className="ml-2 flex h-11 items-center gap-2 rounded-lg px-6 text-sm font-semibold text-white" style={{ background: "linear-gradient(180deg, #4285f4, #1a73e8)" }}>
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== VERIFIED LISTINGS ===================== */}
      <section className="mx-auto max-w-[1280px] px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h2 className="font-heading text-xl font-semibold" style={{ color: "#202124" }}>
                Verified Listings
              </h2>
              <span className="badge-verified"><CheckCircle className="h-3 w-3" /> RERA Approved</span>
            </div>
            <p className="text-sm" style={{ color: "#727785" }}>Handpicked and verified properties across India</p>
          </div>
          <Link href="/search" className="flex items-center gap-1 text-sm font-semibold" style={{ color: "#1a73e8" }}>
            See All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredListings.slice(0, 8).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* ===================== POPULAR LOCALITIES ===================== */}
      <section className="py-12" style={{ background: "#f4f3f7" }}>
        <div className="mx-auto max-w-[1280px] px-6">
          <h2 className="mb-6 font-heading text-xl font-semibold" style={{ color: "#202124" }}>
            Popular Localities in India
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {TOP_CITIES.map((city) => (
              <Link
                key={city.name}
                href={`/search?city=${city.name}`}
                className="card-elevation group overflow-hidden rounded-lg bg-white"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={CITY_IMAGES[city.name as keyof typeof CITY_IMAGES]}
                    alt={city.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)" }} />
                  <div className="absolute bottom-0 left-0 p-3">
                    <h3 className="font-heading text-sm font-semibold text-white">{city.name}</h3>
                    <p className="text-[10px] text-white/70">{city.tagline}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== THE ZAMEEN PROMISE ===================== */}
      <section className="py-14">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-xl font-semibold" style={{ color: "#202124" }}>
              The Zameen Promise
            </h2>
            <p className="mt-2 text-sm" style={{ color: "#727785" }}>
              We&apos;re redefining the Indian home buying experience, one listing at a time
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {PROMISES.map((p) => (
              <div key={p.title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "#e8f0fe" }}>
                  <p.icon className="h-6 w-6" style={{ color: "#1a73e8" }} />
                </div>
                <h3 className="mb-2 font-heading text-base font-semibold" style={{ color: "#202124" }}>
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#727785" }}>
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
