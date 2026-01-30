const tmi = require('tmi.js');
const http = require('http');
const { getValidAccessToken, getUserInfo } = require('./auth');
const { ConfigManager } = require('./config');
const { StatsManager } = require('./stats');
const { TwitchEvents } = require('./events');
const { UsersTracker } = require('./users');

/**
 * Cria e configura o bot da Twitch usando OAuth
 * @param {object} config - Configurações do bot
 * @param {string} config.accessToken - Token de acesso OAuth
 * @param {string} config.clientId - Client ID da aplicação
 * @param {string} config.channels - Canais para conectar
 * @param {number} config.cooldownSeconds - Cooldown entre comandos (em segundos)
 * @param {number} config.maxLength - Tamanho máximo do texto
 * @param {string} config.serverUrl - URL do servidor HTTP
 * @returns {Promise<object>} Cliente do bot
 */
async function createBot(config) {
  const {
    accessToken,
    clientId,
    channels,
    cooldownSeconds = 3,
    maxLength = 200,
    serverUrl = 'http://localhost:3000'
  } = config;

  // Obtém informações do usuário autenticado
  let userInfo;
  try {
    userInfo = await getUserInfo(accessToken, clientId);
    console.log(`👤 Usuário autenticado: ${userInfo.display_name} (${userInfo.login})`);
  } catch (error) {
    throw new Error(`Erro ao obter informações do usuário: ${error.message}`);
  }

  // Armazena o último tempo de uso do comando por usuário
  const lastUsed = new Map();

  // Sistemas de gerenciamento
  const configManager = new ConfigManager();
  const statsManager = new StatsManager();
  const usersTracker = new UsersTracker();

  // Limpa usuários inativos a cada minuto
  setInterval(() => {
    usersTracker.cleanInactive();
  }, 60000);

  // Função para adicionar à fila (definida antes de usar)
  function addToQueue(messageData) {
    console.log(`📤 Enviando para fila:`, messageData);
    const data = JSON.stringify(messageData);

    const options = {
      hostname: new URL(serverUrl).hostname,
      port: new URL(serverUrl).port || 3000,
      path: '/api/tts/queue',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ Mensagem adicionada à fila: "${messageData.text}"`);
          console.log(`   Resposta do servidor:`, responseData);
        } else {
          console.error(`❌ Erro ao adicionar à fila: ${res.statusCode} - ${responseData}`);
        }
      });
    });

    req.on('error', (err) => {
      console.error(`❌ Erro ao adicionar à fila: ${err.message}`);
    });

    req.write(data);
    req.end();
  }

  // Sistema de eventos
  const twitchEvents = new TwitchEvents(serverUrl, addToQueue);

  // Cria o cliente do bot usando OAuth
  const client = new tmi.Client({
    options: { debug: false },
    connection: {
      reconnect: true,
      secure: true
    },
    identity: {
      username: userInfo.login,
      password: `oauth:${accessToken}`
    },
    channels: Array.isArray(channels) ? channels : [channels]
  });

  // Função para verificar cooldown
  function checkCooldown(username, tags, channel) {
    // Verifica se está bloqueado
    if (configManager.isBlocked(username)) {
      return { allowed: false, remaining: 0, reason: 'blocked' };
    }

    // Obtém cooldown baseado na prioridade do usuário
    const userCooldown = configManager.getCooldown(username, tags, channel);

    // Se não tem cooldown, permite
    if (userCooldown === 0) {
      return { allowed: true, remaining: 0 };
    }

    const now = Date.now();
    const lastTime = lastUsed.get(username) || 0;
    const elapsed = (now - lastTime) / 1000;

    if (elapsed < userCooldown) {
      const remaining = Math.ceil(userCooldown - elapsed);
      return { allowed: false, remaining };
    }

    lastUsed.set(username, now);
    return { allowed: true, remaining: 0 };
  }

  // Função para registrar mensagem capturada no servidor
  function registerCapturedMessage(username, message) {
    const data = JSON.stringify({
      username,
      message,
      timestamp: new Date().toISOString()
    });

    const options = {
      hostname: new URL(serverUrl).hostname,
      port: new URL(serverUrl).port || 3000,
      path: '/api/message',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ Mensagem registrada: ${username}: ${message}`);
      }
    });

    req.on('error', (err) => {
      console.error(`❌ Erro ao registrar mensagem: ${err.message}`);
    });

    req.write(data);
    req.end();
  }


  // Função para atualizar a página HTML com novo texto
  function updateTTS(text) {
    if (!text || text.trim().length === 0) {
      console.error('❌ Erro: Texto vazio para TTS');
      return;
    }

    const encodedText = encodeURIComponent(text);
    const url = `${serverUrl}/?text=${encodedText}`;

    console.log(`🔗 Enviando TTS para: ${url.substring(0, 100)}...`);
    console.log(`📝 Texto completo: "${text}"`);

    // Faz uma requisição para atualizar a página
    http.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ TTS atualizado com sucesso: "${text}"`);
      } else {
        console.error(`❌ Erro ao atualizar TTS: ${res.statusCode}`);
      }
    }).on('error', (err) => {
      console.error(`❌ Erro na requisição: ${err.message}`);
    });
  }

  // Evento: Conectado ao chat
  client.on('connected', (addr, port) => {
    console.log(`🤖 Bot conectado em ${addr}:${port}`);
    console.log(`📺 Canais: ${channels.join(', ')}`);
  });

  // Evento: Usuário entrou no chat
  client.on('join', (channel, username, self) => {
    if (!self) {
      usersTracker.addUser(username);
      console.log(`👤 ${username} entrou no chat`);
    }
  });

  // Evento: Usuário saiu do chat
  client.on('part', (channel, username, self) => {
    if (!self) {
      usersTracker.removeUser(username);
      console.log(`👋 ${username} saiu do chat`);
    }
  });

  // Evento: Novo seguidor
  client.on('follow', (channel, username, userstate) => {
    twitchEvents.onFollower(username);
  });

  // Evento: Nova sub
  client.on('subscription', (channel, username, method, message, userstate) => {
    const months = userstate['msg-param-cumulative-months'] || 1;
    twitchEvents.onSubscription(username, parseInt(months), message);
  });

  // Evento: Resub
  client.on('resub', (channel, username, months, message, userstate, methods) => {
    twitchEvents.onSubscription(username, parseInt(months), message);
  });

  // Evento: Raid
  client.on('raided', (channel, username, viewers) => {
    twitchEvents.onRaid(username, parseInt(viewers));
  });

  // Evento: Bits (cheer)
  client.on('cheer', (channel, userstate, message) => {
    const username = userstate.username;
    const bits = parseInt(userstate.bits || 0);
    if (bits > 0) {
      twitchEvents.onBits(username, bits, message);
    }
  });

  // Evento: Mensagem no chat
  client.on('message', (channel, tags, message, self) => {
    try {
      // Ignora mensagens do próprio bot
      if (self) return;

      const username = tags.username || 'unknown';

      // Marca usuário como visto (enviou mensagem)
      try {
        usersTracker.seenUser(username);
      } catch (err) {
        console.error('Erro ao rastrear usuário:', err);
      }

      let isMod = false;
      let isStreamer = false;
      try {
        isMod = configManager.isMod(username, tags);
        isStreamer = configManager.isStreamer(username, channel);
      } catch (err) {
        console.error('Erro ao verificar permissões:', err);
      }

      // Comandos de administração
      if (message.match(/^!ttshelp$/i)) {
        const helpText = `📢 Comandos TTS: !fala <texto> - Fala uma mensagem | !ttsstatus - Status do TTS`;
        if (isMod || isStreamer) {
          const modHelp = ` | Mods: !ttspause, !ttsresume, !ttsvolume <0-100>`;
          client.say(channel, helpText + modHelp);
        } else {
          client.say(channel, helpText);
        }
        return;
      }

      if (message.match(/^!ttsstatus$/i)) {
        const enabled = configManager.getConfig('ttsEnabled') ? 'ligado' : 'desligado';
        client.say(channel, `📢 TTS está ${enabled}`);
        return;
      }

      if (message.match(/^!ttspause$/i) && (isMod || isStreamer)) {
        // Envia comando para pausar
        const data = JSON.stringify({ action: 'pause' });
        const options = {
          hostname: new URL(serverUrl).hostname,
          port: new URL(serverUrl).port || 3000,
          path: '/api/tts/control',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
        };
        http.request(options).end(data);
        client.say(channel, `⏸️ TTS pausado`);
        return;
      }

      if (message.match(/^!ttsresume$/i) && (isMod || isStreamer)) {
        const data = JSON.stringify({ action: 'resume' });
        const options = {
          hostname: new URL(serverUrl).hostname,
          port: new URL(serverUrl).port || 3000,
          path: '/api/tts/control',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
        };
        http.request(options).end(data);
        client.say(channel, `▶️ TTS retomado`);
        return;
      }

      const volumeMatch = message.match(/^!ttsvolume\s+(\d+)$/i);
      if (volumeMatch && (isMod || isStreamer)) {
        const volume = parseInt(volumeMatch[1]);
        const data = JSON.stringify({ action: 'volume', value: volume });
        const options = {
          hostname: new URL(serverUrl).hostname,
          port: new URL(serverUrl).port || 3000,
          path: '/api/tts/control',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
        };
        http.request(options).end(data);
        client.say(channel, `🔊 Volume ajustado para ${volume}%`);
        return;
      }

      // Verifica se é o comando !fala
      const commandMatch = message.match(/^!fala\s+(.+)$/i);
      if (!commandMatch) return;

      // Verifica se TTS está habilitado
      let ttsEnabled = true;
      try {
        ttsEnabled = configManager.getConfig('ttsEnabled');
      } catch (err) {
        console.error('Erro ao verificar TTS habilitado:', err);
      }

      if (!ttsEnabled) {
        client.say(channel, `@${username}, TTS está desabilitado no momento`);
        return;
      }

      let text = commandMatch[1].trim();

      // Valida o texto
      if (text.length === 0) {
        client.say(channel, `@${username}, você precisa fornecer um texto após o comando !fala`);
        return;
      }

      // Filtra texto
      try {
        text = configManager.filterText(text);
      } catch (err) {
        console.error('Erro ao filtrar texto:', err);
        // Continua com texto original se filtro falhar
      }

      if (text.length === 0) {
        client.say(channel, `@${username}, o texto foi filtrado e ficou vazio`);
        return;
      }

      let maxLength = 200;
      try {
        maxLength = configManager.getConfig('maxLength') || 200;
      } catch (err) {
        console.error('Erro ao obter maxLength:', err);
      }

      if (text.length > maxLength) {
        client.say(channel, `@${username}, o texto é muito longo (máximo ${maxLength} caracteres)`);
        return;
      }

      // Verifica blacklist
      try {
        if (configManager.hasBlacklistedWords(text)) {
          client.say(channel, `@${username}, sua mensagem contém palavras bloqueadas`);
          return;
        }
      } catch (err) {
        console.error('Erro ao verificar blacklist:', err);
      }

      // Verifica spam
      try {
        if (configManager.isSpam(username, text)) {
          client.say(channel, `@${username}, mensagem repetida detectada. Aguarde um momento.`);
          return;
        }
      } catch (err) {
        console.error('Erro ao verificar spam:', err);
      }

      // Verifica cooldown
      let cooldown;
      try {
        cooldown = checkCooldown(username, tags, channel);
      } catch (err) {
        console.error('Erro ao verificar cooldown:', err);
        cooldown = { allowed: true, remaining: 0 };
      }

      if (!cooldown.allowed) {
        if (cooldown.reason === 'blocked') {
          return; // Silenciosamente ignora usuários bloqueados
        }
        client.say(channel, `@${username}, aguarde ${cooldown.remaining} segundo(s) antes de usar novamente`);
        return;
      }

      // Formata a mensagem para o TTS: "<Nome do usuário> enviou <mensagem>"
      let userName = tags['display-name'] || tags.username || username;
      userName = userName.replace(/^@+/, '');

      const ttsMessage = `${userName} enviou ${text}`;

      // Obtém prioridade
      let priority = 0;
      try {
        priority = configManager.getPriority(username, tags, channel);
      } catch (err) {
        console.error('Erro ao obter prioridade:', err);
      }

      // Registra estatísticas
      try {
        statsManager.recordMessage(username, text);
      } catch (err) {
        console.error('Erro ao registrar estatísticas:', err);
      }

      try {
        registerCapturedMessage(username, text);
      } catch (err) {
        console.error('Erro ao registrar mensagem:', err);
      }

      // Adiciona à fila no servidor
      try {
        addToQueue({
          text: ttsMessage,
          username,
          originalText: text,
          priority,
          timestamp: new Date().toISOString()
        });
        console.log(`📢 TTS será: "${ttsMessage}" (Prioridade: ${priority})`);
        console.log(`👤 Nome do usuário: "${userName}"`);
        console.log(`💬 ${username}: ${text}`);
      } catch (err) {
        console.error('Erro ao adicionar à fila:', err);
        // Fallback: tenta atualizar TTS diretamente
        try {
          updateTTS(ttsMessage);
          console.log(`📢 TTS (fallback): "${ttsMessage}"`);
        } catch (fallbackErr) {
          console.error('Erro no fallback TTS:', fallbackErr);
        }
      }
    } catch (error) {
      console.error('❌ Erro crítico ao processar mensagem:', error);
      console.error('Stack:', error.stack);
    }
  });

  // Evento: Erro
  client.on('error', (err) => {
    console.error('❌ Erro no bot:', err);
  });

  // Conecta o bot
  client.connect().catch(err => {
    console.error('❌ Erro ao conectar:', err);
  });

  return client;
}

module.exports = { createBot };

