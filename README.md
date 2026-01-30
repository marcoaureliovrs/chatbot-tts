# 🎙️ Bot TTS para Twitch

Bot de Text-to-Speech para Twitch que utiliza o Google Translate TTS via URL, sem necessidade de baixar arquivos de áudio. Ideal para uso com OBS Browser Source.

## 🎯 Características

### TTS (Text-to-Speech)
- ✅ **OAuth Oficial** - Autenticação oficial da Twitch via OAuth 2.0
- ✅ **Gratuito** - Sem necessidade de API keys ou tokens pagos
- ✅ **Sem downloads** - Toca áudio diretamente via URL
- ✅ **Baixa latência** - Reprodução instantânea
- ✅ **Simples** - Arquitetura minimalista e fácil de configurar
- ✅ **Cooldown** - Sistema de cooldown para evitar spam
- ✅ **Validação** - Validação de tamanho e conteúdo do texto
- ✅ **Auto-refresh** - Tokens são atualizados automaticamente

### 📡 Gestão de Live (NOVO!)
- ✅ **Criar Clips** - Crie clips automaticamente durante a live
- ✅ **Rodar Comerciais** - Controle comerciais sem sair do OBS
- ✅ **Alterar Título** - Atualize o título da live em tempo real
- ✅ **Alterar Categoria** - Mude o jogo/categoria facilmente
- ✅ **Status ao Vivo** - Veja viewers, uptime e informações da stream
- ✅ **Permissões Incrementais** - Solicite apenas as permissões que precisa
- ✅ **Interface Integrada** - Tudo no mesmo dashboard

> 📖 **Documentação completa**: [GESTAO-LIVE.md](./GESTAO-LIVE.md)

## 📋 Requisitos

