# Architecture Review: Appointment Scheduling App (shifts-app)

## Overview

This is a Next.js 14+ app using the App Router, TypeScript, Tailwind CSS, and Shadcn/UI components. It integrates Supabase for database and auth (though auth is mishandled). The app supports client, admin, and owner views for scheduling appointments in businesses. Key directories:

- `src/app`: Pages and API routes.
- `src/components`: UI components for different roles (admin, client, owner).
- `src/lib`: Core logic (API client, stores, Supabase utils).
- `src/types`: Type definitions.

The app is in a prototype/mock state: Appointments use a mix of direct Supabase calls in UI and mock in-memory store in API routes, leading to inconsistencies.

## State Management

- **Auth**: Uses Zustand with persistence middleware. Login queries Supabase "users" table client-side and verifies passwords with bcrypt. State includes `isAuthenticated` and `user` (email, name).
  - Issues: Insecure – password hashes are fetched and compared client-side, exposing sensitive data. No session management; relies on localStorage persistence. No role-based access beyond basic protected routes.
- **Appointments**: Mock in-memory object (`appointmentStore`) with CRUD and stats methods. Not a full store like Zustand; data lost on refresh.
  - UI components bypass this and use direct Supabase calls (e.g., `getAppointments` from `@/lib/appointments-supabase`).
  - No global state for appointments; each component manages local state with useState/useEffect.
- **Other**: React Query provider is set up but unused in components (no `useQuery`/`useMutation` found). Local state for forms, filters, etc., is handled well with useState and useMemo.

**Assessment**: Fragmented. Auth is functional but insecure. Appointments lack true global/optimistic state. Recommend Zustand for appointments or full React Query for data fetching/mutations.

## API Response Caching

- React Query is configured with defaults: `staleTime: 0` (re-fetch on mount/focus), `gcTime: 5min` (cache garbage collection).
- No custom query options; provider is basic.
- Fetch uses native `fetch` without explicit Cache-Control headers.
- However, since components don't use React Query hooks, caching isn't leveraged. Direct async calls in useEffect fetch fresh data each time.
- API routes return JSON but use mock store, so "cached" in memory only during server lifecycle.

**Assessment**: Underutilized. Defaults lead to unnecessary re-fetches if React Query were used. For a scheduling app, cache appointment lists with longer staleTime (e.g., 5min) and invalidate on mutations. Integrate Supabase real-time subscriptions for live updates.

## Data Flow

- **UI to Data Layer**:
  - Components (e.g., `AppointmentList`, `AppointmentForm`, `AdminDashboard`) directly import Supabase utils (`@/lib/appointments-supabase`) for CRUD.
  - Flow: User interaction (form submit, edit) → async Supabase call → local state update → UI re-render.
  - Example: `AppointmentForm` calls `createAppointment` on submit, shows toast, calls `onSuccess` for parent refresh.
  - `AppointmentList` uses useEffect with `refreshKey` to re-fetch on mount/edits.
- **API Routes**: Defined but underused. `/api/appointments` uses mock `appointmentStore` for CRUD/stats, with filtering/pagination. Health check is simple.
  - Flow if used: UI → ApiClient (`@/lib/api-client.ts`) → API route → mock store.
  - But UI bypasses this, going direct to Supabase.
- **Persistence**: Supabase for real data (if UI calls hit DB), but mock in API creates dual paths. No real-time sync.
- **Auth Integration**: ProtectedRoute wraps pages, uses auth store. But login is client-only.

**Assessment**: Inconsistent and bypassed API layer. Direct Supabase in client is fine for simple apps but exposes DB keys (if not using RLS). For scalability, route all through API for validation/logging. Data doesn't flow through cache/store uniformly, risking stale views.

## Unnecessary Renders and Performance

