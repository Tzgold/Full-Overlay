// AI Hub Pro - Background Service Worker

const STORAGE_KEY = 'ai_hub_pro_settings_v3';
let activeWindowId = null;

// Listen for keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
    console.log('Command received:', command);

    if (command === 'toggle-overlay') {
        const result = await chrome.storage.local.get([STORAGE_KEY]);
        const settings = result[STORAGE_KEY];

        if (!settings || !settings.selectedToolUrl) {
            // Notify user to select a tool
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs[0] && tabs[0].id) {
                try {
                    // Ensure content script is ready
                    await chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        files: ['content.js']
                    });
                    await chrome.scripting.insertCSS({
                        target: { tabId: tabs[0].id },
                        files: ['content.css']
                    });

                    await chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'show-notification',
                        message: 'Please select a Quick Tool first! Click the pin icon in the extension popup.'
                    });
                } catch (e) {
                    console.error('Notification error:', e);
                }
            }
            return;
        }

        // Check if window exists
        if (activeWindowId) {
            try {
                const win = await chrome.windows.get(activeWindowId);

                // If window is focused, minimize it
                if (win.focused) {
                    await chrome.windows.update(activeWindowId, { state: 'minimized' });
                } else {
                    // If not focused (or minimized), bring to front
                    await chrome.windows.update(activeWindowId, { focused: true, state: 'normal' });
                }
                return;
            } catch (e) {
                // Window doesn't exist anymore (user closed it manually)
                activeWindowId = null;
            }
        }

        // Create new window
        const width = 550;
        const height = 700;

        // Calculate center (approximate, as we don't have screen dimensions in SW easily, 
        // but we can default to some reasonable offset or let OS decide, 
        // or use the current window to guess)
        // chrome.windows.create allows 'left' and 'top'.

        const win = await chrome.windows.create({
            url: settings.selectedToolUrl,
            type: 'popup',
            width: width,
            height: height,
            focused: true
        });

        activeWindowId = win.id;
    }
});

// Listen for messages from popup to set selected tool
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'set-selected-tool') {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
            const settings = result[STORAGE_KEY] || {};
            settings.selectedToolUrl = request.url;
            settings.selectedToolName = request.name;
            chrome.storage.local.set({ [STORAGE_KEY]: settings }, () => {
                sendResponse({ success: true });
            });
        });
        return true;
    }
});
