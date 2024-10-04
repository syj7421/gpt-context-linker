document.body.addEventListener('click', handleClickEvent);
document.body.addEventListener('keydown', handleKeydownEvent);

const STORAGE_KEY = 'gptReferences';
//Load the stored reference content and update the floating box UI during initialization
function initializeSidebar() {
    console.log("Initializing sidebar...");
    loadStoredReferences();  // 调用加载引用内容的函数
}

window.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, initializing handlers...");
  
    // 确保 `div[role="presentation"]` 存在后再进行后续操作
    waitForMessageList('div[role="presentation"]')
      .then(() => {
        console.log("Message list detected, attaching observers...");
        initializeSidebar();
        handleMessages();
      })
      .catch((err) => console.error("Error in detecting message list:", err));
  });

function loadStoredReferences() {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
        const storedReferences = result[STORAGE_KEY] || [];
        updateReferenceSidebar(storedReferences);
    });
}


function handleClickEvent(event) {
    if (event.target.closest('nav')) {
        waitForMessageList(handleMessages); // Attach MutationObserver after message list loads
    }

    else if (event.target.closest('.add-to-reference-sidebar-button')) {
        const gptResponse = event.target.closest('article[data-testid^="conversation-turn-"]');
        const msgElements = gptResponse.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img, code, li');
        const newRef = createNewReference(msgElements);
        chrome.storage.local.get([STORAGE_KEY], (result) => {
            const storedReferences = result[STORAGE_KEY] || [];

            // 检查引用数量限制
            if (storedReferences.length >= 10) {
                alert('You can store up to 10 references!');
                return;
            }

            // 检查是否重复引用
            const newRefText = newRef.querySelector('.gpt-reference-text').innerText.trim();
            const isDuplicate = storedReferences.some(ref => ref.content === newRefText);

            if (!isDuplicate) {
                // 添加新引用到存储中
                storedReferences.push({ content: newRefText, checked: false });
                chrome.storage.local.set({ [STORAGE_KEY]: storedReferences }, () => {
                    console.log('New reference added to storage:', newRefText);
                    updateReferenceSidebar(storedReferences);  // 添加引用后更新悬浮框
                });
            } else {
                alert('This reference already exists!');
            }
        });
    }

    else if (event.target.closest('.delete-reference-btn')) {
        // 处理删除按钮事件
        const referenceIndex = parseInt(event.target.dataset.index, 10);
        chrome.storage.local.get([STORAGE_KEY], (result) => {
            let storedReferences = result[STORAGE_KEY] || [];
            storedReferences.splice(referenceIndex, 1); // 删除指定引用
            chrome.storage.local.set({ [STORAGE_KEY]: storedReferences }, () => {
                console.log('Reference deleted from storage.');
                updateReferenceSidebar(storedReferences);
            });
        });
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
    else{
        console.log('input text prompt found');
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
    checkbox.addEventListener('change', function () {
        addReferenceWhenCheckboxChecked(index); // Pass the index of the clicked checkbox
    });
});

function handleKeydownEvent(event) {
    // Check if the key pressed is 'Enter'
    if (event.key === 'Enter') {
        console.log("Submit button clicked by pressing Enter");

        // Get all checkboxes and uncheck them
        chrome.storage.local.get([STORAGE_KEY], (result) => {
            const storedReferences = result[STORAGE_KEY] || [];
            storedReferences.forEach(ref => ref.checked = false);
            chrome.storage.local.set({ [STORAGE_KEY]: storedReferences }, () => {
                console.log('Cleared all checkbox states in storage');
                updateReferenceSidebar(storedReferences);
            });
        });
    }
}

const customTooltip = document.createElement('div');
customTooltip.className = 'custom-tooltip';
customTooltip.style.display = 'none';  // 初始状态不显示
customTooltip.style.position = 'fixed';
customTooltip.style.backgroundColor = 'black';
customTooltip.style.color = 'white';
customTooltip.style.padding = '10px';
customTooltip.style.borderRadius = '5px';
customTooltip.style.maxWidth = '300px';
customTooltip.style.zIndex = '2000';
document.body.appendChild(customTooltip); 

function updateReferenceSidebar(references = []) {
    const sidebarContent = document.querySelector('.reference-sidebar-content');
    if (!sidebarContent) return;

    // 清空当前内容
    sidebarContent.innerHTML = '';

    // 遍历引用数组，并添加到悬浮框中
    references.forEach((ref, index) => {
        const refDiv = document.createElement('div');
        refDiv.className = 'reference-item';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'reference-header';

        // 创建一个 checkbox 元素，并根据 `ref.checked` 设置其状态
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'gpt-reference-checkbox';
        checkbox.className = 'gpt-reference-checkbox';
        checkbox.checked = ref.checked;  // 根据引用状态设置初始值
        checkbox.dataset.index = index;  // 保存索引值

        const titleSpan = document.createElement('span');
        titleSpan.className = 'reference-title';
        titleSpan.innerText = ref.title ? ref.title.slice(0, 15) : `Reference ${index + 1}`;  // 显示标题（如果没有标题则用 Reference 代替） 

        // 创建一个 span 元素来显示引用的内容
        const contentSpan = document.createElement('span');
        contentSpan.className = 'gpt-reference-text';
        contentSpan.innerText = ref.content.length > 50 ? ref.content.substring(0, 50) + '...' : ref.content;

        contentSpan.addEventListener('mouseover', (event) => {
            customTooltip.style.display = 'block';
            customTooltip.innerText = ref.content;  // 显示完整内容
            customTooltip.style.left = `${event.clientX - 310}px`;   // 设置悬浮框相对鼠标的左侧偏移
            customTooltip.style.top = `${event.clientY + 10}px`;   // 设置悬浮框相对鼠标的顶部偏移
        });
        
        contentSpan.addEventListener('mousemove', (event) => {
            customTooltip.style.left = `${event.clientX + 10}px`;  // 跟随鼠标移动
            customTooltip.style.top = `${event.clientY + 10}px`;
        });
        
        contentSpan.addEventListener('mouseout', () => {
            customTooltip.style.display = 'none';  // 鼠标移出时隐藏悬浮框
        });

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'reference-buttons';

        // 创建编辑按钮
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'editBtn';
        editButton.addEventListener('click', () => {
            const isEditable = titleSpan.contentEditable === 'true';
            titleSpan.contentEditable = !isEditable;  // 切换编辑模式
            editButton.textContent = isEditable ? 'Edit' : 'Save';

            if (isEditable) {
                // 保存编辑后的标题，并限制长度为 15 个字母
                let updatedTitle = titleSpan.innerText.trim();
                if (updatedTitle.length > 15) {
                    updatedTitle = updatedTitle.slice(0, 15);  // 截断多余的部分
                }
                titleSpan.innerText = updatedTitle;  // 更新显示的标题

                // 更新到 chrome.storage 中
                chrome.storage.local.get([STORAGE_KEY], (result) => {
                    const storedReferences = result[STORAGE_KEY] || [];
                    storedReferences[index].title = updatedTitle;  // 更新标题字段
                    chrome.storage.local.set({ [STORAGE_KEY]: storedReferences }, () => {
                        console.log('Title updated successfully.');
                    });
                });
            }
        });

        // 创建删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'deleteBtn';
        deleteBtn.innerText = 'Delete';
        deleteBtn.dataset.index = index;
        deleteBtn.addEventListener('click', () => {
            // 从 chrome.storage.local 中删除该引用
            chrome.storage.local.get([STORAGE_KEY], (result) => {
                let storedReferences = result[STORAGE_KEY] || [];
                storedReferences.splice(index, 1); // 删除指定索引的引用
                chrome.storage.local.set({ [STORAGE_KEY]: storedReferences }, () => {
                    console.log(`Reference ${index + 1} deleted.`);
                    updateReferenceSidebar(storedReferences); // 更新侧边栏
                });
            });
        });

        // 添加 checkbox、内容、编辑按钮和删除按钮到引用项中
        headerDiv.appendChild(checkbox);
        headerDiv.appendChild(titleSpan);
        buttonContainer.appendChild(deleteBtn);
        buttonContainer.appendChild(editButton);
        refDiv.appendChild(headerDiv);
        refDiv.appendChild(buttonContainer);
        refDiv.appendChild(contentSpan);

        // 添加引用项到侧边栏
        sidebarContent.appendChild(refDiv);

        // 绑定 checkbox 的变化事件
        checkbox.addEventListener('change', function () {
            addReferenceWhenCheckboxChecked(index);  // 传递引用的索引
        });
    });
}

window.updateReferenceSidebar = updateReferenceSidebar;

//111