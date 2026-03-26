/* ==========================================
   LUMINEX - Audio Visualizer (Web Audio API)
   ========================================== */

class AudioVisualizer {
    constructor() {
        this.canvas = document.getElementById('visualizerCanvas');
        this.ctx = this.canvas?.getContext('2d');
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.source = null;
        this.isInitialized = false;
        this.animationId = null;
        this.isPlaying = false;

        // Visualizer settings
        this.settings = {
            barCount: 64,
            sensitivity: 1.5,
            smoothing: 0.8,
            circularRadius: 0.35,
            particleCount: 50,
            theme: 'default'
        };

        // Particles for effects
        this.particles = [];

        // Colors
        this.colors = {
            primary: '#8b5cf6',
            secondary: '#06b6d4',
            pink: '#ec4899'
        };

        this.init();
    }

    init() {
        if (!this.canvas || !this.ctx) return;

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Listen for play state changes
        window.addEventListener('playStateChanged', (e) => {
            this.isPlaying = e.detail;
            if (this.isPlaying) {
                this.initAudioContext();
                this.startVisualization();
            } else {
                this.stopVisualization();
            }
        });

        // Listen for song changes
        window.addEventListener('songLoaded', () => {
            if (this.isInitialized) {
                this.reconnectSource();
            }
        });

        // Initialize particles
        this.initParticles();
    }

    resizeCanvas() {
        if (!this.canvas) return;

        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.offsetWidth * 1.2;
            this.canvas.height = container.offsetHeight * 1.2;
        }
    }

    async initAudioContext() {
        if (this.isInitialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();

            // Configure analyser
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = this.settings.smoothing;

            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

            // Connect audio source
            this.connectSource();
            this.isInitialized = true;

        } catch (error) {
            console.error('Failed to initialize audio context:', error);
        }
    }

    connectSource() {
        const audioElement = window.player?.getAudioElement();
        if (!audioElement || !this.audioContext) return;

        try {
            // Create source from audio element
            this.source = this.audioContext.createMediaElementSource(audioElement);

            // Connect: source -> analyser -> destination
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

        } catch (error) {
            // Source might already be connected
            console.log('Audio source connection:', error.message);
        }
    }

    reconnectSource() {
        // For song changes, we don't need to reconnect since we're using the same audio element
        if (this.audioContext?.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    startVisualization() {
        if (!this.isInitialized || this.animationId) return;

        if (this.audioContext?.state === 'suspended') {
            this.audioContext.resume();
        }

        this.animate();
    }

    stopVisualization() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Draw idle state
        this.drawIdleState();
    }

    animate() {
        if (!this.analyser || !this.ctx) return;

        this.animationId = requestAnimationFrame(() => this.animate());

        // Get frequency data
        this.analyser.getByteFrequencyData(this.dataArray);

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw visualizations
        this.drawCircularVisualizer();
        this.drawParticles();
        this.drawGlow();
    }

    drawCircularVisualizer() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * this.settings.circularRadius;
        const barCount = this.settings.barCount;

        // Create gradient
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, this.colors.primary);
        gradient.addColorStop(0.5, this.colors.secondary);
        gradient.addColorStop(1, this.colors.pink);

        for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor(i * (this.dataArray.length / barCount));
            const value = this.dataArray[dataIndex];
            const normalizedValue = value / 255;

            const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
            const barHeight = normalizedValue * radius * this.settings.sensitivity;

            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + barHeight);
            const y2 = centerY + Math.sin(angle) * (radius + barHeight);

            // Draw bar
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();

            // Add glow effect for high values
            if (normalizedValue > 0.7) {
                this.ctx.shadowColor = this.colors.primary;
                this.ctx.shadowBlur = 15;
                this.ctx.stroke();
                this.ctx.shadowBlur = 0;
            }
        }

        // Draw inner circle glow
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius - 10, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawParticles() {
        const avgFrequency = this.getAverageFrequency();

        // Spawn new particles on beats
        if (avgFrequency > 180 && Math.random() > 0.7) {
            this.spawnParticle();
        }

        // Update and draw particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            particle.draw(this.ctx);
            return particle.alpha > 0;
        });
    }

    drawGlow() {
        const avgFrequency = this.getAverageFrequency();
        const normalizedAvg = avgFrequency / 255;

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.6;

        // Draw radial glow
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius * (1 + normalizedAvg * 0.3)
        );

        gradient.addColorStop(0, `rgba(139, 92, 246, ${normalizedAvg * 0.3})`);
        gradient.addColorStop(0.5, `rgba(6, 182, 212, ${normalizedAvg * 0.15})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawIdleState() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * this.settings.circularRadius;

        // Draw subtle ring
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw inner glow
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    initParticles() {
        this.particles = [];
    }

    spawnParticle() {
        if (this.particles.length > this.settings.particleCount) return;

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.min(centerX, centerY) * this.settings.circularRadius;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        this.particles.push(new Particle(x, y, angle, this.colors));
    }

    getAverageFrequency() {
        if (!this.dataArray) return 0;

        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        return sum / this.dataArray.length;
    }

    // Theme support
    setTheme(theme) {
        this.settings.theme = theme;

        const themes = {
            default: {
                primary: '#8b5cf6',
                secondary: '#06b6d4',
                pink: '#ec4899'
            },
            neon: {
                primary: '#00ff88',
                secondary: '#00ccff',
                pink: '#ff00ff'
            },
            fire: {
                primary: '#ff4500',
                secondary: '#ff8c00',
                pink: '#ffd700'
            },
            ocean: {
                primary: '#0077be',
                secondary: '#00bcd4',
                pink: '#00ffff'
            }
        };

        this.colors = themes[theme] || themes.default;
    }
}

// Particle class for effects
class Particle {
    constructor(x, y, angle, colors) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 2 + Math.random() * 3;
        this.size = 2 + Math.random() * 4;
        this.alpha = 1;
        this.decay = 0.02 + Math.random() * 0.02;
        this.colors = colors;
        this.color = this.getRandomColor();
    }

    getRandomColor() {
        const colors = [this.colors.primary, this.colors.secondary, this.colors.pink];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.alpha -= this.decay;
        this.size *= 0.98;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
    }
}

// Bar Spectrum Visualizer (for bottom of screen)
class SpectrumVisualizer {
    constructor() {
        this.container = null;
        this.bars = [];
        this.barCount = 64;

        this.createSpectrum();
    }

    createSpectrum() {
        // Create spectrum container
        this.container = document.createElement('div');
        this.container.className = 'spectrum-visualizer';

        for (let i = 0; i < this.barCount; i++) {
            const bar = document.createElement('div');
            bar.className = 'spectrum-bar';
            this.container.appendChild(bar);
            this.bars.push(bar);
        }

        document.body.appendChild(this.container);
    }

    update(dataArray) {
        if (!dataArray || !this.bars.length) return;

        for (let i = 0; i < this.bars.length; i++) {
            const dataIndex = Math.floor(i * (dataArray.length / this.bars.length));
            const value = dataArray[dataIndex] / 255;
            this.bars[i].style.transform = `scaleY(${0.1 + value * 0.9})`;
        }
    }

    show() {
        this.container.style.opacity = '1';
    }

    hide() {
        this.container.style.opacity = '0';
    }
}

// Initialize visualizers
window.visualizer = new AudioVisualizer();
// window.spectrumVisualizer = new SpectrumVisualizer();
