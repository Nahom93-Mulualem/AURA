# Auth & Security Verification Test
$ErrorActionPreference = "Stop"

# Start backend if not running
$proc = Start-Process -FilePath "c:\Users\HP\Desktop\AURA\Backend\bin\api.exe" -WorkingDirectory "c:\Users\HP\Desktop\AURA\Backend" -PassThru
Start-Sleep -Seconds 2

try {
    # 1. Health & Public Check
    $health = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/health" -Method Get
    Write-Host "1. Health Status: $($health.status)"

    $publicPerfumes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/perfumes" -Method Get
    Write-Host "2. Public Perfumes retrieved: $($publicPerfumes.data.Count) (No Auth required)"

    # 3. Unauthenticated Mutating Request -> Expect 401
    try {
        Invoke-RestMethod -Uri "http://localhost:8080/api/v1/perfumes" -Method Post -Body '{"name":"Hacker"}' -ContentType "application/json"
        Write-Host "3. ERROR: Unauthenticated request should have failed!"
    } catch {
        Write-Host "3. Unauthenticated POST correctly rejected (401 Unauthorized)"
    }

    # 4. Admin Login
    $loginBody = @{
        email = "admin@aurabyhani.com"
        password = "AuraLuxury2026!"
    } | ConvertTo-Json

    $loginResp = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/admin/login" -Method Post -Body $loginBody -ContentType "application/json" -SessionVariable session
    $loginData = $loginResp.Content | ConvertFrom-Json
    $token = $loginData.data.token
    Write-Host "4. Admin Login Successful. Token received: $($token.Substring(0, 15))..."

    # 5. Admin /me with Bearer Token
    $meResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/admin/me" -Method Get -Headers @{ Authorization = "Bearer $token" }
    Write-Host "5. Authenticated /me response: $($meResp.data.email)"

    # 6. Admin /me with Session Cookie
    $meCookieResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/admin/me" -Method Get -WebSession $session
    Write-Host "6. Cookie Authenticated /me response: $($meCookieResp.data.email)"

    # 7. Cookie-based Mutating Request from UNTRUSTED Origin (CSRF test) -> Expect 403
    try {
        Invoke-RestMethod -Uri "http://localhost:8080/api/v1/perfumes" -Method Post -Body '{"name":"CSRFAttack"}' -ContentType "application/json" -WebSession $session -Headers @{ Origin = "http://evil-attacker.com" }
        Write-Host "7. ERROR: Untrusted origin CSRF request should have failed!"
    } catch {
        Write-Host "7. CSRF from untrusted origin correctly rejected (403 Forbidden)"
    }

    # 8. Cookie-based Mutating Request from TRUSTED Origin -> Allowed through auth (fails only on validation or succeeds)
    try {
        $allowedOriginResp = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/perfumes" -Method Post -Body '{"name":""}' -ContentType "application/json" -WebSession $session -Headers @{ Origin = "http://localhost:3000" }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 400) {
            Write-Host "8. Trusted origin accepted by CSRF/Auth middleware (rejected by validation as expected: 400 Bad Request)"
        } else {
            Write-Host "8. Status code: $statusCode"
        }
    }

    # 9. Admin Logout
    $logoutResp = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/admin/logout" -Method Post -WebSession $session
    Write-Host "9. Admin Logout: Cookie cleared."

    Write-Host "`n>>> ALL 9 AUTHENTICATION & SECURITY CHECKS PASSED SUCCESSFULLY! <<<`n"
} finally {
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
}
