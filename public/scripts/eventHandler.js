document.body.addEventListener('click', handleClickEvent);

function handleClickEvent(event) {

    if (event.target.closest('nav, [data-testid="create-new-chat-button"]')) {
      waitForMessageList(handleMessages); // Attach MutationObserver after message list loads
    }
    else if (event.target.closest('button[data-testid="send-button"]')) {
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

