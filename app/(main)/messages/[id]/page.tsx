"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState("");
  const [otherUser, setOtherUser] = useState({ name: "", listing: "" });
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Get conversation info
      const { data: conv } = await supabase
        .from("conversations")
        .select(`*, listings(title), buyer:users!conversations_buyer_id_fkey(full_name), seller:users!conversations_seller_id_fkey(full_name)`)
        .eq("id", id)
        .single();

      if (conv) {
        const other = user.id === conv.buyer_id ? conv.seller : conv.buyer;
        setOtherUser({ name: other?.full_name || "User", listing: conv.listings?.title || "" });
      }

      // Get messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

      setMessages(msgs || []);
      setLoading(false);

      // Mark unread as read
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("conversation_id", id)
        .neq("sender_id", user.id)
        .eq("read", false);
    };

    init();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${id}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    await supabase.from("messages").insert({
      conversation_id: id,
      sender_id: userId,
      content: newMessage.trim(),
    });

    // Update conversation timestamp
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", id);

    setNewMessage("");
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#006AFF" }} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: "#e0e0e0" }}>
        <Link href="/messages">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-white text-sm font-semibold" style={{ background: "#006AFF" }}>
            {otherUser.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#2A2A33" }}>{otherUser.name}</p>
          <p className="text-xs" style={{ color: "#869099" }}>{otherUser.listing}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#f7f7f7" }}>
        {messages.map((msg) => {
          const isMine = msg.sender_id === userId;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[70%] rounded-2xl px-4 py-2.5"
                style={{
                  background: isMine ? "#006AFF" : "#ffffff",
                  color: isMine ? "#ffffff" : "#2A2A33",
                  border: isMine ? "none" : "1px solid #e0e0e0",
                }}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="mt-1 text-[10px] opacity-60">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex items-center gap-2 border-t p-3" style={{ borderColor: "#e0e0e0" }}>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={sending || !newMessage.trim()} style={{ background: "#006AFF" }} className="text-white">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
