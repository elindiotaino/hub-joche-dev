create extension if not exists pgcrypto;

create table if not exists public.hub_user_roles (
  profile_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'manager', 'user')),
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hub_organizations (
  organization_id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hub_organization_members (
  organization_id uuid not null references public.hub_organizations(organization_id) on delete cascade,
  profile_id uuid not null references auth.users(id) on delete cascade,
  membership_role text not null default 'member' check (membership_role in ('manager', 'member')),
  created_at timestamptz not null default now(),
  primary key (organization_id, profile_id)
);

create table if not exists public.hub_user_tool_access (
  profile_id uuid not null references auth.users(id) on delete cascade,
  tool_key text not null,
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (profile_id, tool_key)
);

create table if not exists public.hub_organization_tool_access (
  organization_id uuid not null references public.hub_organizations(organization_id) on delete cascade,
  tool_key text not null,
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (organization_id, tool_key)
);

create table if not exists public.hub_organization_invites (
  invite_id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.hub_organizations(organization_id) on delete cascade,
  email text not null,
  membership_role text not null default 'member' check (membership_role in ('manager', 'member')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  invited_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

insert into public.hub_user_roles (profile_id, role)
select id, 'admin'
from auth.users
where lower(email) = 'josecancel2@gmail.com'
on conflict (profile_id) do update set role = excluded.role;
