# 📡 Sistema de Gestão de Live

## Visão Geral

O sistema de Gestão de Live permite que você controle aspectos importantes da sua transmissão diretamente do dashboard do bot, sem precisar sair do OBS ou abrir múltiplas abas.

## ✨ Funcionalidades Disponíveis

### 1. 🎬 Criar Clip
- Cria um clip de ~90 segundos da sua live atual
- Nome automático baseado na data/hora
- Link direto para edição após criação
- **Requisito**: Stream ao vivo
- **Permissão necessária**: `clips:edit`

### 2. 📺 Rodar Comercial
- Inicia comercial na sua live
- Durações disponíveis: 30s, 60s, 90s, 120s, 150s, 180s
- Mostra cooldown entre comerciais
- **Requisito**: Stream ao vivo
- **Permissão necessária**: `channel:edit:commercial`

### 3. 📝 Alterar Título
- Atualiza o título da sua live
- Máximo 140 caracteres
- Contador de caracteres em tempo real
- Funciona mesmo offline
- **Permissão necessária**: `channel:manage:broadcast`

### 4. 🎮 Alterar Categoria/Jogo
- Busca categorias por nome
- Visualização com thumbnail do jogo
- Atualização instantânea
- Funciona mesmo offline
- **Permissão necessária**: `channel:manage:broadcast`

### 5. 🔄 Atualizar Informações
- Mostra status da live (online/offline)
- Número de viewers (se ao vivo)
- Título e categoria atuais
- Tempo de transmissão (uptime)
- **Não requer permissões especiais**

---

## 🔐 Sistema de Permissões

### Como Funciona

O sistema usa **OAuth incremental**, permitindo que você:
1. Continue usando o bot normalmente com permissões básicas
2. Solicite permissões adicionais quando quiser usar recursos avançados
3. Não invalida o token existente ao adicionar novas permissões

### Scopes Necessários

#### Básicos (já configurados):
- `chat:read` - Ler chat da Twitch
- `chat:edit` - Enviar mensagens no chat

#### Adicionais (para gestão de live):
- `clips:edit` - Criar clips
- `channel:manage:broadcast` - Alterar título/categoria
- `channel:edit:commercial` - Rodar comerciais

### Verificação de Permissões

O dashboard verifica automaticamente quais permissões você tem:
- ✅ Verde = Permissão disponível
- ❌ Vermelho = Permissão ausente

---

## 🚀 Como Usar

### Primeira Vez (Solicitar Permissões)

1. **Abra o Dashboard**
   ```
   http://localhost:3000
   ```

2. **Vá até a seção "📡 Gestão de Live"**
   - Localizada na parte inferior do dashboard

3. **Verifique o Status de Permissões**
   - Mostra quais permissões você tem
   - Se alguma estiver ausente, aparecerá o botão:

4. **Clique em "🔐 Solicitar Novas Permissões"**
   - Uma janela OAuth da Twitch será aberta
   - Faça login (se necessário)
   - Autorize as novas permissões
   - A janela confirmará o sucesso

5. **Aguarde 5 segundos**
   - O dashboard recarregará as permissões automaticamente
   - Os botões das funcionalidades serão habilitados

### Uso Normal

#### Criar um Clip:
1. Clique em **"🎬 Criar Clip"**
2. Aguarde alguns segundos
3. Um link "✅ Criado! Editar" aparecerá
4. Clique para abrir o editor de clips da Twitch

#### Rodar Comercial:
1. Clique em **"📺 Rodar Comercial"**
2. Selecione a duração desejada
3. Clique em **"Confirmar"**
4. O comercial será iniciado imediatamente
5. Um cooldown será mostrado antes de poder rodar outro

#### Alterar Título:
1. Clique em **"📝 Alterar Título"**
2. Digite o novo título (máximo 140 caracteres)
3. Acompanhe o contador de caracteres
4. Clique em **"Confirmar"**
5. O título será atualizado na Twitch

#### Alterar Categoria:
1. Clique em **"🎮 Alterar Categoria"**
2. Digite o nome do jogo/categoria
3. Clique em **"🔍 Buscar"**
4. Selecione a categoria desejada da lista
5. A categoria será atualizada na Twitch

#### Atualizar Informações:
1. Clique em **"🔄 Atualizar Info"**
2. As informações da stream serão recarregadas
3. Mostra status atualizado (live/offline, viewers, etc.)

