# run_server.ps1
if (-not (Test-Path ".venv")) {
    Write-Error "Virtual environment not found. Please run '.\setup_env.ps1' first."
    exit 1
}

Write-Host "Starting Backend Server..."
& ".\.venv\Scripts\python" -m uvicorn services.main:app --reload --host 0.0.0.0 --port 8000
