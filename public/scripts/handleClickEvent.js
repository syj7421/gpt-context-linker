document.body.addEventListener('click', handleClickEvent);

function handleClickEvent(event) {
    if (event.target.matches('button.add-to-reference-sidebar-button')) {
      const gptResponse = event.target.closest('article[data-testid^="conversation-turn-"]');
      const msgElements = gptResponse.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img, code, li');
      const widgetItem = createNewReference(msgElements);
      const widget = document.querySelector('.reference-sidebar-content');

      // Check if the content is already present in the sidebar
      if (widget && !widget.innerText.includes(widgetItem.innerText)) {
        widget.appendChild(widgetItem);
      } else if (!widget) {
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

        // Avoid duplicating the reference text
        if (!promptTextarea.textContent.includes('GPT messages Reference:')) {
            const output = `GPT messages Reference: ${ref.trim()} Query: ${promptTextarea.textContent.trim()}`;
            promptTextarea.textContent = output;
        }
        console.log("submit button clicked");
    }
}

function createNewReference(msgElements) {
  const newRef = document.createElement('span');
  newRef.textContent = "";  // Use textContent for plain text to avoid potential XSS vulnerabilities
  msgElements.forEach(e => {
    newRef.textContent += e.textContent;
  });
  return newRef;
}