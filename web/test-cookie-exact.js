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
  console.log('=== Testing exact cookie format ===');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'testquantum@example.com',
    password: 'TestPass123!',
  });
  
  if (error) {
    console.error('Login failed:', error.message);
    return;
  }
  
  console.log('Login success! User:', data.user?.email);
  console.log('\nCookies stored after login:');
  for (const [name, value] of Object.entries(cookieStore)) {
    console.log(`  ${name}=`);
    console.log(`    Value length: ${value.length}`);
    console.log(`    Value prefix: ${value.slice(0, 80)}...`);
    console.log(`    Full value: ${value}`);
  }
  
  // Now test getSession and getUser
  const { data: sessionData } = await supabase.auth.getSession();
  console.log('\ngetSession:', !!sessionData.session);
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  console.log('getUser:', !!userData.user, 'error:', userError?.message || 'none');
}

test().catch(console.error);
