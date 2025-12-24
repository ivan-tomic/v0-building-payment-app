# psql Komanda - Ispravna Sintaksa

## Problem

Greška: `psql: warning: extra command-line argument "postgres" ignored`

**Razlog:** Imaš razmak između `-` i `U` u komandi.

## Ispravna Sintaksa

### ❌ POGREŠNO:
```powershell
.\psql.exe - U postgres -d building_app
```

### ✅ ISPRAVNO:
```powershell
.\psql.exe -U postgres -d building_app
```

**Napomena:** Nema razmaka između `-` i `U`!

---

## Kompletan Primer

### 1. Navigiraj do bin direktorija:
```powershell
cd "C:\Program Files\PostgreSQL\16\bin"
```

### 2. Poveži se na bazu:
```powershell
.\psql.exe -U postgres -d building_app
```

**Ili bez specificiranja baze:**
```powershell
.\psql.exe -U postgres
```

### 3. Unesi lozinku kada zatraži:
```
Password for user postgres: 
```
*(Unesi lozinku koju si postavio tokom instalacije)*

---

## Alternativne Opcije

### Opcija 1: Koristi PGPASSWORD environment varijablu

```powershell
$env:PGPASSWORD = "TvojaLozinka"
.\psql.exe -U postgres -d building_app
```

**Napomena:** Ovo će automatski unijeti lozinku, ali nije sigurno jer se lozinka vidi u historiji.

### Opcija 2: Koristi pgpass.conf fajl (Najsigurnije)

Kreiraj fajl: `C:\Users\ivant\AppData\Roaming\postgresql\pgpass.conf`

Sadržaj:
```
localhost:5432:building_app:postgres:TvojaLozinka
```

Format: `host:port:database:username:password`

---

## Pokretanje SQL Skripte

### Preko psql:
```powershell
cd "C:\Program Files\PostgreSQL\16\bin"
.\psql.exe -U postgres -d building_app -f "C:\Users\ivant\Projects\v0-building-payment-app\scripts\02-schema.sql"
```

**Ili sa lozinkom:**
```powershell
$env:PGPASSWORD = "TvojaLozinka"
.\psql.exe -U postgres -d building_app -f "C:\Users\ivant\Projects\v0-building-payment-app\scripts\02-schema.sql"
```

---

## Korisne psql Komande (unutar psql prompta)

```sql
-- Lista svih baza
\l

-- Poveži se na drugu bazu
\c building_app

-- Lista svih tabela
\dt

-- Prikaži strukturu tabele
\d users

-- Izlaz iz psql
\q

-- Pokreni SQL fajl
\i C:/Users/ivant/Projects/v0-building-payment-app/scripts/02-schema.sql
```

---

## Najlakše Rješenje: Koristi pgAdmin 4

Ako imaš problema sa psql, koristi **pgAdmin 4** (GUI tool):

1. Otvori **pgAdmin 4** iz Start menija
2. Connect na server (unesi lozinku)
3. Klikni na bazu `building_app`
4. **Tools** → **Query Tool**
5. Otvori fajl `scripts/02-schema.sql`
6. Klikni **Execute** (F5)

**Ovo je najlakše i ne zahtijeva command line!**

---

## Troubleshooting

### Problem: "password authentication failed"

**Rješenje:**
- Provjeri da li je lozinka tačna
- Provjeri da li korisnik `postgres` postoji
- Provjeri `pg_hba.conf` fajl (obično nije problem na Windows)

### Problem: "database does not exist"

**Rješenje:**
```sql
-- Prvo se poveži na postgres bazu
\c postgres

-- Zatim kreiraj bazu
CREATE DATABASE building_app;
```

### Problem: "connection refused"

**Rješenje:**
```powershell
# Provjeri da li je servis pokrenut
Get-Service -Name postgresql*

# Ako nije, pokreni ga
Start-Service -Name postgresql-x64-16
```

