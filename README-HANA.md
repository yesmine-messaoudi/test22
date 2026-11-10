# Reading the DBADMIN tables from the app

The app reads these existing tables in schema **DBADMIN** (read only):

| Table                | Shown in the app as             |
|----------------------|---------------------------------|
| `SAP_API_PACKAGES`   | Standard APIs                   |
| `SAP_API_METHODS`    | REST methods of a standard API  |
| `SAP_API_OPERATIONS` | SOAP operations of a standard API |
| `SHAREPOINT_DOCS`    | Internal APIs                   |

The app has its own HDI container, so it reaches DBADMIN through synonyms
(`db/src/dbadmin.hdbsynonym`). To create them, the deployer needs a HANA user that is
allowed to grant `SELECT` on DBADMIN (`db/src/dbadmin.hdbgrants`).

## One-time setup (before the next deploy)

### 1. Create a "grantor" user in HANA

In SAP HANA Database Explorer, connected as **DBADMIN**, open a SQL console and run
(choose your own password):

```sql
CREATE USER APIHUB_GRANTOR PASSWORD "Change-Me-123" NO FORCE_FIRST_PASSWORD_CHANGE;
ALTER USER APIHUB_GRANTOR DISABLE PASSWORD LIFETIME;
GRANT SELECT ON SCHEMA DBADMIN TO APIHUB_GRANTOR WITH GRANT OPTION;
```

### 2. Create the user-provided service in your CF space

BTP cockpit → subaccount → space **dev** (where the app runs) → **Instances** → **Create** →
**User-Provided Service Instance**:

- Name: `apihub-dbadmin-grantor` (must be exactly this)
- Parameters:

```json
{
  "user": "APIHUB_GRANTOR",
  "password": "Change-Me-123",
  "schema": "DBADMIN",
  "tags": ["hana"]
}
```

Or with the CF CLI (bash):

```sh
cf cups apihub-dbadmin-grantor -p '{"user":"APIHUB_GRANTOR","password":"Change-Me-123","schema":"DBADMIN","tags":["hana"]}'
```

### 3. Build and deploy as usual

```sh
mbt build
cf deploy mta_archives/app_1.0.0.mtar
```

The deployer creates the synonyms and the read-only views. No table in DBADMIN is created,
changed or deleted.

## Notes

- The DBADMIN tables must be in the same HANA Cloud instance as the HDI container
  (`database_id` in `mta.yaml`).
- Locally (`npm run start-local`), the app uses SQLite with sample data from `test/data/`.
