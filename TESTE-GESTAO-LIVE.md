# 🧪 Guia de Teste - Sistema de Gestão de Live

## Checklist de Testes

Siga este guia para verificar se todas as funcionalidades estão funcionando corretamente.

---

## ✅ Pré-requisitos

Antes de iniciar os testes:

- [ ] Servidor iniciado (`npm start`)
- [ ] `.env` configurado com `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `TWITCH_CHANNEL`
- [ ] `TWITCH_REDIRECT_URI=http://localhost:3000/auth/callback` no `.env`
- [ ] Redirect URI configurado no Twitch Developer Console

---

## 🧪 Testes Básicos

### 1. Dashboard Carrega
```
✅ Acesse: http://localhost:3000
✅ Dashboard abre sem erros
✅ Seção "📡 Gestão de Live" está visível
✅ Widget mostra "Verificando permissões..."
```

### 2. Verificação de Permissões
```
✅ Widget mostra status de permissões
✅ Mostra quais permissões você tem (✅)
✅ Mostra quais permissões estão ausentes (❌)
✅ Se ausentes, mostra botão "🔐 Solicitar Novas Permissões"
```

### 3. Botões Renderizam
```
✅ Botão "🎬 Criar Clip" visível
✅ Botão "📺 Rodar Comercial" visível
✅ Botão "📝 Alterar Título" visível
✅ Botão "🎮 Alterar Categoria" visível
✅ Botão "🔄 Atualizar Info" visível
```

---

## 🔐 Testes de OAuth

### 4. Solicitar Permissões
```
TESTE:
1. Clique em "🔐 Solicitar Novas Permissões"

RESULTADO ESPERADO:
✅ Nova janela/aba abre
✅ Mostra página de autorização da Twitch
✅ Lista de permissões solicitadas está visível
✅ Botão "Autorizar" está visível
```

### 5. Autorizar Permissões
```
TESTE:
1. Faça login na Twitch (se necessário)
2. Clique em "Autorizar"

RESULTADO ESPERADO:
✅ Redirecionamento para http://localhost:3000/auth/callback?code=...
✅ Página mostra "✅ Autorização concluída com sucesso!"
✅ Botão "Fechar / Voltar ao Dashboard" funciona
✅ Console do servidor mostra logs de OAuth
```

### 6. Permissões Atualizadas
```
TESTE:
1. Volte ao dashboard
2. Aguarde 5-10 segundos

RESULTADO ESPERADO:
✅ Widget atualiza automaticamente
✅ Mostra "✅ Todas as permissões disponíveis!"
✅ Todos os botões estão habilitados
✅ Nenhum botão está com "disabled"
```

---

## 📊 Testes de Informações da Stream

### 7. Carregar Informações da Stream
```
TESTE:
1. Clique em "🔄 Atualizar Info"

RESULTADO ESPERADO (SE OFFLINE):
✅ Seção "📊 Status da Live" aparece
✅ Mostra "⚪ Status: OFFLINE"
✅ Mostra último título configurado
✅ Mostra última categoria configurada
✅ Sem erros no console

RESULTADO ESPERADO (SE AO VIVO):
✅ Seção "📊 Status da Live" aparece
✅ Mostra "🔴 Status: AO VIVO" (em verde)
✅ Mostra número de viewers
✅ Mostra título atual
✅ Mostra categoria atual
✅ Mostra uptime (ex: "2h 15m")
✅ Mostra idioma
✅ Sem erros no console
```

---

## 🎬 Testes de Criar Clip

### 8. Criar Clip (Offline - deve falhar)
```
TESTE:
1. Certifique-se de estar OFFLINE
2. Clique em "🎬 Criar Clip"

RESULTADO ESPERADO:
✅ Botão muda para "🎬 Criando..."
✅ Botão desabilita temporariamente
✅ Status abaixo do botão mostra "Aguarde..."
✅ Após alguns segundos, mostra erro (ex: "❌ Stream não está ao vivo")
✅ Botão volta ao normal
```

### 9. Criar Clip (Ao Vivo)
```
TESTE:
1. Entre ao vivo na Twitch
2. Aguarde alguns segundos
3. Clique em "🎬 Criar Clip"

RESULTADO ESPERADO:
✅ Botão muda para "🎬 Criando..."
✅ Botão desabilita temporariamente
✅ Status mostra "Aguarde..."
✅ Após ~5-10 segundos, mostra "✅ Criado! Editar" (link clicável)
✅ Link abre página de edição do clip na Twitch
✅ Console do servidor mostra logs do clip criado
✅ Botão volta ao normal
```

---

## 📺 Testes de Rodar Comercial

### 10. Rodar Comercial (Offline - deve falhar)
```
TESTE:
1. Certifique-se de estar OFFLINE
2. Clique em "📺 Rodar Comercial"

RESULTADO ESPERADO:
✅ Modal abre com seleção de duração
✅ Opções de 30s a 180s visíveis
✅ Selecione uma duração
✅ Clique em "Confirmar"
✅ Modal fecha
✅ Status mostra erro (ex: "❌ Stream não está ao vivo")
```

