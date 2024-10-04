






document.body.addEventListener('click', handleClickEvent);
document.body.addEventListener('keydown', handleKeydownEvent);

const STORAGE_KEY = 'gptReferences';
//Load the stored reference content and update the floating box UI during initialization
function initializeSidebar() {
    console.log("Initializing sidebar...");
    loadStoredReferences();  // 调用加载引用内容的函数
}

window.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, initializing message handlers...");
    // 调用初始化侧边栏
    initializeSidebar();

    // 使用 waitForElement 确保页面元素加载完成
    waitForElement('div[role="presentation"]')
        .then(() => {
            console.log("Message list detected, attaching observers...");
            handleMessages();
        })
        .catch((err) => console.error("Error in detecting message list:", err));
});

function handleClickEvent(event) {
    if (event.target.closest('nav')) {
        waitForElement('div[role="presentation"]').then(() => {
            handleMessages();
        });
    } // Attach MutationObserver after message list loads

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
                updateReferenceSidebar(storedReferences);
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

else if (event.target.closest('[name = "gpt-reference-button"]')) {
    // Get a NodeList of all checkboxes
    const refCheckboxes = document.querySelectorAll('[name="gpt-reference-checkbox"]');
    console.log(refCheckboxes)
    // Convert the NodeList to an Array and find the index of the clicked checkbox
    const nthCheckbox = Array.from(refCheckboxes).indexOf(event.target);

    // Call your function with the index
    addReferenceWhenCheckboxChecked(nthCheckbox);
}
else if (event.target.closest('button[data-testid="send-button"]')) {
    console.log("submit button clicked");
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
function createNewReference(msgElements) {

    // Create the container div
    const referenceDiv = document.createElement('div');
    referenceDiv.className = 'gpt-reference-container';  // Add a class for potential styling

    // Create the checkbox input
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
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
    const refCheckbox = document.querySelectorAll('[name="gpt-reference-button"]');
    const refList = [];
    let referenceCount = 1; // Start counting from 1
    let checkedCount = 0;

    // Collect all checked references
    refCheckbox.forEach((button, index) => {
        if (index === nthCheckbox) {
            const referenceText = button.textContent.replace(/Edit|Delete/g, '').trim(); // 移除 Edit 和 Delete 按钮文字，只获取引用内容
            selectedReferenceText = `Reference ${referenceCount}:\n${referenceText}\n`;  // 构建引用内容格式
            refList.push(selectedReferenceText);  // 将引用内容加入列表
            referenceCount++;
        }
    });

    if (refList.length === 0) {
        console.error('No references selected or found.');
        return;
    }

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
    //const referencesSection = refList.length ? `References:\n${refList.join('\n')}\n` : '';
    const referencesSection = `References:\n${refList.join('\n')}\n`;
    const referencePattern = /References:[\s\S]*Query:/;

    // If a reference section exists, remove it
    if (referencePattern.test(queryText)) {
        queryText = queryText.replace(referencePattern, '').trim();
    }

    // Add the new reference section followed by the preserved query text
    const updatedPrompt = `${referencesSection}\nQuery:\n${queryText}`;

    // Set the updated content back to the prompt textarea, using innerText to preserve formatting
    promptTextarea.innerText = updatedPrompt; // innerText preserves newlines, but textContent does not

    // 存储引用列表到 chrome.storage.local 中
    chrome.storage.local.get(['gptReferences'], (result) => {
        const storedReferences = result.gptReferences || [];

        // 将当前选中的引用更新到存储中
        const updatedReferences = refList.map((content, index) => {
            return { id: index + 1, content: content.trim(), checked: true };
        });

        // 合并并去重
        const newReferences = [...storedReferences, ...updatedReferences].reduce((acc, ref) => {
            if (!acc.some(existing => existing.content === ref.content)) {
                acc.push(ref);
            }
            return acc;
        }, []);

        // 更新到 chrome.storage.local 中
        chrome.storage.local.set({ 'gptReferences': newReferences }, () => {
            console.log('Updated references stored in chrome.storage.local:', newReferences);
            updateReferenceSidebar(newReferences); // 更新右侧悬浮框显示
        });
    });
}


function loadStoredReferences() {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
        const storedReferences = result[STORAGE_KEY] || [];
        updateReferenceSidebar(storedReferences);
    });
}

function updateReferenceSidebar(storedReferences) {
    const refSidebar = document.querySelector('.reference-sidebar-content');
    if (refSidebar) {
        refSidebar.innerHTML = ''; // 清空现有内容

        storedReferences.forEach((ref, index) => {
            const refContainer = document.createElement('button');
            refContainer.className = 'gpt-reference-container';
            refContainer.name = 'gpt-reference-button'; // 设置 name 属性为 gpt-reference-button
            refContainer.dataset.index = index;

            // 添加引用内容
            const referenceText = document.createElement('span');
            referenceText.className = 'gpt-reference-text';
            refContainer.textContent = `Reference ${index + 1}: ${ref.content}`;
            referenceText.contentEditable = false; // 默认不可编辑

            // 添加编辑按钮
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit-reference-btn';
            editButton.addEventListener('click', () => {
                // 点击时进入编辑模式
                const isEditable = referenceText.contentEditable === 'true';
                referenceText.contentEditable = !isEditable;
                editButton.textContent = isEditable ? 'Edit' : 'Save';
                if (isEditable) {
                    console.log(`Edited Reference ${index + 1}:`, referenceText.textContent);
                }
            });

            // 添加删除按钮
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-reference-btn';
            deleteButton.dataset.index = index; // 绑定引用的索引值

            // 添加引用项到侧边栏中
            refContainer.appendChild(referenceText);
            refContainer.appendChild(editButton);
            refContainer.appendChild(deleteButton);
            refSidebar.appendChild(refContainer);
        });
    } else {
        console.error('Reference sidebar not found!');
    }
}

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