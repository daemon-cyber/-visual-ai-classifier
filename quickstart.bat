@echo off
title Visual AI Classifier - Setup
echo.
echo ============================================
echo   VISUAL AI CLASSIFIER - QUICK START
echo   ANTHONY OLUEBUBECHUKWU STEPHEN
echo   CYBERSECURITY - 20231388422
echo ============================================
echo.

:: ---- Backend ----
echo [1/4] Setting up Python backend...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
if not exist .env copy .env.example .env
echo Backend ready!
echo.

:: ---- Start backend in new window ----
echo [2/4] Starting backend server...
start "Backend - Flask API" cmd /k "cd /d %cd% && venv\Scripts\activate && python app.py"
timeout /t 3 /nobreak >nul

:: ---- Frontend ----
echo [3/4] Setting up frontend...
cd ..\frontend
npm install
if not exist .env.local copy .env.example .env.local
echo Frontend ready!
echo.

:: ---- Start frontend ----
echo [4/4] Starting frontend...
start "Frontend - React App" cmd /k "cd /d %cd% && npm run dev"
timeout /t 4 /nobreak >nul

echo.
echo ============================================
echo   ✅  BOTH SERVERS ARE STARTING!
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo.
echo   Open http://localhost:5173 in your browser
echo ============================================
echo.
pause
