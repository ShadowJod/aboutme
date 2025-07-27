// Main JavaScript file for portfolio website

// Utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Debounce function for performance optimization
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function for scroll events
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Global state
const state = {
    isMenuOpen: false,
    currentSection: 'home',
    scrollY: 0,
    isLoading: false
};

// Navigation functionality
class Navigation {
    constructor() {
        this.navbar = $('#navbar');
        this.hamburger = $('#hamburger');
        this.navMenu = $('#nav-menu');
        this.navLinks = $$('.nav-link');
        
        this.init();
    }
    
    init() {
        this.hamburger.addEventListener('click', () => this.toggleMenu());
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (state.isMenuOpen && !this.navbar.contains(e.target)) {
                this.closeMenu();
            }
        });
        
        // Handle scroll for navbar styling
        window.addEventListener('scroll', throttle(() => this.handleScroll(), 100));
    }
    
    toggleMenu() {
        state.isMenuOpen = !state.isMenuOpen;
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
    }
    
    closeMenu() {
        state.isMenuOpen = false;
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    handleNavClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetSection = $(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            this.closeMenu();
        }
    }
    
    handleScroll() {
        state.scrollY = window.scrollY;
        
        // Add scrolled class to navbar
        if (state.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
        
        // Update active nav link
        this.updateActiveNavLink();
    }
    
    updateActiveNavLink() {
        const sections = $$('section[id]');
        const scrollPos = state.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                        state.currentSection = sectionId;
                    }
                });
            }
        });
    }
}

// Particle system for hero section
class ParticleSystem {
    constructor() {
        this.container = $('#particles');
        this.particles = [];
        this.animationId = null;
        
        if (this.container) {
            this.init();
        }
    }
    
    init() {
        this.createParticles();
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', debounce(() => {
            this.particles = [];
            this.container.innerHTML = '';
            this.createParticles();
        }, 250));
    }
    
    createParticles() {
        const particleCount = window.innerWidth > 768 ? 50 : 25;
        
        for (let i = 0; i < particleCount; i++) {
            this.createParticle();
        }
    }
    
    createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const size = Math.random() * 3 + 1;
        const speed = Math.random() * 2 + 1;
        const opacity = Math.random() * 0.5 + 0.2;
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.opacity = opacity;
        particle.style.animationDuration = (speed * 3) + 's';
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        this.container.appendChild(particle);
        this.particles.push({
            element: particle,
            x: x,
            y: y,
            speed: speed
        });
    }
    
    animate() {
        // Particles are animated via CSS, so we just need to replace them when they're done
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Occasionally add new particles
        if (Math.random() < 0.02) {
            this.replaceRandomParticle();
        }
    }
    
    replaceRandomParticle() {
        if (this.particles.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.particles.length);
            const particle = this.particles[randomIndex];
            
            if (particle.element.parentNode) {
                particle.element.remove();
            }
            
            this.particles.splice(randomIndex, 1);
            this.createParticle();
        }
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.particles = [];
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Scroll animations
class ScrollAnimations {
    constructor() {
        this.elements = $$('.fade-in, .slide-in-left, .slide-in-right');
        this.observer = null;
        
        this.init();
    }
    
    init() {
        // Use Intersection Observer for better performance
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
        
        this.elements.forEach(element => {
            this.observer.observe(element);
        });
    }
}

// Counter animation for statistics
class CounterAnimation {
    constructor() {
        this.counters = $$('[data-count]');
        this.hasAnimated = new Set();
        
        this.init();
    }
    
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated.has(entry.target)) {
                    this.animateCounter(entry.target);
                    this.hasAnimated.add(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        this.counters.forEach(counter => {
            observer.observe(counter);
        });
    }
    
    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }
}

// Skill bars animation
class SkillBarsAnimation {
    constructor() {
        this.skillBars = $$('.skill-progress');
        this.hasAnimated = new Set();
        
        this.init();
    }
    
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated.has(entry.target)) {
                    this.animateSkillBar(entry.target);
                    this.hasAnimated.add(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        this.skillBars.forEach(bar => {
            observer.observe(bar);
        });
    }
    
    animateSkillBar(element) {
        const width = element.getAttribute('data-width');
        element.style.width = width + '%';
    }
}

// Contact form handler
class ContactForm {
    constructor() {
        this.form = $('#contact-form');
        this.submitBtn = this.form?.querySelector('button[type="submit"]');
        
        if (this.form) {
            this.init();
        }
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Add real-time validation
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (state.isLoading) return;
        
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // Validate all fields
        if (!this.validateForm(data)) {
            return;
        }
        
        try {
            state.isLoading = true;
            this.setLoadingState(true);
            
            // Simulate API call (replace with actual endpoint)
            await this.simulateFormSubmission(data);
            
            this.showSuccess('Message sent successfully! I\'ll get back to you soon.');
            this.form.reset();
            
        } catch (error) {
            this.showError('Failed to send message. Please try again.');
            console.error('Form submission error:', error);
        } finally {
            state.isLoading = false;
            this.setLoadingState(false);
        }
    }
    
    validateForm(data) {
        let isValid = true;
        
        // Name validation
        if (!data.name || data.name.trim().length < 2) {
            this.setFieldError($('#name'), 'Name must be at least 2 characters');
            isValid = false;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            this.setFieldError($('#email'), 'Please enter a valid email address');
            isValid = false;
        }
        
        // Subject validation
        if (!data.subject || data.subject.trim().length < 3) {
            this.setFieldError($('#subject'), 'Subject must be at least 3 characters');
            isValid = false;
        }
        
        // Message validation
        if (!data.message || data.message.trim().length < 10) {
            this.setFieldError($('#message'), 'Message must be at least 10 characters');
            isValid = false;
        }
        
        return isValid;
    }
    
