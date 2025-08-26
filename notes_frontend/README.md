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
```

Do not commit secrets. The app will show "Disconnected" if these are not set.

You can also review `.env.example` for a template.

## Supabase Setup

Create a project in Supabase and add a "notes" table:

- id: uuid (primary key, default value: uuid_generate_v4())
- title: text
- content: text
- updated_at: timestamp with time zone (default: now())

Recommended RLS:
- Enable RLS and add policies as needed for your app. For a simple public demo, you may disable RLS (not recommended for production).

## Scripts

- `npm start` - start development server
- `npm test` - run tests
- `npm run build` - build for production

## Folder Structure

- `src/components/NotesList.jsx` - list and search UI
- `src/components/NoteEditor.jsx` - editor UI
- `src/services/notesService.js` - Supabase CRUD helpers
- `src/supabaseClient.js` - Supabase client initialization

## Design

The app follows a light theme and the following palette:
- Primary: #1976d2
- Secondary: #424242
- Accent: #ffb300

Layout:
- Header with brand and status
- Two-pane main area with list and editor