- Node.js 14+ 
- Conta na Twitch
- Aplicação registrada no [Console de Desenvolvedores da Twitch](https://dev.twitch.tv/console)
- OBS Studio (para usar como Browser Source)

## 🚀 Instalação

1. **Clone ou baixe o projeto**

```bash
cd bot-tts-chat
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

Copie o arquivo `env.example.txt` para `.env`:

```bash
# Windows PowerShell
Copy-Item env.example.txt .env

# Linux/Mac
cp env.example.txt .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Configurações OAuth da Twitch
TWITCH_CLIENT_ID=seu_client_id_aqui
TWITCH_CLIENT_SECRET=seu_client_secret_aqui
TWITCH_REDIRECT_URI=http://localhost:3000/auth/callback

# Configurações do Bot da Twitch
TWITCH_CHANNEL=seu_canal

# Configurações do Servidor
PORT=3000

# Configurações do TTS
TTS_LANGUAGE=pt-BR
TTS_MAX_LENGTH=200
TTS_COOLDOWN_SECONDS=3
```

### 🔑 Configuração OAuth da Twitch

**📖 Para instruções detalhadas, consulte o arquivo [OAUTH-SETUP.md](./OAUTH-SETUP.md)**

Resumo rápido:

1. Acesse: https://dev.twitch.tv/console/apps
2. Registre uma nova aplicação
3. Configure a URL de redirecionamento: `http://localhost:3000/auth/callback`
4. Copie o **Client ID** e gere um **Client Secret**
5. Cole no arquivo `.env`

## 🎮 Como Usar

1. **Faça login/autorização OAuth**

Primeiro, inicie o servidor:

```bash
npm start
```

Em seguida, abra no navegador:
```
http://localhost:3000/auth/login
```

Você será redirecionado para autorizar a aplicação na Twitch. Após autorizar, os tokens serão salvos automaticamente.

2. **Reinicie o servidor**

Após fazer login, reinicie a aplicação (Ctrl+C e depois `npm start` novamente).

Você verá mensagens como:

```
🚀 Iniciando servidor...
🚀 Servidor rodando em http://localhost:3000
🔐 URL de login: http://localhost:3000/auth/login
🔐 Verificando autenticação...
✅ Autenticação válida!
👤 Usuário autenticado: SeuNome (seunome)
🤖 Iniciando bot da Twitch...
🤖 Bot conectado em ...
📺 Canais: seu_canal
```

2. **Configure no OBS Studio**

### 🎯 Player Híbrido (Padrão - RECOMENDADO) ⭐

O sistema agora usa um **player híbrido inteligente** por padrão:

- Adicione uma nova fonte: **Browser Source**
- URL: `http://localhost:3000/player.html`
- Largura: 800
- Altura: 600
- Marque: **Controlar áudio via OBS**
- **IMPORTANTE**: Clique com botão direito > **Interagir** > Clique em "Ativar Áudio"

**Como funciona:**
- ✅ Tenta 3 métodos diferentes do Google Translate
- ✅ Se falhar, usa automaticamente Web Speech API (voz nativa)
- ✅ Fallback inteligente - **sempre funciona!**

### 🗣️ Player Alternativo (Apenas Voz Nativa)

Se preferir usar apenas voz nativa:

- URL: `http://localhost:3000/player-native.html`
- Mesmas configurações de largura/altura
- 100% confiável, funciona offline

**📖 Veja todos os players disponíveis:** [PLAYERS-DISPONIVEIS.md](./PLAYERS-DISPONIVEIS.md)

Ajuste o volume no Mixer de Áudio do OBS

3. **Use no chat da Twitch**

No chat da Twitch, digite:

```
!fala Olá chat, como vocês estão?
```

O bot irá:
- Capturar o comando
- Validar o texto
- Verificar cooldown
- Atualizar a página HTML
- Tocar o áudio automaticamente

## 📁 Estrutura do Projeto

```
bot-tts-chat/
├── src/
│   ├── index.js      # Arquivo principal (inicia servidor e bot)
│   ├── bot.js        # Lógica do bot da Twitch
│   ├── server.js     # Servidor HTTP Express
│   └── tts.js        # Geração de URLs do Google Translate TTS
├── public/
│   └── index.html    # Página HTML que toca o áudio
├── tests/
│   └── test.js       # Testes automatizados
├── .env.example      # Exemplo de configuração
├── package.json      # Dependências do projeto
└── README.md         # Esta documentação
```

## 🧪 Testes

### Testes Automatizados

Execute os testes automatizados:

```bash
npm test
```

Os testes validam:
- ✅ Geração de URLs do TTS
- ✅ Validação de texto
- ✅ Servidor HTTP
- ✅ Rotas e endpoints

### 🎯 Teste Manual do TTS (RECOMENDADO)

**⭐ ANTES de configurar no OBS, teste o sistema:**

1. Inicie o servidor:
```bash
npm start
```

2. Acesse a página de teste:
```
http://localhost:3000/test
```

3. Na página de teste você pode:
   - ✅ Testar o áudio diretamente (sem precisar do bot)
   - ✅ Ver diagnóstico completo do sistema
   - ✅ Adicionar mensagens à fila TTS
   - ✅ Ver logs detalhados em tempo real
   - ✅ Verificar se o navegador está bloqueando autoplay

**📖 Para guia completo de testes, consulte: [TESTE-TTS.md](./TESTE-TTS.md)**

## ⚙️ Configurações Avançadas

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `TWITCH_CLIENT_ID` | Client ID da aplicação Twitch | - |
| `TWITCH_CLIENT_SECRET` | Client Secret da aplicação Twitch | - |
| `TWITCH_REDIRECT_URI` | URL de redirecionamento OAuth | http://localhost:3000/auth/callback |
| `TWITCH_CHANNEL` | Canal da Twitch | - |
| `PORT` | Porta do servidor HTTP | 3000 |
| `TTS_LANGUAGE` | Idioma do TTS | pt-BR |
| `TTS_MAX_LENGTH` | Tamanho máximo do texto | 200 |
| `TTS_COOLDOWN_SECONDS` | Cooldown entre comandos | 3 |

### Idiomas Suportados

O Google Translate TTS suporta vários idiomas. Exemplos:

- `pt-BR` - Português (Brasil)
- `en` - Inglês
- `es` - Espanhol
- `fr` - Francês
- `de` - Alemão
- `ja` - Japonês

Altere a variável `TTS_LANGUAGE` no `.env` para mudar o idioma.

## 🔧 Solução de Problemas

### ❌ Áudio não toca (PROBLEMA MAIS COMUM)

**1. Autoplay bloqueado pelo navegador**

Navegadores modernos bloqueiam autoplay de áudio por segurança.

✅ **Solução:**
- Abra a página: `http://localhost:3000/test`
- Clique no botão "Testar Áudio"
- Se funcionar ali, o problema é no OBS
- No OBS: Botão direito na fonte > **Interagir** > Clique em "Ativar Áudio"

**2. Permissões do navegador**

- **Chrome/Edge**: Vá em `chrome://settings/content/sound`
- Adicione `http://localhost:3000` na lista de permitidos
- **Firefox**: Clique no cadeado na barra de endereços > Permitir autoplay

**3. OBS não está controlando o áudio**

- Verifique se marcou: **"Controlar áudio via OBS"**
- Verifique volume no Mixer de Áudio do OBS
- Tente fechar e reabrir a fonte do navegador

**4. Google Translate bloqueado**

- Teste na página `/test` primeiro
- Se não funcionar, use o player nativo: `/player-native.html`
- O player nativo usa a voz do sistema operacional

### Bot não conecta

- Verifique se você fez login OAuth: `http://localhost:3000/auth/login`
- Confirme que o `TWITCH_CHANNEL` está correto (sem @, apenas o nome)
- Verifique se os tokens foram salvos (arquivo `.twitch-tokens.json`)
- Veja os logs do servidor para mais detalhes

### Comando não funciona

- Verifique se o bot está conectado ao chat
- Confirme que você está usando o comando `!fala` corretamente
- Verifique se não está em cooldown
- Veja os logs do servidor para erros

### 🔍 Debug Avançado

Execute no console do navegador (F12):

```javascript
// Testa TTS manualmente
window.testTTS("Teste de áudio");

// Verifica estado da fila
fetch('/api/tts/state').then(r => r.json()).then(console.log);
```

## ⚠️ Limitações

- O Google Translate TTS não é uma API oficial, pode haver bloqueios temporários
- Apenas uma voz padrão disponível
- Limite de caracteres por requisição
- Depende da disponibilidade do serviço do Google Translate

## 📝 Comandos do Chat

| Comando | Descrição | Quem Pode Usar | Exemplo |
|---------|-----------|----------------|---------|
| `!fala <texto>` | Converte texto em fala | Todos | `!fala Olá chat!` |
| `!ttshelp` | Mostra ajuda dos comandos | Todos | `!ttshelp` |
| `!ttsstatus` | Mostra status do TTS | Todos | `!ttsstatus` |
| `!ttspause` | Pausa o TTS | Mods/Streamer | `!ttspause` |
| `!ttsresume` | Retoma o TTS | Mods/Streamer | `!ttsresume` |
| `!ttsvolume <0-100>` | Ajusta volume | Mods/Streamer | `!ttsvolume 80` |

## 🌐 URLs Importantes

| URL | Descrição |
|-----|-----------|
| `http://localhost:3000` | Dashboard principal |
| `http://localhost:3000/test` | **⭐ Página de teste (USE PRIMEIRO!)** |
| `http://localhost:3000/player.html` | Player TTS (Google Translate) |
| `http://localhost:3000/player-native.html` | Player TTS (Voz Nativa) |
| `http://localhost:3000/api/tts/state` | Estado da fila (JSON) |
| `http://localhost:3000/auth/login` | Login OAuth |

## 🤝 Contribuindo

Sinta-se à vontade para abrir issues ou pull requests!

## 📄 Licença

MIT

## 🙏 Agradecimentos

- [tmi.js](https://github.com/tmijs/tmi.js) - Biblioteca para interagir com a API da Twitch
- [Express](https://expressjs.com/) - Framework web para Node.js
- Google Translate TTS - Serviço de Text-to-Speech

---

**Desenvolvido com ❤️ para a comunidade Twitch**

