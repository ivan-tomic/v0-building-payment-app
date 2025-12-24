# Migration Guide: Supabase → Self-hosted PostgreSQL

This guide will help you migrate your building management app from Supabase to a self-hosted PostgreSQL database with NextAuth.js for authentication.

## Overview

**What we're replacing:**
- Supabase Auth → NextAuth.js with Credentials provider
- Supabase Database → Self-hosted PostgreSQL 16
- Supabase Client → Drizzle ORM
- RLS Policies → Application-level authorization

**What stays the same:**
- Next.js frontend
- Vercel hosting
- Your existing UI and business logic

---

## Phase 1: VPS Setup (Hetzner)

### 1.1 Create VPS

1. Go to [Hetzner Cloud Console](https://console.hetzner.cloud/)
2. Create new project or use existing
3. Add Server:
   - **Location:** Choose closest to your users (Falkenstein/Nuremberg for EU)
   - **Image:** Ubuntu 24.04
   - **Type:** CX22 (2 vCPU, 4GB RAM) — plenty for 29 tenants
   - **Networking:** Public IPv4 + IPv6
   - **SSH Key:** Add your SSH key
   - **Name:** `building-app-db` or similar

### 1.2 Initial Server Setup

SSH into your server:
```bash
ssh root@YOUR_SERVER_IP
```

Run the setup script (provided as `01-vps-setup.sh`):
```bash
# Upload and run the setup script
chmod +x 01-vps-setup.sh
./01-vps-setup.sh
```

This script will:
- Update system packages
- Install PostgreSQL 16
- Configure firewall (UFW)
- Set up SSL for PostgreSQL connections
- Create database and user

### 1.3 Configure PostgreSQL for Remote Access

Edit PostgreSQL config:
```bash
sudo nano /etc/postgresql/16/main/postgresql.conf
```

Change:
```
listen_addresses = '*'
ssl = on
```

Edit pg_hba.conf:
```bash
sudo nano /etc/postgresql/16/main/pg_hba.conf
```

Add (replace YOUR_VERCEL_IPS with actual IPs or use 0.0.0.0/0 for development):
```
# Allow SSL connections from anywhere (Vercel's IPs change)
hostssl building_app building_app_user 0.0.0.0/0 scram-sha-256
hostssl building_app building_app_user ::/0 scram-sha-256
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

---

## Phase 2: Database Schema Migration

### 2.1 Run Schema Script

Connect to your database:
```bash
sudo -u postgres psql building_app
```

Run the new schema (provided as `02-schema.sql`):
```sql
\i /path/to/02-schema.sql
```

### 2.2 Key Schema Changes

| Old (Supabase) | New (Self-hosted) |
|----------------|-------------------|
| `auth.users(id)` reference | `users.id` is now `SERIAL` |
| UUID for user IDs | Integer IDs (simpler) |
| RLS policies | Removed (app-level auth) |
| `password` in Supabase Auth | `password_hash` in users table |

---

## Phase 3: Code Migration

### 3.1 Install New Dependencies

```bash
# Remove Supabase packages
pnpm remove @supabase/ssr @supabase/supabase-js

# Add new packages
pnpm add drizzle-orm pg next-auth bcryptjs
pnpm add -D drizzle-kit @types/pg @types/bcryptjs
```

### 3.2 Environment Variables

Update your `.env.local`:
```env
# Remove these:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Add these:
DATABASE_URL=postgresql://building_app_user:YOUR_PASSWORD@YOUR_SERVER_IP:5432/building_app?sslmode=require
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-secure-random-string-here
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3.3 Replace Files

Copy the following files from this migration package to your project:

```
lib/
├── db.ts              # Database connection (Drizzle)
├── schema.ts          # Drizzle schema definitions
├── auth.ts            # NextAuth configuration
├── auth-context.tsx   # Updated auth context (no Supabase)
├── protected-route.tsx # Updated (uses NextAuth session)

app/
├── api/
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts   # NextAuth API route
│   ├── payments/
│   │   └── route.ts       # Updated (uses Drizzle)
│   └── expenses/
│       └── route.ts       # Updated (uses Drizzle)
├── auth/
│   ├── signin/
│   │   └── page.tsx       # Updated (uses NextAuth)
│   └── signup/
│       └── page.tsx       # Updated (uses API route)

middleware.ts              # Updated (uses NextAuth)
drizzle.config.ts          # Drizzle Kit configuration
```

### 3.4 Update All Components

Search and replace in your codebase:

1. **Remove Supabase client creation:**
   ```typescript
   // DELETE these patterns:
   const supabase = createBrowserClient(...)
   const supabase = createServerClient(...)
   ```

2. **Replace Supabase queries with Drizzle:**
   ```typescript
   // OLD:
   const { data, error } = await supabase.from('payments').select('*')
   
   // NEW:
   import { db } from '@/lib/db'
   import { payments } from '@/lib/schema'
   const data = await db.select().from(payments)
   ```

3. **Replace auth checks:**
   ```typescript
   // OLD:
   const { data: { user } } = await supabase.auth.getUser()
   
   // NEW:
   import { getServerSession } from 'next-auth'
   import { authOptions } from '@/lib/auth'
   const session = await getServerSession(authOptions)
   const user = session?.user
   ```

---

## Phase 4: Vercel Configuration

### 4.1 Add Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
DATABASE_URL = postgresql://building_app_user:PASSWORD@YOUR_SERVER_IP:5432/building_app?sslmode=require
NEXTAUTH_URL = https://your-app.vercel.app
NEXTAUTH_SECRET = your-generated-secret
```

### 4.2 Deploy

```bash
git add .
git commit -m "Migrate from Supabase to self-hosted PostgreSQL"
git push
```

Vercel will automatically deploy.

---

## Phase 5: Create First Admin User

After deployment, you need to create your admin account manually:

```bash
# Connect to your database
sudo -u postgres psql building_app

# Generate a password hash (use the provided script or Node.js)
# Example hash for password "admin123" - CHANGE THIS!
```

```sql
-- Insert admin user
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'your-email@example.com',
  '$2b$10$YOUR_BCRYPT_HASH_HERE',
  'Ivan',
  'admin',
  true
);
```

Or use the setup page we'll create at `/setup` (one-time use).

---

## Verification Checklist

- [ ] VPS is running and accessible
- [ ] PostgreSQL accepts connections on port 5432
- [ ] SSL certificate is configured
- [ ] Database schema is created
- [ ] Environment variables are set in Vercel
- [ ] Admin user is created
- [ ] Can sign in to the app
- [ ] Can view dashboard stats
- [ ] Can add payments
- [ ] Can generate invitation codes
- [ ] Tenants can register with invitation codes

---

## Rollback Plan

If something goes wrong:

1. Your Supabase account still exists (just paused)
2. Revert the git commit
3. Restore Supabase environment variables
4. Redeploy

---

## Security Notes

1. **Never commit passwords or secrets to git**
2. **Use strong passwords** for database user
3. **Keep PostgreSQL updated** (`sudo apt update && sudo apt upgrade`)
4. **Monitor logs** for suspicious activity
5. **Regular backups** (set up pg_dump cron job)

---

## Backup Script

Add this to your VPS crontab for daily backups:

```bash
# Edit crontab
crontab -e

# Add this line (backs up at 3 AM daily)
0 3 * * * pg_dump -U building_app_user building_app | gzip > /var/backups/building_app_$(date +\%Y\%m\%d).sql.gz
```
