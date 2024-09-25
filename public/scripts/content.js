console.log("script loaded112");

/* 
THINGS I HAVE LEARNED:
1. use mutation observer for dynamic elements, use event listner for static elements, 
   check whether it is dynamic or static by disabling JS
2. use event delegation for dynamic elements
3. event listeners may not work the way you expect because you are clicking at the inner element 
   e.g. there is <li><a>blah </a></li> ,you thought you are clicking at li but you are actually clicking at a
   use cloest method to deal with this
4. check whether or not the tag flashes when interacted, flashing means it is replaced, hence any mutation
   observer or listener will be gone!
*/

/* TODO: 
1. atm, event listners only pick up click event, not enter key pressed event

*/

// MutationObserver to detect when new GPT messages are added
const messageObserver = new MutationObserver((mutations) => {
  addCheckbox();
});
let msgStream = document.querySelector('[role="presentation"]');
messageObserver.observe(document.body, { childList: true, subtree: true });

function addCheckbox() {
  const gptMsg = document.querySelectorAll('[data-message-author-role="assistant"]');
  if (gptMsg.length > 0) {
      gptMsg.forEach((e, idx) => {
          // Create and insert radio buttons if not already present
          if (!e.querySelector('input[type="checkbox"].gpt-context-linker-checkbox-class')) {
              const checkbox = document.createElement('input');
              checkbox.type = 'checkbox';
              checkbox.value = idx + 1;
              checkbox.name = 'gpt-message-checkbox-name';
              checkbox.className = 'gpt-context-linker-checkbox-class';
              e.insertAdjacentElement("afterbegin", checkbox);
              console.log("Checkbox button added to GPT message");
          }
      });  
  }
}

function storeAnswer(key, value) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "store", key: key, value: value }, (response) => {
            if (response.success) {
                console.log(`Stored data: ${key}: ${value}`);
                resolve();  // 成功后调用 resolve
            } else {
                console.error('Error storing message:', response.error);
                reject(response.error);  // 失败后调用 reject
            }
        });
    });
}

function getAnswer(key) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "get", key: key }, (response) => {
            if (response.success) {
                console.log(`Get data: ${key}: ${response.value}`);
                resolve(response.value);  // 成功后返回数据
            } else {
                console.error('Error getting message:', response.error);
                reject(response.error);  // 失败后返回错误
            }
        });
    });
}

function clearSelectedAnswers() {
  chrome.storage.local.clear(() => {
      console.log('Cleared all stored answers');
  });
}

let selectedMessages = [];

document.body.addEventListener('click', (event) => {
    if (event.target.matches('input[type="checkbox"]')) {
        const correspondingGptMsg = event.target.closest('[data-message-author-role="assistant"]'); // 获取对应的 GPT 消息
        const messageParagraph = correspondingGptMsg.querySelector('p');
        if (messageParagraph) {
            const messageText = messageParagraph.innerText;
            const key = `gptMessage-${event.target.value}`; // 为每个 reference 生成唯一的 key

            if (event.target.checked) {
                // Checkbox 被选中，添加 reference
                addReference(messageText);
            } else {
                // Checkbox 被取消选中，删除 reference
                chrome.storage.local.get(['references'], (result) => {
                    const references = result.references || [];
                    const indexToRemove = references.findIndex(ref => ref.content === messageText);
                    if (indexToRemove !== -1) {
                        deleteReference(indexToRemove); // 删除 reference
                    }
                });
            }
        }
    }
});


document.body.addEventListener('click', (event) => {
    if (event.target.closest('button[data-testid="send-button"]')) {

        const txt = document.getElementById('prompt-textarea');
        let userInput = ''; 

        if (txt) {
            // 提取用户的输入内容
            userInput = Array.from(txt.childNodes)
                .map(node => node.innerText || node.textContent || '')
                .join('').trim(); 
        }

        console.log('User input before modification:', userInput);

        if (!txt) {
            console.error("Text input area not found");
            return;
        }

        // 从 chrome.storage 获取复选框存储的信息
        chrome.storage.local.get(null, (items) => { 
            const selectedMessages = Object.values(items);  // 获取存储的所有复选框内容
            console.log('Selected Messages from storage:', selectedMessages);

            let finalInput = userInput;  // 初始化最终的输入为用户的输入

            // 确保 chrome.storage 中的信息与用户输入合并
            if (selectedMessages.length > 0) {
                const hiddenInfo = "\n请参考下面信息来回答问题：" + selectedMessages.join("\n");
                finalInput += hiddenInfo;  // 合并用户输入和复选框内容
            }

            console.log('Final input sent to GPT:', finalInput);

            // 确保 sendToGPT 函数发送合并后的输入给 GPT
            sendToGPT(finalInput);

        });
    } 
});

