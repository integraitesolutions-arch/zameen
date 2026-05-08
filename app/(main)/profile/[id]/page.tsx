import { MOCK_LISTINGS } from "@/lib/mock-data";
import { ListingCard } from "@/components/listing/listing-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Phone, Mail, Building2, Calendar } from "lucide-react";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // MVP: find user from mock data
  const listing = MOCK_LISTINGS.find((l) => l.user_id === id) || MOCK_LISTINGS[0];
  const user = listing.user!;
  const userListings = MOCK_LISTINGS.filter((l) => l.user_id === user.id);

  const roleLabel =
    user.role === "agent" ? "Agent / Broker" :
    user.role === "builder" ? "Builder / Developer" :
    user.role === "business_owner" ? "Business Owner" : "Individual Owner";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">
                {user.full_name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
                {user.is_verified && <Shield className="h-5 w-5 text-blue-500" />}
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge variant="secondary">{roleLabel}</Badge>
                {user.company_name && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Building2 className="h-3.5 w-3.5" /> {user.company_name}
                  </span>
                )}
              </div>
              {user.rera_number && (
                <p className="mt-1 text-xs text-gray-400">RERA: {user.rera_number}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Phone className="mr-2 h-4 w-4" /> Contact
              </Button>
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" /> Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="mb-8" />

      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Listings by {user.full_name} ({userListings.length})
      </h2>
      {userListings.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {userListings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-gray-500">No active listings.</p>
      )}
    </div>
  );
}
