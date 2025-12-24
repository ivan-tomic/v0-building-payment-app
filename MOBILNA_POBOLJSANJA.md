# Mobilna Poboljšanja - Responsive UI Analiza

## Trenutno Stanje

Aplikacija koristi Tailwind CSS sa osnovnim responsive klasama, ali **tabele nisu optimizovane za mobilne uređaje**. Na malim ekranima (320-420px) tabele postaju nečitljive jer se ne prelamaju.

---

## Identifikovani Problemi

### 1. **Tabele na mobilnim uređajima**

**Problem:**
- Standardne HTML tabele (`<table>`) se ne prilagođavaju malim ekranima
- Korisnik mora da skroluje horizontalno da vidi sve kolone
- Loše korisničko iskustvo na telefonima

**Lokacije:**
- `/tenant/payments` - Tabela uplata
- `/tenant/expenses` - Tabela troškova
- `/admin/payments` - Tabela uplata (admin)
- `/admin/tenants` - Tabela stanara
- Komponente: `PaymentsTable`, `TenantsList`

**Rješenje:**
Implementirati **"stacked card"** layout za mobilne uređaje - tabele se pretvaraju u kartice sa vertikalnim prikazom podataka.

---

### 2. **Padding i spacing**

**Problem:**
- `p-8` (32px padding) je previše za mobilne ekrane
- Gubi se previše prostora na malim ekranima

**Rješenje:**
- Koristiti responsive padding: `p-4 md:p-8`
- Smanjiti gap između elemenata na mobilnim: `gap-4 md:gap-8`

---

### 3. **Tipografija**

**Problem:**
- `text-3xl` i `text-4xl` su preveliki za mobilne
- Dugme "Dodaj plaćanje" može biti preširoko

**Rješenje:**
- Responsive font sizes: `text-2xl md:text-3xl`
- Dugmad sa `w-full md:w-auto` na mobilnim

---

### 4. **Forme i input polja**

**Problem:**
- Select elementi i input polja mogu biti teški za korištenje na touch ekranima
- Minimalna visina za touch target treba biti 44px

**Rješenje:**
- Povećati padding na input/select: `py-3 md:py-2`
- Osigurati minimalnu visinu od 44px

---

## Predložena Rješenja

### 1. Responsive Tabela Komponenta

Kreirati reusable komponentu koja automatski prelazi u card layout na mobilnim:

```tsx
// components/ui/responsive-table.tsx
'use client'

interface ResponsiveTableProps {
  data: any[]
  columns: { key: string; label: string; mobileLabel?: string }[]
  mobileCardRender?: (item: any) => React.ReactNode
}

export default function ResponsiveTable({ data, columns, mobileCardRender }: ResponsiveTableProps) {
  return (
    <>
      {/* Desktop: Standardna tabela */}
      <div className="hidden md:block bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Desktop table content */}
          </table>
        </div>
      </div>

      {/* Mobile: Card layout */}
      <div className="md:hidden space-y-4">
        {data.map((item) => (
          <div key={item.id} className="bg-card rounded-lg border p-4 space-y-2">
            {mobileCardRender ? mobileCardRender(item) : (
              // Default card render
              columns.map((col) => (
                <div key={col.key} className="flex justify-between">
                  <span className="text-muted-foreground">{col.mobileLabel || col.label}:</span>
                  <span className="text-foreground font-medium">{item[col.key]}</span>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </>
  )
}
```

---

### 2. Konkretne Izmene po Stranicama

#### A. `/tenant/payments` - Moje Uplate

**Trenutno:**
```tsx
<div className="bg-card rounded-lg border overflow-hidden">
  <table className="w-full">
    {/* 5 kolona: Period, Datum, Iznos, Način, Napomena */}
  </table>
</div>
```

**Predloženo:**
```tsx
{/* Desktop tabela */}
<div className="hidden md:block bg-card rounded-lg border overflow-hidden">
  <table className="w-full">
    {/* postojeća tabela */}
  </table>
</div>

{/* Mobile card layout */}
<div className="md:hidden space-y-4">
  {payments.map((payment) => (
    <div key={payment.id} className="bg-card rounded-lg border p-4 space-y-3">
      <div className="flex justify-between items-center pb-2 border-b">
        <span className="text-sm text-muted-foreground">Period</span>
        <span className="font-semibold">
          {getMonthName(payment.month)} {payment.year}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-muted-foreground">Datum uplate</span>
        <span className="text-sm">{formatDate(payment.paymentDate)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-muted-foreground">Iznos</span>
        <span className="font-semibold text-primary">
          {parseFloat(payment.amount).toFixed(2)} BAM
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-muted-foreground">Način</span>
        <span className="text-sm">{payment.paymentMethod || '-'}</span>
      </div>
      {payment.notes && (
        <div className="pt-2 border-t">
          <span className="text-sm text-muted-foreground">Napomena:</span>
          <p className="text-sm mt-1">{payment.notes}</p>
        </div>
      )}
    </div>
  ))}
</div>
```

---

#### B. `/tenant/expenses` - Troškovi Zgrade

