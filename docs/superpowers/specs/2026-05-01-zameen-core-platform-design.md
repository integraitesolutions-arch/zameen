# Zameen — Core Platform & Listings Design Spec

## Overview
Zameen is an Indian real estate marketplace (Zillow clone) supporting buy, sell, rent, lease, PG/co-living, and auction listings for apartments, houses, land, commercial properties, and businesses. Pan-India coverage.

## Tech Stack
- **Frontend:** Next.js 15 (App Router), Tailwind CSS, shadcn/ui, zustand
- **Backend:** Supabase (Postgres + PostGIS, Auth, Storage, Edge Functions, Realtime)
- **Maps:** Google Maps (Places Autocomplete, geocoding)
- **i18n:** next-intl (English + Hindi + 6 regional languages)
- **Auth:** Phone OTP, Email/Password, Google OAuth, Facebook OAuth

## Sub-project 1: Core Platform & Listings (this spec)

### Database Schema

**users** — extends Supabase auth.users
- id (uuid PK), role (individual/agent/builder/business_owner), full_name, phone, email, avatar_url, is_verified, company_name, rera_number, created_at

**listings**
- id (uuid PK), user_id (FK), status (draft/active/pending_review/sold/expired/rejected), listing_type (sale/rent/lease/pg_coliving/auction), property_type (apartment/house/villa/plot/commercial_shop/commercial_office/warehouse/farmland/business)
- title, description, price (bigint), price_negotiable, rent_deposit, maintenance_monthly
- Location: address, city, state, pincode, locality, latitude, longitude, location (PostGIS geography)
- Details: bedrooms, bathrooms, area_sqft, carpet_area_sqft, floor_number, total_floors, facing, age_years, furnishing, parking, amenities (text[])
- PG: pg_gender, pg_meals_included, pg_occupancy
- Auction: auction_start, auction_end, auction_base_price
- Timestamps: created_at, updated_at, expires_at

**business_details** — extends listings where property_type='business'
- listing_id (FK), business_type, annual_revenue, employee_count, years_in_operation, reason_for_selling, assets_included, lease_details

**listing_media**
- id (uuid PK), listing_id (FK), type (photo/video/floor_plan/tour_360), url, display_order, is_cover

**favorites**
- user_id (FK), listing_id (FK), created_at

### Authentication
- Phone OTP (primary, via Twilio), Email/Password, Google OAuth, Facebook OAuth
- Post-signup role selection
- Supabase RLS: public read for active listings, owner-only write, auth-required for favorites

### Listing CRUD
- 7-step form: Property Type → Location → Details → Business Details (conditional) → Media → Pricing → Review
- States: draft → pending_review → active → sold/expired (rejected loops back)
- Auto-approve for MVP, soft delete

### Media Upload
- Supabase Storage buckets: listing-photos, listing-videos, listing-floorplans, listing-360, avatars
- Photos: max 10MB, 30 per listing, auto-resize to 3 sizes (thumb/medium/full), WebP conversion
- Videos: max 100MB, 3 per listing
- Floor plans: max 10MB, 5 per listing
- 360°: max 20MB, 10 per listing

### Search (Basic — no map view yet)
- Homepage: search bar with Google Places autocomplete + quick filter pills
- Results: list view, sort by newest/price/area
- Filters: listing type, property type, price range, bedrooms, bathrooms, area, furnishing, age, parking, amenities, posted by
- Postgres full-text search + PostGIS spatial queries
- Listing cards: cover photo, price, title, beds/baths/sqft, locality, posted-by badge, favorite icon

### Project Structure
Standard Next.js App Router with app/, components/, lib/, hooks/, messages/, supabase/ directories. See design discussion for full tree.

### Key Dependencies
next 15, @supabase/supabase-js, @supabase/ssr, @googlemaps/js-api-loader, tailwindcss, shadcn/ui, next-intl, react-dropzone, zustand, react-hook-form, zod
