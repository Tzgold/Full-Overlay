// AI Hub Pro - Content Script
// Handles only notifications now (Window management moved to background script)

(function () {
    'use strict';

    // Prevent double injection
    if (window.aiHubProInjected) return;
    window.aiHubProInjected = true;

    console.log('AI Hub Pro content script loaded');

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

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'show-notification') {
            showNotification(request.message);
            sendResponse({ success: true });
        }
        return true;
    });

})();
