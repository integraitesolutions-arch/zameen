"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/constants";
import { Plus, Pencil, Trash2, CheckCircle, MapPin, Loader2 } from "lucide-react";
import type { Listing } from "@/lib/supabase/types";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-gray-100 text-gray-700",
  pending_review: "bg-yellow-100 text-yellow-700",
  sold: "bg-blue-100 text-blue-700",
  expired: "bg-red-100 text-red-700",
};

function ListingRow({ listing, onDelete, onMarkSold }: { listing: Listing; onDelete: (id: string) => void; onMarkSold: (id: string) => void }) {
  const coverImage = listing.media?.find((m) => m.is_cover)?.url || listing.media?.[0]?.url;

  return (
    <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-gray-50">
      <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {coverImage ? (
          <img src={coverImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl text-gray-300">🏠</div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold" style={{ color: "#2A2A33" }}>{listing.title}</h3>
          <Badge className={`text-xs ${STATUS_COLORS[listing.status] || ""}`}>
            {listing.status.replace("_", " ")}
          </Badge>
        </div>
        <p className="flex items-center gap-1 text-xs" style={{ color: "#869099" }}>
          <MapPin className="h-3 w-3" /> {listing.locality}, {listing.city}
        </p>
        <p className="mt-1 text-sm font-bold" style={{ color: "#006AFF" }}>{formatPrice(listing.price)}</p>
      </div>

      <div className="flex items-center gap-1">
        <Link href={`/listing/${listing.id}`}>
          <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
        </Link>
        {listing.status === "active" && (
          <Button variant="ghost" size="icon" onClick={() => onMarkSold(listing.id)}>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => onDelete(listing.id)}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchListings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("listings")
      .select("*, media:listing_media(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setListings(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, []);

  const handleDelete = async (id: string) => {
    await supabase.from("listings").delete().eq("id", id);
    setListings((prev) => prev.filter((l) => l.id !== id));
    toast.success("Listing deleted");
  };

  const handleMarkSold = async (id: string) => {
    await supabase.from("listings").update({ status: "sold" }).eq("id", id);
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: "sold" as const } : l));
    toast.success("Marked as sold");
  };

  const filterByStatus = (status?: string) =>
    status ? listings.filter((l) => l.status === status) : listings;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#006AFF" }} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "#2A2A33" }}>My Listings</h1>
        <Link href="/listing/new">
          <Button style={{ background: "#006AFF" }} className="text-white">
            <Plus className="mr-2 h-4 w-4" /> New Listing
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({listings.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({filterByStatus("active").length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({filterByStatus("draft").length})</TabsTrigger>
          <TabsTrigger value="sold">Sold ({filterByStatus("sold").length})</TabsTrigger>
        </TabsList>

        {["all", "active", "draft", "sold"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="space-y-3">
              {filterByStatus(tab === "all" ? undefined : tab).length > 0 ? (
                filterByStatus(tab === "all" ? undefined : tab).map((l) => (
                  <ListingRow key={l.id} listing={l} onDelete={handleDelete} onMarkSold={handleMarkSold} />
                ))
              ) : (
                <div className="py-12 text-center">
                  <p style={{ color: "#869099" }}>No {tab === "all" ? "" : tab} listings yet.</p>
                  <Link href="/listing/new">
                    <Button className="mt-4 text-white" style={{ background: "#006AFF" }}>
                      <Plus className="mr-2 h-4 w-4" /> Create Listing
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
