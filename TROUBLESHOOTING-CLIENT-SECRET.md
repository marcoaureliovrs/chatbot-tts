# 🔧 Solução: Client Secret não aparece no painel

## 🔍 Possíveis Causas e Soluções

### 1. Aplicação não foi criada corretamente

Se você não vê a opção de gerar Client Secret, pode ser que a aplicação não tenha sido criada ainda.

**Solução:**
1. Acesse: https://dev.twitch.tv/console/apps
2. Clique em **"Register Your Application"** ou **"Criar"**
3. Preencha:
   - **Name**: Nome da aplicação (ex: "Bot TTS Chat")
   - **OAuth Redirect URLs**: `http://localhost:3000/auth/callback`
   - **Category**: Escolha "Chat Bot" ou "Other"
4. Clique em **"Create"** ou **"Criar"**
5. Agora você verá o **Client ID** e poderá gerar o **Client Secret**

### 2. Está olhando no lugar errado

O Client Secret pode estar em uma seção específica.

**Onde procurar:**
- Após criar/abrir a aplicação, procure por uma seção chamada **"Client Secret"**
- Pode estar em uma aba ou seção expandível
- Procure por um botão **"New Secret"**, **"Generate Secret"** ou **"Gerar Secret"**
- Às vezes aparece como um botão ao lado do Client ID

### 3. Interface em português vs inglês

Se a interface estiver em português, os termos podem ser diferentes:
- **Client Secret** = **Segredo do Cliente**
- **New Secret** = **Novo Segredo** ou **Gerar Segredo**
- **Register Your Application** = **Registrar Sua Aplicação**

### 4. Aplicação já existe mas não mostra Secret

Se você já tem uma aplicação mas não vê o Client Secret:

1. **Clique na aplicação** para abrir os detalhes
2. Procure por um botão ou link que diz algo como:
   - "Manage" (Gerenciar)
   - "Edit" (Editar)
   - "Settings" (Configurações)
3. Dentro das configurações, procure pela seção de **"Client Secret"**

### 5. Criar uma nova aplicação

Se nada funcionar, crie uma nova aplicação:

1. Acesse: https://dev.twitch.tv/console/apps
2. Clique em **"Register Your Application"**
3. Preencha os dados:
   ```
   Name: Bot TTS Chat
   OAuth Redirect URLs: http://localhost:3000/auth/callback
   Category: Chat Bot
   ```
4. Clique em **"Create"**
5. Você verá:
   - **Client ID** (copie este valor)
   - Botão para gerar **Client Secret** (clique e copie imediatamente)

## 📸 O que você deve ver

Após criar a aplicação, você deve ver algo assim:

```
┌─────────────────────────────────────┐
│ Application Details                 │
├─────────────────────────────────────┤
│ Name: Bot TTS Chat                  │
│                                     │
│ Client ID: 5uwphsi6g5x5jpx6vnq...  │
│                                     │
│ Client Secret:                      │
│ [New Secret] [Show] [Hide]          │
│                                     │
│ OAuth Redirect URLs:                │
│ http://localhost:3000/auth/callback │
└─────────────────────────────────────┘
```

## ⚠️ Importante

- O Client Secret só aparece **depois de clicar em "New Secret"**
- Ele é mostrado **apenas uma vez** - copie imediatamente!
- Se você perder, precisará gerar um novo

## 🆘 Ainda não funciona?

Se mesmo assim não aparecer:

1. Tente criar uma **nova aplicação** com um nome diferente
2. Verifique se você está logado na conta correta da Twitch
3. Tente em outro navegador ou modo anônimo
4. Verifique se há alguma mensagem de erro no console do navegador (F12)
