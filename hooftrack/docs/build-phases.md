# HoofTrack — Phased Build Plan

Every phase ends with a testable result. Commit after every successful phase.

---

# PHASE 1 — PROJECT FOUNDATION (Week 1–2)

**Goal:** Running app with navigation, theming, authentication, and one-person team auto-created on sign-up.

**Testable result:** User signs up → User/Team/TeamMember rows created in local SQLite → app shows three-tab shell → signs out and back in → still authenticated across cold restarts.

**Steps:**

1. Initialize: `npx create-expo-app@latest hooftrack --template expo-template-blank-typescript`.
2. Install dependencies:
   - `npx expo install expo-router expo-linking expo-constants expo-status-bar expo-sqlite expo-crypto react-native-reanimated`
   - `npm install @supabase/supabase-js @react-native-async-storage/async-storage`
   - `npm install react-native-safe-area-context react-native-screens react-native-gesture-handler`
   - `npm install expo-camera expo-image-picker expo-speech-recognition`
3. Set `"main": "expo-router/entry"` in `package.json`.
4. Create folder structure:
   - `src/app/`, `src/app/(auth)/`, `src/app/(tabs)/`
   - `src/features/auth/`, `src/features/team/`, `src/features/crm/`, `src/features/hoofRecord/`
   - `src/shared/components/`, `src/shared/hooks/`, `src/shared/utils/`, `src/shared/constants/`, `src/shared/types/`
   - `src/db/`, `src/config/`, `docs/`, `assets/images/`, `assets/fonts/`
5. Copy in all config files: `.cursorrules`, `.env.example`, `.gitignore`, `tsconfig.json`.
6. Verify `metro.config.js` exists and extends `expo/metro-config`. If missing, create it:
   ```js
   const { getDefaultConfig } = require('expo/metro-config');
   module.exports = getDefaultConfig(__dirname);
   ```
7. Copy in pre-built shared files (provided in starter): `src/config/supabase.ts`, `src/shared/constants/theme.ts`, `src/shared/constants/hoofOptions.ts`, `src/shared/utils/logging.ts`, `src/shared/utils/helpers.ts`, `src/shared/types/database.ts`, `src/db/schema.ts`, `src/db/migrations.ts`.
8. Create `src/db/database.ts` — initialize SQLite via `SQLite.openDatabaseAsync('hooftrack.db')`, export `getDatabase(): Promise<SQLiteDatabase>` (memoized), run migrations on first open.
9. Create `src/features/auth/authTypes.ts` — re-export `User`, `Team`, `TeamMember` from `@shared/types/database`. Add local `AuthState`: `{ user: User | null, teamId: string | null, session: Session | null, isLoading: boolean, isAuthenticated: boolean }` where `Session` is imported from `@supabase/supabase-js`.
10. Create `src/features/auth/authService.ts`:
    - `signInWithEmail(email: string, password: string): Promise<ServiceResponse<{ session: Session, user: User, teamId: string }>>` — calls Supabase signIn; on success, upserts local `users` row from the Supabase user; reads existing `teams`/`team_members` rows for that user.
    - `signUpWithEmail(email: string, password: string, fullName: string): Promise<ServiceResponse<{ session: Session, user: User, teamId: string }>>` — calls Supabase signUp; on success: (a) insert `users` row with `full_name = fullName`, `preferred_units = 'imperial'`; (b) insert `teams` row with `name = '<fullName>'s Team'`, `owner_id = newUser.id`; (c) insert `team_members` row with `role = 'owner'`, `visible_barn_ids = null`, `can_edit_records = 1`, `can_view_invoices = 1`, `can_create_invoices = 1`.
    - `signOut(): Promise<ServiceResponse<null>>` — clears Supabase session. Does NOT delete local SQLite data.
    - `getCurrentSession(): Promise<ServiceResponse<{ session, user, teamId } | null>>` — returns `{ success: true, data: null }` when no active session (normal, not error).
    - All wrap try/catch; all return ServiceResponse; module label `[AUTH]`.
