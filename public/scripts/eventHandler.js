function initEventHandlers(){
    document.body.addEventListener('click', handleClickEvent);
    document.body.addEventListener('keydown', handleKeydownEvent);
}

// Function to handle various click events
function handleClickEvent(event) {
    // Handle click on the nav component (switching chat streams)
    if (event.target.closest('.create-new-reference-btn')){
        addAddToReferenceSidebarBtnToGPTResponses();
    }
    // Handle custom "Add to reference sidebar" button click
    else if (event.target.closest('.add-to-reference-sidebar-button')) {
        addToReferenceSidebar(event);
    } 
    // Handle "Send" button click to submit the user query
    else if (event.target.closest('button[data-testid="send-button"]') || (event.target.closest('nav'))) {
        resetReferenceCheckboxes();
    }
}

function handleKeydownEvent(event) {
    // Prevent shift + enter(line change) from triggering this event
    if (event.key === 'Enter' && !event.shiftKey && document.activeElement.name !== 'gpt-reference-checkbox') {
        console.log("Submit button clicked by pressing Enter");
        resetReferenceCheckboxes(); // Uncheck all checkboxes
    }
}

// Reset all checkboxes in the reference sidebar
function resetReferenceCheckboxes() {
    for (const checkbox of document.querySelectorAll('[name="gpt-reference-checkbox"]')) {
        checkbox.checked = false;
    }
}

function addAddToReferenceSidebarBtnToGPTResponses() {
    const messages = document.querySelectorAll('article[data-testid^="conversation-turn-"]');

    for (const [idx, msg] of messages.entries()) {
        const assistantDiv = msg.querySelector('div[data-message-author-role="assistant"]');
        if (assistantDiv && !msg.querySelector('button.add-to-reference-sidebar-button')) {
            const btn = document.createElement('button');
            btn.value = idx;
            btn.name = 'gpt-message-button';
            btn.className = 'add-to-reference-sidebar-button';
            btn.title = 'Add to reference sidebar';

            // Risk caused from using innerHTML is minimal, since the content being inserted is hardcoded within the script
            btn.innerHTML = `
                <svg fill="#000000" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.5 2.25a.75.75 0 01.75-.75h5.5a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0V4.06l-6.22 6.22a.75.75 0 11-1.06-1.06L20.94 3h-3.69a.75.75 0 01-.75-.75z"></path>
                    <path d="M3.25 4a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h2.5a.75.75 0 01.75.75v3.19l3.72-3.72a.75.75 0 01.53-.22h10a.25.25 0 00.25-.25v-6a.75.75 0 011.5 0v6a1.75 1.75 0 01-1.75 1.75h-9.69l-3.573 3.573A1.457 1.457 0 015 21.043V18.5H3.25a1.75 1.75 0 01-1.75-1.75V4.25c0-.966.784-1.75 1.75-1.75h11a.75.75 0 010 1.5h-11z"></path>
                </svg>
                <p>Create a reference to this</p>
            `;

            // Insert the button into the DOM
            assistantDiv.insertAdjacentElement("afterbegin", btn);
        }
    }
}

function handleReferenceDeleteBtnClick(){
    console.log("delete button clicked");
}

function addToReferenceSidebar(event) {
    const gptResponse = event.target.closest('article[data-testid^="conversation-turn-"]');
    if (!gptResponse) return;

    const msgElements = gptResponse.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img, code, li');
    const newRef = createNewReference(msgElements);

    const refSidebar = document.querySelector('.reference-sidebar-content');
    if (!refSidebar) return console.error('Reference sidebar not found!');

    if (hasMaxReferences(refSidebar)) return alert('You can store up to 10 references!');

    if (!isDuplicateReference(refSidebar, newRef)) {
        refSidebar.appendChild(newRef);
        saveReferenceToLocalStorage(newRef);
    } else {
        alert('This reference already exists in the sidebar!');
    }
}

// Check if the sidebar has reached the maximum references
function hasMaxReferences(refSidebar) {
    return refSidebar.querySelectorAll('.gpt-reference-container').length >= 10;
}

