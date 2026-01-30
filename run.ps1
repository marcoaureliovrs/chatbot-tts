# Script PowerShell para executar comandos npm comuns
# Uso: .\run.ps1 [comando]
# Exemplos: .\run.ps1 start | .\run.ps1 test | .\run.ps1 install

param(
    [Parameter(Position=0)]
    [string]$Command = "start"
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Verifica se Node.js está disponível
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERRO] Node.js nao encontrado no PATH." -ForegroundColor Red
    Write-Host "   Por favor, adicione Node.js ao PATH ou reinstale o Node.js." -ForegroundColor Yellow
    Write-Host "   Download: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verifica se npm está disponível
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[ERRO] npm nao encontrado no PATH." -ForegroundColor Red
    exit 1
}

Write-Host "Executando: npm $Command" -ForegroundColor Cyan
Write-Host ""

# Executa o comando npm
npm $Command

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERRO] Erro ao executar o comando." -ForegroundColor Red
    exit $LASTEXITCODE
}
