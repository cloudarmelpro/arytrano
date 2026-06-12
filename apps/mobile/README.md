# AryTrano mobile (Expo)

iOS + Android client for AryTrano, the Madagascar student-housing
platform. Consumes the same `/api/v1/` REST surface as `apps/web/`.

## Stack

- **Expo SDK 54** + **Expo Router 6** (typed routes)
- **NativeWind 4** for Tailwind styling (shares the web design tokens)
- **TanStack Query** for API caching + retry + stale-while-revalidate
- **expo-secure-store** for the JWT pair (Keychain / Encrypted SP)
- **`@arytrano/shared`** workspace consumed via `file:` link — single
  source of truth for the API Zod schemas

## What's shipped

- Onboarding carousel + locale picker
- Sign-in / sign-up with Bearer JWT in SecureStore + auto-refresh
- Home : city picker + listings list
- Listing detail : gallery, map, WhatsApp/Phone contact reveal
- Favorites (toggle + list)
- Saved searches
- Profile
- Leases : tenant accept (GoalPay checkout) + refuse, owner watch
- **E-T28 Concierge lead funnel** : `/interest/[listingId]` with the
  3-step `form → otp → success` machine. Signed-in users skip OTP
- Push notification token register (`registerExpoPushToken`)

---

## Dev loop

The mobile app does NOT live in npm workspaces — Expo + RN have their
own React/bundler conventions that don't hoist cleanly into the
Next.js root. `@arytrano/shared` is consumed via `file:` link.

### First-time setup

```bash
# 1) Install the workspace's shared package
cd D:/PROJETS/arytrano
npm install

# 2) Install the mobile deps in apps/mobile/
cd apps/mobile
npm install
```

### Run against the local web server

```bash
# Terminal A — Next.js dev server on :3000
cd D:/PROJETS/arytrano && npm run dev

# Terminal B — Expo
cd D:/PROJETS/arytrano/apps/mobile
npx expo start
```

Scan the QR code with **Expo Go** (same Wi-Fi as the dev machine).
The client auto-resolves the LAN IP via Expo's `hostUri` — no manual
config. For a custom API URL :

```bash
EXPO_PUBLIC_API_URL=https://staging.arytrano.com npx expo start
```

---

## Building for TestFlight + Google Internal Testing

### One-time EAS account setup

```bash
# Install eas-cli globally
npm install -g eas-cli

# Log in (creates ~/.eas-token)
eas login

# Initialise the project — creates extra.eas.projectId in app.json
# and updates.url so OTA channels can route. Run from apps/mobile/.
cd apps/mobile
eas init
```

After `eas init`, replace these placeholders in `app.json` :
- `extra.eas.projectId` — set by `eas init` automatically
- `updates.url` — set by `eas init` automatically once you add updates
- (optional) `owner` — your EAS organisation slug

And in `eas.json` :
- `submit.production.ios.ascAppId` — App Store Connect App ID (numeric)
- `submit.production.ios.appleTeamId` — Apple Developer Team ID (10 chars)
- `submit.production.android.serviceAccountKeyPath` — path to the GSA
  JSON downloaded from Google Play Console (gitignored)

### Build profiles

`eas.json` defines three profiles, all extending a `base` profile that
pins Node 20.18 and points at production by default.

| Profile         | Distribution | Channel       | API URL                          | iOS    | Android   |
|-----------------|--------------|---------------|----------------------------------|--------|-----------|
| `development`   | internal     | `development` | `staging.arytrano.com`           | simulator | apk |
| `preview`       | internal     | `preview`     | `staging.arytrano.com`           | m-medium | apk |
| `production`    | store        | `production`  | `arytrano.com` (default)         | m-medium | app-bundle |

### iOS — TestFlight

```bash
# 1) Build a production .ipa on EAS' cloud Mac
cd apps/mobile
npm run build:prod
# Pick "iOS" when prompted, follow the cert wizard the first time
# (eas-cli handles provisioning + signing automatically).

# 2) Submit to App Store Connect → routes to TestFlight automatically
npm run submit:ios
# This uploads + processes ; TestFlight gets the new build under
# "Internal Testing" within ~15 min.

# 3) Add testers in App Store Connect → Users → TestFlight,
#    Apple sends an invite email + install link.
```

The first iOS build takes 15-25 min (cold credentials + signing).
Subsequent builds reuse the provisioning profile and run ~7-10 min.

### Android — Internal Testing

Same flow, swap `ios` for `android`.

```bash
# 1) Build the AAB (Android App Bundle)
npm run build:prod

# 2) Submit to Play Console → Internal Testing track
#    Needs ./play-store-service-account.json (a JSON key downloaded
#    from Google Cloud Console for the SA you created in Play Console
#    → API access). Add the path to .gitignore.
npm run submit:android

# 3) In Play Console → Internal testing, add testers by email.
```

### OTA updates without rebuilding

For minor JS-only fixes (no native module changes), publish an EAS
Update instead of re-submitting :

```bash
eas update --branch production --message "fix: typo on lead form"
```

The `runtimeVersion: appVersion` policy in `app.json` means updates
only roll out to builds with a matching native version — bumping
either `version` (iOS+Android) or `buildNumber`/`versionCode` requires
a fresh native build, not just an OTA.

### Bumping a release

```bash
# Edit app.json:
#   "version": "0.2.0"
#   "ios.buildNumber": "2"
#   "android.versionCode": 2
# Then:
npm run build:prod
npm run submit:ios
npm run submit:android
```

`appVersionSource: remote` in `eas.json` means EAS manages the build
number on its server — `autoIncrement: true` on the production profile
will tick the buildNumber/versionCode automatically.

---

## Privacy strings (iOS)

`app.json` already declares the strings Apple's App Store review
requires :
- **NSLocationWhenInUseUsageDescription** — listings near me
- **NSPhotoLibraryUsageDescription** — état des lieux photos, listing photos
- **NSCameraUsageDescription** — same

Even features not yet shipped (camera upload) need these declared
ahead of time — Apple rejects builds that reference a permission
class without a Usage Description.

---

## Troubleshooting

**`PluginError: Failed to resolve plugin for module "expo-build-properties"`**
Run `npx expo install expo-build-properties` once after pulling.

**`eas build` complains about missing native files**
That's normal — EAS generates the iOS/Android project on its
servers (managed workflow). Don't commit the `ios/` or `android/`
folders if they appear.

**API calls 401 on a TestFlight build**
Check `extra.eas.projectId` matches your EAS account, and that
`EXPO_PUBLIC_API_URL` in `eas.json` points at a host that has
valid TLS + Cloudflare access enabled.

**Apple rejects with "missing app icon"**
Re-export `assets/icon.png` at exactly 1024×1024 PNG, no alpha
channel. Re-run `eas build`.

**`router.d.ts` types are stale**
`npx expo start` regenerates `.expo/types/router.d.ts` on every
change. If you see typed-route errors after pulling, restart Expo.