**Predloženo mobile layout:**
```tsx
<div className="md:hidden space-y-4">
  {expenses.map((expense) => (
    <div key={expense.id} className="bg-card rounded-lg border p-4 space-y-2">
      <div className="flex justify-between items-start pb-2 border-b">
        <div>
          <h3 className="font-semibold text-foreground">{expense.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDate(expense.expenseDate)}
          </p>
        </div>
        <span className="font-bold text-primary">
          {parseFloat(expense.amount).toFixed(2)} BAM
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">Kategorija</span>
        <span className="text-xs bg-muted px-2 py-1 rounded">
          {expense.category}
        </span>
      </div>
      {expense.description && (
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">{expense.description}</p>
        </div>
      )}
    </div>
  ))}
</div>
```

---

#### C. `/admin/payments` - Admin Uplate

**Predloženo:**
- Ista logika kao tenant payments, ali sa dodatnom kolonom "Stan"
- Mobile card prikazuje: **Stan → Period → Iznos → Datum → Metoda**

---

#### D. `/admin/tenants` - Lista Stanara

**Predloženo mobile layout:**
```tsx
<div className="md:hidden space-y-3">
  {tenants.map((tenant) => (
    <div key={tenant.id} className="bg-card rounded-lg border p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold">
            Stan {tenant.apartmentNumber}
          </h3>
          <p className="text-sm text-muted-foreground">
            Sprat {tenant.floor}
          </p>
        </div>
        <span className={`px-2 py-1 rounded text-xs ${
          tenant.user ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {tenant.user ? 'Aktivan' : 'Na čekanju'}
        </span>
      </div>
      {tenant.user && (
        <div className="space-y-1 pt-2 border-t">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{tenant.user.full_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{tenant.user.email}</span>
          </div>
        </div>
      )}
    </div>
  ))}
</div>
```

---

### 3. Globalne Responsive Izmene

#### Layout Container
```tsx
// Umjesto: <div className="p-8">
<div className="p-4 md:p-6 lg:p-8">
```

#### Headings
```tsx
// Umjesto: <h1 className="text-3xl font-bold">
<h1 className="text-2xl md:text-3xl font-bold">
```

#### Buttons
```tsx
// Umjesto: <button className="px-4 py-2">
<button className="w-full md:w-auto px-4 py-3 md:py-2">
```

#### Grid Layouts
```tsx
// Umjesto: <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
```

#### Select/Input Elements
```tsx
// Umjesto: <select className="px-3 py-2">
<select className="px-3 py-3 md:py-2 text-base md:text-sm min-h-[44px]">
```

---

### 4. Touch-Friendly Improvements

#### Minimum Touch Target Size
- Sve klikabilne elemente (dugmad, linkovi) osigurati minimalnu visinu od **44px**
- Koristiti `min-h-[44px]` ili `py-3` (12px padding top/bottom = 24px + content)

#### Spacing između elemenata
- Minimum **8px** gap između klikabilnih elemenata
- Koristiti `gap-2` (8px) ili više

---

## Implementacioni Plan

### Faza 1: Osnovne Responsive Izmene
1. ✅ Dodati responsive padding (`p-4 md:p-8`)
2. ✅ Responsive font sizes (`text-2xl md:text-3xl`)
3. ✅ Responsive buttons (`w-full md:w-auto`)

### Faza 2: Responsive Tabele
1. ✅ Kreirati mobile card layout za `/tenant/payments`
2. ✅ Kreirati mobile card layout za `/tenant/expenses`
3. ✅ Kreirati mobile card layout za `/admin/payments`
4. ✅ Kreirati mobile card layout za `/admin/tenants`

### Faza 3: Touch Optimizacija
1. ✅ Povećati touch target sizes
2. ✅ Optimizovati spacing između elemenata
3. ✅ Testirati na stvarnim mobilnim uređajima

---

## Testiranje

### Preporučene Breakpoints
- **Mobile**: 320px - 767px (Tailwind `sm` breakpoint)
- **Tablet**: 768px - 1023px (Tailwind `md` breakpoint)
- **Desktop**: 1024px+ (Tailwind `lg` breakpoint)

### Test Scenariji
1. **iPhone SE (375px)** - Najmanji moderni telefon
2. **iPhone 14 Pro (390px)** - Standardni telefon
3. **Samsung Galaxy (360px)** - Android telefon
4. **iPad (768px)** - Tablet u portrait modu

### Chrome DevTools
- Koristiti Device Toolbar (F12 → Toggle device toolbar)
- Testirati na različitim viewport sizes
- Provjeriti touch target sizes sa "Show rulers"

---

## Dodatne Preporuke

### 1. PWA (Progressive Web App) - Opciono
- Dodati `manifest.json` za instalaciju na telefon
- Service worker za offline funkcionalnost
- **Nije obavezno**, ali bi poboljšalo UX

### 2. Dark Mode
- Već postoji `next-themes` u dependencies
- Osigurati da mobile layout radi i u dark mode

### 3. Performance
- Lazy loading za tabele sa puno podataka
- Virtual scrolling za liste sa 100+ elemenata (ako bude potrebno)

---

## Prioriteti

**Visok prioritet:**
1. ✅ Responsive tabele (payments, expenses, tenants)
2. ✅ Responsive padding i spacing
3. ✅ Touch-friendly buttons

**Srednji prioritet:**
4. Responsive tipografija
5. Optimizacija formi

**Nizak prioritet:**
6. PWA funkcionalnost
7. Advanced animations

