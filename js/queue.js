/* ==========================================
   LUMINEX - Queue Management
   ========================================== */

class QueueManager {
    constructor() {
        this.queue = [];
        this.currentIndex = 0;
        this.originalQueue = [];
        this.isShuffled = false;
        this.history = [];

        this.init();
    }

    init() {
        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        this.queueSection = document.getElementById('queueSection');
        this.lyricsSection = document.getElementById('lyricsSection');
        this.queueList = document.getElementById('queueList');
        this.toggleQueueBtn = document.getElementById('toggleQueueBtn');
        this.clearQueueBtn = document.getElementById('clearQueueBtn');
        this.queueBtn = document.getElementById('queueBtn');
    }

    initEventListeners() {
        // Toggle queue panel
        this.toggleQueueBtn?.addEventListener('click', () => this.toggleQueuePanel());
        this.queueBtn?.addEventListener('click', () => this.toggleQueuePanel());

        // Clear queue
        this.clearQueueBtn?.addEventListener('click', () => this.clearQueue());

        // Listen for navigation events
        window.addEventListener('playNext', () => this.playNext());
        window.addEventListener('playPrevious', () => this.playPrevious());

        // Listen for shuffle changes
        window.addEventListener('shuffleChanged', (e) => {
            this.isShuffled = e.detail;
            if (this.isShuffled) {
                this.shuffleQueue();
            } else {
                this.unshuffleQueue();
            }
        });

        // Listen for song ended to update playing state
        window.addEventListener('songLoaded', (e) => {
            this.updatePlayingState(e.detail.id);
        });
    }

    setQueue(songs, startIndex = 0) {
        this.queue = [...songs];
        this.originalQueue = [...songs];
        this.currentIndex = startIndex;
        this.history = [];

        if (this.isShuffled) {
            this.shuffleQueue(startIndex);
        }

        this.render();
    }

    addToQueue(song) {
        if (!song) return;

        // Add after current song
        this.queue.splice(this.currentIndex + 1, 0, song);
        this.originalQueue.push(song);
        this.render();

        window.showToast?.(`Added "${song.title}" to queue`);
    }

    removeFromQueue(index) {
        if (index < 0 || index >= this.queue.length) return;
        if (index === this.currentIndex) return; // Can't remove currently playing

        this.queue.splice(index, 1);

        // Adjust current index if needed
        if (index < this.currentIndex) {
            this.currentIndex--;
        }

        this.render();
    }

    clearQueue() {
        const currentSong = this.queue[this.currentIndex];
        this.queue = currentSong ? [currentSong] : [];
        this.currentIndex = 0;
        this.render();

        window.showToast?.('Queue cleared');
    }

    playNext() {
        // Add current to history
        if (this.queue[this.currentIndex]) {
            this.history.push(this.queue[this.currentIndex]);
        }

        // Check repeat mode
        const repeatMode = window.player?.repeatMode || 'none';

        if (this.currentIndex < this.queue.length - 1) {
            this.currentIndex++;
            this.playCurrent();
        } else if (repeatMode === 'all') {
            // Loop back to beginning
            this.currentIndex = 0;
            this.playCurrent();
        } else {
            // End of queue
            window.player?.pause();
        }
    }

    playPrevious() {
        // If we have history and we're at the start of current song
        if (this.history.length > 0 && (window.player?.getCurrentTime() || 0) < 3) {
            const previousSong = this.history.pop();
            // Find in queue or add to beginning
            const index = this.queue.findIndex(s => s.id === previousSong.id);
            if (index > -1) {
                this.currentIndex = index;
            } else {
                this.queue.unshift(previousSong);
                this.currentIndex = 0;
            }
            this.playCurrent();
        } else if (this.currentIndex > 0) {
            this.currentIndex--;
            this.playCurrent();
        } else {
            // Restart current song
            window.player?.getAudioElement()?.currentTime = 0;
        }
    }

    playCurrent() {
        const song = this.queue[this.currentIndex];
        if (song) {
            window.player?.loadSong(song);
            window.player?.play();
            this.render();
        }
    }

    playAtIndex(index) {
        if (index < 0 || index >= this.queue.length) return;

        this.currentIndex = index;
        this.playCurrent();
    }

    shuffleQueue(keepCurrentAtStart = true) {
        if (this.queue.length <= 1) return;

        const currentSong = this.queue[this.currentIndex];

        // Fisher-Yates shuffle
        for (let i = this.queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
        }

        // Move current song to front if needed
        if (keepCurrentAtStart && currentSong) {
            const currentIndex = this.queue.findIndex(s => s.id === currentSong.id);
            if (currentIndex > 0) {
                this.queue.splice(currentIndex, 1);
                this.queue.unshift(currentSong);
            }
            this.currentIndex = 0;
        }

        this.render();
    }

