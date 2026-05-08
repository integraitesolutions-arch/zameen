"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus, Home, Users, Eye, TrendingUp, MapPin, BedDouble, Maximize,
  ArrowRight, Sparkles, Star, ChevronRight, Heart, Phone, Search,
  Clock, Building2, CheckCircle, Landmark,
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { ListingCard } from "@/components/listing/listing-card";
import { MOCK_LISTINGS } from "@/lib/mock-data";
import type { Listing } from "@/lib/supabase/types";

// ==================== SHARED ====================

const PERFORMANCE_DATA = [
  { day: "MON", value: 45 }, { day: "TUE", value: 62 }, { day: "WED", value: 38 },
  { day: "THU", value: 71 }, { day: "FRI", value: 55 }, { day: "SAT", value: 82 }, { day: "SUN", value: 30 },
];
const maxValue = Math.max(...PERFORMANCE_DATA.map((d) => d.value));

const MOCK_LEADS = [
  { name: "Ananya Kapoor", location: "Bangalore, Karnataka", time: "2h ago", isNew: true },
  { name: "Rohan Verma", location: "Mumbai, Maharashtra", time: "5h ago", isNew: true },
  { name: "S. Malhotra", location: "Delhi NCR", time: "1d ago", isNew: false },
];

const MOCK_SEARCHES = [
  { query: "3 BHK in Wori, Mumbai", date: "May 5, 2026" },
  { query: "Budget 1-2 Cr in Bangalore", date: "May 4, 2026" },
  { query: "Rentals in Cyber City, Gurgaon", date: "May 3, 2026" },
];

const MOCK_INQUIRIES = [
  { title: "3 BHK Apartment in HSR Layout", date: "Oct 24, 2024", status: "Responded", time: "Tomorrow, 11:30 AM" },
  { title: "Modern Studio in Gurgaon", date: "Oct 20, 2024", status: "Pending Seller Review", time: "" },
];

// ==================== OWNER DASHBOARD ====================

