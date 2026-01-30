/**
 * Gera URL do Google Translate TTS
 * @param {string} text - Texto para converter em fala
 * @param {string} language - Idioma (padrão: pt-BR)
 * @returns {string} URL do áudio TTS
 */
function generateTTSUrl(text, language = 'pt-BR') {
  if (!text || typeof text !== 'string') {
    throw new Error('Texto inválido');
  }

  // Remove caracteres especiais e limita tamanho
  const cleanText = text.trim().substring(0, 200);
  
  if (cleanText.length === 0) {
    throw new Error('Texto vazio');
  }

  // Codifica o texto para URL
  const encodedText = encodeURIComponent(cleanText);

  // Monta a URL do Google Translate TTS
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=tw-ob&q=${encodedText}`;

  return ttsUrl;
}

/**
 * Valida o texto antes de gerar TTS
 * @param {string} text - Texto para validar
 * @param {number} maxLength - Tamanho máximo permitido
 * @returns {boolean} True se válido
 */
function validateText(text, maxLength = 200) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const cleanText = text.trim();
  
  if (cleanText.length === 0) {
    return false;
  }

  if (cleanText.length > maxLength) {
    return false;
  }

  return true;
}

module.exports = {
  generateTTSUrl,
  validateText
};

