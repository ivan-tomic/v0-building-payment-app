# Detaljni Sekvencijski Dijagrami Tokova

## 1. Početno Podešavanje Sistema (Setup)

### Scenario: Admin kreira prvi nalog

```
Korisnik (Browser)
    │
    ├─> GET /setup
    │   └─> Frontend: SetupPage komponenta
    │       └─> GET /api/setup/check
    │           └─> Backend: Provjera da li postoji admin u bazi
    │               └─> SELECT * FROM users WHERE role = 'admin'
    │                   └─> Return: { hasAdmin: false }
    │
    ├─> POST /api/setup
    │   Body: { email, password, fullName, setupKey }
    │   └─> Backend: Validacija SETUP_KEY (env varijabla)
    │       ├─> IF setupKey !== process.env.SETUP_KEY
    │       │   └─> Return 401: "Neispravan setup ključ"
    │       │
    │       ├─> Provjera da li već postoji admin
    │       │   └─> SELECT * FROM users WHERE role = 'admin'
    │       │       └─> IF exists → Return 400: "Admin već postoji"
    │       │
    │       ├─> Hash lozinke: bcrypt.hash(password, 10)
    │       │
    │       └─> INSERT INTO users (email, password_hash, full_name, role)
    │           VALUES (email, hashedPassword, fullName, 'admin')
    │           └─> Return 200: { success: true }
    │
    └─> Redirect → /auth/signin
```

---

## 2. Registracija Stanara (Invitation Flow)

### Scenario: Admin generiše pozivnicu, stanar se registruje

```
ADMIN FLOW:
Admin (Browser)
    │
    ├─> GET /admin/tenants
    │   └─> Frontend: AdminTenantsPage
    │       ├─> GET /api/users?role=tenant
    │       │   └─> Backend: SELECT users.*, apartments.*
    │       │       FROM users LEFT JOIN apartments
    │       │       WHERE users.role = 'tenant'
    │       │
    │       └─> GET /api/apartments
    │           └─> Backend: SELECT * FROM apartments ORDER BY ...
    │
    ├─> Klik: "Generiši kod"
    │   └─> POST /api/invitations
    │       Body: { apartmentId: 5, expiresInDays: 90 }
    │       └─> Backend:
    │           ├─> Provjera sesije (NextAuth)
    │           │   └─> IF role !== 'admin' → Return 403
    │           │
    │           ├─> Provjera da li stan postoji
    │           │   └─> SELECT * FROM apartments WHERE id = apartmentId
    │           │
    │           ├─> Deaktivacija starih kodova za taj stan
    │           │   └─> UPDATE invitation_codes
    │           │       SET is_active = false
    │           │       WHERE apartment_id = apartmentId AND is_active = true
    │           │
    │           ├─> Generisanje novog koda: randomBytes(4).toString('hex').toUpperCase()
    │           │   └─> Npr: "A1B2C3D4"
    │           │
    │           └─> INSERT INTO invitation_codes
    │               (code, apartment_id, created_by, expires_at, is_active)
    │               VALUES (code, apartmentId, adminUserId, expiresAt, true)
    │               └─> Return 200: { code: "A1B2C3D4", apartmentNumber: 5, ... }
    │
    └─> Admin kopira kod i šalje stanaru (email/Viber/štampa)

TENANT REGISTRATION FLOW:
Stanar (Browser)
    │
    ├─> GET /auth/signup
    │   └─> Frontend: SignupPage komponenta
    │
    ├─> POST /api/auth/signup
    │   Body: { invitationCode, email, password, fullName }
    │   └─> Backend:
    │       ├─> Validacija pozivnog koda
    │       │   └─> SELECT * FROM invitation_codes
    │       │       WHERE code = invitationCode AND is_active = true
    │       │       └─> IF not found → Return 400: "Neispravan kod"
    │       │       └─> IF expires_at < NOW() → Return 400: "Kod je istekao"
    │       │       └─> IF used_by IS NOT NULL → Return 400: "Kod je već korišten"
    │       │
    │       ├─> Provjera da li email već postoji
    │       │   └─> SELECT * FROM users WHERE email = email
    │       │       └─> IF exists → Return 400: "Email već postoji"
    │       │
    │       ├─> Hash lozinke: bcrypt.hash(password, 10)
    │       │
    │       ├─> INSERT INTO users
    │       │   (email, password_hash, full_name, role, apartment_id)
    │       │   VALUES (email, hashedPassword, fullName, 'tenant', invitationCode.apartmentId)
    │       │   └─> Return: newUser
    │       │
    │       └─> UPDATE invitation_codes
    │           SET used_by = newUser.id, used_at = NOW(), is_active = false
    │           WHERE code = invitationCode
    │           └─> Return 200: { success: true }
    │
    └─> Redirect → /auth/signin
```

