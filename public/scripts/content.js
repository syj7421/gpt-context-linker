console.log("script loaded333");

/* 
THINGS I HAVE LEARNED:
1. use mutation observer for dynamic elements, use event listner for static elements, 
   check whether it is dynamic or static by disabling JS
2. use event delegation for dynamic elements
3. event listeners may not work the way you expect because you are clicking at the inner element 
   e.g. there is <li><a>blah </a></li> ,you thought you are clicking at li but you are actually clicking at a
   use cloest method to deal with this
4. check whether or not the tag flashes when interacted, flashing means it is replaced, hence any mutation
   observer or listener will be gone!
5. Use data-* attributes (like data-testid, data-message-id, etc.):
Websites often use data-* attributes for testing or tracking purposes, which are less likely to change compared to classes or IDs. If these attributes are present (as in your case with data-testid), prioritize them over classes or IDs.
Benefit: These attributes are typically more stable than CSS classes or IDs.
*/

/* TODO: 
1. atm, event listners only pick up click event, not enter key pressed event
2. change checkbox to button, when button is clicked added to the widget, when clicked again, compare whehter the equal
   thing already exists, if yes, throw an error

*/

// MutationObserver to detect when new GPT messages are added
const messageObserver = new MutationObserver((mutations) => {
  addButton();
});
messageObserver.observe(document.body, { childList: true, subtree: true });

document.body.addEventListener('click', (event) => {
  handleClickEvent(event);
});