11. Create `src/features/auth/AuthProvider.tsx` — React Context exposing `AuthState` plus `signIn`, `signUp`, `signOut`. On mount: (a) call `getCurrentSession`, (b) subscribe to `supabase.auth.onAuthStateChange((event, session) => …)` and update state. Render children only after first auth event resolves (or 1s timeout). Expose `currentUser`, `currentTeamId` for downstream consumers.
12. Create `src/app/_layout.tsx` — root layout: SafeAreaProvider → AuthProvider → Slot. StatusBar.
13. Create `src/app/index.tsx` — entry redirect. Read `isAuthenticated` from AuthContext. Authenticated → `<Redirect href="/(tabs)" />`. Not → `<Redirect href="/(auth)/login" />`.
14. Create `src/shared/components/Button.tsx` — props: `title`, `onPress`, `variant` (`'primary' | 'secondary' | 'danger'`, default `'primary'`), `isLoading`, `disabled`. Min height 56dp. Full-width. Variants: primary = `COLORS.PRIMARY` bg, `COLORS.WHITE` text; secondary = transparent bg, 1.5px `COLORS.PRIMARY` border, `COLORS.PRIMARY` text; danger = `COLORS.DANGER` bg, `COLORS.WHITE` text.
15. Create `src/shared/components/Input.tsx` — props: `label`, `value`, `onChangeText`, `placeholder`, `error`, `keyboardType`, `secureTextEntry`. Label above input. Error below in `COLORS.DANGER`. Min height 48dp. Background `COLORS.INPUT_BACKGROUND`.
16. Create `src/shared/components/EmptyState.tsx` — props: `title`, `message`, `actionLabel?`, `onAction?`. Centered, muted.
17. Create `src/app/(auth)/login.tsx` — Email Input, Password Input (secureTextEntry), "Sign In" Button (primary, 56dp), "Create Account" secondary Button. Show loading state during sign-in; show error message on failure.
18. Create `src/app/(auth)/register.tsx` — Full Name, Email, Password, Confirm Password Inputs, "Create Account" Button. Validate all fields via `helpers.ts` validators before submit. On submit, call `signUp`.
19. Create `src/app/(auth)/forgot-password.tsx` — Email Input, "Send Reset Link" Button.
20. Create `src/app/(tabs)/_layout.tsx` — bottom tabs: Home, Horses, Settings. Redirect unauthenticated users to `(auth)/login`.
21. Create `src/app/(tabs)/index.tsx` — dashboard. Show `currentUser.fullName`, sync status placeholder.
22. Create `src/app/(tabs)/horses.tsx` — `<EmptyState title="No horses yet" message="Add a barn first, then add owners and horses." />`.
23. Create `src/app/(tabs)/settings.tsx` — user email, units toggle (calls `crmService.updateUser` later, for now updates local state only), "Sign Out" Button (danger variant).
24. In `app.json`, set `expo.ios.infoPlist.NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSMicrophoneUsageDescription`, `NSSpeechRecognitionUsageDescription`. Android permissions are auto-derived.

**Commit.**

---

# PHASE 2 — CRM: BARNS, OWNERS, HORSES (Week 3–4)

**Goal:** Build the client database scoped to the user's team.

**Testable result:** Add barn (scoped to `currentTeamId`) → add owner at barn → add horse with photo and behavioral flags → search horses → browse Barn → Owner → Horse hierarchy. Behavioral flag badges visible on all horse cards, using theme tokens (no hardcoded colors).

**Steps:**

1. Create `src/features/crm/crmTypes.ts` — re-export `{ Barn, Owner, Horse, CreateBarnInput, UpdateBarnInput, CreateOwnerInput, UpdateOwnerInput, CreateHorseInput, UpdateHorseInput, BehavioralFlags, DEFAULT_BEHAVIORAL_FLAGS }` from `@shared/types/database`. No new interfaces here.
2. Create `src/features/crm/crmService.ts` — all CRUD against local SQLite. Module label `[CRM]`. JSON-stringify `behavioral_flags` on write, JSON-parse on read.
   - Barns: `createBarn(input: CreateBarnInput): Promise<ServiceResponse<Barn>>`, `getBarns(teamId: string, visibleBarnIds: string[] | null): Promise<ServiceResponse<Barn[]>>` — when `visibleBarnIds` non-null, add `WHERE id IN (...)`; `getBarnById(id)`, `updateBarn(id, input)`, `deleteBarn(id)`.
   - Owners: `createOwner`, `getOwnersByBarn(barnId)`, `getOwnerById`, `updateOwner`, `deleteOwner`.
   - Horses: `createHorse` (always serializes `DEFAULT_BEHAVIORAL_FLAGS` merged with input), `getHorsesByOwner(ownerId)`, `getHorsesByBarn(barnId)`, `getHorseById`, `updateHorse`, `deleteHorse`.
   - `searchHorses(query: string, teamId: string, visibleBarnIds: string[] | null): Promise<ServiceResponse<Horse[]>>` — by horse name, owner last name, barn name.
   - All: generate UUID via `generateId()`, set timestamps via `nowISO()`, write to `sync_queue` after every insert/update/delete with operation type and full row JSON as payload.