---

## 3. Prijava (Login Flow)

### Scenario: Korisnik se prijavljuje

```
Korisnik (Browser)
    │
    ├─> GET /auth/signin
    │   └─> Frontend: SigninPage komponenta
    │
    ├─> POST /api/auth/[...nextauth] (NextAuth endpoint)
    │   Body: { email, password }
    │   └─> NextAuth: CredentialsProvider.authorize()
    │       └─> Backend (lib/auth.ts):
    │           ├─> SELECT * FROM users WHERE email = email
    │           │   └─> IF not found → Throw Error: "Korisnik nije pronađen"
    │           │
    │           ├─> IF is_active = false → Throw Error: "Nalog je deaktiviran"
    │           │
    │           ├─> bcrypt.compare(password, user.password_hash)
    │           │   └─> IF invalid → Throw Error: "Pogrešna lozinka"
    │           │
    │           └─> Return user object:
    │               { id, email, name: fullName, role, apartmentId }
    │               └─> NextAuth kreira JWT token
    │
    ├─> NextAuth: jwt() callback
    │   └─> Dodaje { id, role, apartmentId } u token
    │
    ├─> NextAuth: session() callback
    │   └─> Dodaje user data u session object
    │
    └─> Redirect na osnovu role:
        ├─> IF role === 'admin' → /admin
        └─> IF role === 'tenant' → /tenant
```

---

## 4. Admin Dodaje Uplatu

### Scenario: Admin unosi novu uplatu za stan

```
Admin (Browser)
    │
    ├─> GET /admin/payments
    │   └─> Frontend: AdminPaymentsPage
    │       ├─> GET /api/payments?month=11&year=2024
    │       │   └─> Backend: GET /api/payments/route.ts
    │       │       ├─> Provjera sesije (NextAuth)
    │       │       │   └─> IF not authenticated → Return 401
    │       │       │
    │       │       ├─> SELECT * FROM payments
    │       │       │   WHERE month = 11 AND year = 2024
    │       │       │   └─> Za tenant: dodaje WHERE apartment_id = session.user.apartmentId
    │       │       │
    │       │       └─> Return 200: [payments array]
    │       │
    │       └─> GET /api/apartments
    │           └─> Backend: SELECT * FROM apartments ORDER BY ...
    │
    ├─> Klik: "Dodaj plaćanje"
    │   └─> Frontend: AddPaymentForm modal
    │
    ├─> POST /api/payments
    │   Body: {
    │     apartment_id: 5,
    │     amount: "0.20",
    │     payment_date: "2024-11-15",
    │     month: 11,
    │     year: 2024,
    │     payment_method: "Transfer",
    │     notes: "Uplata za novembar"
    │   }
    │   └─> Backend: POST /api/payments/route.ts
    │       ├─> Provjera sesije
    │       │   └─> IF role !== 'admin' → Return 403
    │       │
    │       ├─> Validacija: IF missing required fields → Return 400
    │       │
    │       ├─> Provjera unique constraint (apartment_id, month, year)
    │       │   └─> SELECT * FROM payments
    │       │       WHERE apartment_id = 5 AND month = 11 AND year = 2024
    │       │       └─> IF exists → Return 400: "Uplata već postoji za ovaj period"
    │       │
    │       └─> INSERT INTO payments
    │           (apartment_id, amount, payment_date, month, year, payment_method, notes, created_by)
    │           VALUES (5, '0.20', '2024-11-15', 11, 2024, 'Transfer', '...', adminUserId)
    │           └─> Return 200: { id, ...newPayment }
    │
    └─> Frontend: Refresh lista (fetchData())
        └─> GET /api/payments?month=11&year=2024
```

