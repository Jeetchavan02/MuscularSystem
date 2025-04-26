// script.js

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const navbar = document.querySelector('.navbar');
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const mouseFollower = document.querySelector('.mouse-follower');
    const navLinks = document.querySelectorAll('.nav-link');
    // Get sections specifically on the index page, if they exist
    const indexSections = document.querySelectorAll('section[id]');
    const currentYearSpan = document.getElementById('current-year');
    const isIndexPage = indexSections.length > 0 && document.querySelector('#home'); // Heuristic to detect index page

    // --- Current Year ---
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Navbar Scroll Effect ---
    if (navbar) { // Check if navbar exists
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            // Update active link on scroll only if sections exist (on index page)
            if (isIndexPage) {
                updateActiveNavLinkOnScroll();
            }
        });
    }


    // --- Theme Toggle ---
    if (themeToggleBtn) { // Check if button exists
        const themeIcon = themeToggleBtn.querySelector('i');
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'light-theme') {
            body.classList.add('light-theme');
            if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
        } else {
             // Ensure icon is correct on load for dark theme
             if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
        }

        themeToggleBtn.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            let theme = 'dark-theme'; // Default theme
            if (body.classList.contains('light-theme')) {
                theme = 'light-theme';
                if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
            } else {
                if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
            }
            localStorage.setItem('theme', theme);
        });
    }


    // --- Smooth Scrolling & Active Link Update on Click (for index page internal links) ---
    navLinks.forEach(anchor => {
        const linkHref = anchor.getAttribute('href');
        // Check if it's an internal link intended for the index page
        if (linkHref && linkHref.includes('index.html#') || (isIndexPage && linkHref && linkHref.startsWith('#'))) {
           anchor.addEventListener('click', function (e) {
                // If we are already on the index page and it's an internal link
                if (isIndexPage && linkHref.startsWith('#')) {
                    e.preventDefault();
                    const targetId = linkHref; // The href is the selector
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        const navbarHeight = navbar ? navbar.offsetHeight : 70;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });

                        // Update active nav link immediately on click
                        navLinks.forEach(link => link.classList.remove('active'));
                        this.classList.add('active');
                    }
                }
                // If it's a link from another page *to* an index section,
                // the browser will handle the navigation, the #hash will be set,
                // and the scroll adjustment logic below might handle the offset.
                // Or let the browser jump first, then potentially adjust.
            });
        }
    });

    // --- Scroll Adjustment AFTER Navigating to Anchor ---
    // Handles jumps from other pages or reloads with a hash
    function adjustScrollForNavbar() {
        const hash = window.location.hash;
        if (hash && isIndexPage) {
            const targetElement = document.querySelector(hash);
            if (targetElement) {
                 const navbarHeight = navbar ? navbar.offsetHeight : 70;
                 const elementPosition = targetElement.getBoundingClientRect().top;
                 // Only adjust if the element is near the top (prevent adjusting if user scrolled down manually)
                 // Use a small timeout to allow the browser's initial jump
                 setTimeout(() => {
                      // Re-check position after potential layout shifts/browser jump
                      const currentElementPos = targetElement.getBoundingClientRect().top;
                      const expectedTop = navbarHeight + 10; // Expected position +/- tolerance
                      if (Math.abs(currentElementPos - expectedTop) > 20) { // If not already in the right place
                          const offsetPosition = window.pageYOffset + currentElementPos - navbarHeight;
                          window.scrollTo({ top: offsetPosition, behavior: 'smooth' }); // Use smooth if desired
                      }
                 }, 100); // Adjust delay if needed
            }
        }
    }
    // Adjust scroll on initial load if there's a hash
    if (isIndexPage) {
        adjustScrollForNavbar();
    }


    // --- Update Active Nav Link based on Scroll Position (for index page) ---
    function updateActiveNavLinkOnScroll() {
         // Check if sections exist before running
         if (!indexSections || indexSections.length === 0) return;

        let currentSectionId = indexSections[0].id; // Default to first section
        const navbarHeight = navbar ? navbar.offsetHeight : 70;
        const scrollTolerance = 150; // How many pixels below the top to trigger change

        indexSections.forEach(section => {
            const sectionTop = section.offsetTop - navbarHeight - scrollTolerance;

            if (window.pageYOffset >= sectionTop) {
                currentSectionId = section.getAttribute('id');
            }
        });

        // Special case for reaching the very bottom
        if ((window.innerHeight + Math.ceil(window.pageYOffset)) >= document.body.offsetHeight - 50) {
            const lastSection = indexSections[indexSections.length - 1];
            if (lastSection) currentSectionId = lastSection.id;
         }


        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            // Check if it's an internal link for the current index page section
            if (linkHref && linkHref === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }
     // Initial check on load only if on the index page
     if (isIndexPage) {
        updateActiveNavLinkOnScroll();
     }


    // --- Mouse Follower Effect ---
    if (mouseFollower && !('ontouchstart' in window)) {
        body.classList.add('mouse-follower-enabled');

        let animationFrameId = null;
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;
        const smoothing = 0.15; // Adjust for smoother/lagging effect (lower = more lag)

        window.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(updateFollowerPosition);
            }
        });

        function updateFollowerPosition() {
            currentX += (targetX - currentX) * smoothing;
            currentY += (targetY - currentY) * smoothing;
            mouseFollower.style.transform = `translate(${currentX - mouseFollower.offsetWidth / 2}px, ${currentY - mouseFollower.offsetHeight / 2}px) scale(${mouseFollower.classList.contains('active') ? 1.8 : 1})`;

            // Stop animation frame if mouse hasn't moved significantly
            if (Math.abs(targetX - currentX) < 0.1 && Math.abs(targetY - currentY) < 0.1) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            } else {
                animationFrameId = requestAnimationFrame(updateFollowerPosition);
            }
        }


        // Apply hover effect to common interactive elements
        document.querySelectorAll('a, button, .card, input, .nav-link, .cta-button').forEach(el => {
            el.addEventListener('mouseenter', () => mouseFollower.classList.add('active'));
            el.addEventListener('mouseleave', () => mouseFollower.classList.remove('active'));
        });

        document.addEventListener('mouseleave', () => {
             mouseFollower.style.opacity = '0'; // Hide if mouse leaves window
        });
        document.addEventListener('mouseenter', () => {
            mouseFollower.style.opacity = '1'; // Show when mouse enters window
        });
    } else if (mouseFollower) {
         mouseFollower.style.display = 'none'; // Hide follower on touch devices
    }

});