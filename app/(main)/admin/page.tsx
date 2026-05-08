"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/constants";
import {
  Building2, Users, Eye, MessageCircle, CheckCircle, XCircle,
  MapPin, Loader2, ShieldAlert, Phone,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { Listing, User } from "@/lib/supabase/types";

interface Stats {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  totalUsers: number;
  totalInquiries: number;
  totalPhoneReveals: number;
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ totalListings: 0, activeListings: 0, pendingListings: 0, totalUsers: 0, totalInquiries: 0, totalPhoneReveals: 0 });
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState("overview");
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
      if (!profile?.is_admin) { setLoading(false); return; }

      setIsAdmin(true);

      // Fetch stats
      const [listingsRes, usersRes, inquiriesRes, revealsRes] = await Promise.all([
        supabase.from("listings").select("id, status", { count: "exact" }),
        supabase.from("users").select("id", { count: "exact" }),
        supabase.from("inquiries").select("id", { count: "exact" }),
        supabase.from("phone_reveals").select("id", { count: "exact" }),
      ]);

      const allListings = listingsRes.data || [];
      setStats({
        totalListings: listingsRes.count || 0,
        activeListings: allListings.filter((l) => l.status === "active").length,
        pendingListings: allListings.filter((l) => l.status === "pending_review").length,
        totalUsers: usersRes.count || 0,
        totalInquiries: inquiriesRes.count || 0,
        totalPhoneReveals: revealsRes.count || 0,
      });

      // Fetch all listings
      const { data: allListingsFull } = await supabase
        .from("listings")
        .select("*, user:users(full_name, role), media:listing_media(*)")
        .order("created_at", { ascending: false })
        .limit(100);
      setListings(allListingsFull || []);

      // Fetch users
      const { data: allUsers } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setUsers(allUsers || []);

      setLoading(false);
    };
    init();
  }, []);

  const updateListingStatus = async (id: string, status: string) => {
    await supabase.from("listings").update({ status }).eq("id", id);
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: status as Listing["status"] } : l));
    toast.success(`Listing ${status === "active" ? "approved" : status}`);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" style={{ color: "#006AFF" }} /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold" style={{ color: "#2A2A33" }}>Access Denied</h2>
        <p className="mt-2 text-sm" style={{ color: "#869099" }}>You don&apos;t have admin permissions.</p>
      </div>
    );
  }

  const STAT_CARDS = [
    { label: "Total Listings", value: stats.totalListings, icon: Building2, color: "#006AFF" },
    { label: "Active", value: stats.activeListings, icon: CheckCircle, color: "#00A652" },
    { label: "Pending Review", value: stats.pendingListings, icon: Eye, color: "#FFB800" },
    { label: "Users", value: stats.totalUsers, icon: Users, color: "#6B5CE7" },
    { label: "Inquiries", value: stats.totalInquiries, icon: MessageCircle, color: "#E65C5C" },
    { label: "Phone Reveals", value: stats.totalPhoneReveals, icon: Phone, color: "#585858" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "#2A2A33" }}>Admin Dashboard</h1>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAT_CARDS.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${s.color}15` }}>
                <s.icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: "#2A2A33" }}>{s.value}</p>
                <p className="text-xs" style={{ color: "#869099" }}>{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">All Listings</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({stats.pendingListings})
          </TabsTrigger>
          <TabsTrigger value="users">Users ({stats.totalUsers})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="space-y-2">
            {listings.map((l) => (
              <div key={l.id} className="flex items-center gap-4 rounded-lg border p-3" style={{ borderColor: "#e0e0e0" }}>
                <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                  {l.media?.[0] && <img src={l.media[0].url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/listing/${l.id}`} className="text-sm font-semibold hover:text-[#006AFF]" style={{ color: "#2A2A33" }}>{l.title}</Link>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "#869099" }}>
                    <MapPin className="h-3 w-3" />{l.city} · {formatPrice(l.price)} · {l.user?.full_name}
                  </div>
                </div>
                <Badge className={l.status === "active" ? "bg-green-100 text-green-700" : l.status === "pending_review" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}>
                  {l.status.replace("_", " ")}
                </Badge>
                {l.status === "pending_review" && (
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => updateListingStatus(l.id, "active")} className="text-white" style={{ background: "#00A652" }}>
                      <CheckCircle className="mr-1 h-3 w-3" />Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateListingStatus(l.id, "rejected")} className="text-red-600 border-red-200">
                      <XCircle className="mr-1 h-3 w-3" />Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {listings.length === 0 && <p className="py-8 text-center text-sm" style={{ color: "#869099" }}>No listings yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <div className="space-y-2">
            {listings.filter((l) => l.status === "pending_review").map((l) => (
              <div key={l.id} className="flex items-center gap-4 rounded-lg border p-4" style={{ borderColor: "#FFB800", background: "#FFFCF0" }}>
                <div className="min-w-0 flex-1">
                  <Link href={`/listing/${l.id}`} className="text-sm font-semibold hover:text-[#006AFF]">{l.title}</Link>
                  <p className="text-xs" style={{ color: "#869099" }}>{l.city} · {formatPrice(l.price)} · by {l.user?.full_name}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateListingStatus(l.id, "active")} className="text-white" style={{ background: "#00A652" }}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => updateListingStatus(l.id, "rejected")} className="text-red-600">Reject</Button>
                </div>
              </div>
            ))}
            {listings.filter((l) => l.status === "pending_review").length === 0 && (
              <p className="py-8 text-center text-sm" style={{ color: "#869099" }}>No pending listings.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: "#e0e0e0" }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-semibold" style={{ background: "#006AFF" }}>
                  {u.full_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "#2A2A33" }}>{u.full_name || "Unnamed"}</p>
                  <p className="text-xs" style={{ color: "#869099" }}>{u.email} · {u.role}</p>
                </div>
                <Badge variant="secondary" className="text-xs capitalize">{u.role}</Badge>
                {u.is_verified && <Badge className="bg-green-100 text-green-700 text-xs">Verified</Badge>}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
