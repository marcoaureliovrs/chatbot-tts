const https = require('https');
const { getValidAccessToken, getUserInfo } = require('./auth');

/**
 * Faz requisição GET para a API da Twitch
 */
function twitchApiRequest(path, accessToken, clientId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.twitch.tv',
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': clientId
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error('Erro ao parsear resposta da API'));
          }
        } else {
          reject(new Error(`API retornou status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * Faz requisição POST/PATCH para a API da Twitch
 */
function twitchApiRequestWithBody(path, accessToken, clientId, method = 'POST', body = null) {
  return new Promise((resolve, reject) => {
    const bodyString = body ? JSON.stringify(body) : '';
    
    const options = {
      hostname: 'api.twitch.tv',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': clientId,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyString)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ statusCode: res.statusCode, data: parsed });
          } else {
            reject(new Error(`API retornou status ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ statusCode: res.statusCode, data: {} });
          } else {
            reject(new Error(`API retornou status ${res.statusCode}: ${data}`));
          }
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (bodyString) {
      req.write(bodyString);
    }

    req.end();
  });
}

/**
 * Busca informações do canal/broadcaster
 */
async function getBroadcasterInfo(username, accessToken, clientId) {
  try {
    const data = await twitchApiRequest(
      `/helix/users?login=${username}`,
      accessToken,
      clientId
    );
    
    if (data.data && data.data.length > 0) {
      return data.data[0];
    }
    
    throw new Error('Broadcaster não encontrado');
  } catch (error) {
    console.error('Erro ao buscar broadcaster:', error);
    throw error;
  }
}

/**
 * Busca clips recentes do canal
 * @param {string} broadcasterId - ID do broadcaster
 * @param {string} accessToken - Token de acesso
 * @param {string} clientId - Client ID
 * @param {number} first - Número de clips a buscar (padrão: 6)
 * @returns {Promise<Array>} Lista de clips
 */
async function getRecentClips(broadcasterId, accessToken, clientId, first = 6) {
  try {
    // Busca TODOS os clips disponíveis do canal (máximo 100 por requisição)
    console.log(`🔍 Buscando clips do broadcaster ID: ${broadcasterId}`);
    
    const data = await twitchApiRequest(
      `/helix/clips?broadcaster_id=${broadcasterId}&first=100`,
      accessToken,
      clientId
    );
    
    if (data.data) {
      console.log(`📊 Total de clips encontrados: ${data.data.length}`);
      
      // Log de todos os clips com criador e data
      data.data.forEach((clip, i) => {
        const date = new Date(clip.created_at);
        console.log(`  ${i + 1}. "${clip.title.substring(0, 30)}" por ${clip.creator_name} - ${date.toLocaleString('pt-BR')}`);
      });
      
      // Ordena por data de criação (mais recente primeiro)
      const sortedClips = data.data.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
      
      console.log(`✅ Retornando os ${first} clips mais recentes (ordenados por data)`);
      
      // Retorna apenas a quantidade solicitada
      return sortedClips.slice(0, first);
    }
    
    console.log('⚠️ Nenhum clip encontrado');
    return [];
  } catch (error) {
    console.error('❌ Erro ao buscar clips:', error);
    throw error;
  }
}

/**
 * Busca clips recentes de um canal por nome
 * @param {string} channelName - Nome do canal
 * @param {string} accessToken - Token de acesso
 * @param {string} clientId - Client ID
 * @param {number} count - Número de clips (padrão: 6)
 * @returns {Promise<Array>} Lista de clips formatados
 */
async function getClipsByChannelName(channelName, accessToken, clientId, count = 6) {
  try {
    // 1. Busca informações do broadcaster
    const broadcaster = await getBroadcasterInfo(channelName, accessToken, clientId);
    
    // 2. Busca clips
    const clips = await getRecentClips(broadcaster.id, accessToken, clientId, count);
    
    // 3. Formata clips para exibição
    return clips.map(clip => ({
      id: clip.id,
      url: clip.url,
      embed_url: clip.embed_url,
      title: clip.title,
      thumbnail_url: clip.thumbnail_url,
      creator_name: clip.creator_name,
      view_count: clip.view_count,
      created_at: clip.created_at,
      duration: clip.duration,
      game_name: clip.game_id || 'Sem categoria',
      formatted_date: formatDate(clip.created_at),
      formatted_views: formatNumber(clip.view_count)
    }));
  } catch (error) {
    console.error('Erro ao buscar clips por nome do canal:', error);
    throw error;
  }
}

