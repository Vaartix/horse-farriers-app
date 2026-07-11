# HoofTrack — UX & Structure Reference

---

# UX CONSTRAINTS

- Touch targets: min 48×48dp, prefer 56×56dp for primary actions.
- Spacing between interactive elements: min 12dp.
- Text sizes: min 14sp, body 16sp, measurements 20sp monospaced.
- Contrast: WCAG AA 4.5:1 minimum on all text.
- Colors: dark backgrounds, bright foregrounds, high contrast for sunlight.
- Behavioral badges: red = danger (kicks, bites), orange = caution (needsSedation, pullsBack, difficultToCatch), yellow = custom warning. Bold uppercase.
- Sync status: green = synced, amber = pending, red = error. Persistent, non-intrusive.
- Offline: no "no connection" error modals. Offline is normal, not an error.
- Inputs: dropdowns over free-text. Numeric keypad for measurements. Large camera and mic buttons.
- Four-hoof form: swipeable tabs LF → RF → LH → RH with position indicators.
- Photos: `{horse_id}_{date}_{position}_{type}.jpg`. Max 1920px longest edge.
- Every screen handles three states: loading, error, empty.
- Keyboard avoidance on all form screens.

---

# FOLDER STRUCTURE

```
project-root/
├── .cursorrules
├── .gitignore
├── .env.example
├── package.json
├── tsconfig.json
├── app.json
├── README.md
│
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── forgot-password.tsx
│   │   └── (tabs)/
│   │       ├── _layout.tsx
│   │       ├── index.tsx
│   │       ├── horses.tsx
│   │       └── settings.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── authService.ts
│   │   │   ├── authService.test.ts
│   │   │   ├── authTypes.ts
│   │   │   └── OnboardingScreen.tsx
│   │   ├── team/
│   │   │   ├── TeamSettings.tsx
│   │   │   ├── InviteEmployee.tsx
│   │   │   ├── PermissionEditor.tsx
│   │   │   ├── teamService.ts
│   │   │   └── teamTypes.ts
│   │   ├── crm/
│   │   │   ├── BarnList.tsx
│   │   │   ├── BarnDetail.tsx
│   │   │   ├── BarnForm.tsx
│   │   │   ├── OwnerDetail.tsx
│   │   │   ├── OwnerForm.tsx
│   │   │   ├── HorseProfile.tsx
│   │   │   ├── HorseForm.tsx
│   │   │   ├── BehavioralFlags.tsx
│   │   │   ├── crmService.ts
│   │   │   ├── crmService.test.ts
│   │   │   └── crmTypes.ts
│   │   ├── hoofRecord/
│   │   │   ├── NewSession.tsx
│   │   │   ├── FourHoofNavigator.tsx
│   │   │   ├── HoofEntryForm.tsx
│   │   │   ├── SessionSummary.tsx
│   │   │   ├── SessionDetail.tsx
│   │   │   ├── HoofHistory.tsx
│   │   │   ├── hoofService.ts
│   │   │   ├── hoofService.test.ts
│   │   │   └── hoofTypes.ts
│   │   └── subscription/
│   │       ├── SubscriptionScreen.tsx
│   │       ├── PaywallGate.tsx
│   │       └── subscriptionService.ts
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── PhotoPicker.tsx
│   │   │   ├── MicButton.tsx
│   │   │   ├── SyncStatusBadge.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── hooks/
│   │   │   ├── useOfflineSync.ts
│   │   │   ├── useNetworkStatus.ts
│   │   │   ├── useVoiceInput.ts
│   │   │   └── useUnits.ts
│   │   ├── utils/
│   │   │   ├── logging.ts
│   │   │   └── helpers.ts
│   │   ├── constants/
│   │   │   ├── theme.ts
│   │   │   └── hoofOptions.ts
│   │   └── types/
│   │       └── database.ts
│   │
│   ├── db/
│   │   ├── schema.ts
│   │   ├── database.ts
│   │   ├── migrations.ts
│   │   ├── syncEngine.ts
│   │   └── photoSync.ts
│   │
│   └── config/
│       ├── supabase.ts
│       └── revenueCat.ts
│
├── docs/
│   ├── build-phases.md
│   ├── data-model-reference.md
│   ├── ux-and-structure-reference.md
│   ├── supabase-schema.sql
│   └── supabase-rls.sql
│
└── assets/
    ├── images/
    └── fonts/
```