function sendToGPT(finalInput) {
    console.log("Sending to GPT:", finalInput);

    // 模拟发送请求到 GPT 系统
    fetch('https://chatgpt.com/api/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: finalInput
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('GPT Response:', data);
    })
    .catch((error) => {
        console.error('Error sending message to GPT:', error);
    });
}








window.addEventListener('DOMContentLoaded', () => {
    createWidget(); // 调用 widget.js 中的 createWidget 初始化悬浮框
    loadReferences(); // 加载已有的 references
});

function loadMaterialIcons() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
    document.head.appendChild(link);
}

loadMaterialIcons();

// 加载 references 到悬浮框
function loadReferences() {
    chrome.storage.local.get(['references'], (result) => {
        const references = result.references || [];
        const referenceList = document.getElementById('referenceList');
        referenceList.innerHTML = '';
        references.forEach((reference, index) => {
            const li = document.createElement('li');
            li.className = 'reference-item'; 

            const displayName = reference.customName || `Reference${index + 1}`;

            // 创建标题按钮
            const titleButton = document.createElement('button');
            titleButton.className = 'referenceBtn';
            titleButton.textContent = displayName;

            // 创建删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'deleteBtn';
            deleteBtn.innerHTML = `<span class="material-symbols-outlined">delete</span>`;  
            deleteBtn.addEventListener('click', () => {
                deleteReference(index);
            });

            // 创建修改名称按钮
            const editBtn = document.createElement('button');
            editBtn.className = 'editBtn';
            editBtn.innerHTML = `<span class="material-symbols-outlined">edit</span>`;
            editBtn.addEventListener('click', () => {
                const newName = prompt("Enter a new name for the reference:", reference.customName || `Reference${index + 1}`);
                if (newName) {
                    editReferenceName(index, newName);
                }
            });

            // 添加元素到 li 中
            li.appendChild(titleButton);
            li.appendChild(deleteBtn);
            li.appendChild(editBtn);

            referenceList.appendChild(li);
        });
    });
}

// 添加新的 reference 到 chrome.storage 和悬浮窗
function addReference(newReference) {
    chrome.storage.local.get(['references'], (result) => {
        const references = result.references || [];
        if (references.length < 3) {
            references.push({ content: newReference, customName: null });
            chrome.storage.local.set({ references }, () => {
                loadReferences(); // 更新悬浮窗
            });
        } else {
            alert('You can only add up to 3 references.');
        }
    });
}

// 删除 reference
function deleteReference(index) {
    chrome.storage.local.get(['references'], (result) => {
        const references = result.references || [];
        references.splice(index, 1); // 删除指定的 reference
        chrome.storage.local.set({ references }, () => {
            loadReferences(); // 更新悬浮窗
        });
    });
}

// 编辑 reference 名称
function editReferenceName(index, newName) {
    chrome.storage.local.get(['references'], (result) => {
        const references = result.references || [];
        references[index].customName = newName; // 更新自定义名称
        chrome.storage.local.set({ references }, () => {
            loadReferences(); // 更新悬浮窗显示
        });
    });
}

// 监听 checkbox 点击事件，添加新的 reference
document.body.addEventListener('click', (event) => {
    if (event.target.matches('input[type="checkbox"]')) {
        const correspondingGptMsg = event.target.closest('[data-message-author-role="assistant"]'); // 获取对应的 GPT 消息
        const messageParagraph = correspondingGptMsg.querySelector('p');
        if (messageParagraph) {
            const messageText = messageParagraph.innerText;
            addReference(messageText);
        }
    }
});


