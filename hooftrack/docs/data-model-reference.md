# HoofTrack — Reference Document

---

# DATA MODEL

## Entity Hierarchy

```
Team
 └── Team Members (users with roles)
 └── Barns / Locations
      └── Owners (horse owners / clients)
           └── Horses
                └── Shoeing Sessions (visits)
                     └── Hoof Records (per hoof, per visit)
                          └── Hoof Photos
```

## Tables

### users

| Column | Type | Default | Constraint |
|--------|------|---------|------------|
| id | TEXT | — | PK |
| email | TEXT | NULL | — |
| phone | TEXT | NULL | — |
| full_name | TEXT | — | NOT NULL |
| preferred_units | TEXT | 'imperial' | CHECK IN ('imperial','metric') |
| created_at | TEXT | — | NOT NULL |
| updated_at | TEXT | — | NOT NULL |

### teams

| Column | Type | Default | Constraint |
|--------|------|---------|------------|
| id | TEXT | — | PK |
| name | TEXT | — | NOT NULL |
| owner_id | TEXT | — | FK → users(id), NOT NULL |
| created_at | TEXT | — | NOT NULL |

### team_members

| Column | Type | Default | Constraint |
|--------|------|---------|------------|
| id | TEXT | — | PK |
| team_id | TEXT | — | FK → teams(id), NOT NULL |
| user_id | TEXT | — | FK → users(id), NOT NULL |
| role | TEXT | 'employee' | CHECK IN ('owner','employee') |
| visible_barn_ids | TEXT | NULL | JSON array of barn IDs, null = all |
| can_edit_records | INTEGER | 1 | NOT NULL |
| can_view_invoices | INTEGER | 0 | NOT NULL |
| can_create_invoices | INTEGER | 0 | NOT NULL |
| created_at | TEXT | — | NOT NULL |

### barns

| Column | Type | Default | Constraint |
|--------|------|---------|------------|
| id | TEXT | — | PK |
| team_id | TEXT | — | FK → teams(id), NOT NULL |
| name | TEXT | — | NOT NULL |
| address | TEXT | — | NOT NULL |
| latitude | REAL | NULL | — |
| longitude | REAL | NULL | — |
| notes | TEXT | NULL | — |
| created_at | TEXT | — | NOT NULL |
| updated_at | TEXT | — | NOT NULL |

### owners

| Column | Type | Default | Constraint |
|--------|------|---------|------------|
| id | TEXT | — | PK |
| team_id | TEXT | — | FK → teams(id), NOT NULL |
| barn_id | TEXT | — | FK → barns(id), NOT NULL |
| first_name | TEXT | — | NOT NULL |
| last_name | TEXT | — | NOT NULL |
| phone | TEXT | NULL | — |
| email | TEXT | NULL | — |
| notes | TEXT | NULL | — |
| created_at | TEXT | — | NOT NULL |
| updated_at | TEXT | — | NOT NULL |

### horses

| Column | Type | Default | Constraint |
|--------|------|---------|------------|
| id | TEXT | — | PK |
| owner_id | TEXT | — | FK → owners(id), NOT NULL |
| barn_id | TEXT | — | FK → barns(id), NOT NULL |
| name | TEXT | — | NOT NULL |
| breed | TEXT | NULL | — |
| date_of_birth | TEXT | NULL | — |
| color | TEXT | NULL | — |
| discipline | TEXT | NULL | — |
| behavioral_flags | TEXT | '{}' | NOT NULL, JSON |
| photo_uri | TEXT | NULL | — |
| shoeing_cycle_weeks | INTEGER | 6 | NOT NULL |
| notes | TEXT | NULL | — |
| created_at | TEXT | — | NOT NULL |
| updated_at | TEXT | — | NOT NULL |

### shoeing_sessions

| Column | Type | Default | Constraint |
|--------|------|---------|------------|
| id | TEXT | — | PK |
| horse_id | TEXT | — | FK → horses(id), NOT NULL |
| farrier_id | TEXT | — | FK → users(id), NOT NULL |
| session_date | TEXT | — | NOT NULL |
| general_notes | TEXT | NULL | — |
| vet_notes | TEXT | NULL | — |
| created_at | TEXT | — | NOT NULL |
| updated_at | TEXT | — | NOT NULL |
| sync_status | TEXT | 'pending' | CHECK IN ('synced','pending','conflict') |

