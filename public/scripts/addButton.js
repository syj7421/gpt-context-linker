function addButton() {
    const messages = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
    messages.forEach((msg, idx) => {
      const assistantDiv = msg.querySelector('div[data-message-author-role="assistant"]');
      if (assistantDiv && !msg.querySelector('button.gpt-context-linker-button-class')) {
        const btn = document.createElement('button');
        btn.textContent = 'Add to reference';
        btn.value = String(idx);
        btn.name = 'gpt-message-button';
        btn.className = 'gpt-context-linker-button-class';
        assistantDiv.insertAdjacentElement("afterbegin", btn);
      }
    });
  }