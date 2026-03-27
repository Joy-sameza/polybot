<#
.SYNOPSIS
    Applies ClickHouse init DDL scripts.
.DESCRIPTION
    Runs all .sql files from the ClickHouse init directory against a ClickHouse instance,
    either via Docker container or HTTP API.
.PARAMETER ClickHouseUrl
    ClickHouse HTTP API URL. Default: http://127.0.0.1:8123
.PARAMETER Container
    Docker container name. Default: polybot-clickhouse
.PARAMETER InitDir
    Directory containing .sql init files. Default: analytics-service/clickhouse/init
#>
[CmdletBinding()]
param(
    [string]$ClickHouseUrl = $env:CLICKHOUSE_HTTP_URL,
    [string]$Container = $env:CLICKHOUSE_CONTAINER,
    [string]$InitDir = $env:CLICKHOUSE_INIT_DIR
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = (Resolve-Path (Join-Path $ScriptDir "..\..")).Path

if (-not $ClickHouseUrl) { $ClickHouseUrl = "http://127.0.0.1:8123" }
if (-not $Container) { $Container = "polybot-clickhouse" }
if (-not $InitDir) { $InitDir = Join-Path $RepoRoot "analytics-service\clickhouse\init" }

if (-not (Test-Path $InitDir)) {
    Write-Error "ClickHouse init directory not found: $InitDir"
    exit 1
}

$sqlFiles = Get-ChildItem -Path $InitDir -Filter "*.sql" | Sort-Object Name
if ($sqlFiles.Count -eq 0) {
    Write-Error "No .sql files found under: $InitDir"
    exit 1
}

Write-Host "Applying ClickHouse init DDL from $InitDir" -ForegroundColor Cyan

# Try Docker first
$useDocker = $false
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $running = docker ps --format '{{.Names}}' 2>$null | Where-Object { $_ -eq $Container }
    if ($running) {
        $useDocker = $true
        Write-Host "Using docker container: $Container" -ForegroundColor Green
    }
}

foreach ($sqlFile in $sqlFiles) {
    Write-Host "-> $($sqlFile.FullName)" -ForegroundColor Yellow
    
    if ($useDocker) {
        Get-Content $sqlFile.FullName -Raw | docker exec -i $Container clickhouse-client --multiquery
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to apply: $($sqlFile.Name)"
            exit 1
        }
    } else {
        $content = Get-Content $sqlFile.FullName -Raw
        $lines = $content -split "`n" | Where-Object { 
            $_.Trim() -and -not $_.Trim().StartsWith("--") 
        }
        $sql = $lines -join "`n"
        $statements = $sql -split ";" | Where-Object { $_.Trim() }
        
        foreach ($stmt in $statements) {
            $body = "$($stmt.Trim())`n"
            try {
                Invoke-RestMethod -Uri $ClickHouseUrl -Method Post -Body $body -ContentType "text/plain" | Out-Null
            } catch {
                Write-Error "Failed statement from $($sqlFile.Name): $($stmt.Substring(0, [Math]::Min(200, $stmt.Length)))"
                throw
            }
        }
    }
}

Write-Host "Done." -ForegroundColor Green
