// Utility to get the message list element
function getMessageList() {
  return document.querySelector('div[role="presentation"]');
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
    hideReferenceFromUserMessages();
  });
}

// Polling mechanism to check for the message list element
function pollForMessageList(callback, maxAttempts = 10, interval = 100) {
  let attempts = 0;
  const intervalId = setInterval(() => {
    const messageList = getMessageList();
    if (messageList) {
      clearInterval(intervalId);
      callback();
    } else if (++attempts >= maxAttempts) {
      clearInterval(intervalId);
      console.error("Message list not found after max polling attempts");
    }
  }, interval);
}

// Function to wait for the 'div[role="presentation"]' to appear and trigger callback
function waitForMessageList(callback) {
  const observer = new MutationObserver((_, obs) => {
    const messageList = getMessageList();
    if (messageList) {
      callback();
      obs.disconnect(); // Stop observing once the element is found
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Fallback polling mechanism
  pollForMessageList(callback);
}

// Event delegation to handle clicks on specific elements
document.body.addEventListener('click', (event) => {
  const target = event.target.closest('nav, [data-testid="create-new-chat-button"]');
  if (target) {
    waitForMessageList(addReferenceButton); // Attach MutationObserver after message list loads
  }

  handleClickEvent(event); // Handle other click events
});

// Initial call to add the MutationObserver when the page first loads
handleMessages();
