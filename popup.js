document.addEventListener('DOMContentLoaded', () => {
  const enableToggle = document.getElementById('enableToggle');
  const positionSelect = document.getElementById('position');
  const fontSizeSelect = document.getElementById('fontSize');
  const textColorInput = document.getElementById('textColor');
  const bgColorInput = document.getElementById('bgColor');
  const opacityInput = document.getElementById('opacity');
  const opacityValue = document.getElementById('opacityValue');
  const saveButton = document.getElementById('saveSettings');
  const timeoutInput = document.getElementById('timeout');
  const alwaysShowCheckbox = document.getElementById('alwaysShow');

  // Load saved settings
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
    enableToggle.checked = items.enabled;
    positionSelect.value = items.position;
    fontSizeSelect.value = items.fontSize;
    textColorInput.value = items.textColor;
    bgColorInput.value = items.bgColor;
    opacityInput.value = items.opacity;
    opacityValue.textContent = items.opacity;
    timeoutInput.value = items.timeout;
    alwaysShowCheckbox.checked = items.alwaysShow;
    timeoutInput.disabled = items.alwaysShow;
  });

  // Update opacity value display
  opacityInput.addEventListener('input', () => {
    opacityValue.textContent = opacityInput.value;
  });

  // Handle "Always Show" toggle
  alwaysShowCheckbox.addEventListener('change', () => {
    timeoutInput.disabled = alwaysShowCheckbox.checked;
  });

  // Save settings
  saveButton.addEventListener('click', () => {
    const settings = {
      enabled: enableToggle.checked,
      position: positionSelect.value,
      fontSize: fontSizeSelect.value,
      textColor: textColorInput.value,
      bgColor: bgColorInput.value,
      opacity: parseFloat(opacityInput.value),
      timeout: alwaysShowCheckbox.checked ? 0 : parseInt(timeoutInput.value),
      alwaysShow: alwaysShowCheckbox.checked
    };

    chrome.storage.sync.set(settings, () => {
      // Notify content script about the updated settings
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'updateSettings', 
            settings: settings 
          }, (response) => {
            if (response && response.success) {
              console.log('Settings updated successfully');
            } else {
              console.error('Failed to update settings');
            }
          });
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
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'toggleDisplay', 
          enabled: enabled 
        });
      }
    });
  });
});