function OwnerDashboard({ userName, listings }: { userName: string; listings: Listing[] }) {
  const stats = {
    active: listings.filter((l) => l.status === "active").length || 8,
    leads: Math.floor(Math.random() * 150) + 20,
    views: Math.floor(Math.random() * 3000) + 500,
    revenue: Math.floor(Math.random() * 2000) + 500,
  };

  const STAT_CARDS = [
    { label: "ACTIVE LISTINGS", value: stats.active, icon: Home, color: "#1a73e8", bg: "#e8f0fe" },
    { label: "TOTAL LEADS", value: stats.leads, icon: Users, color: "#34a853", bg: "#e6f4ea", badge: "170 this week" },
    { label: "PROFILE VIEWS", value: stats.views.toLocaleString(), icon: Eye, color: "#7b61ff", bg: "#f0ecff" },
    { label: "REVENUE", value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: "#fbbc04", bg: "#fef7e0", badge: "Revenue Goal" },
  ];

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold" style={{ color: "#202124" }}>Welcome back, {userName}!</h1>
          <p className="text-sm" style={{ color: "#727785" }}>Your properties are gaining traction. {stats.leads} new leads in the last 24 hours.</p>
        </div>
        <Link href="/listing/new">
          <Button className="font-semibold text-white" style={{ background: "linear-gradient(180deg, #4285f4, #1a73e8)" }}>
            <Plus className="mr-1.5 h-4 w-4" /> Post New Property
          </Button>
        </Link>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((s) => (
          <Card key={s.label} className="card-elevation">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: s.bg }}>
                  <s.icon className="h-4.5 w-4.5" style={{ color: s.color }} />
                </div>
                {s.badge && <span className="text-[10px] font-medium" style={{ color: s.color }}>{s.badge}</span>}
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#727785" }}>{s.label}</p>
              <p className="font-heading text-2xl font-bold" style={{ color: "#202124" }}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-5">
        <Card className="card-elevation lg:col-span-3">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold" style={{ color: "#202124" }}>Performance Overview</h2>
              <button className="rounded-lg border px-3 py-1 text-xs font-medium" style={{ borderColor: "#e8eaed", color: "#414754" }}>Last 7 Days</button>
            </div>
            <div className="flex items-end justify-between gap-3" style={{ height: "160px" }}>
              {PERFORMANCE_DATA.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t-md" style={{ height: `${(d.value / maxValue) * 130}px`, background: d.day === "SAT" ? "#1a73e8" : "#e8f0fe" }} />
                  <span className="text-[10px] font-medium" style={{ color: "#727785" }}>{d.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevation lg:col-span-2">
          <CardContent className="p-5">
            <h2 className="mb-4 font-heading text-base font-semibold" style={{ color: "#202124" }}>New Leads</h2>
            <div className="space-y-3">
              {MOCK_LEADS.map((lead) => (
                <div key={lead.name} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "#1a73e8" }}>{lead.name.charAt(0)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold" style={{ color: "#202124" }}>{lead.name}</p>
                      {lead.isNew && <span className="rounded px-1.5 py-0.5 text-[9px] font-bold text-white" style={{ background: "#ea4335" }}>NEW</span>}
                    </div>
                    <p className="text-xs" style={{ color: "#727785" }}><MapPin className="mr-0.5 inline h-3 w-3" />{lead.location}</p>
                  </div>
                  <span className="text-[10px]" style={{ color: "#c1c6d6" }}>{lead.time}</span>
                </div>
              ))}
            </div>
            <Link href="/messages" className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: "#1a73e8" }}>Manage All Leads <ArrowRight className="h-3 w-3" /></Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="card-elevation lg:col-span-3">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold" style={{ color: "#202124" }}>Recent Active Listings</h2>
              <Link href="/dashboard/listings" className="text-xs font-semibold" style={{ color: "#1a73e8" }}>View All</Link>
            </div>
            <div className="space-y-3">
              {(listings.length > 0 ? listings : MOCK_LISTINGS).slice(0, 4).map((l) => {
                const cover = l.media?.find((m) => m.is_cover)?.url || l.media?.[0]?.url;
                return (
                  <Link key={l.id} href={`/listing/${l.id}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50">
                    <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-md" style={{ background: "#f4f3f7" }}>
                      {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-lg text-gray-300">🏠</div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold" style={{ color: "#202124" }}>{l.title}</p>
                      <div className="flex items-center gap-3 text-xs" style={{ color: "#727785" }}>
                        <span>{l.city}</span><span>• {formatPrice(l.price)}</span>
                        {l.bedrooms && <span><BedDouble className="mr-0.5 inline h-3 w-3" />{l.bedrooms}</span>}
                        {l.area_sqft > 0 && <span><Maximize className="mr-0.5 inline h-3 w-3" />{l.area_sqft}</span>}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: "#c1c6d6" }} />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 overflow-hidden" style={{ background: "linear-gradient(135deg, #f9f3e3, #fef7e0)", border: "1px solid #fbbc04" }}>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2"><Sparkles className="h-5 w-5" style={{ color: "#fbbc04" }} /><h2 className="font-heading text-base font-semibold" style={{ color: "#5c4300" }}>Boost Listings</h2></div>
            <p className="mb-4 text-sm" style={{ color: "#795900" }}>Get 10x more visibility and 5x more leads by featuring your property in the &quot;Platinum&quot; section.</p>
            <div className="mb-4 space-y-2">
              {["Priority Search Results", "Highlighted Platinum Border", "Send SMS to Verified Buyers"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs" style={{ color: "#5c4300" }}><Star className="h-3.5 w-3.5" style={{ color: "#fbbc04" }} />{f}</div>
              ))}
            </div>
            <Link href="/pricing"><Button className="w-full font-semibold text-white" style={{ background: "linear-gradient(180deg, #fbbc04, #e5a800)" }}>Upgrade to Gold</Button></Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// ==================== BUYER DASHBOARD ====================

function BuyerDashboard({ userName }: { userName: string }) {
  const BUYER_STATS = [
    { label: "SAVED PROPERTIES", value: 12, icon: Heart, color: "#ea4335", bg: "#fce8e6" },
    { label: "CONTACTED SELLERS", value: 5, icon: Phone, color: "#1a73e8", bg: "#e8f0fe" },
    { label: "ACTIVE INQUIRIES", value: 3, icon: Search, color: "#34a853", bg: "#e6f4ea" },
  ];

  const savedProperties = MOCK_LISTINGS.slice(0, 2);
  const recommendedProperties = MOCK_LISTINGS.slice(2, 5);

  return (
    <>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold" style={{ color: "#202124" }}>Welcome back, {userName}!</h1>
        <p className="text-sm" style={{ color: "#727785" }}>Your home search is moving fast. We&apos;ve found 5 new properties matching your preferences since yesterday.</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {BUYER_STATS.map((s) => (
          <Card key={s.label} className="card-elevation">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: s.bg }}>
                <s.icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#727785" }}>{s.label}</p>
                <p className="font-heading text-2xl font-bold" style={{ color: "#202124" }}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-5">
        {/* Saved Properties — 3 cols */}
        <Card className="card-elevation lg:col-span-3">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold" style={{ color: "#202124" }}>Saved Properties</h2>
              <Link href="/dashboard/favorites" className="text-xs font-semibold" style={{ color: "#1a73e8" }}>View All</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {savedProperties.map((l) => (
                <ListingCard key={l.id} listing={l} isFavorited />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right column — 2 cols */}
        <div className="space-y-6 lg:col-span-2">
          {/* Recent Searches */}
          <Card className="card-elevation">
            <CardContent className="p-5">
              <h2 className="mb-3 font-heading text-base font-semibold" style={{ color: "#202124" }}>Recent Searches</h2>
              <div className="space-y-2">
                {MOCK_SEARCHES.map((s) => (
                  <Link key={s.query} href={`/search?q=${encodeURIComponent(s.query)}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50">
                    <Search className="h-4 w-4 flex-shrink-0" style={{ color: "#1a73e8" }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "#202124" }}>{s.query}</p>
                      <p className="text-[10px]" style={{ color: "#c1c6d6" }}>{s.date}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5" style={{ color: "#c1c6d6" }} />
                  </Link>
                ))}
              </div>
              <button className="mt-2 text-xs font-medium" style={{ color: "#727785" }}>Clear All History</button>
            </CardContent>
          </Card>

          {/* Need a Home Loan? */}
          <Card className="card-elevation overflow-hidden" style={{ background: "linear-gradient(135deg, #e8f0fe, #d8e2ff)", border: "1px solid #1a73e8" }}>
            <CardContent className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <Landmark className="h-5 w-5" style={{ color: "#1a73e8" }} />
                <h2 className="font-heading text-base font-semibold" style={{ color: "#004493" }}>Need a Home Loan?</h2>
              </div>
              <p className="mb-4 text-xs" style={{ color: "#414754" }}>
                Get pre-approved in minutes with our bank partners at special rates starting from 8.25%.
              </p>
              <Button size="sm" className="font-semibold text-white" style={{ background: "#1a73e8" }}>
                Check Eligibility
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-5">
        {/* Inquiry History — 3 cols */}
        <Card className="card-elevation lg:col-span-3">
          <CardContent className="p-5">
            <h2 className="mb-4 font-heading text-base font-semibold" style={{ color: "#202124" }}>Inquiry History</h2>
            <div className="space-y-3">
              {MOCK_INQUIRIES.map((inq, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg p-3" style={{ background: "#f4f3f7" }}>
                  <Building2 className="h-5 w-5 flex-shrink-0" style={{ color: "#1a73e8" }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: "#202124" }}>{inq.title}</p>
                    <p className="text-xs" style={{ color: "#727785" }}>Inquired on {inq.date}</p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${inq.status === "Responded" ? "text-white" : ""}`}
                      style={{ background: inq.status === "Responded" ? "#34a853" : "#fef7e0", color: inq.status === "Responded" ? "#ffffff" : "#795900" }}>
                      {inq.status}
                    </span>
                    {inq.time && <p className="mt-0.5 text-[10px]" style={{ color: "#727785" }}>{inq.time}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Complete Your Profile — 2 cols */}
        <Card className="card-elevation lg:col-span-2">
          <CardContent className="p-5">
            <h2 className="mb-4 font-heading text-base font-semibold" style={{ color: "#202124" }}>Complete Your Profile</h2>
            <div className="flex items-center justify-center">
              <div className="relative flex h-28 w-28 items-center justify-center">
                <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e8eaed" strokeWidth="8" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#1a73e8" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 50 * 0.7} ${2 * Math.PI * 50 * 0.3}`} strokeLinecap="round" />
                </svg>
                <span className="absolute font-heading text-2xl font-bold" style={{ color: "#1a73e8" }}>70%</span>
              </div>
            </div>
            <p className="mt-4 text-center text-sm" style={{ color: "#414754" }}>
              A complete profile gets 3x more responses from verified sellers.
            </p>
            <Link href="/profile/edit">
              <Button variant="outline" size="sm" className="mt-3 w-full font-medium" style={{ borderColor: "#1a73e8", color: "#1a73e8" }}>
                Complete Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recommended */}
      <Card className="card-elevation">
        <CardContent className="p-5">
          <h2 className="mb-4 font-heading text-base font-semibold" style={{ color: "#202124" }}>Recommended for You</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedProperties.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// ==================== MAIN DASHBOARD ====================

export default function DashboardPage() {
  const [view, setView] = useState<"listings" | "user">("listings");
  const [userName, setUserName] = useState("User");
  const [listings, setListings] = useState<Listing[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
      if (profile) setUserName(profile.full_name || "User");

      const { data: myListings } = await supabase
        .from("listings")
        .select("*, media:listing_media(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (myListings) setListings(myListings);
    };
    init();
  }, []);

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-6">
      {/* Toggle */}
      <div className="mb-6 flex items-center gap-1 rounded-lg p-1" style={{ background: "#f4f3f7", display: "inline-flex" }}>
        <button
          onClick={() => setView("listings")}
          className="rounded-md px-5 py-2 text-sm font-semibold transition-all"
          style={{
            background: view === "listings" ? "#ffffff" : "transparent",
            color: view === "listings" ? "#1a73e8" : "#727785",
            boxShadow: view === "listings" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
          }}
        >
          <Home className="mr-1.5 inline h-4 w-4" /> Listings Dashboard
        </button>
        <button
          onClick={() => setView("user")}
          className="rounded-md px-5 py-2 text-sm font-semibold transition-all"
          style={{
            background: view === "user" ? "#ffffff" : "transparent",
            color: view === "user" ? "#1a73e8" : "#727785",
            boxShadow: view === "user" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
          }}
        >
          <Users className="mr-1.5 inline h-4 w-4" /> User Dashboard
        </button>
      </div>

      {view === "listings" ? (
        <OwnerDashboard userName={userName} listings={listings} />
      ) : (
        <BuyerDashboard userName={userName} />
      )}
    </div>
  );
}
