import barba from '@barba/core';
import { gsap } from 'gsap';

// Initialize Barba transitions
export const initBarba = () => {
  // Check if Barba is already initialized to prevent double initialization
  if (window.barbaInitialized) {
    console.log('Barba already initialized, skipping...');
    return;
  }

  // Wrap all page content in a data-barba="container" attribute
  const wrapPageContent = () => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent && !mainContent.getAttribute('data-barba')) {
      mainContent.setAttribute('data-barba', 'container');
      mainContent.setAttribute('data-barba-namespace', window.location.pathname);
    }
  };

  // Delay initialization slightly to ensure DOM is ready
  setTimeout(() => {
    try {
      // Initialize Barba
      barba.init({
        // Prevent Barba from handling links that should be handled by React Router
        prevent: ({ el }) => {
          // Let React Router handle internal navigation
          if (el && el.classList && el.classList.contains('internal-link')) {
            return true;
          }
          return false;
        },
        transitions: [
          {
            name: 'default-transition',
            leave(data) {
              // Show the overlay during transition
              const overlay = document.querySelector('.transition-overlay');
              if (overlay) {
                overlay.style.display = 'block';
                gsap.to(overlay, { opacity: 0.5, duration: 0.2 });
              }

              return gsap.to(data.current.container, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                  // Scroll to top when leaving page
                  window.scrollTo(0, 0);
                }
              });
            },
            enter(data) {
              // Hide the overlay after transition
              const overlay = document.querySelector('.transition-overlay');
              if (overlay) {
                gsap.to(overlay, {
                  opacity: 0,
                  duration: 0.5,
                  onComplete: () => {
                    overlay.style.display = 'none';
                  }
                });
              }

              return gsap.from(data.next.container, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                  // Re-initialize any scripts that need to run on the new page
                  console.log('Transition complete');
                }
              });
            }
          },
      // Add a specific transition for movie details page
      {
        name: 'movie-details-transition',
        to: { namespace: 'movie-details' },
        leave(data) {
          return gsap.to(data.current.container, {
            opacity: 0,
            duration: 0.4,
            ease: 'power1.out'
          });
        },
        enter(data) {
          // Ensure the container is visible immediately to prevent flickering
          gsap.set(data.next.container, { opacity: 1 });

          // Fade in the content with a slight delay
          const content = data.next.container.querySelector('.movie-details-content');
          if (content) {
            gsap.fromTo(content,
              { opacity: 0 },
              {
                opacity: 1,
                duration: 0.5,
                delay: 0.1,
                ease: 'power1.in'
              }
            );
          }

          return;
        }
      },
      // Add a specific transition for search results page
      {
        name: 'search-results-transition',
        to: { namespace: 'search-results' },
        leave(data) {
          return gsap.to(data.current.container, {
            opacity: 0,
            x: -50,
            duration: 0.5,
            ease: 'power2.inOut'
          });
        },
        enter(data) {
          return gsap.from(data.next.container, {
            opacity: 0,
            x: 50,
            duration: 0.5,
            ease: 'power2.inOut'
          });
        }
      }
    ],
    views: [
      {
        namespace: 'home',
        beforeEnter() {
          // Any specific logic for home page
          console.log('Entering home page');
        }
      },
      {
        namespace: 'movie-details',
        beforeEnter() {
          // Any specific logic for movie details page
          console.log('Entering movie details page');
        }
      },
      {
        namespace: 'search-results',
        beforeEnter() {
          // Any specific logic for search results page
          console.log('Entering search results page');
        }
      }
    ]
  });

      // Run the wrapper function initially
      wrapPageContent();

      // After Barba does a page transition, we need to re-wrap the content
      barba.hooks.after(() => {
        wrapPageContent();
      });

      // Mark as initialized
      window.barbaInitialized = true;
      console.log('Barba.js initialized successfully');
    } catch (error) {
      console.error('Error initializing Barba.js:', error);
    }
  }, 100); // Small delay to ensure DOM is ready
};

// Helper function to update the namespace based on the current route
export const updateBarbaNamespace = (pathname) => {
  const container = document.querySelector('[data-barba="container"]');
  if (container) {
    let namespace = 'home';

    if (pathname.includes('/movie/')) {
      namespace = 'movie-details';
    } else if (pathname.includes('/search')) {
      namespace = 'search-results';
    }

    container.setAttribute('data-barba-namespace', namespace);
  }
};
