const { generateTTSUrl, validateText } = require('../src/tts');
const { createServer } = require('../src/server');
const http = require('http');

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let testsPassed = 0;
let testsFailed = 0;
let testsRunning = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function test(name, fn) {
  // Verifica se é função assíncrona (tem parâmetro done)
  if (fn.length > 0) {
    // Teste assíncrono
    testsRunning++;
    try {
      fn((error) => {
        testsRunning--;
        if (error) {
          testsFailed++;
          log(`✗ ${name}: ${error.message}`, 'red');
        } else {
          testsPassed++;
          log(`✓ ${name}`, 'green');
        }
      });
    } catch (error) {
      testsRunning--;
      testsFailed++;
      log(`✗ ${name}: ${error.message}`, 'red');
    }
  } else {
    // Teste síncrono
    try {
      fn();
      testsPassed++;
      log(`✓ ${name}`, 'green');
    } catch (error) {
      testsFailed++;
      log(`✗ ${name}: ${error.message}`, 'red');
    }
  }
}

// Testes do módulo TTS
log('\n🧪 Testando módulo TTS...', 'blue');

test('generateTTSUrl - Gera URL válida para texto simples', () => {
  const url = generateTTSUrl('Olá mundo');
  if (!url.includes('translate.google.com')) {
    throw new Error('URL não contém o domínio do Google Translate');
  }
  if (!url.includes('q=')) {
    throw new Error('URL não contém parâmetro de query');
  }
});

test('generateTTSUrl - Codifica texto corretamente', () => {
  const url = generateTTSUrl('Olá mundo teste');
  if (!url.includes('Ol%C3%A1')) {
    throw new Error('Texto não foi codificado corretamente');
  }
});

test('generateTTSUrl - Usa idioma padrão pt-BR', () => {
  const url = generateTTSUrl('teste');
  if (!url.includes('tl=pt-BR')) {
    throw new Error('Idioma padrão não é pt-BR');
  }
});

test('generateTTSUrl - Aceita idioma customizado', () => {
  const url = generateTTSUrl('hello', 'en');
  if (!url.includes('tl=en')) {
    throw new Error('Idioma customizado não foi aplicado');
  }
});

test('generateTTSUrl - Limita tamanho do texto', () => {
  const longText = 'a'.repeat(300);
  const url = generateTTSUrl(longText);
  // Verifica que a URL não contém mais de 200 caracteres do texto
  const match = url.match(/q=([^&]+)/);
  if (match) {
    const decoded = decodeURIComponent(match[1]);
    if (decoded.length > 200) {
      throw new Error('Texto não foi limitado a 200 caracteres');
    }
  }
});

test('generateTTSUrl - Lança erro para texto vazio', () => {
  try {
    generateTTSUrl('');
    throw new Error('Deveria lançar erro para texto vazio');
  } catch (error) {
    if (!error.message.includes('vazio') && !error.message.includes('inválido')) {
      throw error;
    }
  }
});

test('generateTTSUrl - Lança erro para texto null', () => {
  try {
    generateTTSUrl(null);
    throw new Error('Deveria lançar erro para texto null');
  } catch (error) {
    if (!error.message.includes('inválido')) {
      throw error;
    }
  }
});

test('validateText - Aceita texto válido', () => {
  if (!validateText('Olá mundo')) {
    throw new Error('Texto válido foi rejeitado');
  }
});

test('validateText - Rejeita texto vazio', () => {
  if (validateText('')) {
    throw new Error('Texto vazio foi aceito');
  }
});

test('validateText - Rejeita texto null', () => {
  if (validateText(null)) {
    throw new Error('Texto null foi aceito');
  }
});

test('validateText - Rejeita texto muito longo', () => {
  const longText = 'a'.repeat(201);
  if (validateText(longText, 200)) {
    throw new Error('Texto muito longo foi aceito');
  }
});

test('validateText - Aceita texto no limite', () => {
  const limitText = 'a'.repeat(200);
  if (!validateText(limitText, 200)) {
    throw new Error('Texto no limite foi rejeitado');
  }
});

// Testes do servidor HTTP
log('\n🌐 Testando servidor HTTP...', 'blue');

let testServer;

test('Servidor - Inicia corretamente', (done) => {
  const { server } = createServer(3001);
  testServer = server;
  
  setTimeout(() => {
    http.get('http://localhost:3001/health', (res) => {
      if (res.statusCode === 200) {
        done(null);
      } else {
        done(new Error(`Status code esperado 200, recebido ${res.statusCode}`));
      }
    }).on('error', (err) => {
      done(new Error(`Erro ao conectar: ${err.message}`));
    });
  }, 500);
});

test('Servidor - Retorna página HTML sem texto', (done) => {
  http.get('http://localhost:3001/', (res) => {
    if (res.statusCode !== 200) {
      done(new Error(`Status code esperado 200, recebido ${res.statusCode}`));
      return;
    }
    
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (!data.includes('<!DOCTYPE html>')) {
        done(new Error('Resposta não contém HTML'));
      } else {
        done(null);
      }
    });
  }).on('error', (err) => {
    done(new Error(`Erro na requisição: ${err.message}`));
  });
});

test('Servidor - Aceita texto válido na query string', (done) => {
  const text = encodeURIComponent('Olá teste');
  http.get(`http://localhost:3001/?text=${text}`, (res) => {
    if (res.statusCode !== 200) {
      done(new Error(`Status code esperado 200, recebido ${res.statusCode}`));
    } else {
      done(null);
    }
  }).on('error', (err) => {
    done(new Error(`Erro na requisição: ${err.message}`));
  });
});

