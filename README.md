# hub-joche-dev

This repo is the shell application for `hub.joche.dev`.

## Role

- own the homepage and tool directory
- link or proxy to individual tools
- keep each tool in its own GitHub repo

## Current routing model

The preferred model is a single public domain with path-based routing:

- `hub.joche.dev/` -> hub homepage
- `hub.joche.dev/funding-ops` -> Funding Ops app from the `funding-ops` repo

This is implemented with Vercel/Next.js rewrites in [next.config.ts](./next.config.ts)
and depends on the tool app being deployed with a matching base path.

## Environment

- `NEXT_PUBLIC_SITE_URL`: public hub URL
- `FUNDING_OPS_URL`: public link shown on the homepage
- `FUNDING_OPS_ORIGIN`: deployment origin used by rewrites, such as `https://funding-ops.joche.dev`
- `NEXT_PUBLIC_SUPABASE_URL`: shared Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: shared Supabase browser key
- `SUPABASE_SERVICE_ROLE_KEY`: server-side key for roles, orgs, and access management
- `ADMIN_EMAIL`: global admin email, defaults to `josecancel2@gmail.com`

## Auth model

- Google login through Supabase
- Global roles: `admin`, `manager`, `user`
- Users can belong to multiple organizations
- Tool access comes from direct user grants or organization grants

Run [docs/supabase-hub-schema.sql](./docs/supabase-hub-schema.sql) in Supabase before using the admin features.
