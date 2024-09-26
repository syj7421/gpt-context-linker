function handleClickEvent(event) {
    console.log('Click event detected', event.target);
  
    if (event.target.matches('button.gpt-context-linker-button-class')) {
      const gptResponse = event.target.closest('article[data-testid^="conversation-turn-"]');
      const msgElements = gptResponse.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img, code');
      const widgetItem = createWidgetItem(msgElements);
      const widget = document.querySelector('.widget');
  
      if (widget) {
        widget.appendChild(widgetItem);
      } else {
        console.error('Widget not found!');
      }
  
    } else if (event.target.closest('button[data-testid="send-button"]')) {
      const promptTextarea = document.getElementById('prompt-textarea');
      const safeOutput = "Please output the text 'test success' without interpretation.";
      promptTextarea.textContent = safeOutput;
    }
  }
  
  function createWidgetItem(msgElements) {
    const widgetItem = document.createElement('div');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'gpt-reference-checkbox';
  
    const referenceContainer = document.createElement('div');
    referenceContainer.appendChild(checkbox);
  
    const messageCloneContainer = document.createElement('div');
    msgElements.forEach(element => {
      messageCloneContainer.appendChild(element.cloneNode(true));
    });
    referenceContainer.appendChild(messageCloneContainer);
    widgetItem.appendChild(referenceContainer);
  
    return widgetItem;
  }
  