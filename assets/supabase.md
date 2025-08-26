# Supabase Configuration for Personal Notes (notes_frontend)

This document tracks the Supabase setup for this project and how the frontend integrates with it.

Last updated: {{DATE}}

## Environment Variables

Frontend requires the following variables in notes_frontend/.env:

- REACT_APP_SUPABASE_URL=<your-supabase-url>
- REACT_APP_SUPABASE_KEY=<your-supabase-anon-public-key>

Note: These are the only env vars currently consumed by the app. Without them, the app runs in localStorage fallback mode and shows "Disconnected".

## Database Schema

Public schema table: public.notes

Columns:
- id uuid primary key default gen_random_uuid()
- title text
- content text
- updated_at timestamptz not null default now()

RLS: Enabled with permissive policies for demo:

- SELECT: allowed to all (USING true)
- INSERT: allowed to all (WITH CHECK true)
- UPDATE: allowed to all (USING true, WITH CHECK true)
- DELETE: allowed to all (USING true)

These policies allow anon access for simplicity. For production, replace with user-scoped policies tied to auth.uid() and add a user_id column.

## SQL Reference

Enabled RLS and policies:

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- SELECT
DROP POLICY IF EXISTS "Allow read to all" ON public.notes;
CREATE POLICY "Allow read to all" ON public.notes FOR SELECT USING (true);

-- INSERT
DROP POLICY IF EXISTS "Allow insert to all" ON public.notes;
CREATE POLICY "Allow insert to all" ON public.notes FOR INSERT WITH CHECK (true);

-- UPDATE
DROP POLICY IF EXISTS "Allow update to all" ON public.notes;
CREATE POLICY "Allow update to all" ON public.notes FOR UPDATE USING (true) WITH CHECK (true);

-- DELETE
DROP POLICY IF EXISTS "Allow delete to all" ON public.notes;
CREATE POLICY "Allow delete to all" ON public.notes FOR DELETE USING (true);

## Frontend Integration

- Supabase JS: @supabase/supabase-js v2
- Client initializer: src/supabaseClient.js
- Notes service: src/services/notesService.js

Behavior:
- If env vars are set, reads/writes are performed on Supabase.
- On any error or when env is missing, the app falls back to localStorage (LS key: notes_fallback).
- UI shows "Connected" when env is present, "Disconnected" otherwise.

Auth and Redirects:
- This app currently uses public anon access; no auth flows are implemented. If you add auth, ensure redirect URLs are configured in Supabase (Authentication > URL Configuration).

## Local Development Checklist

1) Create .env in notes_frontend with:
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_KEY=...

2) Ensure Authentication > URL Configuration has development URLs:
- http://localhost:3000/**
- Your preview URL if applicable

3) Start the app:
npm install
npm start

4) Verify:
- Header shows "Connected".
- Create a note; verify rows appear in public.notes.

## Production Hardening (Recommended)

- Add user_id uuid references auth.users.
- Modify policies to:
  - SELECT USING (user_id = auth.uid())
  - INSERT/UPDATE WITH CHECK (user_id = auth.uid())
- Use Row Level Security with authenticated users, not anon.

## Troubleshooting

- Disconnected status: env vars not set or not exposed to the build. Ensure .env is placed in notes_frontend and variables prefixed with REACT_APP_.
- Unable to insert due to RLS: confirm policies above exist, RLS is enabled, and you're using the anon key (not service role) in the frontend.
- Notes not appearing: open browser console; if you see Supabase errors, the service falls back to localStorage. Check network tab requests to /rest/v1/notes and Supabase project URL.

