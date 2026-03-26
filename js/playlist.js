/* ==========================================
   LUMINEX - Playlist Management
   ========================================== */

class PlaylistManager {
    constructor() {
        this.playlists = [];
        this.favorites = [];
        this.currentPlaylistId = null;

        this.init();
    }

    init() {
        // Load data from localStorage
        this.loadFromStorage();

        // If no saved data, use default data
        if (this.playlists.length === 0) {
            this.playlists = [...window.playlistsData];
        }

        // Initialize UI elements
        this.initElements();
        this.initEventListeners();
        this.render();
    }

    initElements() {
        this.sidebarPlaylists = document.getElementById('sidebarPlaylists');
        this.createPlaylistModal = document.getElementById('createPlaylistModal');
        this.addToPlaylistModal = document.getElementById('addToPlaylistModal');
        this.playlistSelectList = document.getElementById('playlistSelectList');
        this.createPlaylistBtn = document.querySelector('.create-playlist-btn');
        this.createPlaylistSubmit = document.getElementById('createPlaylistSubmit');
        this.playlistNameInput = document.getElementById('playlistName');
        this.playlistDescInput = document.getElementById('playlistDesc');
        this.libraryGrid = document.getElementById('libraryGrid');
        this.favoritesCount = document.getElementById('favoritesCount');
        this.favoritesList = document.getElementById('favoritesList');
    }