---

## 📊 Informações da Stream

A seção **"📊 Status da Live"** mostra:

### Quando AO VIVO:
- 🔴 Status: AO VIVO (em verde)
- 👥 Número de viewers
- 📝 Título atual
- 🎮 Categoria/jogo atual
- ⏱️ Tempo de transmissão
- 🌐 Idioma da stream

### Quando OFFLINE:
- ⚪ Status: OFFLINE (em cinza)
- 📝 Último título configurado
- 🎮 Última categoria configurada

---

## ⚙️ Configuração Técnica

### Variáveis de Ambiente (.env)

Certifique-se de ter configurado:

```env
# Twitch API
TWITCH_CLIENT_ID=seu_client_id
TWITCH_CLIENT_SECRET=seu_client_secret
TWITCH_CHANNEL=seu_canal

# OAuth Redirect (importante!)
TWITCH_REDIRECT_URI=http://localhost:3000/auth/callback
```

### Fluxo OAuth

1. **Requisição de Permissões**
   ```
   GET /api/stream/auth-url
   ```
   - Retorna URL da Twitch para autorização

2. **Callback OAuth**
   ```
   GET /auth/callback?code=...
   ```
   - Recebe código de autorização
   - Troca código por tokens
   - Salva tokens localmente
   - Mostra página de confirmação

3. **Verificação de Scopes**
   ```
   GET /api/stream/scopes
   ```
   - Retorna scopes disponíveis
   - Dashboard usa para habilitar/desabilitar funcionalidades

---

## 🔧 API Endpoints

### Gestão de Permissões

#### Verificar Scopes
```http
GET /api/stream/scopes
```
Retorna:
```json
{
  "success": true,
  "scopes": ["chat:read", "chat:edit", "clips:edit"],
  "hasClipsEdit": true,
  "hasChannelManage": false,
  "hasCommercial": false,
  "availableFeatures": {
    "createClip": true,
    "updateTitle": false,
    "updateCategory": false,
    "runCommercial": false
  }
}
```

#### Obter URL de Autorização
```http
GET /api/stream/auth-url
```
Retorna:
```json
{
  "success": true,
  "authUrl": "https://id.twitch.tv/oauth2/authorize?..."
}
```

### Informações da Stream

#### Obter Status da Live
```http
GET /api/stream/info
```
Retorna:
```json
{
  "success": true,
  "isLive": true,
  "stream": {
    "viewer_count": 123,
    "started_at": "2026-01-27T10:00:00Z",
    ...
  },
  "channel": {
    "title": "Minha Live Incrível",
    "game_name": "Just Chatting",
    ...
  }
}
```

### Ações de Gestão

#### Criar Clip
```http
POST /api/stream/create-clip
Content-Type: application/json

{
  "hasDelay": false
}
```
Retorna:
```json
{
  "success": true,
  "clip": {
    "id": "ClipID123",
    "edit_url": "https://twitch.tv/...",
    "created_at": "2026-01-27T12:00:00Z"
  }
}
```

#### Rodar Comercial
```http
POST /api/stream/run-commercial
Content-Type: application/json

{
  "length": 60
}
```
Retorna:
```json
{
  "success": true,
  "commercial": {
    "length": 60,
    "message": "Comercial iniciado",
    "retry_after": 480
  }
}
```

#### Atualizar Título
```http
POST /api/stream/update-title
Content-Type: application/json

{
  "title": "Novo Título da Live"
}
```
Retorna:
```json
{
  "success": true,
  "message": "Título atualizado com sucesso"
}
```

#### Buscar Categorias
```http
GET /api/stream/search-categories?q=Just+Chatting
```
Retorna:
```json
{
  "success": true,
  "categories": [
    {
      "id": "509658",
      "name": "Just Chatting",
      "box_art_url": "https://..."
    }
  ]
}
```

#### Atualizar Categoria
```http
POST /api/stream/update-category
Content-Type: application/json

{
  "gameId": "509658"
}
```
Retorna:
```json
{
  "success": true,
  "message": "Categoria atualizada com sucesso"
}
```

---

## 🛡️ Segurança

### Armazenamento de Tokens
- Tokens são salvos em `.twitch-tokens.json` (local)
- Arquivo está no `.gitignore` (não vai para repositório)
- Tokens incluem `refresh_token` para renovação automática