3. Create `src/features/crm/BarnList.tsx` — FlatList; calls `getBarns(currentTeamId, currentMember.visibleBarnIds)`. Each card shows name/address/owner-count. FAB "+" → BarnForm. Tap row → BarnDetail. Loading, error, empty states.
4. Create `src/features/crm/BarnDetail.tsx` — barn info, owners list, "Add Owner", "Edit Barn". Tap owner → OwnerDetail.
5. Create `src/features/crm/BarnForm.tsx` — Inputs: name (required, validate via `validateRequired`), address (required), notes. On submit: call `createBarn({ teamId: currentTeamId, name, address, ... })`.
6. Create `src/features/crm/OwnerDetail.tsx` — owner info, horses list, "Add Horse". Tap horse → HorseProfile.
7. Create `src/features/crm/OwnerForm.tsx` — firstName (required), lastName (required), phone (validate via `validatePhone` if present), email (validate via `validateEmail` if present), notes.
8. Create `src/features/crm/HorseProfile.tsx` — photo, name, breed, color, discipline, DOB, shoeing cycle with next-due countdown derived from latest session date, BehavioralFlags badge row, notes. Below: "Shoeing history" placeholder section (Phase 3 fills this). "Edit" button → HorseForm.
9. Create `src/features/crm/HorseForm.tsx` — Inputs: name (required), breed, color, DOB (date picker), discipline (Dropdown using `DISCIPLINES` from hoofOptions.ts), shoeingCycleWeeks (numeric, default 6), notes, photo capture via PhotoPicker. Behavioral flags: toggle switches for `kicks`, `bites`, `pullsBack`, `needsSedation`, `difficultToCatch`, plus `customWarning` text Input.
10. Create `src/features/crm/BehavioralFlags.tsx` — renders colored Badge components. `kicks`, `bites` → `COLORS.DANGER` bg. `needsSedation`, `pullsBack`, `difficultToCatch` → `COLORS.CAUTION` bg. `customWarning` (truthy string) → `COLORS.WARNING` bg with the text. All badges: `COLORS.WHITE` text, font weight bold, uppercase, `TYPOGRAPHY.BADGE` font size.
11. Create `src/shared/components/Card.tsx` — children, optional onPress. Rounded corners (`BORDER_RADIUS.MD`), `COLORS.SURFACE` bg, 1px `COLORS.BORDER`, `SHADOWS.CARD`.
12. Create `src/shared/components/SearchBar.tsx` — value, onChangeText, placeholder. 300ms debounce. Uses Input under the hood.
13. Update `src/app/(tabs)/horses.tsx` — global horse list. SearchBar at top, FlatList below. Each card: name, barn, owner, behavioral flag badges. Tap → HorseProfile.
14. Add Expo Router routes for all new screens.

**Commit.**

---

# PHASE 3 — HOOF RECORDS (Week 5–7)

**Goal:** Record a full shoeing session — four hooves, measurements, photos, voice notes — scoped to the current farrier.

**Testable result:** Select horse → enter measurements (validated in display units, converted to mm before storage) and shoe details for 4 hooves → take before/after photos (filenames follow canonical convention) → add voice notes → review summary → finalize session → view in horse's history → tap past session to see full detail.

**Steps:**

