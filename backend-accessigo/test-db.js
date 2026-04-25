// Test database connection
import dotenv from 'dotenv';
dotenv.config();
import db from './db.js';

console.log('Testing Supabase connection...');
console.log('URL:', process.env.SUPABASE_URL);
console.log('Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

try {
  const { data, error } = await db.from('users').select('id').limit(1);
  if (error) {
    console.error('Query error:', error);
  } else {
    console.log('✅ Connection successful!');
    console.log('Users count:', data?.length || 0);
  }
} catch (err) {
  console.error('Connection failed:', err.message);
  console.error('Stack:', err.stack);
}

process.exit(0);
