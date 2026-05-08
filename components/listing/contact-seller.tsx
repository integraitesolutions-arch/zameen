"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Phone, Heart, MessageCircle, Shield, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { User } from "@/lib/supabase/types";

interface ContactSellerProps {
  seller: User;
  listingId: string;
}

export function ContactSeller({ seller, listingId }: ContactSellerProps) {
  const router = useRouter();
  const [showPhone, setShowPhone] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [sending, setSending] = useState(false);
  const supabase = createClient();

  const roleLabel =
    seller.role === "agent" ? "Agent"
      : seller.role === "builder" ? "Builder"
        : seller.role === "business_owner" ? "Business Owner"
          : "Owner";

  const handlePhoneReveal = async () => {
    if (showPhone) return;
    const { data: { user } } = await supabase.auth.getUser();

    // Track the reveal
    if (user) {
      await supabase.from("phone_reveals").insert({
        listing_id: listingId,
        viewer_id: user.id,
        seller_id: seller.id,
      });
    }
    setShowPhone(true);
  };

  const handleStartChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to message sellers");
      router.push("/login");
      return;
    }

    // Check for existing conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("listing_id", listingId)
      .eq("buyer_id", user.id)
      .single();

    if (existing) {
      router.push(`/messages/${existing.id}`);
      return;
    }

    // Create new conversation
    const { data: conv, error } = await supabase
      .from("conversations")
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: seller.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to start conversation");
      return;
    }

    router.push(`/messages/${conv.id}`);
  };

  const handleInquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const form = new FormData(e.currentTarget);

    const { error } = await supabase.from("inquiries").insert({
      listing_id: listingId,
      seller_id: seller.id,
      buyer_name: form.get("name") as string,
      buyer_email: form.get("email") as string,
      buyer_phone: form.get("phone") as string,
      message: form.get("message") as string,
    });

    if (error) {
      toast.error("Failed to send inquiry");
    } else {
      toast.success("Inquiry sent! The seller will contact you.");
      setShowForm(false);
    }
    setSending(false);
  };

  const handleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to save properties");
      router.push("/login");
      return;
    }

    if (favorited) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listingId);
      setFavorited(false);
      toast.success("Removed from saved");
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, listing_id: listingId });
      setFavorited(true);
      toast.success("Property saved");
    }
  };

  return (
    <Card className="sticky top-20">
      <CardContent className="p-6">
        {/* Seller Info */}
        <div className="mb-4 flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="text-white font-medium" style={{ background: "#006AFF" }}>
              {seller.full_name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold" style={{ color: "#2A2A33" }}>{seller.full_name}</p>
              {seller.is_verified && <Shield className="h-4 w-4" style={{ color: "#006AFF" }} />}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">{roleLabel}</Badge>
              {seller.company_name && <span className="text-xs" style={{ color: "#869099" }}>{seller.company_name}</span>}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full text-white" style={{ background: "#006AFF" }} onClick={handlePhoneReveal}>
            <Phone className="mr-2 h-4 w-4" />
            {showPhone && seller.phone ? `+91 ${seller.phone}` : "Show Phone Number"}
          </Button>

          <Button variant="outline" className="w-full" onClick={handleStartChat}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat with Seller
          </Button>

          <Button variant="ghost" className={`w-full ${favorited ? "text-red-500" : ""}`} onClick={handleFavorite}>
            <Heart className={`mr-2 h-4 w-4 ${favorited ? "fill-red-500" : ""}`} />
            {favorited ? "Saved" : "Save Property"}
          </Button>
        </div>

        {/* Quick Inquiry Form */}
        <div className="mt-4 border-t pt-4" style={{ borderColor: "#e0e0e0" }}>
          <button
            onClick={() => setShowForm(!showForm)}
            className="mb-3 text-sm font-medium" style={{ color: "#006AFF" }}
          >
            {showForm ? "Hide form" : "Send a quick inquiry"}
          </button>
          {showForm && (
            <form onSubmit={handleInquiry} className="space-y-2.5">
              <div><Label className="text-xs">Name</Label><Input name="name" placeholder="Your name" required /></div>
              <div><Label className="text-xs">Email</Label><Input name="email" type="email" placeholder="you@email.com" /></div>
              <div><Label className="text-xs">Phone</Label><Input name="phone" placeholder="+91" required /></div>
              <div><Label className="text-xs">Message</Label><Textarea name="message" placeholder="I'm interested..." rows={3} /></div>
              <Button type="submit" className="w-full text-white" style={{ background: "#006AFF" }} disabled={sending}>
                <Send className="mr-2 h-4 w-4" />{sending ? "Sending..." : "Send Inquiry"}
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
