"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  LISTING_TYPES, PROPERTY_TYPES, FURNISHING_OPTIONS, FACING_OPTIONS,
  PARKING_OPTIONS, AMENITIES, INDIAN_STATES, PG_GENDER_OPTIONS, PG_OCCUPANCY_OPTIONS,
} from "@/lib/constants";
import { Upload, X, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const STEPS = [
  "Property Type",
  "Location",
  "Details",
  "Business Info",
  "Photos & Media",
  "Pricing",
  "Review & Publish",
];

const listingSchema = z.object({
  listing_type: z.string().min(1),
  property_type: z.string().min(1),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  locality: z.string().min(1, "Locality is required"),
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  area_sqft: z.coerce.number().min(1, "Area is required"),
  carpet_area_sqft: z.coerce.number().optional(),
  floor_number: z.coerce.number().optional(),
  total_floors: z.coerce.number().optional(),
  facing: z.string().optional(),
  age_years: z.coerce.number().optional(),
  furnishing: z.string().optional(),
  parking: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  pg_gender: z.string().optional(),
  pg_meals_included: z.boolean().optional(),
  pg_occupancy: z.string().optional(),
  business_type: z.string().optional(),
  annual_revenue: z.coerce.number().optional(),
  employee_count: z.coerce.number().optional(),
  years_in_operation: z.coerce.number().optional(),
  reason_for_selling: z.string().optional(),
  assets_included: z.string().optional(),
  lease_details: z.string().optional(),
  price: z.coerce.number().min(1, "Price is required"),
  price_negotiable: z.boolean().default(false),
  rent_deposit: z.coerce.number().optional(),
  maintenance_monthly: z.coerce.number().optional(),
  auction_base_price: z.coerce.number().optional(),
});

type ListingData = z.infer<typeof listingSchema>;

export function ListingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<ListingData>({
    resolver: zodResolver(listingSchema) as any,
    defaultValues: {
      listing_type: "",
      property_type: "",
      title: "",
      description: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      locality: "",
      amenities: [],
      price_negotiable: false,
      pg_meals_included: false,
    },
  });

  const propertyType = form.watch("property_type");
  const listingType = form.watch("listing_type");
  const amenities = form.watch("amenities") || [];

  const isResidential = ["apartment", "house", "villa"].includes(propertyType);
  const isCommercial = ["commercial_shop", "commercial_office", "warehouse"].includes(propertyType);
  const isPlot = ["plot", "farmland"].includes(propertyType);
  const isBusiness = propertyType === "business";
  const isPG = listingType === "pg_coliving";
  const isAuction = listingType === "auction";
  const isRent = listingType === "rent" || listingType === "lease" || isPG;

  // Skip business step if not business type
  const activeSteps = STEPS.filter((s) => s !== "Business Info" || isBusiness);
  const currentStepName = activeSteps[step];
  const totalSteps = activeSteps.length;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxSize: 10 * 1024 * 1024,
    onDrop: (accepted) => setFiles((prev) => [...prev, ...accepted].slice(0, 30)),
  });

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const toggleAmenity = (amenity: string) => {
    const current = form.getValues("amenities") || [];
    form.setValue(
      "amenities",
      current.includes(amenity)
        ? current.filter((a) => a !== amenity)
        : [...current, amenity]
    );
  };

  const handleSubmit = async (data: ListingData) => {
    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please sign in to list a property");
      router.push("/login");
      return;
    }

    try {
      // Create listing
      const {
        business_type, annual_revenue, employee_count, years_in_operation,
        reason_for_selling, assets_included, lease_details,
        ...listingFields
      } = data;

      const { data: listing, error } = await supabase
        .from("listings")
        .insert({ ...listingFields, user_id: user.id, status: "active" })
        .select()
        .single();

      if (error) throw error;

      // Insert business details
      if (data.property_type === "business" && listing) {
        await supabase.from("business_details").insert({
          listing_id: listing.id,
          business_type: business_type || "",
          annual_revenue, employee_count, years_in_operation,
          reason_for_selling, assets_included, lease_details,
        });
      }

      // Upload photos
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${listing.id}/${Date.now()}-${i}.${ext}`;
        await supabase.storage.from("listing-photos").upload(path, file);
        const { data: { publicUrl } } = supabase.storage.from("listing-photos").getPublicUrl(path);
        await supabase.from("listing_media").insert({
          listing_id: listing.id,
          type: "photo",
          url: publicUrl,
          display_order: i,
          is_cover: i === 0,
        });
      }

      toast.success("Property listed successfully!");
      router.push("/dashboard/listings");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create listing";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => setStep((s) => Math.min(s + 1, totalSteps - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">List Your Property</h1>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {activeSteps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  i < step
                    ? "bg-blue-600 text-white"
                    : i === step
                      ? "bg-blue-100 text-blue-700 ring-2 ring-blue-600"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div className={`mx-1 hidden h-0.5 w-8 md:block ${i < step ? "bg-blue-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm font-medium text-gray-600">
          Step {step + 1} of {totalSteps}: {currentStepName}
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Step 1: Property Type */}
            {currentStepName === "Property Type" && (
              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block text-base font-medium">What do you want to do?</Label>
                  <div className="flex flex-wrap gap-2">
                    {LISTING_TYPES.map((lt) => (
                      <button
                        key={lt.value}
                        type="button"
                        onClick={() => form.setValue("listing_type", lt.value)}
                        className={`rounded-full px-5 py-2 text-sm font-medium border transition-colors ${
                          listingType === lt.value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {lt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block text-base font-medium">Property Type</Label>
                  <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
                    {PROPERTY_TYPES.map((pt) => (
                      <button
                        key={pt.value}
                        type="button"
                        onClick={() => form.setValue("property_type", pt.value)}
                        className={`flex flex-col items-center gap-1 rounded-xl border p-4 transition-colors ${
                          propertyType === pt.value
                            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-2xl">{pt.icon}</span>
                        <span className="text-xs font-medium">{pt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStepName === "Location" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Property Title</Label>
                  <Input placeholder="e.g., 3 BHK Apartment in Bandra West" {...form.register("title")} />
                  {form.formState.errors.title && <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input placeholder="Street address" {...form.register("address")} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Locality / Area</Label>
                    <Input placeholder="e.g., Bandra West" {...form.register("locality")} />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input placeholder="e.g., Mumbai" {...form.register("city")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select value={form.watch("state")} onValueChange={(v) => form.setValue("state", v ?? "")}>
                      <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Pincode</Label>
                    <Input placeholder="6-digit pincode" maxLength={6} {...form.register("pincode")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea rows={4} placeholder="Describe your property..." {...form.register("description")} />
                  {form.formState.errors.description && <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Details */}
            {currentStepName === "Details" && (
              <div className="space-y-4">
                {(isResidential || isPG) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bedrooms</Label>
                      <Input type="number" min={0} {...form.register("bedrooms")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Bathrooms</Label>
                      <Input type="number" min={0} {...form.register("bathrooms")} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Super Area (sq.ft) *</Label>
                    <Input type="number" min={1} {...form.register("area_sqft")} />
                    {form.formState.errors.area_sqft && <p className="text-sm text-red-500">{form.formState.errors.area_sqft.message}</p>}
                  </div>
                  {!isPlot && (
                    <div className="space-y-2">
                      <Label>Carpet Area (sq.ft)</Label>
                      <Input type="number" min={0} {...form.register("carpet_area_sqft")} />
                    </div>
                  )}
                </div>

                {!isPlot && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Floor Number</Label>
                      <Input type="number" min={0} {...form.register("floor_number")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Total Floors</Label>
                      <Input type="number" min={1} {...form.register("total_floors")} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Facing</Label>
                    <Select value={form.watch("facing") || ""} onValueChange={(v) => form.setValue("facing", v ?? "")}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {FACING_OPTIONS.map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {!isPlot && (
                    <div className="space-y-2">
                      <Label>Property Age (years)</Label>
                      <Input type="number" min={0} {...form.register("age_years")} />
                    </div>
                  )}
                </div>

                {!isPlot && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Furnishing</Label>
                      <Select value={form.watch("furnishing") || ""} onValueChange={(v) => form.setValue("furnishing", v ?? "")}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {FURNISHING_OPTIONS.map((f) => (
                            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Parking</Label>
                      <Select value={form.watch("parking") || ""} onValueChange={(v) => form.setValue("parking", v ?? "")}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {PARKING_OPTIONS.map((p) => (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {isPG && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Available For</Label>
                      <Select value={form.watch("pg_gender") || ""} onValueChange={(v) => form.setValue("pg_gender", v ?? "")}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {PG_GENDER_OPTIONS.map((g) => (
                            <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Occupancy</Label>
                      <Select value={form.watch("pg_occupancy") || ""} onValueChange={(v) => form.setValue("pg_occupancy", v ?? "")}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {PG_OCCUPANCY_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {isPG && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="pg_meals"
                      checked={form.watch("pg_meals_included") || false}
                      onCheckedChange={(v) => form.setValue("pg_meals_included", !!v)}
                    />
                    <Label htmlFor="pg_meals">Meals Included</Label>
                  </div>
                )}

                {(isResidential || isCommercial || isPG) && (
                  <div className="space-y-2">
                    <Label>Amenities</Label>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                      {AMENITIES.map((a) => (
                        <div key={a} className="flex items-center gap-2">
                          <Checkbox
                            id={`amenity-${a}`}
                            checked={amenities.includes(a)}
                            onCheckedChange={() => toggleAmenity(a)}
                          />
                          <Label htmlFor={`amenity-${a}`} className="text-sm font-normal">{a}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Business Details */}
            {currentStepName === "Business Info" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <Input placeholder="e.g., Restaurant, Retail, Salon" {...form.register("business_type")} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Annual Revenue (₹)</Label>
                    <Input type="number" placeholder="e.g., 5000000" {...form.register("annual_revenue")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Employee Count</Label>
                    <Input type="number" {...form.register("employee_count")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Years in Operation</Label>
                  <Input type="number" {...form.register("years_in_operation")} />
                </div>
                <div className="space-y-2">
                  <Label>Reason for Selling</Label>
                  <Textarea rows={2} {...form.register("reason_for_selling")} />
                </div>
                <div className="space-y-2">
                  <Label>Assets Included</Label>
                  <Textarea rows={2} placeholder="List equipment, furniture, inventory..." {...form.register("assets_included")} />
                </div>
                <div className="space-y-2">
                  <Label>Lease Details</Label>
                  <Textarea rows={2} placeholder="Lease duration, rent, terms..." {...form.register("lease_details")} />
                </div>
              </div>
            )}

            {/* Step 5: Media */}
            {currentStepName === "Photos & Media" && (
              <div className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer ${
                    isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mb-3 h-10 w-10 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">
                    {isDragActive ? "Drop photos here" : "Drag & drop photos, or click to browse"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">JPG, PNG, WebP — max 10MB each, up to 30 photos</p>
                </div>

                {files.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">{files.length} photo(s) selected</p>
                    <div className="grid grid-cols-4 gap-2 md:grid-cols-6">
                      {files.map((file, idx) => (
                        <div key={idx} className="relative aspect-square overflow-hidden rounded-lg border">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                          {idx === 0 && (
                            <Badge className="absolute left-1 top-1 bg-blue-600 text-[10px]">Cover</Badge>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Pricing */}
            {currentStepName === "Pricing" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{isRent ? "Monthly Rent (₹)" : isAuction ? "Starting Price (₹)" : "Price (₹)"} *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">₹</span>
                    <Input type="number" className="pl-8" min={1} {...form.register("price")} />
                  </div>
                  {form.formState.errors.price && <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="negotiable"
                    checked={form.watch("price_negotiable")}
                    onCheckedChange={(v) => form.setValue("price_negotiable", !!v)}
                  />
                  <Label htmlFor="negotiable">Price is negotiable</Label>
                </div>

                {isRent && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Security Deposit (₹)</Label>
                      <Input type="number" {...form.register("rent_deposit")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Maintenance / Month (₹)</Label>
                      <Input type="number" {...form.register("maintenance_monthly")} />
                    </div>
                  </div>
                )}

                {isAuction && (
                  <div className="space-y-2">
                    <Label>Base Price (₹)</Label>
                    <Input type="number" {...form.register("auction_base_price")} />
                  </div>
                )}
              </div>
            )}

            {/* Step 7: Review */}
            {currentStepName === "Review & Publish" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Review Your Listing</h2>

                <div className="space-y-3 rounded-lg border p-4">
                  <div className="flex gap-2">
                    <Badge className="capitalize">{listingType?.replace("_", " ")}</Badge>
                    <Badge variant="outline" className="capitalize">{propertyType?.replace("_", " ")}</Badge>
                  </div>
                  <h3 className="text-xl font-bold">{form.watch("title") || "Untitled"}</h3>
                  <p className="text-sm text-gray-600">
                    {form.watch("locality")}, {form.watch("city")}, {form.watch("state")} — {form.watch("pincode")}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{Number(form.watch("price") || 0).toLocaleString("en-IN")}
                    {isRent && <span className="text-sm font-normal text-gray-500">/month</span>}
                  </p>

                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    {form.watch("bedrooms") && <span>{form.watch("bedrooms")} Bed</span>}
                    {form.watch("bathrooms") && <span>{form.watch("bathrooms")} Bath</span>}
                    {form.watch("area_sqft") && <span>{form.watch("area_sqft")} sq.ft</span>}
                    {form.watch("furnishing") && <span className="capitalize">{form.watch("furnishing")?.replace("_", " ")}</span>}
                  </div>

                  {form.watch("description") && (
                    <p className="text-sm text-gray-700">{form.watch("description")}</p>
                  )}

                  {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {amenities.map((a) => (
                        <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                      ))}
                    </div>
                  )}

                  {files.length > 0 && (
                    <p className="text-sm text-gray-500">{files.length} photo(s) attached</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between border-t pt-4">
              <Button type="button" variant="outline" onClick={prev} disabled={step === 0}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>

              {step < totalSteps - 1 ? (
                <Button type="button" onClick={next} className="bg-blue-600 hover:bg-blue-700">
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Publish Listing
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
