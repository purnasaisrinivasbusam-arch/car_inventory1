@echo off
echo Starting Car Portal Application...
echo.

REM Start backend in background
start "Backend Server" cmd /c "cd backend && npm run dev"

REM Wait a moment for backend to start
timeout /t 5 /nobreak > nul

REM Start frontend
cd frontend && npm run dev
