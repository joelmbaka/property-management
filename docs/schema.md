# Data Schema (Firestore)

> Source of truth for collections, fields, index definitions, and validation strategy.

## Collections

| Collection | Purpose | Sub-collections |
|------------|---------|-----------------|
| `properties` | One document per rental property | `units` (units in the property) |
| `leases`     | Lease agreements linking a unit & tenant | – |
| `tenants`    | Tenant profiles | – |
| `tickets`    | Maintenance requests | – |

### Document shapes

#### `properties/{propId}`
| Field | Type | Notes |
|-------|------|-------|
| `ownerUid` | string | `auth.uid` of the landlord |
| `name` | string |
| `address` | map `{ line1, city, … }` |
| `mode` | string enum `long-term` \| `short-term` |
| `createdAt` | timestamp | `serverTimestamp()` |
| `updatedAt` | timestamp | auto-updated |

`properties/{propId}/units/{unitId}`
| Field | Type | Notes |
|-------|------|-------|
| `number` | string | e.g. "2B" |
| `bedrooms` | int |
| `bathrooms` | int |
| `furnished` | bool |
| `rent` | number | monthly or nightly depending on property.mode |
| `vacant` | bool |
| `tenantRef` | reference → `/tenants/{tenantId}` | nullable |

#### `leases/{leaseId}`
| Field | Type |
|-------|------|
| `propertyRef` | reference |
| `unitRef` | reference |
| `tenantRef` | reference |
| `startDate` | timestamp |
| `endDate` | timestamp |
| `rent` | number |

#### `tenants/{tenantId}`
| Field | Type |
|-------|------|
| `name` | string |
| `phone` | string |
| `email` | string |
| `photoUrl` | string |

#### `tickets/{ticketId}`
| Field | Type |
|-------|------|
| `propertyRef` | reference |
| `unitRef` | reference |
| `tenantRef` | reference |
| `status` | string enum `open` / `in-progress` / `closed` |
| `description` | string |
| `createdAt` | timestamp |

## Composite indexes (add to `firestore.indexes.json`)
```jsonc
{
  "indexes": [
    {
      "collectionGroup": "leases",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "propertyRef", "order": "ASC" },
        { "fieldPath": "startDate", "order": "DESC" }
      ]
    },
    {
      "collectionGroup": "tickets",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "propertyRef", "order": "ASC" },
        { "fieldPath": "status", "order": "ASC" },
        { "fieldPath": "createdAt", "order": "DESC" }
      ]
    }
  ]
}
```

## Validation strategy

1. **TypeScript + Zod** — definitions live in `src/types/*` and are exported for reuse.
2. **Runtime check** before every write:
   ```ts
   import { leaseSchema } from '@/types/lease';
   await setDoc(ref, leaseSchema.parse(data));
   ```
3. **Security rules** enforce the same shapes.

## Security-rule snippets (`firestore.rules`)
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    match /properties/{propId} {
      allow read: if resource.data.ownerUid == request.auth.uid;
      allow write: if request.auth.uid == request.resource.data.ownerUid
                    && request.time == request.time; // placeholder extra check
    }

    match /leases/{leaseId} {
      allow read, write: if request.auth != null
                         && get(/databases/$(db)/documents/properties/$(request.resource.data.propertyRef.id)).data.ownerUid == request.auth.uid;
    }
  }
}
```

## Backfill / migrations

One-off scripts live in `scripts/` and are named `YYYY-MM-DD-description.ts`. Use `firebase-admin` to run them with service account creds.
