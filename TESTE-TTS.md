# 🔊 Guia de Teste do Sistema TTS

## Como Testar o Sistema

### 1. Inicie o Servidor

```powershell
npm start
```

O servidor deve iniciar em `http://localhost:3000`

### 2. Teste Direto no Navegador

Acesse: **http://localhost:3000/test**

Esta é uma página de teste standalone que permite:
- ✅ Testar o áudio diretamente (sem precisar do bot)
- ✅ Ver diagnóstico do sistema
- ✅ Adicionar mensagens à fila TTS
- ✅ Ver logs detalhados de debug

#### Como Usar a Página de Teste:

1. Digite um texto no campo
2. Clique em "Testar Áudio" para ouvir imediatamente
3. Ou clique em "Adicionar à Fila TTS" para testar com o sistema de fila

### 3. Teste com o Player (para OBS)

Acesse: **http://localhost:3000/player.html**

Esta é a página que você deve usar como fonte no OBS.

#### Primeira vez usando:
1. A página pedirá para você clicar em "Ativar Áudio"
2. **IMPORTANTE**: Clique no botão para permitir autoplay
3. Deixe esta página aberta no navegador

### 4. Teste com o Bot da Twitch

No chat da Twitch, digite:

```
!fala Olá, este é um teste
```

O bot deve:
1. Capturar sua mensagem
2. Adicionar à fila TTS
3. O player deve reproduzir o áudio

### Comandos Disponíveis

| Comando | Descrição | Quem Pode Usar |
|---------|-----------|----------------|
| `!fala <texto>` | Fala uma mensagem | Todos |
| `!ttshelp` | Mostra ajuda | Todos |
| `!ttsstatus` | Mostra status do TTS | Todos |
| `!ttspause` | Pausa o TTS | Mods/Streamer |
| `!ttsresume` | Retoma o TTS | Mods/Streamer |
| `!ttsvolume <0-100>` | Ajusta volume | Mods/Streamer |

## Permissões do Navegador Necessárias

### ⚠️ IMPORTANTE: Autoplay

Navegadores modernos (Chrome, Firefox, Edge) bloqueiam autoplay de áudio por padrão.

#### Soluções:

1. **Clique no botão "Ativar Áudio"** quando solicitado
2. **No Chrome/Edge**: 
   - Vá em `chrome://settings/content/sound`
   - Adicione `http://localhost:3000` na lista de permitidos
3. **No Firefox**:
   - Clique no ícone de cadeado na barra de endereços
   - Permita "Reprodução automática"

### Para OBS

No OBS, você precisa:
1. Adicionar uma fonte "Navegador"
2. URL: `http://localhost:3000/player.html`
3. Largura: 800px
4. Altura: 600px
5. ✅ **IMPORTANTE**: Marcar "Controlar áudio via OBS"
6. Interagir com a página (clique direito > Interagir)
7. Clicar no botão "Ativar Áudio"

## Troubleshooting - Problemas Comuns

### ❌ "Áudio não toca"

**Causas possíveis:**

1. **Autoplay bloqueado**
   - Solução: Clique no botão "Ativar Áudio"

2. **Sem som no navegador**
   - Verifique volume do navegador
   - Verifique se não está mutado

3. **Erro de rede**
   - Verifique conexão com internet
   - Google Translate pode estar bloqueado
   - Tente usar VPN se necessário

### ❌ "Mensagem não chega à fila"

**Verifique:**

1. Bot está conectado?
   - Veja os logs do servidor
   - Deve mostrar: `🤖 Bot conectado`

2. Comando está correto?
   - Use: `!fala sua mensagem`
   - Não: `!speak` ou `!say`

3. Está em cooldown?
   - Aguarde alguns segundos entre mensagens

### ❌ "Player.html não funciona no OBS"

**Soluções:**

1. Certifique-se que marcou "Controlar áudio via OBS"
2. Interaja com a página (botão direito > Interagir)
3. Clique em "Ativar Áudio"
4. Reinicie o OBS se necessário

## Testes de Debug

### Console do Navegador

Abra o Console (F12) e execute:

```javascript
// Teste manual de áudio
window.testTTS("Teste de áudio manual");

// Verifica estado da fila
fetch('/api/tts/state')
  .then(r => r.json())
  .then(console.log);
```

### Logs do Servidor

O servidor mostra logs detalhados:

```
✅ TTS adicionado à fila: "Teste enviou olá mundo..." (usuário: teste, fila: 1)
🔊 Tocando TTS: "Teste enviou olá mundo..."
✅ TTS finalizado e removido da fila
```

### Verificar Fila via API

```bash
# No PowerShell
Invoke-RestMethod -Uri http://localhost:3000/api/tts/state

# Adicionar teste à fila
$body = @{
    text = "Teste de áudio"
    username = "teste"
    priority = 0
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/tts/queue -Method POST -Body $body -ContentType "application/json"
```

## Estrutura do Sistema

```
Twitch Chat (!fala)
    ↓
Bot (bot.js) - Captura mensagem
    ↓
Servidor (server.js) - Adiciona à fila
    ↓
Player (player.html) - Polling a cada 500ms
    ↓
Google Translate TTS - Gera áudio
    ↓
🔊 Reproduz no navegador
```

## URLs Importantes

| URL | Descrição |
|-----|-----------|
| http://localhost:3000 | Dashboard principal |
| http://localhost:3000/test | **Página de teste standalone** ⭐ |
| http://localhost:3000/player.html | Player para OBS |
| http://localhost:3000/api/tts/state | Estado da fila (JSON) |
| http://localhost:3000/health | Health check |

## Dicas

1. **Sempre teste primeiro** na página de teste (`/test`)
2. **Ative o áudio** antes de usar (clique no botão)
3. **Mantenha a aba aberta** - se fechar, para de funcionar
4. **Use o Console** (F12) para ver logs detalhados
5. **No OBS**, sempre marque "Controlar áudio via OBS"

## Suporte

Se ainda não funcionar:

1. Veja os logs do servidor (terminal)
2. Abra o Console do navegador (F12)
3. Teste na página `/test` primeiro
4. Verifique se o Google Translate está acessível
5. Tente em outro navegador (Chrome recomendado)

---

**Versão do Sistema**: 2.0  
**Última Atualização**: Janeiro 2026
