// AI Hub Pro - Content Script
// Handles popup management on web pages

(function () {
    'use strict';

    // Prevent double injection
    if (window.aiHubProInjected) return;
    window.aiHubProInjected = true;

    console.log('AI Hub Pro content script loaded');

    let popupWindow = null;
    let currentUrl = null;

    // Open or toggle the popup window
    function togglePopup(url, toolName) {
        console.log('Toggle popup:', url, toolName);

        // If popup exists and is open, close it (toggle behavior)
        if (popupWindow && !popupWindow.closed) {
            popupWindow.close();
            popupWindow = null;
            showNotification(`${toolName} closed`);
            return;
        }

        currentUrl = url;

        // Calculate center position
        const width = 550;
        const height = 700;
        const left = Math.round((window.screen.width - width) / 2);
        const top = Math.round((window.screen.height - height) / 2);

        // Open new popup window in center
        popupWindow = window.open(
            url,
            'ai-hub-pro-popup',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (popupWindow) {
            popupWindow.focus();
            showNotification(`${toolName} opened! Press Alt+A again to close.`);
        } else {
            showNotification('Popup blocked! Please allow popups for this site.');
        }
    }

    // Hide/close the popup
    function hidePopup() {
        console.log('Hiding popup');
        if (popupWindow && !popupWindow.closed) {
            popupWindow.close();
            popupWindow = null;
            currentUrl = null;
            showNotification('AI tool closed');
        }
    }

    function showNotification(message) {
        console.log('Showing notification:', message);
        // Remove existing notification
        const existing = document.querySelector('.ai-hub-notification');
        if (existing) existing.remove();

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'ai-hub-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Remove after 2 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('Content script received message:', request);

        if (request.action === 'toggle-overlay') {
            togglePopup(request.url, request.toolName);
            sendResponse({ success: true });
        } else if (request.action === 'hide-overlay') {
            hidePopup();
            sendResponse({ success: true });
        } else if (request.action === 'show-notification') {
            showNotification(request.message);
            sendResponse({ success: true });
        }

        return true;
    });

})();
