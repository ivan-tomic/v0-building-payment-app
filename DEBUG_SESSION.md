# Debug Sesije - Koraci

## Ispravna Komanda za Console

U browser Console tab-u, pokreni:

```javascript
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```

**Napomena:** Mora biti sa `/` na početku: `/api/auth/session`

---

## Šta Očekivati

### Ako si ULOGOVAN:
```javascript
{
  user: {
    id: "1",
    email: "tomic.ivan@gmail.com",
    name: "Ivan Tomic",
    role: "admin",
    apartmentId: null
  },
  expires: "2025-01-23T..."
}
```

### Ako NISI ulogovan:
```javascript
{}
```

---

## Alternativno: Provjeri Network Tab

1. **F12** → **Network** tab
2. **Refresh stranicu** (F5)
3. Pronađi `/api/auth/session` request
4. Klikni na njega
5. Idi na **Response** tab
6. Vidi šta vraća

---

## Problem sa Hydration

Vidim hydration warning u konzoli. To može uzrokovati probleme sa sesijom.

**Hydration warning je zbog:**
- Browser ekstenzija (npr. LanguageTool dodaje `data-lt-installed="true"`)
- To nije kritično, ali može uzrokovati probleme

**Možemo ignorisati za sada.**

---

## Provjeri Cookies

1. **F12** → **Application** tab
2. **Cookies** → `http://localhost:3000`
3. Provjeri da li postoji:
   - `next-auth.session-token` (ili slično)
   - `next-auth.csrf-token`

---

## Ako Sesija Vraća `{}`

To znači da sesija nije sačuvana. Mogući uzroci:

1. **Cookies su blokirani**
2. **NEXTAUTH_SECRET je promijenjen**
3. **Browser ekstenzije blokiraju cookies**

**Rješenje:**
- Clear cookies i cache
- Pokušaj u incognito modu
- Onemogući ekstenzije privremeno

---

## Ako Sesija Vraća User Podatke Ali Se I Dalje Redirectuje

Tada je problem u React komponenti, ne u sesiji.

Provjeri:
- Da li `ProtectedRoute` komponenta pravilno čita sesiju
- Da li postoji race condition između session loading i redirect

