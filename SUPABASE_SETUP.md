# Supabase Setup Instructions

## ✅ Completed Steps

1. **Updated `.env`** with your Supabase credentials
2. **Updated `package.json`** to use `@supabase/supabase-js` instead of `better-sqlite3`
3. **Created new `db.js`** that initializes the Supabase client
4. **Created `schema.sql`** with your database schema
5. **Installed npm packages** with `npm install`

## 🚀 Next Steps

### Step 1: Create Database Tables in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** → **New Query**
4. Copy the entire content from `schema.sql` in this project
5. Paste it into the SQL editor and click **Run**

This will create all the necessary tables with proper relationships and indexes.

### Step 2: Update Your Routes

Your routes now use the Supabase client. Here's an example of how to update `routes/auth.js`:

```javascript
import supabase from '../db.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Insert user
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword, role: 'user' }])
      .select();

    if (error) throw error;

    // Create JWT token
    const token = jwt.sign(
      { id: data[0].id, email: data[0].email, role: data[0].role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({ token, user: data[0] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !users) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcryptjs.compare(password, users.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: users.id, email: users.email, role: users.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token, user: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Step 3: Common Supabase Operations

**SELECT (Read):**
```javascript
const { data, error } = await supabase
  .from('locations')
  .select('*')
  .eq('status', 'active');
```

**INSERT (Create):**
```javascript
const { data, error } = await supabase
  .from('locations')
  .insert([{ name, type, street, description }])
  .select();
```

**UPDATE (Modify):**
```javascript
const { data, error } = await supabase
  .from('locations')
  .update({ rating: 4.5 })
  .eq('id', locationId)
  .select();
```

**DELETE (Remove):**
```javascript
const { data, error } = await supabase
  .from('locations')
  .delete()
  .eq('id', locationId);
```

**JOINS:**
```javascript
const { data, error } = await supabase
  .from('locations')
  .select('*, ratings(score), user:reported_by(name)')
  .eq('status', 'active');
```

### Step 4: Enable Row Level Security (Optional but Recommended)

In Supabase Dashboard:
1. Go to **Authentication** → **Policies**
2. Set up RLS (Row Level Security) policies to protect data access
3. Example: Only users can see their own data, admins see all

### Step 5: Update Frontend (if using client-side Supabase)

In `frontend-accessigo/script.js`:
```javascript
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://bsjddikivzmiahulimxg.supabase.co',
  'sb_publishable_qJY6yXk1Udl2UPpBK1YL_g_7OJVY2TW'
);

// Example: Fetch locations
async function getLocations() {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('status', 'active');
  
  if (error) console.error(error);
  return data;
}
```

## 📝 Environment Variables Configured

```
SUPABASE_URL=https://bsjddikivzmiahulimxg.supabase.com
SUPABASE_ANON_KEY=sb_publishable_qJY6yXk1Udl2UPpBK1YL_g_7OJVY2TW
SUPABASE_SERVICE_ROLE_KEY=sb_secret_AM198gUHnOM4HqA4OdcnyA__MkHjpmh
```

## 🔒 Security Notes

- Never commit `.env` to version control
- Service Role Key should ONLY be used on the backend (not exposed to frontend)
- Use ANON_KEY on frontend - it's safe because RLS policies control what users can access
- Rotate your keys periodically in Supabase Dashboard

## 📚 Useful Links

- [Supabase JavaScript Client Documentation](https://supabase.com/docs/reference/javascript)
- [Supabase SQL Editor](https://supabase.com/dashboard)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## ❓ Need Help?

If you encounter issues:
1. Check that all tables were created successfully in Supabase SQL Editor
2. Verify your credentials are correct in `.env`
3. Check the browser console and server logs for error messages
4. Test API endpoints with Postman or curl
