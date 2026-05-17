$body = '{"email":"testquantum@example.com","password":"TestPass123!"}'
$response = curl.exe -s -X POST "https://rgzfcsyszhuoxnjwulqc.supabase.co/auth/v1/token?grant_type=password" `
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnemZjc3lzemh1b3huand1bHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5ODc4MzQsImV4cCI6MjA5NDU2MzgzNH0.X-AZL9jEVCG1o7gY8klsFcPQXdIGhNNZhbhj5nbU8U8" `
  -H "Content-Type: application/json" -d $body

$json = $response | ConvertFrom-Json
$tokenA = $json.access_token

if (!$tokenA) {
  Write-Output "Failed to get token A"
  Write-Output $response
  exit 1
}

Write-Output "=== User A (testquantum@example.com) ==="
$convA = curl.exe -s "http://localhost:3002/api/conversations" -H "Authorization: Bearer $tokenA" | ConvertFrom-Json
Write-Output "Conversations count: $($convA.data.Length)"
if ($convA.data.Length -gt 0) {
  $convA.data | ForEach-Object { Write-Output "  - $($_.title) [ID: $($_.id)]" }
}

# Try User B
$bodyB = '{"email":"68004297jor@gmail.com","password":"TestPass123!"}'
$responseB = curl.exe -s -X POST "https://rgzfcsyszhuoxnjwulqc.supabase.co/auth/v1/token?grant_type=password" `
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnemZjc3lzemh1b3huand1bHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5ODc4MzQsImV4cCI6MjA5NDU2MzgzNH0.X-AZL9jEVCG1o7gY8klsFcPQXdIGhNNZhbhj5nbU8U8" `
  -H "Content-Type: application/json" -d $bodyB

$jsonB = $responseB | ConvertFrom-Json
$tokenB = $jsonB.access_token

if ($tokenB) {
  Write-Output "`n=== User B (68004297jor@gmail.com) ==="
  $convB = curl.exe -s "http://localhost:3002/api/conversations" -H "Authorization: Bearer $tokenB" | ConvertFrom-Json
  Write-Output "Conversations count: $($convB.data.Length)"
  if ($convB.data.Length -gt 0) {
    $convB.data | ForEach-Object { Write-Output "  - $($_.title) [ID: $($_.id)]" }
  }

  # Check overlap
  $idsA = $convA.data | ForEach-Object { $_.id }
  $idsB = $convB.data | ForEach-Object { $_.id }
  $overlap = $idsA | Where-Object { $idsB -contains $_ }
  
  Write-Output "`n=== ISOLATION CHECK ==="
  if ($overlap.Length -gt 0) {
    Write-Output "FAIL: Found $($overlap.Length) shared conversation(s)!"
    Write-Output "Shared IDs: $overlap"
  } else {
    Write-Output "PASS: No shared conversations between users"
  }
  
  if ($convA.data.Length -eq $convB.data.Length -and $convA.data.Length -gt 0) {
    Write-Output "WARNING: Both users have the same number of conversations"
  }
} else {
  Write-Output "`nUser B not found (68004297jor@gmail.com)"
  Write-Output "Only tested User A"
}
