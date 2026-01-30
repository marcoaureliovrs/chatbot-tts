# 🚀 Guia de Início Rápido - Sistema TTS

## ⚡ Começar em 5 Minutos

### 1️⃣ Instalar Dependências (1 min)

```powershell
npm install
```

### 2️⃣ Configurar Variáveis (2 min)

```powershell
# Copie o arquivo de exemplo
Copy-Item env.example.txt .env

# Edite o arquivo .env e configure:
# - TWITCH_CLIENT_ID
# - TWITCH_CLIENT_SECRET  
# - TWITCH_CHANNEL
```

**Onde conseguir essas informações?**
- Acesse: https://dev.twitch.tv/console/apps
- Crie uma aplicação
- Copie Client ID e Client Secret

### 3️⃣ Iniciar Servidor (30 seg)

```powershell
npm start
```

### 4️⃣ Fazer Login OAuth (1 min)

Abra no navegador:
```
http://localhost:3000/auth/login
```

Autorize a aplicação e reinicie o servidor.

### 5️⃣ TESTAR! (30 seg)

**IMPORTANTE: Teste ANTES de configurar OBS!**

Abra no navegador:
```
http://localhost:3000/test
```

1. Digite um texto
2. Clique em "Testar Áudio"
3. Deve ouvir o áudio

