/**
 * Sangram Bal Portfolio - Core Interactivity Script (script.js)
 */

document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------
    // 0. Smooth Momentum Scroll Initialization (Lenis + GSAP Sync)
    // -------------------------------------------------------------
    let lenis = null;

    if (window.innerWidth > 768) {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // High-fidelity inertia easing
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 1.5,
            infinite: false
        });

        // Make lenis globally accessible for link overrides
        window.lenis = lenis;

        // Connect Lenis with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        // Freeze scroll during compilation loading screen
        lenis.stop();
    }

    // -------------------------------------------------------------
    // 1. Terminal Loader Fade-Out
    // -------------------------------------------------------------
    const loader = document.getElementById("loader");
    const typingLoader = document.querySelector(".typing-loader");
    
    // Simulate terminal typing in the loader prompt before page displays
    if (typingLoader) {
        let loadSteps = ["echo 'Launch Complete!';", "exit;"];
        let stepIndex = 0;
        let charIndex = 0;
        
        function typeLoaderCommand() {
            if (stepIndex < loadSteps.length) {
                let currentWord = loadSteps[stepIndex];
                if (charIndex < currentWord.length) {
                    typingLoader.textContent += currentWord.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeLoaderCommand, 40);
                } else {
                    stepIndex++;
                    charIndex = 0;
                    if (stepIndex < loadSteps.length) {
                        setTimeout(() => {
                            typingLoader.textContent = "";
                            typeLoaderCommand();
                        }, 500);
                    }
                }
            }
        }
        setTimeout(typeLoaderCommand, 1800);
    }

    // Hide loader after a brief compilation simulation (3.4 seconds total)
    setTimeout(() => {
        if (loader) {
            loader.classList.add("fade-out");
            document.body.style.overflowY = "auto"; // Unlock scroll
            
            // Unlock Lenis scroll engine
            if (lenis) lenis.start();
            
            // GSAP Entrance Animations
            initHeroGSAP();
            initScrollAnimations();
            initProject3DTilt();
        }
    }, 3400);

    // -------------------------------------------------------------
    // 2. Typing Animation (Hero Subtitle)
    // -------------------------------------------------------------
    const typingSpan = document.getElementById("typing-text");
    const roles = ["Go Backend Developer", "Software Engineer", "Systems Architect"];
    let roleIndex = 0;
    let textIndex = 0;
    let isDeleting = false;
    
    function typeEffect() {
        if (!typingSpan) return;
        
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            // Delete text
            typingSpan.textContent = currentRole.substring(0, textIndex - 1);
            textIndex--;
        } else {
            // Write text
            typingSpan.textContent = currentRole.substring(0, textIndex + 1);
            textIndex++;
        }
        
        let typeSpeed = isDeleting ? 40 : 100;
        
        if (!isDeleting && textIndex === currentRole.length) {
            // Pause at full word
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && textIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500;
        }
        
        setTimeout(typeEffect, typeSpeed);
    }
    
    // Start typing after loader finishes
    setTimeout(typeEffect, 3800);

    // -------------------------------------------------------------
    // 3. Floating Navbar & Scroll-to-Top Toggle
    // -------------------------------------------------------------
    const navbar = document.getElementById("navbar");
    const scrollToTopBtn = document.getElementById("scroll-to-top");
    
    window.addEventListener("scroll", () => {
        // Toggle navbar class
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
        
        // Toggle scroll-to-top button
        if (window.scrollY > 600) {
            scrollToTopBtn.classList.add("active");
        } else {
            scrollToTopBtn.classList.remove("active");
        }
    });

    // Scroll to top action using Lenis/Native scroll fallback
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener("click", () => {
            if (lenis) {
                lenis.scrollTo(0, { duration: 1.5 });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // -------------------------------------------------------------
    // 4. Responsive Navigation Drawer & Lenis Scroll Binding
    // -------------------------------------------------------------
    const menuToggle = document.getElementById("menu-toggle");
    const navMenu = document.getElementById("nav-menu");
    const navOverlay = document.getElementById("nav-overlay");
    const navLinks = document.querySelectorAll(".nav-link");
    
    function toggleMenu() {
        menuToggle.classList.toggle("active");
        navMenu.classList.toggle("active");
        navOverlay.classList.toggle("active");
        
        // Prevent body scrolling when menu is open
        if (navMenu.classList.contains("active")) {
            document.body.style.overflow = "hidden";
            if (lenis) lenis.stop(); // Stop Lenis scroll when menu is active
        } else {
            document.body.style.overflow = "auto";
            if (lenis) lenis.start(); // Resume Lenis scroll
        }
    }
    
    if (menuToggle) {
        menuToggle.addEventListener("click", toggleMenu);
    }
    
    if (navOverlay) {
        navOverlay.addEventListener("click", toggleMenu);
    }
    
    // Close drawer and trigger smooth Lenis/Native scroll to anchor
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const targetId = link.getAttribute("href");
            if (targetId && targetId.startsWith("#")) {
                e.preventDefault();
                const targetSec = document.querySelector(targetId);
                if (targetSec) {
                    if (lenis) {
                        lenis.scrollTo(targetSec, { offset: -80, duration: 1.2 });
                    } else {
                        const offsetPosition = targetSec.getBoundingClientRect().top + window.scrollY - 80;
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            }
            if (navMenu.classList.contains("active")) {
                toggleMenu();
            }
        });
    });

    // -------------------------------------------------------------
    // 5. Scroll Active Link Highlighting
    // -------------------------------------------------------------
    const sections = document.querySelectorAll("section");
    
    window.addEventListener("scroll", () => {
        let currentSec = "";
        const scrollPosition = window.scrollY + 120; // Offset for navbar height
        
        sections.forEach(sec => {
            const secTop = sec.offsetTop;
            const secHeight = sec.clientHeight;
            if (scrollPosition >= secTop && scrollPosition < secTop + secHeight) {
                currentSec = sec.getAttribute("id");
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSec}`) {
                link.classList.add("active");
            }
        });
    });

    // -------------------------------------------------------------
    // 6. GSAP Entrance and Scroll animations
    // -------------------------------------------------------------
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    function initHeroGSAP() {
        const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });
        
        // Set initial states for elements
        gsap.set(".hero-content > *", { opacity: 0, y: 30 });
        gsap.set(".hero-avatar", { opacity: 0, scale: 0.8 });
        gsap.set(".tech-orbit", { opacity: 0, scale: 0.5 });
        gsap.set(".floating-tech", { opacity: 0, y: 20 });
        
        tl.to(".hero-avatar", { opacity: 1, scale: 1, duration: 1.2, ease: "elastic.out(1, 0.75)" })
          .to(".tech-orbit", { opacity: 0.15, scale: 1, stagger: 0.15, duration: 0.8 }, "-=0.8")
          .to(".hero-tag", { opacity: 1, y: 0, duration: 0.6 }, "-=0.6")
          .to(".hero-title", { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
          .to(".hero-subtitle", { opacity: 1, y: 0, duration: 0.6 }, "-=0.5")
          .to(".hero-description", { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
          .to(".hero-actions", { opacity: 1, y: 0, duration: 0.8 }, "-=0.6")
          .to(".social-links .social-icon", { opacity: 1, y: 0, stagger: 0.15, duration: 0.6 }, "-=0.6")
          .to(".floating-tech", { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: "back.out(1.7)" }, "-=0.5")
          .add(() => {
              // Start infinite floating animations for tech icons
              gsap.to(".go-node", { y: -10, yoyo: true, repeat: -1, duration: 2.5, ease: "power1.inOut" });
              gsap.to(".redis-node", { y: 12, x: -5, yoyo: true, repeat: -1, duration: 3.2, ease: "power1.inOut" });
              gsap.to(".db-node", { y: -8, x: 8, yoyo: true, repeat: -1, duration: 2.8, ease: "power1.inOut" });
              
              // Infinite subtle rotation for rings
              gsap.to(".ring-1", { rotate: 360, repeat: -1, duration: 20, ease: "none" });
              gsap.to(".ring-2", { rotate: -360, repeat: -1, duration: 30, ease: "none" });
          });
    }

    function initScrollAnimations() {
        // Ensure all parent reveal containers are visible for GSAP child animations
        const parentReveals = document.querySelectorAll(".timeline, .skills-showcase, .education-timeline, .contact-info, .section-header");
        gsap.set(parentReveals, { opacity: 1, y: 0 });

        // Universal section header animation
        const sectionHeaders = document.querySelectorAll(".section-header");
        sectionHeaders.forEach(header => {
            const title = header.querySelector(".section-title");
            const line = header.querySelector(".section-line");
            const subtitle = header.querySelector(".section-subtitle");
            
            const headerTl = gsap.timeline({
                scrollTrigger: {
                    trigger: header,
                    start: "top 85%",
                    toggleActions: "play none none none"
                }
            });
            
            gsap.set([title, subtitle], { opacity: 0, y: 25 });
            gsap.set(line, { scaleX: 0, transformOrigin: "center center" });
            
            headerTl.to(title, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" })
                    .to(line, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, "-=0.3")
                    .to(subtitle, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.4");
        });

        // 1. Experience Timeline Cards Animation
        const timelineItems = document.querySelectorAll(".timeline-item");
        if (timelineItems.length > 0) {
            timelineItems.forEach(item => {
                const card = item.querySelector(".timeline-card");
                const badge = item.querySelector(".timeline-badge");
                
                const itemTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: item,
                        start: "top 80%",
                        toggleActions: "play none none none"
                    }
                });
                
                gsap.set(card, { opacity: 0, x: 50 });
                gsap.set(badge, { opacity: 0, scale: 0.3 });
                
                itemTl.to(badge, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" })
                      .to(card, { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }, "-=0.25");
            });
        }

        // 2. Projects Grid Animation
        const projectsGrid = document.querySelector(".projects-grid");
        if (projectsGrid) {
            const projectCards = projectsGrid.querySelectorAll(".project-card");
            
            gsap.set(projectCards, { opacity: 0, y: 40 });
            
            ScrollTrigger.batch(projectCards, {
                onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out", overwrite: "auto" }),
                start: "top 85%"
            });
        }

        // 3. Technical Expertise Skills Tab/Cards Animation
        const activeTabContent = document.querySelector(".tab-content.active");
        if (activeTabContent) {
            const skillCards = activeTabContent.querySelectorAll(".skill-card");
            
            gsap.set(skillCards, { opacity: 0, scale: 0.9, y: 20 });
            
            ScrollTrigger.batch(skillCards, {
                onEnter: batch => gsap.to(batch, { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "back.out(1.2)", overwrite: "auto" }),
                start: "top 85%"
            });
        }
        
        // Trigger level fill width animation when skills tab container enters view
        const skillsShowcase = document.querySelector(".skills-showcase");
        if (skillsShowcase) {
            ScrollTrigger.create({
                trigger: skillsShowcase,
                start: "top 80%",
                onEnter: () => {
                    const levelFills = document.querySelectorAll(".level-fill");
                    levelFills.forEach(fill => {
                        const targetWidth = fill.style.width;
                        gsap.fromTo(fill, { width: "0%" }, { width: targetWidth, duration: 1.5, ease: "power3.out" });
                    });
                }
            });
        }

        // 4. Education Timeline Animation
        const educationTimeline = document.querySelector(".education-timeline");
        if (educationTimeline) {
            const eduCards = educationTimeline.querySelectorAll(".education-card");
            
            eduCards.forEach(card => {
                gsap.set(card, { opacity: 0, y: 30 });
                gsap.to(card, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    }
                });
            });
        }

        // 5. Contact Info Items Animation
        const contactWrapper = document.querySelector(".contact-wrapper");
        if (contactWrapper) {
            const infoCards = contactWrapper.querySelectorAll(".info-item-card");
            
            gsap.set(infoCards, { opacity: 0, y: 30, scale: 0.95 });
            
            ScrollTrigger.batch(infoCards, {
                onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15, ease: "back.out(1.4)", overwrite: "auto" }),
                start: "top 85%"
            });
        }
    }

    // -------------------------------------------------------------
    // 7. Skills Tab Switching Layout with GSAP
    // -------------------------------------------------------------
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");
    
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetTab = button.getAttribute("data-tab");
            
            // Toggle Button States
            tabButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            
            // Toggle Panel Visibility with GSAP Animation
            tabContents.forEach(content => {
                content.classList.remove("active");
                if (content.getAttribute("id") === targetTab) {
                    setTimeout(() => {
                        content.classList.add("active");
                        
                        // GSAP animate the newly active tab cards!
                        const cards = content.querySelectorAll(".skill-card");
                        const fills = content.querySelectorAll(".level-fill");
                        
                        gsap.set(cards, { opacity: 0, scale: 0.9, y: 15 });
                        gsap.to(cards, { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "back.out(1.2)" });
                        
                        fills.forEach(fill => {
                            const targetWidth = fill.style.width;
                            gsap.fromTo(fill, { width: "0%" }, { width: targetWidth, duration: 1.0, ease: "power2.out" });
                        });
                    }, 50);
                }
            });
        });
    });

    // -------------------------------------------------------------
    // 8. 3D Card Hover Tilt Animation Suite
    // -------------------------------------------------------------
    function initProject3DTilt() {
        const cards = document.querySelectorAll(".project-card");
        if (cards.length === 0) return;

        cards.forEach(card => {
            card.addEventListener("mousemove", e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const xc = (x / rect.width) - 0.5;
                const yc = (y / rect.height) - 0.5;
                const rotateY = xc * 16;
                const rotateX = -yc * 16;
                const shineX = (x / rect.width) * 100;
                const shineY = (y / rect.height) * 100;
                
                card.style.setProperty("--shine-x", `${shineX}%`);
                card.style.setProperty("--shine-y", `${shineY}%`);

                gsap.to(card, {
                    rotationY: rotateY,
                    rotationX: rotateX,
                    scale: 1.025,
                    transformPerspective: 1000,
                    ease: "power2.out",
                    duration: 0.3,
                    boxShadow: "0 20px 40px rgba(6, 182, 212, 0.08), 0 0 25px rgba(6, 182, 212, 0.15)",
                    borderColor: "rgba(6, 182, 212, 0.3)"
                });
            });

            card.addEventListener("mouseleave", () => {
                gsap.to(card, {
                    rotationY: 0,
                    rotationX: 0,
                    scale: 1,
                    ease: "power3.out",
                    duration: 0.6,
                    boxShadow: "var(--shadow-sm)",
                    borderColor: "var(--glass-border)"
                });
            });
        });
    }
});
