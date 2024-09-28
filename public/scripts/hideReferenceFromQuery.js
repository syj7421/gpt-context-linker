function hideReferenceFromQuery() {
    const messages = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
    
    messages.forEach((msg) => {
        // Target the specific div containing the user message text
        const userMessageDiv = msg.querySelector('div[data-message-author-role="user"] div.whitespace-pre-wrap');
        if (userMessageDiv) {
            // Get the current text
            const textContent = userMessageDiv.textContent;

            // Apply regex to clean the "Ref: ... Query:" text
            const cleanedText = textContent.replace(/Reference___\s*(.*?)\s*Query___\s*/, '');

            // Update the div content with the cleaned text
            userMessageDiv.textContent = cleanedText;
        }
    });
}
