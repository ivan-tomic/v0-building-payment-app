// Reset Admin Password Script
// Usage: node scripts/reset-admin-password.js

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function resetAdminPassword() {
  const email = 'tomic.ivan@gmail.com';
  const newPassword = process.argv[2] || 'admin123'; // Default password or from command line

  if (!newPassword) {
    console.error('Usage: node scripts/reset-admin-password.js <new-password>');
    process.exit(1);
  }

  try {
    // Check if admin exists
    const checkResult = await pool.query(
      'SELECT id, email, full_name, role FROM users WHERE email = $1 AND role = $2',
      [email, 'admin']
    );

    if (checkResult.rows.length === 0) {
      console.log('❌ Admin sa email-om', email, 'nije pronađen!');
      console.log('💡 Možda treba da kreiraš novi admin nalog preko /setup stranice.');
      process.exit(1);
    }

    const admin = checkResult.rows[0];
    console.log('✅ Pronađen admin:', admin.full_name, `(${admin.email})`);

    // Hash new password
    console.log('🔐 Hash-ujem novu lozinku...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, admin.id]
    );

    console.log('✅ Lozinka je uspješno resetovana!');
    console.log('📧 Email:', email);
    console.log('🔑 Nova lozinka:', newPassword);
    console.log('');
    console.log('⚠️  VAŽNO: Promijeni lozinku nakon prve prijave!');

    await pool.end();
  } catch (error) {
    console.error('❌ Greška:', error.message || error);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    if (error.message && (error.message.includes('connection') || error.message.includes('DATABASE_URL') || error.message.includes('ECONNREFUSED'))) {
      console.error('');
      console.error('💡 Provjeri:');
      console.error('   1. Da li je PostgreSQL pokrenut?');
      console.error('   2. Da li su credentials u DATABASE_URL tačni?');
      console.error('   3. Da li baza "building_app" postoji?');
    }
    if (pool) await pool.end().catch(() => {});
    process.exit(1);
  }
}

resetAdminPassword();

