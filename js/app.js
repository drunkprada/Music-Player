/* ==========================================
   LUMINEX - Main Application
   ========================================== */

class LuminexApp {
    constructor() {
        this.currentView = 'home';
        this.searchTimeout = null;

        this.init();
    }

    init() {
        this.initElements();
        this.initEventListeners();
        this.renderInitialContent();

        // Show welcome animation
        this.playWelcomeAnimation();
    }

    initElements() {
        // Views
        this.homeView = document.getElementById('homeView');
        this.searchView = document.getElementById('searchView');
        this.libraryView = document.getElementById('libraryView');
        this.favoritesView = document.getElementById('favoritesView');
        this.playlistView = document.getElementById('playlistView');

        // Navigation
        this.navItems = document.querySelectorAll('.nav-item[data-view]');

        // Search
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.genreGrid = document.getElementById('genreGrid');

        // Content areas
        this.featuredGrid = document.getElementById('featuredGrid');
        this.recentlyPlayed = document.getElementById('recentlyPlayed');
        this.madeForYou = document.getElementById('madeForYou');
        this.trendingList = document.getElementById('trendingList');

        // Context menu
        this.contextMenu = document.getElementById('contextMenu');
    }

    initEventListeners() {
        // Navigation
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                this.navigateToView(view);
            });
        });

        // Search
        this.searchInput?.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        this.searchInput?.addEventListener('focus', () => {
            this.navigateToView('search');
        });

        // Context menu
        document.addEventListener('contextmenu', (e) => {
            const songRow = e.target.closest('.song-row');
            const card = e.target.closest('.card');

            if (songRow || card) {
                e.preventDefault();
                const songId = parseInt((songRow || card).dataset.songId);
                if (songId) {
                    this.showContextMenu(e, songId);
                }
            }
        });

        // Close context menu on click
        document.addEventListener('click', () => {
            this.hideContextMenu();
        });

        // Context menu actions
        this.contextMenu?.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                this.handleContextMenuAction(item.dataset.action);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'f':
                        e.preventDefault();
                        this.searchInput?.focus();
                        break;
                }
            }
        });
    }

    renderInitialContent() {
        this.renderFeaturedGrid();
        this.renderRecentlyPlayed();
        this.renderMadeForYou();
        this.renderTrendingList();
        this.renderGenreGrid();
    }

    renderFeaturedGrid() {
        if (!this.featuredGrid) return;

        const lead = window.songsData[0];
        const spotlight = window.songsData[1];

        this.featuredGrid.innerHTML = `
            <div class="featured-card purple stagger-item" data-song-id="${lead.id}" style="animation-delay: 0.05s">
                <div class="featured-card-bg"></div>
                <div class="featured-copy">
                    <span class="featured-kicker">Playlist of the Day</span>
                    <span class="featured-card-title">Find Your Music</span>
                    <span class="featured-meta">${lead.artist} • ${lead.album}</span>
                </div>
                <div class="featured-vinyl">
                    <div class="vinyl-disc">
                        <img src="${lead.cover}" alt="${lead.title}" class="vinyl-cover">
                    </div>
                </div>
                <div class="play-overlay">
                    <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
                </div>
            </div>
            <div class="featured-card lime stagger-item" data-song-id="${spotlight.id}" style="animation-delay: 0.1s">
                <div class="featured-card-bg"></div>
                <div class="featured-copy">
                    <span class="featured-kicker">Hot Right Now</span>
                    <span class="featured-card-title">Trending Hits</span>
                    <span class="featured-meta">${spotlight.artist}</span>
                </div>
                <img src="${spotlight.cover}" alt="${spotlight.title}" class="featured-card-img">
                <div class="play-overlay">
                    <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
                </div>
            </div>
        `;

        // Add click handlers
        this.featuredGrid.querySelectorAll('.featured-card').forEach(card => {
            card.addEventListener('click', () => {
                const songId = parseInt(card.dataset.songId);
                this.playSong(songId);
            });
        });
    }

    renderRecentlyPlayed() {
        if (!this.recentlyPlayed) return;

        // Use shuffled songs as "recently played"
        const songs = [...window.songsData].sort(() => Math.random() - 0.5).slice(0, 6);

        this.recentlyPlayed.innerHTML = songs.map((song, index) => `
            <div class="card stagger-item" data-song-id="${song.id}" style="animation-delay: ${index * 0.05}s">
                <div class="card-cover">
                    <img src="${song.cover}" alt="${song.title}">
                    <div class="play-overlay">
                        <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
                    </div>
                </div>
                <div class="card-title">${song.title}</div>
                <div class="card-subtitle">${song.artist}</div>
            </div>
        `).join('');

        this.addCardClickHandlers(this.recentlyPlayed);
    }

    renderMadeForYou() {
        if (!this.madeForYou) return;

        // Create "album" cards from songs
        const albums = window.songsData.slice(0, 5).map(song => ({
            id: song.id,
            title: song.album,
            artist: song.artist,
            cover: song.cover
        }));

        this.madeForYou.innerHTML = albums.map((album, index) => `
            <div class="card stagger-item" data-song-id="${album.id}" style="animation-delay: ${index * 0.05}s">
                <div class="card-cover">
                    <img src="${album.cover}" alt="${album.title}">
                    <div class="play-overlay">
                        <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
                    </div>
                </div>
                <div class="card-title">${album.title}</div>
                <div class="card-subtitle">${album.artist}</div>
            </div>
        `).join('');

        this.addCardClickHandlers(this.madeForYou);
    }

    renderTrendingList() {
        if (!this.trendingList) return;

        const trending = window.songsData.slice(0, 5);

        this.trendingList.innerHTML = trending.map((song, index) => `
            <div class="song-row stagger-item" data-song-id="${song.id}" style="animation-delay: ${index * 0.05}s">
                <span class="song-number">${index + 1}</span>
                <svg class="play-icon-small" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
                <div class="song-info">
                    <img src="${song.cover}" alt="${song.title}" class="song-cover-small">
                    <div class="song-details">
                        <span class="song-title">${song.title}</span>
                        <span class="song-artist">${song.artist}</span>
                    </div>
                </div>
                <span class="song-album">${song.album}</span>
                <span class="song-duration">${formatDuration(song.duration)}</span>
            </div>
        `).join('');

        this.addSongRowClickHandlers(this.trendingList);
    }

    renderGenreGrid() {
        if (!this.genreGrid) return;

        this.genreGrid.innerHTML = window.genresData.map((genre, index) => `
            <div class="genre-card stagger-item" data-genre="${genre.name}" style="animation-delay: ${index * 0.03}s">
                <div class="genre-card-bg" style="background: ${genre.color};"></div>
                <span class="genre-card-title">${genre.name}</span>
            </div>
        `).join('');

        // Add click handlers
        this.genreGrid.querySelectorAll('.genre-card').forEach(card => {
            card.addEventListener('click', () => {
                const genre = card.dataset.genre;
                this.searchInput.value = genre;
                this.handleSearch(genre);
            });
        });
    }

    renderSearchResults(results) {
        if (!this.searchResults) return;

        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="empty-state" style="padding: 60px; text-align: center;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 64px; height: 64px; margin-bottom: 16px; opacity: 0.3;">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <h3 style="margin-bottom: 8px; color: var(--text-primary);">No results found</h3>
                    <p style="color: var(--text-muted);">Try searching for something else</p>
                </div>
            `;
            this.searchResults.style.display = 'block';
            this.genreGrid.style.display = 'none';
            return;
        }

        this.searchResults.innerHTML = `
            <h2 class="section-title" style="margin-bottom: 20px;">Search Results</h2>
            <div class="song-list">
                ${results.map((song, index) => `
                    <div class="song-row stagger-item" data-song-id="${song.id}" style="animation-delay: ${index * 0.03}s">
                        <span class="song-number">${index + 1}</span>
                        <svg class="play-icon-small" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
                        <div class="song-info">
                            <img src="${song.cover}" alt="${song.title}" class="song-cover-small">
                            <div class="song-details">
                                <span class="song-title">${song.title}</span>
                                <span class="song-artist">${song.artist}</span>
                            </div>
                        </div>
                        <span class="song-album">${song.album}</span>
                        <span class="song-duration">${formatDuration(song.duration)}</span>
                    </div>
                `).join('')}
            </div>
        `;

        this.searchResults.style.display = 'block';
        this.genreGrid.style.display = 'none';

        this.addSongRowClickHandlers(this.searchResults);
    }

    handleSearch(query) {
        clearTimeout(this.searchTimeout);

        if (!query.trim()) {
            this.searchResults.style.display = 'none';
            this.genreGrid.style.display = 'grid';
            return;
        }

        // Debounce search
        this.searchTimeout = setTimeout(() => {
            const results = window.searchSongs(query);
            this.renderSearchResults(results);
        }, 300);
    }

    addCardClickHandlers(container) {
        container.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
                const songId = parseInt(card.dataset.songId);
                this.playSong(songId);
            });
        });
    }

    addSongRowClickHandlers(container) {
        container.querySelectorAll('.song-row').forEach(row => {
            row.addEventListener('click', () => {
                const songId = parseInt(row.dataset.songId);
                this.playSong(songId);
            });
        });
    }

    playSong(songId) {
        const song = window.getSongById(songId);
        if (!song) return;

        // Set up queue with all songs starting from this one
        const allSongs = [...window.songsData];
        const startIndex = allSongs.findIndex(s => s.id === songId);

        window.queue?.setQueue(allSongs, startIndex);
        window.player?.loadSong(song);
        window.player?.play();

        // Update playing state in UI
        this.updatePlayingState(songId);
    }

    updatePlayingState(songId) {
        // Remove playing class from all rows
        document.querySelectorAll('.song-row.playing').forEach(row => {
            row.classList.remove('playing');
        });

        // Add playing class to current song
        document.querySelectorAll(`.song-row[data-song-id="${songId}"]`).forEach(row => {
            row.classList.add('playing');
        });
    }

    navigateToView(view) {
        // Update nav active state
        this.navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });

        // Get view elements
        const views = {
            home: this.homeView,
            search: this.searchView,
            library: this.libraryView,
            favorites: this.favoritesView,
            playlist: this.playlistView
        };

        // Hide all views
        Object.values(views).forEach(v => {
            if (v) v.classList.remove('active');
        });

        // Show target view
        const targetView = views[view];
        if (targetView) {
            targetView.classList.add('active');

            // Trigger animations
            const staggerItems = targetView.querySelectorAll('.stagger-item');
            staggerItems.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.animation = 'none';
                setTimeout(() => {
                    item.style.animation = '';
                    item.style.animationDelay = `${index * 0.03}s`;
                }, 10);
            });
        }

        this.currentView = view;
    }

    showContextMenu(e, songId) {
        this.currentContextSongId = songId;

        if (!this.contextMenu) return;

        // Position menu at click location
        const x = e.clientX;
        const y = e.clientY;

        // Adjust if menu would go off screen
        const menuWidth = 220;
        const menuHeight = 280;

        let left = x;
        let top = y;

        if (x + menuWidth > window.innerWidth) {
            left = window.innerWidth - menuWidth - 10;
        }

        if (y + menuHeight > window.innerHeight) {
            top = window.innerHeight - menuHeight - 10;
        }

        this.contextMenu.style.left = `${left}px`;
        this.contextMenu.style.top = `${top}px`;
        this.contextMenu.classList.add('active');

        // Update like button text
        const isLiked = window.isFavorite?.(songId);
        const likeItem = this.contextMenu.querySelector('[data-action="like"]');
        if (likeItem) {
            likeItem.querySelector('span').textContent = isLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs';
        }
    }

    hideContextMenu() {
        this.contextMenu?.classList.remove('active');
    }

    handleContextMenuAction(action) {
        const songId = this.currentContextSongId;
        if (!songId) return;

        const song = window.getSongById(songId);

        switch (action) {
            case 'play':
                this.playSong(songId);
                break;

            case 'queue':
                window.queue?.addToQueue(song);
                break;

            case 'playlist':
                window.openAddToPlaylistModal?.(songId);
                break;

            case 'like':
                window.toggleFavorite?.(songId);
                const isNowLiked = window.isFavorite?.(songId);
                window.showToast?.(isNowLiked ? 'Added to Liked Songs' : 'Removed from Liked Songs');
                break;

            case 'artist':
                // Would navigate to artist page
                window.showToast?.(`Artist: ${song?.artist}`);
                break;

            case 'album':
                // Would navigate to album page
                window.showToast?.(`Album: ${song?.album}`);
                break;
        }

        this.hideContextMenu();
    }

    playWelcomeAnimation() {
        // Animate logo
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.style.animation = 'fadeInUp 0.6s ease forwards';
        }

        // Animate sidebar items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.animation = 'fadeInLeft 0.4s ease forwards';
            item.style.animationDelay = `${0.1 + index * 0.05}s`;
        });

        // Animate main content
        const sections = document.querySelectorAll('.section, .featured-section');
        sections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.animation = 'fadeInUp 0.5s ease forwards';
            section.style.animationDelay = `${0.3 + index * 0.1}s`;
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LuminexApp();

    // Log welcome message
    console.log('%cMELO Music Dashboard', 'font-size: 24px; font-weight: bold; color: #ff5f32;');
    console.log('%cFrontend only. No backend required.', 'font-size: 14px; color: #ff8c4b;');
});

// Export context menu object for external use
window.contextMenu = {
    show: (e, songId) => window.app?.showContextMenu(e, songId),
    hide: () => window.app?.hideContextMenu()
};
