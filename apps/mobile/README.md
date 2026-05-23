# AryTrano mobile (Expo)

Foundation slice — the app boots, fetches `GET /api/v1/cities` and renders the
5 seeded cities. Onboarding / sign-in / home / listing / favorites / profile
screens come in the next slice.

## First-time setup

From the repo root:

```bash
# 1) Install the workspace's shared package
npm install

# 2) Install the mobile deps in apps/mobile/
cd apps/mobile
npm install
```

The mobile app does NOT live in npm workspaces — Expo + React Native have
their own React version and bundler conventions that don't hoist cleanly
into the Next.js root. `@arytrano/shared` is consumed via `file:` link.

## Run against your local web server

The mobile client targets the Next.js dev server at `http://<lan-ip>:3000`.

In one terminal at the repo root:

```bash
npm run dev   # starts Next.js on :3000
```

In another, from `apps/mobile/`:

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone (same Wi-Fi as the dev machine).
The client auto-resolves the LAN IP via Expo's `hostUri` — no manual config.

For a custom API URL (staging, prod):

```bash
EXPO_PUBLIC_API_URL=https://arytrano.mg npx expo start
```

## What's in this slice

- Expo SDK 53 + Expo Router 4 (typed routes)
- NativeWind 4 for Tailwind styling
- TanStack Query for API caching + retry
- `@arytrano/shared` workspace consumed via `file:` link
- Typed `lib/api/client.ts` with auto-refresh on 401
- `expo-secure-store` for the JWT pair (Keychain / EncryptedSharedPreferences)
- `lib/config.ts` resolves the API URL from `EXPO_PUBLIC_API_URL`, `app.json
  extra.apiUrl`, or the dev LAN IP

## What's NOT in this slice (next session)

- Onboarding carousel + locale picker
- Sign-in / sign-up screens
- Home (listings list + filters)
- Listing detail (gallery + map + WhatsApp/Phone contact)
- Favorites
- Profile
- Push notifications via Expo Notifications (needs the deferred
  `User.expoPushToken` Prisma migration)
- EAS build config + store submission
