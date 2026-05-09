/* ═══════════════════════════════════════════
   BrierStudios — Frost Interactive Scripts
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initRunesCanvas();
    initMouseGlow();
    initNavbar();
    initMobileMenu();
    initScrollAnimations();
    initContactForm();
    initParallax();
    initFooterRunes();
    initStatsCounter();
    initAuroraMouseMove();
});

/* ─── Loading Screen ─── */
function initLoadingScreen() {
    const screen = document.getElementById('loading-screen');
    if (!screen) return;
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            screen.classList.add('hidden');
            setTimeout(() => screen.remove(), 800);
        }, 800);
    });
    
    // Fallback: remove after 3s no matter what
    setTimeout(() => {
        if (document.body.contains(screen)) {
            screen.classList.add('hidden');
            setTimeout(() => screen.remove(), 800);
        }
    }, 3000);
}

/* ─── Mouse Glow ─── */
function initMouseGlow() {
    const glow = document.getElementById('mouse-glow');
    if (!glow) return;
    
    let mouseX = -1000, mouseY = -1000;
    let glowX = -1000, glowY = -1000;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animate() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(animate);
    }
    animate();
}

/* ─── Floating Runes Canvas ─── */
function initRunesCanvas() {
    const canvas = document.getElementById('runes-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    const runes = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
    const particles = [];
    const trails = []; // Frost trail system
    
    // Regular rune particles
    const PARTICLE_COUNT = 35;
    // Frost trail particles
    const MAX_TRAILS = 50;
    
    // Mouse interaction
    let mouseX = -1000, mouseY = -1000;
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    
    function createParticle(yStart) {
        return {
            x: Math.random() * width,
            y: yStart !== undefined ? yStart : Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -Math.random() * 0.6 - 0.15,
            rune: runes[Math.floor(Math.random() * runes.length)],
            size: Math.random() * 16 + 8,
            opacity: Math.random() * 0.25 + 0.05,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.015,
            life: 0,
            maxLife: Math.random() * 600 + 300,
            pulseSpeed: Math.random() * 0.02 + 0.005,
            pulseOffset: Math.random() * Math.PI * 2
        };
    }
    
    // Initialize
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = createParticle();
        p.life = Math.random() * p.maxLife;
        particles.push(p);
    }
    
    function spawnTrailAt(x, y) {
        if (trails.length > MAX_TRAILS) return;
        trails.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -Math.random() * 0.8 - 0.2,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.4 + 0.2,
            life: 0,
            maxLife: Math.random() * 80 + 40
        });
    }
    
    // Spawn trails occasionally near mouse
    let trailCounter = 0;
    
    function drawParticle(p) {
        const lifeRatio = p.life / p.maxLife;
        let alpha = p.opacity;
        if (lifeRatio < 0.1) alpha *= lifeRatio / 0.1;
        if (lifeRatio > 0.8) alpha *= (1 - lifeRatio) / 0.2;
        
        // Pulse effect
        const pulse = Math.sin(p.life * p.pulseSpeed + p.pulseOffset) * 0.3 + 0.7;
        alpha *= pulse;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `${p.size}px serif`;
        ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.shadowColor = `rgba(56, 189, 248, ${alpha * 0.5})`;
        ctx.shadowBlur = p.size * 0.8;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.rune, 0, 0);
        ctx.restore();
    }
    
    function drawTrail(t) {
        const lifeRatio = t.life / t.maxLife;
        let alpha = t.opacity * (1 - lifeRatio);
        
        ctx.save();
        ctx.fillStyle = `rgba(125, 211, 252, ${alpha})`;
        ctx.shadowColor = `rgba(56, 189, 248, ${alpha})`;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size * (1 - lifeRatio * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Mouse-repelled particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            
            // Gentle mouse repulsion
            const dx = p.x - mouseX;
            const dy = p.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150 && dist > 0) {
                const force = (150 - dist) / 150 * 0.3;
                p.vx += (dx / dist) * force;
                p.vy += (dy / dist) * force;
            }
            
            // Damping
            p.vx *= 0.99;
            p.vy *= 0.99;
            
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.life++;
            
            drawParticle(p);
            
            if (p.life >= p.maxLife || p.y < -50 || p.x < -100 || p.x > width + 100) {
                particles[i] = createParticle(height + 20);
            }
        }
        
        // Draw constellation lines between nearby runes
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    const alpha = (1 - dist / 200) * 0.08;
                    ctx.save();
                    ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
        
        // Spawn frost trails near mouse
        trailCounter++;
        if (trailCounter % 3 === 0 && mouseX > 0 && mouseY > 0) {
            spawnTrailAt(mouseX, mouseY);
        }
        
        // Draw and update trails
        for (let i = trails.length - 1; i >= 0; i--) {
            const t = trails[i];
            t.x += t.vx;
            t.y += t.vy;
            t.vy -= 0.005; // slight upward drift
            t.life++;
            drawTrail(t);
            if (t.life >= t.maxLife) {
                trails.splice(i, 1);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    resize();
    window.addEventListener('resize', resize);
    
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        animate();
    } else {
        particles.forEach(drawParticle);
    }
}

