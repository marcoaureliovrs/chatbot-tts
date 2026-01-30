require('dotenv').config();
const { createServer } = require('./server');
const { createBot } = require('./bot');
const { getValidAccessToken, loadTokens } = require('./auth');

// Configurações do servidor
const PORT = process.env.PORT || 3000;

// Configurações OAuth
const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const TWITCH_CHANNEL = process.env.TWITCH_CHANNEL;

// Valida configurações básicas
if (!CLIENT_ID) {
  console.error('❌ Erro: TWITCH_CLIENT_ID não configurado no arquivo .env');
  console.error('   Configure as variáveis de ambiente necessárias.');
  process.exit(1);
}

if (!TWITCH_CHANNEL) {
  console.error('❌ Erro: TWITCH_CHANNEL não configurado no arquivo .env');
  console.error('   Configure o canal da Twitch onde o bot irá operar.');
  process.exit(1);
}

// Inicia o servidor HTTP primeiro
console.log('🚀 Iniciando servidor...');
const { app, server } = createServer(PORT);

// Função para iniciar o bot
async function startBot() {
  try {
    // Verifica se há tokens salvos
    const tokens = loadTokens();
    if (!tokens || !tokens.access_token) {
      console.log('');
      console.log('⚠️  Nenhum token de autenticação encontrado.');
      console.log('📝 Por favor, faça login primeiro:');
      console.log(`   http://localhost:${PORT}/auth/login`);
      console.log('');
      console.log('💡 O servidor está rodando. Após fazer login, reinicie a aplicação.');
      return null;
    }

    // Obtém token válido (atualiza se necessário)
    console.log('🔐 Verificando autenticação...');
    const accessToken = await getValidAccessToken(CLIENT_ID, CLIENT_SECRET);
    console.log('✅ Autenticação válida!');

    // Configurações do bot
    const BOT_CONFIG = {
      accessToken: accessToken,
      clientId: CLIENT_ID,
      channels: [TWITCH_CHANNEL],
      cooldownSeconds: parseInt(process.env.TTS_COOLDOWN_SECONDS || '3', 10),
      maxLength: parseInt(process.env.TTS_MAX_LENGTH || '200', 10),
      serverUrl: `http://localhost:${PORT}`
    };

    // Inicia o bot da Twitch
    console.log('🤖 Iniciando bot da Twitch...');
    const bot = await createBot(BOT_CONFIG);
    
    // Conecta bot ao servidor para acesso via API
    if (app) {
      app.getBot = () => bot;
    }
    
    return bot;
  } catch (error) {
    console.error('❌ Erro ao iniciar bot:', error.message);
    if (error.message.includes('Nenhum token encontrado') || error.message.includes('faça login')) {
      console.log('');
      console.log('📝 Por favor, faça login primeiro:');
      console.log(`   http://localhost:${PORT}/auth/login`);
    }
    return null;
  }
}

// Inicia o bot
let botInstance = null;
startBot().then(bot => {
  botInstance = bot;
});

// Tratamento de encerramento gracioso
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando aplicação...');
  if (botInstance) {
    botInstance.disconnect();
  }
  server.close(() => {
    console.log('✅ Aplicação encerrada');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Encerrando aplicação...');
  if (botInstance) {
    botInstance.disconnect();
  }
  server.close(() => {
    console.log('✅ Aplicação encerrada');
    process.exit(0);
  });
});

