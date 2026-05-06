const originalPostMessage = window.postMessage.bind(window);

window.postMessage = (message: any, targetOrigin: any, ...args: any[]) => {
    // Check for null value or "null" string
    if (targetOrigin === null || targetOrigin === 'null') {
        // Default to '*' to allow the message to be sent
        targetOrigin = '*';
    }
    return originalPostMessage(message, targetOrigin, ...args);
};
