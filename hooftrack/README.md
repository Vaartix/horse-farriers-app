# HoofTrack — Equine Farrier Management App

A mobile app for equine farriers to track hoof records, manage clients and horses, schedule appointments, and handle invoicing — designed for the barn environment.

## Tech Stack

- React Native + Expo (TypeScript)
- Supabase (PostgreSQL, Auth, Storage)
- Expo SQLite (offline-first local database)

## Getting Started

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in your Supabase credentials
3. Run `npm install`
4. Run `npx expo start`

## Architecture

- **Offline-first:** All writes go to local SQLite, background sync to Supabase when connected.
- **Feature-based folders:** All code organized by domain in `src/features/`.
- **Shared design system:** Reusable components in `src/shared/`.

## Entity Hierarchy

```
Team
 └── Barns / Locations
      └── Owners (horse owners / clients)
           └── Horses
                └── Shoeing Sessions (visits)
                     └── Hoof Records (per hoof, per visit)
                          └── Hoof Photos
```

## Current Phase

Not started — see `docs/build-phases.md` for Phase 1 steps.
