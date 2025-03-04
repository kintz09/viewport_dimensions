// Initialize default settings when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    enabled: true,
    position: 'top-right',
    fontSize: 'medium',
    textColor: '#ffffff',
    bgColor: '#000000',
    opacity: 0.7
  });
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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSettings') {
    chrome.storage.sync.get({
      enabled: true,
      position: 'top-right',
      fontSize: 'medium',
      textColor: '#ffffff',
      bgColor: '#000000',
      opacity: 0.7
    }, (settings) => {
      sendResponse(settings);
    });
    return true; // Required for async sendResponse
  }
});