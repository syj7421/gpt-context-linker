// Main event listeners for click and keydown events
document.body.addEventListener('click', handleClickEvent);
document.body.addEventListener('keydown', handleKeydownEvent);

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


function addButtonToMessages() {
    const messages = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
    messages.forEach((msg, idx) => {
        const assistantDiv = msg.querySelector('div[data-message-author-role="assistant"]');
        if (assistantDiv && !msg.querySelector('button.add-to-reference-sidebar-button')) {
            const btn = document.createElement('button');
            btn.value = String(idx);
            btn.name = 'gpt-message-button';
            btn.className = 'add-to-reference-sidebar-button';
            btn.title = 'Add to reference sidebar';

            // Create an SVG element and append it to the button
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("fill", "#000000");
            svg.setAttribute("viewBox", "0 0 24 24");
            svg.setAttribute("width", "24");
            svg.setAttribute("height", "24");
            svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

            const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path1.setAttribute("d", "M16.5 2.25a.75.75 0 01.75-.75h5.5a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0V4.06l-6.22 6.22a.75.75 0 11-1.06-1.06L20.94 3h-3.69a.75.75 0 01-.75-.75z");

            const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path2.setAttribute("d", "M3.25 4a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h2.5a.75.75 0 01.75.75v3.19l3.72-3.72a.75.75 0 01.53-.22h10a.25.25 0 00.25-.25v-6a.75.75 0 011.5 0v6a1.75 1.75 0 01-1.75 1.75h-9.69l-3.573 3.573A1.457 1.457 0 015 21.043V18.5H3.25a1.75 1.75 0 01-1.75-1.75V4.25c0-.966.784-1.75 1.75-1.75h11a.75.75 0 010 1.5h-11z");

            // Append paths to the SVG
            svg.appendChild(path1);
            svg.appendChild(path2);

            // Append the SVG to the button
            btn.appendChild(svg);
            const btnText = document.createElement('p');
            btnText.textContent = "Create a reference to this"
            btn.appendChild(btnText);

            // Insert the button into the DOM
            assistantDiv.insertAdjacentElement("afterbegin", btn);
        }
    });
}