- **Renders**: Components use useMemo for filtered/sorted lists (good, prevents re-computes on filter changes). useEffect fetches on mount and key change (efficient for refresh).
- **No React Query**: Direct fetches mean no background refetch, deduping, or suspense. Multiple components (list + dashboard) may fetch the same data independently, causing duplicate DB calls.
- **Subscriptions**: Auth store uses Zustand, which is lightweight and doesn't cause broad re-renders if selectors are used (though not seen). No store subscriptions in UI for appointments.
- **Other**: Heavy use of Shadcn components; no obvious infinite loops. But without caching, navigation between pages re-fetches everything.

**Assessment**: Minimal unnecessary renders due to good local optimization, but poor global efficiency. Duplicate fetches on page loads/navigations. Recommend React Query to cache and share data across components.

## Authentication Security Review

- Client-side login: Fetches user with password_hash from Supabase, compares with bcrypt.
  - Risks: Exposes hashes to client (attackers can steal via XSS). No server-side verification; bypassable. Bcryptjs in client is slow but feasible.
- Persistence: localStorage with partialize (only auth/user), vulnerable to XSS.
- ProtectedRoute: Likely checks store, but no token/session; easy to spoof.
- No RLS mentioned; Supabase calls may allow unauthorized access if policies weak.
- No logout clears Supabase session.

**Assessment**: Highly insecure for production. Migrate to Supabase Auth (email/password with PKCE) for server-side handling, JWT tokens, and RLS.

## Mermaid Diagram: Current Data Flow

```mermaid
graph TD
    A[User Interaction<br/>(Form/List/Dashboard)] --> B[useState/useEffect<br/>in Components]
    B --> C[Direct Supabase Calls<br/>(getAppointments, create, etc.)]
    C --> D[Supabase DB<br/>(appointments table)]
    D --> C
    C --> B
    B --> E[UI Re-render<br/>with Local State]
    
    F[Alternative: ApiClient Calls] --> G[API Routes<br/>(/api/appointments)]
    G --> H[Mock appointmentStore<br/>(In-Memory)]
    H --> G
    G --> F
    
    I[Auth Store (Zustand)] --> J[Client-side Login<br/>Supabase Query + bcrypt]
    J --> K[Supabase users table]
    K --> J
    J --> I
    
    subgraph "Bypassed Path"
    F
    G
    H
    end
    
    style C fill:#90EE90
    style H fill:#FFB6C1
    style J fill:#FF6B6B
```

## Issues Summary

1. **Inconsistency**: Dual data paths (direct Supabase vs. mock API) – UI uses real DB, API uses mock.
2. **Security**: Client-side auth exposes credentials; no proper session management.
3. **Performance**: No caching/refetch optimization; duplicate fetches.
4. **Scalability**: Mock store not viable; no real-time updates for multi-user scheduling.
5. **Maintainability**: Unused React Query and API client; scattered Supabase imports.

## Suggested Improvements

1. **Integrate Layers**: Move Supabase calls to API routes, use ApiClient in UI with React Query for caching.
2. **Auth**: Switch to Supabase Auth library for secure login, sessions, RLS on appointments (e.g., user owns appointments).
3. **State**: Use Zustand for appointments with Supabase sync, or full React Query with mutations invalidating queries.
4. **Caching**: Set staleTime: 300000 (5min) for lists, infinite for static data. Use Supabase real-time for live updates.
5. **Performance**: Add React Query DevTools, optimistic updates in mutations, infinite queries for pagination.
6. **Security**: Implement server-side auth checks in API, input validation, rate limiting.
7. **Testing**: Add unit tests for stores/API, E2E for flows.
8. **Real-time**: Use Supabase subscriptions for appointment changes.

This review is based on key files; full audit may reveal more. Recommend implementing fixes in Code mode.

## Supabase RLS Policies for Security

To secure the appointments table with Row Level Security (RLS), enable RLS in the Supabase dashboard and create the following policies:

1. **Enable Auth**: In Supabase project settings, enable email/password authentication.

2. **Users Table Setup**: Ensure the public.users table has an 'id' column of type uuid (default value gen_random_uuid()) and a 'name' text column. Create a trigger to auto-insert new users into public.users upon auth.users creation:

```sql
-- Trigger function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql
