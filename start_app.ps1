Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting College Club Manager (Full Stack)" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

Write-Host "Starting Backend on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8000"

Start-Sleep -Seconds 2

Write-Host "Starting Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm.cmd run dev"

Write-Host "`nBoth services started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor White