### 11. Rodar Comercial (Ao Vivo)
```
TESTE:
1. Entre ao vivo na Twitch
2. Clique em "📺 Rodar Comercial"

RESULTADO ESPERADO:
✅ Modal abre
✅ Seletor de duração funciona
✅ Selecione "60 segundos"
✅ Clique em "Confirmar"
✅ Modal fecha
✅ Status mostra "Rodando..."
✅ Após alguns segundos, mostra "✅ 60s rodando!"
✅ Na Twitch, comercial está rodando
✅ Console mostra logs do comercial
```

---

## 📝 Testes de Alterar Título

### 12. Abrir Modal de Título
```
TESTE:
1. Clique em "📝 Alterar Título"

RESULTADO ESPERADO:
✅ Modal abre
✅ Título do modal: "📝 Alterar Título"
✅ Input de texto visível
✅ Placeholder: "Digite o novo título..."
✅ Contador de caracteres: "0 / 140"
✅ Botões "Confirmar" e "Cancelar" visíveis
```

### 13. Contador de Caracteres
```
TESTE:
1. Digite algo no input

RESULTADO ESPERADO:
✅ Contador atualiza em tempo real
✅ Mostra "X / 140 caracteres"
✅ Limite de 140 caracteres é respeitado
```

### 14. Atualizar Título
```
TESTE:
1. Digite: "Teste de Título - Sistema de Gestão Funcionando!"
2. Clique em "Confirmar"

RESULTADO ESPERADO:
✅ Modal fecha
✅ Status mostra "Atualizando..."
✅ Após alguns segundos, mostra "✅ Título atualizado!"
✅ Informações da stream são recarregadas automaticamente
✅ Novo título aparece na seção "📊 Status da Live"
✅ Na Twitch, título foi atualizado
✅ Console mostra logs da atualização
```

---

## 🎮 Testes de Alterar Categoria

### 15. Abrir Modal de Categoria
```
TESTE:
1. Clique em "🎮 Alterar Categoria"

RESULTADO ESPERADO:
✅ Modal abre
✅ Título: "🎮 Alterar Categoria"
✅ Input de busca visível
✅ Placeholder: "Ex: Just Chatting, League of Legends..."
✅ Botão "🔍 Buscar" visível
✅ Área de resultados vazia
```

### 16. Buscar Categoria
```
TESTE:
1. Digite "Just Chatting" no input
2. Clique em "🔍 Buscar"

RESULTADO ESPERADO:
✅ Área de resultados mostra "Buscando..."
✅ Após alguns segundos, lista de categorias aparece
✅ "Just Chatting" aparece na lista
✅ Cada categoria tem thumbnail (imagem do jogo)
✅ Categorias têm borda que muda ao passar o mouse
```

### 17. Selecionar Categoria
```
TESTE:
1. Clique em "Just Chatting" na lista

RESULTADO ESPERADO:
✅ Modal fecha
✅ Status mostra "Atualizando..."
✅ Após alguns segundos, mostra "✅ Just Chatting"
✅ Informações da stream são recarregadas
✅ Nova categoria aparece na seção "📊 Status da Live"
✅ Na Twitch, categoria foi atualizada
✅ Console mostra logs da atualização
```

### 18. Buscar Categoria Inexistente
```
TESTE:
1. Abra modal de categoria
2. Digite "XYZ123456789ABCDEF"
3. Clique em "🔍 Buscar"

RESULTADO ESPERADO:
✅ Mostra "Nenhuma categoria encontrada"
✅ Sem erros no console
```

---

## 🔄 Testes de Atualização Automática

### 19. Atualização Periódica
```
TESTE:
1. Deixe o dashboard aberto
2. Aguarde 30 segundos

RESULTADO ESPERADO:
✅ Permissões são verificadas novamente
✅ Informações da stream são atualizadas
✅ Sem erros no console
✅ Sem recarregamento da página
```

---

## ❌ Testes de Cancelamento

### 20. Cancelar Modais
```
TESTE:
1. Abra modal de título
2. Clique em "Cancelar"

RESULTADO ESPERADO:
✅ Modal fecha
✅ Nenhuma ação é executada
✅ Status permanece vazio

TESTE:
1. Abra modal de categoria
2. Digite algo
3. Clique em "Cancelar"

RESULTADO ESPERADO:
✅ Modal fecha
✅ Busca não é executada
✅ Categoria não é alterada
```

---

## 🌐 Testes de API

### 21. Endpoints Respondem
```
TESTE MANUAL (use navegador ou Postman):

GET http://localhost:3000/api/stream/scopes
✅ Retorna JSON com scopes

GET http://localhost:3000/api/stream/info
✅ Retorna JSON com informações da stream

GET http://localhost:3000/api/stream/auth-url
✅ Retorna JSON com authUrl

GET http://localhost:3000/api/stream/search-categories?q=Just
✅ Retorna JSON com categorias
```