### hoof_records

| Column | Type | Default | Constraint |
|--------|------|---------|------------|
| id | TEXT | — | PK |
| session_id | TEXT | — | FK → shoeing_sessions(id), NOT NULL |
| position | TEXT | — | CHECK IN ('LF','RF','LH','RH'), NOT NULL |
| toe_length | REAL | NULL | Stored in mm |
| heel_angle | REAL | NULL | Stored in degrees |
| sole_depth | REAL | NULL | Stored in mm |
| shoe_type | TEXT | NULL | — |
| shoe_size | TEXT | NULL | — |
| shoe_material | TEXT | NULL | — |
| pad_type | TEXT | NULL | — |
| packing_type | TEXT | NULL | — |
| nail_type | TEXT | NULL | — |
| nail_size | TEXT | NULL | — |
| notes | TEXT | NULL | — |
| created_at | TEXT | — | NOT NULL |

### hoof_photos

| Column | Type | Default | Constraint |
|--------|------|---------|------------|
| id | TEXT | — | PK |
| hoof_record_id | TEXT | — | FK → hoof_records(id), NOT NULL |
| local_uri | TEXT | — | NOT NULL |
| cloud_uri | TEXT | NULL | — |
| photo_type | TEXT | — | CHECK IN ('before','after','xray','other'), NOT NULL |
| created_at | TEXT | — | NOT NULL |

### sync_queue

| Column | Type | Default | Constraint |
|--------|------|---------|------------|
| id | TEXT | — | PK |
| table_name | TEXT | — | NOT NULL |
| record_id | TEXT | — | NOT NULL |
| operation | TEXT | — | CHECK IN ('insert','update','delete'), NOT NULL |
| payload | TEXT | — | NOT NULL, JSON |
| created_at | TEXT | — | NOT NULL |
| status | TEXT | 'pending' | CHECK IN ('pending','in_progress','failed') |
| retry_count | INTEGER | 0 | NOT NULL |
| last_error | TEXT | NULL | — |

## Indexes

- `idx_horses_name` → horses(name)
- `idx_horses_owner_id` → horses(owner_id)
- `idx_barns_team_id` → barns(team_id)
- `idx_owners_barn_id` → owners(barn_id)
- `idx_shoeing_sessions_horse_id` → shoeing_sessions(horse_id)
- `idx_shoeing_sessions_date` → shoeing_sessions(session_date)
- `idx_hoof_records_session_id` → hoof_records(session_id)
- `idx_sync_queue_status` → sync_queue(status)

## BehavioralFlags JSON

```json
{
  "kicks": false,
  "bites": false,
  "pullsBack": false,
  "needsSedation": false,
  "difficultToCatch": false,
  "customWarning": null
}
```

## Dropdown Options

**Shoe Types:** Plain stamp, Plain (city head), Rim, Bar (straight), Bar (egg), Bar (heart), Wedge, Glue-on, Natural Balance, Slider, Racing plate, Barefoot trim only.

**Shoe Materials:** Steel, Aluminum, Copper alloy, Composite/Plastic, Titanium.

**Pad Types:** Flat leather, Flat plastic, Wedge pad, Pour-in pad, Rim pad, None.

**Packing Types:** Pine tar oakum, Silicone (Keratex/SoundHorse), Pour-in (Vettec/Equilox), Cotton/gauze, None.

**Nail Types:** E-head, City head, Slim blade, Combo.

**Nail Sizes:** 4, 4.5, 5, 5.5, 6, 7, 8.

## Measurement Rules

- All lengths stored in millimeters.
- All angles stored in degrees.
- Display conversion happens in UI layer only via `useUnits` hook.
- Imperial display: mm → inches (÷ 25.4, round 1 decimal). Metric display: raw mm.
- Angles always display as degrees regardless of unit preference.

## Photo Rules

- Naming: `{horse_id}_{session_date}_{hoof_position}_{type}.jpg`
- Compress to max 1920px longest edge before saving.
- Store locally first. Cloud sync uploads to Supabase Storage `team-{teamId}/hoofs/`.

## ServiceResponse\<T\>

```typescript
interface ServiceResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
```

