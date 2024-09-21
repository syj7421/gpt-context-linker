console.log("content.js activated");

// Flag to track if the submit button listener is added
let isListenerAdded = false;

// MutationObserver to detect when new GPT messages are added
const messageObserver = new MutationObserver((mutations) => {
    const gptMsg = document.querySelectorAll('[data-message-author-role="assistant"]');

    if (gptMsg.length > 0) {
        gptMsg.forEach((e, idx) => {
            // Create and insert radio buttons if not already present
            if (!e.querySelector('input[type="radio"].gpt-context-linker-radio-class')) {
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.value = idx + 1;
                radio.name = 'gpt-message-radio-name';
                radio.className = 'gpt-context-linker-radio-class';
                e.insertAdjacentElement("afterbegin", radio);
            }
        });
    }
});

// MutationObserver to detect the submit button
const buttonObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
            const submitButton = document.querySelector('button[data-testid="send-button"]');
            if (submitButton && !isListenerAdded) {
                isListenerAdded = true; 

            } else if (submitButton && isListenerAdded) {
                submitButton.addEventListener('click', function() {
                  console.log('Submit button clicked!');
              });
            }
        }
    });
});

// Start observing the document body for changes in child elements
messageObserver.observe(document.body, { childList: true, subtree: true });
buttonObserver.observe(document.body, { childList: true, subtree: true });

// Use event delegation to listen for clicks on radio buttons
document.body.addEventListener('click', (event) => {
    // Check if the clicked element is a radio button
    if (event.target.matches('input[type="radio"]')) {
        console.log(`Radio button with value ${event.target.value} clicked`);
        const correspondingGptMsg = event.target.closest('[data-message-author-role="assistant"]'); // Get the corresponding GPT message
        const messageParagraph = correspondingGptMsg.querySelector('p');
        if (messageParagraph) {
            console.log(messageParagraph.innerText); 
        }
    }
});
