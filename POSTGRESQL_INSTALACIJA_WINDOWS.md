# PostgreSQL Instalacija na Windows 11 - Kompletan Vodič

## Korak 1: Preuzmi PostgreSQL

### Opcija A: Official Installer (Preporučeno)

1. Idi na: https://www.postgresql.org/download/windows/
2. Klikni na "Download the installer"
3. Preuzmi **PostgreSQL 16** (najnovija stabilna verzija) ili **PostgreSQL 15**
4. Fajl će biti tipa: `postgresql-16.x-windows-x64.exe` (oko 200-300 MB)

### Opcija B: EnterpriseDB (Lakše)

1. Idi direktno na: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. Odaberi:
   - **Version**: 16.x (najnovija)
   - **Operating System**: Windows x86-64
3. Klikni "Download"

---

## Korak 2: Instalacija

### 2.1 Pokreni Installer

1. Desni klik na `.exe` fajl → "Run as administrator"
2. Ako Windows Defender pita, klikni "More info" → "Run anyway"

### 2.2 Setup Wizard

**Installation Directory:**
- Zadržaj default: `C:\Program Files\PostgreSQL\16`
- Ili odaberi custom lokaciju

**Select Components:**
- ✅ **PostgreSQL Server** (obavezno)
- ✅ **pgAdmin 4** (GUI tool - preporučeno)
- ✅ **Stack Builder** (opciono - za dodatne alate)
- ✅ **Command Line Tools** (obavezno)

**Data Directory:**
- Zadržaj default: `C:\Program Files\PostgreSQL\16\data`

**Password:**
- **VAŽNO:** Unesi jaku lozinku za `postgres` superuser
- **Zapamti ovu lozinku!** (npr. `PostgresAdmin123!`)
- Ova lozinka će ti trebati za pristup bazi

**Port:**
- Zadržaj default: `5432`
- Ovo je port koji aplikacija koristi

**Advanced Options:**
- **Locale:** Možeš ostaviti default ili odabrati `Serbian, Serbia` ako želiš

**Pre Installation Summary:**
- Provjeri sve opcije
- Klikni "Next"

**Ready to Install:**
- Klikni "Next"
- Instalacija će trajati 2-5 minuta

**Completing the PostgreSQL Setup:**
- ✅ Ostavi "Launch Stack Builder" unchecked (ne treba nam)
- Klikni "Finish"

---

## Korak 3: Provjera Instalacije

### 3.1 Provjeri da li je servis pokrenut

**PowerShell (kao Administrator):**
```powershell
Get-Service -Name postgresql*
```

Trebao bi vidjeti nešto kao:
```
Status   Name               DisplayName
------   ----               -----------
Running  postgresql-x64-16 PostgreSQL 16
```

Ako nije "Running", pokreni ga:
```powershell
Start-Service -Name postgresql-x64-16
```

### 3.2 Testiraj konekciju

**PowerShell:**
```powershell
# Provjeri da li port 5432 sluša
Test-NetConnection -ComputerName localhost -Port 5432
```

Trebao bi vidjeti: `TcpTestSucceeded : True`

---

## Korak 4: Kreiraj Bazu za Aplikaciju

### 4.1 Otvori pgAdmin 4 (GUI Tool)

1. Otvori **pgAdmin 4** iz Start menija
2. Prvi put će tražiti master password za pgAdmin - unesi nešto (možeš koristiti istu lozinku)
3. U lijevom panelu, klikni na **Servers** → **PostgreSQL 16**
4. Klikni desni klik → **Connect Server**
5. Unesi lozinku koju si postavio tokom instalacije

### 4.2 Kreiraj Bazu (preko pgAdmin)

1. Desni klik na **Databases** → **Create** → **Database...**
2. Unesi:
   - **Database name**: `building_app`
   - **Owner**: `postgres` (default)
3. Klikni "Save"

### 4.3 Kreiraj Korisnika (opciono, ali preporučeno)

1. Desni klik na **Login/Group Roles** → **Create** → **Login/Group Role...**
2. **General** tab:
   - **Name**: `building_app_user`
3. **Definition** tab:
   - **Password**: `localdev123` (ili nešto drugo)
4. **Privileges** tab:
   - ✅ **Can login?**
   - ✅ **Create databases?**
5. Klikni "Save"

6. Desni klik na bazu `building_app` → **Properties**
7. **Security** tab → **Add** → odaberi `building_app_user` → dodeli sve privilegije

