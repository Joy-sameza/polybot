<#
.SYNOPSIS
    Starts all Polybot services.
.DESCRIPTION
    Builds the TypeScript monorepo if needed, then starts all five NestJS services
    as background processes with output redirected to log files.
#>
[CmdletBinding()]
param(
    [switch]$SkipBuild,
    [string]$Profile = "develop"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Set-Location $ProjectRoot

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Starting All Polybot Services" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Build if needed
if (-not $SkipBuild) {
    Write-Host "Building all services..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed"
        exit 1
    }
    Write-Host ""
}

# Create logs directory
$LogsDir = Join-Path $ProjectRoot "logs"
if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir -Force | Out-Null
}

Write-Host "Starting services in background..." -ForegroundColor Yellow
Write-Host ""

$services = @(
    @{ Name = "infrastructure-orchestrator-service"; Port = 8084; Workspace = "apps/infrastructure-orchestrator-service" },
    @{ Name = "executor-service"; Port = 8080; Workspace = "apps/executor-service" },
    @{ Name = "strategy-service"; Port = 8081; Workspace = "apps/strategy-service" },
    @{ Name = "ingestor-service"; Port = 8083; Workspace = "apps/ingestor-service" },
    @{ Name = "analytics-service"; Port = 8082; Workspace = "apps/analytics-service" }
)

$index = 1
foreach ($svc in $services) {
    $logFile = Join-Path $LogsDir "$($svc.Name).log"
    $pidFile = Join-Path $LogsDir "$($svc.Name).pid"
    
    Write-Host "$index. Starting $($svc.Name) (port $($svc.Port))..." -ForegroundColor Green
    
    $proc = Start-Process -FilePath "node" `
        -ArgumentList "dist/main.js" `
        -WorkingDirectory (Join-Path $ProjectRoot $svc.Workspace) `
        -RedirectStandardOutput $logFile `
        -RedirectStandardError (Join-Path $LogsDir "$($svc.Name).err.log") `
        -PassThru -NoNewWindow
    
    $proc.Id | Out-File -FilePath $pidFile -Encoding ascii -NoNewline
    Write-Host "   PID: $($proc.Id)"
    
    if ($svc.Name -eq "infrastructure-orchestrator-service") {
        Write-Host "   Waiting for infrastructure to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
    
    $index++
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "All services started" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor White
Write-Host "  Executor:         http://localhost:8080/api/polymarket/health"
Write-Host "  Strategy:         http://localhost:8081/api/strategy/status"
Write-Host "  Analytics:        http://localhost:8082/api/analytics/status"
Write-Host "  Ingestor:         http://localhost:8083/api/ingestor/status"
Write-Host "  Infrastructure:   http://localhost:8084/api/infrastructure/status"
Write-Host ""
Write-Host "Logs: Get-Content -Wait logs/<service>.log" -ForegroundColor Gray
Write-Host "Stop: .\Stop-AllServices.ps1" -ForegroundColor Gray
