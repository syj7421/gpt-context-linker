document.body.addEventListener('click', handleClickEvent);

function handleClickEvent(event) {

    if (event.target.closest('nav, [data-testid="create-new-chat-button"]')) {
      waitForMessageList(handleMessages); // Attach MutationObserver after message list loads
    }
    else if (event.target.closest('.add-to-reference-sidebar-button')) {
        console.log("add to reference button clicked");
        const gptResponse = event.target.closest('article[data-testid^="conversation-turn-"]');
            const msgElements = gptResponse.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img, code, li');
            const newRef = createNewReference(msgElements);
            const refSidebar = document.querySelector('.reference-sidebar-content');

            // Check if the content is already present in the sidebar
            if (refSidebar && !refSidebar.innerText.includes(newRef.innerText)) {
            refSidebar.appendChild(newRef);
            } else if (!refSidebar) {
            console.error('Widget not found!');
            }
    }
    else if (event.target.closest('button[data-testid="send-button"]')) {
        const promptTextarea = document.getElementById('prompt-textarea');
        let ref = "";

        document.querySelectorAll('.gpt-reference-container').forEach((e) => {
            const checkbox = e.querySelector('[name="gpt-reference-checkbox"]');
            if (checkbox && checkbox.checked){
                console.log("checkbox checking passed");
                ref += checkbox.nextElementSibling.textContent;
            }
        });

        // Avoid duplicating the reference text
        if (!promptTextarea.textContent.includes('Reference:')) {
            const output = `Reference: ${ref.trim()} Query: ${promptTextarea.textContent.trim()}`;
            promptTextarea.textContent = output;
        }
        console.log("submit button clicked");
    }
}

function createNewReference(msgElements) {
    console.log(msgElements);
  
    // Create the container div
    const referenceDiv = document.createElement('div');
    referenceDiv.className = 'gpt-reference-container';  // Add a class for potential styling
  
    // Create the checkbox input
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'gpt-reference-checkbox';
    checkbox.className = 'gpt-reference-checkbox';  // Add a class for styling
  
    // Create the span element to hold the message content
    const newRef = document.createElement('span');
    newRef.className = 'gpt-reference-text';  // Add a class for styling
    newRef.textContent = "";  // Initialize with empty text content
  
    // Populate the span's content from the message elements
    msgElements.forEach(e => {
      newRef.textContent += e.textContent;
    });
  
    // Append the checkbox and span to the container div
    referenceDiv.appendChild(checkbox);
    referenceDiv.appendChild(newRef);
  
    return referenceDiv;
  }
  