---

## 🔍 Testes de Console

### 22. Logs do Servidor
```
VERIFIQUE NO CONSOLE DO SERVIDOR:

Durante verificação de permissões:
✅ Sem erros

Durante criação de clip:
✅ "🎬 Criando clip para broadcaster ID: ..."
✅ "✅ Clip criado! ID: ..., Edit URL: ..."

Durante comercial:
✅ "📺 Iniciando comercial de X segundos"
✅ "✅ Comercial iniciado! Duração: Xs, Retry após: Xs"

Durante atualização de título:
✅ "📝 Atualizando título para: ..."
✅ "✅ Título atualizado com sucesso"

Durante atualização de categoria:
✅ "🎮 Atualizando categoria para game ID: ..."
✅ "✅ Categoria atualizada com sucesso"
```

### 23. Logs do Navegador
```
ABRA O CONSOLE DO NAVEGADOR (F12):

✅ Sem erros vermelhos
✅ Sem warnings críticos
✅ Requisições à API têm status 200 (sucesso)
```

---

## 🔐 Testes de Segurança

### 24. Tokens Armazenados
```
VERIFIQUE:
✅ Arquivo .twitch-tokens.json foi criado
✅ Arquivo contém access_token, refresh_token, scope
✅ Arquivo NÃO está no repositório Git (.gitignore)
```

### 25. Validação de Permissões
```
TESTE:
1. Se não tiver permissão, tente usar funcionalidade

RESULTADO ESPERADO:
✅ Botão está desabilitado
✅ OU mostra alerta de permissão ausente
✅ API retorna erro apropriado
```

---

## 📱 Testes Responsivos

### 26. Mobile
```
TESTE:
1. Redimensione janela para mobile (~375px)

RESULTADO ESPERADO:
✅ Widget de gestão ocupa largura completa
✅ Botões empilham verticalmente
✅ Modal é responsivo
✅ Textos são legíveis
```

### 27. Tablet
```
TESTE:
1. Redimensione janela para tablet (~768px)

RESULTADO ESPERADO:
✅ Layout de 2 colunas funciona
✅ Widget de gestão ocupa linha completa
✅ Botões em grid de 2 colunas
```

### 28. Desktop
```
TESTE:
1. Janela em tamanho normal (~1024px+)

RESULTADO ESPERADO:
✅ Layout de 4 colunas funciona
✅ Widget de gestão ocupa linha completa
✅ Botões em grid de 4-5 colunas
```

---

## 🎯 Checklist Final

```
FUNCIONALIDADES:
[ ] Verificar permissões
[ ] Solicitar novas permissões
[ ] OAuth completo
[ ] Criar clip (ao vivo)
[ ] Rodar comercial (ao vivo)
[ ] Alterar título
[ ] Alterar categoria
[ ] Buscar categorias
[ ] Atualizar informações
[ ] Cancelar modais

INTERFACE:
[ ] Dashboard carrega
[ ] Widget renderiza
[ ] Botões funcionam
[ ] Modais abrem/fecham
[ ] Status é mostrado
[ ] Erros são exibidos

RESPONSIVIDADE:
[ ] Mobile funciona
[ ] Tablet funciona
[ ] Desktop funciona

SEGURANÇA:
[ ] Tokens são salvos
[ ] Permissões são validadas
[ ] Erros são tratados

LOGS:
[ ] Console do servidor OK
[ ] Console do navegador OK
[ ] Sem erros críticos
```

---

## 🆘 Problemas Comuns

### Botões Desabilitados
- Solicite novas permissões
- Verifique OAuth no Twitch Developer Console

### "Token inválido"
- Delete `.twitch-tokens.json`
- Solicite permissões novamente

### "Stream não está ao vivo"
- Entre ao vivo primeiro (clips e comerciais)
- Ou use título/categoria que funcionam offline

### Modal não abre
- Verifique console do navegador
- Limpe cache do navegador

### Categoria não encontrada
- Use nomes em inglês
- Tente termos mais gerais
- Ex: "Just" em vez de "Just Chatting"

---

## ✅ Testes Concluídos

Se todos os testes passaram:

🎉 **PARABÉNS!** O sistema está 100% funcional!

Você pode agora usar todas as funcionalidades de gestão de live diretamente
do dashboard do TTS Bot.

---

## 📝 Reportar Problemas

Se encontrou algum problema:

1. Anote qual teste falhou
2. Copie mensagens de erro do console
3. Tire screenshots se possível
4. Descreva os passos para reproduzir

---

**Data do Teste**: ___/___/______
**Testador**: _________________
**Resultado**: [ ] PASSOU [ ] FALHOU
**Observações**: ______________________________________________