---

## 5. Stanar Pregleda Svoje Uplate

### Scenario: Stanar vidi svoju istoriju uplata

```
Stanar (Browser)
    │
    ├─> GET /tenant/payments
    │   └─> Frontend: TenantPaymentsPage
    │       └─> useEffect: fetchPayments()
    │           └─> GET /api/payments
    │               └─> Backend: GET /api/payments/route.ts
    │                   ├─> Provjera sesije
    │                   │   └─> IF not authenticated → Return 401
    │                   │
    │                   ├─> IF role === 'tenant' AND apartmentId exists
    │                   │   └─> Automatski filter:
    │                   │       SELECT * FROM payments
    │                   │       WHERE apartment_id = session.user.apartmentId
    │                   │       └─> Tenant vidi SAMO svoje uplate
    │                   │
    │                   └─> Return 200: [payments array]
    │
    └─> Frontend: Prikaz tabele sa uplatama
        └─> Mapiranje: { period, datum, iznos, način, napomena }
```

---

## 6. Admin Dodaje Trošak Zgrade

### Scenario: Admin unosi trošak (npr. popravka krov)

```
Admin (Browser)
    │
    ├─> GET /admin/payments (ili posebna stranica za troškove)
    │   └─> Frontend: AddExpenseForm komponenta
    │
    ├─> POST /api/expenses
    │   Body: {
    │     title: "Popravka krova",
    │     amount: "500.00",
    │     category: "Popravke",
    │     description: "Zamjena crijepa na krovu",
    │     expense_date: "2024-11-10",
    │     month: 11,
    │     year: 2024
    │   }
    │   └─> Backend: POST /api/expenses/route.ts
    │       ├─> Provjera sesije
    │       │   └─> IF role !== 'admin' → Return 403
    │       │
    │       ├─> Validacija required fields
    │       │
    │       └─> INSERT INTO expenses
    │           (title, amount, category, description, expense_date, month, year, created_by)
    │           VALUES ('Popravka krova', '500.00', 'Popravke', '...', '2024-11-10', 11, 2024, adminUserId)
    │           └─> Return 200: { id, ...newExpense }
    │
    └─> Frontend: Refresh lista troškova
```

---

## 7. Stanar Pregleda Troškove Zgrade

### Scenario: Stanar vidi sve troškove zgrade za godinu

```
Stanar (Browser)
    │
    ├─> GET /tenant/expenses
    │   └─> Frontend: TenantExpensesPage
    │       ├─> State: selectedYear = 2024
    │       │
    │       └─> useEffect: fetchExpenses()
    │           └─> GET /api/expenses?year=2024
    │               └─> Backend: GET /api/expenses/route.ts
    │                   ├─> Provjera sesije
    │                   │   └─> IF not authenticated → Return 401
    │                   │
    │                   ├─> SELECT * FROM expenses
    │                   │   WHERE year = 2024
    │                   │   ORDER BY expense_date
    │                   │   └─> SVI stanari vide SVE troškove (transparentnost)
    │                   │
    │                   └─> Return 200: [expenses array]
    │
    └─> Frontend:
        ├─> Prikaz tabele: { datum, naziv, kategorija, iznos, opis }
        └─> Ukupna suma: expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
```

---

## 8. Admin Generiše Izvještaj

### Scenario: Admin vidi mjesečni izvještaj sa statistikama