---

## Korak 5: Ažuriraj `.env.local`

Otvori `.env.local` i ažuriraj `DATABASE_URL`:

### Ako koristiš `postgres` korisnika:
```env
DATABASE_URL=postgresql://postgres:TvojaLozinka@localhost:5432/building_app
```

### Ako si kreirao `building_app_user`:
```env
DATABASE_URL=postgresql://building_app_user:localdev123@localhost:5432/building_app
```

**Zamijeni:**
- `TvojaLozinka` sa lozinkom koju si postavio tokom instalacije
- `localdev123` sa lozinkom koju si postavio za `building_app_user`

---

## Korak 6: Pokreni SQL Skripte

### 6.1 Preko pgAdmin

1. U pgAdmin, klikni na bazu `building_app`
2. Klikni na **Tools** → **Query Tool**
3. Otvori fajl `scripts/02-schema.sql`
4. Kopiraj sve i paste u Query Tool
5. Klikni **Execute** (F5)

### 6.2 Preko Command Line (psql)

**PowerShell:**
```powershell
# Navigiraj do PostgreSQL bin direktorija
cd "C:\Program Files\PostgreSQL\16\bin"

# Poveži se na bazu
.\psql.exe -U postgres -d building_app

# Unesi lozinku kada zatraži
```

Zatim u psql promptu:
```sql
\i C:/Users/ivant/Projects/v0-building-payment-app/scripts/02-schema.sql
```

Ili direktno:
```powershell
.\psql.exe -U postgres -d building_app -f "C:\Users\ivant\Projects\v0-building-payment-app\scripts\02-schema.sql"
```

---

## Korak 7: Testiraj Aplikaciju

1. Restartuj dev server:
   ```bash
   npm run dev
   ```

2. Otvori: `http://localhost:3000`

3. Ako vidiš aplikaciju, sve radi! ✅

---

## Troubleshooting

### Problem: "Service won't start"

**Rješenje:**
```powershell
# Provjeri logove
Get-Content "C:\Program Files\PostgreSQL\16\data\log\*.log" -Tail 50

# Pokušaj ručno pokrenuti
cd "C:\Program Files\PostgreSQL\16\bin"
.\pg_ctl.exe -D "C:\Program Files\PostgreSQL\16\data" start
```

### Problem: "Port 5432 already in use"

**Rješenje:**
```powershell
# Provjeri šta koristi port
netstat -ano | findstr :5432

# Ako je neki drugi proces, promijeni port u PostgreSQL konfiguraciji
# Ili zaustavi taj proces
```

### Problem: "Authentication failed"

**Rješenje:**
- Provjeri da li je lozinka tačna u `DATABASE_URL`
- Provjeri da li korisnik postoji i ima pristup bazi

### Problem: "Database doesn't exist"

**Rješenje:**
- Kreiraj bazu `building_app` preko pgAdmin ili:
```sql
CREATE DATABASE building_app;
```

---

## Korisne Komande

### Pokreni/zaustavi PostgreSQL servis:
```powershell
Start-Service -Name postgresql-x64-16
Stop-Service -Name postgresql-x64-16
Restart-Service -Name postgresql-x64-16
```

### Poveži se na bazu preko psql:
```powershell
cd "C:\Program Files\PostgreSQL\16\bin"
.\psql.exe -U postgres -d building_app
```

### Provjeri verziju:
```sql
SELECT version();
```

### Lista svih baza:
```sql
\l
```

### Lista svih tabela:
```sql
\dt
```

---

## Sljedeći Koraci

Nakon što je sve instalirano i konfigurisano:

1. ✅ Pokreni SQL skripte (`scripts/02-schema.sql`)
2. ✅ Ažuriraj `.env.local` sa tačnim `DATABASE_URL`
3. ✅ Restartuj dev server
4. ✅ Idi na `/setup` i kreiraj admin nalog
5. ✅ Testiraj aplikaciju!

---

## Alternativa: Docker (Ako želiš)

Ako imaš Docker Desktop instaliran, možeš koristiti:

```bash
docker run --name postgres-building-app -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=building_app -p 5432:5432 -d postgres:16
```

Ali za početak, preporučujem standardnu instalaciju jer je lakša za setup.

---

## Pitanja?

Ako naiđeš na probleme tokom instalacije, javi mi i pomoći ću ti!

