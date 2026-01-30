const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Módulo de autenticação OAuth da Twitch
 */

const TOKEN_FILE = path.join(__dirname, '../.twitch-tokens.json');
const TWITCH_OAUTH_URL = 'https://id.twitch.tv/oauth2';
const TWITCH_API_URL = 'https://api.twitch.tv/helix';

/**
 * Carrega tokens salvos do arquivo
 * @returns {object|null} Tokens salvos ou null
 */
function loadTokens() {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      const data = fs.readFileSync(TOKEN_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar tokens:', error.message);
  }
  return null;
}

/**
 * Salva tokens no arquivo
 * @param {object} tokens - Tokens para salvar
 */
function saveTokens(tokens) {
  try {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), 'utf8');
  } catch (error) {
    console.error('Erro ao salvar tokens:', error.message);
  }
}

/**
 * Faz requisição HTTPS
 * @param {string} url - URL completa
 * @param {object} options - Opções da requisição
 * @returns {Promise<object>} Resposta parseada
 */
function httpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        // Se o status é de erro, rejeita imediatamente sem tentar parsear
        if (res.statusCode >= 400) {
          try {
            const parsed = JSON.parse(data);
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || JSON.stringify(parsed)}`));
          } catch (parseError) {
            // Se não conseguir parsear, retorna erro com preview do conteúdo
            const preview = data.substring(0, 100);
            reject(new Error(`HTTP ${res.statusCode}: ${preview}...`));
          }
          return;
        }
        
        // Status 2xx - tenta parsear JSON
        try {
          const parsed = JSON.parse(data);
          resolve({ data: parsed, statusCode: res.statusCode });
        } catch (error) {
          // Se não for JSON, retorna o texto bruto
          resolve({ data, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Troca código de autorização por tokens
 * @param {string} code - Código de autorização
 * @param {string} clientId - Client ID da aplicação
 * @param {string} clientSecret - Client Secret da aplicação
 * @param {string} redirectUri - URI de redirecionamento
 * @returns {Promise<object>} Tokens de acesso
 */
async function exchangeCodeForTokens(code, clientId, clientSecret, redirectUri) {
  const url = `${TWITCH_OAUTH_URL}/token?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `client_secret=${encodeURIComponent(clientSecret)}&` +
    `code=${encodeURIComponent(code)}&` +
    `grant_type=authorization_code&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}`;

  try {
    const response = await httpsRequest(url, { method: 'POST' });
    return response.data;
  } catch (error) {
    throw new Error(`Erro ao trocar código por tokens: ${error.message}`);
  }
}

/**
 * Atualiza o token de acesso usando refresh token
 * @param {string} refreshToken - Refresh token
 * @param {string} clientId - Client ID da aplicação
 * @param {string} clientSecret - Client Secret da aplicação
 * @returns {Promise<object>} Novos tokens
 */
async function refreshAccessToken(refreshToken, clientId, clientSecret) {
  const url = `${TWITCH_OAUTH_URL}/token?` +
    `grant_type=refresh_token&` +
    `refresh_token=${encodeURIComponent(refreshToken)}&` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `client_secret=${encodeURIComponent(clientSecret)}`;

  try {
    const response = await httpsRequest(url, { method: 'POST' });
    return response.data;
  } catch (error) {
    throw new Error(`Erro ao atualizar token: ${error.message}`);
  }
}

/**
 * Obtém App Access Token (Client Credentials) - não exige autorização do usuário.
 * Usado para endpoints públicos como Get Streams e Search Categories.
 * @param {string} clientId - Client ID
 * @param {string} clientSecret - Client Secret
 * @returns {Promise<string>} Access token
 */
let _appTokenCache = { token: null, expiresAt: 0 };

