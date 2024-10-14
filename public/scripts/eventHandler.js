// Initialize event handlers with delegation
function initEventHandlers() {
    document.body.addEventListener('click', handleClickEvent);
    document.body.addEventListener('keydown', handleKeydownEvent);
}

// Handle click events
function handleClickEvent(event) {
    const target = event.target;
    // if (target.closest('.create-new-reference-btn')) {
    //     addReferenceButtonToResponse();
    // } 
    if (target.closest('.add-to-reference-sidebar-button')) {
        addToReferenceSidebar(event);
    } else if (target.closest('button[data-testid="send-button"]') || target.closest('nav')) {
        resetReferenceCheckboxes();
    }else if (target.closest('button[name="reference-detail-btn"]')) {
        const referenceContainer = target.closest('.gpt-reference-container');
        const content = referenceContainer.querySelector('.gpt-reference-text2').textContent;
        showPopup(content);
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


// Add content to reference sidebar
function addToReferenceSidebar(event) {
    // const gptResponse = event.target.closest('article[data-testid^="conversation-turn-"]');
    // if (!gptResponse) return;
    // const newContent = Array.from(gptResponse.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img, code, li'))
    //     .map(e => e.textContent.trim()).join('');

    const newTitle = "New reference";
    const summary = summariseGptResponseToGenerateReference(event);
    
    const refSidebar = document.querySelector('.reference-sidebar-content');
    if (!refSidebar || isDuplicateOrMax(refSidebar, summary)) return;

    saveReferenceToLocalStorage(summary, newTitle);
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
            // Add the new reference to the storedReferences array
            const newReference = { content: content.trim(), title: title};
            storedReferences.push(newReference);

            // Update local storage with the new reference
            chrome.storage.local.set({ [STORAGE_KEY]: storedReferences }, () => {
                // Append only the new reference to the sidebar
                appendNewReferenceToSidebar(newReference, storedReferences.length - 1);
            });
        }
    });
}

function appendNewReferenceToSidebar(newReference, index) {
    const sidebarContent = document.querySelector('.reference-sidebar-content');
    // Append only the newly created reference container
    sidebarContent.appendChild(createReferenceContainer(newReference.content, newReference.title, index));
}

// Update sidebar with references from local storage
function updateReferenceSidebar(storedReferences) {
    const sidebarContent = document.querySelector('.reference-sidebar-content');
    sidebarContent.innerHTML = '';  // Clear existing content

    storedReferences.forEach((ref, index) => {
        sidebarContent.appendChild(createReferenceContainer(ref.content, ref.title, index));
    });
}

// 显示弹出窗口的函数
function showPopup(content) {
    console.log(111111)
    // 创建一个遮罩层来覆盖其他内容
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '9998'; // 确保遮罩层位于最上层

    // 创建弹出窗口
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.width = '50%';
    popup.style.maxHeight = '80%'; // 限制高度，确保可以滚动
    popup.style.backgroundColor = 'white';
    popup.style.padding = '20px';
    popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    popup.style.zIndex = '9999'; // 确保弹窗位于遮罩层之上
    popup.style.overflowY = 'auto'; // 允许内容滚动

    // 创建关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.padding = '5px 10px';
    closeButton.style.cursor = 'pointer';
    
    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay); // 移除遮罩层和弹窗
    });

    const cleanContent = content.replace(/^ChatGPT said:Create a reference to this/, '').trim();

    // 创建内容容器
    const contentContainer = document.createElement('div');
    contentContainer.style.whiteSpace = 'pre-wrap'; // 保留换行
    contentContainer.textContent = cleanContent; // 填充详细内容

    // 将关闭按钮和内容添加到弹出窗口
    popup.appendChild(closeButton);
    popup.appendChild(contentContainer);

    // 将遮罩层和弹出窗口添加到页面中
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}


// Create a reference container
function createReferenceContainer(content,titleText, index = null) {
    const container = document.createElement('div');
    container.className = 'gpt-reference-container';

    const header = document.createElement('div');
    header.className = 'gpt-reference-header';

    const headerLeft = document.createElement('div');
    headerLeft.className = 'gpt-reference-header-left';
    
    const headerRight = document.createElement('div');
    headerRight.className = 'gpt-reference-header-right';

    const title = document.createElement('span');
    title.className = "gpt-reference-title";
    title.innerText = titleText;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'gpt-reference-checkbox';
    checkbox.className = 'gpt-reference-checkbox';
    checkbox.isChecked = false;

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

    const cleanContent = content.replace(/^ChatGPT said:Create a reference to this/, '').trim();

    const newRefText = document.createElement('span');
    newRefText.className = 'gpt-reference-text';
    newRefText.textContent = cleanContent.slice(0, 50) + (cleanContent.length > 50 ? '...' : '');;
    
    const hiddenRefText = document.createElement('span');
    hiddenRefText.className = 'gpt-reference-text2';
    hiddenRefText.textContent = cleanContent;
    hiddenRefText.style.display = "none";

    const referenceDetailBtn = document.createElement('button');
    referenceDetailBtn.name = 'reference-detail-btn'
    referenceDetailBtn.className = 'reference-detail-btn';
    referenceDetailBtn.innerHTML = 'More Detail'

    headerLeft.append(checkbox, title);
    headerRight.append(editTitleBtn, deleteBtn);
    header.append(headerLeft, headerRight);
    container.append(header, newRefText, hiddenRefText, referenceDetailBtn);

    if (index !== null) {
        checkbox.addEventListener('change', () => insertReferenceToInputWhenCheckboxChecked(index));
        deleteBtn.addEventListener('click', () => removeReference(index));
        editTitleBtn.addEventListener('click', () => editReferenceTitle(title, index));
        newRefText.addEventListener('mouseover', (event) => {
            customTooltip.style.display = 'block';
            customTooltip.innerText = content; 
            customTooltip.style.left = `${event.clientX - customTooltip.offsetWidth - 10}px`;  
            customTooltip.style.top = `${event.clientY + 10}px`;   
        });
        
        newRefText.addEventListener('mousemove', (event) => {
            customTooltip.style.left = `${event.clientX - customTooltip.offsetWidth - 10}px`;  
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
            const referenceText = checkbox.closest('.gpt-reference-container')?.querySelector('.gpt-reference-text2')?.textContent?.trim();
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


