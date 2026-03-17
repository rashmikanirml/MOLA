$ErrorActionPreference = "Stop"

Write-Host "Building MOLA backend..." -ForegroundColor Cyan
Set-Location "mola-backend"
.\mvnw.cmd clean package -DskipTests

Write-Host "Building MOLA frontend..." -ForegroundColor Cyan
Set-Location "..\mola-frontend"
npm run build

Set-Location ".."
Write-Host "Build completed successfully." -ForegroundColor Green
