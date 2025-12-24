# Quick Start - PostgreSQL Setup za Aplikaciju

## Brzi Setup (5 minuta)

### 1. Instaliraj PostgreSQL

1. Preuzmi: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. Odaberi: **PostgreSQL 16** za **Windows x86-64**
3. Instaliraj sa default opcijama
4. **Zapamti lozinku** za `postgres` korisnika!

### 2. Kreiraj Bazu

**Opcija A: Preko pgAdmin (GUI)**
1. Otvori **pgAdmin 4**
2. Connect na server (unesi lozinku)
3. Desni klik na **Databases** → **Create** → **Database**
4. Ime: `building_app` → **Save**

**Opcija B: Preko Command Line**
```powershell
cd "C:\Program Files\PostgreSQL\16\bin"
.\psql.exe -U postgres
# Unesi lozinku
```
```sql
CREATE DATABASE building_app;
\q
```

### 3. Pokreni SQL Skripte

**Preko pgAdmin:**
1. Tools → Query Tool
2. Otvori `scripts/02-schema.sql`
3. Execute (F5)

**Preko Command Line:**
```powershell
.\psql.exe -U postgres -d building_app -f "C:\Users\ivant\Projects\v0-building-payment-app\scripts\02-schema.sql"
```

### 4. Ažuriraj `.env.local`

```env
DATABASE_URL=postgresql://postgres:TvojaLozinka@localhost:5432/building_app
```

**Zamijeni `TvojaLozinka` sa lozinkom iz koraka 1!**

### 5. Restartuj Aplikaciju

```bash
npm run dev
```

### 6. Kreiraj Admin Nalog

1. Idi na: `http://localhost:3000/setup`
2. Unesi SETUP_KEY iz `.env.local`
3. Kreiraj admin nalog

---

## Gotovo! ✅

Aplikacija bi sada trebala raditi!

