/* ============================================
   LOUVOR 24/7 - WHATSAPP MODULE
   Z-API / Twilio Integration
   ============================================ */

// WhatsApp Module
const WhatsappModule = {
    provider: null, // 'zapi' or 'twilio'
    config: {
        apiKey: null,
        groupId: null,
        instanceId: null
    },

    init() {
        this.loadConfig();
    },

    loadConfig() {
        // Load configuration from environment variables or Supabase
        this.config.apiKey = import.meta.env.VITE_WHATSAPP_API_KEY || '';
        this.config.groupId = import.meta.env.VITE_WHATSAPP_GROUP_ID || '';
        this.config.instanceId = import.meta.env.VITE_WHATSAPP_INSTANCE_ID || '';
        this.provider = import.meta.env.VITE_WHATSAPP_PROVIDER || 'zapi';
    },

    async sendNewMusicNotification(music) {
        if (!this.config.apiKey || !this.config.groupId) {
            console.log('WhatsApp not configured - skipping notification');
            return;
        }

        const message = this.formatMusicMessage(music);

        try {
            if (this.provider === 'zapi') {
                await this.sendViaZApi(message);
            } else if (this.provider === 'twilio') {
                await this.sendViaTwilio(message);
            }
        } catch (error) {
            console.error('Error sending WhatsApp notification:', error);
        }
    },

    formatMusicMessage(music) {
        return `🎶 Nova música adicionada ao repertório!

*${music.nome}*

Cantor: ${music.cantor}
Tonalidade: ${music.tonalidade || 'N/A'}
Categoria: ${music.categoria}

Ouça agora: ${music.link}`;
    },

    async sendViaZApi(message) {
        const url = `https://api.z-api.io/instances/${this.config.instanceId}/token/${this.config.apiKey}/send-text`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone: this.config.groupId,
                message: message
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send message via Z-API');
        }

        const data = await response.json();
        console.log('WhatsApp message sent via Z-API:', data);
        return data;
    },

    async sendViaTwilio(message) {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(`${this.config.accountSid}:${this.config.authToken}`)
            },
            body: new URLSearchParams({
                To: `whatsapp:${this.config.groupId}`,
                From: `whatsapp:${this.config.fromNumber}`,
                Body: message
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send message via Twilio');
        }

        const data = await response.json();
        console.log('WhatsApp message sent via Twilio:', data);
        return data;
    },

    async sendCustomMessage(message) {
        if (!this.config.apiKey || !this.config.groupId) {
            console.log('WhatsApp not configured - skipping notification');
            return;
        }

        try {
            if (this.provider === 'zapi') {
                await this.sendViaZApi(message);
            } else if (this.provider === 'twilio') {
                await this.sendViaTwilio(message);
            }
        } catch (error) {
            console.error('Error sending custom WhatsApp message:', error);
        }
    },

    async sendNewsNotification(news) {
        const message = `📰 Nova notícia publicada!

*${news.titulo}*

${news.conteudo.substring(0, 100)}...

Leia mais no site oficial.`;

        await this.sendCustomMessage(message);
    },

    async sendEventNotification(event) {
        const message = `📅 Novo evento agendado!

*${event.titulo}*

Data: ${event.data}
Horário: ${event.horario}

Não perca!`;

        await this.sendCustomMessage(message);
    },

    // Test connection
    async testConnection() {
        if (!this.config.apiKey) {
            return { success: false, message: 'API Key not configured' };
        }

        try {
            const testMessage = '🧪 Teste de conexão - Louvor 24/7';
            await this.sendCustomMessage(testMessage);
            return { success: true, message: 'Connection successful' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

// Initialize WhatsApp module
document.addEventListener('DOMContentLoaded', () => {
    WhatsappModule.init();
});

// Export for global access
window.WhatsappModule = WhatsappModule;