    validateField(field) {
        const value = field.value.trim();
        
        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value && !emailRegex.test(value)) {
                    this.setFieldError(field, 'Please enter a valid email address');
                    return false;
                }
                break;
            case 'text':
                if (value && value.length < 2) {
                    this.setFieldError(field, 'Field must be at least 2 characters');
                    return false;
                }
                break;
        }
        
        if (field.tagName === 'TEXTAREA' && value && value.length < 10) {
            this.setFieldError(field, 'Message must be at least 10 characters');
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }
    
    setFieldError(field, message) {
        field.classList.add('form-error');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = 'var(--secondary-color)';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }
    
    clearFieldError(field) {
        field.classList.remove('form-error');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
        
        if (field.value.trim()) {
            field.classList.add('form-success');
        } else {
            field.classList.remove('form-success');
        }
    }
    
    setLoadingState(loading) {
        if (this.submitBtn) {
            this.submitBtn.disabled = loading;
            this.submitBtn.textContent = loading ? 'Sending...' : 'Send Message';
            this.form.classList.toggle('loading', loading);
        }
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? 'rgba(80, 250, 123, 0.1)' : 'rgba(255, 0, 110, 0.1)'};
            border: 1px solid ${type === 'success' ? '#50fa7b' : 'var(--secondary-color)'};
            border-radius: var(--border-radius);
            color: ${type === 'success' ? '#50fa7b' : 'var(--secondary-color)'};
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }
    
    async simulateFormSubmission(data) {
        // Simulate API delay
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form data submitted:', data);
                resolve();
            }, 1000);
        });
    }
}

// Smooth scrolling for anchor links
class SmoothScrolling {
    constructor() {
        this.init();
    }
    
    init() {
        // Handle all anchor links
        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('a[href^="#"]');
            if (anchor && anchor.getAttribute('href') !== '#') {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = $(targetId);
                
                if (target) {
                    const offsetTop = target.offsetTop - 70;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }
}

// Theme and preferences
class ThemeManager {
    constructor() {
        this.prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        this.init();
    }
    
    init() {
        // Handle reduced motion preference
        if (this.prefersReducedMotion.matches) {
            document.documentElement.style.setProperty('--transition-fast', '0.01ms');
            document.documentElement.style.setProperty('--transition-normal', '0.01ms');
            document.documentElement.style.setProperty('--transition-slow', '0.01ms');
        }
        
        // Listen for changes
        this.prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                document.documentElement.style.setProperty('--transition-fast', '0.01ms');
                document.documentElement.style.setProperty('--transition-normal', '0.01ms');
                document.documentElement.style.setProperty('--transition-slow', '0.01ms');
            } else {
                document.documentElement.style.removeProperty('--transition-fast');
                document.documentElement.style.removeProperty('--transition-normal');
                document.documentElement.style.removeProperty('--transition-slow');
            }
        });
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoadTime: 0,
            domContentLoaded: 0,
            firstPaint: 0,
            firstContentfulPaint: 0
        };
        
        this.init();
    }
    
    init() {
        // Measure page load time
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart;
            
            // Get paint metrics
            const paintEntries = performance.getEntriesByType('paint');
            paintEntries.forEach(entry => {
                if (entry.name === 'first-paint') {
                    this.metrics.firstPaint = entry.startTime;
                } else if (entry.name === 'first-contentful-paint') {
                    this.metrics.firstContentfulPaint = entry.startTime;
                }
            });
            
            this.logMetrics();
        });
        
        // Measure DOM content loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.metrics.domContentLoaded = performance.now();
        });
    }
    
    logMetrics() {
        console.log('Performance Metrics:', this.metrics);
    }
}

// Error handling
class ErrorHandler {
    constructor() {
        this.init();
    }
    
    init() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.logError(e.error, e.filename, e.lineno, e.colno);
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.logError(e.reason);
        });
    }
    
    logError(error, filename = '', lineno = 0, colno = 0) {
        // In production, you might want to send this to an error tracking service
        const errorData = {
            message: error.message || error,
            filename,
            lineno,
            colno,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.error('Error logged:', errorData);
    }
}

// Initialize application
class App {
    constructor() {
        this.components = {};
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }
    
    initializeComponents() {
        try {
            // Initialize error handling first
            this.components.errorHandler = new ErrorHandler();
            
            // Initialize core components
            this.components.navigation = new Navigation();
            this.components.particleSystem = new ParticleSystem();
            this.components.scrollAnimations = new ScrollAnimations();
            this.components.counterAnimation = new CounterAnimation();
            this.components.skillBarsAnimation = new SkillBarsAnimation();
            this.components.contactForm = new ContactForm();
            this.components.smoothScrolling = new SmoothScrolling();
            this.components.themeManager = new ThemeManager();
            this.components.performanceMonitor = new PerformanceMonitor();
            
            console.log('Portfolio application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
        }
    }
    
    destroy() {
        // Cleanup components
        Object.values(this.components).forEach(component => {
            if (component.destroy && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        
        this.components = {};
    }
}


// Initialize the application
const app = new App();

// Export for potential external use
window.PortfolioApp = app;