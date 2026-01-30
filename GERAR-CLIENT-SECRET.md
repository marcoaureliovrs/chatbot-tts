# 🔐 Como Gerar o Client Secret da Twitch

## 📋 Passo a Passo

### 1. Acesse o Console de Desenvolvedores
Acesse: **https://dev.twitch.tv/console/apps**

### 2. Faça Login
Faça login com sua conta da Twitch

### 3. Encontre Sua Aplicação
Procure pela aplicação com o Client ID: `5uwphsi6g5x5jpx6vnqkl6z5map3sr`

### 4. Gere o Client Secret
1. Clique na sua aplicação para abrir os detalhes
2. Procure pela seção **"Client Secret"**
3. Clique no botão **"New Secret"** ou **"Gerar Novo Secret"**
4. ⚠️ **IMPORTANTE**: O Client Secret será mostrado **APENAS UMA VEZ**
5. **COPIE IMEDIATAMENTE** e salve em local seguro

### 5. Configure no .env
Cole o Client Secret no arquivo `.env`:

```env
TWITCH_CLIENT_ID=5uwphsi6g5x5jpx6vnqkl6z5map3sr
TWITCH_CLIENT_SECRET=cole_aqui_o_secret_gerado
TWITCH_REDIRECT_URI=http://localhost:3000/auth/callback
```

## ⚠️ Avisos Importantes

- O Client Secret **NÃO pode ser recuperado** depois que você fechar a página
- Se você perder o Client Secret, precisará gerar um novo
- **NUNCA** compartilhe seu Client Secret publicamente
- **NUNCA** faça commit do arquivo `.env` no Git

## 🔗 Link Direto

Se você já está logado, pode acessar diretamente:
https://dev.twitch.tv/console/apps

Depois clique na aplicação com Client ID: `5uwphsi6g5x5jpx6vnqkl6z5map3sr`