### Validação de Permissões
- Cada endpoint verifica se o token tem o scope necessário
- Retorna erro 401/403 se permissão ausente
- Dashboard desabilita botões sem permissão

### Renovação Automática
- Tokens expirados são renovados automaticamente
- Sistema usa `refresh_token` para obter novos tokens
- Processo transparente para o usuário

---

## ❗ Limitações e Requisitos

### Criar Clip
- ✅ Stream deve estar AO VIVO
- ✅ Captura ~85s antes + ~5s depois da requisição
- ❌ Não funciona offline
- ⏱️ Processamento assíncrono (~15s)

### Rodar Comercial
- ✅ Stream deve estar AO VIVO
- ❌ Não funciona offline
- ⏱️ Cooldown entre comerciais (varia)
- 📏 Duração máxima: 180s

### Alterar Título/Categoria
- ✅ Funciona mesmo offline
- 📏 Título: máximo 140 caracteres
- 🎮 Categoria: ID deve existir na Twitch

---

## 🐛 Troubleshooting

### Botões Desabilitados
**Problema**: Todos os botões estão desabilitados
**Solução**: 
1. Verifique se você solicitou as permissões
2. Clique em "🔐 Solicitar Novas Permissões"
3. Complete o fluxo OAuth
4. Aguarde recarregamento automático

### Erro ao Criar Clip
**Problema**: "Erro ao criar clip"
**Possíveis causas**:
- Stream não está ao vivo
- Permissão `clips:edit` ausente
- Cooldown ativo (aguarde alguns segundos)

### Erro ao Rodar Comercial
**Problema**: "Erro ao rodar comercial"
**Possíveis causas**:
- Stream não está ao vivo
- Permissão `channel:edit:commercial` ausente
- Cooldown ativo (veja `retry_after`)

### Categoria Não Encontrada
**Problema**: Busca não retorna resultados
**Solução**:
- Verifique ortografia
- Use nomes em inglês (ex: "Just Chatting", não "Só Conversando")
- Tente termos mais gerais

### Token Inválido
**Problema**: "Token inválido" ou "Unauthorized"
**Solução**:
1. Delete `.twitch-tokens.json`
2. Solicite novas permissões
3. Complete fluxo OAuth novamente

---

## 📈 Melhorias Futuras

Funcionalidades planejadas:
- [ ] Criar marcadores (stream markers)
- [ ] Gerenciar predições
- [ ] Controlar enquetes
- [ ] Visualizar analytics em tempo real
- [ ] Agendar raids
- [ ] Gerenciar VIPs e moderadores
- [ ] Configurar recompensas de canal

---

## 📝 Changelog

### Versão 1.0.0 (27/01/2026)
- ✨ Sistema de permissões incrementais
- ✨ Criar clips com nome automático
- ✨ Rodar comerciais (30s-180s)
- ✨ Alterar título da live
- ✨ Alterar categoria/jogo
- ✨ Visualizar status da live
- ✨ Interface integrada ao dashboard
- 🔐 OAuth flow completo
- 📊 Verificação de scopes em tempo real

---

## 🆘 Suporte

### Logs do Sistema

Para depurar problemas, verifique os logs do servidor:
- Console mostra todas as requisições
- Erros são marcados com ❌
- Sucessos são marcados com ✅

### Arquivos Importantes

- `src/twitch-api.js` - Funções da API da Twitch
- `src/server.js` - Rotas do servidor
- `public/dashboard.html` - Interface do dashboard
- `.twitch-tokens.json` - Tokens OAuth (não compartilhe!)

### Testando Manualmente

Use ferramentas como Postman ou curl para testar endpoints:

```bash
# Verificar scopes
curl http://localhost:3000/api/stream/scopes

# Obter info da stream
curl http://localhost:3000/api/stream/info
```

---

## 🎉 Conclusão

O sistema de Gestão de Live foi projetado para ser:
- ✅ **Intuitivo**: Interface simples e clara
- ✅ **Seguro**: Permissões incrementais, tokens protegidos
- ✅ **Flexível**: Funciona com ou sem todas as permissões
- ✅ **Eficiente**: Controle tudo em um só lugar
- ✅ **Robusto**: Tratamento de erros e validações

Aproveite para gerenciar sua live com mais facilidade! 🚀
