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
5. Use data-* attributes (like data-testid, data-message-id, etc.):
Websites often use data-* attributes for testing or tracking purposes, which are less likely to change compared to classes or IDs. If these attributes are present (as in your case with data-testid), prioritize them over classes or IDs.
Benefit: These attributes are typically more stable than CSS classes or IDs.
*/

/* TODO: 
1. atm, event listners only pick up click event, not enter key pressed event
2. change checkbox to button, when button is clicked added to the widget, when clicked again, compare whehter the equal
   thing already exists, if yes, throw an error

*/

// MutationObserver to detect when new GPT messages are added
const messageObserver = new MutationObserver((mutations) => {
  addButton();
});
let msgStream = document.querySelector('[role="presentation"]');
messageObserver.observe(document.body, { childList: true, subtree: true });

function addButton() {
  // this is because I have noticed, seldomly multiple div with data-message-author-role="assistant" are generated within one gpt response, not sure whether it is a bug or sth
  const messages = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
  gptMessages = Array.from(messages).filter(msg => msg.querySelector('div[data-message-author-role="assistant"]') !== null);
  if (gptMessages.length > 0){
    gptMessages.forEach((msg,idx) => {
      const assistantDiv = msg.querySelector('div[data-message-author-role="assistant"]');
      if (!msg.querySelector('button.gpt-context-linker-button-class')) {
        const btn = document.createElement('button');
        btn.textContent = 'Add to reference';
        btn.value = String(idx);
        btn.name = 'gpt-message-button';
        btn.className = 'gpt-context-linker-button-class';
        assistantDiv.insertAdjacentElement("afterbegin", btn);
        console.log("Button added to GPT message");
      }
    })
  }

}

document.body.addEventListener('click', (event) => {
  console.log('Click event detected', event.target); // Add this to see if the event listener is triggered at all
  console.log(event.target.tagName);
  // Check if the clicked element is a radio button
  if (event.target.matches('button.gpt-context-linker-button-class')) {
    console.log(`Button with value ${event.target.value} clicked`);
    const correspondingGptMsg = event.target.closest('article[data-testid^="conversation-turn-"]'); // Get the corresponding GPT message
    const msgElements = correspondingGptMsg.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img, code'); // Select relevant elements
    
    const newWidgetItem = document.createElement('div');
    
    msgElements.forEach(e => {
        const clonedElement = e.cloneNode(true); // Clone to avoid moving elements
        newWidgetItem.appendChild(clonedElement);
    });

    const widget = document.querySelector(".widget"); 

    if (widget) {
        widget.appendChild(newWidgetItem);
    } else {
        console.error("Widget not found!");
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












