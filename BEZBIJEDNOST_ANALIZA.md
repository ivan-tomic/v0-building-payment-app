# Analiza Bezbijednosti i Ranjivosti

## Identifikovane Ranjivosti

### 1. **Next.js 16.0.3 - CRITICAL** ✅ POPRAVLJENO

**Ranjivost:**
- **GHSA-9qr9-h5gf-34mp**: RCE (Remote Code Execution) u React flight protocol
- **GHSA-w37m-7fhw-fmv9**: Server Actions Source Code Exposure
- **GHSA-mwv6-3258-q52c**: Denial of Service sa Server Components

**CVSS Score:** 10.0 (Critical)

**Rješenje:**
- Ažurirano na `next@^16.1.1` u `package.json`
- Potrebno pokrenuti: `npm install` ili `npm update next`

---

### 2. **drizzle-kit 0.30.0 - MODERATE** ✅ POPRAVLJENO

**Ranjivost:**
- **esbuild** dependency sa ranjivostima (CWE-346)
- Omogućava bilo kom sajtu da šalje zahtjeve development serveru

**CVSS Score:** 5.3 (Moderate)

**Rješenje:**
- Ažurirano na `drizzle-kit@^0.31.8` u `package.json`
- Potrebno pokrenuti: `npm install` ili `npm update drizzle-kit`

---

## React Komponente - Analiza

### Provjera za Česte Ranjivosti

#### 1. **XSS (Cross-Site Scripting)**
✅ **Sigurno:**
- Next.js automatski escape-uje sve React komponente
- Nema direktnog `dangerouslySetInnerHTML` korištenja
- Svi user inputi se prikazuju kroz React JSX (automatski sanitizovano)

#### 2. **SQL Injection**
✅ **Sigurno:**
- Koristi se Drizzle ORM sa parametrizovanim queries
- Nema direktnih SQL string concatenations
- Primjer: `db.select().from(users).where(eq(users.email, credentials.email))`

#### 3. **Authentication & Authorization**
✅ **Dobro implementirano:**
- NextAuth.js za autentifikaciju
- JWT tokeni sa 30-dnevnom expiracijom
- Role-based access control (admin vs tenant)
- Session provjera na svim API rutama

**Primjer provjere:**
```typescript
const session = await getServerSession(authOptions)
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
if (session.user.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

#### 4. **Password Security**
✅ **Dobro implementirano:**
- bcryptjs sa salt rounds (default 10)
- Lozinke se nikad ne čuvaju u plain text
- Minimalna dužina lozinke: 8 karaktera (u setup formi)

**Primjer:**
```typescript
const hashedPassword = await bcrypt.hash(password, 10)
```

#### 5. **CSRF (Cross-Site Request Forgery)**
✅ **Zaštićeno:**
- NextAuth.js automatski implementira CSRF zaštitu
- JWT tokeni se čuvaju u httpOnly cookies
- SameSite cookie atributi

#### 6. **Input Validation**
⚠️ **Može se poboljšati:**
- Neki API endpoints nemaju eksplicitnu validaciju (oslanjaju se na Drizzle schema)
- Preporuka: Dodati Zod validaciju za sve API inpute

**Primjer poboljšanja:**
```typescript
import { z } from 'zod'

const paymentSchema = z.object({
  apartment_id: z.number().int().positive(),
  amount: z.string().regex(/^\d+\.\d{2}$/),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
})

// U API ruti:
const validated = paymentSchema.parse(body)
```

#### 7. **Rate Limiting**
⚠️ **Nedostaje:**
- Nema rate limiting na API rutama
- Preporuka: Dodati rate limiting za login/signup endpoints

**Preporučeno rješenje:**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 s"),
})
```

#### 8. **Environment Variables**
✅ **Dobro:**
- `NEXTAUTH_SECRET` se koristi za JWT signing
- `DATABASE_URL` za Postgres konekciju
- `SETUP_KEY` za admin setup
- Sve su u `.env` fajlu (ne commitovano u git)

**Preporuka:**
- Osigurati da su sve env varijable postavljene u production
- Koristiti `.env.example` za dokumentaciju

---

## Preporuke za Poboljšanje

### Visok Prioritet

1. **Ažurirati dependencies** ✅ (Urađeno)
   - `npm install` nakon izmjena u `package.json`

2. **Dodati input validaciju**
   - Zod schemas za sve API endpoints
   - Validacija na frontendu i backendu

3. **Rate limiting**
   - Za `/api/auth/signin` i `/api/auth/signup`
   - Za `/api/setup` (sprečiti brute force)

### Srednji Prioritet

4. **HTTPS enforcement**
   - Osigurati da aplikacija radi samo preko HTTPS u production
   - HSTS headers

5. **Security headers**
   - Content-Security-Policy
   - X-Frame-Options
   - X-Content-Type-Options

6. **Logging i monitoring**
   - Logovati sve autentifikacione pokušaje
   - Alert za sumnjive aktivnosti

### Nizak Prioritet

7. **2FA (Two-Factor Authentication)**
   - Opciono za admin naloge

8. **Password policy**
   - Kompleksnija pravila (velika/mala slova, brojevi, znakovi)

---

## Checklist za Production Deployment

- [x] Ažurirati Next.js na najnoviju verziju
- [x] Ažurirati drizzle-kit na najnoviju verziju
- [ ] Dodati Zod validaciju za API endpoints
- [ ] Implementirati rate limiting
- [ ] Osigurati HTTPS u production
- [ ] Postaviti security headers
- [ ] Provjeriti sve environment variables
- [ ] Testirati autentifikaciju i autorizaciju
- [ ] Backup strategija za bazu podataka
- [ ] Monitoring i alerting setup

---

## Dodatne Napomene

### Supabase Uklanjanje ✅

- Sve reference na Supabase su uklonjene iz SQL skripti
- Aplikacija koristi samo direktan Postgres konekciju
- NextAuth.js za autentifikaciju (ne Supabase Auth)
- Nema external dependencies na Supabase servise

### Database Security

- Postgres konekcija koristi SSL u production (`ssl: { rejectUnauthorized: false }`)
- Connection pooling (max 10 connections)
- Nema direktnih SQL queries (sve preko Drizzle ORM)

### Session Management

- JWT tokeni sa 30-dnevnom expiracijom
- HttpOnly cookies (ne pristupačni iz JavaScript)
- Secure cookies u production (HTTPS only)

---

## Zaključak

Aplikacija ima **dobar osnov za bezbijednost**, ali ima prostora za poboljšanja:

✅ **Jako:**
- NextAuth.js autentifikacija
- Drizzle ORM (sprečava SQL injection)
- React automatski XSS zaštita
- Password hashing sa bcrypt

⚠️ **Može se poboljšati:**
- Input validacija (Zod)
- Rate limiting
- Security headers
- Logging i monitoring

**Ukupna ocjena bezbijednosti: 7/10**

