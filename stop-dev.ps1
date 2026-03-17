$ErrorActionPreference = "SilentlyContinue"

function Stop-PortProcess {
    param(
        [Parameter(Mandatory = $true)]
        [int]$Port
    )

    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen
    foreach ($conn in $connections) {
        if ($conn.OwningProcess -gt 0) {
            Stop-Process -Id $conn.OwningProcess -Force
            Write-Host "Stopped process $($conn.OwningProcess) on port $Port" -ForegroundColor Green
        }
    }
}

Write-Host "Stopping MOLA services on ports 8080, 3000, 3001..." -ForegroundColor Cyan
Stop-PortProcess -Port 8080
Stop-PortProcess -Port 3000
Stop-PortProcess -Port 3001
Write-Host "Stop attempt completed." -ForegroundColor Yellow
