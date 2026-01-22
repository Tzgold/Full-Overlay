// AI Hub Pro - Background Service Worker

const STORAGE_KEY = 'ai_hub_pro_settings_v3';

// Listen for keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
    console.log('Command received:', command);

    // Get the active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];

    if (!tab || !tab.id) {
        console.log('No active tab found');
        return;
    }

    // Skip chrome:// and other restricted pages
    if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-extension://') || tab.url?.startsWith('edge://')) {
        console.log('Restricted page, skipping');
        return;
    }

    if (command === 'toggle-overlay') {
        // Get the selected tool URL from storage
        const result = await chrome.storage.local.get([STORAGE_KEY]);
        const settings = result[STORAGE_KEY];

        console.log('Settings:', settings);

        if (settings && settings.selectedToolUrl) {
            // First, make sure content script is injected
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                });
                await chrome.scripting.insertCSS({
                    target: { tabId: tab.id },
                    files: ['content.css']
                });
            } catch (e) {
                // Script might already be injected, that's ok
                console.log('Script injection:', e.message);
            }

            // Send message to content script
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'toggle-overlay',
                    url: settings.selectedToolUrl,
                    toolName: settings.selectedToolName || 'AI Tool'
                });
                console.log('Message sent successfully');
            } catch (e) {
                console.error('Error sending message:', e);
            }
        } else {
            // If no tool selected, try to show notification
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                });
                await chrome.scripting.insertCSS({
                    target: { tabId: tab.id },
                    files: ['content.css']
                });
            } catch (e) {
                console.log('Script injection:', e.message);
            }

            try {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'show-notification',
                    message: 'Please select a Quick Tool from AI Hub Pro first! Click the pin icon next to any tool.'
                });
            } catch (e) {
                console.error('Error sending notification:', e);
            }
        }
    } else if (command === 'hide-overlay') {
        try {
            await chrome.tabs.sendMessage(tab.id, {
                action: 'hide-overlay'
            });
            console.log('Hide message sent');
        } catch (e) {
            console.error('Error hiding overlay:', e);
        }
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

console.log('AI Hub Pro background script loaded');