async function getAppAccessToken(clientId, clientSecret) {
  if (_appTokenCache.token && Date.now() < _appTokenCache.expiresAt - 60000) {
    return _appTokenCache.token;
  }
  const url = `${TWITCH_OAUTH_URL}/token`;
  const body = `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`;
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) {
            _appTokenCache = {
              token: parsed.access_token,
              expiresAt: Date.now() + (parsed.expires_in || 0) * 1000
            };
            resolve(parsed.access_token);
          } else {
            reject(new Error(parsed.message || 'Falha ao obter app token'));
          }
        } catch (e) {
          reject(new Error(data || 'Resposta inválida'));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Retorna um token válido: tenta token do usuário primeiro, depois App Access Token.
 * Para streams e categorias não exige que o usuário tenha autorizado.
 */
async function getAccessTokenForHelix(clientId, clientSecret) {
  try {
    return await getValidAccessToken(clientId, clientSecret);
  } catch (e) {
    if (e.message === 'AUTH_REQUIRED' && clientId && clientSecret) {
      return await getAppAccessToken(clientId, clientSecret);
    }
    throw e;
  }
}

/**
 * Valida e obtém informações do token
 * @param {string} accessToken - Token de acesso
 * @param {string} clientId - Client ID da aplicação
 * @returns {Promise<object>} Informações do token
 */
async function validateToken(accessToken, clientId) {
  const url = `${TWITCH_OAUTH_URL}/validate`;

  try {
    const response = await httpsRequest(url, {
      method: 'GET',
      headers: {
        'Authorization': `OAuth ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Erro ao validar token: ${error.message}`);
  }
}

/**
 * Obtém informações do usuário autenticado
 * @param {string} accessToken - Token de acesso
 * @param {string} clientId - Client ID da aplicação
 * @returns {Promise<object>} Informações do usuário
 */
async function getUserInfo(accessToken, clientId) {
  const url = `${TWITCH_API_URL}/users`;

  try {
    const response = await httpsRequest(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': clientId
      }
    });
    return response.data.data[0]; // Retorna o primeiro usuário (o autenticado)
  } catch (error) {
    throw new Error(`Erro ao obter informações do usuário: ${error.message}`);
  }
}

/**
 * Obtém token de acesso válido (carrega do arquivo ou atualiza se necessário)
 * @param {string} clientId - Client ID da aplicação
 * @param {string} clientSecret - Client Secret da aplicação
 * @returns {Promise<string>} Token de acesso válido
 */
async function getValidAccessToken(clientId, clientSecret) {
  let tokens = loadTokens();

  if (!tokens || !tokens.access_token) {
    throw new Error('AUTH_REQUIRED');
  }

  // Valida o token atual
  try {
    const validation = await validateToken(tokens.access_token, clientId);
    
    // Se o token ainda é válido, retorna
    if (validation && validation.expires_in > 0) {
      return tokens.access_token;
    }
  } catch (error) {
    // Token inválido, tenta atualizar
    console.log('Token inválido ou expirado, tentando atualizar...', error.message);
  }

  // Tenta atualizar o token
  if (tokens.refresh_token) {
    try {
      const newTokens = await refreshAccessToken(tokens.refresh_token, clientId, clientSecret);
      const updatedTokens = {
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token || tokens.refresh_token,
        expires_in: newTokens.expires_in,
        token_type: newTokens.token_type,
        scope: newTokens.scope
      };
      saveTokens(updatedTokens);
      return updatedTokens.access_token;
    } catch (error) {
      console.error('Erro ao atualizar token:', error.message);
      throw new Error('AUTH_REQUIRED');
    }
  }

  throw new Error('AUTH_REQUIRED');
}

/**
 * Gera URL de autorização OAuth
 * @param {string} clientId - Client ID da aplicação
 * @param {string} redirectUri - URI de redirecionamento
 * @param {string} scope - Escopos solicitados (separados por espaço)
 * @returns {string} URL de autorização
 */
function getAuthorizationUrl(clientId, redirectUri, scope = 'chat:read chat:edit') {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scope
  });

  return `${TWITCH_OAUTH_URL}/authorize?${params.toString()}`;
}

module.exports = {
  loadTokens,
  saveTokens,
  exchangeCodeForTokens,
  refreshAccessToken,
  validateToken,
  getUserInfo,
  getValidAccessToken,
  getAccessTokenForHelix,
  getAuthorizationUrl
};
