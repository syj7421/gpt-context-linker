// Utility to get the message list element
function getMessageList() {
    return document.querySelector('div[role="presentation"]');
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
1. li click을 if else if로 처리? nav를 else if 로 둠
2. same text already exist V <-- doesn't really work for long 
3. ref storage max 10, ref at the same time max 3? V
4. checkbox reset after submit V
5. also when the stream changes *** or reset checkbox when stream changes V
5a: what if the user manaully deletes the reference part?
5b: what if the reference if deleted from the sidebar?
6. remove Chat GPT said prefix , lots of errors in const msgElements = gptResponse.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img, code, li');
   especially, img, code, laTex(span tag), also did not include table, or any other value
   - definitely more effective way to store a gpt response, best to remove redundant parts, some eror with "same text already exist as well maybe relate to this?"
7. Local storage / Sync? 
8. UI/UX

*/