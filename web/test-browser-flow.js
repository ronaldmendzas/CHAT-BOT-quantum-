const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([^#\s][^=]*)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Missing credentials');
  process.exit(1);
}

// Simulate browser localStorage with in-memory store
const localStorageMock = {};
const originalLocalStorage = global.localStorage;
global.localStorage = {
  getItem: (key) => localStorageMock[key] || null,
  setItem: (key, value) => { localStorageMock[key] = value; },
  removeItem: (key) => { delete localStorageMock[key]; },
};

const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    storage: global.localStorage,
    autoRefreshToken: false,
  },
});

async function test() {
  console.log('=== Simulating browser login flow ===\n');

  // Step 1: Login
  console.log('1. Calling signInWithPassword...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'testquantum@example.com',
    password: 'TestPass123!',
  });

  if (error) {
    console.error('Login failed:', error.message);
    return;
  }

  console.log('   Login SUCCESS! User:', data.user?.email);
  console.log('   Session:', !!data.session);

  // Step 2: Check localStorage
  console.log('\n2. Checking localStorage keys:');
  const keys = Object.keys(localStorageMock);
  console.log('   Keys:', keys);
  const authKey = keys.find(k => k.includes('auth-token'));
  console.log('   Auth token found:', !!authKey);

  // Step 3: Simulate page reload — create NEW client with same localStorage
  console.log('\n3. Simulating page reload (new client)...');
  const supabase2 = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      storage: global.localStorage,
      autoRefreshToken: false,
    },
  });

  const { data: sessionData } = await supabase2.auth.getSession();
  console.log('   getSession after reload:', !!sessionData.session);
  console.log('   User after reload:', sessionData.session?.user?.email || 'null');

  // Step 4: Test API with token
  console.log('\n4. Testing /api/debug/auth with token...');
  const token = data.session?.access_token;
  if (token) {
    try {
      const fetch = (await import('node-fetch')).default;
      const res = await fetch('http://localhost:3000/api/debug/auth', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const json = await res.json();
      console.log('   API response user exists:', json.user?.exists);
      console.log('   API response user email:', json.user?.email);
    } catch (e) {
      console.error('   API test failed:', e.message);
    }
  }

  console.log('\n=== Test complete ===');
  if (sessionData.session) {
    console.log('SUCCESS: Session persists across "page reloads"');
  } else {
    console.log('FAILURE: Session LOST after "page reload"');
  }
}

test().catch(console.error);