✅ **Funcionou?** Prossiga para o OBS!  
❌ **Não funcionou?** Veja seção [Troubleshooting](#troubleshooting)

---

## 🎮 Configurar no OBS (2 min)

### Opção 1: Google Translate (Recomendado)

1. **Adicione Browser Source**
   - Clique com botão direito em "Fontes"
   - Adicionar > Browser

2. **Configure:**
   - URL: `http://localhost:3000/player.html`
   - Largura: 800
   - Altura: 600
   - ✅ Marque: **"Controlar áudio via OBS"**
   - Clique OK

3. **Ative o Áudio:**
   - Botão direito na fonte > **Interagir**
   - Clique no botão **"Ativar Áudio"**
   - Feche a janela

4. **Ajuste Volume:**
   - No Mixer de Áudio do OBS
   - Encontre "Browser"
   - Ajuste o volume

### Opção 2: Web Speech API (Alternativa)

Se o Google Translate não funcionar:

- Use a URL: `http://localhost:3000/player-native.html`
- Mesmos passos acima

---

## 💬 Usar no Chat da Twitch

No chat, digite:

```
!fala Olá chat, teste de áudio!
```

✅ Deve ouvir: **"Seu_Nome enviou Olá chat, teste de áudio!"**

---

## 🎯 Comandos Disponíveis

| Comando | O que faz |
|---------|-----------|
| `!fala <texto>` | Fala uma mensagem |
| `!ttshelp` | Mostra ajuda |
| `!ttsstatus` | Status do sistema |

**Comandos de Moderador:**
- `!ttspause` - Pausa TTS
- `!ttsresume` - Retoma TTS
- `!ttsvolume 80` - Volume 80%

---

## 🔧 Troubleshooting

### ❌ Áudio não toca

**1. Teste primeiro em `/test`**
```
http://localhost:3000/test
```

- ✅ Funciona? Problema é no OBS
- ❌ Não funciona? Problema é no navegador/sistema

**2. Se funciona no `/test` mas não no OBS:**

- Verifique se marcou "Controlar áudio via OBS"
- Botão direito > Interagir > Clique "Ativar Áudio"
- Reinicie a fonte do navegador
- Verifique volume no Mixer

**3. Se não funciona nem no `/test`:**

- Abra Console do navegador (F12)
- Veja os erros
- Tente o player nativo: `/player-native.html`
- Permita autoplay nas configurações do navegador

### ❌ Bot não conecta

**Execute o diagnóstico:**
```powershell
.\diagnostico.ps1
```

**Verifique:**
- ✅ Arquivo `.env` configurado?
- ✅ Tokens OAuth salvos? (`.twitch-tokens.json`)
- ✅ Servidor rodando?
- ✅ Canal correto no `.env`?

**Se não tem tokens:**
```
http://localhost:3000/auth/login
```

### ❌ Comando não funciona

**Verifique logs do servidor:**

Deve mostrar:
```
✅ TTS adicionado à fila: "Usuario enviou mensagem..."
```

Se não aparece:
- Bot está conectado?
- Comando está correto? (`!fala` não `!speak`)
- Não está em cooldown? (aguarde 3 segundos)

---

## 📊 Script de Diagnóstico

Execute para verificar tudo:

```powershell
.\diagnostico.ps1
```

Vai verificar:
- ✅ Node.js instalado
- ✅ Dependências instaladas
- ✅ Arquivo .env configurado
- ✅ Tokens OAuth presentes
- ✅ Servidor funcionando
- ✅ API TTS respondendo

---

## 🌐 URLs Importantes

| URL | Para que serve |
|-----|----------------|
| http://localhost:3000 | Dashboard |
| **http://localhost:3000/test** | **⭐ Página de teste** |
| http://localhost:3000/player.html | Player OBS (Google) |
| http://localhost:3000/player-native.html | Player OBS (Nativo) |
| http://localhost:3000/auth/login | Login OAuth |

---

## 🎓 Documentação Completa

| Arquivo | Conteúdo |
|---------|----------|
| `README.md` | Documentação principal |
| `TESTE-TTS.md` | Guia completo de testes |
| `MUDANCAS-TTS.md` | Resumo das melhorias |
| `INICIO-RAPIDO.md` | Este arquivo |
| `OAUTH-SETUP.md` | Guia OAuth detalhado |

---

## ✅ Checklist Rápido

### Primeira Vez:

- [ ] Instalar dependências (`npm install`)
- [ ] Configurar `.env`
- [ ] Fazer login OAuth
- [ ] **TESTAR em `/test`** ⭐
- [ ] Configurar no OBS
- [ ] Ativar áudio no OBS
- [ ] Testar com `!fala`

### Sempre que Iniciar:

- [ ] Executar `npm start`
- [ ] Aguardar "Bot conectado"
- [ ] Verificar que OBS está com fonte aberta
- [ ] Testar com `!fala`

---

## 💡 Dicas Importantes

1. **SEMPRE teste em `/test` ANTES do OBS**
   - Economiza tempo de debug
   - Identifica problemas rapidamente

2. **Mantenha o servidor rodando**
   - Não feche o terminal
   - Se fechar, execute `npm start` novamente

3. **Mantenha a fonte do OBS aberta**
   - Navegador precisa estar "ativo"
   - Se fechar, áudio para de funcionar

4. **Use o Console (F12) para debug**
   - Mostra erros detalhados
   - Útil para troubleshooting

5. **Execute o diagnóstico regularmente**
   - `.\diagnostico.ps1`
   - Verifica se tudo está OK

---

## 🆘 Precisa de Ajuda?

1. **Execute o diagnóstico:**
   ```powershell
   .\diagnostico.ps1
   ```

2. **Teste na página de teste:**
   ```
   http://localhost:3000/test
   ```

3. **Veja os logs do servidor:**
   - Terminal onde executou `npm start`

4. **Consulte documentação:**
   - `TESTE-TTS.md` - Troubleshooting detalhado
   - `README.md` - Documentação completa

---

## 🎉 Pronto!

Agora você tem um sistema TTS funcionando!

**Resumo do que você pode fazer:**
- ✅ Usuários enviam `!fala` no chat
- ✅ Áudio toca automaticamente
- ✅ Aparece no OBS
- ✅ Sistema de fila automático
- ✅ Comandos de moderação

**Divirta-se! 🎙️**

---

**Versão:** 2.0  
**Última Atualização:** Janeiro 2026
