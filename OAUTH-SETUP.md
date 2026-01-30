# 🔐 Guia de Configuração OAuth da Twitch

Este guia explica como configurar a autenticação OAuth oficial da Twitch para o bot TTS.

## 📋 Pré-requisitos

1. Conta na Twitch
2. Acesso ao [Console de Desenvolvedores da Twitch](https://dev.twitch.tv/console)

## 🚀 Passo a Passo

### 1. Registrar uma Aplicação na Twitch

1. Acesse: https://dev.twitch.tv/console/apps
2. Clique em **"Register Your Application"** ou **"Criar"**
3. Preencha os campos:
   - **Name**: Nome da sua aplicação (ex: "Bot TTS Chat")
   - **OAuth Redirect URLs**: `http://localhost:3000/auth/callback`
     - ⚠️ **Importante**: Use exatamente esta URL se estiver rodando localmente
     - Para produção, adicione também a URL do seu servidor
   - **Category**: Escolha "Chat Bot" ou "Other"
4. Clique em **"Create"**
5. Anote o **Client ID** e gere um **Client Secret** (clique em "New Secret")

### 2. Configurar o Arquivo .env

1. Copie o arquivo `env.example.txt` para `.env`:
   ```powershell
   Copy-Item env.example.txt .env
   ```

2. Edite o arquivo `.env` e preencha:
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

3. Substitua:
   - `seu_client_id_aqui` pelo Client ID da sua aplicação
   - `seu_client_secret_aqui` pelo Client Secret
   - `seu_canal` pelo nome do seu canal (sem o @)

### 3. Instalar Dependências

```powershell
npm install
```

### 4. Fazer Login/Autorização

1. Inicie o servidor:
   ```powershell
   npm start
   ```

2. Abra o navegador e acesse:
   ```
   http://localhost:3000/auth/login
   ```

3. Você será redirecionado para a página de autorização da Twitch
4. Faça login com sua conta da Twitch
5. Autorize a aplicação
6. Você será redirecionado de volta e verá uma mensagem de sucesso

### 5. Verificar Autenticação

Após fazer login, os tokens serão salvos automaticamente no arquivo `.twitch-tokens.json`.

Para verificar se está autenticado:
```powershell
# Acesse no navegador
http://localhost:3000/auth/status
```

### 6. Reiniciar o Bot

Após fazer login pela primeira vez, reinicie a aplicação:
```powershell
# Pare o servidor (Ctrl+C) e inicie novamente
npm start
```

O bot agora deve conectar automaticamente usando os tokens OAuth salvos.

## 🔄 Atualização Automática de Tokens

O sistema atualiza automaticamente os tokens quando expiram usando o refresh token. Você não precisa fazer login novamente, a menos que:

- O refresh token expire (geralmente após 60 dias de inatividade)
- Você revogue o acesso manualmente na Twitch
- O arquivo `.twitch-tokens.json` seja deletado

## 🔒 Segurança

⚠️ **Importante**:
- **NUNCA** compartilhe seu `TWITCH_CLIENT_SECRET`
- **NUNCA** faça commit do arquivo `.env` ou `.twitch-tokens.json`
- Adicione estes arquivos ao `.gitignore`:
  ```
  .env
  .twitch-tokens.json
  ```

## 🐛 Solução de Problemas

### Erro: "Nenhum token encontrado"
- Faça login novamente: `http://localhost:3000/auth/login`

### Erro: "redirect_uri_mismatch"
- Verifique se a URL no `.env` (`TWITCH_REDIRECT_URI`) corresponde exatamente à URL configurada no Console da Twitch
- URLs são case-sensitive e devem corresponder exatamente

### Erro: "invalid_client"
- Verifique se o `TWITCH_CLIENT_ID` e `TWITCH_CLIENT_SECRET` estão corretos no `.env`

### Bot não conecta
- Verifique se você fez login e os tokens foram salvos
- Verifique se o `TWITCH_CHANNEL` está correto (sem @, apenas o nome)
- Veja os logs do servidor para mais detalhes

### Token expirado
- O sistema tenta atualizar automaticamente
- Se falhar, faça login novamente: `http://localhost:3000/auth/login`

## 📝 Escopos OAuth

O bot solicita os seguintes escopos:
- `chat:read` - Ler mensagens do chat
- `chat:edit` - Enviar mensagens no chat (para respostas do bot)

Estes escopos são suficientes para o funcionamento do bot TTS.

## 🌐 Para Produção

Se você for usar em produção:

1. Atualize a URL de redirecionamento no Console da Twitch:
   ```
   https://seu-dominio.com/auth/callback
   ```

2. Atualize o `.env`:
   ```env
   TWITCH_REDIRECT_URI=https://seu-dominio.com/auth/callback
   ```

3. Certifique-se de usar HTTPS em produção

## ✅ Verificação Final

Após configurar tudo, você deve ver no console:
```
🚀 Servidor rodando em http://localhost:3000
🔐 URL de login: http://localhost:3000/auth/login
🔐 Verificando autenticação...
✅ Autenticação válida!
👤 Usuário autenticado: SeuNome (seunome)
🤖 Iniciando bot da Twitch...
🤖 Bot conectado em ...
📺 Canais: seu_canal
```

Agora você pode usar o comando `!fala` no chat da Twitch! 🎉
