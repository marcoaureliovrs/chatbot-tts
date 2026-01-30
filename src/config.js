/**
 * Sistema de configurações e permissões
 */

class ConfigManager {
  constructor() {
    this.config = {
      // Prioridades
      vipUsers: (process.env.TTS_VIP_USERS || '').split(',').filter(u => u.trim()),
      modUsers: (process.env.TTS_MOD_USERS || '').split(',').filter(u => u.trim()),
      blockedUsers: (process.env.TTS_BLOCKED_USERS || '').split(',').filter(u => u.trim()),
      
      // Cooldowns
      cooldownNormal: parseInt(process.env.TTS_COOLDOWN_SECONDS || '3', 10),
      cooldownVIP: parseInt(process.env.TTS_COOLDOWN_VIP || '1', 10),
      cooldownMod: 0, // Mods não têm cooldown
      cooldownStreamer: 0, // Streamer não tem cooldown
      
      // Filtros
      blacklistWords: (process.env.TTS_BLACKLIST_WORDS || '').split(',').map(w => w.trim().toLowerCase()).filter(w => w),
      maxWordLength: parseInt(process.env.TTS_MAX_WORD_LENGTH || '50', 10),
      filterEmojis: process.env.TTS_FILTER_EMOJIS === 'true',
      spamProtection: process.env.TTS_SPAM_PROTECTION !== 'false',
      
      // TTS
      defaultLanguage: process.env.TTS_LANGUAGE || 'pt-BR',
      defaultSpeed: parseFloat(process.env.TTS_SPEED || '1.0'),
      defaultPitch: parseFloat(process.env.TTS_PITCH || '1.0'),
      maxLength: parseInt(process.env.TTS_MAX_LENGTH || '200', 10),
      
      // Estado
      ttsEnabled: true,
      volume: 100
    };

    // Histórico de mensagens para spam protection
    this.messageHistory = new Map();
    this.spamWindow = 5000; // 5 segundos
  }

  /**
   * Verifica se usuário é VIP
   */
  isVIP(username) {
    return this.config.vipUsers.some(vip => vip.toLowerCase() === username.toLowerCase());
  }

  /**
   * Verifica se usuário é Mod
   */
  isMod(username, tags) {
    return this.config.modUsers.some(mod => mod.toLowerCase() === username.toLowerCase()) || 
           tags.mod === true ||
           tags.badges?.moderator === '1';
  }

  /**
   * Verifica se usuário é Streamer
   */
  isStreamer(username, channel) {
    return username.toLowerCase() === channel.replace('#', '').toLowerCase();
  }

  /**
   * Verifica se usuário é Sub
   */
  isSub(tags) {
    return tags.subscriber === true || tags.badges?.subscriber;
  }

  /**
   * Verifica se usuário está bloqueado
   */
  isBlocked(username) {
    return this.config.blockedUsers.some(blocked => blocked.toLowerCase() === username.toLowerCase());
  }

  /**
   * Obtém cooldown para usuário
   */
  getCooldown(username, tags, channel) {
    if (this.isStreamer(username, channel)) {
      return this.config.cooldownStreamer;
    }
    if (this.isMod(username, tags)) {
      return this.config.cooldownMod;
    }
    if (this.isVIP(username)) {
      return this.config.cooldownVIP;
    }
    return this.config.cooldownNormal;
  }

  /**
   * Obtém prioridade para usuário
   */
  getPriority(username, tags, channel) {
    if (this.isStreamer(username, channel)) {
      return 2; // Máxima
    }
    if (this.isMod(username, tags)) {
      return 2; // Máxima
    }
    if (this.isVIP(username)) {
      return 1; // Alta
    }
    if (this.isSub(tags)) {
      return 1; // Alta
    }
    return 0; // Normal
  }

  /**
   * Verifica se texto contém palavras da blacklist
   */
  hasBlacklistedWords(text) {
    const lowerText = text.toLowerCase();
    return this.config.blacklistWords.some(word => lowerText.includes(word));
  }

  /**
   * Filtra texto
   */
  filterText(text) {
    let filtered = text;

    // Remove emojis se configurado
    if (this.config.filterEmojis) {
      filtered = filtered.replace(/[\u{1F600}-\u{1F64F}]/gu, ''); // Emoticons
      filtered = filtered.replace(/[\u{1F300}-\u{1F5FF}]/gu, ''); // Symbols & Pictographs
      filtered = filtered.replace(/[\u{1F680}-\u{1F6FF}]/gu, ''); // Transport & Map
      filtered = filtered.replace(/[\u{2600}-\u{26FF}]/gu, ''); // Misc symbols
      filtered = filtered.replace(/[\u{2700}-\u{27BF}]/gu, ''); // Dingbats
    }

    // Remove palavras muito longas (URLs)
    const words = filtered.split(' ');
    filtered = words.map(word => {
      if (word.length > this.config.maxWordLength) {
        return word.substring(0, this.config.maxWordLength) + '...';
      }
      return word;
    }).join(' ');

    return filtered.trim();
  }

  /**
   * Verifica spam
   */
  isSpam(username, message) {
    if (!this.config.spamProtection) {
      return false;
    }

    const now = Date.now();
    const userHistory = this.messageHistory.get(username) || [];
    
    // Remove mensagens antigas
    const recentHistory = userHistory.filter(msg => now - msg.timestamp < this.spamWindow);
    
    // Verifica se mensagem é repetida
    const isRepeated = recentHistory.some(msg => msg.message.toLowerCase() === message.toLowerCase());
    
    if (isRepeated) {
      return true;
    }

    // Adiciona à história
    recentHistory.push({ message, timestamp: now });
    this.messageHistory.set(username, recentHistory);

    return false;
  }

  /**
   * Atualiza configuração
   */
  updateConfig(key, value) {
    if (this.config.hasOwnProperty(key)) {
      this.config[key] = value;
      return true;
    }
    return false;
  }

  /**
   * Obtém configuração
   */
  getConfig(key) {
    return this.config[key];
  }

  /**
   * Obtém todas as configurações
   */
  getAllConfig() {
    return { ...this.config };
  }
}

module.exports = { ConfigManager };
