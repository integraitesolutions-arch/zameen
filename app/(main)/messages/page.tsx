"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Loader2 } from "lucide-react";

interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  listings: { title: string; city: string };
  buyer: { full_name: string };
  seller: { full_name: string };
  latest_message?: { content: string; created_at: string; read: boolean; sender_id: string };
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const supabase = createClient();

  useEffect(() => {
    const fetchConversations = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from("conversations")
        .select(`
          *,
          listings(title, city),
          buyer:users!conversations_buyer_id_fkey(full_name),
          seller:users!conversations_seller_id_fkey(full_name)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (data) {
        // Fetch latest message for each
        const withMessages = await Promise.all(
          data.map(async (conv: Conversation) => {
            const { data: msgs } = await supabase
              .from("messages")
              .select("content, created_at, read, sender_id")
              .eq("conversation_id", conv.id)
              .order("created_at", { ascending: false })
              .limit(1);
            return { ...conv, latest_message: msgs?.[0] };
          })
        );
        setConversations(withMessages);
      }
      setLoading(false);
    };
    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#006AFF" }} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "#2A2A33" }}>Messages</h1>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-6">
            <MessageCircle className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold" style={{ color: "#2A2A33" }}>No messages yet</h3>
          <p className="text-sm" style={{ color: "#869099" }}>
            Contact a seller to start a conversation.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const otherName = userId === conv.buyer_id
              ? conv.seller?.full_name
              : conv.buyer?.full_name;
            const isUnread = conv.latest_message && !conv.latest_message.read && conv.latest_message.sender_id !== userId;

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-gray-50"
                style={{ borderColor: isUnread ? "#006AFF" : "#e0e0e0", background: isUnread ? "#f0f7ff" : "white" }}
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-white font-semibold" style={{ background: "#006AFF" }}>
                    {otherName?.charAt(0)?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold" style={{ color: "#2A2A33" }}>{otherName}</p>
                    {conv.latest_message && (
                      <span className="text-xs" style={{ color: "#869099" }}>
                        {new Date(conv.latest_message.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "#006AFF" }}>{conv.listings?.title}</p>
                  {conv.latest_message && (
                    <p className="mt-0.5 truncate text-sm" style={{ color: "#585858" }}>
                      {conv.latest_message.content}
                    </p>
                  )}
                </div>
                {isUnread && <Badge style={{ background: "#006AFF" }} className="text-white text-xs">New</Badge>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
