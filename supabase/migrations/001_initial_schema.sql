-- Enable PostGIS extension
create extension if not exists postgis;

-- Users profile table (extends auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'individual' check (role in ('individual', 'agent', 'builder', 'business_owner')),
  full_name text not null default '',
  phone text,
  email text,
  avatar_url text,
  is_verified boolean not null default false,
  company_name text,
  rera_number text,
  created_at timestamptz not null default now()
);

-- Listings table
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'pending_review', 'sold', 'expired', 'rejected')),
  listing_type text not null check (listing_type in ('sale', 'rent', 'lease', 'pg_coliving', 'auction')),
  property_type text not null check (property_type in ('apartment', 'house', 'villa', 'plot', 'commercial_shop', 'commercial_office', 'warehouse', 'farmland', 'business')),
  title text not null,
  description text not null default '',
  price bigint not null default 0,
  price_negotiable boolean not null default false,
  rent_deposit bigint,
  maintenance_monthly bigint,
  -- Location
  address text not null default '',
  city text not null default '',
  state text not null default '',
  pincode text not null default '',
  locality text not null default '',
  latitude double precision,
  longitude double precision,
  location geography(Point, 4326),
  -- Property details
  bedrooms integer,
  bathrooms integer,
  area_sqft integer not null default 0,
  carpet_area_sqft integer,
  floor_number integer,
  total_floors integer,
  facing text check (facing in ('North', 'South', 'East', 'West', 'NE', 'NW', 'SE', 'SW')),
  age_years integer,
  furnishing text check (furnishing in ('unfurnished', 'semi_furnished', 'fully_furnished')),
  parking text check (parking in ('none', 'covered', 'open', 'both')),
  amenities text[] not null default '{}',
  -- PG-specific
  pg_gender text check (pg_gender in ('male', 'female', 'any')),
  pg_meals_included boolean,
  pg_occupancy text check (pg_occupancy in ('single', 'double', 'triple')),
  -- Auction-specific
  auction_start timestamptz,
  auction_end timestamptz,
  auction_base_price bigint,
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz
);

-- Business details (extends listings)
create table public.business_details (
  listing_id uuid references public.listings(id) on delete cascade primary key,
  business_type text not null default '',
  annual_revenue bigint,
  employee_count integer,
  years_in_operation integer,
  reason_for_selling text,
  assets_included text,
  lease_details text
);

-- Listing media
create table public.listing_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade not null,
  type text not null check (type in ('photo', 'video', 'floor_plan', 'tour_360')),
  url text not null,
  display_order integer not null default 0,
  is_cover boolean not null default false
);

-- Favorites
create table public.favorites (
  user_id uuid references public.users(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- Indexes
create index listings_user_id_idx on public.listings(user_id);
create index listings_status_idx on public.listings(status);
create index listings_listing_type_idx on public.listings(listing_type);
create index listings_property_type_idx on public.listings(property_type);
create index listings_city_idx on public.listings(city);
create index listings_price_idx on public.listings(price);
create index listings_location_idx on public.listings using gist(location);
create index listings_created_at_idx on public.listings(created_at desc);
create index listing_media_listing_id_idx on public.listing_media(listing_id);
create index favorites_user_id_idx on public.favorites(user_id);

-- Full text search
alter table public.listings add column fts tsvector
  generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(locality, '') || ' ' || coalesce(city, ''))
  ) stored;
create index listings_fts_idx on public.listings using gin(fts);

-- Auto-update location geography from lat/lng
create or replace function public.update_listing_location()
returns trigger as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.location = st_point(new.longitude, new.latitude)::geography;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_listing_location
  before insert or update on public.listings
  for each row execute function public.update_listing_location();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.listings
  for each row execute function public.update_updated_at();

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.phone, new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS Policies
alter table public.users enable row level security;
alter table public.listings enable row level security;
alter table public.business_details enable row level security;
alter table public.listing_media enable row level security;
alter table public.favorites enable row level security;

-- Users: anyone can read, owners can update
create policy "Users are viewable by everyone" on public.users for select using (true);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Listings: active are public, owners can CRUD
create policy "Active listings are viewable by everyone" on public.listings for select using (status = 'active' or auth.uid() = user_id);
create policy "Users can create listings" on public.listings for insert with check (auth.uid() = user_id);
create policy "Users can update own listings" on public.listings for update using (auth.uid() = user_id);
create policy "Users can delete own listings" on public.listings for delete using (auth.uid() = user_id);

-- Business details: follow listing access
create policy "Business details viewable with listing" on public.business_details for select using (true);
create policy "Users can manage own business details" on public.business_details for all using (
  listing_id in (select id from public.listings where user_id = auth.uid())
);

-- Listing media: follow listing access
create policy "Media viewable by everyone" on public.listing_media for select using (true);
create policy "Users can manage own media" on public.listing_media for all using (
  listing_id in (select id from public.listings where user_id = auth.uid())
);

-- Favorites: users manage their own
create policy "Users can view own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "Users can add favorites" on public.favorites for insert with check (auth.uid() = user_id);
create policy "Users can remove favorites" on public.favorites for delete using (auth.uid() = user_id);

-- Storage buckets (run via Supabase dashboard or API)
-- insert into storage.buckets (id, name, public) values ('listing-photos', 'listing-photos', true);
-- insert into storage.buckets (id, name, public) values ('listing-videos', 'listing-videos', true);
-- insert into storage.buckets (id, name, public) values ('listing-floorplans', 'listing-floorplans', true);
-- insert into storage.buckets (id, name, public) values ('listing-360', 'listing-360', true);
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
