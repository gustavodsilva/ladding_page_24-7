/* ============================================
   LOUVOR 24/7 - ADMIN PAGE SCRIPT
   ============================================ */

// Admin Page State
const AdminState = {
    isLoggedIn: false,
    musicList: [],
    newsList: []
};

// Initialize Admin Page
document.addEventListener('DOMContentLoaded', () => {
    initAdminPage();
});

async function initAdminPage() {
    // Check if user is already logged in
    await checkAuthStatus();
    
    // Initialize event listeners
    initLogin();
    initSidebar();
    initModals();
    initAdminButtons();
    
    // Load data if logged in
    if (AdminState.isLoggedIn) {
        await loadDashboardData();
    }
}

// Check Auth Status
async function checkAuthStatus() {
    try {
        if (typeof supabase !== 'undefined') {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session && session.user) {
                // Check if user is admin
                const isAdmin = await checkAdminRole(session.user.id);
                
                if (isAdmin) {
                    AdminState.isLoggedIn = true;
                    showDashboard();
                } else {
                    showLogin();
                }
            } else {
                showLogin();
            }
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        showLogin();
    }
}

async function checkAdminRole(userId) {
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
}

// Login Handler
function initLogin() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('login-error');
            
            // Clear previous error
            if (errorDiv) {
                errorDiv.textContent = '';
            }
            
            const { error } = await AuthModule.signIn(email, password);
            
            if (error) {
                if (errorDiv) {
                    errorDiv.textContent = 'Erro ao fazer login: ' + error;
                }
            } else {
                AdminState.isLoggedIn = true;
                showDashboard();
                await loadDashboardData();
            }
        });
    }
}

// Logout Handler
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await AuthModule.signOut();
            AdminState.isLoggedIn = false;
            showLogin();
        });
    }
});

// Show/Hide Views
function showLogin() {
    document.getElementById('admin-login-page').classList.remove('hidden');
    document.getElementById('admin-dashboard-page').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('admin-login-page').classList.add('hidden');
    document.getElementById('admin-dashboard-page').classList.remove('hidden');
}

// Sidebar Navigation
function initSidebar() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            switchAdminSection(section);
        });
    });
}

function switchAdminSection(section) {
    // Update active link
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === section) {
            link.classList.add('active');
        }
    });

    // Show/hide sections
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
        sec.classList.add('hidden');
    });

    const targetSection = document.getElementById(`section-${section}`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        if (window.ApiModule) {
            const stats = await ApiModule.getStats();
            
            document.getElementById('total-musicas').textContent = stats.musicas;
            document.getElementById('total-noticias').textContent = stats.noticias;
            document.getElementById('total-acessos').textContent = stats.acessos;
            document.getElementById('ultima-atualizacao').textContent = new Date().toLocaleDateString('pt-BR');

            // Load admin tables
            await loadAdminMusicTable();
            await loadAdminNewsTable();
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

async function loadAdminMusicTable() {
    try {
        const musicList = await ApiModule.getMusic();
        AdminState.musicList = musicList;
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
}

async function loadAdminNewsTable() {
    try {
        const newsList = await ApiModule.getNews();
        AdminState.newsList = newsList;
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

// Admin Buttons
function initAdminButtons() {
    const addMusicBtn = document.getElementById('admin-add-music');
    const addNewsBtn = document.getElementById('admin-add-news');
    const configForm = document.getElementById('config-form');
    
    if (addMusicBtn) {
        addMusicBtn.addEventListener('click', () => {
            document.getElementById('music-id').value = '';
            document.getElementById('music-name').value = '';
            document.getElementById('music-singer').value = '';
            document.getElementById('music-link').value = '';
            document.getElementById('music-key').value = '';
            document.getElementById('music-category').value = '';
            document.getElementById('music-notes').value = '';
            document.getElementById('modal-title').textContent = 'Adicionar Música';
            openModal('music-modal');
        });
    }
    
    if (addNewsBtn) {
        addNewsBtn.addEventListener('click', () => {
            // Implement add news functionality
            alert('Funcionalidade de adicionar notícia em desenvolvimento');
        });
    }
    
    if (configForm) {
        configForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const youtubePlaylist = document.getElementById('youtube-playlist').value;
            const whatsappGroup = document.getElementById('whatsapp-group').value;
            
            // Save configuration
            if (window.ApiModule) {
                try {
                    await ApiModule.updateConfig({
                        chave: 'youtube_playlist_id',
                        valor: youtubePlaylist
                    });
                    await ApiModule.updateConfig({
                        chave: 'whatsapp_group_id',
                        valor: whatsappGroup
                    });
                    alert('Configurações salvas com sucesso!');
                } catch (error) {
                    console.error('Error saving config:', error);
                    alert('Erro ao salvar configurações');
                }
            }
        });
    }
}

// Modals
function initModals() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const musicForm = document.getElementById('music-form');

    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeAllModals);
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeAllModals);
    }

    if (musicForm) {
        musicForm.addEventListener('submit', handleMusicSubmit);
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modal-overlay');
    if (modal && overlay) {
        modal.classList.add('active');
        overlay.classList.add('active');
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.getElementById('modal-overlay').classList.remove('active');
}

async function handleMusicSubmit(e) {
    e.preventDefault();
    const formData = {
        id: document.getElementById('music-id').value,
        nome: document.getElementById('music-name').value,
        cantor: document.getElementById('music-singer').value,
        link: document.getElementById('music-link').value,
        tonalidade: document.getElementById('music-key').value,
        categoria: document.getElementById('music-category').value,
        observacoes: document.getElementById('music-notes').value
    };

    // Save music via API
    await saveMusic(formData);
    closeAllModals();
}

async function saveMusic(musicData) {
    try {
        if (window.ApiModule) {
            if (musicData.id) {
                await ApiModule.updateMusic(musicData.id, musicData);
            } else {
                await ApiModule.createMusic(musicData);
            }
            await loadAdminMusicTable();
        }
    } catch (error) {
        console.error('Error saving music:', error);
        alert('Erro ao salvar música');
    }
}

// Global functions for admin table actions
window.editMusic = function(id) {
    const music = AdminState.musicList.find(m => m.id === id);
    if (music) {
        document.getElementById('music-id').value = music.id;
        document.getElementById('music-name').value = music.nome;
        document.getElementById('music-singer').value = music.cantor;
        document.getElementById('music-link').value = music.link;
        document.getElementById('music-key').value = music.tonalidade;
        document.getElementById('music-category').value = music.categoria;
        document.getElementById('music-notes').value = music.observacoes || '';
        document.getElementById('modal-title').textContent = 'Editar Música';
        openModal('music-modal');
    }
};

window.deleteMusic = function(id) {
    if (confirm('Tem certeza que deseja excluir esta música?')) {
        if (window.ApiModule) {
            ApiModule.deleteMusic(id).then(() => {
                loadAdminMusicTable();
            });
        }
    }
};

window.editNews = function(id) {
    // Implement edit news functionality
    console.log('Edit news:', id);
};

window.deleteNews = function(id) {
    if (confirm('Tem certeza que deseja excluir esta notícia?')) {
        if (window.ApiModule) {
            ApiModule.deleteNews(id).then(() => {
                loadAdminNewsTable();
            });
        }
    }
};
