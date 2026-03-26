/* ==========================================
   LUMINEX - Animation Utilities & 3D Effects
   ========================================== */

class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        this.initCardTilt();
        this.initAlbumArt3D();
        this.initRippleEffect();
        this.initParallax();
        this.initHoverEffects();
        this.initScrollAnimations();
    }

    // 3D Card Tilt Effect
    initCardTilt() {
        document.addEventListener('mousemove', (e) => {
            const cards = document.querySelectorAll('.card, .featured-card');

            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Check if mouse is over this card
                if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    const rotateX = ((y - centerY) / centerY) * -8;
                    const rotateY = ((x - centerX) / centerX) * 8;

                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
                    card.style.transition = 'transform 0.1s ease';
                }
            });
        });

        // Reset on mouse leave
        document.addEventListener('mouseleave', () => {
            const cards = document.querySelectorAll('.card, .featured-card');
            cards.forEach(card => {
                card.style.transform = '';
                card.style.transition = 'transform 0.3s ease';
            });
        }, true);

        // Add listener to reset individual cards
        document.querySelectorAll('.card, .featured-card').forEach(card => {
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.transition = 'transform 0.3s ease';
            });
        });
    }

    // 3D Album Art Effect
    initAlbumArt3D() {
        const albumArt3D = document.getElementById('albumArt3D');
        if (!albumArt3D) return;

        const container = albumArt3D.parentElement;

        container?.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            albumArt3D.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        container?.addEventListener('mouseleave', () => {
            albumArt3D.style.transform = '';
        });
    }

    // Ripple Effect on Buttons
    initRippleEffect() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.btn, .play-all-btn, .icon-btn, .nav-item');
            if (!target) return;

            // Create ripple element
            const ripple = document.createElement('span');
            ripple.className = 'ripple';

            const rect = target.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);

            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

            target.style.position = 'relative';
            target.style.overflow = 'hidden';
            target.appendChild(ripple);

            // Remove after animation
            setTimeout(() => ripple.remove(), 600);
        });
    }

    // Parallax Effect on Background Orbs
    initParallax() {
        const orbs = document.querySelectorAll('.gradient-orb');
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // Smooth animation loop
        const animate = () => {
            currentX += (mouseX - currentX) * 0.05;
            currentY += (mouseY - currentY) * 0.05;

            orbs.forEach((orb, index) => {
                const depth = (index + 1) * 15;
                const x = currentX * depth;
                const y = currentY * depth;

                orb.style.transform = `translate(${x}px, ${y}px)`;
            });

            requestAnimationFrame(animate);
        };

        animate();
    }

    // Enhanced Hover Effects
    initHoverEffects() {
        // Glow effect on hover for buttons
        const glowElements = document.querySelectorAll('.play-all-btn, .main-play-btn');

        glowElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.style.boxShadow = '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)';
            });

            el.addEventListener('mouseleave', () => {
                el.style.boxShadow = '';
            });
        });

        // Scale effect on song rows
        document.addEventListener('mouseenter', (e) => {
            if (e.target.classList.contains('song-row')) {
                e.target.style.transform = 'scale(1.01)';
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('song-row')) {
                e.target.style.transform = '';
            }
        }, true);
    }

    // Scroll-triggered Animations
    initScrollAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements with specific classes
        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });
    }

    // Progress Bar Glow Animation
    animateProgressGlow(progress) {
        const progressFill = document.getElementById('progressFill');
        if (!progressFill) return;

        // Add glow effect based on progress
        const glowIntensity = Math.sin(progress * Math.PI) * 0.5 + 0.5;
        progressFill.style.boxShadow = `0 0 ${10 + glowIntensity * 10}px rgba(139, 92, 246, ${0.3 + glowIntensity * 0.4})`;
    }

    // Album Art Spin Animation (when playing)
    startAlbumSpin() {
        const albumWrapper = document.querySelector('.album-art-wrapper');
        if (albumWrapper) {
            albumWrapper.style.animation = 'spin 20s linear infinite';
        }
    }

    stopAlbumSpin() {
        const albumWrapper = document.querySelector('.album-art-wrapper');
        if (albumWrapper) {
            albumWrapper.style.animation = '';
        }
    }

    // Staggered Animation Helper
    staggerAnimation(elements, animation, delay = 50) {
        elements.forEach((el, index) => {
            el.style.animationDelay = `${index * delay}ms`;
            el.classList.add(animation);
        });
    }

    // Page Transition Animation
    pageTransition(fromView, toView) {
        if (fromView) {
            fromView.style.animation = 'fadeOut 0.2s ease forwards';
            setTimeout(() => {
                fromView.classList.remove('active');
                fromView.style.animation = '';
            }, 200);
        }

        setTimeout(() => {
            toView.classList.add('active');
            toView.style.animation = 'fadeInUp 0.3s ease forwards';

            // Animate child elements
            const staggerItems = toView.querySelectorAll('.stagger-item');
            this.staggerAnimation(staggerItems, 'animate-fade-in-up', 30);
        }, fromView ? 200 : 0);
    }

    // Toast Animation
    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // Remove after animation
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Shake Animation (for errors)
    shake(element) {
        element.classList.add('animate-shake');
        setTimeout(() => element.classList.remove('animate-shake'), 500);
    }

    // Bounce Animation
    bounce(element) {
        element.classList.add('animate-bounce');
        setTimeout(() => element.classList.remove('animate-bounce'), 1000);
    }

    // Pulse Animation
    pulse(element) {
        element.classList.add('animate-pulse');
    }

    stopPulse(element) {
        element.classList.remove('animate-pulse');
    }

    // Heart Animation for likes
    heartAnimation(element) {
        element.classList.add('animate-heart');
        setTimeout(() => element.classList.remove('animate-heart'), 500);
    }
}

// Mouse Trail Effect (subtle)
class MouseTrail {
    constructor() {
        this.dots = [];
        this.dotCount = 10;
        this.mouseX = 0;
        this.mouseY = 0;

        // Disabled by default for performance
        // this.init();
    }

    init() {
        // Create dot elements
        for (let i = 0; i < this.dotCount; i++) {
            const dot = document.createElement('div');
            dot.className = 'mouse-trail-dot';
            dot.style.cssText = `
                position: fixed;
                width: ${8 - i * 0.5}px;
                height: ${8 - i * 0.5}px;
                background: linear-gradient(135deg, #8b5cf6, #06b6d4);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                opacity: ${1 - i * 0.1};
                transition: transform 0.1s ease;
            `;
            document.body.appendChild(dot);
            this.dots.push({ el: dot, x: 0, y: 0 });
        }

        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        this.animate();
    }

    animate() {
        let x = this.mouseX;
        let y = this.mouseY;

        this.dots.forEach((dot, index) => {
            const nextDot = this.dots[index + 1] || this.dots[0];

            dot.x = x;
            dot.y = y;

            dot.el.style.left = `${dot.x}px`;
            dot.el.style.top = `${dot.y}px`;

            x += (nextDot.x - x) * 0.4;
            y += (nextDot.y - y) * 0.4;
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Smooth Number Counter Animation
function animateNumber(element, start, end, duration = 1000) {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (end - start) * easeOutQuart);

        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// Initialize
window.animations = new AnimationManager();

// Export toast function globally
window.showToast = (message, type) => window.animations.showToast(message, type);

// Export animation functions
window.animateNumber = animateNumber;
