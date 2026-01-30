# Script PowerShell para configurar e executar comandos npm do Node.js
# Uso: .\setup.ps1

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Verificando Node.js e npm..." -ForegroundColor Cyan

# Verifica se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Node.js nao encontrado. Por favor, instale o Node.js primeiro." -ForegroundColor Red
    Write-Host "   Download: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verifica se npm está instalado
try {
    $npmVersion = npm --version
    Write-Host "[OK] npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] npm nao encontrado. Por favor, instale o npm primeiro." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Instalando dependencias do projeto..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Dependencias instaladas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "[ERRO] Erro ao instalar dependencias." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Configuracao concluida! Voce pode usar os seguintes comandos:" -ForegroundColor Cyan
Write-Host "   npm start  - Inicia o servidor e o bot" -ForegroundColor Yellow
Write-Host "   npm test   - Executa os testes" -ForegroundColor Yellow
Write-Host "   npm run dev - Modo desenvolvimento" -ForegroundColor Yellow
