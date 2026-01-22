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
        let left = 100;
        let top = 100;

        try {
            // Get display info to center the window
            const displayInfo = await chrome.system.display.getInfo();
            if (displayInfo.length > 0) {
                // Use primary display or the first one
                const primaryDisplay = displayInfo.find(d => d.isPrimary) || displayInfo[0];
                const workArea = primaryDisplay.workArea;

                left = Math.round(workArea.left + (workArea.width - width) / 2);
                top = Math.round(workArea.top + (workArea.height - height) / 2);
            }
        } catch (e) {
            console.log('Error getting display info:', e);
        }

        const win = await chrome.windows.create({
            url: settings.selectedToolUrl,
            type: 'panel',
            width: width,
            height: height,
            left: left,
            top: top,
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
