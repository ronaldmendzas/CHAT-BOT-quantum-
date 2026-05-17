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

// User A: testquantum@example.com / TestPass123!
// User B: Need to check if another test user exists or create one

async function testUserIsolation() {
  console.log('=== TESTING USER ISOLATION ===\n');
  
  // Login as User A
  console.log('1. Logging in as User A (testquantum@example.com)...');
  const supabaseA = createClient(url, anonKey);
  const { data: dataA, error: errorA } = await supabaseA.auth.signInWithPassword({
    email: 'testquantum@example.com',
    password: 'TestPass123!',
  });
  
  if (errorA) {
    console.error('Failed to login as User A:', errorA.message);
    return;
  }
  
  const tokenA = dataA.session?.access_token;
  console.log('   User A logged in. Token:', tokenA ? tokenA.slice(0, 20) + '...' : 'missing');
  
  // Get User A conversations
  console.log('\n2. Fetching conversations for User A...');
  const fetch = (await import('node-fetch')).default;
  const resA = await fetch('http://localhost:3002/api/conversations', {
    headers: { 'Authorization': `Bearer ${tokenA}` },
  });
  const convA = await resA.json();
  console.log('   User A conversations:', convA.data?.length || 0);
  if (convA.data?.length > 0) {
    console.log('   Titles:', convA.data.map((c) => c.title));
  }
  
  // Check if another test user exists
  console.log('\n3. Checking for existing test users...');
  
  // Try to login as a potential User B (68004297jor@gmail.com)
  const supabaseB = createClient(url, anonKey);
  const { data: dataB, error: errorB } = await supabaseB.auth.signInWithPassword({
    email: '68004297jor@gmail.com',
    password: 'TestPass123!',
  });
  
  if (errorB) {
    console.log('   User B (68004297jor@gmail.com) not found or wrong password:', errorB.message);
    console.log('\n=== Cannot test isolation - need a second user ===');
    console.log('   Please create a second user manually via /auth to test isolation');
    return;
  }
  
  const tokenB = dataB.session?.access_token;
  console.log('   User B logged in. Token:', tokenB ? tokenB.slice(0, 20) + '...' : 'missing');
  
  // Get User B conversations
  console.log('\n4. Fetching conversations for User B...');
  const resB = await fetch('http://localhost:3002/api/conversations', {
    headers: { 'Authorization': `Bearer ${tokenB}` },
  });
  const convB = await resB.json();
  console.log('   User B conversations:', convB.data?.length || 0);
  if (convB.data?.length > 0) {
    console.log('   Titles:', convB.data.map((c) => c.title));
  }
  
  // Compare
  console.log('\n=== RESULT ===');
  if (convA.data?.length === convB.data?.length) {
    console.log('WARNING: Both users have the SAME number of conversations!');
    console.log('This means isolation is NOT working correctly.');
  } else {
    console.log('SUCCESS: Users have DIFFERENT numbers of conversations');
    console.log('Isolation is working!');
  }
  
  // Check if any conversation IDs overlap
  const idsA = new Set((convA.data || []).map((c) => c.id));
  const idsB = new Set((convB.data || []).map((c) => c.id));
  const overlap = [...idsA].filter((id) => idsB.has(id));
  
  if (overlap.length > 0) {
    console.log('CRITICAL: Users share', overlap.length, 'conversation(s)!');
    console.log('Shared IDs:', overlap);
  } else {
    console.log('GOOD: No overlapping conversation IDs');
  }
}

testUserIsolation().catch(console.error);
