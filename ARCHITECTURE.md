# AryTrano — Architecture

**Pattern**: Feature-based modular (vertical slice), **dual-consumer backend**.

The backend is consumed by **two clients from day one**:
- **Next.js web** (Server Components + Server Actions for forms)
- **Mobile app** (iOS + Android, likely React Native/Expo) → REST JSON

Therefore: **business logic lives in `features/X/services/`**, not in Server Actions.
Server Actions and REST API routes are both **thin wrappers** around services.

The Next.js `app/` directory holds **routes only** — no business logic.
Cross-cutting infrastructure lives in `lib/`.

---

## Folder structure

This repo is a **monorepo** with three top-level workspaces. Every path
in the rest of this document is relative to **`apps/web/`** unless
otherwise noted — i.e. when the doc says `src/features/...`, the real
path is `apps/web/src/features/...`.

```
arytrano/                             # Monorepo root
├── apps/
│   ├── web/                          # Next.js app — see tree below
│   └── mobile/                       # Expo / React Native app (E-T22)
│
├── packages/
│   └── shared/                       # Zod schemas + types consumed by web + mobile
│
├── docker-compose.yml                # Postgres dev container — shared infra
├── package.json                      # Workspace orchestrator (pass-through scripts)
├── README.md / CLAUDE.md / ARCHITECTURE.md / AGENTS.md / TICKETS.md
└── .git/
```

The web app at `apps/web/` follows this internal structure :

```
apps/web/
├── src/
│   ├── app/                          # Next.js App Router — routes only, thin
│   │   ├── (public)/                 # Public marketing + search + listing detail
│   │   ├── (auth)/                   # Sign in / sign up
│   │   ├── dashboard/                # Owner dashboard (authenticated)
│   │   ├── admin/                    # Admin moderation (role-gated)
│   │   └── api/
│   │       ├── v1/                   # Public REST API (mobile, partners)
│   │       │   ├── auth/
│   │       │   ├── listings/
│   │       │   ├── search/
│   │       │   └── ...               # Mirrors feature surface
│   │       └── webhooks/
│   │           └── goalpay/          # Payment webhook handler (server-only)
│   │
│   ├── features/                     # Domain modules (vertical slices)
│   │   ├── listings/
│   │   │   ├── services/             # ⭐ Pure business logic — source of truth
│   │   │   │   ├── create-listing.ts #    Pure functions: input → DB → result type
│   │   │   │   ├── publish-listing.ts#    No HTTP, no Next.js bindings
│   │   │   │   └── ...
│   │   │   ├── actions/              # 'use server' — wrap services for web forms
│   │   │   ├── api/                  # REST route handlers — wrap services for /api/v1/
│   │   │   ├── queries/              # Read-side data fetchers (shared web + API)
│   │   │   ├── schemas/              # Zod schemas (shared everywhere)
│   │   │   ├── components/           # React components (web only)
│   │   │   ├── types.ts              # Domain types
│   │   │   └── index.ts              # Public surface (single import entry)
│   │   │
│   │   ├── auth/
│   │   ├── reviews/
│   │   ├── favorites/
│   │   ├── reports/
│   │   ├── search/
│   │   ├── geo/
│   │   └── payments/                 # GoalPay adapter, PaymentProvider interface
│   │
│   ├── lib/                          # Cross-cutting infrastructure (web-only)
│   │   ├── db/                       # Prisma client
│   │   ├── auth/                     # Auth.js config (web) + token verify (mobile)
│   │   ├── api/                      # API helpers — response shape, error format, auth middleware
│   │   ├── env.ts                    # Zod-typed env vars
│   │   ├── i18n/                     # Locale config + t() helper
│   │   ├── seo/                      # Metadata helpers, structured data
│   │   ├── images/                   # Cloudinary helpers, EXIF strip
│   │   ├── push/                     # Expo Push API client + receipt polling
│   │   └── payments/                 # PaymentProvider interface (impl lives in features/payments)
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn primitives (button, input, dialog…)
│   │   └── shared/                   # Cross-feature shared components (Header, Footer…)
│   │
│   └── styles/
│
├── prisma/                           # Schema, migrations, seed — web-only
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── public/                           # Static assets + project docs
│   └── docs/                         # Runbooks, AryTrano.docx, etc.
│
├── package.json                      # Web deps (Next, Prisma, Auth.js…) + scripts
├── next.config.ts / tsconfig.json / etc.
└── .env
```

