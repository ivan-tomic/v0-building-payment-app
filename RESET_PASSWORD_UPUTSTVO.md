# Reset Admin Lozinke - Uputstvo

## Problem
Ne možeš se setiti admin lozinke za email: `tomic.ivan@gmail.com`

## Rješenja

### Opcija 1: Koristi Setup Stranicu (Najlakše) ✅

Ako još nemaš admin nalog ili želiš kreirati novi:

1. Idi na: `http://localhost:3000/setup`
2. Unesi:
   - **SETUP_KEY**: (iz `.env.local` fajla)
   - **Puno ime**: Tvoje ime
   - **Email**: `tomic.ivan@gmail.com`
   - **Lozinka**: Nova lozinka koju želiš
3. Klikni "Kreiraj admin nalog"

---

### Opcija 2: Reset Lozinke preko SQL Skripte

Ako imaš pristup PostgreSQL bazi direktno:

#### Korak 1: Generiši hash za novu lozinku

Kreiraj privremeni fajl `hash-password.js`:

```javascript
const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = 'tvoja-nova-lozinka'; // Promijeni ovo!
  const hash = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hash);
}

hashPassword();
```

Pokreni:
```bash
node hash-password.js
```

#### Korak 2: Update u bazi

Poveži se na bazu:
```bash
psql -U building_app_user -d building_app
```

Ili ako koristiš remote bazu:
```bash
psql "postgresql://building_app_user:localdev123@localhost:5432/building_app"
```

Zatim izvrši:
```sql
UPDATE users 
SET password_hash = 'PASTE_HASHED_PASSWORD_HERE'
WHERE email = 'tomic.ivan@gmail.com' AND role = 'admin';
```

---

### Opcija 3: Reset preko Node.js Skripte (Kada je baza dostupna)

Kada je PostgreSQL pokrenut i dostupan:

```bash
node scripts/reset-admin-password.js tvoja-nova-lozinka
```

**Napomena:** Ovo zahtijeva da je PostgreSQL pokrenut i da je `DATABASE_URL` tačan u `.env.local`.

---

## Provjera da li PostgreSQL radi

### Windows:
```powershell
# Provjeri da li je servis pokrenut
Get-Service -Name postgresql*

# Ili provjeri port
Test-NetConnection -ComputerName localhost -Port 5432
```

### Linux/Mac:
```bash
# Provjeri da li je pokrenut
sudo systemctl status postgresql

# Ili provjeri port
netstat -an | grep 5432
```

---

## Ako koristiš Remote Bazu (Hetzner)

Ažuriraj `DATABASE_URL` u `.env.local`:

```env
DATABASE_URL=postgresql://username:password@your-server-ip:5432/building_app?sslmode=require
```

Zatim pokreni reset skriptu ponovo.

---

## Najbrže Rješenje

**Ako aplikacija već radi**, najlakše je koristiti `/setup` stranicu:

1. Otvori: `http://localhost:3000/setup`
2. Unesi SETUP_KEY iz `.env.local`
3. Kreiraj novi admin nalog sa email-om `tomic.ivan@gmail.com`

---

## Pitanja?

Ako ništa od navedenog ne radi, provjeri:
- Da li je PostgreSQL pokrenut?
- Da li je `DATABASE_URL` tačan?
- Da li postoji baza `building_app`?
- Da li korisnik `building_app_user` ima pristup?

