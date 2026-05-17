const { createBrowserClient } = require('@supabase/ssr');
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

// Simulate document.cookie with an in-memory store
const cookieStore = {};

function parseCookies() {
  return Object.entries(cookieStore).map(([name, value]) => ({ name, value }));
}

function writeCookie(name, value, options) {
  if (value === '') {
    delete cookieStore[name];
  } else {
    cookieStore[name] = value;
  }
}

const supabase = createBrowserClient(url, anonKey, {
  cookies: {
    getAll() {
      return parseCookies();
    },
    setAll(cookiesList) {
      cookiesList.forEach(({ name, value, options }) => {
        writeCookie(name, value, options);
      });
    },
  },
});

async function test() {
  console.log('Testing createBrowserClient with explicit cookie handlers...');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'testquantum@example.com',
    password: 'TestPass123!',
  });
  
  if (error) {
    console.error('Login failed:', error.message);
    return;
  }
  
  console.log('Login success! User:', data.user?.email);
  console.log('Cookies after login:', Object.keys(cookieStore));
  
  const { data: sessionData } = await supabase.auth.getSession();
  console.log('getSession after login:', !!sessionData.session);
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  console.log('getUser after login:', !!userData.user, 'error:', userError?.message || 'none');
  
  // Now simulate a "new page load" by creating a fresh client with the same cookies
  console.log('\nSimulating fresh page load with same cookies...');
  const supabase2 = createBrowserClient(url, anonKey, {
    cookies: {
      getAll() {
        return parseCookies();
      },
      setAll(cookiesList) {
        cookiesList.forEach(({ name, value, options }) => {
          writeCookie(name, value, options);
        });
      },
    },
  });
  
  const { data: sessionData2 } = await supabase2.auth.getSession();
  console.log('getSession on fresh client:', !!sessionData2.session);
  
  const { data: userData2, error: userError2 } = await supabase2.auth.getUser();
  console.log('getUser on fresh client:', !!userData2.user, 'error:', userError2?.message || 'none');
}

test().catch(console.error);