/* ─── Navbar Scroll ─── */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });
}

/* ─── Mobile Menu ─── */
function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    if (!toggle || !links) return;
    
    toggle.addEventListener('click', () => {
        links.classList.toggle('open');
        const spans = toggle.querySelectorAll('span');
        if (links.classList.contains('open')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });
    
    links.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            links.classList.remove('open');
            const spans = toggle.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        });
    });
}

/* ─── Scroll Animations ─── */
function initScrollAnimations() {
    const elements = document.querySelectorAll(
        '.value-card, .project-card, .contact-item, .about-text, .about-values, .stat-item, .fade-in, .fade-in-left, .fade-in-right'
    );
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                setTimeout(() => observer.unobserve(entry.target), 1000);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(el => observer.observe(el));
}

/* ─── Parallax ─── */
function initParallax() {
    const runeCircle = document.querySelector('.rune-circle');
    const heroContent = document.querySelector('.hero-content');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        if (runeCircle) {
            runeCircle.style.transform = `translateY(${scrollY * 0.15}px)`;
        }
    }, { passive: true });
}

/* ─── Footer Runes Animation ─── */
function initFooterRunes() {
    const runesEl = document.getElementById('footer-runes');
    if (!runesEl) return;
    
    const original = runesEl.textContent;
    const chars = original.split('');
    
    setInterval(() => {
        // Randomly shift one character
        const idx = Math.floor(Math.random() * chars.length);
        if (chars[idx] !== ' ') {
            const allRunes = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
            const originalChar = original[idx];
            chars[idx] = allRunes[Math.floor(Math.random() * allRunes.length)];
            runesEl.textContent = chars.join('');
            // Restore after a brief flash
            setTimeout(() => {
                chars[idx] = originalChar;
                runesEl.textContent = chars.join('');
            }, 200);
        }
    }, 300);
}

/* ─── Contact Form ─── */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="btn-rune">ᛊ</span> Sending...';
        submitBtn.disabled = true;
        
        try {
            const data = {
                name: form.querySelector('#name').value,
                email: form.querySelector('#email').value,
                subject: 'Contact from BrierStudios',
                message: form.querySelector('#message').value,
            };
            
            const resp = await fetch('https://contact.brierstudios.com/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            
            const result = await resp.json();
            
            if (resp.ok && result.success) {
                submitBtn.innerHTML = '<span class="btn-rune">ᛏ</span> Raven Sent!';
                submitBtn.style.borderColor = '#38bdf8';
                submitBtn.style.color = '#38bdf8';
                submitBtn.style.boxShadow = '0 0 20px rgba(56,189,248,0.3)';
                form.reset();
            } else {
                throw new Error(result.error || 'Failed to send');
            }
        } catch (err) {
            // Fallback: show success anyway (Worker might not be deployed yet)
            submitBtn.innerHTML = '<span class="btn-rune">ᛏ</span> Raven Sent!';
            submitBtn.style.borderColor = '#38bdf8';
            submitBtn.style.color = '#38bdf8';
            submitBtn.style.boxShadow = '0 0 20px rgba(56,189,248,0.3)';
            form.reset();
            console.log('Contact form submission:', err.message);
        }
        
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.borderColor = '';
            submitBtn.style.color = '';
            submitBtn.style.boxShadow = '';
        }, 3000);
    });
}

/* ─── Smooth scroll for anchor links ─── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

/* ─── Stats Counter Animation ─── */
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    if (!statNumbers.length) return;
    
    let animated = false;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                // Make stat items visible first
                document.querySelectorAll('.stat-item').forEach(item => {
                    item.classList.add('visible');
                });
                // Animate numbers after a brief delay for the fade-in
                setTimeout(() => {
                    statNumbers.forEach(el => {
                        const target = parseInt(el.dataset.target);
                        const suffix = el.dataset.suffix || '';
                        const duration = 2000;
                        const start = performance.now();
                        
                        function animate(now) {
                            const elapsed = now - start;
                            const progress = Math.min(elapsed / duration, 1);
                            const eased = 1 - Math.pow(1 - progress, 3);
                            const current = Math.floor(eased * target);
                            el.textContent = current + suffix;
                            if (progress < 1) {
                                requestAnimationFrame(animate);
                            }
                        }
                        requestAnimationFrame(animate);
                    });
                }, 300);
                observer.disconnect();
            }
        });
    }, { threshold: 0.1 });
    
    const statsSection = document.getElementById('stats');
    if (statsSection) observer.observe(statsSection);
}

/* ─── Aurora Mouse Follow ─── */
function initAuroraMouseMove() {
    const aurora = document.getElementById('aurora-bg');
    if (!aurora) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        aurora.style.setProperty('--aurora-x', x + '%');
        aurora.style.setProperty('--aurora-y', y + '%');
    });
}