/**
 * Formata data para exibição
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) {
    return `${minutes} minuto${minutes !== 1 ? 's' : ''} atrás`;
  } else if (hours < 24) {
    return `${hours} hora${hours !== 1 ? 's' : ''} atrás`;
  } else if (days < 7) {
    return `${days} dia${days !== 1 ? 's' : ''} atrás`;
  } else {
    return date.toLocaleDateString('pt-BR');
  }
}

/**
 * Formata número para exibição
 */
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Cria um clip da transmissão ao vivo
 * @param {string} broadcasterId - ID do broadcaster
 * @param {string} accessToken - Token com scope clips:edit
 * @param {string} clientId - Client ID
 * @param {boolean} hasDelay - Se deve esperar delay da stream (padrão: false)
 * @returns {Promise<object>} Informações do clip criado
 */
async function createClip(broadcasterId, accessToken, clientId, hasDelay = false) {
  try {
    console.log(`🎬 Criando clip para broadcaster ID: ${broadcasterId}`);
    
    const result = await twitchApiRequestWithBody(
      `/helix/clips?broadcaster_id=${broadcasterId}&has_delay=${hasDelay}`,
      accessToken,
      clientId,
      'POST'
    );
    
    if (result.data && result.data.data && result.data.data.length > 0) {
      const clipData = result.data.data[0];
      console.log(`✅ Clip criado! ID: ${clipData.id}, Edit URL: ${clipData.edit_url}`);
      return clipData;
    }
    
    throw new Error('Nenhum dado retornado ao criar clip');
  } catch (error) {
    console.error('❌ Erro ao criar clip:', error);
    throw error;
  }
}

/**
 * Obtém informações da stream ao vivo
 * @param {string} broadcasterId - ID do broadcaster
 * @param {string} accessToken - Token de acesso
 * @param {string} clientId - Client ID
 * @returns {Promise<object|null>} Informações da stream ou null se offline
 */
async function getStreamInfo(broadcasterId, accessToken, clientId) {
  try {
    const data = await twitchApiRequest(
      `/helix/streams?user_id=${broadcasterId}`,
      accessToken,
      clientId
    );
    
    if (data.data && data.data.length > 0) {
      return data.data[0];
    }
    
    return null; // Stream offline
  } catch (error) {
    console.error('❌ Erro ao buscar informações da stream:', error);
    throw error;
  }
}

/**
 * Obtém informações do canal
 * @param {string} broadcasterId - ID do broadcaster
 * @param {string} accessToken - Token de acesso
 * @param {string} clientId - Client ID
 * @returns {Promise<object>} Informações do canal
 */
async function getChannelInfo(broadcasterId, accessToken, clientId) {
  try {
    const data = await twitchApiRequest(
      `/helix/channels?broadcaster_id=${broadcasterId}`,
      accessToken,
      clientId
    );
    
    if (data.data && data.data.length > 0) {
      return data.data[0];
    }
    
    throw new Error('Informações do canal não encontradas');
  } catch (error) {
    console.error('❌ Erro ao buscar informações do canal:', error);
    throw error;
  }
}

/**
 * Atualiza título da stream
 * @param {string} broadcasterId - ID do broadcaster
 * @param {string} title - Novo título (máximo 140 caracteres)
 * @param {string} accessToken - Token com scope channel:manage:broadcast
 * @param {string} clientId - Client ID
 * @returns {Promise<boolean>} Sucesso
 */
async function updateStreamTitle(broadcasterId, title, accessToken, clientId) {
  try {
    console.log(`📝 Atualizando título para: "${title.substring(0, 50)}..."`);
    
    if (title.length > 140) {
      throw new Error('Título não pode ter mais de 140 caracteres');
    }
    
    await twitchApiRequestWithBody(
      `/helix/channels?broadcaster_id=${broadcasterId}`,
      accessToken,
      clientId,
      'PATCH',
      { title: title }
    );
    
    console.log('✅ Título atualizado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar título:', error);
    throw error;
  }
}

/**
 * Atualiza categoria/jogo da stream
 * @param {string} broadcasterId - ID do broadcaster
 * @param {string} gameId - ID do jogo/categoria
 * @param {string} accessToken - Token com scope channel:manage:broadcast
 * @param {string} clientId - Client ID
 * @returns {Promise<boolean>} Sucesso
 */
async function updateStreamCategory(broadcasterId, gameId, accessToken, clientId) {
  try {
    console.log(`🎮 Atualizando categoria para game ID: ${gameId}`);
    
    await twitchApiRequestWithBody(
      `/helix/channels?broadcaster_id=${broadcasterId}`,
      accessToken,
      clientId,
      'PATCH',
      { game_id: gameId }
    );
    
    console.log('✅ Categoria atualizada com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar categoria:', error);
    throw error;
  }
}

/**
 * Busca categorias/jogos por nome
 * @param {string} query - Nome do jogo/categoria
 * @param {string} accessToken - Token de acesso
 * @param {string} clientId - Client ID
 * @param {number} first - Número de resultados (padrão: 10)
 * @returns {Promise<Array>} Lista de categorias
 */
