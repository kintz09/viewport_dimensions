// Types for the extension settings
export interface ViewportSettings {
  enabled: boolean;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  fontSize: 'small' | 'medium' | 'large';
  textColor: string;
  bgColor: string;
  opacity: number;
  debug?: boolean;
}

// Types for messages between components
export interface ToggleMessage {
  action: 'toggleDisplay';
  enabled: boolean;
}

export interface UpdateSettingsMessage {
  action: 'updateSettings';
  settings: ViewportSettings;
}

export interface GetSettingsMessage {
  action: 'getSettings';
}

export type ExtensionMessage = ToggleMessage | UpdateSettingsMessage | GetSettingsMessage;

export interface MessageResponse {
  success: boolean;
}