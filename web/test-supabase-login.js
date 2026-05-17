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

console.log('URL:', url ? 'present' : 'missing');
console.log('Anon key:', anonKey ? `present (${anonKey.length} chars)` : 'missing');

if (!url || !anonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

async function test() {
  const supabase = createClient(url, anonKey);
  
  console.log('Testing Supabase Auth login...');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'testquantum@example.com',
    password: 'TestPass123!',
  });
  
  if (error) {
    console.error('Login failed:', error.message);
    return;
  }
  
  console.log('Login success!');
  console.log('User:', data.user?.email);
  console.log('Session exists:', !!data.session);
  
  const { data: sessionData } = await supabase.auth.getSession();
  console.log('getSession after login:', !!sessionData.session);
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  console.log('getUser after login:', !!userData.user, 'error:', userError?.message || 'none');
}

test().catch(console.error);
