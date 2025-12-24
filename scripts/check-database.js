// Check Database Connection and Tables
// Usage: node scripts/check-database.js

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function checkDatabase() {
  try {
    console.log('🔍 Provjeravam konekciju na bazu...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Postavljen ✅' : 'Nije postavljen ❌');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Konekcija uspješna!');
    
    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Tabela "users" postoji');
      
      // Check if there are any admins
      const adminCheck = await client.query(
        'SELECT COUNT(*) as count FROM users WHERE role = $1',
        ['admin']
      );
      console.log(`📊 Broj admin naloga: ${adminCheck.rows[0].count}`);
      
      // List all tables
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);
      console.log('\n📋 Sve tabele u bazi:');
      tables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('❌ Tabela "users" NE POSTOJI!');
      console.log('💡 Trebate pokrenuti SQL skripte: scripts/02-schema.sql');
    }
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Greška:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 PostgreSQL nije pokrenut ili DATABASE_URL nije tačan');
    } else if (error.message.includes('does not exist')) {
      console.error('💡 Baza ne postoji. Kreirajte je prvo.');
    }
    if (pool) await pool.end().catch(() => {});
    process.exit(1);
  }
}

checkDatabase();

