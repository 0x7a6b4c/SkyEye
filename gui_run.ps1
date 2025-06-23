# Exit on error
$ErrorActionPreference = "Stop"

# ---- Backend setup ----
Write-Host "Setting up Python virtual environment..."
python -m venv .venv
& .\.venv\Scripts\Activate.ps1

Write-Host "Installing backend dependencies..."
pip install -r requirements.txt

Write-Host "Starting backend (Uvicorn)..."
$backend = Start-Process -NoNewWindow -PassThru -FilePath "uvicorn" -ArgumentList "api:app", "--reload"
Write-Host "Backend started with PID $($backend.Id)"

# ---- Frontend setup ----
Set-Location skyeye-frontend

Write-Host "Installing frontend dependencies..."
npm install

Write-Host "Building frontend (npm run build)..."
npm run build

Write-Host "Starting frontend (npm start)..."
$frontend = Start-Process -NoNewWindow -PassThru -FilePath "npm" -ArgumentList "start"
Write-Host "Frontend started with PID $($frontend.Id)"

Write-Host "`nBoth backend and frontend are running."
Write-Host "Press Ctrl+C in this window to stop both processes."

# Handle termination and cleanup
Register-EngineEvent PowerShell.Exiting -Action {
    Write-Host "Stopping backend and frontend processes..."
    try { $backend | Stop-Process -Force } catch {}
    try { $frontend | Stop-Process -Force } catch {}
}

# Wait for both processes to exit
Wait-Process -Id $backend.Id, $frontend.Id