**Code shared between web and mobile** lives in `packages/shared/`:
Zod schemas for API request/response shapes, the bilingual `Locale`
union, the `ApiSuccess<T> / ApiFailure` envelopes. Pure TS + Zod, zero
side-effect imports (no `server-only`, no Prisma).

---

## The 8 governing rules

1. **`features/X` imports `features/Y` only via `features/Y/index.ts`.**
   Internal files of another feature are private. Cross-feature coupling goes
   through the public surface so refactors stay local.

2. **`app/` stays thin.** Route files orchestrate (params → call service or
   query → render component). No SQL, no business rules, no Zod schemas in
   route files. Both `app/dashboard/...` and `app/api/v1/...` follow this.

3. **Business logic lives ONLY in `services/`.** Server Actions
   (`actions/`) and REST handlers (`api/`) MUST be thin wrappers that:
   parse input via Zod → call a service → format response. Zero
   duplication of business rules between the two transports.

4. **`lib/` has no feature dependencies.** `lib/` is leaf infrastructure.
   It can be imported by anyone; it imports nobody from `features/`.

5. **Features can depend on `lib/`, never the reverse.**

6. **No catch-all `utils.ts`.** Each helper lives where it is used. If
   genuinely cross-cutting, it goes in a named module under `lib/`
   (e.g. `lib/format/currency.ts`), never a grab-bag file.

7. **Each feature has an explicit public `index.ts`.** Only re-export what
   other features, routes, or `app/api/` are meant to consume.

8. **API is versioned from day one.** All public endpoints under `/api/v1/`.
   Breaking changes go to `/api/v2/`. `/api/webhooks/` is exempt
   (server-to-server, not versioned).

---

## Request flow — example: "owner creates a listing"

**Web (form submission)**
```
ListingForm (Client Component, features/listings/components/)
  → action: createListingAction (features/listings/actions/)
      → validate input with Zod (features/listings/schemas/)
      → call createListing service (features/listings/services/)
          → Prisma write (lib/db/)
      → return ActionResult
  → revalidatePath / redirect
```

**Mobile (REST call)**
```
POST /api/v1/listings (src/app/api/v1/listings/route.ts)
  → handler: createListingHandler (features/listings/api/)
      → authenticate via bearer token (lib/auth/)
      → validate input with Zod (features/listings/schemas/) — SAME schema
      → call createListing service (features/listings/services/) — SAME service
          → Prisma write (lib/db/)
      → return JSON { data, meta } or { error }
```

**Both paths share**: the Zod schema, the service, the DB layer, the domain types.

---

## Where new code goes — quick decision table

| You are adding…                              | It goes in…                                  |
|----------------------------------------------|----------------------------------------------|
| A new web page or route                      | `src/app/...`                                |
| A new REST endpoint for mobile               | `src/app/api/v1/.../route.ts` (calls feature `api/` handler) |
| Pure business logic (create, update, etc.)   | `features/<name>/services/`                  |
| A Server Action (web form wrapper)           | `features/<name>/actions/`                   |
| A REST handler (mobile wrapper)              | `features/<name>/api/`                       |
| A Prisma query returning listings            | `features/listings/queries/`                 |
| A Zod schema for input validation            | `features/<name>/schemas/`                   |
| The `<ListingCard>` component                | `features/listings/components/`              |
| A generic `<Button>` from shadcn             | `components/ui/`                             |
| The site `<Header>` (uses auth + i18n)       | `components/shared/`                         |
| Prisma client singleton                      | `lib/db/`                                    |
| GoalPay HTTP adapter                         | `features/payments/`                         |
| `PaymentProvider` interface                  | `lib/payments/types.ts`                      |
| `formatAriary(amount)`                       | `lib/format/currency.ts`                     |
| REST response/error helpers (JSON shape)     | `lib/api/`                                   |
| Locale switcher logic                        | `lib/i18n/` + `components/shared/`           |
| Webhook route                                | `src/app/api/webhooks/<provider>/route.ts`   |