    initEventListeners() {
        // Create playlist button
        this.createPlaylistBtn?.addEventListener('click', () => {
            this.openCreatePlaylistModal();
        });

        // Create playlist submit
        this.createPlaylistSubmit?.addEventListener('click', () => {
            this.createPlaylist();
        });

        // Modal close buttons
        document.querySelectorAll('.close-modal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Close modal on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeAllModals();
                }
            });
        });

        // Play favorites button
        document.getElementById('playFavoritesBtn')?.addEventListener('click', () => {
            this.playFavorites();
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    loadFromStorage() {
        try {
            const savedPlaylists = localStorage.getItem('luminex_playlists');
            const savedFavorites = localStorage.getItem('luminex_favorites');

            if (savedPlaylists) {
                this.playlists = JSON.parse(savedPlaylists);
            }
            if (savedFavorites) {
                this.favorites = JSON.parse(savedFavorites);
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('luminex_playlists', JSON.stringify(this.playlists));
            localStorage.setItem('luminex_favorites', JSON.stringify(this.favorites));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }

    render() {
        this.renderSidebarPlaylists();
        this.renderLibraryGrid();
        this.renderFavorites();
    }

    renderSidebarPlaylists() {
        if (!this.sidebarPlaylists) return;

        this.sidebarPlaylists.innerHTML = this.playlists.map((playlist, index) => `
            <div class="playlist-item stagger-item" data-playlist-id="${playlist.id}" style="animation-delay: ${index * 0.05}s">
                <img src="${playlist.cover}" alt="${playlist.name}" class="playlist-item-cover">
                <div class="playlist-item-info">
                    <span class="playlist-item-name">${playlist.name}</span>
                    <span class="playlist-item-count">${playlist.songs.length} songs</span>
                </div>
            </div>
        `).join('');

        // Add click handlers
        this.sidebarPlaylists.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                const playlistId = parseInt(item.dataset.playlistId);
                this.openPlaylistView(playlistId);
            });
        });
    }

    renderLibraryGrid() {
        if (!this.libraryGrid) return;

        this.libraryGrid.innerHTML = this.playlists.map((playlist, index) => `
            <div class="card stagger-item" data-playlist-id="${playlist.id}" style="animation-delay: ${index * 0.05}s">
                <div class="card-cover">
                    <img src="${playlist.cover}" alt="${playlist.name}">
                    <div class="play-overlay">
                        <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
                    </div>
                </div>
                <div class="card-title">${playlist.name}</div>
                <div class="card-subtitle">${playlist.songs.length} songs</div>
            </div>
        `).join('');

        // Add click handlers
        this.libraryGrid.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
                const playlistId = parseInt(card.dataset.playlistId);
                this.openPlaylistView(playlistId);
            });
        });
    }

    renderFavorites() {
        if (!this.favoritesCount) return;

        this.favoritesCount.textContent = this.favorites.length;

        if (!this.favoritesList) return;

        if (this.favorites.length === 0) {
            this.favoritesList.innerHTML = `
                <div class="empty-state" style="padding: 40px; text-align: center; color: var(--text-muted);">
                    <p>Songs you like will appear here</p>
                </div>
            `;
            return;
        }

        const favoriteSongs = this.favorites
            .map(id => window.getSongById(id))
            .filter(Boolean);

        this.favoritesList.innerHTML = favoriteSongs.map((song, index) => `
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
        `).join('');

        // Add click handlers
        this.favoritesList.querySelectorAll('.song-row').forEach(row => {
            row.addEventListener('click', () => {
                const songId = parseInt(row.dataset.songId);
                this.playSong(songId);
            });

            row.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                window.contextMenu?.show(e, songId);
            });
        });
    }

    openPlaylistView(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        this.currentPlaylistId = playlistId;

        // Update playlist view elements
        const playlistTitle = document.getElementById('playlistTitle');
        const playlistDescription = document.getElementById('playlistDescription');
        const playlistMeta = document.getElementById('playlistMeta');
        const playlistCover = document.getElementById('playlistCover');
        const playlistSongs = document.getElementById('playlistSongs');
        const playlistGradient = document.getElementById('playlistGradient');

        if (playlistTitle) playlistTitle.textContent = playlist.name;
        if (playlistDescription) playlistDescription.textContent = playlist.description || '';
        if (playlistMeta) playlistMeta.textContent = `${playlist.songs.length} songs`;

        if (playlistCover) {
            playlistCover.innerHTML = `<img src="${playlist.cover}" alt="${playlist.name}">`;
        }

        // Render songs
        const songs = playlist.songs.map(id => window.getSongById(id)).filter(Boolean);

        if (playlistSongs) {
            playlistSongs.innerHTML = songs.map((song, index) => `
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
            `).join('');

            // Add click handlers
            playlistSongs.querySelectorAll('.song-row').forEach(row => {
                row.addEventListener('click', () => {
                    const songId = parseInt(row.dataset.songId);
                    this.playSongFromPlaylist(songId, playlistId);
                });
            });
        }

        // Play playlist button
        const playPlaylistBtn = document.getElementById('playPlaylistBtn');
        playPlaylistBtn?.addEventListener('click', () => {
            this.playPlaylist(playlistId);
        });

        // Navigate to playlist view
        window.app?.navigateToView('playlist');
    }

    createPlaylist() {
        const name = this.playlistNameInput?.value.trim();
        const description = this.playlistDescInput?.value.trim();

        if (!name) {
            window.showToast?.('Please enter a playlist name', 'error');
            return;
        }

        const newPlaylist = {
            id: Date.now(),
            name,
            description,
            cover: `https://picsum.photos/seed/playlist${Date.now()}/400`,
            songs: [],
            createdAt: new Date()
        };

        this.playlists.push(newPlaylist);
        this.saveToStorage();
        this.render();
        this.closeAllModals();

        window.showToast?.(`Playlist "${name}" created`);
    }

    deletePlaylist(playlistId) {
        const index = this.playlists.findIndex(p => p.id === playlistId);
        if (index === -1) return;

        const playlist = this.playlists[index];
        this.playlists.splice(index, 1);
        this.saveToStorage();
        this.render();

        window.showToast?.(`Playlist "${playlist.name}" deleted`);
    }

    addSongToPlaylist(songId, playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        if (playlist.songs.includes(songId)) {
            window.showToast?.('Song already in playlist');
            return;
        }

        playlist.songs.push(songId);
        this.saveToStorage();
        this.render();

        window.showToast?.(`Added to ${playlist.name}`);
    }

    removeSongFromPlaylist(songId, playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        const index = playlist.songs.indexOf(songId);
        if (index > -1) {
            playlist.songs.splice(index, 1);
            this.saveToStorage();
            this.render();
        }
    }

    // Favorites/Liked Songs
    toggleFavorite(songId) {
        const index = this.favorites.indexOf(songId);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.saveToStorage();
            this.renderFavorites();
            return false;
        } else {
            this.favorites.push(songId);
            this.saveToStorage();
            this.renderFavorites();
            return true;
        }
    }

    isFavorite(songId) {
        return this.favorites.includes(songId);
    }

    // Playback
    playSong(songId) {
        const song = window.getSongById(songId);
        if (!song) return;

        window.player?.loadSong(song);
        window.player?.play();
        window.queue?.setQueue([song]);
    }

    playSongFromPlaylist(songId, playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        const songs = playlist.songs.map(id => window.getSongById(id)).filter(Boolean);
        const startIndex = songs.findIndex(s => s.id === songId);

        window.queue?.setQueue(songs, startIndex);
        window.player?.loadSong(songs[startIndex]);
        window.player?.play();
    }

    playPlaylist(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist || playlist.songs.length === 0) return;

        const songs = playlist.songs.map(id => window.getSongById(id)).filter(Boolean);
        window.queue?.setQueue(songs);
        window.player?.loadSong(songs[0]);
        window.player?.play();
    }

    playFavorites() {
        if (this.favorites.length === 0) {
            window.showToast?.('No liked songs yet');
            return;
        }

        const songs = this.favorites.map(id => window.getSongById(id)).filter(Boolean);
        window.queue?.setQueue(songs);
        window.player?.loadSong(songs[0]);
        window.player?.play();
    }

    // Modal Management
    openCreatePlaylistModal() {
        if (this.createPlaylistModal) {
            this.createPlaylistModal.classList.add('active');
            this.playlistNameInput?.focus();
        }
    }

    openAddToPlaylistModal(songId) {
        if (!this.addToPlaylistModal) return;

        this.pendingSongId = songId;

        // Render playlist options
        if (this.playlistSelectList) {
            this.playlistSelectList.innerHTML = this.playlists.map(playlist => `
                <div class="playlist-select-item" data-playlist-id="${playlist.id}">
                    <img src="${playlist.cover}" alt="${playlist.name}">
                    <div class="playlist-item-info">
                        <span class="playlist-item-name">${playlist.name}</span>
                        <span class="playlist-item-count">${playlist.songs.length} songs</span>
                    </div>
                </div>
            `).join('');

            // Add click handlers
            this.playlistSelectList.querySelectorAll('.playlist-select-item').forEach(item => {
                item.addEventListener('click', () => {
                    const playlistId = parseInt(item.dataset.playlistId);
                    this.addSongToPlaylist(this.pendingSongId, playlistId);
                    this.closeAllModals();
                });
            });
        }

        this.addToPlaylistModal.classList.add('active');
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });

        // Clear form inputs
        if (this.playlistNameInput) this.playlistNameInput.value = '';
        if (this.playlistDescInput) this.playlistDescInput.value = '';
    }
}

// Initialize and export
window.playlistManager = new PlaylistManager();

// Export helper functions
window.toggleFavorite = (songId) => window.playlistManager.toggleFavorite(songId);
window.isFavorite = (songId) => window.playlistManager.isFavorite(songId);
window.openAddToPlaylistModal = (songId) => window.playlistManager.openAddToPlaylistModal(songId);
