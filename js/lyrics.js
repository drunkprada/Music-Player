/* ==========================================
   LUMINEX - Lyrics Sync & Display
   ========================================== */

class LyricsManager {
    constructor() {
        this.currentLyrics = [];
        this.currentLineIndex = -1;
        this.isExpanded = false;

        this.init();
    }

    init() {
        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        this.lyricsContainer = document.getElementById('lyricsContainer');
        this.lyricsContent = document.getElementById('lyricsContent');
        this.expandLyricsBtn = document.getElementById('expandLyricsBtn');
        this.lyricsToggleBtn = document.getElementById('lyricsToggleBtn');
        this.lyricsSection = document.getElementById('lyricsSection');
    }

    initEventListeners() {
        // Listen for song changes
        window.addEventListener('songLoaded', (e) => {
            this.loadLyrics(e.detail);
        });

        // Listen for time updates
        window.addEventListener('timeUpdate', (e) => {
            this.syncLyrics(e.detail);
        });

        // Expand/collapse lyrics
        this.expandLyricsBtn?.addEventListener('click', () => {
            this.toggleExpanded();
        });

        // Toggle lyrics panel visibility
        this.lyricsToggleBtn?.addEventListener('click', () => {
            this.toggleLyricsPanel();
        });
    }

    loadLyrics(song) {
        if (!song || !song.lyrics || song.lyrics.length === 0) {
            this.currentLyrics = [];
            this.renderNoLyrics();
            return;
        }

        this.currentLyrics = song.lyrics;
        this.currentLineIndex = -1;
        this.render();
    }

    render() {
        if (!this.lyricsContent) return;

        if (this.currentLyrics.length === 0) {
            this.renderNoLyrics();
            return;
        }

        this.lyricsContent.innerHTML = this.currentLyrics.map((line, index) => `
            <p class="lyrics-line" data-index="${index}" data-time="${line.time}">
                ${line.text || '&nbsp;'}
            </p>
        `).join('');

        // Add click handlers for seeking
        this.lyricsContent.querySelectorAll('.lyrics-line').forEach(line => {
            line.addEventListener('click', () => {
                const time = parseFloat(line.dataset.time);
                if (!isNaN(time)) {
                    const audio = window.player?.getAudioElement();
                    if (audio) {
                        audio.currentTime = time;
                    }
                }
            });
        });
    }

    renderNoLyrics() {
        if (!this.lyricsContent) return;

        this.lyricsContent.innerHTML = `
            <div class="no-lyrics">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.3;">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                </svg>
                <p>No lyrics available for this track</p>
            </div>
        `;
    }

    syncLyrics(currentTime) {
        if (this.currentLyrics.length === 0) return;

        // Find the current line
        let newIndex = -1;
        for (let i = this.currentLyrics.length - 1; i >= 0; i--) {
            if (currentTime >= this.currentLyrics[i].time) {
                newIndex = i;
                break;
            }
        }

        // Only update if line changed
        if (newIndex !== this.currentLineIndex) {
            this.currentLineIndex = newIndex;
            this.highlightCurrentLine();
        }
    }

    highlightCurrentLine() {
        if (!this.lyricsContent) return;

        const lines = this.lyricsContent.querySelectorAll('.lyrics-line');

        lines.forEach((line, index) => {
            if (index === this.currentLineIndex) {
                line.classList.add('active');
                this.scrollToLine(line);
            } else {
                line.classList.remove('active');
            }
        });
    }

    scrollToLine(lineElement) {
        if (!this.lyricsContainer || !lineElement) return;

        const containerHeight = this.lyricsContainer.clientHeight;
        const lineTop = lineElement.offsetTop;
        const lineHeight = lineElement.offsetHeight;

        // Center the line in the container
        const scrollTo = lineTop - (containerHeight / 2) + (lineHeight / 2);

        this.lyricsContainer.scrollTo({
            top: scrollTo,
            behavior: 'smooth'
        });
    }

    toggleExpanded() {
        this.isExpanded = !this.isExpanded;

        if (this.isExpanded) {
            this.showExpandedLyrics();
        } else {
            this.hideExpandedLyrics();
        }
    }

