# setup_env.ps1
Write-Host "Checking for compatible Python versions (3.10, 3.11, 3.12)..."

$targetVersions = @("3.10", "3.11", "3.12")
$pythonCmd = $null

# Try to find a compatible python version
foreach ($ver in $targetVersions) {
    $cmd = "python$ver"
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        $pythonCmd = $cmd
        break
    }
    # Check for py launcher
    if (Get-Command "py" -ErrorAction SilentlyContinue) {
        $test = py -$ver --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            $pythonCmd = "py -$ver"
            break
        }
    }
}

if ($null -eq $pythonCmd) {
    Write-Error "No compatible Python version found (3.10, 3.11, or 3.12)."
    Write-Host "Please install Python 3.11 from https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "Or use 'winget install Python.Python.3.11'" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found compatible Python: $pythonCmd" -ForegroundColor Green

# Create venv if it doesn't exist
if (-not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment..."
    Invoke-Expression "$pythonCmd -m venv .venv"
} else {
    Write-Host "Virtual environment already exists."
}

# Activate and install requirements
Write-Host "Installing dependencies..."
& ".\.venv\Scripts\python" -m pip install --upgrade pip
& ".\.venv\Scripts\python" -m pip install -r requirements.txt

Write-Host "Setup complete! You can now run '.\run_server.ps1'" -ForegroundColor Green