async function searchCategories(query, accessToken, clientId, first = 10) {
  try {
    const data = await twitchApiRequest(
      `/helix/search/categories?query=${encodeURIComponent(query)}&first=${first}`,
      accessToken,
      clientId
    );
    
    if (data.data) {
      return data.data.map(cat => ({
        id: cat.id,
        name: cat.name,
        box_art_url: cat.box_art_url
      }));
    }
    
    return [];
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    throw error;
  }
}

/**
 * Roda um comercial na stream
 * @param {string} broadcasterId - ID do broadcaster
 * @param {number} length - Duração em segundos (30, 60, 90, 120, 150, 180)
 * @param {string} accessToken - Token com scope channel:edit:commercial
 * @param {string} clientId - Client ID
 * @returns {Promise<object>} Informações do comercial
 */
async function runCommercial(broadcasterId, length, accessToken, clientId) {
  try {
    console.log(`📺 Iniciando comercial de ${length} segundos`);
    
    const validLengths = [30, 60, 90, 120, 150, 180];
    if (!validLengths.includes(length)) {
      throw new Error(`Duração inválida. Use: ${validLengths.join(', ')}`);
    }
    
    const result = await twitchApiRequestWithBody(
      `/helix/channels/commercial`,
      accessToken,
      clientId,
      'POST',
      {
        broadcaster_id: broadcasterId,
        length: length
      }
    );
    
    if (result.data && result.data.data && result.data.data.length > 0) {
      const commercialData = result.data.data[0];
      console.log(`✅ Comercial iniciado! Duração: ${commercialData.length}s, Retry após: ${commercialData.retry_after}s`);
      return commercialData;
    }
    
    throw new Error('Nenhum dado retornado ao iniciar comercial');
  } catch (error) {
    console.error('❌ Erro ao rodar comercial:', error);
    throw error;
  }
}

/**
 * Lista lives de uma categoria/jogo, ordenadas por viewers (maior primeiro)
 * @param {string} gameId - ID do jogo/categoria
 * @param {string} accessToken - Token de acesso
 * @param {string} clientId - Client ID
 * @param {number} first - Quantidade de streams (máx. 100, padrão: 20)
 * @returns {Promise<Array>} Lista de streams
 */
async function getLiveStreamsByGameId(gameId, accessToken, clientId, first = 20) {
  try {
    // Não passamos "language" para retornar lives de todo o mundo, qualquer país/idioma
    const data = await twitchApiRequest(
      `/helix/streams?game_id=${encodeURIComponent(gameId)}&first=${Math.min(first, 100)}`,
      accessToken,
      clientId
    );

    if (!data.data) {
      return [];
    }

    return data.data.map(stream => ({
      id: stream.id,
      user_id: stream.user_id,
      user_login: stream.user_login,
      user_name: stream.user_name,
      game_id: stream.game_id,
      game_name: stream.game_name,
      title: stream.title,
      viewer_count: stream.viewer_count,
      started_at: stream.started_at,
      thumbnail_url: stream.thumbnail_url,
      formatted_viewers: formatNumber(stream.viewer_count)
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar lives por categoria:', error);
    throw error;
  }
}

/**
 * Verifica se o token tem os scopes necessários
 * @param {string} accessToken - Token de acesso
 * @returns {Promise<object>} Informações do token incluindo scopes
 */
async function validateTokenScopes(accessToken) {
  try {
    if (!accessToken) {
      return {
        scopes: [],
        hasClipsEdit: false,
        hasChannelManage: false,
        hasCommercial: false
      };
    }

    const { validateToken } = require('./auth');
    const tokenInfo = await validateToken(accessToken, process.env.TWITCH_CLIENT_ID);
    
    const scopes = Array.isArray(tokenInfo.scopes) ? tokenInfo.scopes : [];
    
    return {
      scopes: scopes,
      hasClipsEdit: scopes.includes('clips:edit'),
      hasChannelManage: scopes.includes('channel:manage:broadcast'),
      hasCommercial: scopes.includes('channel:edit:commercial')
    };
  } catch (error) {
    console.error('❌ Erro ao validar scopes do token:', error.message);
    // Retorna objeto vazio em caso de erro em vez de lançar exceção
    return {
      scopes: [],
      hasClipsEdit: false,
      hasChannelManage: false,
      hasCommercial: false,
      error: error.message
    };
  }
}

module.exports = {
  twitchApiRequest,
  twitchApiRequestWithBody,
  getBroadcasterInfo,
  getRecentClips,
  getClipsByChannelName,
  createClip,
  getStreamInfo,
  getChannelInfo,
  updateStreamTitle,
  updateStreamCategory,
  searchCategories,
  getLiveStreamsByGameId,
  runCommercial,
  validateTokenScopes
};