---

## Naming conventions

- **Files**: `kebab-case.ts` for modules, `PascalCase.tsx` for components.
- **Services**: pure functions, named after the operation
  (`create-listing.ts` exports `createListing(input): Promise<Result>`).
- **Server Actions**: file lives under `actions/`, every action starts with `'use server'`.
- **REST handlers**: file lives under feature `api/`, exports the handler;
  the route file in `src/app/api/v1/` just imports and re-exports
  (`export { GET, POST } from '@/features/listings/api/list'`).
- **Server-only modules**: import `'server-only'` at the top of files that
  must never ship to the client (DB, secrets, payment adapter, services).
- **Public surface**: `features/<name>/index.ts` is the only file allowed
  to be imported from outside the feature.
- **Server-only public surface**: when a feature ships server-only modules
  (Prisma queries, payment adapters, side-effecting services), they go
  in a sibling `features/<name>/server.ts` barrel with `import 'server-only'`
  at the top. Client Components that import from `features/<name>` (the
  default barrel) MUST stay safe — they would otherwise poison the bundle
  with a server-only build failure even on a type-only re-export. Today
  this pattern is applied to `features/geo`, `features/admin`, and
  `features/payments`.

---

## API conventions (REST /api/v1/)

- **Auth**: `Authorization: Bearer <token>` header. Web uses cookies via Auth.js;
  mobile gets a token at sign-in and stores it securely.
- **Response shape (success)**:
  ```json
  { "data": { ... }, "meta": { "page": 1, "total": 42 } }
  ```
- **Response shape (error)**:
  ```json
  { "error": { "code": "validation_failed", "message": "...", "fields": {...} } }
  ```
- **HTTP codes**: 200 OK, 201 Created, 400 validation, 401 auth, 403 forbidden,
  404 not found, 409 conflict, 422 business rule violation, 429 rate limit.
- **Pagination**: cursor-based (`?cursor=<id>&limit=20`), not offset.
- **Versioning**: `/api/v1/`. Breaking changes → `/api/v2/`. Old version
  deprecated with `Sunset` header and 6-month overlap.
- **OpenAPI**: generate from Zod via `zod-to-openapi` once API stabilizes.

---

## Why this shape

- **Backend is dual-consumer.** Web + mobile share the brain (services),
  differ only at the transport edge (Server Actions vs REST).
- **Small platform, lots of features.** Vertical slices let a feature ship
  end-to-end without sprawling across 6 layered folders.
- **Solo / small team.** Easier to onboard: "everything about listings is
  in `features/listings/`."
- **Refactor safety.** A change inside a feature can't silently break
  another feature — they only see each other's `index.ts`.
- **Server Components first.** This shape pairs naturally with App Router:
  routes call queries, queries return data, components render. Client
  islands are local to the feature that needs them.

---

## Anti-patterns (will be flagged in review)

- Putting business logic in a Server Action (`actions/`) — must go to `services/`.
- Putting business logic in a REST handler (`api/`) — same rule.
- Duplicating validation between Server Action and REST handler — both
  must use the same Zod schema from `features/<name>/schemas/`.
- Importing `features/listings/services/create-listing.ts` from another feature.
  Re-export it through `features/listings/index.ts` instead.
- Putting Prisma calls or business logic in `src/app/.../page.tsx` or
  `src/app/api/.../route.ts`.
- An unversioned public API route (`/api/listings` instead of `/api/v1/listings`).
- A `src/lib/utils.ts` that grows into a junk drawer.
- A `features/X` importing from `features/Y/components/...` (deep import).
- Secrets read in Client Components or behind `NEXT_PUBLIC_*`.
