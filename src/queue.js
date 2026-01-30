/**
 * Sistema de fila de mensagens TTS
 */

class TTSQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.isPaused = false;
    this.currentMessage = null;
  }

  /**
   * Adiciona mensagem à fila
   * @param {object} message - Objeto da mensagem
   * @param {number} priority - Prioridade (0 = normal, 1 = alta, 2 = máxima)
   */
  add(message, priority = 0) {
    const queueItem = {
      ...message,
      priority,
      id: Date.now() + Math.random(),
      addedAt: new Date().toISOString()
    };

    if (priority > 0) {
      // Insere no início se for prioridade alta
      this.queue.unshift(queueItem);
    } else {
      this.queue.push(queueItem);
    }

    // Ordena por prioridade (maior primeiro)
    this.queue.sort((a, b) => b.priority - a.priority);

    return queueItem.id;
  }

  /**
   * Remove e retorna próxima mensagem da fila
   */
  getNext() {
    if (this.queue.length === 0) {
      return null;
    }
    return this.queue.shift();
  }

  /**
   * Limpa a fila
   */
  clear() {
    this.queue = [];
    this.currentMessage = null;
  }

  /**
   * Pula mensagem atual
   */
  skip() {
    this.currentMessage = null;
  }

  /**
   * Retorna tamanho da fila
   */
  size() {
    return this.queue.length;
  }

  /**
   * Retorna todas as mensagens na fila
   */
  getAll() {
    return [...this.queue];
  }

  /**
   * Remove mensagem específica da fila
   */
  remove(id) {
    this.queue = this.queue.filter(item => item.id !== id);
  }
}

module.exports = { TTSQueue };
