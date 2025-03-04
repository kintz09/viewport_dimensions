(function() {
  // Create and inject the viewport dimensions display
  let dimensionsDisplay = null;
  let settings = {
    enabled: true,
    position: 'top-right',
    fontSize: 'medium',
    textColor: '#ffffff',
    bgColor: '#000000',
    opacity: 0.7,
    timeout: 1000,
    alwaysShow: false
  };

  let hideTimeout = null;

  // Initialize the extension
  function init() {
    // Get saved settings
    chrome.storage.sync.get({
      enabled: true,
      position: 'top-right',
      fontSize: 'medium',
      textColor: '#ffffff',
      bgColor: '#000000',
      opacity: 0.7,
      timeout: 1000,
      alwaysShow: false
    }, (items) => {
      settings = items;
      if (settings.enabled) {
        createDimensionsDisplay();
        updateDimensions();
      }
    });
  }

  // Create the dimensions display element
  function createDimensionsDisplay() {
    // Remove existing display if it exists
    if (dimensionsDisplay) {
      document.body.removeChild(dimensionsDisplay);
    }

    // Create new display element
    dimensionsDisplay = document.createElement('div');
    dimensionsDisplay.id = 'viewport-dimensions-display';
    
    // Apply styles based on settings
    applyStyles();
    
    // Add transition for opacity
    dimensionsDisplay.style.transition = 'opacity 0.3s ease-in-out';
    
    // Add to the document
    document.body.appendChild(dimensionsDisplay);
  }

  // Apply styles based on current settings
  function applyStyles() {
    if (!dimensionsDisplay) return;

    // Base styles
    dimensionsDisplay.style.position = 'fixed';
    dimensionsDisplay.style.zIndex = '9999999';
    dimensionsDisplay.style.padding = '6px 10px';
    dimensionsDisplay.style.borderRadius = '4px';
    dimensionsDisplay.style.fontFamily = 'monospace';
    dimensionsDisplay.style.pointerEvents = 'none';

    // Position
    switch (settings.position) {
      case 'top-right':
        dimensionsDisplay.style.top = '10px';
        dimensionsDisplay.style.right = '10px';
        break;
      case 'top-left':
        dimensionsDisplay.style.top = '10px';
        dimensionsDisplay.style.left = '10px';
        break;
      case 'bottom-right':
        dimensionsDisplay.style.bottom = '10px';
        dimensionsDisplay.style.right = '10px';
        break;
      case 'bottom-left':
        dimensionsDisplay.style.bottom = '10px';
        dimensionsDisplay.style.left = '10px';
        break;
    }

    // Font size
    switch (settings.fontSize) {
      case 'small':
        dimensionsDisplay.style.fontSize = '12px';
        break;
      case 'medium':
        dimensionsDisplay.style.fontSize = '14px';
        break;
      case 'large':
        dimensionsDisplay.style.fontSize = '16px';
        break;
    }

    // Colors
    dimensionsDisplay.style.color = settings.textColor;
    dimensionsDisplay.style.backgroundColor = hexToRgba(settings.bgColor, settings.opacity);
  }

  // Convert hex color to rgba
  function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Update the dimensions display
  function updateDimensions() {
    if (!dimensionsDisplay || !settings.enabled) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    dimensionsDisplay.textContent = `${width}px × ${height}px`;
    showDimensions();
  }

  function showDimensions() {
    if (!dimensionsDisplay || !settings.enabled) return;

    // Clear any existing timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }

    // Show the display
    dimensionsDisplay.style.opacity = '1';

    // Set timeout to hide if needed
    if (settings.timeout > 0) {
      hideTimeout = setTimeout(() => {
        dimensionsDisplay.style.opacity = '0';
      }, settings.timeout);
    }
  }

  // Handle messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateSettings') {
      const oldTimeout = settings.timeout;
      settings = message.settings;

      if (settings.enabled) {
        if (!dimensionsDisplay) {
          createDimensionsDisplay();
        } else {
          applyStyles();
        }
        updateDimensions();

        // If timeout setting changed, update visibility
        if (oldTimeout !== settings.timeout) {
          showDimensions();
        }
      } else if (dimensionsDisplay) {
        document.body.removeChild(dimensionsDisplay);
        dimensionsDisplay = null;
      }

      sendResponse({ success: true });
    } else if (message.action === 'toggleDisplay') {
      settings.enabled = message.enabled;

      if (settings.enabled) {
        if (!dimensionsDisplay) {
          createDimensionsDisplay();
          updateDimensions();
        }
      } else if (dimensionsDisplay) {
        document.body.removeChild(dimensionsDisplay);
        dimensionsDisplay = null;
      }

      sendResponse({ success: true });
    }
  });

  // Listen for window resize events
  window.addEventListener('resize', updateDimensions);

  // Initialize when the content script loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();