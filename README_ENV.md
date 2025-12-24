# Environment Variables Setup

## Potrebne Environment Varijable

Aplikacija zahtijeva sledeće environment varijable da bi radila:

### 1. `.env.local` fajl

Kreiraj `.env.local` fajl u root direktoriju projekta sa sledećim varijablama:

```env
# Database Connection
DATABASE_URL=postgresql://username:password@host:port/database

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Setup Key (for initial admin creation)
SETUP_KEY=your-setup-key-here
```

### 2. Generisanje NEXTAUTH_SECRET

Generiši siguran random string:

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

### 3. Database Setup

Ako još nemaš Postgres bazu:

1. Instaliraj PostgreSQL
2. Kreiraj bazu:
   ```sql
   CREATE DATABASE building_app;
   ```
3. Ažuriraj `DATABASE_URL` u `.env.local` sa tvojim credentials

### 4. Setup Key

`SETUP_KEY` se koristi za kreiranje prvog admin naloga na `/setup` stranici. 
**VAŽNO:** Promijeni ovo u production!

---

## Quick Start

1. Kopiraj `.env.local.example` u `.env.local`
2. Popuni sve varijable sa tvojim vrijednostima
3. Restartuj dev server: `npm run dev`

---

## Troubleshooting

### 404 Error

Ako dobijaš 404 grešku:
1. Provjeri da li postoji `.env.local` fajl
2. Provjeri da li su sve varijable postavljene
3. Provjeri da li je dev server pokrenut: `npm run dev`
4. Provjeri browser console za detaljne greške

### Database Connection Error

Ako dobijaš database connection grešku:
1. Provjeri da li je PostgreSQL pokrenut
2. Provjeri `DATABASE_URL` format
3. Provjeri da li baza postoji

### NextAuth Error

Ako dobijaš NextAuth greške:
1. Provjeri da li je `NEXTAUTH_SECRET` postavljen
2. Provjeri da li je `NEXTAUTH_URL` tačan (http://localhost:3000 za dev)