    showExpandedLyrics() {
        // Create fullscreen lyrics overlay
        const overlay = document.createElement('div');
        overlay.id = 'lyricsOverlay';
        overlay.className = 'lyrics-overlay';
        overlay.innerHTML = `
            <div class="lyrics-overlay-content">
                <button class="icon-btn close-lyrics-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
                <div class="lyrics-overlay-scroll">
                    <div class="lyrics-overlay-text">
                        ${this.currentLyrics.map((line, index) => `
                            <p class="lyrics-line-large ${index === this.currentLineIndex ? 'active' : ''}"
                               data-index="${index}"
                               data-time="${line.time}">
                                ${line.text || '&nbsp;'}
                            </p>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.id = 'lyricsOverlayStyles';
        style.textContent = `
            .lyrics-overlay {
                position: fixed;
                inset: 0;
                background: rgba(10, 10, 15, 0.98);
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }

            .lyrics-overlay-content {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                padding: 40px;
            }

            .close-lyrics-btn {
                position: absolute;
                top: 24px;
                right: 24px;
                width: 48px;
                height: 48px;
                z-index: 10;
            }

            .close-lyrics-btn svg {
                width: 28px;
                height: 28px;
            }

            .lyrics-overlay-scroll {
                flex: 1;
                overflow-y: auto;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 100px 0;
            }

            .lyrics-overlay-text {
                text-align: center;
                max-width: 800px;
            }

            .lyrics-line-large {
                font-size: 2rem;
                line-height: 2.5;
                color: var(--text-muted);
                transition: all 0.3s ease;
                cursor: pointer;
                padding: 8px 16px;
                border-radius: 8px;
            }

            .lyrics-line-large:hover {
                color: var(--text-secondary);
                background: var(--glass-bg-hover);
            }

            .lyrics-line-large.active {
                color: var(--text-primary);
                font-size: 2.5rem;
                font-weight: 600;
                text-shadow: 0 0 40px var(--accent-primary);
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(overlay);

        // Add event listeners
        overlay.querySelector('.close-lyrics-btn').addEventListener('click', () => {
            this.hideExpandedLyrics();
        });

        // Click to seek
        overlay.querySelectorAll('.lyrics-line-large').forEach(line => {
            line.addEventListener('click', () => {
                const time = parseFloat(line.dataset.time);
                if (!isNaN(time)) {
                    const audio = window.player?.getAudioElement();
                    if (audio) {
                        audio.currentTime = time;
                    }
                }
            });
        });

        // Setup sync for expanded lyrics
        this.expandedLyricsOverlay = overlay;
    }

    hideExpandedLyrics() {
        this.isExpanded = false;

        const overlay = document.getElementById('lyricsOverlay');
        const style = document.getElementById('lyricsOverlayStyles');

        if (overlay) {
            overlay.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => overlay.remove(), 300);
        }
        if (style) style.remove();

        this.expandedLyricsOverlay = null;
    }

    toggleLyricsPanel() {
        const nowPlayingPanel = document.getElementById('nowPlayingPanel');
        const queueSection = document.getElementById('queueSection');
        const lyricsSection = document.getElementById('lyricsSection');

        if (!nowPlayingPanel) return;

        // Toggle visibility
        const isVisible = nowPlayingPanel.style.display !== 'none';

        if (isVisible) {
            // Make sure lyrics are showing
            if (lyricsSection && queueSection) {
                lyricsSection.style.display = 'flex';
                queueSection.style.display = 'none';
            }
        }

        this.lyricsToggleBtn?.classList.toggle('active', isVisible);
    }

    // Update expanded lyrics if visible
    updateExpandedLyrics() {
        if (!this.expandedLyricsOverlay) return;

        const lines = this.expandedLyricsOverlay.querySelectorAll('.lyrics-line-large');
        lines.forEach((line, index) => {
            if (index === this.currentLineIndex) {
                line.classList.add('active');

                // Scroll to active line
                line.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            } else {
                line.classList.remove('active');
            }
        });
    }

    // Enhanced lyrics with word-by-word highlighting (karaoke style)
    // Note: This requires word-level timing data which we don't have in our sample data
    highlightWords(currentTime) {
        // This would be used if we had word-level timing
        // For now, we stick to line-level highlighting
    }
}

// Initialize and export
window.lyrics = new LyricsManager();

// Add CSS animation for fadeOut
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(fadeOutStyle);
