@echo off
cd /d "%~dp0"
if not exist .env.local copy .env.example .env.local >nul
if not exist node_modules call npm.cmd ci
if errorlevel 1 goto failed
call npm.cmd run db:generate
if errorlevel 1 goto failed
echo Open http://localhost:3000
call npm.cmd run dev
goto end
:failed
echo Setup failed. Read the error above.
pause
:end
