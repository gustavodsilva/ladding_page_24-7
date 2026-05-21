/* ============================================
   LOUVOR 24/7 - API MODULE
   Supabase Integration
   ============================================ */

// Supabase Configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase Client
let supabase = null;

try {
    // Load Supabase from CDN if not available
    if (typeof supabase === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        script.onload = () => {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase initialized');
        };
        document.head.appendChild(script);
    }
} catch (error) {
    console.error('Error initializing Supabase:', error);
}

// API Module
const ApiModule = {
    // Music CRUD Operations
    async getMusic() {
        try {
            if (!supabase) return [];
            
            const { data, error } = await supabase
                .from('musicas')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching music:', error);
            return [];
        }
    },

    async getMusicById(id) {
        try {
            if (!supabase) return null;
            
            const { data, error } = await supabase
                .from('musicas')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching music by ID:', error);
            return null;
        }
    },

    async createMusic(musicData) {
        try {
            if (!supabase) return null;
            
            const { data, error } = await supabase
                .from('musicas')
                .insert([{
                    nome: musicData.nome,
                    cantor: musicData.cantor,
                    link: musicData.link,
                    tonalidade: musicData.tonalidade,
                    categoria: musicData.categoria,
                    observacoes: musicData.observacoes
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            // Send WhatsApp notification
            if (window.WhatsappModule) {
                await WhatsappModule.sendNewMusicNotification(data);
            }
            
            return data;
        } catch (error) {
            console.error('Error creating music:', error);
            throw error;
        }
    },

    async updateMusic(id, musicData) {
        try {
            if (!supabase) return null;
            
            const { data, error } = await supabase
                .from('musicas')
                .update({
                    nome: musicData.nome,
                    cantor: musicData.cantor,
                    link: musicData.link,
                    tonalidade: musicData.tonalidade,
                    categoria: musicData.categoria,
                    observacoes: musicData.observacoes
                })
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating music:', error);
            throw error;
        }
    },

    async deleteMusic(id) {
        try {
            if (!supabase) return null;
            
            const { error } = await supabase
                .from('musicas')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting music:', error);
            throw error;
        }
    },

    // News CRUD Operations
    async getNews() {
        try {
            if (!supabase) return [];
            
            const { data, error } = await supabase
                .from('noticias')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching news:', error);
            return [];
        }
    },

    async getNewsById(id) {
        try {
            if (!supabase) return null;
            
            const { data, error } = await supabase
                .from('noticias')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching news by ID:', error);
            return null;
        }
    },

    async createNews(newsData) {
        try {
            if (!supabase) return null;
            
            const { data, error } = await supabase
                .from('noticias')
                .insert([{
                    titulo: newsData.titulo,
                    conteudo: newsData.conteudo,
                    imagem: newsData.imagem
                }])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating news:', error);
            throw error;
        }
    },

    async updateNews(id, newsData) {
        try {
            if (!supabase) return null;
            
            const { data, error } = await supabase
                .from('noticias')
                .update({
                    titulo: newsData.titulo,
                    conteudo: newsData.conteudo,
                    imagem: newsData.imagem
                })
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating news:', error);
            throw error;
        }
    },

    async deleteNews(id) {
        try {
            if (!supabase) return null;
            
            const { error } = await supabase
                .from('noticias')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting news:', error);
            throw error;
        }
    },

    // Configuration Operations
    async getConfig() {
        try {
            if (!supabase) return {};
            
            const { data, error } = await supabase
                .from('configuracoes')
                .select('*')
                .single();
            
            if (error) throw error;
            return data || {};
        } catch (error) {
            console.error('Error fetching config:', error);
            return {};
        }
    },

    async updateConfig(configData) {
        try {
            if (!supabase) return null;
            
            const { data, error } = await supabase
                .from('configuracoes')
                .upsert(configData)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating config:', error);
            throw error;
        }
    },

    // Statistics
    async getStats() {
        try {
            if (!supabase) return { musicas: 0, noticias: 0, acessos: 0 };
            
            const [musicCount, newsCount] = await Promise.all([
                supabase.from('musicas').select('*', { count: 'exact', head: true }),
                supabase.from('noticias').select('*', { count: 'exact', head: true })
            ]);

            return {
                musicas: musicCount.count || 0,
                noticias: newsCount.count || 0,
                acessos: 0 // Implement access tracking if needed
            };
        } catch (error) {
            console.error('Error fetching stats:', error);
            return { musicas: 0, noticias: 0, acessos: 0 };
        }
    }
};

// Export for global access
window.ApiModule = ApiModule;
