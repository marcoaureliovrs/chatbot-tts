/**
 * Sistema de estatísticas e analytics
 */

class StatsManager {
  constructor() {
    this.stats = {
      totalMessages: 0,
      totalUsers: new Set(),
      messagesByUser: new Map(),
      messagesByHour: new Map(),
      messagesByDay: new Map(),
      startTime: new Date().toISOString()
    };
  }

  /**
   * Registra uma mensagem
   */
  recordMessage(username, message) {
    this.stats.totalMessages++;
    this.stats.totalUsers.add(username);

    // Por usuário
    const userCount = this.stats.messagesByUser.get(username) || 0;
    this.stats.messagesByUser.set(username, userCount + 1);

    // Por hora
    const hour = new Date().getHours();
    const hourCount = this.stats.messagesByHour.get(hour) || 0;
    this.stats.messagesByHour.set(hour, hourCount + 1);

    // Por dia
    const day = new Date().toISOString().split('T')[0];
    const dayCount = this.stats.messagesByDay.get(day) || 0;
    this.stats.messagesByDay.set(day, dayCount + 1);
  }

  /**
   * Obtém estatísticas gerais
   */
  getStats() {
    return {
      totalMessages: this.stats.totalMessages,
      totalUsers: this.stats.totalUsers.size,
      uptime: this.getUptime(),
      topUsers: this.getTopUsers(10),
      messagesByHour: this.getMessagesByHour(),
      messagesByDay: this.getMessagesByDay()
    };
  }

  /**
   * Obtém top usuários
   */
  getTopUsers(limit = 10) {
    const users = Array.from(this.stats.messagesByUser.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([username, count]) => ({ username, count }));

    return users;
  }

  /**
   * Obtém mensagens por hora
   */
  getMessagesByHour() {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push({
        hour: i,
        count: this.stats.messagesByHour.get(i) || 0
      });
    }
    return hours;
  }

  /**
   * Obtém mensagens por dia
   */
  getMessagesByDay() {
    return Array.from(this.stats.messagesByDay.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => a.day.localeCompare(b.day));
  }

  /**
   * Calcula uptime
   */
  getUptime() {
    const start = new Date(this.stats.startTime);
    const now = new Date();
    const diff = now - start;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  }

  /**
   * Exporta dados para JSON
   */
  exportJSON() {
    return JSON.stringify(this.getStats(), null, 2);
  }

  /**
   * Exporta dados para CSV
   */
  exportCSV() {
    const stats = this.getStats();
    let csv = 'Tipo,Dados\n';
    csv += `Total de Mensagens,${stats.totalMessages}\n`;
    csv += `Total de Usuários,${stats.totalUsers}\n`;
    csv += `Uptime,${stats.uptime.days}d ${stats.uptime.hours}h ${stats.uptime.minutes}m\n\n`;
    
    csv += 'Top Usuários\n';
    csv += 'Usuário,Mensagens\n';
    stats.topUsers.forEach(user => {
      csv += `${user.username},${user.count}\n`;
    });

    csv += '\nMensagens por Hora\n';
    csv += 'Hora,Quantidade\n';
    stats.messagesByHour.forEach(hour => {
      csv += `${hour.hour}:00,${hour.count}\n`;
    });

    return csv;
  }

  /**
   * Reseta estatísticas
   */
  reset() {
    this.stats = {
      totalMessages: 0,
      totalUsers: new Set(),
      messagesByUser: new Map(),
      messagesByHour: new Map(),
      messagesByDay: new Map(),
      startTime: new Date().toISOString()
    };
  }
}

module.exports = { StatsManager };
