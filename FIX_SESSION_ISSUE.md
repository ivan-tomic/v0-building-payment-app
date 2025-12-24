# Rješavanje Problema sa Sesijom

## Problem

Prijava je uspješna, ali se sesija gubi i vraća na login stranicu.

## Mogući Uzroci

### 1. Hydration Mismatch (Vidljivo u konzoli)

React hydration warning može uzrokovati probleme sa sesijom.

**Rješenje:** Ignorišemo za sada - nije kritično.

---

### 2. Cookies se ne čuvaju

**Provjeri u browseru (F12 → Application → Cookies):**
- Da li postoji `next-auth.session-token` cookie?
- Da li je `httpOnly: true`?
- Da li je `Secure: false` (za localhost)?

**Ako nema cookie:**
- Provjeri da li su cookies omogućeni u browseru
- Pokušaj u incognito modu (da isključiš ekstenzije)

---

### 3. NEXTAUTH_SECRET problem

**Provjeri `.env.local`:**
```env
NEXTAUTH_SECRET=local-development-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

**Ako je NEXTAUTH_SECRET promijenjen:**
- Svi postojeći cookie-i neće raditi
- Clear cookies i prijavi se ponovo

---

### 4. Browser Ekstenzije

Neke ekstenzije (adblocker, privacy tools) mogu blokirati cookies.

**Rješenje:**
- Pokušaj u incognito modu
- Onemogući ekstenzije privremeno

---

## Brzo Rješenje

### Korak 1: Clear Cookies i Cache

1. Otvori DevTools (F12)
2. Application tab → Cookies → localhost:3000
3. Obriši sve cookies
4. Application tab → Local Storage → localhost:3000
5. Obriši sve
6. Hard refresh (Ctrl+Shift+R)

### Korak 2: Pokušaj Ponovo

1. Idi na: `http://localhost:3000/auth/signin`
2. Uloguj se sa:
   - Email: `tomic.ivan@gmail.com`
   - Lozinka: (lozinka koju si postavio reset skriptom)

### Korak 3: Provjeri Network Tab

U DevTools → Network tab:
- Provjeri da li `GET /api/auth/session` vraća user podatke
- Provjeri da li postoji `Set-Cookie` header u response-u

---

## Alternativno Rješenje: Provjeri Session u Browseru

Otvori browser console (F12) i pokreni:

```javascript
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```

Ako vidiš `{ user: {...} }`, sesija radi!
Ako vidiš `{}`, sesija se ne čuva.

---

## Ako Ništa Ne Pomaže

Možda je problem sa React hydration. Pokušaj:

1. **Restartuj dev server**
2. **Clear browser cache**
3. **Pokušaj u drugom browseru** (Chrome, Firefox, Edge)

---

## Debug Informacije

Ako i dalje ne radi, provjeri:

1. Browser console - ima li grešaka?
2. Network tab - šta vraća `/api/auth/session`?
3. Cookies - postoji li `next-auth.session-token`?

Javi šta vidiš i pomoći ću ti dalje!

