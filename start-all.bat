@echo off
echo Iniciando Sistema Completo...
echo.
echo 1. Iniciando Backend...
start "Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
echo.
echo 2. Iniciando Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul
echo.
echo 3. Iniciando Prisma Studio...
start "Prisma Studio" cmd /k "cd backend && npx prisma studio --port 2029"
echo.
echo ✅ Sistema iniciado!
echo.
echo Acesse:
echo - Frontend: http://localhost:2027
echo - Backend: http://localhost:2028
echo - Prisma Studio: http://localhost:2029
echo.
pause
