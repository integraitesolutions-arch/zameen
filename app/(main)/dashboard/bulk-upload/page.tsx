"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const SAMPLE_CSV = `title,listing_type,property_type,price,bedrooms,bathrooms,area_sqft,carpet_area_sqft,address,locality,city,state,pincode,floor_number,total_floors,facing,age_years,furnishing,parking,description
"3 BHK Apartment in Andheri West",sale,apartment,15000000,3,2,1200,950,"MG Road","Andheri West","Mumbai","Maharashtra","400058",5,12,West,3,semi_furnished,covered,"Spacious apartment with modern amenities"
"2 BHK Flat for Rent in Koramangala",rent,apartment,35000,2,2,900,750,"80 Feet Road","Koramangala","Bangalore","Karnataka","560034",3,8,East,5,fully_furnished,open,"Well-furnished flat near IT hub"`;

interface ParsedListing {
  title: string;
  listing_type: string;
  property_type: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area_sqft: number;
  carpet_area_sqft?: number;
  address: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  floor_number?: number;
  total_floors?: number;
  facing?: string;
  age_years?: number;
  furnishing?: string;
  parking?: string;
  description: string;
  status: "pending" | "success" | "error";
  error?: string;
}

function parseCSV(text: string): ParsedListing[] {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === "," && !inQuotes) { values.push(current.trim()); current = ""; continue; }
      current += char;
    }
    values.push(current.trim());

    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ""; });

    return {
      title: obj.title || "",
      listing_type: obj.listing_type || "sale",
      property_type: obj.property_type || "apartment",
      price: parseInt(obj.price) || 0,
      bedrooms: obj.bedrooms ? parseInt(obj.bedrooms) : undefined,
      bathrooms: obj.bathrooms ? parseInt(obj.bathrooms) : undefined,
      area_sqft: parseInt(obj.area_sqft) || 0,
      carpet_area_sqft: obj.carpet_area_sqft ? parseInt(obj.carpet_area_sqft) : undefined,
      address: obj.address || "",
      locality: obj.locality || "",
      city: obj.city || "",
      state: obj.state || "",
      pincode: obj.pincode || "",
      floor_number: obj.floor_number ? parseInt(obj.floor_number) : undefined,
      total_floors: obj.total_floors ? parseInt(obj.total_floors) : undefined,
      facing: obj.facing || undefined,
      age_years: obj.age_years ? parseInt(obj.age_years) : undefined,
      furnishing: obj.furnishing || undefined,
      parking: obj.parking || undefined,
      description: obj.description || "",
      status: "pending" as const,
    };
  });
}

export default function BulkUploadPage() {
  const [listings, setListings] = useState<ParsedListing[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(0);
  const supabase = createClient();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setListings(parsed);
      toast.success(`Parsed ${parsed.length} listings from CSV`);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zameen-bulk-upload-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    setUploading(true);
    setUploaded(0);

    for (let i = 0; i < listings.length; i++) {
      const listing = listings[i];
      try {
        const { error } = await supabase.from("listings").insert({
          user_id: user.id,
          status: "active",
          title: listing.title,
          listing_type: listing.listing_type,
          property_type: listing.property_type,
          price: listing.price,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          area_sqft: listing.area_sqft,
          carpet_area_sqft: listing.carpet_area_sqft,
          address: listing.address,
          locality: listing.locality,
          city: listing.city,
          state: listing.state,
          pincode: listing.pincode,
          floor_number: listing.floor_number,
          total_floors: listing.total_floors,
          facing: listing.facing,
          age_years: listing.age_years,
          furnishing: listing.furnishing,
          parking: listing.parking,
          description: listing.description,
          amenities: [],
        });

        if (error) throw error;
        setListings((prev) => prev.map((l, idx) => idx === i ? { ...l, status: "success" as const } : l));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setListings((prev) => prev.map((l, idx) => idx === i ? { ...l, status: "error" as const, error: msg } : l));
      }
      setUploaded(i + 1);
    }

    setUploading(false);
    toast.success(`Uploaded ${listings.filter((l) => l.status === "success").length} of ${listings.length} listings`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 font-heading text-2xl font-semibold" style={{ color: "#202124" }}>Bulk Upload Listings</h1>
      <p className="mb-8 text-sm" style={{ color: "#727785" }}>
        Upload multiple listings at once using a CSV file. Perfect for agents migrating from other platforms.
      </p>

      {/* Step 1: Download template */}
      <Card className="mb-6">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "#e8f0fe" }}>
            <Download className="h-5 w-5" style={{ color: "#1a73e8" }} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold" style={{ color: "#202124" }}>Step 1: Download Template</h3>
            <p className="text-xs" style={{ color: "#727785" }}>Get the CSV template with all required columns</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate} style={{ borderColor: "#1a73e8", color: "#1a73e8" }}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Download CSV Template
          </Button>
        </CardContent>
      </Card>

      {/* Step 2: Upload CSV */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "#e8f0fe" }}>
              <Upload className="h-5 w-5" style={{ color: "#1a73e8" }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "#202124" }}>Step 2: Upload Your CSV</h3>
              <p className="text-xs" style={{ color: "#727785" }}>Fill in the template and upload it here</p>
            </div>
          </div>

          <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed p-8 transition-colors hover:bg-gray-50" style={{ borderColor: "#e8eaed" }}>
            <FileSpreadsheet className="mb-3 h-10 w-10" style={{ color: "#727785" }} />
            <p className="text-sm font-medium" style={{ color: "#414754" }}>Click to upload CSV file</p>
            <p className="text-xs" style={{ color: "#727785" }}>or drag and drop</p>
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
        </CardContent>
      </Card>

      {/* Step 3: Preview & Upload */}
      {listings.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "#202124" }}>
                Step 3: Review & Upload ({listings.length} listings)
              </h3>
              <Button
                size="sm"
                className="text-white"
                style={{ background: "#1a73e8" }}
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Uploading {uploaded}/{listings.length}</>
                ) : (
                  <><Upload className="mr-1.5 h-3.5 w-3.5" /> Upload All</>
                )}
              </Button>
            </div>

            <div className="max-h-80 space-y-2 overflow-y-auto">
              {listings.map((listing, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg p-3" style={{ background: "#f4f3f7", border: listing.status === "error" ? "1px solid #ba1a1a" : "1px solid transparent" }}>
                  {listing.status === "success" ? (
                    <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: "#34a853" }} />
                  ) : listing.status === "error" ? (
                    <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: "#ba1a1a" }} />
                  ) : (
                    <div className="h-4 w-4 flex-shrink-0 rounded-full" style={{ background: "#e8eaed" }} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: "#202124" }}>{listing.title}</p>
                    <p className="text-xs" style={{ color: "#727785" }}>
                      {listing.property_type} · {listing.city} · ₹{listing.price.toLocaleString("en-IN")}
                    </p>
                    {listing.error && <p className="text-xs" style={{ color: "#ba1a1a" }}>{listing.error}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
