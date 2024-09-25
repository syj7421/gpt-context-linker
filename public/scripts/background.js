chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "store") {
        chrome.storage.local.set({ [request.key]: request.value }, () => {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError });
            } else {
                sendResponse({ success: true });
            }
        });
        return true;  // 异步响应
    }

    if (request.action === "get") {
        chrome.storage.local.get([request.key], (result) => {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError });
            } else {
                sendResponse({ success: true, value: result[request.key] });
            }
        });
        return true;  // 异步响应
    }
});


