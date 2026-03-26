/* ==========================================
   LUMINEX - Audio Player Core
   ========================================== */

class AudioPlayer {
    constructor() {
        this.audio = document.getElementById('audioPlayer');
        this.isPlaying = false;
        this.currentSong = null;
        this.volume = 0.7;
        this.isMuted = false;
        this.isShuffled = false;
        this.repeatMode = 'none'; // none, one, all
        this.previousVolume = 0.7;

        this.initElements();
        this.initEventListeners();
        this.setVolume(this.volume);
    }

    initElements() {
        // Play/Pause buttons
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.miniPlayPauseBtn = document.getElementById('miniPlayPauseBtn');

        // Control buttons
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.miniPrevBtn = document.getElementById('miniPrevBtn');
        this.miniNextBtn = document.getElementById('miniNextBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');

        // Progress elements
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.progressHandle = document.getElementById('progressHandle');
        this.timeCurrent = document.getElementById('timeCurrent');
        this.timeTotal = document.getElementById('timeTotal');

        // Volume elements
        this.volumeBtn = document.getElementById('volumeBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeFill = document.getElementById('volumeFill');
        this.volumeHandle = document.getElementById('volumeHandle');

        // Like buttons
        this.likeBtn = document.getElementById('likeBtn');
        this.likeCurrentBtn = document.getElementById('likeCurrentBtn');

        // Display elements
        this.playerAlbumArt = document.getElementById('playerAlbumArt');
        this.playerTrackTitle = document.getElementById('playerTrackTitle');
        this.playerTrackArtist = document.getElementById('playerTrackArtist');
        this.currentAlbumArt = document.getElementById('currentAlbumArt');
        this.currentSongTitle = document.getElementById('currentSongTitle');
        this.currentSongArtist = document.getElementById('currentSongArtist');
    }

    initEventListeners() {
        // Audio events
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('ended', () => this.handleSongEnd());
        this.audio.addEventListener('play', () => this.updatePlayState(true));
        this.audio.addEventListener('pause', () => this.updatePlayState(false));
        this.audio.addEventListener('error', (e) => this.handleError(e));

        // Play/Pause buttons
        this.playPauseBtn?.addEventListener('click', () => this.togglePlay());
        this.miniPlayPauseBtn?.addEventListener('click', () => this.togglePlay());

        // Control buttons
        this.prevBtn?.addEventListener('click', () => this.playPrevious());
        this.nextBtn?.addEventListener('click', () => this.playNext());
        this.miniPrevBtn?.addEventListener('click', () => this.playPrevious());
        this.miniNextBtn?.addEventListener('click', () => this.playNext());
        this.shuffleBtn?.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn?.addEventListener('click', () => this.toggleRepeat());

        // Progress bar interaction
        this.progressBar?.addEventListener('click', (e) => this.seekTo(e));
        this.initProgressDrag();

        // Volume control
        this.volumeBtn?.addEventListener('click', () => this.toggleMute());
        this.volumeSlider?.addEventListener('click', (e) => this.setVolumeFromSlider(e));
        this.initVolumeDrag();

        // Like buttons
        this.likeBtn?.addEventListener('click', () => this.toggleLike());
        this.likeCurrentBtn?.addEventListener('click', () => this.toggleLike());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    initProgressDrag() {
        let isDragging = false;

        this.progressBar?.addEventListener('mousedown', (e) => {
            isDragging = true;
            this.seekTo(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                this.seekTo(e);
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    initVolumeDrag() {
        let isDragging = false;

        this.volumeSlider?.addEventListener('mousedown', (e) => {
            isDragging = true;
            this.setVolumeFromSlider(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                this.setVolumeFromSlider(e);
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    loadSong(song) {
        if (!song) return;

        this.currentSong = song;
        this.audio.src = song.audio;
        this.audio.load();

        // Update UI
        this.updateSongInfo(song);

        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('songLoaded', { detail: song }));
    }

    updateSongInfo(song) {
        // Player bar
        if (this.playerAlbumArt) this.playerAlbumArt.src = song.cover;
        if (this.playerTrackTitle) this.playerTrackTitle.textContent = song.title;
        if (this.playerTrackArtist) this.playerTrackArtist.textContent = song.artist;

        // Now playing panel
        if (this.currentAlbumArt) this.currentAlbumArt.src = song.cover;
        if (this.currentSongTitle) this.currentSongTitle.textContent = song.title;
        if (this.currentSongArtist) this.currentSongArtist.textContent = song.artist;

        // Update document title
        document.title = `${song.title} - ${song.artist} | Luminex`;

        // Update like button state
        this.updateLikeState();
    }

    play() {
        if (!this.currentSong) {
            // Play first song if none selected
            if (window.songsData && window.songsData.length > 0) {
                this.loadSong(window.songsData[0]);
            }
        }

        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Playback prevented:', error);
            });
        }
    }

    pause() {
        this.audio.pause();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    updatePlayState(playing) {
        this.isPlaying = playing;

        // Update play/pause button icons
        const playIcons = document.querySelectorAll('.play-icon');
        const pauseIcons = document.querySelectorAll('.pause-icon');

        playIcons.forEach(icon => {
            icon.style.display = playing ? 'none' : 'block';
        });
        pauseIcons.forEach(icon => {
            icon.style.display = playing ? 'block' : 'none';
        });

        // Dispatch event
        window.dispatchEvent(new CustomEvent('playStateChanged', { detail: playing }));
    }

    updateProgress() {
        if (!this.audio.duration) return;

        const progress = (this.audio.currentTime / this.audio.duration) * 100;

        if (this.progressFill) {
            this.progressFill.style.width = `${progress}%`;
        }
        if (this.progressHandle) {
            this.progressHandle.style.left = `${progress}%`;
        }
        if (this.timeCurrent) {
            this.timeCurrent.textContent = formatDuration(this.audio.currentTime);
        }

        // Dispatch event for lyrics sync
        window.dispatchEvent(new CustomEvent('timeUpdate', {
            detail: this.audio.currentTime
        }));
    }

    updateDuration() {
        if (this.timeTotal) {
            this.timeTotal.textContent = formatDuration(this.audio.duration);
        }
    }

    seekTo(e) {
        if (!this.progressBar || !this.audio.duration) return;

        const rect = this.progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.audio.currentTime = percent * this.audio.duration;
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        this.audio.volume = this.volume;

        // Update UI
        if (this.volumeFill) {
            this.volumeFill.style.width = `${this.volume * 100}%`;
        }
        if (this.volumeHandle) {
            this.volumeHandle.style.left = `${this.volume * 100}%`;
        }

        // Update icon
        this.updateVolumeIcon();
    }

    setVolumeFromSlider(e) {
        if (!this.volumeSlider) return;

        const rect = this.volumeSlider.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.setVolume(percent);

        if (this.isMuted && percent > 0) {
            this.isMuted = false;
        }
    }

    toggleMute() {
        if (this.isMuted) {
            this.setVolume(this.previousVolume);
            this.isMuted = false;
        } else {
            this.previousVolume = this.volume;
            this.setVolume(0);
            this.isMuted = true;
        }
        this.updateVolumeIcon();
    }

    updateVolumeIcon() {
        const volumeHigh = this.volumeBtn?.querySelector('.volume-high');
        const volumeMuted = this.volumeBtn?.querySelector('.volume-muted');

        if (this.volume === 0 || this.isMuted) {
            if (volumeHigh) volumeHigh.style.display = 'none';
            if (volumeMuted) volumeMuted.style.display = 'block';
        } else {
            if (volumeHigh) volumeHigh.style.display = 'block';
            if (volumeMuted) volumeMuted.style.display = 'none';
        }
    }

    playNext() {
        window.dispatchEvent(new CustomEvent('playNext'));
    }

    playPrevious() {
        // If more than 3 seconds in, restart current song
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
            return;
        }
        window.dispatchEvent(new CustomEvent('playPrevious'));
    }

    handleSongEnd() {
        if (this.repeatMode === 'one') {
            this.audio.currentTime = 0;
            this.play();
        } else {
            this.playNext();
        }
    }

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        this.shuffleBtn?.classList.toggle('active', this.isShuffled);
        window.dispatchEvent(new CustomEvent('shuffleChanged', {
            detail: this.isShuffled
        }));
    }

    toggleRepeat() {
        const modes = ['none', 'all', 'one'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];

        // Update button state
        this.repeatBtn?.classList.toggle('active', this.repeatMode !== 'none');

        // Add special styling for repeat one
        if (this.repeatMode === 'one') {
            this.repeatBtn?.setAttribute('data-mode', 'one');
        } else {
            this.repeatBtn?.removeAttribute('data-mode');
        }

        // Show toast
        const messages = {
            'none': 'Repeat off',
            'all': 'Repeat all',
            'one': 'Repeat one'
        };
        window.showToast?.(messages[this.repeatMode]);
    }

    toggleLike() {
        if (!this.currentSong) return;

        const isLiked = window.toggleFavorite?.(this.currentSong.id);
        this.updateLikeState();

        // Animate
        const btns = [this.likeBtn, this.likeCurrentBtn].filter(Boolean);
        btns.forEach(btn => {
            btn.classList.add('animate-heart');
            setTimeout(() => btn.classList.remove('animate-heart'), 500);
        });

        // Show toast
        window.showToast?.(isLiked ? 'Added to Liked Songs' : 'Removed from Liked Songs');
    }

    updateLikeState() {
        if (!this.currentSong) return;

        const isLiked = window.isFavorite?.(this.currentSong.id);

        [this.likeBtn, this.likeCurrentBtn].filter(Boolean).forEach(btn => {
            btn.classList.toggle('liked', isLiked);
        });
    }

    handleKeyboard(e) {
        // Don't trigger if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.audio.currentTime = Math.max(0, this.audio.currentTime - 10);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + 10);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.setVolume(this.volume + 0.1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.setVolume(this.volume - 0.1);
                break;
            case 'KeyM':
                this.toggleMute();
                break;
            case 'KeyS':
                this.toggleShuffle();
                break;
            case 'KeyR':
                this.toggleRepeat();
                break;
            case 'KeyL':
                this.toggleLike();
                break;
        }
    }

    handleError(e) {
        console.error('Audio playback error:', e);
        window.showToast?.('Error playing track', 'error');
    }

    // Get current state for other components
    getCurrentTime() {
        return this.audio.currentTime;
    }

    getDuration() {
        return this.audio.duration;
    }

    getAudioElement() {
        return this.audio;
    }
}

// Initialize and export
window.player = new AudioPlayer();
