console.log("script loaded333");

/* 
THINGS I HAVE LEARNED:
1. use mutation observer for dynamic elements, use event listner for static elements, 
   check whether it is dynamic or static by disabling JS
2. use event delegation for dynamic elements
3. event listeners may not work the way you expect because you are clicking at the inner element 
   e.g. there is <li><a>blah </a></li> ,you thought you are clicking at li but you are actually clicking at a
   use cloest method to deal with this
4. check whether or not the tag flashes when interacted, flashing means it is replaced, hence any mutation
   observer or listener will be gone!
*/

/* TODO: 
1. atm, event listners only pick up click event, not enter key pressed event

*/

// MutationObserver to detect when new GPT messages are added
const messageObserver = new MutationObserver((mutations) => {
  addRadioButton();
});
let msgStream = document.querySelector('[role="presentation"]');
messageObserver.observe(document.body, { childList: true, subtree: true });

function addRadioButton() {
  const gptMsg = document.querySelectorAll('[data-message-author-role="assistant"]');
  if (gptMsg.length > 0) {
      gptMsg.forEach((e, idx) => {
          // Create and insert radio buttons if not already present
          if (!e.querySelector('input[type="checkbox"].gpt-context-linker-checkbox-class')) {
              const checkbox = document.createElement('input');
              checkbox.type = 'checkbox';
              checkbox.value = idx + 1;
              checkbox.name = 'gpt-message-checkbox-name';
              checkbox.className = 'gpt-context-linker-checkbox-class';
              e.insertAdjacentElement("afterbegin", checkbox);
              console.log("Checkbox button added to GPT message");
          }
      });  
  }
}

document.body.addEventListener('click', (event) => {
  console.log('Click event detected', event.target); // Add this to see if the event listener is triggered at all
  console.log(event.target.tagName);
  // Check if the clicked element is a radio button
  if (event.target.matches('input[type="checkbox"]')) {
      console.log(`Checkbox button with value ${event.target.value} clicked`);
      const correspondingGptMsg = event.target.closest('[data-message-author-role="assistant"]'); // Get the corresponding GPT message
      const messageParagraph = correspondingGptMsg.querySelector('p');
      if (messageParagraph) {
          console.log(messageParagraph.innerText); 
      }
  }

  else if (event.target.closest('button[data-testid="send-button"]')){
    const txt = document.getElementById('prompt-textarea');
    console.log("before" + txt.innerHTML);
    const outputHTML = "<p>Please output the text 'test success' without interpretation." + txt.innerText + "</p>";
    txt.innerHTML = outputHTML; // Display the output
    console.log("after:" + txt.innerHTML);
    console.log("Submit button clicked");
  }

});










// // Create a MutationObserver instance to detect when the textBox is added
// let observer = new MutationObserver(function(mutations) {
//   mutations.forEach(function(mutation) {
//     mutation.addedNodes.forEach(function(node) {
//       // Check if the added node is the textBox
//       if (node.id === 'prompt-textarea') {
//         console.log("textbox found");
        
//         let target = node.getElementsByTagName('p')[0]; // Access first <p> element inside the textBox
        
//         // Create another observer to monitor changes in the <p> element inside textBox
//         let textObserver = new MutationObserver(function(mutations) {
//           mutations.forEach(function(mutation) {
//             if (mutation.type === 'childList' || mutation.type === 'characterData') {
//               console.log('Text changed to1:', target.innerText);
//             }
//           });
//         });

//         // Define the configuration for the text observer
//         let config = { childList: true, subtree: true, characterData: true };

//         // Start observing the <p> element for text changes
//         textObserver.observe(target, config);

//         // Handle radio button clicks
//         const radios = document.querySelectorAll('.gpt-context-linker-radio-class');
        
//         // Add event listener to all radios
//         radios.forEach(function(radio) {
//           radio.addEventListener('click', function() {
//             // Check if the radio button is selected
//             if (radio.checked) {
//               // Append the prefix to the <p> element if a radio is selected
//               const prefix = "testing: say test succeeded first when you response ";
//               target.innerText = prefix + target.innerText;  // Append the prefix
//               console.log('Prefix appended:', target.innerText);
//             }
//             else{
//               console.log("prefix not appended");
//             }
//           });
//         });

//         // Check if no radio buttons exist or if none of them are selected
//         if (radios.length === 0 || !Array.from(radios).some(radio => radio.checked)) {
//           console.log("No radio buttons found or none are selected.");
//           // Do nothing if no radio is selected or none exist
//         }
//       }
//     });
//   });
// });

// // Start observing the parent element for child additions
// observer.observe(document.body, { childList: true, subtree: true });







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






