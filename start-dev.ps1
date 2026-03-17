$ErrorActionPreference = "Stop"

Write-Host "Starting MOLA backend and frontend..." -ForegroundColor Cyan

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $repoRoot "mola-backend"
$frontendPath = Join-Path $repoRoot "mola-frontend"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; .\\mvnw.cmd spring-boot:run"

Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm start"

Write-Host "Backend and frontend launch commands executed." -ForegroundColor Green
Write-Host "Backend: http://localhost:8080" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
