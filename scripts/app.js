/* ============================================
   LOUVOR 24/7 - MAIN APPLICATION
   ============================================ */

// App State
const AppState = {
    isLoading: true,
    currentSection: 'home',
    musicList: [],
    newsList: [],
    bibleData: null,
    currentBook: 'Gênesis',
    currentChapter: 1,
    fontSize: 16,
    darkMode: true
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    try {
        // Hide loading screen
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
            AppState.isLoading = false;
        }, 1500);

        // Initialize components
        initNavigation();
        initScrollAnimations();
        initBibleVerse();
        initStats();
        initMusicGrid();
        initBlogGrid();
        initBibleReader();
        initModals();
        initAdminPanel();

        // Load data from Supabase
        await loadMusicData();
        await loadNewsData();
        await loadBibleData();

        console.log('Louvor 24/7 initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Navigation
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navOverlay = document.getElementById('nav-overlay');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navOverlay.classList.toggle('active');
        });
    }

    // Close menu on overlay click
    if (navOverlay) {
        navOverlay.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navOverlay.classList.remove('active');
        });
    }

    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    // Close mobile menu
                    navMenu.classList.remove('active');
                    navOverlay.classList.remove('active');
                }
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Scroll Animations
function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}

// Dynamic Bible Verse
function initBibleVerse() {
    const verses = [
        { text: "Cantai ao Senhor um cântico novo, porque ele fez coisas maravilhosas", ref: "Lev�tico 6:13" },
        { text: "Louvai ao Senhor, porque ele é bom, porque a sua benignidade dura para sempre", ref: "Salmos 106:1" },
        { text: "De todo o coração te louvarei, Senhor Deus, na presença dos anjos", ref: "Salmos 138:1" },
        { text: "Então cantarei louvores ao teu nome para sempre", ref: "Salmos 61:8" },
        { text: "A ele clamei com a minha boca, e ele foi exaltado pela minha língua", ref: "Salmos 66:17" }
    ];

    const verseElement = document.getElementById('bible-verse');
    if (verseElement) {
        const randomVerse = verses[Math.floor(Math.random() * verses.length)];
        verseElement.textContent = `"${randomVerse.text}" - ${randomVerse.ref}`;
    }
}

// Animated Stats
function initStats() {
    const statNumbers = document.querySelectorAll('.stat-number');

    const animateCounter = (element, target) => {
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 30);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.count);
                animateCounter(entry.target, target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });
}

// Music Grid
function initMusicGrid() {
    const searchInput = document.getElementById('search-music');
    const filterCategory = document.getElementById('filter-category');

    if (searchInput) {
        searchInput.addEventListener('input', filterMusic);
    }

    if (filterCategory) {
        filterCategory.addEventListener('change', filterMusic);
    }
}

function filterMusic() {
    const searchTerm = document.getElementById('search-music').value.toLowerCase();
    const category = document.getElementById('filter-category').value;

    const filteredMusic = AppState.musicList.filter(music => {
        const matchesSearch = music.nome.toLowerCase().includes(searchTerm) ||
                            music.cantor.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || music.categoria === category;
        return matchesSearch && matchesCategory;
    });

    renderMusicGrid(filteredMusic);
}

function renderMusicGrid(musicList) {
    const grid = document.getElementById('music-grid');
    if (!grid) return;

    if (musicList.length === 0) {
        grid.innerHTML = '<p class="text-center">Nenhuma música encontrada</p>';
        return;
    }

    grid.innerHTML = musicList.map(music => `
        <div class="card music-card hover-lift">
            <div class="music-cover">
                <img src="https://img.youtube.com/vi/${getYouTubeId(music.link)}/mqdefault.jpg" alt="${music.nome}">
            </div>
            <div class="music-info">
                <h3 class="music-title">${music.nome}</h3>
                <p class="music-singer">${music.cantor}</p>
                <div class="music-meta">
                    <span class="music-key">${music.tonalidade || '-'}</span>
                    <span class="music-category">${music.categoria}</span>
                </div>
            </div>
            <a href="${music.link}" target="_blank" class="btn btn-primary btn-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
                Ouvir
            </a>
        </div>
    `).join('');
}

function getYouTubeId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
}

// Blog Grid
function initBlogGrid() {
    // Blog grid is rendered when data is loaded
}

