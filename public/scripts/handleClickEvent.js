function handleClickEvent(event) {
    console.log('Click event detected', event.target);
    
    if (event.target.matches('button.gpt-context-linker-button-class')) {
      const gptResponse = event.target.closest('article[data-testid^="conversation-turn-"]');
      const msgElements = gptResponse.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img, code, li');
      const widgetItem = createWidgetItem(msgElements);
      const widget = document.querySelector('.widget');

      if (widget) {
        widget.appendChild(widgetItem);
      } else {
        console.error('Widget not found!');
      }
  
    } else if (event.target.closest('button[data-testid="send-button"]')) {
        const promptTextarea = document.getElementById('prompt-textarea');
        let ref = "";
        
        document.querySelectorAll('.gpt-reference-container').forEach((e) => {
            const radio = e.querySelector('[name="gpt-reference-radio"]');
            if (radio && radio.checked){
                ref += radio.nextElementSibling.textContent;
            }
        });
    
        // const output = `Reference Section: ${ref.trim()} Query Section: ${promptTextarea.textContent.trim()}`;
        output = `GPT messages Reference: Query: ${promptTextarea.textContent}`
        console.log("submit button clicked");
        promptTextarea.textContent = output;
    }
  }
  
  function createWidgetItem(msgElements) {
    const widgetItem = document.createElement('div');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'gpt-reference-radio';

    const referenceContainer = document.createElement('div');
    referenceContainer.className = 'gpt-reference-container';
    referenceContainer.appendChild(radio);
  
    const messageCloneContainer = document.createElement('div');
    messageCloneContainer.className = ""
    msgElements.forEach(element => {
      messageCloneContainer.appendChild(element.cloneNode(true));
    });
    referenceContainer.appendChild(messageCloneContainer);
    widgetItem.appendChild(referenceContainer);
  
    return widgetItem;
  }
  