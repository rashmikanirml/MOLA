$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$distPath = Join-Path $repoRoot "dist"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$commit = (git -C $repoRoot rev-parse --short HEAD).Trim()
$version = "$timestamp-$commit"
$releaseFolder = Join-Path $distPath "mola-release-$version"

if (Test-Path $releaseFolder) {
    Remove-Item $releaseFolder -Recurse -Force
}

New-Item -ItemType Directory -Path $releaseFolder | Out-Null

Write-Host "Building backend..." -ForegroundColor Cyan
Set-Location (Join-Path $repoRoot "mola-backend")
.\mvnw.cmd clean package -DskipTests

Write-Host "Building frontend..." -ForegroundColor Cyan
Set-Location (Join-Path $repoRoot "mola-frontend")
npm run build

Set-Location $repoRoot

Copy-Item "README.md" -Destination $releaseFolder
Copy-Item "docker-compose.yml" -Destination $releaseFolder

New-Item -ItemType Directory -Path (Join-Path $releaseFolder "mola-backend") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $releaseFolder "mola-frontend") | Out-Null

Copy-Item "mola-backend\target\*.jar" -Destination (Join-Path $releaseFolder "mola-backend")
Copy-Item "mola-backend\Dockerfile" -Destination (Join-Path $releaseFolder "mola-backend")
Copy-Item "mola-frontend\Dockerfile" -Destination (Join-Path $releaseFolder "mola-frontend")
Copy-Item "mola-frontend\nginx.conf" -Destination (Join-Path $releaseFolder "mola-frontend")
Copy-Item "mola-frontend\build" -Destination (Join-Path $releaseFolder "mola-frontend") -Recurse

$zipPath = Join-Path $distPath "mola-release-$version.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path "$releaseFolder\*" -DestinationPath $zipPath

Write-Host "Release package created:" -ForegroundColor Green
Write-Host $zipPath -ForegroundColor Yellow
