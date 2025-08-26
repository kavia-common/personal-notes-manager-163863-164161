# Personal Notes - React Frontend

A modern, responsive notes application where users can create, edit, delete, and list notes. Data is persisted using Supabase.

## Features

- Add, edit, delete notes
- List view with search
- Responsive layout: list on the left, editor on the right
- Modern light theme with primary/secondary/accent colors
- No UI framework dependency, pure CSS
- Supabase integration using environment variables

## Environment Variables

Create a `.env` file in the root of the `notes_frontend` folder with:

```
REACT_APP_SUPABASE_URL=<your-supabase-url>
REACT_APP_SUPABASE_KEY=<your-supabase-anon-public-key>
# Optional but recommended for redirects if you add auth later
REACT_APP_SITE_URL=http://localhost:3000
```

Do not commit secrets. The app will show "Disconnected" if these are not set.

You can also review `.env.example` for a template.

## Supabase Setup

Create a project in Supabase and add a "notes" table:

- id: uuid (primary key, default value: gen_random_uuid())
- title: text
- content: text
- updated_at: timestamp with time zone (default: now())

Enable Row Level Security and add permissive demo policies:

```
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read to all" ON public.notes;
CREATE POLICY "Allow read to all" ON public.notes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert to all" ON public.notes;
CREATE POLICY "Allow insert to all" ON public.notes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update to all" ON public.notes;
CREATE POLICY "Allow update to all" ON public.notes FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete to all" ON public.notes;
CREATE POLICY "Allow delete to all" ON public.notes FOR DELETE USING (true);
```

Note: These are for demo usage with anon key. For production, add user_id and scope to auth.uid().

## Scripts

- `npm install` - install dependencies
- `npm start` - start development server
- `CI=true npm test` - run tests in CI mode
- `npm run build` - build for production

## Troubleshooting

- Header shows "Disconnected": REACT_APP_SUPABASE_URL/KEY are not set or not visible to the build.
- Creating a note stores only locally: Check browser console for Supabase errors; verify RLS policies and that your anon key belongs to the same project as REACT_APP_SUPABASE_URL.
- Check the network tab for calls to `rest/v1/notes`.

## Folder Structure

- `src/components/NotesList.jsx` - list and search UI
- `src/components/NoteEditor.jsx` - editor UI
- `src/services/notesService.js` - Supabase CRUD helpers
- `src/supabaseClient.js` - Supabase client initialization
- `src/utils/getURL.js` - dynamic site URL helper

## Design

The app follows a light theme and the following palette:
- Primary: #1976d2
- Secondary: #424242
- Accent: #ffb300

Layout:
- Header with brand and status
- Two-pane main area with list and editor
