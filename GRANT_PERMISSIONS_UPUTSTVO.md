# Daj Permisije building_app_user Korisniku

## Problem
Tabele postoje, ali `building_app_user` nema dozvole da pristupa tabelama.

## Rješenje: Pokreni GRANT Permisije

### Metoda 1: Preko pgAdmin 4 (Preporučeno)

1. **Otvori pgAdmin 4**
2. **Connect** na server sa **postgres** korisnikom
3. Klikni na bazu **building_app**
4. **Tools** → **Query Tool**
5. Otvori fajl: `scripts/grant-permissions.sql`
6. **Execute** (F5)

**Gotovo!** ✅

---

### Metoda 2: Preko Command Line

```powershell
cd "C:\Program Files\PostgreSQL\16\bin"
.\psql.exe -U postgres -d building_app -f "C:\Users\ivant\Projects\v0-building-payment-app\scripts\grant-permissions.sql"
```

Unesi lozinku za `postgres` korisnika.

---

### Metoda 3: Direktno Kopiraj SQL

Otvori `scripts/grant-permissions.sql` i kopiraj SQL kod, zatim:

1. U pgAdmin, Query Tool
2. Paste SQL
3. Execute

---

## Provjera

Nakon što pokreneš SQL, provjeri:

```powershell
node scripts/check-database.js
```

Ako sve radi, trebao bi vidjeti:
```
✅ Konekcija uspješna!
✅ Tabela "users" postoji
📊 Broj admin naloga: 0
```

---

## Alternativa: Promijeni DATABASE_URL

Ako želiš brzo rješenje, možeš koristiti `postgres` korisnika u aplikaciji:

Ažuriraj `.env.local`:
```env
DATABASE_URL=postgresql://postgres:TvojaLozinka@localhost:5432/building_app
```

Ali bolje je dati permisije `building_app_user` korisniku.

---

## Nakon Grant Permisija

1. **Restartuj dev server** (Ctrl+C i ponovo `npm run dev`)
2. Idi na: `http://localhost:3000/setup`
3. Kreiraj admin nalog
4. Uloguj se!

