/**
 * Sistema de rastreamento de usuários online no chat
 */

class UsersTracker {
  constructor() {
    this.onlineUsers = new Map(); // username -> { joinedAt, lastSeen, messageCount }
    this.maxInactiveTime = 5 * 60 * 1000; // 5 minutos de inatividade
  }

  /**
   * Adiciona ou atualiza usuário online
   */
  addUser(username) {
    const now = Date.now();
    const user = this.onlineUsers.get(username.toLowerCase());
    
    if (user) {
      user.lastSeen = now;
      user.messageCount = (user.messageCount || 0) + 1;
    } else {
      this.onlineUsers.set(username.toLowerCase(), {
        username: username,
        joinedAt: now,
        lastSeen: now,
        messageCount: 1
      });
    }
  }

  /**
   * Remove usuário (saiu do chat)
   */
  removeUser(username) {
    this.onlineUsers.delete(username.toLowerCase());
  }

  /**
   * Marca usuário como visto (enviou mensagem)
   */
  seenUser(username) {
    this.addUser(username);
  }

  /**
   * Limpa usuários inativos
   */
  cleanInactive() {
    const now = Date.now();
    for (const [username, user] of this.onlineUsers.entries()) {
      if (now - user.lastSeen > this.maxInactiveTime) {
        this.onlineUsers.delete(username);
      }
    }
  }

  /**
   * Obtém lista de usuários online
   */
  getOnlineUsers() {
    this.cleanInactive();
    return Array.from(this.onlineUsers.values())
      .sort((a, b) => b.messageCount - a.messageCount); // Ordena por atividade
  }

  /**
   * Obtém contagem de usuários online
   */
  getCount() {
    this.cleanInactive();
    return this.onlineUsers.size;
  }

  /**
   * Obtém estatísticas de um usuário específico
   */
  getUserStats(username) {
    return this.onlineUsers.get(username.toLowerCase());
  }
}

module.exports = { UsersTracker };
