// Utility to get the message list element
function getMessageList() {
    return document.querySelector('div[role="presentation"]');
  }
  
  function addButtonToMessages() {
    const messages = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
    messages.forEach((msg, idx) => {
        const assistantDiv = msg.querySelector('div[data-message-author-role="assistant"]');
        if (assistantDiv && !msg.querySelector('button.add-to-reference-sidebar-button')) {
            const btn = document.createElement('button');
            btn.value = String(idx);
            btn.name = 'gpt-message-button';
            btn.className = 'add-to-reference-sidebar-button';
            btn.title = 'Add to reference sidebar';

            // Create an SVG element and append it to the button
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("fill", "#000000");
            svg.setAttribute("viewBox", "0 0 24 24");
            svg.setAttribute("width", "24");
            svg.setAttribute("height", "24");
            svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

            const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path1.setAttribute("d", "M16.5 2.25a.75.75 0 01.75-.75h5.5a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0V4.06l-6.22 6.22a.75.75 0 11-1.06-1.06L20.94 3h-3.69a.75.75 0 01-.75-.75z");

            const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path2.setAttribute("d", "M3.25 4a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h2.5a.75.75 0 01.75.75v3.19l3.72-3.72a.75.75 0 01.53-.22h10a.25.25 0 00.25-.25v-6a.75.75 0 011.5 0v6a1.75 1.75 0 01-1.75 1.75h-9.69l-3.573 3.573A1.457 1.457 0 015 21.043V18.5H3.25a1.75 1.75 0 01-1.75-1.75V4.25c0-.966.784-1.75 1.75-1.75h11a.75.75 0 010 1.5h-11z");

            // Append paths to the SVG
            svg.appendChild(path1);
            svg.appendChild(path2);

            // Append the SVG to the button
            btn.appendChild(svg);

            // Insert the button into the DOM
            assistantDiv.insertAdjacentElement("afterbegin", btn);
        }
    });
}


function hideReferenceFromUserMessages() {
    // const messages = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
    // messages.forEach((msg) => {
    //     const userMessageDiv = msg.querySelector('div[data-message-author-role="user"]');
    //     if (userMessageDiv) {
    //         const userText = userMessageDiv.textContent;
            
    //         // Check if both "Reference:" and "Query:" exist in the text
    //         if (userText.includes('Reference:') && userText.includes('Query:')) {
    //             // Remove the text from "Reference:" to "Query:"
    //             const cleanedText = userText.replace(/Reference:\s*.*?\s*Query:\s*/, '');
    //             userMessageDiv.textContent = cleanedText;
    //         }
    //     }
    // });
}


// Function to observe the message list for changes and act accordingly
function observeMessages(callback) {
    const messageList = getMessageList();
    if (!messageList) {
        console.error("Message list not found");
        return;
    }

    const messageObserver = new MutationObserver(callback);
    messageObserver.observe(messageList, { childList: true, subtree: true });

    return messageObserver; // Return observer to manage or disconnect later if needed
}

// Function to add MutationObserver to detect new messages and trigger actions
function handleMessages() {
    observeMessages(() => {
        addButtonToMessages();
        // hideReferenceFromUserMessages();
    });
}

// Polling mechanism to check for the message list element
function pollForMessageList(callback, observer, maxAttempts = 10, interval = 100) {
    let attempts = 0;
    const intervalId = setInterval(() => {
        const messageList = getMessageList();
        if (messageList) {
            clearInterval(intervalId);
            if (observer) observer.disconnect(); // Disconnect the observer
            callback();
        } else if (++attempts >= maxAttempts) {
            clearInterval(intervalId);
            if (observer) observer.disconnect(); // Disconnect the observer
            console.error("Message list not found after max polling attempts");
        }
    }, interval);
}

// Function to wait for the 'div[role="presentation"]' to appear and trigger callback
function waitForMessageList(callback) {
    const observer = new MutationObserver((_, obs) => {
        const messageList = getMessageList();
        if (messageList) {
            obs.disconnect(); // Stop observing once the element is found
            callback();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Pass the observer to the polling mechanism
    pollForMessageList(callback, observer);
}



/* TODO: 
1. remove Chat GPT said prefix
2. enable enter submit as well 
3. lots of errors in const msgElements = gptResponse.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img, code, li');
   especially, img, code, laTex(span tag), also did not include table, or any other value
   definitely more effective way to store a gpt response, best to remove redundant parts
4. Local storage
5. UI/UX

*/