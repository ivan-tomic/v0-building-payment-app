# Pokreni SQL Skripte - pgAdmin 4 Metoda

## Najlakši Način (Preporučeno) ✅

### Korak 1: Otvori pgAdmin 4

1. Otvori **pgAdmin 4** iz Windows Start menija
2. Prvi put možda traži master password - unesi bilo šta (možeš koristiti istu lozinku)
3. U lijevom panelu, proširi **Servers** → **PostgreSQL 16**
4. Desni klik → **Connect Server**
5. Unesi lozinku za `postgres` korisnika (lozinku koju si postavio tokom instalacije)

### Korak 2: Otvori Query Tool

1. U lijevom panelu, klikni na **Databases** → **building_app**
2. Na vrhu klikni na **Tools** → **Query Tool**
   - Ili desni klik na bazu → **Query Tool**

### Korak 3: Otvori SQL Skriptu

1. U Query Tool-u, klikni na **File** → **Open** (ili Ctrl+O)
2. Navigiraj do: `C:\Users\ivant\Projects\v0-building-payment-app\scripts\02-schema.sql`
3. Klikni **Open**

### Korak 4: Pokreni SQL

1. Provjeri da li je SQL kod vidljiv u editoru
2. Klikni na **Execute** gumb (ili pritisni **F5**)
3. Trebao bi vidjeti poruku: **"Query returned successfully"** ili **"Success. No rows returned"**

### Korak 5: Provjeri da li su tabele kreirane

1. U lijevom panelu, klikni desni klik na **building_app** → **Refresh**
2. Proširi **Schemas** → **public** → **Tables**
3. Trebao bi vidjeti tabele:
   - apartments
   - users
   - payments
   - expenses
   - late_fees
   - invitation_codes

---

## Provjera u Terminalu

Nakon što pokreneš SQL, provjeri:

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

## Ako Ne Znaš Lozinku za postgres

Ako si zaboravio lozinku, možeš je resetovati:

1. Otvori **Services** (Win+R → `services.msc`)
2. Pronađi **postgresql-x64-16**
3. Desni klik → **Stop**
4. U `C:\Program Files\PostgreSQL\16\data\` fajlu `pg_hba.conf`, promijeni:
   ```
   # Iz:
   host    all             all             127.0.0.1/32            scram-sha-256
   # U:
   host    all             all             127.0.0.1/32            trust
   ```
5. Restartuj servis
6. Connect bez lozinke
7. Promijeni lozinku:
   ```sql
   ALTER USER postgres WITH PASSWORD 'nova-lozinka';
   ```
8. Vrati `pg_hba.conf` na `scram-sha-256`

**Ali najlakše je samo da se setiš lozinke!** 😊

---

## Alternativa: Promijeni DATABASE_URL

Ako želiš koristiti `postgres` korisnika u aplikaciji:

Ažuriraj `.env.local`:
```env
DATABASE_URL=postgresql://postgres:TvojaLozinka@localhost:5432/building_app
```

Ali to nije preporučeno za development - bolje je dati permisije `building_app_user` korisniku nakon što su tabele kreirane.

---

## Gotovo!

Nakon što su tabele kreirane:

1. **Restartuj dev server** (ako je pokrenut)
2. Idi na: `http://localhost:3000/setup`
3. Kreiraj admin nalog
4. Uloguj se!