```
Admin (Browser)
    │
    ├─> GET /admin/reports
    │   └─> Frontend: AdminReportsPage
    │       ├─> State: selectedMonth = 11, selectedYear = 2024
    │       │
    │       └─> Komponente:
    │           ├─> MonthlyStats (month, year)
    │           │   └─> useEffect:
    │           │       ├─> GET /api/apartments
    │           │       │   └─> Backend: SELECT * FROM apartments
    │           │       │       └─> Return: [apartments] → totalApartments = apartments.length
    │           │       │
    │           │       ├─> GET /api/payments?month=11&year=2024
    │           │       │   └─> Backend: SELECT * FROM payments WHERE month=11 AND year=2024
    │           │       │       └─> Return: [payments]
    │           │       │
    │           │       └─> Kalkulacije:
    │           │           ├─> expectedIncome = totalApartments × monthlyFee (default 0.20 BAM)
    │           │           ├─> collected = SUM(payments.amount)
    │           │           ├─> collectionRate = (collected / expectedIncome) × 100
    │           │           └─> delinquentCount = apartments bez uplate u tom mjesecu
    │           │
    │           └─> DelinquentTenants (month, year)
    │               └─> useEffect:
    │                   ├─> GET /api/apartments
    │                   ├─> GET /api/payments?month=11&year=2024
    │                   └─> Kalkulacija:
    │                       └─> apartments.filter(apt => 
    │                           !payments.some(p => p.apartmentId === apt.id)
    │                       )
    │
    └─> CSV Export (opciono):
        └─> Frontend: Generiše CSV string
            └─> Download: "izvjestaj-2024-11.csv"
```

---

## 9. Tenant Dashboard - Trenutni Balans

### Scenario: Stanar vidi svoj stan i balans

```
Stanar (Browser)
    │
    ├─> GET /tenant
    │   └─> Frontend: TenantDashboard
    │       ├─> useEffect: fetchApartment()
    │       │   └─> GET /api/apartments
    │       │       └─> Backend: GET /api/apartments/route.ts
    │       │           ├─> Provjera sesije
    │       │           │
    │       │           └─> IF role === 'tenant' AND apartmentId exists
    │       │               └─> SELECT * FROM apartments
    │       │                   WHERE id = session.user.apartmentId
    │       │                   └─> Return: [single apartment]
    │       │
    │       └─> CurrentBalance komponenta
    │           └─> useEffect: fetchPaymentStatus()
    │               └─> GET /api/payments?month=11&year=2024
    │                   └─> Backend: Automatski filtrira po apartmentId
    │                   └─> IF payments.length > 0
    │                       └─> currentMonthPaid = true
    │                   └─> ELSE
    │                       └─> currentMonthPaid = false
    │
    └─> Prikaz:
        ├─> TenantInfoCard: { broj stana, sprat, kvadratura, mjesečna naknada }
        └─> CurrentBalance: { period, status (Plaćeno/Nije plaćeno), posljednja uplata }
```

---

## 10. Admin Deaktivira Stanara

### Scenario: Admin deaktivira nalog stanara

```
Admin (Browser)
    │
    ├─> GET /admin/tenants
    │   └─> Frontend: TenantsList komponenta
    │       └─> GET /api/users?role=tenant
    │           └─> Backend: SELECT users.*, apartments.*
    │               FROM users LEFT JOIN apartments
    │               WHERE users.role = 'tenant'
    │
    ├─> Klik: "Deaktiviraj" na stanaru
    │   └─> DELETE /api/users?id=123
    │       └─> Backend: DELETE /api/users/route.ts
    │           ├─> Provjera sesije
    │           │   └─> IF role !== 'admin' → Return 403
    │           │
    │           ├─> Provjera: IF id === session.user.id
    │           │   └─> Return 400: "Ne možete deaktivirati vlastiti nalog"
    │           │
    │           └─> UPDATE users
    │               SET is_active = false
    │               WHERE id = 123
    │               └─> NE BRIŠE korisnika (za istoriju)
    │               └─> Return 200: { success: true }
    │
    └─> Frontend: Refresh lista (fetchData())
```

---

## Napomene o Sigurnosti

1. **Svi API pozivi** provjeravaju NextAuth sesiju
2. **Role-based access**: Admin može sve, tenant vidi samo svoje podatke
3. **Automatizovani filteri**: Tenant API pozivi automatski filtriraju po `apartmentId`
4. **Password hashing**: bcrypt sa salt rounds = 10
5. **Unique constraints**: Sprečavaju duplikate (npr. uplata za isti stan/mjesec/godinu)
6. **Soft delete**: Korisnici se ne brišu, već se deaktiviraju (`is_active = false`)

