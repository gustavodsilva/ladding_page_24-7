/* ============================================
   LOUVOR 24/7 - PLAYER MODULE
   YouTube Integration
   ============================================ */

// Player Module
const PlayerModule = {
    currentVideoId: null,
    player: null,
    isPlaying: false,

    init() {
        // Load YouTube IFrame API
        this.loadYouTubeAPI();
    },

    loadYouTubeAPI() {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        // Set up global callback
        window.onYouTubeIframeAPIReady = () => {
            console.log('YouTube API ready');
        };
    },

    createPlayer(containerId, videoId) {
        if (typeof YT === 'undefined') {
            console.error('YouTube API not loaded');
            return;
        }

        this.currentVideoId = videoId;

        this.player = new YT.Player(containerId, {
            height: '360',
            width: '640',
            videoId: videoId,
            playerVars: {
                'playsinline': 1,
                'rel': 0,
                'modestbranding': 1
            },
            events: {
                'onReady': this.onPlayerReady.bind(this),
                'onStateChange': this.onPlayerStateChange.bind(this)
            }
        });
    },

    onPlayerReady(event) {
        console.log('Player ready');
        this.isPlaying = false;
    },

    onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING) {
            this.isPlaying = true;
        } else if (event.data === YT.PlayerState.PAUSED) {
            this.isPlaying = false;
        } else if (event.data === YT.PlayerState.ENDED) {
            this.isPlaying = false;
        }
    },

    playVideo(videoId) {
        if (this.player) {
            if (videoId && videoId !== this.currentVideoId) {
                this.player.loadVideoById(videoId);
                this.currentVideoId = videoId;
            } else {
                this.player.playVideo();
            }
        }
    },

    pauseVideo() {
        if (this.player) {
            this.player.pauseVideo();
        }
    },

    stopVideo() {
        if (this.player) {
            this.player.stopVideo();
        }
    },

    getVideoIdFromUrl(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    },

    openYouTubeVideo(url) {
        const videoId = this.getVideoIdFromUrl(url);
        if (videoId) {
            window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
        } else {
            window.open(url, '_blank');
        }
    },

    openYouTubePlaylist(playlistId) {
        window.open(`https://www.youtube.com/playlist?list=${playlistId}`, '_blank');
    }
};

// Initialize player module
document.addEventListener('DOMContentLoaded', () => {
    PlayerModule.init();
});

// Export for global access
window.PlayerModule = PlayerModule;

// Add click handlers for YouTube links
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a[href*="youtube.com"], a[href*="youtu.be"]');
        if (target) {
            const url = target.getAttribute('href');
            if (url.includes('playlist')) {
                const playlistId = url.split('list=')[1]?.split('&')[0];
                if (playlistId) {
                    e.preventDefault();
                    PlayerModule.openYouTubePlaylist(playlistId);
                }
            }
        }
    });
});