1. Verify that `src/db/schema.ts` already contains tables for `shoeing_sessions`, `hoof_records`, `hoof_photos`. They are created by the V1 migration. No schema changes for this phase.
2. Install: `npx expo install expo-file-system` (needed for canonical photo filenames).
3. Create `src/features/hoofRecord/hoofTypes.ts` — re-export `{ ShoeingSession, HoofRecord, HoofPhoto, CreateSessionInput, CreateHoofRecordInput, HoofPosition, PhotoType, SyncStatus }` from `@shared/types/database`. No new interfaces.
4. Create `src/features/hoofRecord/hoofService.ts`. Module label `[HOOF]`.
   - `createSession(horseId: string, farrierId: string): Promise<ServiceResponse<ShoeingSession>>` — inserts row with today's ISO date and `sync_status = 'pending'`. `farrierId` comes from `currentUser.id`.
   - `finalizeSession(sessionId: string, generalNotes: string | null, vetNotes: string | null): Promise<ServiceResponse<ShoeingSession>>` — updates session row with notes, refreshes `updated_at`, enqueues sync_queue update for the session and for every child hoof_record/photo created during the session.
   - `getSessionsByHorse(horseId): Promise<ServiceResponse<ShoeingSession[]>>` — ORDER BY session_date DESC.
   - `getSessionById(id)`, `saveHoofRecord(input: CreateHoofRecordInput)`, `getHoofRecordsBySession(sessionId)`.
   - `saveHoofPhoto(hoofRecord: HoofRecord, session: ShoeingSession, horse: Horse, sourceUri: string, photoType: PhotoType): Promise<ServiceResponse<HoofPhoto>>` — builds canonical filename `{horse.id}_{session.sessionDate}_{hoofRecord.position}_{photoType}.jpg`; copies sourceUri to `FileSystem.documentDirectory + 'photos/' + filename`; inserts hoof_photos row with `local_uri = destination`; enqueues sync_queue.
   - `getPhotosByHoofRecord(hoofRecordId)`.
   - All: `generateId()`, `nowISO()`, sync_queue, try/catch, ServiceResponse.
5. Create `src/features/hoofRecord/NewSession.tsx` — search horses (uses `searchHorses` from crmService). Show horse name, barn, behavioral flag badges. "Start Session" Button calls `createSession(horse.id, currentUser.id)` → navigates to FourHoofNavigator with sessionId.
6. Create `src/features/hoofRecord/FourHoofNavigator.tsx` — visual hoof diagram (or 4 large tabs): LF | RF | LH | RH. Status per hoof (empty | in-progress | complete). Tap → HoofEntryForm for that position. "Review Session" Button (enabled when ≥1 hoof has data) → SessionSummary.
7. Create `src/features/hoofRecord/HoofEntryForm.tsx` — form for one hoof. Uses `useUnits` hook for display↔storage conversion.
   - **Measurements:** toeLength (numeric Input, label shows `unitLabel` from `useUnits`, numeric keyboard), heelAngle (numeric Input, "°" label), soleDepth (numeric Input, `unitLabel`).
   - **Validation:** On blur and on save, call `validateHoofMeasurement(displayValue, fieldName, unit)`. Show error inline.
   - **Shoe:** shoeType (Dropdown from `SHOE_TYPES`), shoeMaterial (Dropdown from `SHOE_MATERIALS`), shoeSize (Input).
   - **Extras:** padType (Dropdown `PAD_TYPES`), packingType (Dropdown `PACKING_TYPES`), nailType (Dropdown `NAIL_TYPES`), nailSize (Dropdown `NAIL_SIZES`).
   - **Notes:** multi-line Input with MicButton.
   - **Photos:** 3 large 56dp PhotoPicker buttons: "Before" / "After" / "X-ray". Plus "Other Photo".
   - "Save Hoof" Button — converts toeLength and soleDepth to mm via `toStorage`, then calls `saveHoofRecord({ sessionId, position, toeLength, heelAngle, soleDepth, ... })`. Photos saved via `saveHoofPhoto` after the hoof record row exists.
