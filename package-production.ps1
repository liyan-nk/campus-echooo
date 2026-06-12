# PowerShell packaging script for Campus Echo
Write-Host "Preparing Campus Echo Production Bundle..." -ForegroundColor Cyan

$TempDir = Join-Path $PSScriptRoot "temp-prod"
if (Test-Path $TempDir) { 
    Remove-Item $TempDir -Recurse -Force 
}
New-Item -ItemType Directory -Path $TempDir | Out-Null

# Create destination structures
New-Item -ItemType Directory -Path (Join-Path $TempDir "backend") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $TempDir "frontend") | Out-Null

# Copy backend files (excluding node_modules, dist)
Get-ChildItem -Path "backend" | Where-Object { $_.Name -ne "node_modules" -and $_.Name -ne "dist" } | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination (Join-Path $TempDir "backend") -Recurse -Force
}

# Copy frontend files (excluding node_modules, .next)
Get-ChildItem -Path "frontend" | Where-Object { $_.Name -ne "node_modules" -and $_.Name -ne ".next" } | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination (Join-Path $TempDir "frontend") -Recurse -Force
}

# Copy root configurations
Copy-Item -Path "package.json", "docker-compose.yml" -Destination $TempDir -Force

if (Test-Path "Campus-Echo-Production.zip") { 
    Remove-Item "Campus-Echo-Production.zip" -Force 
}

Write-Host "Zipping files..." -ForegroundColor Cyan
# Compress the temporary folder contents
Compress-Archive -Path "$TempDir\*" -DestinationPath "Campus-Echo-Production.zip" -Force

# Cleanup
Remove-Item $TempDir -Recurse -Force

Write-Host "Successfully created Campus-Echo-Production.zip!" -ForegroundColor Green
