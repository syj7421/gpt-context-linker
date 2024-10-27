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
        const title = referenceContainer.querySelector('.gpt-reference-header').textContent;
        const content = referenceContainer.querySelector('.gpt-reference-text2').textContent;
        const index = referenceContainer.querySelector('.gpt-reference-checkbox').getAttribute('data-index');
        showPopup(title, content, index);
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

function cleanContent(content) {
    // 移除 "type: text" 和 "type: code" 等标记，以及 "content:" 前缀
    const cleanedContent = content
        .replace(/type\s*:\s*(text|code)\s*/gi, '') // 移除 "type: text" 和 "type: code"
        .replace(/content\s*:\s*/gi, '') // 移除 "content:" 前缀
        .replace(/-+/g, ''); // 移除多余的 "-"

    // 合并多余的换行符，并返回清理后的内容
    return cleanedContent.replace(/\s*\n\s*/g, ' ').trim(); // 将换行替换为空格并去除首尾空白
}


// Save reference to local storage
function saveReferenceToLocalStorage(content, title) {
    if (!chrome?.storage?.local) return console.warn('Chrome storage API is not available.');

    const cleanedContent = cleanContent(content);

    chrome.storage.local.get([STORAGE_KEY], (result) => {
        const storedReferences = result[STORAGE_KEY] || [];
        if (storedReferences.some(ref => ref.content.trim() === cleanedContent.trim())) {
            alert('This reference already exists in storage!');
        } else {
            // Add the new reference to the storedReferences array
            const newReference = { content: cleanedContent.trim(), title: title};
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

function updateReferenceSidebar(storedReferences, deletedIndex = null) {
    const sidebarContent = document.querySelector('.reference-sidebar-content');
    
    // Store the checkbox states before clearing the content
    const checkboxStates = {};
    sidebarContent.querySelectorAll('.gpt-reference-checkbox').forEach((checkbox) => {
        let refIndex = parseInt(checkbox.getAttribute('data-index'), 10);

        // Store the checked state, but skip the deleted reference
        if (refIndex !== deletedIndex) {
            if (deletedIndex !== null && refIndex > deletedIndex) {
                // Adjust the index if it's after the deleted one
                refIndex -= 1;
            }
            checkboxStates[refIndex] = checkbox.checked;
        }
    });
    
    console.log('Stored checkbox states:', checkboxStates);

    // Clear existing content
    sidebarContent.innerHTML = '';  

    // Re-render references and reapply checkbox states
    storedReferences.forEach((ref, index) => {
        const referenceElement = createReferenceContainer(ref.content, ref.title, index);
        referenceElement.setAttribute('data-index', index);  // Assign a unique identifier
        
        const checkbox = referenceElement.querySelector('.gpt-reference-checkbox');
        
        // Reapply the saved checkbox state (if it exists)
        if (checkbox && checkboxStates[index] !== undefined) {
            checkbox.checked = checkboxStates[index];
        }

        sidebarContent.appendChild(referenceElement);
    });
}

// 显示弹出窗口的函数
function showPopup(title, content, index) {
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
    popup.className = 'popup-frame';

    const popupHeader =  document.createElement('div');
    popupHeader.className = "popup-header";

    const popupTitle =  document.createElement('div');
    popupTitle.textContent = title;
    popupTitle.className = "popup-title";

    // 创建关闭按钮
    const closeButton = document.createElement('button');
    closeButton.className = 'popup-closebtn';
    closeButton.textContent = 'X';
    closeButton.style.cursor = 'pointer';

    popupHeader.appendChild(popupTitle);
    popupHeader.appendChild(closeButton);
    
    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay); // 移除遮罩层和弹窗
    });

    const controlBar = document.createElement('div');
    controlBar.className = 'popup-controlBar';

    const controlBarBtn = document.createElement('button');
    controlBarBtn.className = 'popup-controlBar-btn';
    controlBarBtn.textContent = 'XXXXXXX';

    const controlBarBtn2 = document.createElement('button');
    controlBarBtn2.className = 'popup-controlBar-btn';
    controlBarBtn2.textContent = 'XXXXXXX2';

    const cleanContent = content;

    const Container = document.createElement('div');
    Container.className = 'popup-container';

    const contentFrame = document.createElement('div');
    contentFrame.className = 'popup-content-frame';

    // 创建内容容器
    const contentContainer = document.createElement('div');
    contentContainer.className = 'popup-container-content';
    contentContainer.style.whiteSpace = 'pre-wrap'; // 保留换行
    contentContainer.textContent = cleanContent; // 填充详细内容

    const editBtn = document.createElement('button');
    editBtn.className = 'popup-edit-btn';
    editBtn.textContent = 'Edit Content';

    // Flag to track whether we are in edit mode or not
    let isEditMode = false;
    // Add event listener to the Edit Content button
    editBtn.addEventListener('click', () => {
        if (!isEditMode) {
            // Enable edit mode
            contentContainer.setAttribute('contenteditable', 'true');
            contentContainer.classList.add('edit-mode'); // Optional, for visual feedback
            editBtn.textContent = 'Save Change';  // Change button text to 'Save'
            isEditMode = true;
        } else {
            // Save changes and disable edit mode
            const updatedContent = contentContainer.textContent.trim();
            contentContainer.setAttribute('contenteditable', 'false');
            contentContainer.classList.remove('edit-mode');
            editBtn.textContent = 'Edit Content';  // Change button text back to 'Edit'
            isEditMode = false;

            // Save the updated content in chrome.storage.local
            chrome.storage.local.get(['gptReferences'], (result) => {
                const storedReferences = result.gptReferences || [];
                if (index >= 0 && index < storedReferences.length) {
                    storedReferences[index].content = updatedContent;
                    chrome.storage.local.set({ 'gptReferences': storedReferences }, () => {
                        console.log('Content saved to chrome local storage:', updatedContent);
                        refreshReferenceContainer();
                    });
                }
            });
        }
    });

    // Load the saved content from chrome local storage when popup is initialized
    chrome.storage.local.get(['gptReferences'], (result) => {
        const storedReferences = result.gptReferences || [];
        if (index >= 0 && index < storedReferences.length) {
            contentContainer.textContent = storedReferences[index].content;
            refreshReferenceContainer();
        }
    });

    contentFrame.appendChild(contentContainer);
    contentFrame.appendChild(editBtn);


    Container.appendChild(controlBar);
    Container.appendChild(contentFrame);

    // 将关闭按钮和内容添加到弹出窗口
    popup.appendChild(popupHeader);
    popup.appendChild(Container);

    // 将遮罩层和弹出窗口添加到页面中
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}

function refreshReferenceContainer() {
    // 获取 reference container 的 DOM 元素
    const referenceContainer = document.querySelector('.reference-sidebar-content');
    if (!referenceContainer) return; // 确保找到该容器

    // 从 chrome.storage.local 获取最新的参考数据
    chrome.storage.local.get([STORAGE_KEY], (result) => {
        const storedReferences = result[STORAGE_KEY] || [];

        // 清空现有的内容
        referenceContainer.innerHTML = '';

        // 重新生成并添加新的引用内容
        storedReferences.forEach((ref, index) => {
            referenceContainer.appendChild(createReferenceContainer(ref.content, ref.title, index));
        });
    });
}


// Create a reference container
function createReferenceContainer(content, titleText, index = null) {
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
    checkbox.setAttribute('data-index', index); // Set data-index here

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
    </svg>`;
  
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'gpt-reference-delete-btn';
    deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10 11V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M14 11V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M4 7H20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6 7H12H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;

    const cleanContent = content.replace(/^type:\s*text\s*content:\s*>-\s*ChatGPT\s*said:\s*ChatGPT Create\s*a\s*reference\s*to\s*this\s*/im, '').trim();

    const newRefText = document.createElement('span');
    newRefText.className = 'gpt-reference-text';
    newRefText.textContent = cleanContent.slice(0, 35) + (cleanContent.length > 35 ? '...' : '');;
    
    const hiddenRefText = document.createElement('span');
    hiddenRefText.className = 'gpt-reference-text2';
    hiddenRefText.textContent = cleanContent;
    hiddenRefText.style.display = "none";

    const referenceDetailBtn = document.createElement('button');
    referenceDetailBtn.name = 'reference-detail-btn'
    referenceDetailBtn.className = 'reference-detail-btn';
    referenceDetailBtn.innerHTML = 'More Detail';

    headerLeft.append(checkbox, title);
    headerRight.append(editTitleBtn, deleteBtn);
    header.append(headerLeft, headerRight);
    container.append(header, newRefText, hiddenRefText, referenceDetailBtn);

    if (index !== null) {
        checkbox.addEventListener('change', () => insertReferenceToInputWhenCheckboxChecked(index));
        deleteBtn.addEventListener('click', () => removeReference(index));
        editTitleBtn.addEventListener('click', () => editReferenceTitle(title, index));
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
                updateReferenceSidebar(storedReferences, index);
            });
        }
    });
}

function editReferenceTitle(title, index) {
    // Make the title editable
    title.contentEditable = 'true';
    title.style.backgroundColor = 'hsla(0, 0%, 94%, .9)';
    title.focus();  // Focus on the title for editing

    // Save the changes when the user clicks outside (blur event)
    function saveChanges() {
        let updatedTitle = title.innerText.trim();

        // Limit the title length to 15 characters
        if (updatedTitle.length > 15) {
            updatedTitle = updatedTitle.slice(0, 15);  // Truncate excess characters
        }
        
        title.innerText = updatedTitle;  // Update displayed title
        title.contentEditable = 'false';  // Disable edit mode after saving
        title.style.backgroundColor = 'transparent';
        
        // Update in chrome.storage
        chrome.storage.local.get([STORAGE_KEY], (result) => {
            const storedReferences = result[STORAGE_KEY] || [];
            storedReferences[index].title = updatedTitle;  // Update the title field
            chrome.storage.local.set({ [STORAGE_KEY]: storedReferences }, () => {
                console.log('Title updated successfully.');
            });
        });

        title.removeEventListener('blur', onBlur);  // Remove blur event listener after saving
        title.removeEventListener('keypress', onKeyPress);
    };
    function onBlur() {
        saveChanges();
    }

    function onKeyPress(event) {
        if (event.key === 'Enter') {
            event.preventDefault();  // Prevent new line
            saveChanges();  // Save changes
        }
    }

    // Add event listeners
    title.addEventListener('blur', onBlur);
    title.addEventListener('keypress', onKeyPress);

}

// Detect navigating back/forward in history
window.addEventListener('popstate', (event) => {
    console.log('Navigated back or forward in history');
    resetReferenceCheckboxes();
  });