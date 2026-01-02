/**
 * Scratch Comment Blocker - Content Script
 * Actively removes comment elements from the DOM
 */

(function() {
  'use strict';

  // List of selectors to remove
  const commentSelectors = [
    '.comments-container',
    '.comments-header',
    '.comments-root-reply',
    '.comments-list',
    '.top-level-reply',
    '.comment',
    '.comment-bubble',
    '.compose-comment',
    '.load-more-button',
    '.comments-turned-off',
    '.comment-placeholder-img',
    '.commenting-status',
    '.comments-allowed-input',
    '#user-comments',
    '.user-comments',
    '.studio-comment-container',
    '.studio-comments',
    '[id*="comment"]',
    '[class*="comment"]',
    '[data-testid*="comment"]'
  ];

  /**
   * Remove all comment elements from the page
   */
  function removeCommentElements() {
    commentSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          // Only remove elements that are clearly comment-related
          // to avoid accidentally removing non-comment elements
          const classList = element.className?.toString().toLowerCase() || '';
          const id = element.id?.toString().toLowerCase() || '';
          const testId = element.getAttribute('data-testid')?.toLowerCase() || '';

          if (classList.includes('comment') || id.includes('comment') || testId.includes('comment')) {
            element.remove();
          }
        });
      } catch (e) {
        // Ignore selector errors
      }
    });
  }

  /**
   * Create a MutationObserver to watch for dynamically added comments
   */
  function observeDOM() {
    const observer = new MutationObserver((mutations) => {
      let shouldRemove = false;

      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const classList = node.className?.toString().toLowerCase() || '';
              const id = node.id?.toString().toLowerCase() || '';

              if (classList.includes('comment') || id.includes('comment')) {
                shouldRemove = true;
              }
            }
          });
        }
      });

      if (shouldRemove) {
        removeCommentElements();
      }
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // Remove comments immediately when script runs
  removeCommentElements();

  // Remove comments when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeCommentElements);
  } else {
    removeCommentElements();
  }

  // Remove comments after page load
  window.addEventListener('load', removeCommentElements);

  // Start observing for dynamically added comments
  if (document.body) {
    observeDOM();
  } else {
    // Wait for body to be available
    const bodyObserver = new MutationObserver(() => {
      if (document.body) {
        bodyObserver.disconnect();
        observeDOM();
        removeCommentElements();
      }
    });

    bodyObserver.observe(document.documentElement, {
      childList: true
    });
  }

  // Periodic check to ensure comments stay removed (Scratch uses React which may re-render)
  setInterval(removeCommentElements, 1000);

})();
