document.body.addEventListener('click', handleClickEvent);
document.body.addEventListener('keydown', handleKeydownEvent);

function handleClickEvent(event) {
    if (event.target.closest('nav')) {
      waitForMessageList(handleMessages); // Attach MutationObserver after message list loads
    }

    else if (event.target.closest('.add-to-reference-sidebar-button')) {
        const gptResponse = event.target.closest('article[data-testid^="conversation-turn-"]');
        const msgElements = gptResponse.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img, code, li');
        const newRef = createNewReference(msgElements);
        const refSidebar = document.querySelector('.reference-sidebar-content');
        const countRef = refSidebar.querySelectorAll('.gpt-reference-container');
        if (countRef.length >= 10){
            alert('You can store up to 10 references!');
            return;
        }

        // Check if the content is already present in the sidebar
        if (refSidebar && !refSidebar.innerText.includes(newRef.innerText)) {
            refSidebar.appendChild(newRef);
        } else if (!refSidebar) {
            console.error('Widget not found!');
        } else{
            alert('This reference already exists!');
        }
    }

    else if (event.target.name === 'gpt-reference-checkbox') {
        // Get a NodeList of all checkboxes
        const refCheckboxes = document.querySelectorAll('[name="gpt-reference-checkbox"]');
        
        // Convert the NodeList to an Array and find the index of the clicked checkbox
        const nthCheckbox = Array.from(refCheckboxes).indexOf(event.target);
        
        // Call your function with the index
        addReferenceWhenCheckboxChecked(nthCheckbox);
    }
    else if (event.target.closest('button[data-testid="send-button"]')) {
        console.log("submit button clicked");
        const refCheckboxes = document.querySelectorAll('[name="gpt-reference-checkbox"]');
        refCheckboxes.forEach((e) => {
            e.checked = false;
        })
    }
}
function createNewReference(msgElements) {
  
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
  
  function addReferenceWhenCheckboxChecked(nthCheckbox) {
    const refCheckbox = document.querySelectorAll('[name="gpt-reference-checkbox"]');
    const refList = [];
    let referenceCount = 1; // Start counting from 1
    let checkedCount = 0;

    // Collect all checked references
    refCheckbox.forEach((e, index) => {
        if (e.checked) {
            checkedCount++; // Increment the checked count
            const referenceContainer = e.closest('.gpt-reference-container');
            if (referenceContainer) {
                const referenceText = referenceContainer.querySelector('.gpt-reference-text');
                if (referenceText) {
                    refList.push(`Reference ${referenceCount}:\n${referenceText.textContent.trim()}\n`);
                    referenceCount++; // Increment the counter for each reference
                }
            }
        }
    });

    // If more than 3 checkboxes are checked, show alert and uncheck the last checked checkbox
    if (checkedCount > 3) {
        alert('You can reference a maximum of 3 items at a time.');
        // Uncheck the nth checked checkbox (the one that triggered the alert)
        refCheckbox[nthCheckbox].checked = false;
        return; // Exit the function
    }

    const promptTextarea = document.getElementById('prompt-textarea');
    
    // Check if promptTextarea exists
    if (!promptTextarea) {
        console.error('The element with id "prompt-textarea" was not found.');
        return;
    }

    // Use innerText to preserve newlines
    let queryText = promptTextarea.innerText.trim() || '';
    
    // Build the new reference section with proper indentation and newlines
    const referencesSection = refList.length ? `References:\n${refList.join('\n')}\n` : '';
    
    const referencePattern = /References:[\s\S]*Query:/;
    
    // If a reference section exists, remove it
    if (referencePattern.test(queryText)) {
        queryText = queryText.replace(referencePattern, '').trim();
    }
    
    // Add the new reference section followed by the preserved query text
    const updatedPrompt = `${referencesSection}\nQuery:\n${queryText}`;
    
    // Set the updated content back to the prompt textarea, using innerText to preserve formatting
    promptTextarea.innerText = updatedPrompt; // innerText preserves newlines, but textContent does not, also .value only works on direct child
}

// Example of calling the function with the nth checkbox index
// If you have a checkbox click event handler, you can call it like this:
document.querySelectorAll('[name="gpt-reference-checkbox"]').forEach((checkbox, index) => {
    checkbox.addEventListener('change', function() {
        addReferenceWhenCheckboxChecked(index); // Pass the index of the clicked checkbox
    });
});

function handleKeydownEvent(event) {
    // Check if the key pressed is 'Enter'
    if (event.key === 'Enter') {
        console.log("Submit button clicked by pressing Enter");

        // Get all checkboxes and uncheck them
        const refCheckboxes = document.querySelectorAll('[name="gpt-reference-checkbox"]');
        refCheckboxes.forEach((e) => {
            e.checked = false; // Uncheck the checkbox
        });
    }
}




// function showAlert(message) {
//     const alertBox = document.getElementById('customAlert');
//     alertBox.textContent = message;
//     alertBox.classList.remove('hidden');
//     alertBox.classList.add('show');

//     setTimeout(() => {
//         alertBox.classList.remove('show');
//         setTimeout(() => {
//             alertBox.classList.add('hidden');
//         }, 500); // Ensures fade out transition is done before hiding
//     }, 2000); 
// }