import { ViewportSettings } from './types';

// Initialize default settings when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  const defaultSettings: ViewportSettings = {
    enabled: true,
    position: 'top-right',
    fontSize: 'medium',
    textColor: '#ffffff',
    bgColor: '#000000',
    opacity: 0.7,
    debug: false
  };
  
  chrome.storage.sync.set(defaultSettings);
});

// Listen for tab updates to inject the content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(err => console.error('Failed to inject content script:', err));
  }
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender: chrome.runtime.MessageSender, sendResponse) => {
  const defaultSettings: ViewportSettings = {
    enabled: true,
    position: 'top-right',
    fontSize: 'medium',
    textColor: '#ffffff',
    bgColor: '#000000',
    opacity: 0.7,
    debug: false
  };

  if (defaultSettings.debug) {
    console.debug('Message received from:', sender.tab?.id || 'popup');
  }
  if (message.action === 'getSettings') {
    chrome.storage.sync.get(defaultSettings, (settings) => {
      sendResponse(settings as ViewportSettings);
    });
    return true; // Required for async sendResponse
  }
  return true;
});