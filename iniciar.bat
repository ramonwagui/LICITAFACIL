@echo off
echo ========================================
echo   LicitaFácil - Iniciar Sistema
echo ========================================
echo.

echo [1/3] VerificandoNode.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado. Instale em nodejs.org
    pause
    exit /b 1
)
echo OK - Node.js encontrado

echo.
echo [2/3] Verificando banco de dados...
if not exist "backend\licitafacil.db" (
    echo Criando banco de dados...
)

echo.
echo [3/3] Iniciando servidor...
echo.
echo Acesse: http://localhost:3001
echo Login: admin@licitafacil.com.br
echo Senha: admin123
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

cd backend
node server.js