8. Create `src/features/hoofRecord/SessionSummary.tsx` — 2×2 grid of all 4 hooves. Each cell: position label, toe length (display unit), heel angle, shoe type, photo thumbnails. General notes Input + MicButton. Vet notes Input + MicButton. "Save Session" Button → `finalizeSession(sessionId, generalNotes, vetNotes)`. SyncStatusBadge inline.
9. Create `src/features/hoofRecord/HoofHistory.tsx` — scrollable past sessions, most recent first. Each row: date (via `formatDate`), farrier name, summary line. Tap → SessionDetail.
10. Create `src/features/hoofRecord/SessionDetail.tsx` — read-only view of past session. Same layout as SessionSummary but inputs disabled.
11. Create `src/shared/components/Dropdown.tsx` — props: `label`, `options: readonly string[]`, `selectedValue`, `onSelect`. Modal-based picker. Min height 48dp.
12. Create `src/shared/components/PhotoPicker.tsx` — props: `label`, `onPhotoCaptured(uri: string)`, `existingPhotoUri?`. Min 56dp. Tap shows action sheet: "Take Photo" (expo-camera) / "Choose from Gallery" (expo-image-picker). Returns raw source URI; the caller (`HoofEntryForm` via `saveHoofPhoto`) is responsible for canonical naming.
13. Create `src/shared/components/MicButton.tsx` — props: `onTextReceived(text: string)`. Min 56dp. Uses `useVoiceInput` hook. Shows pulsing recording indicator while active.
14. Create `src/shared/hooks/useVoiceInput.ts`:
    - Returns `{ isListening: boolean, startListening: (onResult: (text: string) => void) => Promise<void>, stopListening: () => void }`.
    - Internally uses `expo-speech-recognition`: `ExpoSpeechRecognitionModule.start({ lang: 'en-US', continuous: false, interimResults: false })`. Subscribe to the `result` event; on final transcript, call `onResult(transcript)`. Subscribe to `end` to reset `isListening`. Subscribe to `error` to log and reset.
15. Create `src/shared/hooks/useUnits.ts` — reads `currentUser.preferredUnits` from AuthContext. Returns `{ unit: 'imperial' | 'metric', toDisplay: (mm: number) => number, toStorage: (displayVal: number) => number, unitLabel: 'in' | 'mm' }`. `toDisplay` closes over `unit` and calls `toDisplayUnit(mm, unit)`; `toStorage` likewise.
16. Update HorseProfile.tsx: insert `<HoofHistory horseId={horse.id} />` below the horse details section.
17. Add Expo Router navigation routes for the session flow.

**Commit.**

---

# PHASE 4 — OFFLINE SYNC ENGINE (Week 8–9)

**Goal:** Full offline functionality with background sync to Supabase.

**Testable result:** Airplane mode → create barn, owner, horse, full session with photos → reconnect → all rows appear in Supabase with correct relationships; photos uploaded to storage; SyncStatusBadge transitions: Pending(N) → Syncing → Synced.

**Steps:**

1. Install Phase 4 dependencies: `npx expo install @react-native-community/netinfo expo-image-manipulator`.
2. In Supabase dashboard SQL editor, run the contents of `docs/supabase-schema.sql` (provided in starter). This creates tables matching SQLite schema, adapted for PostgreSQL (TEXT → text, INTEGER → int with boolean casts where applicable, REAL → double precision, behavioral_flags as jsonb).
3. Create `src/db/syncEngine.ts`. Module label `[SYNC]`. Uses lazy `getSupabase()` from `@config/supabase`.
   - `startSync(): Promise<ServiceResponse<null>>` — check connectivity via `NetInfo.fetch()`. If offline, return `{ success: true, data: null }`. If online: (a) process sync_queue in created_at order via `pushRecord`, (b) call `pullChanges(getLastSyncTimestamp())`, (c) trigger `photoSync.processQueue()`.
   - `pushRecord(entry: SyncQueueEntry): Promise<ServiceResponse<null>>` — dispatch by `entry.tableName` to a per-table pusher (see step 4). On success: DELETE from sync_queue. On failure: increment `retry_count`, set `last_error`. If `retry_count >= 3`: set `status = 'failed'`. Backoff between in-session retries: 1s, 5s, 30s.
   - `pullChanges(lastSyncAt: string): Promise<ServiceResponse<null>>` — for each remote table, query rows where `updated_at > lastSyncAt`. For each remote row: skip if there's a sync_queue entry with `table_name = X AND record_id = row.id AND status IN ('pending','in_progress')` (the local pending version wins until pushed). Otherwise upsert into local SQLite.
   - `getLastSyncTimestamp(): Promise<string>`, `setLastSyncTimestamp(ts: string): Promise<void>` — backed by AsyncStorage key `hooftrack:lastSyncAt`.
