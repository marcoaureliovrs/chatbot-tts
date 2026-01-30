# Changelog - Melhorias Implementadas

## ✅ Funcionalidades Implementadas

### 1. ✅ Sistema de Fila de Mensagens TTS
- Fila com prioridades (Normal, Alta, Máxima)
- Processamento automático de mensagens
- Indicador visual de tamanho da fila

### 2. ✅ Controles de TTS na Interface
- Botão Pausar/Despausar TTS
- Controle de volume (slider)
- Botão para pular mensagem atual
- Botão para limpar a fila
- Controles mini na página principal
- Dashboard completo em `/controls.html`

### 3. ✅ Sistema de Prioridades e Permissões
- VIP: Cooldown reduzido (configurável)
- Moderadores: Sem cooldown
- Streamer: Sem cooldown, prioridade máxima
- Subs: Prioridade alta na fila
- Usuários bloqueados: Blacklist funcional

### 4. ✅ Filtros e Moderação
- Blacklist de palavras (configurável via .env)
- Filtro de spam (bloqueia mensagens repetidas)
- Limite de caracteres por palavra (evita URLs longas)
- Filtro de emojis (opcional, remove emojis)

### 5. ✅ Personalização de Voz
- Seleção de idioma (configurável)
- Velocidade de fala (configurável)
- Tom/pitch (configurável)
- Fallback para Web Speech API quando Google TTS falha

### 6. ✅ Estatísticas e Analytics
- Dashboard completo com estatísticas
- Total de mensagens TTS
- Usuários mais ativos (top 10)
- Horários de pico
- Mensagens por dia
- Exportar dados para CSV/JSON

### 7. ✅ Comandos Adicionais
- `!ttshelp` - Mostra ajuda dos comandos
- `!ttsstatus` - Status do TTS (ligado/desligado)
- `!ttsvolume <0-100>` - Ajustar volume (mods/streamer)
- `!ttspause` - Pausar TTS (mods/streamer)
- `!ttsresume` - Retomar TTS (mods/streamer)

### 8. ✅ Integração com Eventos da Twitch
- Seguidores novos: "Novo seguidor: [nome]"
- Subs: "Novo sub: [nome] (X meses)"
- Raids: "Raid de [canal] com [número] pessoas"
- Bits: Configurável (desabilitado por padrão)

### 9. ✅ Interface Melhorada
- Tema escuro/claro (configurável)
- Tamanho de fonte ajustável
- Modo compacto/minimizado
- Painéis arrastáveis (via CSS)
- Dashboard completo separado

### 10. ✅ Configurações Persistentes
- Salvar preferências no navegador (localStorage)
- Tema, tamanho de fonte, modo compacto
- Volume do TTS
- Exportar/importar configurações

## 📁 Novos Arquivos Criados

- `src/queue.js` - Sistema de fila de mensagens
- `src/config.js` - Gerenciador de configurações e permissões
- `src/stats.js` - Sistema de estatísticas
- `src/events.js` - Integração com eventos da Twitch
- `public/controls.html` - Dashboard completo
- `public/controls.js` - JavaScript do dashboard
- `public/styles.css` - Estilos compartilhados

## 🔧 Arquivos Modificados

- `src/bot.js` - Integração completa com novos sistemas
- `src/server.js` - Novas rotas API e processamento de fila
- `public/index.html` - Controles mini e melhorias
- `env.example.txt` - Novas variáveis de configuração

## 📝 Variáveis de Ambiente Adicionadas

```env
# Prioridades
TTS_VIP_USERS=usuario1,usuario2
TTS_MOD_USERS=mod1,mod2
TTS_BLOCKED_USERS=
TTS_COOLDOWN_VIP=1

# Filtros
TTS_BLACKLIST_WORDS=palavra1,palavra2
TTS_MAX_WORD_LENGTH=50
TTS_FILTER_EMOJIS=false
TTS_SPAM_PROTECTION=true

# Voz
TTS_SPEED=1.0
TTS_PITCH=1.0

# Eventos
TTS_EVENT_FOLLOWERS=true
TTS_EVENT_SUBS=true
TTS_EVENT_RAIDS=true
TTS_EVENT_BITS=false
```

## 🚀 Como Usar

1. **Configurar .env** - Adicione as novas variáveis conforme necessário
2. **Acessar Dashboard** - Clique no botão "📊 Dashboard" ou acesse `/controls.html`
3. **Usar Comandos** - Use `!ttshelp` no chat para ver comandos disponíveis
4. **Configurar VIPs/Mods** - Adicione usuários no .env nas variáveis correspondentes

## 🎯 Próximos Passos (Opcional)

- Integração com API de doações (Streamlabs/StreamElements)
- Sistema de pontos/recompensas
- Histórico de mensagens persistente
- Notificações visuais para eventos
- Integração com banco de dados
