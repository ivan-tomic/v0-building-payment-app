# Kako da se uloguješ - Uputstvo

## Situacija 1: Nemaš admin nalog (najčešće)

### Korak 1: Idi na Setup stranicu

Otvori u browseru:
```
http://localhost:3000/setup
```

### Korak 2: Popuni formu

1. **SETUP_KEY**: 
   - Ovo je ključ iz `.env.local` fajla
   - Traži liniju: `SETUP_KEY=...`
   - Kopiraj vrijednost nakon `=`
   - Ako ne postoji, dodaj u `.env.local`:
     ```env
     SETUP_KEY=moj-secret-setup-key-123
     ```
     (Može biti bilo koji string, ali treba biti isti u `.env.local` i u formi)

2. **Puno ime**: 
   - Unesi svoje ime (npr. "Ivan Tomic")

3. **Email**: 
   - Unesi email (npr. `tomic.ivan@gmail.com`)

4. **Lozinka**: 
   - Unesi lozinku koju želiš (minimalno 8 karaktera)
   - **Zapamti ovu lozinku!**

### Korak 3: Klikni "Kreiraj admin nalog"

Ako je sve uspješno, bićeš preusmjeren na `/auth/signin` stranicu.

---

## Situacija 2: Već postoji admin nalog

Ako već imaš admin nalog ali ne znaš lozinku:

### Opcija A: Resetuj lozinku (preko SQL)

1. Pokreni reset skriptu:
   ```bash
   node scripts/reset-admin-password.js nova-lozinka
   ```

2. Ili direktno u bazi (preko pgAdmin ili psql):
   ```sql
   -- Prvo generiši hash (koristi Node.js skriptu ili online tool)
   -- Zatim update:
   UPDATE users 
   SET password_hash = 'HASHED_PASSWORD_HERE'
   WHERE email = 'tomic.ivan@gmail.com' AND role = 'admin';
   ```

### Opcija B: Kreiraj novi admin nalog

Možeš kreirati novi admin nalog preko `/setup` stranice sa drugim email-om.

---

## Nakon kreiranja admin naloga

### Korak 1: Idi na prijavu

Otvori:
```
http://localhost:3000/auth/signin
```

### Korak 2: Unesi credentials

- **Email**: Email koji si unio u setup formi (npr. `tomic.ivan@gmail.com`)
- **Lozinka**: Lozinka koju si postavio

### Korak 3: Klikni "Prijavi se"

Bićeš preusmjeren na admin dashboard (`/admin`).

---

## Provjera SETUP_KEY

Ako ne znaš SETUP_KEY:

1. Otvori `.env.local` fajl u root direktoriju projekta
2. Traži liniju: `SETUP_KEY=...`
3. Ako ne postoji, dodaj:
   ```env
   SETUP_KEY=moj-secret-key-123
   ```
4. Restartuj dev server nakon izmjene

---

## Troubleshooting

### Problem: "Neispravan setup ključ"

**Rješenje:**
- Provjeri da li je SETUP_KEY u `.env.local` isti kao u formi
- Provjeri da li imaš razmake ili posebne karaktere
- Restartuj dev server nakon izmjene `.env.local`

### Problem: "Admin već postoji"

**Rješenje:**
- Ako već postoji admin, ne možeš kreirati novi preko `/setup`
- Koristi reset password skriptu ili se uloguj sa postojećim credentials

### Problem: "Email već postoji"

**Rješenje:**
- Email mora biti jedinstven
- Koristi drugi email ili resetuj postojeći nalog

---

## Brzi Test

1. Otvori: `http://localhost:3000/setup`
2. Ako vidiš formu → nema admin naloga, možeš kreirati
3. Ako vidiš "Admin nalog već postoji" → koristi reset password

---

## Preporuka

**Najlakše je:**
1. Provjeri da li postoji `SETUP_KEY` u `.env.local`
2. Idi na `/setup` stranicu
3. Kreiraj novi admin nalog
4. Uloguj se na `/auth/signin`

