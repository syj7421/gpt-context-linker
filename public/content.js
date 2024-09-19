console.log("content.js activated");

const observer = new MutationObserver((mutations) => {
  const gptMsg = document.querySelectorAll('[data-message-author-role="assistant"]');
  console.log(gptMsg.length);
  
  if (gptMsg.length > 0){ // mistake: gptMsg will always be true becasue querySelectorAll returns a node list, which is truthy
    console.log("at least 1 gptMsg found");
    gptMsg.forEach((e) => {
      // Check if the radio input already exists to avoid re-adding
      if (!e.querySelector('input[type="radio"]')) {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'gpt-message-radio-name';
        e.insertAdjacentElement("afterbegin", radio); // mistake: ..Element to insert a html element, ...HTML to insert a string
      }
    })
  }
});

observer.observe(document.body, { childList: true, subtree: true });
