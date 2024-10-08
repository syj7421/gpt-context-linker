// Main event listeners for click and keydown events

function initEventHandlers(){
    document.body.addEventListener('click', handleClickEvent);
    document.body.addEventListener('keydown', handleKeydownEvent);
}

// Function to handle various click events
function handleClickEvent(event) {
    // Handle click on the nav component (switching chat streams)
    if (event.target.closest('.create-new-reference-btn')){
        addButtonToMessages();
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
    else if (event.target.closest('button[data-testid="send-button"]') || (event.target.closest('nav'))) {
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

    // Check if the new reference is already in the sidebar
    if (!refSidebar.innerText.includes(newRef.innerText)) {
        refSidebar.appendChild(newRef);
    } else {
        alert('This reference already exists in the sidebar!');
        return;
    }

    // Check if chrome.storage is available
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        // Now save the reference to Chrome local storage
        chrome.storage.local.get([STORAGE_KEY], (result) => {
            const storedReferences = result[STORAGE_KEY] || [];

            // Check if this reference already exists in local storage
            const newRefText = newRef.querySelector('.gpt-reference-text').innerText.trim();
            const isDuplicate = storedReferences.some(ref => ref.content === newRefText);

            if (isDuplicate) {
                alert('This reference already exists in storage!');
            } else {
                // Add the new reference to local storage
                storedReferences.push({ content: newRefText, checked: false });
                chrome.storage.local.set({ [STORAGE_KEY]: storedReferences }, () => {
                    console.log('New reference added to local storage:', newRefText);
                    updateReferenceSidebar(storedReferences);  // Update the sidebar after adding to storage
                });
            }
        });
    } else {
        console.warn('Chrome storage API is not available. This code is likely running outside of a Chrome extension.');
    }
}

// Function to update the reference sidebar from local storage
function updateReferenceSidebar(storedReferences) {
    const sidebarContent = document.querySelector('.reference-sidebar-content');
    sidebarContent.innerHTML = '';  // Clear the existing content

    storedReferences.forEach((ref, index) => {
        const referenceDiv = document.createElement('div');
        referenceDiv.className = 'gpt-reference-container';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'gpt-reference-checkbox';
        checkbox.className = 'gpt-reference-checkbox';
        checkbox.checked = ref.checked;

        const newRefText = document.createElement('span');
        newRefText.className = 'gpt-reference-text';
        newRefText.textContent = ref.content;

        referenceDiv.appendChild(checkbox);
        referenceDiv.appendChild(newRefText);

        sidebarContent.appendChild(referenceDiv);

        // Attach checkbox handler
        checkbox.addEventListener('change', () => {
            addReferenceWhenCheckboxChecked(index);
        });
    });
}
// Handle reference checkbox clicks
function handleCheckboxClick(event) {
    const refCheckboxes = document.querySelectorAll('[name="gpt-reference-checkbox"]');
    const clickedCheckboxIndex = Array.from(refCheckboxes).indexOf(event.target);

    // Call the function to handle the checkbox check/uncheck logic
    addReferenceWhenCheckboxChecked(clickedCheckboxIndex);

    // Save the updated checkbox state to storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
            const storedReferences = result[STORAGE_KEY] || [];

            // Update the 'checked' state of the reference based on the checkbox state
            if (storedReferences[clickedCheckboxIndex]) {
                storedReferences[clickedCheckboxIndex].checked = event.target.checked;
            }

            // Save the updated references to local storage
            chrome.storage.local.set({ [STORAGE_KEY]: storedReferences }, () => {
                console.log(`Reference checkbox state updated for item at index ${clickedCheckboxIndex}`);
            });
        });
    } else {
        console.warn('Chrome storage API is not available. This code is likely running outside of a Chrome extension.');
    }
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

// Handle checkbox selection
function addReferenceWhenCheckboxChecked(nthCheckbox) {
    const refCheckboxes = document.querySelectorAll('[name="gpt-reference-checkbox"]');
    const refList = [];
    let checkedCount = 0;

    // Collect all checked references
    refCheckboxes.forEach((checkbox, index) => {
        if (checkbox.checked) {
            checkedCount++;
            const referenceText = checkbox.closest('.gpt-reference-container')?.querySelector('.gpt-reference-text')?.textContent?.trim();
            if (referenceText) {
                refList.push(`REFERENCE ${refList.length + 1}:\n${referenceText}\n`);
            }
        }
    });

    // Limit to 3 references
    if (checkedCount > 3) {
        alert('You can reference a maximum of 3 items at a time.');
        refCheckboxes[nthCheckbox].checked = false;
        return;
    }

    const promptTextarea = document.getElementById('prompt-textarea');

    if (!promptTextarea) {
        console.error('The element with id "prompt-textarea" was not found.');
        return;
    }

    const queryText = promptTextarea.innerText.trim() || '';
    const referencesSection = refList.length ? `REFERENCES:\n${refList.join('\n')}\nQUERY:` : '';

    // Clear the existing content of promptTextarea
    promptTextarea.innerHTML = '';

    // Create the <p> element for the references section
    if (referencesSection) {
        const referencesParagraph = document.createElement('p');
        referencesParagraph.textContent = referencesSection;
        promptTextarea.appendChild(referencesParagraph);
    }

    // Create the <p> element for the query text
    const queryParagraph = document.createElement('p');
    queryParagraph.textContent = queryText.replace(/REFERENCES:[\s\S]*QUERY:/, '').trim();
    promptTextarea.appendChild(queryParagraph);
    
    // Move the cursor to the second paragraph so the user can start typing the query
    const selection = window.getSelection();
    const range = document.createRange();

    range.setStart(queryParagraph, 0); // Move the cursor to the start of the second <p>
    range.collapse(true); // Collapse the range to the start
    selection.removeAllRanges(); // Clear any existing selections
    selection.addRange(range); // Add the new range to move the cursor
}


function handleKeydownEvent(event) {

    // Prevent shift + enter(line change) from triggering this event
    if (event.key === 'Enter' && !event.shiftKey && document.activeElement.name !== 'gpt-reference-checkbox') {
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










