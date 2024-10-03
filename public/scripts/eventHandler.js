// Main event listeners for click and keydown events
document.body.addEventListener('click', handleClickEvent);
document.body.addEventListener('keydown', handleKeydownEvent);

// Function to handle various click events
function handleClickEvent(event) {
    // Handle click on the nav component (switching chat streams)
    if (event.target.closest('nav')) {
        handleChatStreamSwitch();
    } 
    // Handle custom "Add to reference sidebar" button click
    else if (event.target.closest('.add-to-reference-sidebar-button')) {
        handleAddToReference(event);
    } 
    // Handle reference sidebar checkbox click
    else if (event.target.name === 'gpt-reference-checkbox') {
        handleCheckboxClick(event);
    } 
    // Handle "Send" button click to submit the user query
    else if (event.target.closest('button[data-testid="send-button"]')) {
        resetReferenceCheckboxes();
    }
}

// Reset all checkboxes in the reference sidebar
function resetReferenceCheckboxes() {
    const refCheckboxes = document.querySelectorAll('[name="gpt-reference-checkbox"]');
    refCheckboxes.forEach((e) => {
        e.checked = false; // Uncheck all checkboxes
    });
}

// Function to handle switching between chat streams
function handleChatStreamSwitch() {
    waitForMessageList(handleMessages);  // Function not defined in the provided code
    resetReferenceCheckboxes(); // Reset checkboxes when the main section re-renders
}

// Handle the action of adding a GPT response to the reference sidebar
function handleAddToReference(event) {
    const gptResponse = event.target.closest('article[data-testid^="conversation-turn-"]');
    if (!gptResponse) return;

    const msgElements = gptResponse.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img, code, li');
    const newRef = createNewReference(msgElements);
    const refSidebar = document.querySelector('.reference-sidebar-content');

    if (!refSidebar) {
        console.error('Reference sidebar not found!');
        return;
    }

    const existingReferences = refSidebar.querySelectorAll('.gpt-reference-container');
    if (existingReferences.length >= 10) {
        alert('You can store up to 10 references!');
        return;
    }

    // Prevent duplicate references
    if (!refSidebar.innerText.includes(newRef.innerText)) {
        refSidebar.appendChild(newRef);
    } else {
        alert('This reference already exists!');
    }
}

// Handle reference checkbox clicks
function handleCheckboxClick(event) {
    const refCheckboxes = document.querySelectorAll('[name="gpt-reference-checkbox"]');
    const clickedCheckboxIndex = Array.from(refCheckboxes).indexOf(event.target);
    addReferenceWhenCheckboxChecked(clickedCheckboxIndex);
}

// Create a new reference element to be added to the reference sidebar
function createNewReference(msgElements) {
    const referenceDiv = document.createElement('div');
    referenceDiv.className = 'gpt-reference-container';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'gpt-reference-checkbox';
    checkbox.className = 'gpt-reference-checkbox';

    const newRefText = document.createElement('span');
    newRefText.className = 'gpt-reference-text';
    newRefText.textContent = Array.from(msgElements).map(e => e.textContent).join('');

    referenceDiv.appendChild(checkbox);
    referenceDiv.appendChild(newRefText);

    return referenceDiv;
}

function addReferenceWhenCheckboxChecked(nthCheckbox) {
    const refCheckbox = document.querySelectorAll('[name="gpt-reference-checkbox"]');
    const refList = [];
    let checkedCount = 0;

    // Collect all checked references
    refCheckbox.forEach((checkbox, index) => {
        if (checkbox.checked) {
            checkedCount++;
            const referenceText = checkbox.closest('.gpt-reference-container')?.querySelector('.gpt-reference-text')?.textContent?.trim();
            if (referenceText) {
                refList.push(`Reference ${refList.length + 1}:\n${referenceText}\n`);
            }
        }
    });

    // Limit to 3 references
    if (checkedCount > 3) {
        alert('You can reference a maximum of 3 items at a time.');
        refCheckbox[nthCheckbox].checked = false;
        return;
    }

    const promptTextarea = document.getElementById('prompt-textarea');
    if (!promptTextarea) {
        console.error('The element with id "prompt-textarea" was not found.');
        return;
    }

    const queryText = promptTextarea.innerText.trim() || '';
    const referencesSection = refList.length ? `References:\n${refList.join('\n')}\n` : '';
    
    // Update the prompt with the new reference section
    promptTextarea.innerText = `${referencesSection}\nQuery:\n${queryText.replace(/References:[\s\S]*Query:/, '').trim()}`;
}


// Handle keydown event (e.g., pressing 'Enter')
function handleKeydownEvent(event) {
    if (event.key === 'Enter') {
        console.log("Submit button clicked by pressing Enter");
        resetReferenceCheckboxes(); // Uncheck all checkboxes
    }
}

// Example of calling the checkbox handler on checkbox state change
document.querySelectorAll('[name="gpt-reference-checkbox"]').forEach((checkbox, index) => {
    checkbox.addEventListener('change', function () {
        addReferenceWhenCheckboxChecked(index);
    });
});