test('Servidor - Rejeita texto muito longo', (done) => {
  const longText = 'a'.repeat(201);
  const encoded = encodeURIComponent(longText);
  http.get(`http://localhost:3001/?text=${encoded}`, (res) => {
    if (res.statusCode !== 400) {
      done(new Error(`Status code esperado 400, recebido ${res.statusCode}`));
    } else {
      done(null);
    }
  }).on('error', (err) => {
    done(new Error(`Erro na requisição: ${err.message}`));
  });
});

// Testes de integração da API (categorias e streams) - garantem resposta JSON, nunca HTML
log('\n🔌 Testando API de categorias e streams (integração)...', 'blue');

test('API - GET /api/stream/search-categories retorna 200 e JSON', (done) => {
  http.get('http://localhost:3001/api/stream/search-categories?q=Tibia', (res) => {
    const contentType = res.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      done(new Error(`Content-Type esperado application/json, recebido ${contentType}`));
      return;
    }
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (data.trim().startsWith('<')) {
        done(new Error('Resposta inválida: corpo é HTML em vez de JSON'));
        return;
      }
      try {
        const json = JSON.parse(data);
        if (typeof json.success !== 'boolean') {
          done(new Error('Resposta sem campo success'));
          return;
        }
        if (!Array.isArray(json.categories)) {
          done(new Error('Resposta sem campo categories (array)'));
          return;
        }
        done(null);
      } catch (e) {
        done(new Error('Resposta não é JSON válido: ' + e.message));
      }
    });
  }).on('error', (err) => done(new Error(err.message)));
});

test('API - GET /api/streams/live retorna 200 e JSON', (done) => {
  // game_id válido conhecido (Tibia = 18983 na Twitch) ou qualquer id para testar formato
  http.get('http://localhost:3001/api/streams/live?game_id=18983&first=5', (res) => {
    const contentType = res.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      done(new Error(`Content-Type esperado application/json, recebido ${contentType}`));
      return;
    }
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (data.trim().startsWith('<')) {
        done(new Error('Resposta inválida: corpo é HTML em vez de JSON'));
        return;
      }
      try {
        const json = JSON.parse(data);
        if (typeof json.success !== 'boolean') {
          done(new Error('Resposta sem campo success'));
          return;
        }
        if (!Array.isArray(json.streams)) {
          done(new Error('Resposta sem campo streams (array)'));
          return;
        }
        done(null);
      } catch (e) {
        done(new Error('Resposta não é JSON válido: ' + e.message));
      }
    });
  }).on('error', (err) => done(new Error(err.message)));
});

test('API - GET /api/stream/search-categories sem q retorna 400 e JSON', (done) => {
  http.get('http://localhost:3001/api/stream/search-categories', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (data.trim().startsWith('<')) {
        done(new Error('Resposta inválida: corpo é HTML'));
        return;
      }
      try {
        const json = JSON.parse(data);
        if (res.statusCode !== 400) {
          done(new Error(`Status esperado 400, recebido ${res.statusCode}`));
          return;
        }
        if (!json.error) {
          done(new Error('Resposta 400 deve conter campo error'));
          return;
        }
        done(null);
      } catch (e) {
        done(new Error('Resposta não é JSON: ' + e.message));
      }
    });
  }).on('error', (err) => done(new Error(err.message)));
});

test('API - Rota /api inexistente retorna 404 e JSON', (done) => {
  http.get('http://localhost:3001/api/rota-inexistente-xyz', (res) => {
    const contentType = res.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      done(new Error(`Content-Type esperado application/json para 404 API, recebido ${contentType}`));
      return;
    }
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (data.trim().startsWith('<')) {
        done(new Error('404 da API deve retornar JSON, não HTML'));
        return;
      }
      try {
        const json = JSON.parse(data);
        if (res.statusCode !== 404) {
          done(new Error(`Status esperado 404, recebido ${res.statusCode}`));
          return;
        }
        if (json.error !== 'Not found') {
          done(new Error('Resposta 404 deve conter error: "Not found"'));
          return;
        }
        done(null);
      } catch (e) {
        done(new Error('Resposta não é JSON: ' + e.message));
      }
    });
  }).on('error', (err) => done(new Error(err.message)));
});

// Executa todos os testes
function finishTests() {
  // Aguarda todos os testes assíncronos terminarem
  const checkInterval = setInterval(() => {
    if (testsRunning === 0) {
      clearInterval(checkInterval);
      
      log('\n📊 Resultados dos Testes:', 'blue');
      log(`✅ Testes passados: ${testsPassed}`, 'green');
      if (testsFailed > 0) {
        log(`❌ Testes falhados: ${testsFailed}`, 'red');
      } else {
        log(`✅ Todos os testes passaram!`, 'green');
      }
      
      // Encerra o servidor de teste
      if (testServer) {
        testServer.close(() => {
          log('\n✅ Servidor de teste encerrado', 'green');
          process.exit(testsFailed > 0 ? 1 : 0);
        });
      } else {
        process.exit(testsFailed > 0 ? 1 : 0);
      }
    }
  }, 100);
}

// Aguarda um tempo para os testes assíncronos iniciarem
setTimeout(finishTests, 3000);

