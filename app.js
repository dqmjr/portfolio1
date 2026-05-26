/**
 * PREMIUM INTERACTIVE WEB APPLICATION ENGINE
 * Portfolio & Commercial Proposal for Damir Alpysbayev
 * 
 * Includes: Physics Particle Network, Bilingual Engine, Hybrid View Layout,
 * Sliding Nav Indicator, Mobile Drawer navigation, Stepper tracker, UX particle burst triggers.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. Core State Management & Element Selectors
    // ==========================================================================
    const state = {
        lang: localStorage.getItem('damir_portfolio_lang') || 'ru',
        layout: 'scroll', // 'scroll' or 'presentation'
        currentSlide: 0,
        totalSlides: 8,
        activeTariff: 'none'
    };

    const sections = document.querySelectorAll('.slide-section');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('.main-header');
    const navIndicator = document.querySelector('.nav-indicator');
    
    // ==========================================================================
    // 2. Interactive Background Particle Canvas System
    // ==========================================================================
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    let particlesArray = [];
    let animationFrameId = null;
    const mouse = {
        x: null,
        y: null,
        radius: window.innerWidth < 768 ? 80 : 120 // Smaller radius on mobile touchscreens
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle Class
    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
            this.baseSize = size;
            this.alpha = Math.random() * 0.5 + 0.2; // Random opacity for sparkle
        }

        // Draw particle
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color.replace('opacity', this.alpha);
            ctx.fill();
        }

        // Update positions
        update() {
            // Check canvas boundary collisions
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            // Move particle
            this.x += this.directionX;
            this.y += this.directionY;

            // Cursor interaction hover effect
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    // Pull particles closer to cursor
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x -= dx * force * 0.03;
                    this.y -= dy * force * 0.03;
                    this.size = this.baseSize * 1.5;
                } else {
                    if (this.size > this.baseSize) this.size -= 0.1;
                }
            } else {
                if (this.size > this.baseSize) this.size -= 0.1;
            }

            this.draw();
        }
    }

    // Initialize particles network
    function initParticles() {
        particlesArray = [];
        // Adaptive density based on viewport size
        let numberOfParticles = (canvas.width * canvas.height) / 11000;
        numberOfParticles = Math.min(numberOfParticles, 120); // Cap for performance

        const colors = [
            'rgba(58, 189, 163, opacity)', // Mint
            'rgba(245, 166, 35, opacity)', // Gold
            'rgba(156, 163, 175, opacity)' // Grey
        ];

        for (let i = 0; i < numberOfParticles; i++) {
            let size = Math.random() * 2 + 1;
            let x = Math.random() * (window.innerWidth - size * 2) + size;
            let y = Math.random() * (window.innerHeight - size * 2) + size;
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            let color = colors[Math.floor(Math.random() * colors.length)];

            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    // Connect particles with thin geometric lines
    function connectParticles() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                // Draw lines between close particles
                if (distance < 95) {
                    opacityValue = 1 - (distance / 95);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue * 0.05})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }

                // Connect to mouse cursor
                if (mouse.x !== null && mouse.y !== null) {
                    let mdx = particlesArray[a].x - mouse.x;
                    let mdy = particlesArray[a].y - mouse.y;
                    let mdist = Math.sqrt(mdx * mdx + mdy * mdy);

                    if (mdist < mouse.radius) {
                        opacityValue = 1 - (mdist / mouse.radius);
                        // Make connection lines glow in theme colors depending on particle
                        const lineColor = particlesArray[a].color.includes('58') ? '58, 189, 163' : '245, 166, 35';
                        ctx.strokeStyle = `rgba(${lineColor}, ${opacityValue * 0.15})`;
                        ctx.lineWidth = 0.6;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }
        }
    }

    // Canvas Frame Loop
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connectParticles();
        animationFrameId = requestAnimationFrame(animateParticles);
    }

    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        mouse.radius = window.innerWidth < 768 ? 80 : 120;
        initParticles();
        updateNavIndicator(); // Redraw sliding Indicator on resize!
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animateParticles();

    // ==========================================================================
    // 3. Dynamic Bilingual Engine (KZ / RU)
    // ==========================================================================
    const langBtns = document.querySelectorAll('.lang-btn');
    const langSlider = document.querySelector('.lang-slider');
    
    // Dynamic translations for Form Placeholders and Dropdown options
    const attributeTranslations = {
        placeholder: {
            'client-name': { kz: 'Дамир', ru: 'Дамир' },
            'client-phone': { kz: '+7 (702) 479 95 66', ru: '+7 (702) 479 95 66' }
        }
    };

    function translateApp() {
        // Toggle Active button class and move background slider
        langBtns.forEach(btn => {
            if (btn.getAttribute('data-lang') === state.lang) {
                btn.classList.add('active');
                if (state.lang === 'kz') {
                    langSlider.style.left = '4px';
                } else {
                    langSlider.style.left = 'calc(50% - 4px)';
                }
            } else {
                btn.classList.remove('active');
            }
        });

        // Translate text nodes marked with data-kz and data-ru
        const nodesToTranslate = document.querySelectorAll('[data-kz], [data-ru]');
        nodesToTranslate.forEach(node => {
            const translation = node.getAttribute(`data-${state.lang}`);
            if (translation) {
                // Determine if element contains nested tag tags
                if (node.querySelector('i') || node.querySelector('span')) {
                    // Maintain existing structural children (like icons) by only translating text parts
                    const icon = node.querySelector('i');
                    if (icon) {
                        node.innerHTML = '';
                        node.appendChild(icon);
                        const txtNode = document.createTextNode(' ' + translation);
                        node.appendChild(txtNode);
                    }
                } else {
                    node.textContent = translation;
                }
            }
        });

        // Translate inputs placeholders
        for (const attr in attributeTranslations) {
            for (const elemId in attributeTranslations[attr]) {
                const elem = document.getElementById(elemId);
                if (elem) {
                    elem.setAttribute(attr, attributeTranslations[attr][elemId][state.lang]);
                }
            }
        }

        // Custom manual translations for select options to avoid layout break
        const selectElement = document.getElementById('selected-tariff-input');
        if (selectElement) {
            Array.from(selectElement.options).forEach(option => {
                const optKz = option.getAttribute('data-kz');
                const optRu = option.getAttribute('data-ru');
                if (state.lang === 'kz' && optKz) option.textContent = optKz;
                if (state.lang === 'ru' && optRu) option.textContent = optRu;
            });
        }
        
        setTimeout(updateNavIndicator, 100); // Recalculate indicators after translations rearrange text lengths
    }

    // Add click listeners to Lang Switch buttons
    langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedLang = e.target.getAttribute('data-lang');
            if (selectedLang !== state.lang) {
                state.lang = selectedLang;
                localStorage.setItem('damir_portfolio_lang', state.lang);
                translateApp();
            }
        });
    });

    // Run initial translation
    translateApp();

    // ==========================================================================
    // 4. Mobile Drawer Navigation Controller (Fully Responsive)
    // ==========================================================================
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const mobileDrawerOverlay = document.querySelector('.mobile-drawer-overlay');
    const closeDrawerBtn = document.querySelector('.close-drawer-btn');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    function openDrawer() {
        mobileNavToggle.classList.add('active');
        mobileDrawer.classList.add('active');
        mobileDrawerOverlay.classList.add('active');
    }

    function closeDrawer() {
        mobileNavToggle.classList.remove('active');
        mobileDrawer.classList.remove('active');
        mobileDrawerOverlay.classList.remove('active');
    }

    mobileNavToggle.addEventListener('click', () => {
        if (mobileDrawer.classList.contains('active')) {
            closeDrawer();
        } else {
            openDrawer();
        }
    });

    closeDrawerBtn.addEventListener('click', closeDrawer);
    mobileDrawerOverlay.addEventListener('click', closeDrawer);

    // ==========================================================================
    // 5. Sliding Indicator Nav Tracker (Desktop Menu)
    // ==========================================================================
    function updateNavIndicator() {
        if (window.innerWidth <= 992 || !navIndicator) return;
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) {
            navIndicator.style.left = activeLink.offsetLeft + 'px';
            navIndicator.style.width = activeLink.offsetWidth + 'px';
        }
    }

    // ==========================================================================
    // 6. Hybrid Layout Controller (Scroll vs Interactive Slide Deck)
    // ==========================================================================
    const viewModeToggle = document.getElementById('view-mode-toggle');
    const viewModeIcon = viewModeToggle.querySelector('i');
    const viewModeText = viewModeToggle.querySelector('.btn-text');
    const slidesContainer = document.getElementById('slides-container');
    const presentationControls = document.querySelector('.presentation-controls');
    
    const prevSlideBtn = document.getElementById('prev-slide');
    const nextSlideBtn = document.getElementById('next-slide');
    const currentSlideIndicator = document.querySelector('.current-slide');

    function updatePresentationSlides() {
        sections.forEach((section, idx) => {
            if (idx === state.currentSlide) {
                section.classList.add('active-slide');
            } else {
                section.classList.remove('active-slide');
            }
        });
        
        currentSlideIndicator.textContent = state.currentSlide + 1;
        
        // Auto-update standard top navigation link states
        navLinks.forEach((link, idx) => {
            if (idx === state.currentSlide) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Mirror states to mobile drawer links
        drawerLinks.forEach((link, idx) => {
            if (idx === state.currentSlide) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update indicators
        updateNavIndicator();

        // Trigger dynamic timeline bar filling if Slide 7 is active
        if (state.currentSlide === 6) { // Slide 7 (Process) is index 6
            updateStepperFill(4); // Fill stepper completely
        }
    }

    function toggleViewMode() {
        if (state.layout === 'scroll') {
            // Switch to Presentation mode
            state.layout = 'presentation';
            document.body.classList.remove('scroll-layout');
            document.body.classList.add('presentation-layout');
            viewModeIcon.className = 'ti ti-layout-grid';
            viewModeText.setAttribute('data-kz', 'Парақша');
            viewModeText.setAttribute('data-ru', 'Лендинг');
            
            // Find currently visible section index to start presentation from it
            let closestIndex = 0;
            let minDistance = Infinity;
            sections.forEach((section, index) => {
                const rect = section.getBoundingClientRect();
                if (Math.abs(rect.top) < minDistance) {
                    minDistance = Math.abs(rect.top);
                    closestIndex = index;
                }
            });
            
            state.currentSlide = closestIndex;
            updatePresentationSlides();
            window.scrollTo(0, 0); // Lock window scroll position
        } else {
            // Switch to Scroll/Landing-page mode
            state.layout = 'scroll';
            document.body.classList.remove('presentation-layout');
            document.body.classList.add('scroll-layout');
            viewModeIcon.className = 'ti ti-presentation';
            viewModeText.setAttribute('data-kz', 'Презентация');
            viewModeText.setAttribute('data-ru', 'Презентация');

            // Scroll to the active slide smoothly
            const activeSection = sections[state.currentSlide];
            activeSection.scrollIntoView({ behavior: 'auto' });
        }
        translateApp(); // Re-apply text nodes for the toggle button
    }

    // Mode Toggle Click
    viewModeToggle.addEventListener('click', toggleViewMode);

    // Presentation Slide changes
    function nextSlide() {
        if (state.currentSlide < state.totalSlides - 1) {
            state.currentSlide++;
            updatePresentationSlides();
        }
    }

    function prevSlide() {
        if (state.currentSlide > 0) {
            state.currentSlide--;
            updatePresentationSlides();
        }
    }

    nextSlideBtn.addEventListener('click', nextSlide);
    prevSlideBtn.addEventListener('click', prevSlide);

    // Bind Keyboard arrows for professional presentations deck
    document.addEventListener('keydown', (e) => {
        if (state.layout === 'presentation') {
            if (e.key === 'ArrowRight' || e.key === 'Space') {
                e.preventDefault();
                nextSlide();
            } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
                e.preventDefault();
                prevSlide();
            }
        }
    });

    // Top Navigation & Mobile drawer clicks
    function handleNavLinkNavigation(index, targetId) {
        const targetSection = document.querySelector(targetId);
        closeDrawer(); // Close drawer in case it's on mobile

        if (state.layout === 'presentation') {
            state.currentSlide = index;
            updatePresentationSlides();
        } else {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    navLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            handleNavLinkNavigation(index, link.getAttribute('href'));
        });
    });

    drawerLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            handleNavLinkNavigation(index, link.getAttribute('href'));
        });
    });

    // Start Journey scroll hint button
    document.getElementById('start-journey').addEventListener('click', () => {
        if (state.layout === 'presentation') {
            state.currentSlide = 1;
            updatePresentationSlides();
        } else {
            sections[1].scrollIntoView({ behavior: 'smooth' });
        }
    });

    // ==========================================================================
    // 7. Scroll Spy & Reveal-on-Scroll Observer (Scroll Mode)
    // ==========================================================================
    const scrollOptions = {
        root: null,
        threshold: 0.2, // Reveal when 20% visible
        rootMargin: "0px"
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && state.layout === 'scroll') {
                const activeId = entry.target.getAttribute('id');
                
                // Highlight corresponding nav link
                navLinks.forEach((link, idx) => {
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                        state.currentSlide = idx; // sync index state
                    } else {
                        link.classList.remove('active');
                    }
                });

                // Sync mobile drawer link active states too
                drawerLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });

                // Update indicator line
                updateNavIndicator();

                // Mark entry transitions as revealed
                entry.target.classList.add('revealed');

                // Trigger Stepper Progress on Slide 7 entrance
                if (activeId === 'process') {
                    animateStepperOnScroll();
                }
            }
        });
    }, scrollOptions);

    sections.forEach(section => {
        section.classList.add('reveal-on-scroll');
        sectionObserver.observe(section);
    });

    // Header Shrink on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40 && state.layout === 'scroll') {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ==========================================================================
    // 8. Stepper Timeline Controller
    // ==========================================================================
    const steps = document.querySelectorAll('.stepper-step');
    const fillBar = document.getElementById('stepper-fill-bar');

    function updateStepperFill(activeCount) {
        if (!fillBar) return;
        // Calculate percentage fill based on steps count (5 steps = 4 gaps)
        const percent = (activeCount / (steps.length - 1)) * 100;
        fillBar.style.width = `${percent}%`;

        steps.forEach((step, idx) => {
            if (idx <= activeCount) {
                step.classList.add('active-step');
            } else {
                step.classList.remove('active-step');
            }
        });
    }

    function animateStepperOnScroll() {
        let stepDelay = 0;
        steps.forEach((step, index) => {
            setTimeout(() => {
                updateStepperFill(index);
            }, stepDelay);
            stepDelay += 600; // Increment step every 600ms
        });
    }

    // ==========================================================================
    // 9. Interactive Booking Form & Dynamic Particle Exploding UX
    // ==========================================================================
    const form = document.getElementById('consultation-form');
    const clientNameInput = document.getElementById('client-name');
    const clientPhoneInput = document.getElementById('client-phone');
    const tariffSelect = document.getElementById('selected-tariff-input');
    const successPanel = document.querySelector('.form-success-container');
    const formWrapper = document.querySelector('.form-container-glass');

    // Phone Number Input Masking (+7 (XXX) XXX-XX-XX)
    clientPhoneInput.addEventListener('input', (e) => {
        let num = e.target.value.replace(/\D/g, '');
        
        // Limit max digits
        if (num.length > 11) num = num.substring(0, 11);
        
        // Ensure starting code is 7
        if (num.indexOf('7') === 0 && num.length > 1) {
            // Already starts with 7
        } else if (num.length > 0 && num !== '7') {
            num = '7' + num;
        }

        let format = '+7';
        if (num.length > 1) {
            format += ' (' + num.substring(1, 4);
        }
        if (num.length >= 5) {
            format += ') ' + num.substring(4, 7);
        }
        if (num.length >= 8) {
            format += '-' + num.substring(7, 9);
        }
        if (num.length >= 10) {
            format += '-' + num.substring(9, 11);
        }

        e.target.value = num.length > 0 ? format : '';
    });

    // Form inputs change validation helper
    [clientNameInput, clientPhoneInput].forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.remove('has-error');
        });
    });

    // Action when user selects tariff from Slide 5
    const selectTariffBtns = document.querySelectorAll('.select-tariff-action');
    selectTariffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tariffVal = btn.getAttribute('data-tariff');
            state.activeTariff = tariffVal;
            
            // Set Select value
            tariffSelect.value = tariffVal;

            if (state.layout === 'presentation') {
                // Switch back to scrolling layout to let them fill form
                toggleViewMode();
            }

            // Scroll to form slide with dynamic highlight flash
            const ctaSection = document.getElementById('cta');
            ctaSection.scrollIntoView({ behavior: 'smooth' });

            setTimeout(() => {
                formWrapper.classList.add('anim-glow-border');
                tariffSelect.focus();
                setTimeout(() => {
                    formWrapper.classList.remove('anim-glow-border');
                }, 1500);
            }, 1000);
        });
    });

    // Spark Particles Burst Exploder on canvas starting from form submit location
    function triggerSuccessParticlesExplosion(originX, originY) {
        const explosionColors = [
            'rgba(58, 189, 163, opacity)', // Mint
            'rgba(245, 166, 35, opacity)'  // Gold
        ];

        // Spawn a burst of fast glowing sparkles on the particle system
        for (let i = 0; i < 40; i++) {
            let size = Math.random() * 3 + 2;
            let speedX = (Math.random() * 8) - 4;
            let speedY = (Math.random() * 8) - 4;
            let color = explosionColors[Math.floor(Math.random() * explosionColors.length)];
            
            const expParticle = new Particle(originX, originY, speedX, speedY, size, color);
            expParticle.alpha = 1; // Solid initially
            
            // Custom fading override logic for particle update loop in burst
            const originalUpdate = expParticle.update;
            expParticle.update = function() {
                this.x += this.directionX;
                this.y += this.directionY;
                this.directionX *= 0.98; // Friction
                this.directionY *= 0.98;
                this.alpha -= 0.015; // Fade out quickly
                
                if (this.alpha > 0) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = this.color.replace('opacity', this.alpha);
                    ctx.fill();
                }
            };

            particlesArray.push(expParticle);
        }
    }

    // Form Submission Handling
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let hasValidationErrors = false;
        
        // Name validation
        if (clientNameInput.value.trim().length === 0) {
            clientNameInput.parentElement.classList.add('has-error');
            hasValidationErrors = true;
        }

        // Phone validation (expects complete number, 18 chars length including mask)
        if (clientPhoneInput.value.trim().length < 18) {
            clientPhoneInput.parentElement.classList.add('has-error');
            hasValidationErrors = true;
        }

        if (hasValidationErrors) return;

        // Perform visual success transformations
        const submitBtnRect = form.querySelector('button[type="submit"]').getBoundingClientRect();
        const centerX = submitBtnRect.left + (submitBtnRect.width / 2);
        const centerY = submitBtnRect.top + (submitBtnRect.height / 2);
        
        triggerSuccessParticlesExplosion(centerX, centerY);
        formWrapper.classList.add('success-active');
    });

    // Close success panel
    const closeSuccessBtn = document.querySelector('.close-success-btn');
    closeSuccessBtn.addEventListener('click', () => {
        formWrapper.classList.remove('success-active');
        form.reset();
    });

    // ==========================================================================
    // 10. Interactive Modals Dialogs Layout
    // ==========================================================================
    const githubBtn = document.getElementById('open-github-cta');
    const githubModal = document.getElementById('github-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal-btn');

    githubBtn.addEventListener('click', () => {
        githubModal.classList.add('active');
    });

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            githubModal.classList.remove('active');
        });
    });

    githubModal.addEventListener('click', (e) => {
        if (e.target === githubModal) {
            githubModal.classList.remove('active');
        }
    });

    // Initial indicator placement on load
    setTimeout(updateNavIndicator, 600);

});
