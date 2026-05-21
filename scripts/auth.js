/* ============================================
   LOUVOR 24/7 - AUTH MODULE
   Supabase Authentication
   ============================================ */

// Auth Module
const AuthModule = {
    currentUser: null,

    async init() {
        // Check for existing session
        if (typeof supabase !== 'undefined') {
            const { data: { session } } = await supabase.auth.getSession();
            this.currentUser = session?.user || null;
            
            // Listen for auth changes
            supabase.auth.onAuthStateChange((event, session) => {
                this.currentUser = session?.user || null;
                this.handleAuthChange(event, session);
            });
        }
    },

    async signIn(email, password) {
        try {
            if (!supabase) {
                console.error('Supabase not initialized');
                return { error: 'Supabase not initialized' };
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Check if user is admin
            const isAdmin = await this.checkAdminRole(data.user.id);
            
            if (!isAdmin) {
                await this.signOut();
                return { error: 'Acesso não autorizado' };
            }

            return { data, error: null };
        } catch (error) {
            console.error('Error signing in:', error);
            return { error: error.message };
        }
    },

    async signOut() {
        try {
            if (!supabase) return;

            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            this.currentUser = null;
            this.handleAuthChange('SIGNED_OUT', null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    },

    async checkAdminRole(userId) {
        try {
            if (!supabase) return false;

            const { data, error } = await supabase
                .from('admins')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // If admins table doesn't exist yet, allow for development
                return true;
            }

            return !!data;
        } catch (error) {
            console.error('Error checking admin role:', error);
            return false;
        }
    },

    handleAuthChange(event, session) {
        const loginForm = document.getElementById('admin-login');
        const dashboard = document.getElementById('admin-dashboard');

        if (session && this.currentUser) {
            // User is signed in
            if (loginForm) loginForm.classList.add('hidden');
            if (dashboard) {
                dashboard.classList.remove('hidden');
                this.loadDashboardData();
            }
        } else {
            // User is signed out
            if (loginForm) loginForm.classList.remove('hidden');
            if (dashboard) dashboard.classList.add('hidden');
        }
    },

    async loadDashboardData() {
        try {
            if (window.ApiModule) {
                const stats = await ApiModule.getStats();
                
                document.getElementById('total-musicas').textContent = stats.musicas;
                document.getElementById('total-noticias').textContent = stats.noticias;
                document.getElementById('total-acessos').textContent = stats.acessos;
                document.getElementById('ultima-atualizacao').textContent = new Date().toLocaleDateString('pt-BR');

                // Load admin tables
                await this.loadAdminMusicTable();
                await this.loadAdminNewsTable();
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    },

    async loadAdminMusicTable() {
        try {
            const musicList = await ApiModule.getMusic();
            const tbody = document.getElementById('admin-musicas-body');
            
            if (tbody) {
                tbody.innerHTML = musicList.map(music => `
                    <tr>
                        <td>${music.nome}</td>
                        <td>${music.cantor}</td>
                        <td>${music.categoria}</td>
                        <td>
                            <button class="btn btn-ghost btn-sm" onclick="window.editMusic('${music.id}')">Editar</button>
                            <button class="btn btn-ghost btn-sm" onclick="window.deleteMusic('${music.id}')">Excluir</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading admin music table:', error);
        }
    },

    async loadAdminNewsTable() {
        try {
            const newsList = await ApiModule.getNews();
            const tbody = document.getElementById('admin-noticias-body');
            
            if (tbody) {
                tbody.innerHTML = newsList.map(news => `
                    <tr>
                        <td>${news.titulo}</td>
                        <td>${new Date(news.created_at).toLocaleDateString('pt-BR')}</td>
                        <td>
                            <button class="btn btn-ghost btn-sm" onclick="window.editNews('${news.id}')">Editar</button>
                            <button class="btn btn-ghost btn-sm" onclick="window.deleteNews('${news.id}')">Excluir</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading admin news table:', error);
        }
    }
};

// Initialize auth module
document.addEventListener('DOMContentLoaded', () => {
    AuthModule.init();
});

// Login form handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const { error } = await AuthModule.signIn(email, password);
            
            if (error) {
                alert('Erro ao fazer login: ' + error);
            } else {
                console.log('Login successful');
            }
        });
    }
});

// Export for global access
window.AuthModule = AuthModule;

// Global functions for admin table actions
window.editNews = function(id) {
    // Implement edit news functionality
    console.log('Edit news:', id);
};

window.deleteNews = function(id) {
    if (confirm('Tem certeza que deseja excluir esta notícia?')) {
        // Delete via API
        if (window.ApiModule) {
            ApiModule.deleteNews(id).then(() => {
                AuthModule.loadAdminNewsTable();
            });
        }
    }
};
