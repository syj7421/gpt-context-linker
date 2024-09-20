console.log("content.js activated");

// MutationObserver to detect when new GPT messages are added
const observer = new MutationObserver((mutations) => {
  const gptMsg = document.querySelectorAll('[data-message-author-role="assistant"]');

  if (gptMsg.length > 0) {
    gptMsg.forEach((e, idx) => {

      if (!e.querySelector('input[type="radio"].gpt-context-linker-radio-class')) {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.value = idx + 1;
        radio.name = 'gpt-message-radio-name';
        radio.className = 'gpt-context-linker-radio-class';
        e.insertAdjacentElement("afterbegin", radio);
      }
      else{
        console.log("No gpt response yet");
      }
    });
  }
});

// const presentationElement = document.querySelector('[role="presentation"]');
observer.observe(document.body, { childList: true, subtree: true });

// Use event delegation to listen for clicks on radio buttons
document.body.addEventListener('click', (event) => {
  // Check if the clicked element is a radio button
  if (event.target.matches('input[type="radio"]')) {
    console.log(`Radio button with value ${event.target.value} clicked`);
    const correspondingGptMsg = event.target.nextElementSibling;
    console.log(correspondingGptMsg.nodeName);
  }
});
























// const submitBtn = document.querySelector('[data-testid="send-button"]');

// submitBtn.addEventListener('click', () => {
//   console.log("checking");
//   const radios = document.querySelectorAll('input[type="radio"]');
//   radios.forEach((radio) => {
//     if (radio.checked) {
//       console.log(`radio number: ${radio.value} is checked`);
//     }
//   });
// });