4. In `syncEngine.ts`, define per-table pusher map: `const pushers: Record<string, (row: any) => Promise<void>> = { barns: pushBarn, owners: pushOwner, horses: pushHorse, shoeing_sessions: pushSession, hoof_records: pushHoofRecord, hoof_photos: pushHoofPhoto, users: pushUser, teams: pushTeam, team_members: pushTeamMember }`. Each pusher converts the camelCase JS payload to snake_case columns and calls `supabase.from(table).upsert(record)`.
5. Create `src/shared/hooks/useOfflineSync.ts` — register `NetInfo.addEventListener`. On `isConnected === true`, call `syncEngine.startSync()`. Expose `{ syncStatus: 'synced' | 'syncing' | 'pending' | 'error', pendingCount: number, lastSyncAt: string | null, triggerSync: () => Promise<void> }`. Re-query pendingCount from `SELECT COUNT(*) FROM sync_queue WHERE status != 'failed'` every 2s while mounted.
6. Create `src/shared/hooks/useNetworkStatus.ts` — wraps `NetInfo.useNetInfo()`. Returns `{ isConnected: boolean, connectionType: string | null }`.
7. Create `src/shared/components/SyncStatusBadge.tsx` — green pill "Synced" / amber "Pending (N)" / blue "Syncing…" / red "Sync Error". Tappable; tap triggers manual `triggerSync()`. Uses `COLORS.SUCCESS`, `COLORS.CAUTION`, `COLORS.ACCENT`, `COLORS.DANGER` respectively.
8. Modify `crmService.ts` and `hoofService.ts`: every insert/update/delete already writes to sync_queue (Phase 2/3). Verify nothing was missed; add any missing enqueues.
9. Create `src/db/photoSync.ts`. Module label `[PHOTO]`.
   - `processQueue(): Promise<ServiceResponse<null>>` — SELECT hoof_photos WHERE cloud_uri IS NULL.
   - For each row: read file from `local_uri`, run `ImageManipulator.manipulateAsync(uri, [{ resize: { width: 1920 } }], { compress: 0.8, format: SaveFormat.JPEG })`, upload result to `supabase.storage.from('hoof-photos').upload('team-{teamId}/{filename}', blob)`. On success: UPDATE hoof_photos SET cloud_uri = returned URL. Leave `local_uri` untouched — the local file persists indefinitely.
   - Photo uploads happen after text rows for the same session are synced (call `processQueue` last inside `startSync`).
10. Add `<SyncStatusBadge />` to Home tab header and SessionSummary.

**Commit.**

---

# PHASE 5 — TEAM AND PERMISSIONS (Week 10–11)

**Goal:** Owner invites employees and controls barn visibility per employee.

**Testable result:** Owner invites employee → restricts employee to Barn A only → employee logs in and sees only Barn A's data. Barn B is invisible in all lists, search, and cross-references. RLS on Supabase prevents direct access even via API.

**Steps:**

1. Verify that `src/db/schema.ts` includes `teams` and `team_members` tables. They are already created by V1 migration. No schema changes.
2. Create `src/features/team/teamTypes.ts` — re-export `{ Team, TeamMember }` from `@shared/types/database`. Add local `InviteInput { teamId: string, email: string }` and `PermissionsInput { visibleBarnIds: string[] | null, canEditRecords: boolean, canViewInvoices: boolean, canCreateInvoices: boolean }`.
3. Create `src/features/team/teamService.ts`. Module label `[TEAM]`. JSON-stringify `visible_barn_ids` on write, JSON-parse on read.
   - `getTeam(teamId)`, `getTeamMembers(teamId): Promise<ServiceResponse<TeamMember[]>>`.
   - `inviteMember(teamId: string, email: string): Promise<ServiceResponse<{ inviteCode: string }>>` — calls Supabase auth invite API; returns a 6-character invite code stored in a `team_invites` table (added in supabase-schema.sql).
   - `acceptInvite(code: string): Promise<ServiceResponse<TeamMember>>` — links current user to team as employee.
   - `updateMemberPermissions(memberId: string, permissions: PermissionsInput)`, `removeMember(memberId)`.
4. Create `src/features/team/TeamSettings.tsx` — team name, member list with role badges, "Invite Employee" Button.
5. Create `src/features/team/InviteEmployee.tsx` — Email Input + "Send Invite", displays generated 6-digit code for sharing.
6. Create `src/features/team/PermissionEditor.tsx` — "All barns" toggle (sets `visibleBarnIds = null`); when off, list barn checkboxes; toggles for `canEditRecords`, `canViewInvoices`, `canCreateInvoices`.
7. **Permission-aware filtering** — modify the following service functions to accept `visibleBarnIds: string[] | null` and apply `WHERE barn_id IN (...)` when non-null:
   - `crmService.getBarns`, `getOwnersByBarn` (verify barnId is in visibleBarnIds first), `getHorsesByBarn`, `getHorsesByOwner` (verify horse.barnId in visibleBarnIds), `searchHorses`.
   - `hoofService.getSessionsByHorse` (verify horse.barnId in visibleBarnIds), `getHoofRecordsBySession` (verify session.horseId.barnId).
