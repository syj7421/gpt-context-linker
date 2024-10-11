// Initialize event handlers with delegation
function initEventHandlers() {
    document.body.addEventListener('click', handleClickEvent);
    document.body.addEventListener('keydown', handleKeydownEvent);
}

// Handle click events
function handleClickEvent(event) {
    const target = event.target;
    if (target.closest('nav')) {
        console.log("nav element or its descendant clicked!");
    }

    if (target.closest('.create-new-reference-btn')) {
        addReferenceButtonToResponse();
    } else if (target.closest('.add-to-reference-sidebar-button')) {
        addToReferenceSidebar(event);
    } else if (target.closest('button[data-testid="send-button"]') || target.closest('nav')) {
        resetReferenceCheckboxes();
    }
}

// Handle Enter key to submit the user query
function handleKeydownEvent(event) {
    if (event.key === 'Enter' && !event.shiftKey && document.activeElement.name !== 'gpt-reference-checkbox') {
        console.log("Submit button clicked by pressing Enter");
        resetReferenceCheckboxes();
    }
}

// Reset all checkboxes in the reference sidebar
function resetReferenceCheckboxes() {
    document.querySelectorAll('[name="gpt-reference-checkbox"]').forEach(checkbox => checkbox.checked = false);
}

// Add reference buttons to the response articles
function addReferenceButtonToResponse() {
    document.querySelectorAll('article[data-testid^="conversation-turn-"]').forEach((msg, idx) => {
        const assistantDiv = msg.querySelector('div[data-message-author-role="assistant"]');
        if (assistantDiv && !msg.querySelector('button.add-to-reference-sidebar-button')) {
            const btn = createAddToReferenceButton(idx);
            assistantDiv.prepend(btn);
        }
    });
}

// Create the "Add to Reference" button with innerHTML
function createAddToReferenceButton(idx) {
    const btn = document.createElement('button');
    btn.value = idx;
    btn.className = 'add-to-reference-sidebar-button';
    btn.title = 'Add to reference sidebar';
    btn.innerHTML = `
        <svg fill="#000000" viewBox="0 0 24 24" width="12" height="12">
            <path d="M16.5 2.25a.75.75 0 01.75-.75h5.5a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0V4.06l-6.22 6.22a.75.75 0 11-1.06-1.06L20.94 3h-3.69a.75.75 0 01-.75-.75z"></path>
            <path d="M3.25 4a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h2.5a.75.75 0 01.75.75v3.19l3.72-3.72a.75.75 0 01.53-.22h10a.25.25 0 00.25-.25v-6a.75.75 0 011.5 0v6a1.75 1.75 0 01-1.75 1.75h-9.69l-3.573 3.573A1.457 1.457 0 015 21.043V18.5H3.25a1.75 1.75 0 01-1.75-1.75V4.25c0-.966.784-1.75 1.75-1.75h11a.75.75 0 010 1.5h-11z"></path>
        </svg>
        <p>Create a reference to this</p>
    `;
    return btn;
}

