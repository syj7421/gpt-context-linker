function addButton() {
    const messages = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
    const gptMessages = Array.from(messages).filter(msg => msg.querySelector('div[data-message-author-role="assistant"]') !== null);
    if (gptMessages.length > 0) {
        gptMessages.forEach((msg, idx) => {
        const assistantDiv = msg.querySelector('div[data-message-author-role="assistant"]');
        if (!msg.querySelector('button.gpt-context-linker-button-class')) {
            const btn = document.createElement('button');
            btn.textContent = 'Add to reference';
            btn.value = String(idx);
            btn.name = 'gpt-message-button';
            btn.className = 'gpt-context-linker-button-class';
            assistantDiv.insertAdjacentElement("afterbegin", btn);
            console.log("Button added to GPT message");
        }
        });
    }
}
  