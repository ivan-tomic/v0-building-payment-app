# Rješavanje Permisija za PostgreSQL

## Problem
`building_app_user` nema dozvole da kreira tabele.

## Rješenje 1: Koristi postgres korisnika (NAJLAKŠE)

### Opcija A: Preko pgAdmin (Preporučeno)

1. Otvori **pgAdmin 4**
2. Connect na server sa **postgres** korisnikom (unesi lozinku)
3. Klikni na bazu **building_app**
4. **Tools** → **Query Tool**
5. Otvori `scripts/02-schema.sql`
6. **Execute** (F5)

**Gotovo!** ✅

---

### Opcija B: Preko Command Line

Pokreni sa `postgres` korisnikom:

```powershell
cd "C:\Program Files\PostgreSQL\16\bin"
.\psql.exe -U postgres -d building_app -f "C:\Users\ivant\Projects\v0-building-payment-app\scripts\02-schema.sql"
```

Unesi lozinku za `postgres` korisnika.

---

## Rješenje 2: Daj permisije building_app_user (Ako želiš koristiti tog korisnika)

Nakon što su tabele kreirane sa `postgres` korisnikom, možeš dati permisije:

```sql
-- Connect kao postgres
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO building_app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO building_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO building_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO building_app_user;
```

Ali za development, najlakše je koristiti `postgres` korisnika direktno.

---

## Preporuka

**Za development:** Koristi `postgres` korisnika - najlakše i najbrže!

**Za production:** Kreiraj korisnika sa tačnim permisijama.

