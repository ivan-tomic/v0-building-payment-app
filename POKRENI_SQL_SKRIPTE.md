# Kako da Pokreneš SQL Skripte

## Problem
Tabele ne postoje u bazi, što uzrokuje 500 grešku.

## Rješenje: Pokreni SQL Skripte

### Opcija 1: Preko pgAdmin 4 (NAJLAKŠE) ✅

1. **Otvori pgAdmin 4** iz Start menija
2. **Connect** na server (unesi lozinku)
3. U lijevom panelu, klikni na **Databases** → **building_app**
4. Klikni na **Tools** → **Query Tool** (ili F5)
5. **Otvori fajl**: `scripts/02-schema.sql`
   - File → Open → Navigiraj do `C:\Users\ivant\Projects\v0-building-payment-app\scripts\02-schema.sql`
6. **Execute** (F5 ili klikni na Execute gumb)
7. Trebao bi vidjeti poruku "Query returned successfully"

**Gotovo!** ✅

---

### Opcija 2: Preko Command Line (psql)

**Korak 1:** Navigiraj do PostgreSQL bin direktorija:
```powershell
cd "C:\Program Files\PostgreSQL\16\bin"
```

**Korak 2:** Pokreni SQL skriptu:
```powershell
.\psql.exe -U postgres -d building_app -f "C:\Users\ivant\Projects\v0-building-payment-app\scripts\02-schema.sql"
```

**Korak 3:** Unesi lozinku kada zatraži

---

### Opcija 3: Direktno kopiraj SQL u pgAdmin

1. Otvori `scripts/02-schema.sql` u bilo kojem text editoru
2. Kopiraj SAV sadržaj (Ctrl+A, Ctrl+C)
3. U pgAdmin, otvori Query Tool
4. Paste SQL kod (Ctrl+V)
5. Execute (F5)

---

## Provjera da li je uspješno

Nakon pokretanja skripte, provjeri:

```powershell
node scripts/check-database.js
```

Trebao bi vidjeti:
```
✅ Konekcija uspješna!
✅ Tabela "users" postoji
📋 Sve tabele u bazi:
   - apartments
   - expenses
   - invitation_codes
   - late_fees
   - payments
   - users
```

---

## Nakon što su tabele kreirane

1. **Restartuj dev server** (ako je pokrenut):
   - Zaustavi sa Ctrl+C
   - Pokreni ponovo: `npm run dev`

2. **Idi na setup stranicu**:
   - `http://localhost:3000/setup`
   - Kreiraj admin nalog

3. **Uloguj se**:
   - `http://localhost:3000/auth/signin`

---

## Troubleshooting

### Problem: "Permission denied"

**Rješenje:**
- Provjeri da li korisnik `building_app_user` ima pristup bazi
- Ili koristi `postgres` korisnika umjesto `building_app_user`

### Problem: "Table already exists"

**Rješenje:**
- To je OK! Skripta koristi `CREATE TABLE IF NOT EXISTS`
- Možeš nastaviti

### Problem: "Syntax error"

**Rješenje:**
- Provjeri da li koristiš tačan fajl: `scripts/02-schema.sql`
- Ne koristi `01-init-schema.sql` (to je stara verzija)

---

## Najbrže Rješenje

**Preporučujem pgAdmin 4 metodu** - najlakše i najsigurnije!

