@echo off
chcp 65001 >nul
title CHEM-IS-TRY
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js not found. Install from https://nodejs.org/
  pause
  exit /b 1
)
if not exist "node_modules\" (
  echo [Setup] npm install...
  call npm install
  if errorlevel 1 ( pause & exit /b 1 )
)
echo Starting CHEM-IS-TRY ...
echo Open: http://localhost:5173
call npm run dev
echo.
echo [Server stopped]
pause
