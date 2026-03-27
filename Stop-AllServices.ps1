<#
.SYNOPSIS
    Stops all Polybot services.
.DESCRIPTION
    Reads PID files from the logs directory and stops each service process gracefully.
#>
[CmdletBinding()]
param()

$ErrorActionPreference = "Continue"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Stopping All Polybot Services" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$LogsDir = Join-Path $ProjectRoot "logs"

$services = @(
    "analytics-service",
    "ingestor-service",
    "strategy-service",
    "executor-service",
    "infrastructure-orchestrator-service"
)

foreach ($svc in $services) {
    $pidFile = Join-Path $LogsDir "$svc.pid"
    
    if (Test-Path $pidFile) {
        $pid = [int](Get-Content $pidFile -Raw).Trim()
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        
        if ($process) {
            Write-Host "Stopping $svc (PID: $pid)..." -ForegroundColor Yellow
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
            
            $stillRunning = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($stillRunning) {
                Write-Host "  Force stopping $svc..." -ForegroundColor Red
                Stop-Process -Id $pid -Force
            }
            Write-Host "  Stopped" -ForegroundColor Green
        } else {
            Write-Host "$svc is not running (stale PID file)" -ForegroundColor Gray
        }
        
        Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
    } else {
        Write-Host "${svc}: No PID file found" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "All services stopped" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
