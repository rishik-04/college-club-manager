@echo off
echo ===================================================
echo   Starting College Club Manager (Full Stack)
echo ===================================================

echo Starting Backend (FastAPI on port 8000)...
start "CCM Backend" cmd /k "cd backend && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

timeout /t 2 /nobreak >nul

echo Starting Frontend (Vite on port 5173)...
start "CCM Frontend" cmd /k "cd frontend && npm.cmd run dev"

echo.
echo Application launched!
echo - Web App: http://localhost:5173
echo - API Docs: http://localhost:8000/docs
echo ===================================================
pause
