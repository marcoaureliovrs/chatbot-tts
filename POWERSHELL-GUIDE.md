# 🪟 Guia PowerShell - Comandos npm

Este guia mostra como usar comandos npm no PowerShell do Windows.

## 🚀 Formas de Executar Comandos npm

### Opção 1: Comandos Diretos (Recomendado)

Se Node.js e npm estão instalados corretamente, você pode usar diretamente:

```powershell
npm install
npm start
npm test
npm run dev
```

### Opção 2: Script de Setup Automático

Execute o script de configuração:

```powershell
.\setup.ps1
```

Este script irá:
- ✅ Verificar se Node.js e npm estão instalados
- ✅ Instalar todas as dependências do projeto
- ✅ Mostrar comandos disponíveis

### Opção 3: Script de Execução

Use o script `run.ps1` para executar comandos npm:

```powershell
.\run.ps1 start      # Equivale a: npm start
.\run.ps1 test       # Equivale a: npm test
.\run.ps1 install    # Equivale a: npm install
.\run.ps1 dev        # Equivale a: npm run dev
```

### Opção 4: Funções PowerShell (Avançado)

Carregue funções úteis no PowerShell:

```powershell
# Carregar as funções
. .\npm-commands.ps1

# Agora você pode usar:
npm-start
npm-test
npm-install
npm-dev
npm-check
npm-help
```

## 🔧 Solução de Problemas

### PowerShell não reconhece npm

Se você receber o erro "npm não é reconhecido como comando", siga estes passos:

1. **Verifique se Node.js está instalado:**
   ```powershell
   node --version
   ```

2. **Verifique se npm está instalado:**
   ```powershell
   npm --version
   ```

3. **Se não funcionar, adicione ao PATH:**
   - Abra "Variáveis de Ambiente" no Windows
   - Adicione o caminho do Node.js ao PATH (geralmente: `C:\Program Files\nodejs\`)
   - Reinicie o PowerShell

4. **Ou reinstale o Node.js:**
   - Baixe em: https://nodejs.org/
   - Durante a instalação, marque a opção "Add to PATH"

### Erro de Política de Execução

Se você receber um erro sobre política de execução:

```powershell
# Verifique a política atual
Get-ExecutionPolicy

# Se for "Restricted", altere para "RemoteSigned" (requer admin)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Comandos npm não funcionam

1. **Verifique se está no diretório correto:**
   ```powershell
   Get-Location
   # Deve estar em: ...\chatbot-tts-main\chatbot-tts-main
   ```

2. **Verifique se package.json existe:**
   ```powershell
   Test-Path package.json
   ```

3. **Instale as dependências:**
   ```powershell
   npm install
   ```

## 📋 Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm install` | Instala todas as dependências |
| `npm start` | Inicia o servidor e bot |
| `npm test` | Executa os testes |
| `npm run dev` | Modo desenvolvimento |
| `npm list` | Lista dependências instaladas |
| `npm outdated` | Verifica dependências desatualizadas |
| `npm update` | Atualiza dependências |

## 🎯 Exemplo de Uso Completo

```powershell
# 1. Navegue até o diretório do projeto
cd C:\Users\marco\OneDrive\Documents\chatbot-tts-main\chatbot-tts-main

# 2. Execute o setup (primeira vez)
.\setup.ps1

# 3. Configure o arquivo .env (copie do env.example.txt)
Copy-Item env.example.txt .env
# Edite o .env com suas credenciais

# 4. Inicie o projeto
npm start
```

## 💡 Dicas

- Use `Ctrl+C` para parar o servidor quando estiver rodando
- Use `Tab` para autocompletar comandos no PowerShell
- Use `Get-History` para ver comandos anteriores
- Use `Clear-Host` ou `cls` para limpar a tela
