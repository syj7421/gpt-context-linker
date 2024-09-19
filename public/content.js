// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "start-tagging") {
    // Select all GPT response messages (modify class selector if needed)
    const messages = document.querySelectorAll('.text-message');
    messages.forEach((message) => {
      // Create a checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style.marginRight = '10px';

      // Insert the checkbox before the message content
      if (!message.querySelector('input[type="checkbox"]')) {
        message.insertBefore(checkbox, message.firstChild);
      }
    });
  }
});