// Add content to reference sidebar
function addToReferenceSidebar(event) {
    const gptResponse = event.target.closest('article[data-testid^="conversation-turn-"]');
    if (!gptResponse) return;

    const newContent = Array.from(gptResponse.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img, code, li'))
        .map(e => e.textContent.trim()).join('');

    const newTitle = "New reference";
    
    const refSidebar = document.querySelector('.reference-sidebar-content');
    if (!refSidebar || isDuplicateOrMax(refSidebar, newContent)) return;

    const newRef = createReferenceContainer(newContent, newTitle);
    refSidebar.appendChild(newRef);
    saveReferenceToLocalStorage(newContent, newTitle);
}

// Check if the reference is either a duplicate or max limit is reached
function isDuplicateOrMax(refSidebar, newContent) {
    const maxReached = refSidebar.querySelectorAll('.gpt-reference-container').length >= 10;
    const duplicate = Array.from(refSidebar.querySelectorAll('.gpt-reference-text'))
        .some(ref => ref.innerText.trim() === newContent.trim());

    if (maxReached) alert('You can store up to 10 references!');
    if (duplicate) alert('This reference already exists in the sidebar!');

    return maxReached || duplicate;
}

// Save reference to local storage
function saveReferenceToLocalStorage(content, title) {
    if (!chrome?.storage?.local) return console.warn('Chrome storage API is not available.');

    chrome.storage.local.get([STORAGE_KEY], (result) => {
        const storedReferences = result[STORAGE_KEY] || [];
        if (storedReferences.some(ref => ref.content.trim() === content.trim())) {
            alert('This reference already exists in storage!');
        } else {
            storedReferences.push({ content: content.trim(), title: title, checked: false });
            chrome.storage.local.set({ [STORAGE_KEY]: storedReferences }, () => {
                console.log('New reference added to local storage:', content);
                updateReferenceSidebar(storedReferences);
            });
        }
    });
}

// Update sidebar with references from local storage
function updateReferenceSidebar(storedReferences) {
    const sidebarContent = document.querySelector('.reference-sidebar-content');
    sidebarContent.innerHTML = '';  // Clear existing content

    storedReferences.forEach((ref, index) => {
        sidebarContent.appendChild(createReferenceContainer(ref.content,ref.title, index));
    });
}

// Create a reference container
function createReferenceContainer(content,titleText, index = null) {
    const container = document.createElement('div');
    container.className = 'gpt-reference-container';

    const header = document.createElement('div');
    header.className = 'gpt-reference-header';

    const title = document.createElement('span');
    title.className = "gpt-reference-title";
    title.innerText = titleText;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'gpt-reference-checkbox';
    checkbox.className = 'gpt-reference-checkbox';

    const editTitleBtn = document.createElement('button');
    editTitleBtn.className = 'gpt-reference-edit-title-btn';
    editTitleBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <path d="M9 5H14M14 5H19M14 5V19M9 19H14M14 19H19" stroke="#33363F" stroke-width="2"></path>
        <path d="M11 9H4C2.89543 9 2 9.89543 2 11V15H11" stroke="#33363F" stroke-width="2"></path>
        <path d="M17 15H20C21.1046 15 22 14.1046 22 13V9H17" stroke="#33363F" stroke-width="2"></path>
      </g>
    </svg>
  `;
  
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'gpt-reference-delete-btn';
    deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10 11V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M14 11V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M4 7H20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6 7H12H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;

    const newRefText = document.createElement('span');
    newRefText.className = 'gpt-reference-text';
    newRefText.textContent = content;
    header.append(checkbox, title, editTitleBtn, deleteBtn);
    container.append(header, newRefText);

    if (index !== null) {
        checkbox.checked = false;
        checkbox.addEventListener('change', () => insertReferenceToInputWhenCheckboxChecked(index));
        deleteBtn.addEventListener('click', () => removeReference(index));
        editTitleBtn.addEventListener('click', () => editReferenceTitle(title, index));
        newRefText.addEventListener('mouseover', (event) => {
            customTooltip.style.display = 'block';
            customTooltip.innerText = content; 
            customTooltip.style.left = `${event.clientX - 310}px`;  
            customTooltip.style.top = `${event.clientY + 10}px`;  
        });
        
        newRefText.addEventListener('mousemove', (event) => {
            customTooltip.style.left = `${event.clientX + 10}px`;
            customTooltip.style.top = `${event.clientY + 10}px`;
        });
        
        newRefText.addEventListener('mouseout', () => {
            customTooltip.style.display = 'none';  
        });
        
    }

    return container;
}

// Insert reference to the input when checkbox is checked
function insertReferenceToInputWhenCheckboxChecked(nthCheckbox) {
    const refCheckboxes = document.querySelectorAll('[name="gpt-reference-checkbox"]');
    const refList = [];
    let checkedCount = 0;

    refCheckboxes.forEach(checkbox => {
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

    const referencesSection = refList.length ? `REFERENCES:\n${refList.join('\n')}\nQUERY:` : '';
    const queryText = promptTextarea.innerText.replace(/REFERENCES:[\s\S]*QUERY:/, '').trim();

    promptTextarea.innerHTML = '';

    if (referencesSection) {
        const referencesParagraph = document.createElement('p');
        referencesParagraph.textContent = referencesSection;
        promptTextarea.appendChild(referencesParagraph);
    }

    const queryParagraph = document.createElement('p');
    queryParagraph.textContent = queryText;
    promptTextarea.appendChild(queryParagraph);

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(queryParagraph);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
}

// Remove reference by index and update local storage and sidebar
function removeReference(index) {
    if (!chrome?.storage?.local) return console.warn('Chrome storage API is not available.');

    // Get current stored references from Chrome local storage
    chrome.storage.local.get([STORAGE_KEY], (result) => {
        let storedReferences = result[STORAGE_KEY] || [];
        
        // Remove the reference at the given index
        if (index >= 0 && index < storedReferences.length) {
            storedReferences.splice(index, 1);
            
            // Update the storage with the new list of references
            chrome.storage.local.set({ [STORAGE_KEY]: storedReferences }, () => {
                console.log('Reference removed from local storage:', index);
                
                // Refresh the reference sidebar to reflect the removed reference
                updateReferenceSidebar(storedReferences);
            });
        }
    });
}

function editReferenceTitle(title, index) {
    // Make the title editable
    title.contentEditable = 'true';
    title.focus();  // Focus on the title for editing

    // Save the changes when the user clicks outside (blur event)
    title.addEventListener('blur', function onBlur() {
        let updatedTitle = title.innerText.trim();

        // Limit the title length to 15 characters
        if (updatedTitle.length > 15) {
            updatedTitle = updatedTitle.slice(0, 15);  // Truncate excess characters
        }
        
        title.innerText = updatedTitle;  // Update displayed title
        title.contentEditable = 'false';  // Disable edit mode after saving
        
        // Update in chrome.storage
        chrome.storage.local.get([STORAGE_KEY], (result) => {
            const storedReferences = result[STORAGE_KEY] || [];
            storedReferences[index].title = updatedTitle;  // Update the title field
            chrome.storage.local.set({ [STORAGE_KEY]: storedReferences }, () => {
                console.log('Title updated successfully.');
            });
        });

        title.removeEventListener('blur', onBlur);  // Remove blur event listener after saving
    });
}


