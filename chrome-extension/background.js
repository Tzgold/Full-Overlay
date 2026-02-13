// AI Hub Pro - Background Service Worker

const STORAGE_KEY = 'ai_hub_pro_settings_v3';
const WINDOW_ID_KEY = 'overlay_active_window_id';

// Helper to get/set active window ID
async function getActiveWindowId() {
    const result = await chrome.storage.local.get([WINDOW_ID_KEY]);
    return result[WINDOW_ID_KEY];
}

async function setActiveWindowId(id) {
    if (id === null) {
        await chrome.storage.local.remove([WINDOW_ID_KEY]);
    } else {
        await chrome.storage.local.set({ [WINDOW_ID_KEY]: id });
    }
}

let isProcessing = false;

// Listen for keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
    console.log('Command received:', command);

    if (command === 'toggle-overlay') {
        if (isProcessing) return;
        isProcessing = true;

        try {
            const result = await chrome.storage.local.get([STORAGE_KEY]);
            const settings = result[STORAGE_KEY];

            if (!settings || !settings.selectedToolUrl) {
                // No tool selected — just log it, no injection needed
                console.warn('No Quick Tool selected. User needs to pick one from the popup.');
                isProcessing = false;
                return;
            }

            // Check if window already exists
            const activeWindowId = await getActiveWindowId();

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
                    // Window doesn't exist anymore
                    await setActiveWindowId(null);
                }
            }

            // Create new window
            const width = 550;
            const height = 700;
            let left = 100;
            let top = 100;

            try {
                const displayInfo = await chrome.system.display.getInfo();
                if (displayInfo.length > 0) {
                    const primaryDisplay = displayInfo.find(d => d.isPrimary) || displayInfo[0];
                    const workArea = primaryDisplay.workArea;
                    left = Math.round(workArea.left + (workArea.width - width) / 2);
                    top = Math.round(workArea.top + (workArea.height - height) / 2);
                }
            } catch (e) {
                console.log('Display info unavailable, using defaults');
            }

            const win = await chrome.windows.create({
                url: settings.selectedToolUrl,
                type: 'popup',
                width: width,
                height: height,
                left: left,
                top: top,
                focused: true
            });

            await setActiveWindowId(win.id);
        } catch (err) {
            console.error('Error in toggle-overlay:', err);
        } finally {
            isProcessing = false;
        }
    }
});

// Clean up when window is closed
chrome.windows.onRemoved.addListener(async (windowId) => {
    const activeWindowId = await getActiveWindowId();
    if (windowId === activeWindowId) {
        await setActiveWindowId(null);
    }
});
