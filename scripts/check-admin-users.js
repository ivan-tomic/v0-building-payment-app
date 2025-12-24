// Check Admin Users in Database
// Usage: node scripts/check-admin-users.js

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function checkAdminUsers() {
  try {
    console.log('🔍 Provjeravam admin korisnike...\n');
    
    const client = await pool.connect();
    
    // Get all admin users
    const result = await client.query(`
      SELECT id, email, full_name, role, is_active, created_at
      FROM users
      WHERE role = 'admin'
      ORDER BY created_at DESC;
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ Nema admin korisnika u bazi!');
      console.log('💡 Kreiraj admin nalog preko /setup stranice.');
    } else {
      console.log(`✅ Pronađeno ${result.rows.length} admin korisnika:\n`);
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Ime: ${user.full_name}`);
        console.log(`   Status: ${user.is_active ? '✅ Aktivan' : '❌ Neaktivan'}`);
        console.log(`   Kreiran: ${new Date(user.created_at).toLocaleString('bs')}`);
        console.log('');
      });
      
      console.log('💡 Pokušaj se ulogovati sa jednim od ovih email adresa.');
    }
    
    // Get all users
    const allUsers = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Ukupno korisnika u bazi: ${allUsers.rows[0].count}`);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Greška:', error.message);
    if (pool) await pool.end().catch(() => {});
    process.exit(1);
  }
}

checkAdminUsers();

