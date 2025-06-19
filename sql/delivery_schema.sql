-- ############################################################
-- Adera – Delivery System Schema
-- ############################################################

begin;

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- App content table for terms and conditions
create table if not exists public.app_content (
    id uuid primary key default uuid_generate_v4(),
    type text not null,
    content text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint app_content_type_key unique (type)
);

comment on table public.app_content is 'Stores app content like terms and conditions';

-- Package sizes enum
create type public.package_size as enum ('document', 'small', 'medium', 'big');

-- Payment methods enum
create type public.payment_method as enum (
    'sender_wallet',
    'sender_bank',
    'dropoff_partner',
    'receiver_wallet',
    'receiver_bank',
    'cash_on_delivery'
);

-- Delivery phase enum
create type public.delivery_phase as enum (
    'created',
    'at_dropoff',
    'in_transit_to_hub',
    'at_hub',
    'dispatched',
    'at_pickup',
    'delivered'
);

-- Deliveries table
create table if not exists public.deliveries (
    id uuid primary key default uuid_generate_v4(),
    tracking_code text not null unique,
    sender_id uuid not null references auth.users(id),
    recipient_phone text not null,
    recipient_name text,
    recipient_is_member boolean not null default false,
    recipient_address text,
    recipient_notes text,
    package_size package_size not null,
    package_weight numeric(10, 2) not null,
    package_special_handling boolean not null default false,
    package_description text,
    dropoff_partner_id uuid not null references auth.users(id),
    pickup_partner_id uuid not null references auth.users(id),
    payment_method payment_method not null,
    payment_status text not null default 'pending',
    current_phase delivery_phase not null default 'created',
    verification_hash text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.deliveries is 'Stores delivery orders';

-- Delivery tracking history
create table if not exists public.delivery_tracking (
    id uuid primary key default uuid_generate_v4(),
    delivery_id uuid not null references public.deliveries(id),
    phase delivery_phase not null,
    location point,
    notes text,
    created_by uuid not null references auth.users(id),
    created_at timestamptz not null default now()
);

comment on table public.delivery_tracking is 'Stores delivery tracking history';

-- Add RLS policies
alter table public.app_content enable row level security;
alter table public.deliveries enable row level security;
alter table public.delivery_tracking enable row level security;

-- App content policies
create policy "Allow public read access to app_content"
    on public.app_content for select
    using (true);

create policy "Allow admin update of app_content"
    on public.app_content for update
    using (auth.uid() in (
        select id from auth.users
        where raw_user_meta_data->>'role' = 'admin'
    ));

-- Delivery policies
create policy "Allow customer to create deliveries"
    on public.deliveries for insert
    with check (auth.uid() = sender_id);

create policy "Allow customer to view own deliveries"
    on public.deliveries for select
    using (
        auth.uid() = sender_id or
        auth.uid() = dropoff_partner_id or
        auth.uid() = pickup_partner_id or
        (recipient_is_member = true and auth.uid() in (
            select id from auth.users
            where raw_user_meta_data->>'phone' = recipient_phone
        ))
    );

create policy "Allow partner to update assigned deliveries"
    on public.deliveries for update
    using (
        auth.uid() = dropoff_partner_id or
        auth.uid() = pickup_partner_id
    );

-- Tracking policies
create policy "Allow tracking creation by involved parties"
    on public.delivery_tracking for insert
    with check (
        auth.uid() in (
            select dropoff_partner_id from public.deliveries
            where id = delivery_id
            union
            select pickup_partner_id from public.deliveries
            where id = delivery_id
        )
    );

create policy "Allow tracking view by involved parties"
    on public.delivery_tracking for select
    using (
        exists (
            select 1 from public.deliveries d
            where d.id = delivery_id
            and (
                auth.uid() = d.sender_id or
                auth.uid() = d.dropoff_partner_id or
                auth.uid() = d.pickup_partner_id or
                (d.recipient_is_member = true and auth.uid() in (
                    select id from auth.users
                    where raw_user_meta_data->>'phone' = d.recipient_phone
                ))
            )
        )
    );

-- Add sample terms and conditions
insert into public.app_content (type, content)
values (
    'delivery_terms',
    E'Terms and Conditions for Adera Delivery Service\n\n' ||
    '1. Package Requirements\n' ||
    '   - All items must comply with local shipping regulations\n' ||
    '   - Prohibited items are listed in the eligible items document\n' ||
    '   - Weight limits apply based on package size\n\n' ||
    '2. Delivery Process\n' ||
    '   - Packages must be properly sealed and labeled\n' ||
    '   - Tracking is provided for all deliveries\n' ||
    '   - Delivery times are estimates only\n\n' ||
    '3. Payment Terms\n' ||
    '   - Payment must be completed before delivery processing\n' ||
    '   - Multiple payment options are available\n' ||
    '   - Refunds are subject to our refund policy\n\n' ||
    '4. Liability\n' ||
    '   - Insurance options are available for valuable items\n' ||
    '   - Claims must be filed within 48 hours of delivery\n\n' ||
    'For a complete list of eligible items, please check the linked document.'
)
on conflict (type) do update
set content = excluded.content,
    updated_at = now();

commit; 