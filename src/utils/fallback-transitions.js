import { gsap } from 'gsap';

/**
 * Fallback transition system in case Barba.js doesn't work properly
 * This provides simple fade transitions using GSAP directly
 */

// Initialize the fallback transition system
export const initFallbackTransitions = () => {
  console.log('Initializing fallback transition system');
  
  // Fade in the main content
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    gsap.fromTo(
      mainContent,
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.5,
        delay: 0.1
      }
    );
  }
  
  // Add click handlers to all internal links
  const addLinkHandlers = () => {
    const links = document.querySelectorAll('a[href^="/"]');
    links.forEach(link => {
      if (!link.getAttribute('data-transition-handled')) {
        link.setAttribute('data-transition-handled', 'true');
        link.addEventListener('click', handleLinkClick);
      }
    });
  };
  
  // Handle link clicks
  const handleLinkClick = (e) => {
    // Don't handle if Barba.js is working
    if (window.barbaInitialized) return;
    
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('/') && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      
      // Fade out
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        gsap.to(mainContent, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            window.location.href = href;
          }
        });
      } else {
        window.location.href = href;
      }
    }
  };
  
  // Run once on initialization
  addLinkHandlers();
  
  // Also run when the DOM changes
  const observer = new MutationObserver(addLinkHandlers);
  observer.observe(document.body, { childList: true, subtree: true });
  
  return () => {
    observer.disconnect();
  };
};

// Simple page transition for React components
export const pageTransition = (element, isEntering = true) => {
  if (!element) return;
  
  if (isEntering) {
    gsap.fromTo(
      element,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, delay: 0.1 }
    );
  } else {
    gsap.to(
      element,
      { opacity: 0, y: -20, duration: 0.3 }
    );
  }
};
