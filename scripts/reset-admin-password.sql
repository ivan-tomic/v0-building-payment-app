-- Reset Admin Password Script
-- Usage: Run this in your PostgreSQL database to reset admin password

-- Step 1: Check if admin exists
SELECT id, email, full_name, role, is_active 
FROM users 
WHERE email = 'tomic.ivan@gmail.com' AND role = 'admin';

-- Step 2: Generate password hash (you need to do this in Node.js or use bcrypt)
-- Example: For password "admin123", the hash would be generated with:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('admin123', 10);

-- Step 3: Update password (REPLACE 'YOUR_HASHED_PASSWORD' with actual hash)
-- UPDATE users 
-- SET password_hash = 'YOUR_HASHED_PASSWORD'
-- WHERE email = 'tomic.ivan@gmail.com' AND role = 'admin';

-- Step 4: Verify update
-- SELECT id, email, full_name, role FROM users WHERE email = 'tomic.ivan@gmail.com';