// Check if the reference already exists in the sidebar
function isDuplicateReference(refSidebar, newRef) {
    return [...refSidebar.querySelectorAll('.gpt-reference-text')]
        .some(ref => ref.innerText === newRef.innerText);
}

// Save the new reference to Chrome local storage
function saveReferenceToLocalStorage(newRef) {
    const newRefText = newRef.querySelector('.gpt-reference-text').innerText.trim();
    
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
            const storedReferences = result[STORAGE_KEY] || [];

            if (storedReferences.some(ref => ref.content === newRefText)) {
                alert('This reference already exists in storage!');
            } else {
                storedReferences.push({ content: newRefText, checked: false });
                chrome.storage.local.set({ [STORAGE_KEY]: storedReferences }, () => {
                    console.log('New reference added to local storage:', newRefText);
                    updateReferenceSidebar(storedReferences);
                });
            }
        });
    } else {
        console.warn('Chrome storage API is not available.');
    }
}

// Function to update the reference sidebar from local storage
function updateReferenceSidebar(storedReferences) {
    const sidebarContent = document.querySelector('.reference-sidebar-content');
    sidebarContent.innerHTML = '';  // Clear the existing content

    storedReferences.forEach((ref, index) => {
        sidebarContent.appendChild(createReferenceContainer(ref, index));
    });
}

// Remove reference
function removeReference(index) {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
        let storedReferences = result[STORAGE_KEY] || [];
        storedReferences.splice(index, 1);
        chrome.storage.local.set({ [STORAGE_KEY]: storedReferences }, () => {
            updateReferenceSidebar(storedReferences);
        });
    });
}

// Create a single reference container
function createReferenceContainer(ref, index) {
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

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'gpt-reference-delete-btn';
    deleteBtn.innerText = 'Delete';

    referenceDiv.append(checkbox, deleteBtn, newRefText);

    // Event handler for checkbox
    checkbox.addEventListener('change', () => insertReferenceToInputWhenCheckboxChecked(index));

    // Event handler for delete button
    deleteBtn.addEventListener('click', () => removeReference(index));

    return referenceDiv;
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

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'deleteBtn';
    deleteBtn.innerText = 'Delete'; 


    newRefText.textContent = Array.from(msgElements).map(e => e.textContent).join('');

    referenceDiv.appendChild(checkbox);
    referenceDiv.appendChild(deleteBtn); // it is not working because it is not how it is structured in the local storage
    referenceDiv.appendChild(newRefText);

    return referenceDiv;
}

function insertReferenceToInputWhenCheckboxChecked(nthCheckbox) {
    const refCheckboxes = document.querySelectorAll('[name="gpt-reference-checkbox"]');
    const refList = [];
    let checkedCount = 0;

    // Collect checked references, limit to 3 references
    refCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            checkedCount++;
            const referenceText = checkbox.closest('.gpt-reference-container')?.querySelector('.gpt-reference-text')?.textContent?.trim();
            if (referenceText) {
                refList.push(`REFERENCE ${refList.length + 1}:\n${referenceText}\n`);
            }
        }
    });

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

    // Prepare references section
    const referencesSection = refList.length ? `REFERENCES:\n${refList.join('\n')}\nQUERY:` : '';
    const queryText = promptTextarea.innerText.replace(/REFERENCES:[\s\S]*QUERY:/, '').trim();

    // Clear existing content
    promptTextarea.innerHTML = '';

    // Create paragraphs for references and query text
    if (referencesSection) {
        const referencesParagraph = document.createElement('p');
        referencesParagraph.textContent = referencesSection;
        promptTextarea.appendChild(referencesParagraph);
    }

    const queryParagraph = document.createElement('p');
    queryParagraph.textContent = queryText;
    promptTextarea.appendChild(queryParagraph);

    // Move cursor to the end of the second paragraph
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(queryParagraph);
    range.collapse(false); // Move to the end of the paragraph
    selection.removeAllRanges();
    selection.addRange(range);
}
