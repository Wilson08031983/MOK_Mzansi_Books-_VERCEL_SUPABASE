// Test script for sidebar behavior
// This will:
// 1. Toggle the hideSidebar setting
// 2. Check if the localStorage is updated correctly
// 3. Log the behavior for manual verification

// Get current settings
function getAppSettings() {
  const settingsStr = localStorage.getItem('app.settings');
  if (!settingsStr) return null;
  try {
    return JSON.parse(settingsStr);
  } catch (err) {
    console.error('Error parsing settings:', err);
    return null;
  }
}

// Initialize settings if they don't exist
function initializeSettings() {
  const currentSettings = getAppSettings();
  if (!currentSettings) {
    const defaultSettings = {
      layout: {
        hideSidebar: false
      }
    };
    localStorage.setItem('app.settings', JSON.stringify(defaultSettings));
    console.log('Initialized default settings:', defaultSettings);
    return defaultSettings;
  }
  
  // Ensure the layout.hideSidebar property exists
  if (!currentSettings.layout) {
    currentSettings.layout = {};
  }
  if (currentSettings.layout.hideSidebar === undefined) {
    currentSettings.layout.hideSidebar = false;
    localStorage.setItem('app.settings', JSON.stringify(currentSettings));
    console.log('Added hideSidebar setting to existing settings:', currentSettings);
  }
  
  return currentSettings;
}

// Toggle the hideSidebar setting
function toggleHideSidebar() {
  const settings = initializeSettings();
  settings.layout.hideSidebar = !settings.layout.hideSidebar;
  localStorage.setItem('app.settings', JSON.stringify(settings));
  console.log(`Toggled hideSidebar to: ${settings.layout.hideSidebar}`);
  
  // Dispatch storage event to simulate change from another tab
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'app.settings',
    newValue: JSON.stringify(settings),
    storageArea: localStorage
  }));
  
  return settings.layout.hideSidebar;
}

// Run the test - toggle hideSidebar and log the current state
function runTest() {
  console.log('--- Starting Sidebar Behavior Test ---');
  
  // Get initial state
  const initialSettings = getAppSettings();
  console.log('Initial settings:', initialSettings);
  
  // Toggle the setting
  const hideSidebarEnabled = toggleHideSidebar();
  
  console.log(`
Test Results:
- hideSidebar is now: ${hideSidebarEnabled}
- If hideSidebar is TRUE, the sidebar should auto-hide on mobile
- If hideSidebar is FALSE, the sidebar should behave normally

On mobile:
- Try refreshing the page - sidebar should be hidden if hideSidebar is true
- Try opening the sidebar - it should stay closed if hideSidebar is true
- Try toggling the setting in MobileSettingsTab - sidebar should hide immediately when enabled

Run this test again to toggle the setting back.
  `);
}

// Execute test
runTest();
