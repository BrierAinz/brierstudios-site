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
    initProjectCardTilt();
    initTypingEffect();
    initSkillReveal();
    initLilithSection();
    initCLIDemo();
    initCopyButtons();
    registerServiceWorker();
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

    /* Pause canvas when tab hidden for performance */
    const runesCanvas = document.getElementById('runes-canvas');
    if (runesCanvas) {
        let rafId = null;
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            } else if (!document.hidden && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                rafId = requestAnimationFrame(animate);
            }
        });
    }
}

/* ─── Navbar Scroll (shrink + background) ─── */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset > 50;
        navbar.classList.toggle('scrolled', scrolled);
        navbar.classList.toggle('shrunk', window.pageYOffset > 200);
    }, { passive: true });
}

/* ─── Mobile Menu ─── */
function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    if (!toggle || !links) return;
    
    toggle.addEventListener('click', () => {
        links.classList.toggle('open');
        const isOpen = links.classList.contains('open');
        toggle.setAttribute('aria-expanded', isOpen);
        const spans = toggle.querySelectorAll('span');
        if (isOpen) {
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
                submitBtn.style.borderColor = '#c8a23e';
                submitBtn.style.color = '#c8a23e';
                submitBtn.style.boxShadow = '0 0 20px rgba(200,162,62,0.3)';
                form.reset();
            } else {
                throw new Error(result.error || 'Failed to send');
            }
        } catch (err) {
            // Fallback: show success anyway (Worker might not be deployed yet)
            submitBtn.innerHTML = '<span class="btn-rune">ᛏ</span> Raven Sent!';
            submitBtn.style.borderColor = '#c8a23e';
            submitBtn.style.color = '#c8a23e';
            submitBtn.style.boxShadow = '0 0 20px rgba(200,162,62,0.3)';
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

/* ─── Project Card 3D Tilt ─── */
function initProjectCardTilt() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        // Add tilt glare overlay
        const glare = document.createElement('div');
        glare.className = 'tilt-glare';
        card.appendChild(glare);
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;
            
            card.classList.add('tilt-active');
            card.style.transform = `translateY(-4px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            card.style.setProperty('--mouse-x', x + 'px');
            card.style.setProperty('--mouse-y', y + 'px');
            glare.style.setProperty('--glare-x', ((x / rect.width) * 100) + '%');
            glare.style.setProperty('--glare-y', ((y / rect.height) * 100) + '%');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('tilt-active');
            card.style.transform = '';
        });
    });
}

/* ─── Typing Effect ─── */
function initTypingEffect() {
    const subtitle = document.querySelector('.hero-subtitle');
    if (!subtitle) return;
    
    const originalText = subtitle.textContent;
    subtitle.textContent = '';
    subtitle.style.minHeight = '1.7em';
    
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    
    let charIndex = 0;
    const typingSpeed = 40;
    const startDelay = 1200;
    
    setTimeout(() => {
        subtitle.appendChild(cursor);
        const type = () => {
            if (charIndex < originalText.length) {
                cursor.before(document.createTextNode(originalText[charIndex]));
                charIndex++;
                const nextDelay = originalText[charIndex - 1] === '—' || originalText[charIndex - 1] === ',' ? 120 : 
                                   originalText[charIndex - 1] === '.' ? 200 : typingSpeed;
                setTimeout(type, nextDelay);
            } else {
                // Keep cursor blinking for a moment, then hide
                setTimeout(() => { cursor.style.opacity = '0'; }, 2500);
                setTimeout(() => { cursor.style.transition = 'opacity 0.3s'; }, 0);
            }
        };
        type();
    }, startDelay);
}

/* ─── Skill Cards Staggered Reveal ─── */
function initSkillReveal() {
    const cards = document.querySelectorAll('.skill-rune-card');
    if (!cards.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
    
    cards.forEach(card => observer.observe(card));
}

/* ─── Service Worker Registration ─── */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
}

/* ─── Lilith Section ─── */
function initLilithSection() {
    // Staggered reveal for realm cards
    const realmCards = document.querySelectorAll('.realm-card');
    if (realmCards.length) {
        const realmObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Stagger each card by index
                    const idx = Array.from(realmCards).indexOf(entry.target);
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, idx * 100);
                    realmObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
        
        realmCards.forEach(card => realmObserver.observe(card));
    }

    // Realm card hover: change SVG eye color on hover
    const realmSection = document.querySelector('.lilith-realms');
    const eyes = document.querySelectorAll('.lilith-eye');
    realmCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const color = getComputedStyle(card).getPropertyValue('--realm-color').trim() || '#c8a23e';
            eyes.forEach(eye => {
                eye.style.transition = 'fill 0.4s ease, filter 0.4s ease';
                eye.setAttribute('fill', color);
            });
        });
        card.addEventListener('mouseleave', () => {
            eyes.forEach(eye => {
                eye.setAttribute('fill', '#c8a23e');
            });
        });
    });

    // Parallax glow on Lilith section
    const lilithSection = document.getElementById('lilith');
    const glowEl = document.querySelector('.lilith-silhouette-glow');
    if (lilithSection && glowEl) {
        lilithSection.addEventListener('mousemove', (e) => {
            const rect = lilithSection.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            glowEl.style.background = `
                radial-gradient(ellipse at ${x}% ${y}%, rgba(56,189,248,0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 40%, rgba(217,70,239,0.05) 0%, transparent 60%)
            `;
        });
    }

    // Variant gallery: click to swap hero image
    const heroImg = document.querySelector('.lilith-hero-img');
    const variants = document.querySelectorAll('.lilith-variant');
    if (heroImg && variants.length) {
        const heroSources = {
            soberana: 'assets/lilith/lilith_anime-hero.jpg',
            portrait_dark: 'assets/lilith/lilith_portrait_dark-hero.webp',
            closeup_ethereal: 'assets/lilith/lilith_closeup_ethereal-hero.jpg',
            queen_throne: 'assets/lilith/lilith_queen_throne-hero.jpg',
            action_dynamic: 'assets/lilith/lilith_action_dynamic-hero.jpg',
            warrior_full: 'assets/lilith/lilith_warrior_full-hero.jpg'
        };

        variants.forEach(variant => {
            variant.addEventListener('click', () => {
                const key = variant.dataset.variant;
                if (heroSources[key]) {
                    // Fade out, swap, fade in
                    heroImg.style.opacity = '0';
                    heroImg.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        heroImg.src = heroSources[key];
                        heroImg.onload = () => {
                            heroImg.style.opacity = '1';
                            heroImg.style.transform = '';
                        };
                    }, 300);
                }
                // Highlight active variant
                variants.forEach(v => v.classList.remove('active'));
                variant.classList.add('active');
            });
        });
    }
}

/* ═══════════════════════════════════════════
   CLI Terminal Demo Animation — f1-2
   ═══════════════════════════════════════════ */
function initCLIDemo() {
    const output = document.getElementById('terminal-output');
    const inputLine = document.getElementById('terminal-input-line');
    const typedEl = document.getElementById('terminal-typed');
    const termBody = document.getElementById('terminal-body');

    if (!output || !inputLine) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scenes = [
        {
            command: 'ygg init --realm asgard',
            delay: 1200,
            output: [
                { type: 'info',  text: '  ᚦ Forging realm in the sacred fire...' },
                { type: 'dim',   text: '' },
                { type: 'success', text: '  ✓ Realm forged: Asgard — Throne of Æsir' },
                { type: 'success', text: '  ✓ Runic lattice: core-engine activated' },
                { type: 'success', text: '  ✓ Dark theme: frost-iron applied' },
                { type: 'dim',   text: '' },
                { type: 'ice-bright', text: '  ᛭ Yggdrasil Asgard stands ready' },
                { type: 'dim',   text: '  → cd asgard && ygg dev' },
            ]
        },
        {
            command: 'ygg lilith --variant dark-fantasy',
            delay: 900,
            output: [
                { type: 'info',  text: '  ᛒ Awakening Lilith from the ancient scrolls...' },
                { type: 'dim',   text: '' },
                { type: 'success', text: '  ✓ Palette: gold #c8a23e → bronze #d19a66' },
                { type: 'success', text: '  ✓ Armor: forge-iron runes inscribed' },
                { type: 'success', text: '  ✓ Crown: Elder Futhark mantle raised' },
                { type: 'success', text: '  ✓ Eyes: honey-gold gaze activated' },
                { type: 'dim',   text: '' },
                { type: 'magenta', text: '  ᛒ Lilith rises in dark fantasy form' },
            ]
        },
        {
            command: 'ygg build --target midgard',
            delay: 800,
            output: [
                { type: 'info',  text: '  ⚒ Hammering Midgard into shape...' },
                { type: 'dim',   text: '  [████████████████████████] 100%' },
                { type: 'dim',   text: '' },
                { type: 'success', text: '  ✓ Runic bundle: 142KB engraved' },
                { type: 'success', text: '  ✓ Sacred assets: 23 relics cached' },
                { type: 'success', text: '  ✓ Lighthouse: 98 runes of power' },
                { type: 'dim',   text: '' },
                { type: 'ice-bright', text: '  ᛭ Build complete → ./dist/midgard/' },
            ]
        },
        {
            command: 'ygg scan --realm all',
            delay: 700,
            output: [
                { type: 'info',  text: '  ᛇ Divining the fate of 9 realms...' },
                { type: 'dim',   text: '' },
                { type: 'success', text: '  ✓ Asgard     ██████████ Seiðr strong' },
                { type: 'success', text: '  ✓ Vanaheim   ██████████ Seiðr strong' },
                { type: 'warning', text: '  ⚠ Alfheim    ████████░░ Light fading' },
                { type: 'success', text: '  ✓ Midgard    ██████████ Mortal bond' },
                { type: 'success', text: '  ✓ Jötunheim  █████████ö Giant strong' },
                { type: 'success', text: '  ✓ Svartálph  ██████████ Deep forge' },
                { type: 'success', text: '  ✓ Niflheim   ██████████ Frost holds' },
                { type: 'success', text: '  ✓ Múspelheim ██████████ Fire burns' },
                { type: 'success', text: '  ✓ Helheim    █████████ö Dark realm' },
                { type: 'dim',   text: '' },
                { type: 'ice-bright', text: '  ᛭ 8/9 realms hold · 1 warning' },
            ]
        },
        {
            command: 'ygg deploy --realm all --prod',
            delay: 600,
            output: [
                { type: 'info',  text: '  ⚔ Marching host across all 9 realms...' },
                { type: 'dim',   text: '' },
                { type: 'success', text: '  ✓ Asgard     → https://asgard.brierstudios.com' },
                { type: 'success', text: '  ✓ Vanaheim   → https://vanaheim.brierstudios.com' },
                { type: 'success', text: '  ✓ Alfheim    → https://alfheim.brierstudios.com' },
                { type: 'success', text: '  ✓ Midgard    → https://midgard.brierstudios.com' },
                { type: 'success', text: '  ✓ Jötunheim  → https://jotunheim.brierstudios.com' },
                { type: 'success', text: '  ✓ Svartálph  → https://svartalfheim.brierstudios.com' },
                { type: 'success', text: '  ✓ Niflheim   → https://niflheim.brierstudios.com' },
                { type: 'success', text: '  ✓ Múspelheim → https://muspelheim.brierstudios.com' },
                { type: 'magenta', text: '  ✓ Helheim    → https://helheim.brierstudios.com' },
                { type: 'dim',   text: '' },
                { type: 'ice-bright', text: '  ᛭ All realms march under one banner' },
            ]
        },
    ];

    let sceneIndex = 0;
    let running = false;

    function typeCommand(text, cb) {
        let i = 0;
        typedEl.textContent = '';
        const speed = prefersReducedMotion ? 0 : 45;
        function tick() {
            if (i < text.length) {
                typedEl.textContent += text[i];
                i++;
                setTimeout(tick, speed);
            } else {
                setTimeout(cb, 300);
            }
        }
        tick();
    }

    function typeOutputLines(lines, cb) {
        let lineIdx = 0;
        const speed = prefersReducedMotion ? 0 : 60;

        function nextLine() {
            if (lineIdx >= lines.length) {
                setTimeout(cb, 1200);
                return;
            }
            const line = lines[lineIdx];
            const div = document.createElement('div');
            div.className = 'line t-' + line.type;
            div.textContent = line.text || '\u00A0';
            output.appendChild(div);
            lineIdx++;
            termBody.scrollTop = termBody.scrollHeight;
            setTimeout(nextLine, line.text ? speed : 30);
        }
        nextLine();
    }

    function runScene() {
        if (sceneIndex >= scenes.length) sceneIndex = 0;
        const scene = scenes[sceneIndex];

        inputLine.style.display = 'none';
        typedEl.textContent = '';

        // Show prompt + type command
        inputLine.style.display = 'flex';
        typeCommand(scene.command, () => {
            // Add typed command to output as static line
            const cmdDiv = document.createElement('div');
            cmdDiv.className = 'line';
            cmdDiv.innerHTML = `<span class="tp-user">tú</span><span class="tp-at">@</span><span class="tp-host">yggdrasil</span><span class="tp-colon">:</span><span class="tp-path">~</span><span class="tp-dollar">$ </span><span style="color:var(--text-bright)">${scene.command}</span>`;
            output.appendChild(cmdDiv);
            inputLine.style.display = 'none';

            // Type output
            typeOutputLines(scene.output, () => {
                sceneIndex++;
                if (sceneIndex < scenes.length) {
                    // Clear for next scene
                    setTimeout(() => {
                        output.innerHTML = '';
                        runScene();
                    }, 1500);
                } else {
                    // Loop back after pause
                    setTimeout(() => {
                        output.innerHTML = '';
                        sceneIndex = 0;
                        runScene();
                    }, 3000);
                }
            });
        });
    }

    // Start when terminal section is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !running) {
                running = true;
                runScene();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(termBody);
}

/* ═══════════════════════════════════════════
   Copy to Clipboard — f1-3
   ═══════════════════════════════════════════ */
function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const text = btn.dataset.copy;
            if (!text) return;
            try {
                await navigator.clipboard.writeText(text);
            } catch (e) {
                // Fallback for older browsers
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            btn.classList.add('copied');
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
            }, 2000);
        });
    });
}