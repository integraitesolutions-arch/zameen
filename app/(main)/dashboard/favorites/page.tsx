import { getFavorites } from "@/lib/supabase/actions";
import { ListingCard } from "@/components/listing/listing-card";
import type { Listing } from "@/lib/supabase/types";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function FavoritesPage() {
  const favorites = await getFavorites();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "#2A2A33" }}>Saved Properties</h1>

      {favorites.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(favorites as Listing[]).map((listing) => (
            <ListingCard key={listing.id} listing={listing} isFavorited />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-6">
            <Heart className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold" style={{ color: "#2A2A33" }}>No saved properties</h3>
          <p className="mb-4 text-sm" style={{ color: "#869099" }}>
            Properties you save will appear here.
          </p>
          <Link href="/search">
            <Button className="text-white" style={{ background: "#006AFF" }}>Browse Properties</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