8. **AuthContext exposure** — extend AuthProvider to load `currentMember: TeamMember | null` on session restore. All screens that call permission-aware services pass `currentMember.visibleBarnIds`.
9. **Local cleanup on permission change** — when `updateMemberPermissions` changes `visibleBarnIds` for the current user, immediately DELETE rows from local SQLite (`barns`, `owners`, `horses`, `shoeing_sessions`, `hoof_records`, `hoof_photos`) that fall outside the new permission set, to prevent stale visibility after demotion.
10. **Supabase RLS** — in the Supabase SQL editor, run the contents of `docs/supabase-rls.sql` (provided in starter). RLS policies enforce: (a) team membership for all reads/writes; (b) for employees with non-null `visible_barn_ids`, restrict barns/owners/horses/sessions to those barn IDs.
11. Add "Team" link in Settings → TeamSettings.

**Commit.**

---

# PHASE 6 — POLISH AND SUBSCRIPTION (Week 12–13)

**Goal:** Ready for real-world barn testing.

**Testable result:** New user → onboarding → signup → subscribe (sandbox) → create team → full workflow → invite employee → restrict access. Every screen has loading/error/empty states. No crashes offline. No empty catch blocks.

**Note:** Phase 6 introduces `react-native-purchases`, which is not Expo Go-compatible. From this phase onward, use `npx expo run:ios` or `npx expo run:android` (development build) instead of Expo Go. Run `npx expo prebuild` once before the first dev build.

**Steps:**

1. Install Phase 6 dependencies: `npx expo install expo-haptics react-native-purchases`.
2. RevenueCat integration:
   - Create `src/config/revenueCat.ts` — initialize with platform-specific API keys from env.
   - Create `src/features/subscription/subscriptionService.ts`: `getOfferings`, `purchasePackage`, `restorePurchases`, `getCustomerInfo`. Module label `[SUB]`. All ServiceResponse.
   - Create `src/features/subscription/SubscriptionScreen.tsx` — Solo ($14.99/mo or $149/yr), Team ($29.99/mo or $299/yr), Business ($49.99/mo or $499/yr). "Start Free Trial" Button (14 days).
   - Create `src/features/subscription/PaywallGate.tsx` — props: `requiredTier`, `children`. If user's tier ≥ required, render children. Else show "Upgrade to unlock" overlay with Button → SubscriptionScreen.
3. **Sandbox testing note:** Real subscription purchases require Apple Developer membership ($99/yr) and App Store Connect in-app product setup. For pre-submission testing without paying, mock `subscriptionService` to return `{ success: true, data: { tier: 'business' } }` and gate the mock behind `process.env.EXPO_PUBLIC_MOCK_SUBSCRIPTIONS === 'true'`.
4. Onboarding:
   - Create `src/features/auth/OnboardingScreen.tsx` — 3 slides: "Track every hoof", "Works offline", "Your barn, your data". "Get Started" Button → registration. Show on first launch only (AsyncStorage flag `hooftrack:onboardingComplete`).
5. UI polish — every screen:
   - Loading: ActivityIndicator. Error: message + "Retry" Button. Empty: EmptyState with action Button.
   - Button press: scale 0.97 via Animated.Value.
   - Keyboard avoidance: wrap forms in KeyboardAvoidingView with platform-correct behavior.
6. Error audit: every try-catch has a `log.error([MODULE], action, error, context)` line. No empty catch blocks. All services return ServiceResponse.
7. Performance: FlatList with `keyExtractor`, `getItemLayout` where item height is fixed, `windowSize={5}`, `removeClippedSubviews`. Generate photo thumbnails at 200px via `ImageManipulator` and cache. Wrap list cards in `React.memo`.
8. Settings: "About" screen (version from `expo-constants`, mailto support link, privacy URL).
9. Haptic feedback: trigger `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)` on (a) successful `finalizeSession`, (b) sync completion in `useOfflineSync`. Trigger `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)` on save failures.

**Commit.**
