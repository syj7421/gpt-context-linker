console.log("Content script is running...");

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "start-tagging") {
    // Select only GPT's responses using the attribute `data-message-author-role="assistant"`
    const messages = document.querySelectorAll('[data-message-author-role="assistant"]');
    
    // Log the messages NodeList to check if any elements are selected
    console.log("Messages found: ", messages);

    if (messages.length === 0) {
      console.log("No messages found.");
    }

    messages.forEach((message, index) => {
      // Create a radio button instead of a checkbox
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'gpt-response'; // All radios need the same name to ensure only one is selected at a time
      radio.style.marginRight = '10px';
      radio.classList.add('gpt-context-linker-checkbox');
      
      // Insert the radio button before the message content, if it's not already there
      if (!message.querySelector('input[type="radio"]')) {
        message.insertBefore(radio, message.firstChild);
        console.log("Radio button added to message.");
      }
    });
  }
});


