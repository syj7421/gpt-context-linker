function createWidget() {
  const floatingBox = document.createElement('div');
  floatingBox.id = 'floatingBox';
  floatingBox.className = 'floatingBox';
  floatingBox.innerHTML = '<h2>Context Linker</h2><ul id="referenceList"></ul>';

  // 将悬浮框添加到网页的 body 中
  document.body.appendChild(floatingBox);
}

// 添加 reference 到悬浮框和 chrome.storage
function addReferenceToWidget(newReference) {
  chrome.storage.local.get(['references'], (result) => {
    const references = result.references || [];
    if (references.length < 3) {
      references.push({ content: newReference, customName: null });
      chrome.storage.local.set({ references }, () => {
        loadReferences(); // 调用 content.js 中的函数，更新悬浮框显示
      });
    } else {
      alert('You can only add up to 3 references.');
    }
  });
}


// Add content to the widget
function addToWidget(content) {
  const widgetContent = document.querySelector('.widget-content');
  const newItem = document.createElement('p');
  newItem.textContent = content;
  widgetContent.appendChild(newItem);
}

// Initialize the widget
window.onload = createWidget;

