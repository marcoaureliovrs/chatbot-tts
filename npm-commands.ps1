# Script PowerShell com funcoes uteis para comandos npm
# Carregue este arquivo no PowerShell: . .\npm-commands.ps1
# Depois use: npm-start, npm-test, npm-install, etc.

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function npm-start {
    Write-Host "Iniciando o servidor e bot..." -ForegroundColor Cyan
    npm start
}

function npm-test {
    Write-Host "Executando testes..." -ForegroundColor Cyan
    npm test
}

function npm-install {
    Write-Host "Instalando dependencias..." -ForegroundColor Cyan
    npm install
}

function npm-dev {
    Write-Host "Modo desenvolvimento..." -ForegroundColor Cyan
    npm run dev
}

function npm-check {
    Write-Host "Verificando ambiente..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Node.js:" -ForegroundColor Yellow
    node --version
    Write-Host ""
    Write-Host "npm:" -ForegroundColor Yellow
    npm --version
    Write-Host ""
    Write-Host "Dependencias instaladas:" -ForegroundColor Yellow
    if (Test-Path "node_modules") {
        Write-Host "[OK] node_modules encontrado" -ForegroundColor Green
    } else {
        Write-Host "[ERRO] node_modules nao encontrado. Execute: npm install" -ForegroundColor Red
    }
}

# Mostra ajuda
function npm-help {
    Write-Host "Comandos disponiveis:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  npm-start    - Inicia o servidor e bot" -ForegroundColor Yellow
    Write-Host "  npm-test     - Executa os testes" -ForegroundColor Yellow
    Write-Host "  npm-install  - Instala as dependencias" -ForegroundColor Yellow
    Write-Host "  npm-dev      - Modo desenvolvimento" -ForegroundColor Yellow
    Write-Host "  npm-check    - Verifica o ambiente" -ForegroundColor Yellow
    Write-Host "  npm-help     - Mostra esta ajuda" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ou use diretamente: npm start, npm test, etc." -ForegroundColor Gray
}

Write-Host "[OK] Funcoes npm carregadas! Use 'npm-help' para ver os comandos disponiveis." -ForegroundColor Green
