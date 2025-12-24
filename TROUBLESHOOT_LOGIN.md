# Troubleshooting Login Problema

## Trenutna Situacija

✅ **Admin korisnik postoji u bazi:**
- Email: `tomic.ivan@gmail.com`
- Ime: Ivan Tomic
- Status: Aktivan

## Mogući Problemi i Rješenja

### Problem 1: "Pogrešna lozinka" ili "Korisnik nije pronađen"

**Rješenje: Resetuj lozinku**

Pokreni reset skriptu:
```powershell
node scripts/reset-admin-password.js nova-lozinka
```

Zatim se uloguj sa:
- Email: `tomic.ivan@gmail.com`
- Lozinka: `nova-lozinka` (ili šta si postavio)

---

### Problem 2: Prijava radi, ali se ne redirectuje

Ako vidiš da se prijava "uspješno" završava, ali ostaješ na `/auth/signin` stranici:

**Provjeri:**
1. Browser konzola (F12) - da li ima JavaScript greške?
2. Network tab - da li `/api/user/profile` vraća podatke?

**Rješenje:**
- Hard refresh stranice (Ctrl+Shift+R)
- Pokušaj direktno: `http://localhost:3000/admin`

---

### Problem 3: "Invalid credentials" ili slična greška

**Provjeri:**
1. Da li je email tačan: `tomic.ivan@gmail.com` (bez razmaka)
2. Da li je lozinka tačna (možda imaš typing error)

**Rješenje:**
- Resetuj lozinku preko skripte
- Pokušaj ponovo

---

### Problem 4: Sesija se ne čuva

Ako se nakon uspješne prijave opet vraća na login stranicu:

**Provjeri:**
1. Da li je `NEXTAUTH_SECRET` postavljen u `.env.local`?
2. Da li su cookies omogućeni u browseru?

**Rješenje:**
- Provjeri `.env.local` - mora biti `NEXTAUTH_SECRET=...`
- Restartuj dev server

---

## Brzi Test

### Korak 1: Resetuj lozinku na nešto jednostavno

```powershell
node scripts/reset-admin-password.js test1234
```

### Korak 2: Pokušaj se ulogovati

- Email: `tomic.ivan@gmail.com`
- Lozinka: `test1234`

### Korak 3: Ako i dalje ne radi

Provjeri browser konzolu (F12) za greške.

---

## Najčešći Problem

**Najvjerovatnije:** Ne znaš lozinku koju si postavio pri kreiranju admin naloga.

**Rješenje:**
1. Resetuj lozinku: `node scripts/reset-admin-password.js moja-nova-lozinka`
2. Uloguj se sa tom lozinkom