function renderBlogGrid(newsList) {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;

    if (newsList.length === 0) {
        grid.innerHTML = '<p class="text-center">Nenhuma notícia encontrada</p>';
        return;
    }

    grid.innerHTML = newsList.map(news => `
        <div class="card blog-card hover-lift">
            <div class="blog-image">
                <img src="${news.imagem || 'https://via.placeholder.com/400x200'}" alt="${news.titulo}">
            </div>
            <div class="blog-content">
                <span class="blog-date">${formatDate(news.created_at)}</span>
                <h3 class="blog-title">${news.titulo}</h3>
                <p class="blog-excerpt">${news.conteudo.substring(0, 150)}...</p>
                <a href="#" class="btn btn-ghost">Ler mais</a>
            </div>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Bible Reader
function initBibleReader() {
    const prevChapter = document.getElementById('prev-chapter');
    const nextChapter = document.getElementById('next-chapter');
    const increaseFont = document.getElementById('increase-font');
    const decreaseFont = document.getElementById('decrease-font');
    const toggleDark = document.getElementById('toggle-dark');
    const bibleSearch = document.getElementById('bible-search');

    if (prevChapter) {
        prevChapter.addEventListener('click', () => changeChapter(-1));
    }

    if (nextChapter) {
        nextChapter.addEventListener('click', () => changeChapter(1));
    }

    if (increaseFont) {
        increaseFont.addEventListener('click', () => changeFontSize(2));
    }

    if (decreaseFont) {
        decreaseFont.addEventListener('click', () => changeFontSize(-2));
    }

    if (toggleDark) {
        toggleDark.addEventListener('click', () => toggleDarkMode());
    }

    if (bibleSearch) {
        bibleSearch.addEventListener('input', searchBible);
    }
}

function changeChapter(delta) {
    AppState.currentChapter += delta;
    if (AppState.currentChapter < 1) AppState.currentChapter = 1;
    loadBibleChapter();
}

function changeFontSize(delta) {
    AppState.fontSize += delta;
    if (AppState.fontSize < 12) AppState.fontSize = 12;
    if (AppState.fontSize > 24) AppState.fontSize = 24;
    document.getElementById('bible-text').style.fontSize = AppState.fontSize + 'px';
}

function toggleDarkMode() {
    AppState.darkMode = !AppState.darkMode;
    document.getElementById('bible-text').classList.toggle('light-mode');
}

function searchBible(e) {
    const searchTerm = e.target.value.toLowerCase();
    // Implement search functionality
}

// Modals
function initModals() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const musicModal = document.getElementById('music-modal');
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

function handleMusicSubmit(e) {
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
    saveMusic(formData);
    closeAllModals();
}

// Admin Panel
function initAdminPanel() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const logoutBtn = document.getElementById('logout-btn');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            switchAdminSection(section);
        });
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
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

function handleLogout() {
    // Handle logout via auth module
    if (window.AuthModule) {
        AuthModule.logout();
    }
}

// Data Loading Functions
async function loadMusicData() {
    try {
        if (window.ApiModule) {
            AppState.musicList = await ApiModule.getMusic();
            renderMusicGrid(AppState.musicList);
            renderRepertoireTable(AppState.musicList);
        }
    } catch (error) {
        console.error('Error loading music data:', error);
        // Use mock data for development
        AppState.musicList = getMockMusicData();
        renderMusicGrid(AppState.musicList);
        renderRepertoireTable(AppState.musicList);
    }
}

async function loadNewsData() {
    try {
        if (window.ApiModule) {
            AppState.newsList = await ApiModule.getNews();
            renderBlogGrid(AppState.newsList);
        }
    } catch (error) {
        console.error('Error loading news data:', error);
        // Use mock data for development
        AppState.newsList = getMockNewsData();
        renderBlogGrid(AppState.newsList);
    }
}

async function loadBibleData() {
    try {
        const response = await fetch('data/biblia/biblia.json');
        AppState.bibleData = await response.json();
        renderBibleBooks();
        loadBibleChapter();
    } catch (error) {
        console.error('Error loading Bible data:', error);
    }
}

function renderBibleBooks() {
    const booksContainer = document.getElementById('bible-books');
    if (!booksContainer || !AppState.bibleData) return;

    booksContainer.innerHTML = AppState.bibleData.livros.map(livro => `
        <button class="book-btn ${livro.nome === AppState.currentBook ? 'active' : ''}" 
                data-book="${livro.nome}">
            ${livro.nome}
        </button>
    `).join('');

    booksContainer.querySelectorAll('.book-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            AppState.currentBook = btn.dataset.book;
            AppState.currentChapter = 1;
            renderBibleBooks();
            loadBibleChapter();
        });
    });
}

function loadBibleChapter() {
    const bibleText = document.getElementById('bible-text');
    const currentBookEl = document.getElementById('current-book');
    const currentChapterEl = document.getElementById('current-chapter');

    if (!bibleText || !AppState.bibleData) return;

    const book = AppState.bibleData.livros.find(l => l.nome === AppState.currentBook);
    if (!book) return;

    const chapter = book.capitulos[AppState.currentChapter - 1];
    if (!chapter) return;

    currentBookEl.textContent = AppState.currentBook;
    currentChapterEl.textContent = AppState.currentChapter;

    bibleText.innerHTML = chapter.versiculos.map(v => `
        <span class="verse">${v.numero}</span>
        <span class="verse-text">${v.texto}</span>
    `).join('');
}

function renderRepertoireTable(musicList) {
    const tbody = document.getElementById('repertoire-body');
    if (!tbody) return;

    tbody.innerHTML = musicList.map(music => `
        <tr>
            <td>${music.nome}</td>
            <td>${music.cantor}</td>
            <td>${music.tonalidade || '-'}</td>
            <td>${music.categoria}</td>
        </tr>
    `).join('');
}

// Mock Data for Development
function getMockMusicData() {
    return [
        {
            id: '1',
            nome: 'Aos Pés do Altar',
            cantor: 'Diante do Trono',
            link: 'https://www.youtube.com/watch?v=example1',
            tonalidade: 'G',
            categoria: 'adoracao',
            observacoes: '',
            created_at: new Date().toISOString()
        },
        {
            id: '2',
            nome: 'Meu Abrigo',
            cantor: 'Vineyard',
            link: 'https://www.youtube.com/watch?v=example2',
            tonalidade: 'D',
            categoria: 'congregacao',
            observacoes: '',
            created_at: new Date().toISOString()
        },
        {
            id: '3',
            nome: 'Santo Espírito',
            cantor: 'Diante do Trono',
            link: 'https://www.youtube.com/watch?v=example3',
            tonalidade: 'E',
            categoria: 'especial',
            observacoes: '',
            created_at: new Date().toISOString()
        }
    ];
}

function getMockNewsData() {
    return [
        {
            id: '1',
            titulo: 'Culto Especial de Louvor',
            conteudo: 'Venha celebrar conosco neste culto especial de louvor. Teremos momentos de adoração profunda e comunhão.',
            imagem: 'https://via.placeholder.com/400x200',
            created_at: new Date().toISOString()
        },
        {
            id: '2',
            titulo: 'Nova Música Adicionada',
            conteudo: 'Adicionamos uma nova música ao nosso repertório. Confira na seção de playlist.',
            imagem: 'https://via.placeholder.com/400x200',
            created_at: new Date().toISOString()
        }
    ];
}

// Export functions for global access (only for admin panel)
window.editMusic = function(id) {
    const music = AppState.musicList.find(m => m.id === id);
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
        // Delete via API
        deleteMusicById(id);
    }
};

async function saveMusic(musicData) {
    try {
        if (window.ApiModule) {
            if (musicData.id) {
                await ApiModule.updateMusic(musicData.id, musicData);
            } else {
                await ApiModule.createMusic(musicData);
            }
            await loadMusicData();
        }
    } catch (error) {
        console.error('Error saving music:', error);
    }
}

async function deleteMusicById(id) {
    try {
        if (window.ApiModule) {
            await ApiModule.deleteMusic(id);
            await loadMusicData();
        }
    } catch (error) {
        console.error('Error deleting music:', error);
    }
}








// Units Sidebar Functionality
function initUnitsSidebar() {
    const unitsSidebar = document.getElementById('units-sidebar');
    const sidebarClose = document.getElementById('sidebar-close');
    const unitsToggles = document.querySelectorAll('.units-toggle');
    
    if (!unitsSidebar) return;
    
    // Toggle sidebar open/close
    unitsToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            unitsSidebar.classList.toggle('active');
        });
    });
    
    // Close sidebar when clicking close button
    if (sidebarClose) {
        sidebarClose.addEventListener('click', () => {
            unitsSidebar.classList.remove('active');
        });
    }
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (unitsSidebar.classList.contains('active') &&
            !unitsSidebar.contains(e.target) &&
            !e.target.classList.contains('units-toggle')) {
            unitsSidebar.classList.remove('active');
        }
    });
}

// Initialize units sidebar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initUnitsSidebar();
});
