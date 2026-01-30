// Sistema de controles TTS
class TTSControls {
    constructor() {
        this.state = {
            paused: false,
            volume: 100,
            queueSize: 0
        };
        this.init();
    }

    init() {
        // Controles
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('skip-btn').addEventListener('click', () => this.skip());
        document.getElementById('clear-btn').addEventListener('click', () => this.clear());
        document.getElementById('volume-slider').addEventListener('input', (e) => this.setVolume(e.target.value));

        // Configurações
        document.getElementById('theme-select').addEventListener('change', (e) => this.setTheme(e.target.value));
        document.getElementById('font-size-slider').addEventListener('input', (e) => this.setFontSize(e.target.value));
        document.getElementById('compact-mode').addEventListener('change', (e) => this.setCompactMode(e.target.checked));

        // Export
        document.getElementById('export-json-btn').addEventListener('click', () => this.exportStats('json'));
        document.getElementById('export-csv-btn').addEventListener('click', () => this.exportStats('csv'));

        // Carrega configurações salvas
        this.loadSettings();

        // Atualiza estado periodicamente
        setInterval(() => this.updateState(), 1000);
        this.updateState();
        this.loadMessages();
        setInterval(() => this.loadMessages(), 2000);
        this.loadStats();
        setInterval(() => this.loadStats(), 5000);
        this.loadOnlineUsers();
        setInterval(() => this.loadOnlineUsers(), 5000);
    }

    async togglePause() {
        const action = this.state.paused ? 'resume' : 'pause';
        await this.sendControl(action);
        this.state.paused = !this.state.paused;
        this.updateUI();
    }

    async skip() {
        await this.sendControl('skip');
    }

    async clear() {
        await this.sendControl('clear');
    }

    async setVolume(value) {
        this.state.volume = value;
        document.getElementById('volume-value').textContent = value;
        await this.sendControl('volume', value);
    }

    async sendControl(action, value) {
        try {
            const response = await fetch('/api/tts/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, value })
            });
            const data = await response.json();
            if (data.success) {
                this.state = { ...this.state, ...data.state };
                this.updateUI();
            }
        } catch (error) {
            console.error('Erro ao enviar comando:', error);
        }
    }

    async updateState() {
        try {
            const response = await fetch('/api/tts/state');
            const data = await response.json();
            this.state = {
                paused: data.paused,
                volume: data.volume,
                queueSize: data.queueSize
            };
            this.updateUI();
        } catch (error) {
            console.error('Erro ao atualizar estado:', error);
        }
    }

    updateUI() {
        document.getElementById('pause-btn').textContent = this.state.paused ? '▶️ Retomar' : '⏸️ Pausar';
        document.getElementById('queue-size').textContent = this.state.queueSize;
        document.getElementById('tts-status').textContent = this.state.paused ? 'Pausado' : 'Ligado';
        document.getElementById('volume-slider').value = this.state.volume;
        document.getElementById('volume-value').textContent = this.state.volume;
    }

    async loadMessages() {
        try {
            const response = await fetch('/api/messages');
            const data = await response.json();
            const container = document.getElementById('messages-container');
            
            if (!data.messages || data.messages.length === 0) {
                container.innerHTML = '<div class="no-messages">Aguardando mensagens...</div>';
                return;
            }

            container.innerHTML = data.messages.map(msg => {
                const time = new Date(msg.timestamp).toLocaleTimeString('pt-BR');
                return `
                    <div class="message-item">
                        <div>
                            <span class="message-username">@${msg.username}:</span>
                            <span class="message-text">${this.escapeHtml(msg.message)}</span>
                        </div>
                        <div class="message-time">${time}</div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
        }
    }

    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();
            
            document.getElementById('stat-total').textContent = data.totalMessages || 0;
            document.getElementById('stat-users').textContent = data.totalUsers || 0;
            const uptime = data.uptime || { hours: 0, minutes: 0 };
            document.getElementById('stat-uptime').textContent = `${uptime.hours}h ${uptime.minutes}m`;
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }

    async exportStats(format) {
        try {
            const response = await fetch(`/api/stats/export?format=${format}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `stats.${format}`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao exportar:', error);
        }
    }

    setTheme(theme) {
        document.body.className = `theme-${theme}`;
        this.saveSetting('theme', theme);
    }

    setFontSize(size) {
        document.body.style.fontSize = size + 'px';
        document.getElementById('font-size-value').textContent = size + 'px';
        this.saveSetting('fontSize', size);
    }

    setCompactMode(enabled) {
        if (enabled) {
            document.body.classList.add('compact-mode');
        } else {
            document.body.classList.remove('compact-mode');
        }
        this.saveSetting('compactMode', enabled);
    }

    saveSetting(key, value) {
        localStorage.setItem(`tts_${key}`, value);
    }

    async loadOnlineUsers() {
        try {
            const response = await fetch('/api/users/online');
            const data = await response.json();
            
            document.getElementById('users-count').textContent = data.count || 0;
            const container = document.getElementById('users-list');
            
            if (!data.users || data.users.length === 0) {
                container.innerHTML = '<div class="no-users">Nenhum usuário online</div>';
                return;
            }

            container.innerHTML = data.users.map(user => {
                const onlineTime = Math.floor(user.onlineTime / 1000 / 60); // minutos
                const hours = Math.floor(onlineTime / 60);
                const minutes = onlineTime % 60;
                const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                
                return `
                    <div class="user-item">
                        <div>
                            <div class="user-name">${this.escapeHtml(user.username)}</div>
                            <div class="user-stats">${user.messageCount} msgs • ${timeStr} online</div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        }
    }

    loadSettings() {
        const theme = localStorage.getItem('tts_theme') || 'dark';
        const fontSize = localStorage.getItem('tts_fontSize') || '12';
        const compactMode = localStorage.getItem('tts_compactMode') === 'true';

        this.setTheme(theme);
        this.setFontSize(fontSize);
        this.setCompactMode(compactMode);

        document.getElementById('theme-select').value = theme;
        document.getElementById('font-size-slider').value = fontSize;
        document.getElementById('compact-mode').checked = compactMode;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializa quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new TTSControls();
});
