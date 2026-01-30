require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const { generateTTSUrl, validateText } = require('./tts');
const { TTSQueue } = require('./queue');
const { StatsManager } = require('./stats');

/**
 * Cria e configura o servidor Express
 * @param {number} port - Porta do servidor
 * @returns {object} Aplicação Express configurada
 */
function createServer(port = 3000) {
  const app = express();

  // Middleware para parsing JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Garante que todas as respostas /api sejam JSON (evita "Resposta inválida do servidor")
  app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  // Sistema de fila TTS
  const ttsQueue = new TTSQueue();
  const statsManager = new StatsManager();
  const messageHistory = []; // Histórico das últimas mensagens processadas

  let ttsState = {
    enabled: true,
    paused: false,
    volume: 100,
    currentMessage: null
  };

  // Rota para a página principal - DASHBOARD (centralizado)
  app.get('/', (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
  });

  // Rota para /player (player standalone para OBS)
  app.get('/player', (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.sendFile(path.join(__dirname, '../public/player-proxy.html'));
  });

  // Rota para adicionar à fila TTS
  app.post('/api/tts/queue', (req, res) => {
    try {
      console.log('📥 POST /api/tts/queue - Body:', JSON.stringify(req.body));
      const { text, username, priority } = req.body;
      console.log(`   text: "${text}" (tipo: ${typeof text}, length: ${text?.length || 0})`);
      console.log(`   username: "${username}"`);

      if (!text || typeof text !== 'string') {
        console.error('❌ Texto inválido!');
        return res.status(400).json({ error: 'Texto é obrigatório' });
      }

      const message = {
        text: String(text).substring(0, 500),
        username: username || 'unknown',
        priority: parseInt(priority) || 0,
        timestamp: new Date().toISOString(),
        id: Date.now() + Math.random()
      };

      const queueId = ttsQueue.add(message, parseInt(priority) || 0);

      // Adiciona ao histórico (não remove até refresh da página)
      messageHistory.unshift({ ...message, status: 'queued' });

      // Log para debug
      console.log(`✅ TTS adicionado à fila: "${message.text.substring(0, 50)}..." (usuário: ${message.username}, fila: ${ttsQueue.size()})`);

      res.json({ success: true, queueId, queueSize: ttsQueue.size() });
    } catch (error) {
      console.error('❌ Erro ao adicionar à fila:', error);
      res.status(500).json({ error: 'Erro interno' });
    }
  });

  // Rota para obter estado do TTS
  app.get('/api/tts/state', (req, res) => {
    res.json({
      ...ttsState,
      queueSize: ttsQueue.size(),
      queue: ttsQueue.getAll(),
      history: messageHistory // Todas as mensagens (não limita)
    });
  });

  // Rota para controlar TTS
  app.post('/api/tts/control', (req, res) => {
    const { action, value } = req.body;

    switch (action) {
      case 'pause':
        ttsState.paused = true;
        break;
      case 'resume':
        ttsState.paused = false;
        break;
      case 'toggle':
        ttsState.paused = !ttsState.paused;
        break;
      case 'skip':
        const skipped = ttsQueue.getNext(); // Remove primeira mensagem da fila
        if (skipped && messageHistory.length > 0) {
          const historyItem = messageHistory.find(h => h.text === skipped.text && h.status === 'queued');
          if (historyItem) historyItem.status = 'played';
        }
        break;
      case 'clear':
        ttsQueue.clear();
        // Marca todas como limpas no histórico
        messageHistory.forEach(h => {
          if (h.status === 'queued') h.status = 'cleared';
        });
        break;
      case 'volume':
        if (value !== undefined) {
          ttsState.volume = Math.max(0, Math.min(100, parseInt(value)));
        }
        break;
    }

    res.json({ success: true, state: ttsState });
  });

  // Sistema de atualização do currentMessage (frontend processa a fila)
  // Backend apenas mantém referência à mensagem atual para o dashboard
  function updateCurrentMessage() {
    try {
      if (ttsState.paused || !ttsState.enabled || ttsQueue.size() === 0) {
        ttsState.currentMessage = null;
        return;
      }

      // Atualiza currentMessage com a primeira da fila (para exibição no dashboard)
      const nextMessage = ttsQueue.getAll()[0];
      if (nextMessage && nextMessage.text) {
        ttsState.currentMessage = { ...nextMessage, processing: false };
      } else {
        ttsState.currentMessage = null;
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar currentMessage:', error);
      ttsState.currentMessage = null;
    }
  }

  // Atualiza currentMessage a cada 1 segundo (só para o dashboard)
  setInterval(updateCurrentMessage, 1000);

  // Rota para obter estatísticas
  app.get('/api/stats', (req, res) => {
    res.json(statsManager.getStats());
  });

  // Rota para obter usuários online
  app.get('/api/users/online', (req, res) => {
    const bot = app.getBot && app.getBot();
    if (bot && bot.getUsersTracker) {
      const tracker = bot.getUsersTracker();
      const users = tracker.getOnlineUsers();
      res.json({
        count: tracker.getCount(),
        users: users.map(u => ({
          username: u.username,
          messageCount: u.messageCount,
          onlineTime: Date.now() - u.joinedAt
        }))
      });
    } else {
      res.json({ count: 0, users: [] });
    }
  });

  // Rota para buscar clips recentes do canal
  app.get('/api/clips', async (req, res) => {
    try {
      const { getClipsByChannelName } = require('./twitch-api');
      const { getValidAccessToken } = require('./auth');

      const clientId = process.env.TWITCH_CLIENT_ID;
      const clientSecret = process.env.TWITCH_CLIENT_SECRET;
      const channelName = process.env.TWITCH_CHANNEL;

      if (!clientId || !clientSecret || !channelName) {
        return res.status(500).json({
          error: 'Configuração incompleta',
          message: 'CLIENT_ID, CLIENT_SECRET ou CHANNEL não configurados'
        });
      }

      // Obtém token válido
      const accessToken = await getValidAccessToken(clientId, clientSecret);

      // Busca clips (6 mais recentes)
      const count = parseInt(req.query.count) || 6;
      const clips = await getClipsByChannelName(channelName, accessToken, clientId, count);

      // Log para debug - mostra ordenação por data e criador
      console.log(`\n📊 ${clips.length} CLIPS MAIS RECENTES (ordenados por data):`);
      console.log('═'.repeat(80));
      clips.forEach((clip, i) => {
        const date = new Date(clip.created_at);
        console.log(`${i + 1}. "${clip.title.substring(0, 35)}"`);
        console.log(`   👤 Criado por: ${clip.creator_name}`);
        console.log(`   📅 Data: ${date.toLocaleString('pt-BR')} (${clip.formatted_date})`);
        console.log(`   👁️  Views: ${clip.formatted_views} (${clip.view_count})`);
        console.log(`   🔗 URL: ${clip.url}`);
        console.log('─'.repeat(80));
      });
      console.log('');

      res.json({
        success: true,
        count: clips.length,
        clips: clips
      });

    } catch (error) {
      console.error('Erro ao buscar clips:', error);
      res.status(500).json({
        error: 'Erro ao buscar clips',
        message: error.message
      });
    }
  });

  // ============================================
  // ROTAS DE GESTÃO DE LIVE
  // ============================================

  // Lives por categoria (registrado primeiro para evitar 404)
  const handleGetLiveStreams = async (req, res) => {
    try {
      const { getLiveStreamsByGameId } = require('./twitch-api');
      const { getAccessTokenForHelix } = require('./auth');
      const gameId = req.query.game_id;
      if (!gameId) {
        return res.status(400).json({ error: 'game_id é obrigatório' });
      }
      const clientId = process.env.TWITCH_CLIENT_ID;
      const clientSecret = process.env.TWITCH_CLIENT_SECRET;
      const first = Math.min(100, parseInt(req.query.first) || 20);
      if (!clientId || !clientSecret) {
        return res.json({
          success: false,
          error: 'Configuração incompleta',
          message: 'Configure TWITCH_CLIENT_ID e TWITCH_CLIENT_SECRET no .env',
          streams: []
        });
      }
      const accessToken = await getAccessTokenForHelix(clientId, clientSecret);
      const streams = await getLiveStreamsByGameId(gameId, accessToken, clientId, first);
      res.json({ success: true, streams });
    } catch (error) {
      console.error('[streams/live] Erro:', error.message);
      res.json({ success: false, error: 'Erro ao listar lives', message: error.message, streams: [] });
    }
  };
  app.get('/api/lives', handleGetLiveStreams);
  app.get('/api/streams/live', handleGetLiveStreams);
  app.get('/api/stream/live', handleGetLiveStreams);
  app.get('/api/ok', (req, res) => res.json({ ok: true, lives: true })); // para confirmar que o servidor novo está rodando

  // Proxy de imagens (Twitch thumbnails) para permitir print do widget sem canvas tainted
  const ALLOWED_IMAGE_HOSTS = ['static-cdn.jtvnw.net', 'twitch.tv', 'jtvnw.net', 'cdn.jtvnw.net'];
  app.get('/api/proxy-image', (req, res) => {
    const rawUrl = req.query.url;
    if (!rawUrl || typeof rawUrl !== 'string') {
      return res.status(400).json({ error: 'url é obrigatório' });
    }
    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch (e) {
      return res.status(400).json({ error: 'url inválido' });
    }
    const host = parsed.hostname.replace(/^www\./, '');
    if (!ALLOWED_IMAGE_HOSTS.some(h => host === h || host.endsWith('.' + h))) {
      return res.status(403).json({ error: 'Domínio não permitido' });
    }
    const client = parsed.protocol === 'https:' ? https : http;
    client.get(rawUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' } }, (proxyRes) => {
      if (proxyRes.statusCode !== 200) {
        res.status(proxyRes.statusCode || 502).json({ error: 'Falha ao buscar imagem' });
        return;
      }
      const ct = proxyRes.headers['content-type'] || 'image/jpeg';
      res.setHeader('Content-Type', ct);
      res.setHeader('Cache-Control', 'public, max-age=300');
      proxyRes.pipe(res);
    }).on('error', (err) => {
      console.error('[proxy-image]', err.message);
      res.status(502).json({ error: 'Falha ao buscar imagem' });
    });
  });

  // Proxy de TTS (Google Translate) para permitir autoplay sem CORS
  app.get('/api/proxy-tts', (req, res) => {
    const text = req.query.text;
    const lang = req.query.lang || 'pt-BR';

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text é obrigatório' });
    }

    // Limita tamanho
    const cleanText = text.substring(0, 200);

    // Gera URL do Google Translate TTS
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;

    console.log(`[proxy-tts] Buscando TTS: "${cleanText.substring(0, 50)}..."`);

    https.get(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://translate.google.com/'
      }
    }, (proxyRes) => {
      if (proxyRes.statusCode !== 200) {
        console.error(`[proxy-tts] Erro: ${proxyRes.statusCode}`);
        res.status(proxyRes.statusCode || 502).json({ error: 'Falha ao buscar TTS' });
        return;
      }

      // Define headers para áudio
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=3600');

      console.log(`[proxy-tts] ✅ TTS retornado com sucesso`);
      proxyRes.pipe(res);
    }).on('error', (err) => {
      console.error('[proxy-tts] Erro:', err.message);
      res.status(502).json({ error: 'Falha ao buscar TTS' });
    });
  });

  // Verifica scopes disponíveis no token atual
  app.get('/api/stream/scopes', async (req, res) => {
    try {
      const { getValidAccessToken } = require('./auth');
      const { validateTokenScopes } = require('./twitch-api');

      const clientId = process.env.TWITCH_CLIENT_ID;
      const clientSecret = process.env.TWITCH_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return res.json({
          success: true,
          scopes: [],
          hasClipsEdit: false,
          hasChannelManage: false,
          hasCommercial: false,
          availableFeatures: {
            createClip: false,
            updateTitle: false,
            updateCategory: false,
            runCommercial: false
          },
          needsAuth: true,
          message: 'Configuração OAuth ausente. Configure CLIENT_ID e CLIENT_SECRET no .env'
        });
      }

      let accessToken;
      try {
        accessToken = await getValidAccessToken(clientId, clientSecret);
      } catch (authError) {
        // Token não existe ou é inválido - retorna que precisa autenticar
        console.log('Token ausente ou inválido:', authError.message);
        return res.json({
          success: true,
          scopes: [],
          hasClipsEdit: false,
          hasChannelManage: false,
          hasCommercial: false,
          availableFeatures: {
            createClip: false,
            updateTitle: false,
            updateCategory: false,
            runCommercial: false
          },
          needsAuth: true,
          message: authError.message === 'AUTH_REQUIRED'
            ? 'Autorização OAuth necessária. Clique em "Solicitar Novas Permissões"'
            : `Erro de autenticação: ${authError.message}`
        });
      }

      const scopeInfo = await validateTokenScopes(accessToken);

      res.json({
        success: true,
        ...scopeInfo,
        availableFeatures: {
          createClip: scopeInfo.hasClipsEdit,
          updateTitle: scopeInfo.hasChannelManage,
          updateCategory: scopeInfo.hasChannelManage,
          runCommercial: scopeInfo.hasCommercial
        },
        needsAuth: false
      });
    } catch (error) {
      console.error('Erro ao verificar scopes:', error);
      res.json({
        success: false,
        error: 'Erro ao verificar permissões',
        message: error.message,
        scopes: [],
        hasClipsEdit: false,
        hasChannelManage: false,
        hasCommercial: false,
        availableFeatures: {
          createClip: false,
          updateTitle: false,
          updateCategory: false,
          runCommercial: false
        }
      });
    }
  });

  // Gera URL para solicitar novos scopes OAuth
  app.get('/api/stream/auth-url', (req, res) => {
    try {
      const { getAuthorizationUrl } = require('./auth');

      const clientId = process.env.TWITCH_CLIENT_ID;
      const redirectUri = process.env.TWITCH_REDIRECT_URI || 'http://localhost:3000/auth/callback';

      // Scopes completos necessários para todas as funcionalidades
      const scopes = [
        'chat:read',
        'chat:edit',
        'clips:edit',
        'channel:manage:broadcast',
        'channel:edit:commercial'
      ].join(' ');

      const authUrl = getAuthorizationUrl(clientId, redirectUri, scopes);

      res.json({
        success: true,
        authUrl: authUrl
      });
    } catch (error) {
      console.error('Erro ao gerar URL de autorização:', error);
      res.status(500).json({
        error: 'Erro ao gerar URL',
        message: error.message
      });
    }
  });

  // Callback OAuth (para processar autorização)
  app.get('/auth/callback', async (req, res) => {
    try {
      const { exchangeCodeForTokens, saveTokens } = require('./auth');

      const code = req.query.code;
      if (!code) {
        return res.status(400).send('Código de autorização não fornecido');
      }

      const clientId = process.env.TWITCH_CLIENT_ID;
      const clientSecret = process.env.TWITCH_CLIENT_SECRET;
      const redirectUri = process.env.TWITCH_REDIRECT_URI || 'http://localhost:3000/auth/callback';

      const tokens = await exchangeCodeForTokens(code, clientId, clientSecret, redirectUri);
      saveTokens(tokens);

      console.log('✅ Autorização OAuth concluída com sucesso!');
      console.log('📝 Scopes obtidos:', tokens.scope);

      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Autorização Concluída</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #1a1a2e; color: white; }
            .success { color: #4CAF50; font-size: 24px; margin-bottom: 20px; }
            button { background: #9146ff; color: white; border: none; padding: 15px 30px; 
                     font-size: 16px; border-radius: 5px; cursor: pointer; }
            button:hover { background: #772ce8; }
          </style>
        </head>
        <body>
          <div class="success">✅ Autorização concluída com sucesso!</div>
          <p>Novas permissões foram concedidas.</p>
          <p>Você pode fechar esta janela ou retornar ao dashboard.</p>
          <button onclick="window.close() || (window.location.href='/')">Fechar / Voltar ao Dashboard</button>
        </body>
        </html>
      `);
    } catch (error) {
      console.error('Erro no callback OAuth:', error);
      res.status(500).send(`Erro na autorização: ${error.message}`);
    }
  });

  // Criar clip
  app.post('/api/stream/create-clip', async (req, res) => {
    try {
      const { getBroadcasterInfo, createClip } = require('./twitch-api');
      const { getValidAccessToken } = require('./auth');

      const clientId = process.env.TWITCH_CLIENT_ID;
      const clientSecret = process.env.TWITCH_CLIENT_SECRET;
      const channelName = process.env.TWITCH_CHANNEL;

      const accessToken = await getValidAccessToken(clientId, clientSecret);
      const broadcaster = await getBroadcasterInfo(channelName, accessToken, clientId);

      const hasDelay = req.body.hasDelay || false;
      const clipData = await createClip(broadcaster.id, accessToken, clientId, hasDelay);

      res.json({
        success: true,
        clip: {
          id: clipData.id,
          edit_url: clipData.edit_url,
          created_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Erro ao criar clip:', error);
      res.status(500).json({
        error: 'Erro ao criar clip',
        message: error.message
      });
    }
  });

  // Obter informações da stream
  app.get('/api/stream/info', async (req, res) => {
    try {
      const { getBroadcasterInfo, getStreamInfo, getChannelInfo } = require('./twitch-api');
      const { getValidAccessToken } = require('./auth');

      const clientId = process.env.TWITCH_CLIENT_ID;
      const clientSecret = process.env.TWITCH_CLIENT_SECRET;
      const channelName = process.env.TWITCH_CHANNEL;

      if (!clientId || !clientSecret || !channelName) {
        return res.status(500).json({
          success: false,
          error: 'Configuração incompleta',
          message: 'CLIENT_ID, CLIENT_SECRET ou CHANNEL não configurados no .env'
        });
      }

      let accessToken;
      try {
        accessToken = await getValidAccessToken(clientId, clientSecret);
      } catch (authError) {
        console.log('Token ausente ou inválido (stream info):', authError.message);
        return res.json({
          success: false,
          error: 'Autorização necessária',
          message: authError.message === 'AUTH_REQUIRED'
            ? 'Token OAuth ausente ou inválido. Solicite novas permissões.'
            : `Erro de autenticação: ${authError.message}`,
          needsAuth: true
        });
      }

      const broadcaster = await getBroadcasterInfo(channelName, accessToken, clientId);

      const [streamInfo, channelInfo] = await Promise.all([
        getStreamInfo(broadcaster.id, accessToken, clientId),
        getChannelInfo(broadcaster.id, accessToken, clientId)
      ]);

      res.json({
        success: true,
        isLive: streamInfo !== null,
        stream: streamInfo,
        channel: channelInfo
      });
    } catch (error) {
      console.error('Erro ao buscar informações da stream:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar informações',
        message: error.message
      });
    }
  });

  // Atualizar título
  app.post('/api/stream/update-title', async (req, res) => {
    try {
      const { getBroadcasterInfo, updateStreamTitle } = require('./twitch-api');
      const { getValidAccessToken } = require('./auth');

      const { title } = req.body;
      if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Título é obrigatório' });
      }

      const clientId = process.env.TWITCH_CLIENT_ID;
      const clientSecret = process.env.TWITCH_CLIENT_SECRET;
      const channelName = process.env.TWITCH_CHANNEL;

      const accessToken = await getValidAccessToken(clientId, clientSecret);
      const broadcaster = await getBroadcasterInfo(channelName, accessToken, clientId);

      await updateStreamTitle(broadcaster.id, title, accessToken, clientId);

      res.json({
        success: true,
        message: 'Título atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar título:', error);
      res.status(500).json({
        error: 'Erro ao atualizar título',
        message: error.message
      });
    }
  });

  // Buscar categorias (usa token do usuário ou App Access Token - não exige autorização)
  app.get('/api/stream/search-categories', async (req, res) => {
    try {
      const { searchCategories } = require('./twitch-api');
      const { getAccessTokenForHelix } = require('./auth');

      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ error: 'Query é obrigatório' });
      }

      const clientId = process.env.TWITCH_CLIENT_ID;
      const clientSecret = process.env.TWITCH_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return res.json({
          success: false,
          error: 'Configuração incompleta',
          message: 'Configure TWITCH_CLIENT_ID e TWITCH_CLIENT_SECRET no .env',
          categories: []
        });
      }

      const accessToken = await getAccessTokenForHelix(clientId, clientSecret);
      const categories = await searchCategories(query, accessToken, clientId);

      res.json({
        success: true,
        categories: categories
      });
    } catch (error) {
      console.error('[search-categories] Erro:', error.message);
      res.json({
        success: false,
        error: 'Erro ao buscar categorias',
        message: error.message,
        categories: []
      });
    }
  });

  // Atualizar categoria
  app.post('/api/stream/update-category', async (req, res) => {
    try {
      const { getBroadcasterInfo, updateStreamCategory } = require('./twitch-api');
      const { getValidAccessToken } = require('./auth');

      const { gameId } = req.body;
      if (!gameId) {
        return res.status(400).json({ error: 'ID do jogo é obrigatório' });
      }

      const clientId = process.env.TWITCH_CLIENT_ID;
      const clientSecret = process.env.TWITCH_CLIENT_SECRET;
      const channelName = process.env.TWITCH_CHANNEL;

      const accessToken = await getValidAccessToken(clientId, clientSecret);
      const broadcaster = await getBroadcasterInfo(channelName, accessToken, clientId);

      await updateStreamCategory(broadcaster.id, gameId, accessToken, clientId);

      res.json({
        success: true,
        message: 'Categoria atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      res.status(500).json({
        error: 'Erro ao atualizar categoria',
        message: error.message
      });
    }
  });

  // Rodar comercial
  app.post('/api/stream/run-commercial', async (req, res) => {
    try {
      const { getBroadcasterInfo, runCommercial } = require('./twitch-api');
      const { getValidAccessToken } = require('./auth');

      const { length } = req.body;
      const validLengths = [30, 60, 90, 120, 150, 180];

      if (!length || !validLengths.includes(parseInt(length))) {
        return res.status(400).json({
          error: 'Duração inválida',
          message: `Use uma das durações: ${validLengths.join(', ')} segundos`
        });
      }

      const clientId = process.env.TWITCH_CLIENT_ID;
      const clientSecret = process.env.TWITCH_CLIENT_SECRET;
      const channelName = process.env.TWITCH_CHANNEL;

      const accessToken = await getValidAccessToken(clientId, clientSecret);
      const broadcaster = await getBroadcasterInfo(channelName, accessToken, clientId);

      const commercialData = await runCommercial(broadcaster.id, parseInt(length), accessToken, clientId);

      res.json({
        success: true,
        commercial: {
          length: commercialData.length,
          message: commercialData.message,
          retry_after: commercialData.retry_after
        }
      });
    } catch (error) {
      console.error('Erro ao rodar comercial:', error);
      res.status(500).json({
        error: 'Erro ao rodar comercial',
        message: error.message
      });
    }
  });

  // 404 para rotas /api não encontradas (sempre responde JSON)
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Not found', path: req.path });
  });

  // Servir arquivos estáticos
  app.use(express.static(path.join(__dirname, '../public')));

  // Rota de teste de TTS
  app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/test-tts.html'));
  });

  // Rota de health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Registra mensagens no StatsManager quando adicionadas à fila
  const originalAdd = ttsQueue.add.bind(ttsQueue);
  ttsQueue.add = function (message, priority) {
    if (message.username && message.text) {
      statsManager.recordMessage(message.username, message.text);
    }
    return originalAdd(message, priority);
  };

  // Exporta sistemas para uso externo
  app.getQueue = () => ttsQueue;
  app.getTTSState = () => ttsState;
  app.getStats = () => statsManager;
  app.getBot = () => null; // Será definido quando o bot for criado

  // Inicia o servidor
  const server = app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
    console.log('   API Lives: GET /api/lives (e /api/stream/live, /api/streams/live)');
  });

  return { app, server };
}

module.exports = { createServer };

