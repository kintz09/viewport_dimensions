import { ViewportSettings, UpdateSettingsMessage, ToggleMessage } from './types';

document.addEventListener('DOMContentLoaded', () => {
  const enableToggle = document.getElementById('enableToggle') as HTMLInputElement;
  const positionSelect = document.getElementById('position') as HTMLSelectElement;
  const fontSizeSelect = document.getElementById('fontSize') as HTMLSelectElement;
  const textColorInput = document.getElementById('textColor') as HTMLInputElement;
  const bgColorInput = document.getElementById('bgColor') as HTMLInputElement;
  const opacityInput = document.getElementById('opacity') as HTMLInputElement;
  const opacityValue = document.getElementById('opacityValue') as HTMLSpanElement;
  const saveButton = document.getElementById('saveSettings') as HTMLButtonElement;

  // Load saved settings
  chrome.storage.sync.get({
    enabled: true,
    position: 'top-right',
    fontSize: 'medium',
    textColor: '#ffffff',
    bgColor: '#000000',
    opacity: 0.7
  }, (items) => {
    const settings = items as ViewportSettings;
    enableToggle.checked = settings.enabled;
    positionSelect.value = settings.position;
    fontSizeSelect.value = settings.fontSize;
    textColorInput.value = settings.textColor;
    bgColorInput.value = settings.bgColor;
    opacityInput.value = settings.opacity.toString();
    opacityValue.textContent = settings.opacity.toString();
  });

  // Update opacity value display
  opacityInput.addEventListener('input', () => {
    opacityValue.textContent = opacityInput.value;
  });

  // Save settings
  saveButton.addEventListener('click', () => {
    const settings: ViewportSettings = {
      enabled: enableToggle.checked,
      position: positionSelect.value as ViewportSettings['position'],
      fontSize: fontSizeSelect.value as ViewportSettings['fontSize'],
      textColor: textColorInput.value,
      bgColor: bgColorInput.value,
      opacity: parseFloat(opacityInput.value)
    };

    chrome.storage.sync.set(settings, () => {
      // Notify content script about the updated settings
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          const message: UpdateSettingsMessage = { 
            action: 'updateSettings', 
            settings: settings 
          };
          chrome.tabs.sendMessage(tabs[0].id, message);
        }
      });

      // Visual feedback
      saveButton.textContent = 'Saved!';
      setTimeout(() => {
        saveButton.textContent = 'Save Settings';
      }, 1500);
    });
  });

  // Toggle enable/disable immediately
  enableToggle.addEventListener('change', () => {
    const enabled = enableToggle.checked;
    chrome.storage.sync.set({ enabled: enabled });
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        const message: ToggleMessage = { 
          action: 'toggleDisplay', 
          enabled: enabled 
        };
        chrome.tabs.sendMessage(tabs[0].id, message);
      }
    });
  });
});