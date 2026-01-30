# Script de Diagnóstico do Sistema TTS
# Execute este script para verificar se tudo está funcionando

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DIAGNÓSTICO DO SISTEMA TTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verifica Node.js
Write-Host "1. Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js não encontrado! Instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# 2. Verifica npm
Write-Host ""
Write-Host "2. Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm instalado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm não encontrado!" -ForegroundColor Red
    exit 1
}

# 3. Verifica se as dependências estão instaladas
Write-Host ""
Write-Host "3. Verificando dependências..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules encontrado" -ForegroundColor Green
    
    # Verifica pacotes principais
    $packages = @("tmi.js", "express", "dotenv")
    foreach ($package in $packages) {
        if (Test-Path "node_modules/$package") {
            Write-Host "   ✅ $package instalado" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $package não encontrado" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   ❌ node_modules não encontrado!" -ForegroundColor Red
    Write-Host "   Execute: npm install" -ForegroundColor Yellow
}

# 4. Verifica arquivo .env
Write-Host ""
Write-Host "4. Verificando arquivo .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   ✅ Arquivo .env encontrado" -ForegroundColor Green
    
    # Lê variáveis importantes
    $envContent = Get-Content ".env" -Raw
    
    if ($envContent -match "TWITCH_CLIENT_ID=.+") {
        Write-Host "   ✅ TWITCH_CLIENT_ID configurado" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  TWITCH_CLIENT_ID não configurado" -ForegroundColor Yellow
    }
    
    if ($envContent -match "TWITCH_CLIENT_SECRET=.+") {
        Write-Host "   ✅ TWITCH_CLIENT_SECRET configurado" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  TWITCH_CLIENT_SECRET não configurado" -ForegroundColor Yellow
    }
    
    if ($envContent -match "TWITCH_CHANNEL=.+") {
        Write-Host "   ✅ TWITCH_CHANNEL configurado" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  TWITCH_CHANNEL não configurado" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Arquivo .env não encontrado!" -ForegroundColor Red
    Write-Host "   Copie o arquivo env.example.txt para .env e configure" -ForegroundColor Yellow
}

# 5. Verifica tokens OAuth
Write-Host ""
Write-Host "5. Verificando autenticação OAuth..." -ForegroundColor Yellow
if (Test-Path ".twitch-tokens.json") {
    Write-Host "   ✅ Tokens OAuth encontrados" -ForegroundColor Green
    
    try {
        $tokens = Get-Content ".twitch-tokens.json" -Raw | ConvertFrom-Json
        if ($tokens.access_token) {
            Write-Host "   ✅ Access token presente" -ForegroundColor Green
        }
        if ($tokens.refresh_token) {
            Write-Host "   ✅ Refresh token presente" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ⚠️  Erro ao ler tokens" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Tokens OAuth não encontrados" -ForegroundColor Yellow
    Write-Host "   Execute o servidor e faça login em: http://localhost:3000/auth/login" -ForegroundColor Yellow
}

# 6. Verifica estrutura de pastas
Write-Host ""
Write-Host "6. Verificando estrutura do projeto..." -ForegroundColor Yellow
$folders = @("src", "public", "tests")
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Write-Host "   ✅ Pasta $folder/ existe" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Pasta $folder/ não encontrada!" -ForegroundColor Red
    }
}

# 7. Verifica arquivos importantes
Write-Host ""
Write-Host "7. Verificando arquivos importantes..." -ForegroundColor Yellow
$files = @(
    "src/index.js",
    "src/bot.js",
    "src/server.js",
    "src/tts.js",
    "public/player.html",
    "public/player-native.html",
    "public/test-tts.html",
    "package.json"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file não encontrado!" -ForegroundColor Red
    }
}

# 8. Testa conectividade com o servidor
Write-Host ""
Write-Host "8. Testando servidor..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Servidor está rodando!" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Timestamp: $($data.timestamp)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ⚠️  Servidor não está rodando" -ForegroundColor Yellow
    Write-Host "   Inicie o servidor com: npm start" -ForegroundColor Yellow
}

# 9. Testa API TTS
Write-Host ""
Write-Host "9. Testando API TTS..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/tts/state" -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ API TTS respondendo!" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Fila: $($data.queueSize) mensagens" -ForegroundColor Cyan
        Write-Host "   Status: $(if($data.enabled){'Ativado'}else{'Desativado'})" -ForegroundColor Cyan
        Write-Host "   Pausado: $(if($data.paused){'Sim'}else{'Não'})" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ⚠️  API TTS não está respondendo" -ForegroundColor Yellow
}

# Resumo
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RESUMO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Próximos Passos:" -ForegroundColor Yellow
Write-Host ""

if (!(Test-Path ".env")) {
    Write-Host "1. ❌ Configure o arquivo .env" -ForegroundColor Red
    Write-Host "   Copy-Item env.example.txt .env" -ForegroundColor Gray
    Write-Host ""
}

if (!(Test-Path "node_modules")) {
    Write-Host "2. ❌ Instale as dependências" -ForegroundColor Red
    Write-Host "   npm install" -ForegroundColor Gray
    Write-Host ""
}

if (!(Test-Path ".twitch-tokens.json")) {
    Write-Host "3. ⚠️  Faça login OAuth" -ForegroundColor Yellow
    Write-Host "   npm start" -ForegroundColor Gray
    Write-Host "   Depois acesse: http://localhost:3000/auth/login" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "4. 🧪 Teste o sistema" -ForegroundColor Green
Write-Host "   Acesse: http://localhost:3000/test" -ForegroundColor Gray
Write-Host ""

Write-Host "5. 🎮 Configure no OBS" -ForegroundColor Green
Write-Host "   Browser Source: http://localhost:3000/player.html" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Oferece iniciar o servidor se não estiver rodando
try {
    $null = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 1 -ErrorAction Stop
} catch {
    Write-Host "Deseja iniciar o servidor agora? (S/N): " -ForegroundColor Yellow -NoNewline
    $resposta = Read-Host
    if ($resposta -eq "S" -or $resposta -eq "s") {
        Write-Host ""
        Write-Host "Iniciando servidor..." -ForegroundColor Green
        npm start
    }
}