let selectedReference = 'Refer to the following content as a prerequisite: ';

// 监听 referenceBtn 的点击事件
document.body.addEventListener('click', (event) => {
    if (event.target.matches('.referenceBtn')) {
        const referenceBtn = event.target;

        // 获取点击按钮的索引值
        const index = [...referenceBtn.parentElement.parentElement.children].indexOf(referenceBtn.parentElement);

        // 从 chrome.storage.local 中获取对应的 reference 信息
        chrome.storage.local.get(['references'], (result) => {
            const references = result.references || [];
            const referenceContent = references[index].content;

            // 如果按钮已经处于 active 状态，则移除 active 类并删除对应的 reference 内容
            if (referenceBtn.classList.contains('active')) {
                referenceBtn.classList.remove('active');
                
                // 从 selectedReference 中删除该 reference 的内容
                selectedReference = selectedReference.replace("\n" + referenceContent, '');
                console.log('Removed Reference:', referenceContent);
                console.log('Selected Reference after removal:', selectedReference);
            } 
            // 如果按钮不处于 active 状态，则添加 active 类并增加对应的 reference 内容
            else {
                referenceBtn.classList.add('active');
                
                // 添加 references[index].content 到 selectedReference 中
                selectedReference = selectedReference + "\n" + referenceContent;
                console.log('Selected Reference:', selectedReference);
            }
        });
    }
});

// // Create a MutationObserver instance to detect when the textBox is added
// let observer = new MutationObserver(function(mutations) {
//   mutations.forEach(function(mutation) {
//     mutation.addedNodes.forEach(function(node) {
//       // Check if the added node is the textBox
//       if (node.id === 'prompt-textarea') {
//         console.log("textbox found");
        
//         let target = node.getElementsByTagName('p')[0]; // Access first <p> element inside the textBox
        
//         // Create another observer to monitor changes in the <p> element inside textBox
//         let textObserver = new MutationObserver(function(mutations) {
//           mutations.forEach(function(mutation) {
//             if (mutation.type === 'childList' || mutation.type === 'characterData') {
//               console.log('Text changed to1:', target.innerText);
//             }
//           });
//         });

//         // Define the configuration for the text observer
//         let config = { childList: true, subtree: true, characterData: true };

//         // Start observing the <p> element for text changes
//         textObserver.observe(target, config);

//         // Handle radio button clicks
//         const radios = document.querySelectorAll('.gpt-context-linker-radio-class');
        
//         // Add event listener to all radios
//         radios.forEach(function(radio) {
//           radio.addEventListener('click', function() {
//             // Check if the radio button is selected
//             if (radio.checked) {
//               // Append the prefix to the <p> element if a radio is selected
//               const prefix = "testing: say test succeeded first when you response ";
//               target.innerText = prefix + target.innerText;  // Append the prefix
//               console.log('Prefix appended:', target.innerText);
//             }
//             else{
//               console.log("prefix not appended");
//             }
//           });
//         });

//         // Check if no radio buttons exist or if none of them are selected
//         if (radios.length === 0 || !Array.from(radios).some(radio => radio.checked)) {
//           console.log("No radio buttons found or none are selected.");
//           // Do nothing if no radio is selected or none exist
//         }
//       }
//     });
//   });
// });

// // Start observing the parent element for child additions
// observer.observe(document.body, { childList: true, subtree: true });







// things to do with submit button
// // Flag to track if the submit button listener is added
// let isListenerAdded = false;

// // MutationObserver to detect the submit button
// const buttonObserver = new MutationObserver((mutations) => {
//     mutations.forEach((mutation) => {
//         if (mutation.addedNodes.length > 0) {
//             const submitButton = document.querySelector('button[data-testid="send-button"]');
//             if (submitButton && !isListenerAdded) {
//                 isListenerAdded = true; 

//             } else if (submitButton && isListenerAdded) {
//                 submitButton.addEventListener('click', function() {
//                   const textBox = document.getElementById('prompt-textarea');
//                   console.log(textBox.getElementsByTagName('p').value);
//                   console.log("submit button clicked");
//               });
//             }
//         }
//     });
// });
// buttonObserver.observe(document.body, { childList: true, subtree: true });