    unshuffleQueue() {
        const currentSong = this.queue[this.currentIndex];
        this.queue = [...this.originalQueue];

        // Find current song's position in original queue
        if (currentSong) {
            this.currentIndex = this.queue.findIndex(s => s.id === currentSong.id);
            if (this.currentIndex === -1) this.currentIndex = 0;
        }

        this.render();
    }

    toggleQueuePanel() {
        const isQueueVisible = this.queueSection?.style.display !== 'none';

        if (this.queueSection && this.lyricsSection) {
            if (isQueueVisible) {
                // Show lyrics, hide queue
                this.queueSection.style.display = 'none';
                this.lyricsSection.style.display = 'flex';
                this.toggleQueueBtn?.classList.remove('active');
                this.queueBtn?.classList.remove('active');
            } else {
                // Show queue, hide lyrics
                this.queueSection.style.display = 'flex';
                this.lyricsSection.style.display = 'none';
                this.toggleQueueBtn?.classList.add('active');
                this.queueBtn?.classList.add('active');
            }
        }
    }

    updatePlayingState(songId) {
        // Update current index if song is in queue
        const index = this.queue.findIndex(s => s.id === songId);
        if (index > -1) {
            this.currentIndex = index;
        }
        this.render();
    }

    render() {
        if (!this.queueList) return;

        if (this.queue.length === 0) {
            this.queueList.innerHTML = `
                <div class="empty-state" style="padding: 20px; text-align: center; color: var(--text-muted);">
                    <p>Queue is empty</p>
                </div>
            `;
            return;
        }

        // Split into current and upcoming
        const upcomingSongs = this.queue.slice(this.currentIndex + 1);

        let html = '';

        // Now Playing indicator
        const currentSong = this.queue[this.currentIndex];
        if (currentSong) {
            html += `
                <div class="queue-now-playing" style="padding: 8px; margin-bottom: 8px; border-bottom: 1px solid var(--glass-border);">
                    <span style="font-size: 0.75rem; color: var(--accent-primary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Now Playing</span>
                </div>
                <div class="queue-item playing" style="background: var(--glass-bg-active);">
                    <img src="${currentSong.cover}" alt="${currentSong.title}" class="queue-item-cover">
                    <div class="queue-item-info">
                        <span class="queue-item-title" style="color: var(--accent-primary);">${currentSong.title}</span>
                        <span class="queue-item-artist">${currentSong.artist}</span>
                    </div>
                    <div class="equalizer" style="margin-left: auto;">
                        <div class="equalizer-bar"></div>
                        <div class="equalizer-bar"></div>
                        <div class="equalizer-bar"></div>
                    </div>
                </div>
            `;
        }

        // Next Up
        if (upcomingSongs.length > 0) {
            html += `
                <div class="queue-next-up" style="padding: 8px; margin-top: 16px; margin-bottom: 8px; border-bottom: 1px solid var(--glass-border);">
                    <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Next Up</span>
                </div>
            `;

            upcomingSongs.forEach((song, idx) => {
                const actualIndex = this.currentIndex + 1 + idx;
                html += `
                    <div class="queue-item" data-index="${actualIndex}">
                        <img src="${song.cover}" alt="${song.title}" class="queue-item-cover">
                        <div class="queue-item-info">
                            <span class="queue-item-title">${song.title}</span>
                            <span class="queue-item-artist">${song.artist}</span>
                        </div>
                        <button class="icon-btn queue-item-remove" data-index="${actualIndex}" title="Remove">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                `;
            });
        }

        this.queueList.innerHTML = html;

        // Add event listeners
        this.queueList.querySelectorAll('.queue-item:not(.playing)').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.queue-item-remove')) {
                    const index = parseInt(item.dataset.index);
                    this.playAtIndex(index);
                }
            });
        });

        this.queueList.querySelectorAll('.queue-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                this.removeFromQueue(index);
            });
        });
    }

    // Get queue state
    getQueue() {
        return this.queue;
    }

    getCurrentSong() {
        return this.queue[this.currentIndex];
    }

    getCurrentIndex() {
        return this.currentIndex;
    }

    isEmpty() {
        return this.queue.length === 0;
    }
}

// Initialize and export
window.queue = new QueueManager();
