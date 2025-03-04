import { ViewportSettings, ExtensionMessage, MessageResponse } from './types';

// Create and inject the viewport dimensions display
let dimensionsDisplay: HTMLDivElement | null = null;
let settings: ViewportSettings = {
  enabled: true,
  position: 'top-right',
  fontSize: 'medium',
  textColor: '#ffffff',
  bgColor: '#000000',
  opacity: 0.7
};

// Initialize the extension
function init(): void {
  // Get saved settings
  chrome.storage.sync.get({
    enabled: true,
    position: 'top-right',
    fontSize: 'medium',
    textColor: '#ffffff',
    bgColor: '#000000',
    opacity: 0.7
  }, (items) => {
    settings = items as ViewportSettings;
    if (settings.enabled) {
      createDimensionsDisplay();
      updateDimensions();
    }
  });
}

// Create the dimensions display element
function createDimensionsDisplay(): void {
  // Remove existing display if it exists
  if (dimensionsDisplay) {
    document.body.removeChild(dimensionsDisplay);
  }

  // Create new display element
  dimensionsDisplay = document.createElement('div');
  dimensionsDisplay.id = 'viewport-dimensions-display';
  
  // Apply styles based on settings
  applyStyles();
  
  // Add to the document
  document.body.appendChild(dimensionsDisplay);
}

// Apply styles based on current settings
function applyStyles(): void {
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
      dimensionsDisplay.style.bottom = 'auto';
      dimensionsDisplay.style.left = 'auto';
      break;
    case 'top-left':
      dimensionsDisplay.style.top = '10px';
      dimensionsDisplay.style.left = '10px';
      dimensionsDisplay.style.bottom = 'auto';
      dimensionsDisplay.style.right = 'auto';
      break;
    case 'bottom-right':
      dimensionsDisplay.style.bottom = '10px';
      dimensionsDisplay.style.right = '10px';
      dimensionsDisplay.style.top = 'auto';
      dimensionsDisplay.style.left = 'auto';
      break;
    case 'bottom-left':
      dimensionsDisplay.style.bottom = '10px';
      dimensionsDisplay.style.left = '10px';
      dimensionsDisplay.style.top = 'auto';
      dimensionsDisplay.style.right = 'auto';
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
function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Update the dimensions display
function updateDimensions(): void {
  if (!dimensionsDisplay || !settings.enabled) return;
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  dimensionsDisplay.textContent = `${width}px × ${height}px`;
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender: chrome.runtime.MessageSender, sendResponse) => {
  if (settings.debug) {
    console.debug('Message received from:', sender.tab?.id || 'popup');
  }
  if (message.action === 'updateSettings') {
    settings = message.settings;
    
    if (settings.enabled) {
      if (!dimensionsDisplay) {
        createDimensionsDisplay();
      } else {
        applyStyles();
      }
      updateDimensions();
    } else if (dimensionsDisplay) {
      document.body.removeChild(dimensionsDisplay);
      dimensionsDisplay = null;
    }
    
    sendResponse({ success: true } as MessageResponse);
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
    
    sendResponse({ success: true } as MessageResponse);
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