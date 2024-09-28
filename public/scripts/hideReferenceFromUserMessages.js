function hideReferenceFromUserMessages() {
    const messages = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
    messages.forEach((msg) => {
      const userMessageDiv = msg.querySelector('div[data-message-author-role="user"] div.whitespace-pre-wrap');
      if (userMessageDiv) {
        const cleanedText = userMessageDiv.textContent.replace(/GPT messages Reference:\s*(.*?)\s*Query:\s*/, '');
        userMessageDiv.textContent = cleanedText;
      }
    });
  }