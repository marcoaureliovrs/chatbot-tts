# 🔧 Solução para Erro no Google Chrome

## ❌ Erro: NotSupportedError - MEDIA_ERR_SRC_NOT_SUPPORTED

Este erro significa que o Google Translate está bloqueando as requisições de áudio.

---

## ✅ SOLUÇÕES (Em Ordem de Prioridade)

### 🎯 Solução 1: Use o Player Nativo (RECOMENDADO)

O player nativo usa a voz do sistema e **sempre funciona**.

**No navegador, acesse:**
```
http://localhost:3000/player-native.html
```

**Teste:**
Abra o Console (F12) e execute:
```javascript
window.testTTS("Teste do player nativo")
```

**No OBS, use:**
```
http://localhost:3000/player-native.html
```

---

### 🎯 Solução 2: Use o Player Híbrido (NOVO!)

Criei um player que tenta **3 métodos diferentes** automaticamente:

**Teste:**
```
http://localhost:3000/player-proxy.html
```

Este player:
- ✅ Tenta 3 URLs diferentes do Google Translate
- ✅ Se falhar, usa Web Speech API automaticamente
- ✅ Fallback inteligente

**No OBS, use:**
```
http://localhost:3000/player-proxy.html
```

---

### 🎯 Solução 3: Configurações do Chrome

#### Permitir Autoplay:

1. Abra o Chrome
2. Digite na barra de endereços:
   ```
   chrome://settings/content/sound
   ```
3. Em "Permitidos para reproduzir som", clique em **Adicionar**
4. Digite: `http://localhost:3000`
5. Clique em **Adicionar**

#### Desabilitar Política de CORS (Temporário, apenas para teste):

**⚠️ APENAS PARA TESTE - Não use para navegar!**

Feche TODOS os processos do Chrome e abra com:

```powershell
# Crie um atalho com este comando:
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\temp\chrome-test" http://localhost:3000/test
```

---

### 🎯 Solução 4: Teste em Outro Navegador

O Firefox geralmente tem menos restrições:

1. Instale o Firefox (se não tiver)
2. Abra: `http://localhost:3000/test`
3. Teste o áudio

Se funcionar no Firefox:
- Use Firefox no OBS
- Ou use uma das soluções alternativas

---

## 📊 Comparação dos Players

| Player | Vantagens | Desvantagens |
|--------|-----------|--------------|
| **player-native.html** | ✅ Sempre funciona<br>✅ Offline<br>✅ Sem bloqueios | ⚠️ Voz varia por sistema<br>⚠️ Menos natural |
| **player-proxy.html** | ✅ Tenta múltiplos métodos<br>✅ Fallback automático<br>✅ Inteligente | ⚠️ Pode ser bloqueado |
| **player.html** | ✅ Voz natural<br>✅ Consistente | ❌ Pode ser bloqueado<br>❌ Depende do Google |

---

## 🧪 Como Testar Cada Player

### 1. Player Nativo:
```
http://localhost:3000/player-native.html
```
Console: `window.testTTS("teste nativo")`

### 2. Player Híbrido:
```
http://localhost:3000/player-proxy.html
```
Console: `window.testTTS("teste híbrido")`

### 3. Player Original:
```
http://localhost:3000/player.html
```
Console: `window.testTTS("teste original")`

---

## 🔍 Diagnóstico

Execute no Console (F12) da página /test:

```javascript
// Testa diferentes URLs do Google Translate
const testUrls = [
    'https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=gtx&q=teste',
    'https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=tw-ob&q=teste',
    'https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=t&q=teste'
];

for(let i = 0; i < testUrls.length; i++) {
    const audio = new Audio(testUrls[i]);
    audio.addEventListener('error', (e) => {
        console.error(`❌ Método ${i+1} falhou`);
    });
    audio.addEventListener('canplay', () => {
        console.log(`✅ Método ${i+1} FUNCIONOU!`);
    });
}
```

---

## ✅ Recomendação Final

**Use o Player Nativo** (`player-native.html`) - é a solução mais confiável:

1. Sempre funciona
2. Sem bloqueios
3. Funciona offline
4. Sem dependências externas

A voz pode ser menos natural, mas é **100% confiável**.

---

## 🆘 Ainda Não Funciona?

1. **Verifique antivírus/firewall:**
   - Pode estar bloqueando requisições HTTP
   - Adicione exceção para localhost:3000

2. **Teste em modo anônimo:**
   - Ctrl+Shift+N (Chrome)
   - Extensões podem estar interferindo

3. **Limpe cache:**
   - Ctrl+Shift+Delete
   - Limpe cache e cookies

4. **Reinicie o navegador:**
   - Feche completamente
   - Abra novamente

5. **Use VPN (se Google estiver bloqueado):**
   - Pode ser bloqueio regional

---

## 📝 Para OBS

**Recomendado:**
```
http://localhost:3000/player-native.html
```

**Alternativa:**
```
http://localhost:3000/player-proxy.html
```

**Configuração:**
- 800x600
- ✅ Controlar áudio via OBS
- Botão direito > Interagir > Ativar Áudio

---

**Versão:** 2.0  
**Última Atualização:** Janeiro 2026
