/**
 * Sistema de eventos da Twitch
 */

class TwitchEvents {
  constructor(serverUrl, addToQueue) {
    this.serverUrl = serverUrl;
    this.addToQueue = addToQueue;
    this.enabled = {
      followers: process.env.TTS_EVENT_FOLLOWERS === 'true',
      subs: process.env.TTS_EVENT_SUBS === 'true',
      raids: process.env.TTS_EVENT_RAIDS === 'true',
      bits: process.env.TTS_EVENT_BITS === 'true'
    };
  }

  /**
   * Processa evento de novo seguidor
   */
  onFollower(username) {
    if (!this.enabled.followers) return;
    
    const message = `Novo seguidor: ${username}`;
    this.addToQueue({
      text: message,
      username: 'system',
      priority: 1,
      timestamp: new Date().toISOString()
    });
    console.log(`👥 Novo seguidor: ${username}`);
  }

  /**
   * Processa evento de nova sub
   */
  onSubscription(username, months = 1, message = '') {
    if (!this.enabled.subs) return;
    
    let subMessage = `Novo sub: ${username}`;
    if (months > 1) {
      subMessage += ` (${months} meses)`;
    }
    if (message) {
      subMessage += ` - ${message}`;
    }
    
    this.addToQueue({
      text: subMessage,
      username: 'system',
      priority: 2, // Alta prioridade para subs
      timestamp: new Date().toISOString()
    });
    console.log(`⭐ Nova sub: ${username}`);
  }

  /**
   * Processa evento de raid
   */
  onRaid(raider, viewers) {
    if (!this.enabled.raids) return;
    
    const message = `Raid de ${raider} com ${viewers} pessoas`;
    this.addToQueue({
      text: message,
      username: 'system',
      priority: 2, // Alta prioridade para raids
      timestamp: new Date().toISOString()
    });
    console.log(`🎯 Raid: ${raider} com ${viewers} viewers`);
  }

  /**
   * Processa evento de bits
   */
  onBits(username, amount, message = '') {
    if (!this.enabled.bits) return;
    
    let bitsMessage = `${username} doou ${amount} bits`;
    if (message) {
      bitsMessage += ` - ${message}`;
    }
    
    this.addToQueue({
      text: bitsMessage,
      username: 'system',
      priority: 1,
      timestamp: new Date().toISOString()
    });
    console.log(`💰 Bits: ${username} doou ${amount}`);
  }
}

module.exports = { TwitchEvents };
