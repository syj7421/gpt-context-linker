console.log("content.js activated");


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

// Start observing the document body for changes in child elements
messageObserver.observe(document.body, { childList: true, subtree: true });


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

// Select the parent element where 'prompt-textarea' will be dynamically added
let parentElement = document.body; // or another parent if you know where it will be added

// Create a MutationObserver instance to detect when the textBox is added
let observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    mutation.addedNodes.forEach(function(node) {
      // Check if the added node is the textBox
      if (node.id === 'prompt-textarea') {
        console.log("textbox found");
        
        let target = node.getElementsByTagName('p')[0]; // Access first <p> element inside the textBox
        
        // Create another observer to monitor changes in the <p> element inside textBox
        let textObserver = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
              console.log('Text changed to:', target.innerText);
            }
          });
        });

        // Define the configuration for the text observer
        let config = { childList: true, subtree: true, characterData: true };

        // Start observing the <p> element for text changes
        textObserver.observe(target, config);
      }
    });
  });
});

// Start observing the parent element for child additions
observer.observe(parentElement, { childList: true, subtree: true });




// things to do with submit button
// // Flag to track if the submit button listener is added
// let isListenerAdded = false;

// // MutationObserver to detect the submit button
// const buttonObserver = new MutationObserver((mutations) => {
//     mutations.forEach((mutation) => {
//         if (mutation.addedNodes.length > 0) {
//             const submitButton = document.querySelector('button[data-testid="send-button"]');
//             if (submitButton && !isListenerAdded) {
//                 isListenerAdded = true; 

//             } else if (submitButton && isListenerAdded) {
//                 submitButton.addEventListener('click', function() {
//                   const textBox = document.getElementById('prompt-textarea');
//                   console.log(textBox.getElementsByTagName('p').value);
//                   console.log("submit button clicked");
//               });
//             }
//         }
//     });
// });
// buttonObserver.observe(document.body, { childList: true, subtree: true });






// TODO: atm, event listners only pick up click event, not enter key pressed event